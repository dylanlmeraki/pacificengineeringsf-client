import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { category, targetLength = "medium" } = body;

    // Use AI to find recent relevant news and generate blog content
    const prompt = `You are a content writer for Pacific Engineering, a San Francisco Bay Area construction engineering firm specializing in SWPPP, structural engineering, inspections, and construction services.

Research and write a blog post about: ${category}

Find recent local news, regulations, events, or industry developments in the Bay Area construction/engineering sector.

Target length: ${targetLength === "short" ? "500-700 words" : targetLength === "long" ? "1200-1500 words" : "800-1000 words"}

Return JSON with:
{
  "title": "Engaging title",
  "excerpt": "Brief summary (150-200 chars)",
  "content": "Full markdown blog content with ## headings, bullet points, etc.",
  "featured_image": "Unsplash URL for relevant image (construction, engineering, SF Bay Area)",
  "author": "Pacific Engineering Team",
  "read_time": "X min read"
}

Make it informative, professional, and relevant to construction professionals in the SF Bay Area.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          excerpt: { type: "string" },
          content: { type: "string" },
          featured_image: { type: "string" },
          author: { type: "string" },
          read_time: { type: "string" }
        }
      }
    });

    return Response.json({ 
      success: true,
      blogData: result
    });

  } catch (error) {
    console.error('Error generating blog content:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message,
      details: error.stack
    }, { status: 500 });
  }
});