import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    console.log('[MONITOR] Starting website change detection');
    const base44 = createClientFromRequest(req);
    
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

    const changedPages = [];
    const errors = [];

    for (const page of pages) {
      try {
        console.log(`[CHECKING] ${page.name}`);
        
        const pageUrl = `https://pacificengineeringsf.com${page.path}`;
        const response = await fetch(pageUrl);
        const content = await response.text();
        
        // Generate content hash
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Check if monitoring record exists
        const monitors = await base44.asServiceRole.entities.WebsiteMonitor.filter({
          page_path: page.path
        });

        const now = new Date().toISOString();

        if (monitors.length === 0) {
          // First time monitoring this page
          console.log(`  → Creating initial monitor record`);
          await base44.asServiceRole.entities.WebsiteMonitor.create({
            page_name: page.name,
            page_path: page.path,
            last_content_hash: contentHash,
            last_checked: now,
            last_changed: now,
            check_count: 1,
            change_count: 0,
            monitoring_active: true
          });
        } else {
          const monitor = monitors[0];
          const hasChanged = monitor.last_content_hash !== contentHash;

          if (hasChanged) {
            console.log(`  ✓ CHANGE DETECTED on ${page.name}`);
            changedPages.push({
              name: page.name,
              path: page.path,
              previousHash: monitor.last_content_hash.substring(0, 8),
              newHash: contentHash.substring(0, 8)
            });

            await base44.asServiceRole.entities.WebsiteMonitor.update(monitor.id, {
              last_content_hash: contentHash,
              last_checked: now,
              last_changed: now,
              check_count: (monitor.check_count || 0) + 1,
              change_count: (monitor.change_count || 0) + 1
            });
          } else {
            console.log(`  → No changes`);
            await base44.asServiceRole.entities.WebsiteMonitor.update(monitor.id, {
              last_checked: now,
              check_count: (monitor.check_count || 0) + 1
            });
          }
        }
      } catch (error) {
        console.error(`  ✗ Error checking ${page.name}:`, error.message);
        errors.push({ page: page.name, error: error.message });
      }
    }

    console.log(`[SUMMARY] Checked ${pages.length} pages, ${changedPages.length} changes detected`);

    // If changes detected, trigger PDF regeneration
    if (changedPages.length > 0) {
      console.log('[ACTION] Triggering automatic PDF regeneration');
      
      try {
        const pdfResult = await base44.asServiceRole.functions.invoke('generateAndEmailPDFs', {});
        console.log('[SUCCESS] PDFs regenerated and emailed');

        // Send change notification
        const changesList = changedPages.map(p => `<li><strong>${p.name}</strong> (${p.path})</li>`).join('');
        
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'dylanllouis@gmail.com',
          from_name: 'Pacific Engineering Monitor',
          subject: `🔔 Website Changes Detected - PDFs Updated`,
          body: `
            <h2>Website Changes Detected</h2>
            <p>The AI monitoring system detected ${changedPages.length} page(s) with updates:</p>
            <ul>${changesList}</ul>
            <p><strong>Action Taken:</strong> New PDFs have been automatically generated and emailed to you.</p>
            <p><em>Detected at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}</em></p>
          `
        });

        return Response.json({
          success: true,
          changesDetected: true,
          changedPages,
          pdfRegenerated: true,
          message: `Detected ${changedPages.length} changes, regenerated PDFs, and sent notifications`
        });

      } catch (pdfError) {
        console.error('[ERROR] PDF regeneration failed:', pdfError.message);
        
        // Notify admin of failure
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'dylanllouis@gmail.com',
          from_name: 'Pacific Engineering Monitor',
          subject: `⚠️ ALERT: PDF Regeneration Failed`,
          body: `
            <h2 style="color: #ef4444;">PDF Regeneration Failed</h2>
            <p>Website changes were detected, but automatic PDF regeneration failed:</p>
            <p><strong>Error:</strong> ${pdfError.message}</p>
            <p><strong>Changed Pages:</strong></p>
            <ul>${changedPages.map(p => `<li>${p.name}</li>`).join('')}</ul>
            <p>Please manually regenerate PDFs from the admin portal.</p>
            <p><em>Failed at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}</em></p>
          `
        });

        return Response.json({
          success: false,
          changesDetected: true,
          changedPages,
          pdfRegenerated: false,
          error: pdfError.message,
          message: `Detected ${changedPages.length} changes but PDF regeneration failed. Admin notified.`
        }, { status: 500 });
      }
    }

    // No changes detected
    return Response.json({
      success: true,
      changesDetected: false,
      checkedPages: pages.length,
      message: 'No changes detected on any monitored pages'
    });

  } catch (error) {
    console.error('[FATAL] Monitoring system error:', error.message);
    
    // Notify admin of monitoring failure
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: 'dylanllouis@gmail.com',
        from_name: 'Pacific Engineering Monitor',
        subject: `🚨 CRITICAL: Website Monitoring System Failure`,
        body: `
          <h2 style="color: #dc2626;">Monitoring System Error</h2>
          <p>The website change monitoring system encountered a critical error:</p>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Stack:</strong> <pre>${error.stack}</pre></p>
          <p>Please check the function logs immediately.</p>
          <p><em>Failed at: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}</em></p>
        `
      });
    } catch (emailError) {
      console.error('[CRITICAL] Could not send failure notification:', emailError.message);
    }

    return Response.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});