import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify admin authentication
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        error: 'Unauthorized - Admin access required' 
      }, { status: 403 });
    }

    // Get all active projects with unique client emails
    const activeProjects = await base44.asServiceRole.entities.Project.filter({
      status: { $in: ['Planning', 'In Progress', 'Under Review'] }
    });

    const clientsMap = new Map();
    
    // Group projects by client email
    for (const project of activeProjects) {
      if (!project.client_email) continue;
      
      if (!clientsMap.has(project.client_email)) {
        clientsMap.set(project.client_email, {
          email: project.client_email,
          name: project.client_name || 'Unknown Client',
          projects: []
        });
      }
      
      clientsMap.get(project.client_email).projects.push(project);
    }

    const syncedClients = [];
    const errors = [];

    // Sync each client to CRM as "Active Account"
    for (const [email, clientData] of clientsMap) {
      try {
        // Check if prospect already exists
        const existingProspects = await base44.asServiceRole.entities.Prospect.filter({
          contact_email: email
        });

        const prospectData = {
          company_name: clientData.name,
          contact_name: clientData.name,
          contact_email: email,
          status: 'Won',
          segment: 'Key Account',
          tags: ['Active Client', 'Client Portal'],
          notes: `Active client with ${clientData.projects.length} project(s) in progress. Synced from Client Portal on ${new Date().toLocaleDateString()}.`,
          lead_source: 'Client Portal',
          deal_stage: 'Closed Won',
          probability: 100
        };

        if (existingProspects && existingProspects.length > 0) {
          // Update existing prospect
          await base44.asServiceRole.entities.Prospect.update(
            existingProspects[0].id,
            prospectData
          );
          syncedClients.push({
            email,
            name: clientData.name,
            action: 'updated',
            projectCount: clientData.projects.length
          });
        } else {
          // Create new prospect
          await base44.asServiceRole.entities.Prospect.create(prospectData);
          syncedClients.push({
            email,
            name: clientData.name,
            action: 'created',
            projectCount: clientData.projects.length
          });
        }
      } catch (error) {
        console.error(`Error syncing client ${email}:`, error);
        errors.push({
          email,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Successfully synced ${syncedClients.length} active clients to CRM`,
      syncedClients,
      errors: errors.length > 0 ? errors : undefined,
      totalClientsProcessed: clientsMap.size
    });

  } catch (error) {
    console.error('Error in syncClientToCRM:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
});