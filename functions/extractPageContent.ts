import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { pageName } = body;

    if (!pageName) {
      return Response.json({ error: 'Page name required' }, { status: 400 });
    }

    // Map page names to URLs
    const pageUrls = {
      "Home": "/",
      "About": "/About",
      "Services": "/Services",
      "ServicesOverview": "/ServicesOverview",
      "InspectionsTesting": "/InspectionsTesting",
      "SpecialInspections": "/SpecialInspections",
      "StructuralEngineering": "/StructuralEngineering",
      "Construction": "/Construction",
      "SWPPPChecker": "/SWPPPChecker",
      "Contact": "/Contact",
      "Blog": "/Blog",
      "ProjectGallery": "/ProjectGallery"
    };

    const pageUrl = pageUrls[pageName];
    if (!pageUrl) {
      return Response.json({ error: 'Invalid page name' }, { status: 400 });
    }

    // Fetch the page content
    const fullUrl = `https://pacificengineeringsf.com${pageUrl}`;
    
    const response = await fetch(fullUrl);
    const html = await response.text();

    // Extract text content
    let textContent = html;
    
    // Remove script and style tags
    textContent = textContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    textContent = textContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Remove HTML tags but preserve line breaks
    textContent = textContent.replace(/<br\s*\/?>/gi, '\n');
    textContent = textContent.replace(/<\/p>/gi, '\n\n');
    textContent = textContent.replace(/<\/h[1-6]>/gi, '\n\n');
    textContent = textContent.replace(/<\/li>/gi, '\n');
    textContent = textContent.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    textContent = textContent.replace(/&nbsp;/g, ' ');
    textContent = textContent.replace(/&amp;/g, '&');
    textContent = textContent.replace(/&lt;/g, '<');
    textContent = textContent.replace(/&gt;/g, '>');
    textContent = textContent.replace(/&quot;/g, '"');
    
    // Clean up excessive whitespace but preserve paragraphs
    textContent = textContent.replace(/[ \t]+/g, ' ');
    textContent = textContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    textContent = textContent.trim();
    
    // Limit to ~2500 characters
    const excerpt = textContent.substring(0, 2500);

    return Response.json({ 
      success: true,
      pageContent: excerpt,
      fullLength: textContent.length
    });

  } catch (error) {
    console.error('Error extracting page content:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});