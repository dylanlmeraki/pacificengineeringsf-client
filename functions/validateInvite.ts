import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: 'Token is required' }, { status: 400 });
    }

    // Use service role to access invite
    const invites = await base44.asServiceRole.entities.ClientInvite.filter({ 
      invite_token: token 
    });
    
    const invite = invites[0];
    
    if (!invite) {
      return Response.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    if (invite.used) {
      return Response.json({ error: 'This invitation has already been used' }, { status: 400 });
    }

    if (new Date(invite.expires_at) < new Date()) {
      return Response.json({ error: 'This invitation has expired' }, { status: 400 });
    }

    return Response.json({ 
      success: true,
      invite: {
        email: invite.email,
        company_name: invite.company_name,
        invited_by_name: invite.invited_by_name
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});