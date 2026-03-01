import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import puppeteer from "npm:puppeteer@23.4.0";

Deno.serve(async (req) => {
  let browser = null;
  
  try {
    console.log('[STEP 1] Starting PDF generation process');
    
    // Validate request method
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Parse and validate request body
    let requestData = {};
    try {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const text = await req.text();
        if (text) {
          requestData = JSON.parse(text);
        }
      }
    } catch (parseError) {
      console.error('[ERROR] Invalid JSON in request body:', parseError.message);
      return Response.json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message 
      }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    console.log('[STEP 2] Checking authentication');
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      console.error('[ERROR] Unauthorized access attempt');
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    console.log('[STEP 3] User authorized:', user.email);

    const pages = [
      { name: "Home", path: "/" },
      { name: "Services-Overview", path: "/ServicesOverview" },
      { name: "Stormwater-Planning-SWPPP", path: "/Services" },
      { name: "Inspections-Testing", path: "/InspectionsTesting" },
      { name: "Special-Inspections", path: "/SpecialInspections" },
      { name: "Engineering-Consulting", path: "/StructuralEngineering" },
      { name: "Construction-Services", path: "/Construction" },
      { name: "About-Us", path: "/About" },
      { name: "Previous-Work", path: "/PreviousWork" },
      { name: "Project-Gallery", path: "/ProjectGallery" },
      { name: "Blog", path: "/Blog" },
      { name: "Contact", path: "/Contact" },
      { name: "SWPPP-Checker", path: "/SWPPPChecker" }
    ];

    console.log(`[STEP 4] Launching Puppeteer browser (${pages.length} pages to process)`);
    
    // Ensure /tmp directory exists and is writable
    try {
      await Deno.mkdir('/tmp/puppeteer_data', { recursive: true });
    } catch (e) {
      console.log('  → /tmp/puppeteer_data directory setup:', e.message);
    }

    // Check for PUPPETEER_EXECUTABLE_PATH environment variable
    const executablePath = Deno.env.get('PUPPETEER_EXECUTABLE_PATH');
    if (executablePath) {
      console.log(`  → Using custom Chrome path: ${executablePath}`);
    }
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        executablePath: executablePath || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions'
        ],
        userDataDir: '/tmp/puppeteer_data',
        timeout: 120000
      });
    } catch (launchError) {
      if (launchError.message?.includes('Could not find Chrome') || 
          launchError.message?.includes('Could not find Chromium')) {
        throw new Error(
          'Chrome/Chromium browser not installed. Please install Chrome in the deployment environment: ' +
          'npx puppeteer browsers install chrome, or set PUPPETEER_EXECUTABLE_PATH environment variable.'
        );
      }
      throw launchError;
    }

    console.log('[STEP 5] Browser launched successfully');
    const pdfFiles = [];
    const errors = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      let browserPage = null;
      
      try {
        console.log(`[PROGRESS ${i + 1}/${pages.length}] Processing: ${page.name}`);
        
        browserPage = await browser.newPage();
        
        await browserPage.setViewport({ 
          width: 1920, 
          height: 1080 
        });
        
        const pageUrl = `https://pacificengineeringsf.com${page.path}`;
        console.log(`  → Navigating to: ${pageUrl}`);
        
        await browserPage.goto(pageUrl, { 
          waitUntil: 'networkidle2',
          timeout: 90000 
        });

        console.log(`  → Waiting for content to stabilize...`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`  → Generating PDF...`);
        const pdfBuffer = await browserPage.pdf({
          format: 'Letter',
          printBackground: true,
          preferCSSPageSize: false,
          margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          }
        });

        const sizeKB = (pdfBuffer.length / 1024).toFixed(2);
        console.log(`  → PDF generated: ${sizeKB} KB`);

        const fileName = `${page.name}.pdf`;
        const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        console.log(`  → Uploading to storage...`);
        const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
        
        console.log(`  ✓ Success! URL: ${uploadResult.file_url}`);
        pdfFiles.push({
          name: fileName,
          url: uploadResult.file_url,
          size: sizeKB + ' KB'
        });

        if (browserPage) {
          await browserPage.close();
        }
        
      } catch (pageError) {
        console.error(`  ✗ Error on ${page.name}:`, pageError.message);
        errors.push({
          page: page.name,
          error: pageError.message
        });
        
        if (browserPage) {
          try {
            await browserPage.close();
          } catch (e) {
            console.error('  → Error closing page:', e.message);
          }
        }
      }
    }

    if (browser) {
      console.log('[STEP 6] Closing browser');
      await browser.close();
      browser = null;
    }

    if (pdfFiles.length === 0) {
      return Response.json({ 
        success: false,
        error: 'Failed to generate any PDFs',
        details: errors,
        totalPages: pages.length,
        failedPages: errors.length
      }, { status: 422 });
    }

    console.log(`[STEP 7] Successfully generated ${pdfFiles.length}/${pages.length} PDFs`);

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Pacific Engineering Website PDFs</h2>
        <p>Successfully generated <strong>${pdfFiles.length} PDFs</strong> from ${pages.length} pages:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Page</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Size</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Download</th>
            </tr>
          </thead>
          <tbody>
            ${pdfFiles.map(f => `
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${f.name}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">${f.size}</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb;">
                  <a href="${f.url}" target="_blank" style="color: #2563eb; text-decoration: none;">Download PDF</a>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${errors.length > 0 ? `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 20px 0;">
            <strong>Note:</strong> ${errors.length} page(s) failed to generate:
            <ul>
              ${errors.map(e => `<li>${e.page}: ${e.error}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <p style="color: #6b7280; margin-top: 30px;">
          <em>Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}</em>
        </p>
      </div>
    `;

    console.log('[STEP 8] Sending email');
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'dylanllouis@gmail.com',
      from_name: 'Pacific Engineering',
      subject: `✓ Website PDFs Ready (${pdfFiles.length}/${pages.length} files)`,
      body: emailBody
    });

    console.log('[COMPLETE] Email sent successfully');

    return Response.json({ 
      success: true,
      message: `Generated ${pdfFiles.length}/${pages.length} PDFs and emailed to dylanllouis@gmail.com`,
      files: pdfFiles,
      totalPages: pages.length,
      successfulPages: pdfFiles.length,
      failedPages: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('[FATAL ERROR] PDF Generation failed:', error.message);
    console.error('[STACK TRACE]', error.stack);
    
    if (browser) {
      try {
        console.log('[CLEANUP] Closing browser after error');
        await browser.close();
      } catch (closeError) {
        console.error('[CLEANUP ERROR]', closeError.message);
      }
    }

    // Determine appropriate status code based on error type
    let statusCode = 500;
    let errorMessage = error.message || 'Internal server error during PDF generation';
    
    if (error.message?.includes('timeout') || error.message?.includes('navigation')) {
      statusCode = 504;
      errorMessage = 'Gateway timeout: Page took too long to load';
    } else if (error.message?.includes('Invalid') || error.message?.includes('validation')) {
      statusCode = 422;
      errorMessage = 'Invalid input or data for PDF generation';
    } else if (error.message?.includes('Chrome') || error.message?.includes('Chromium') || error.message?.includes('browser not installed')) {
      statusCode = 503;
      errorMessage = 'Service temporarily unavailable: Chrome browser not configured';
    }
    
    return Response.json({ 
      success: false,
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  }
});