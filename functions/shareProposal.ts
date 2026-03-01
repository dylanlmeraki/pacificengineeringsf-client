import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received request body:', JSON.stringify(body));
    
    const { proposalId, recipientEmail } = body;

    if (!proposalId || !recipientEmail) {
      console.error('Missing required fields:', { proposalId, recipientEmail });
      return Response.json({ error: 'Proposal ID and recipient email required' }, { status: 400 });
    }
    
    console.log('Processing share for proposal:', proposalId, 'to:', recipientEmail);

    // Get the proposal - use list with limit instead of filter
    console.log('Fetching proposals...');
    const allProposals = await base44.asServiceRole.entities.Proposal.list('-created_date', 1000);
    console.log(`Found ${allProposals.length} total proposals`);
    
    const proposal = allProposals.find(p => p.id === proposalId);
    
    if (!proposal) {
      console.error('Proposal not found:', proposalId);
      return Response.json({ error: 'Proposal not found' }, { status: 404 });
    }

    console.log('Found proposal:', proposal.title);
    const proposalUrl = `${Deno.env.get('APP_URL') || 'https://pacificengineeringsf.com'}/ProposalDashboard?id=${proposalId}`;
    console.log('Proposal URL:', proposalUrl);

    // Send email with proposal link
    console.log('Sending email to:', recipientEmail);
    
    const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      from_name: 'Pacific Engineering',
      subject: `📄 Proposal Shared: ${proposal.title || 'Untitled Proposal'}`,
      body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0B67A6 0%, #0EA5A4 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: white; padding: 40px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; padding: 14px 28px; background: #0B67A6; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 Proposal Shared</h1>
    </div>
    <div class="content">
      <p><strong>${user.full_name}</strong> has shared a proposal with you:</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 10px 0; color: #0B67A6;">${proposal.title || 'Untitled Proposal'}</h2>
        ${proposal.amount ? `<p style="margin: 5px 0; font-size: 18px;"><strong>Amount:</strong> $${Number(proposal.amount).toLocaleString()}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Status:</strong> ${proposal.status || 'draft'}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${proposalUrl}" class="button">View Proposal</a>
      </div>

      <p style="margin-top: 20px;">If you have any questions, please contact us at <strong>(415)-419-6079</strong>.</p>
    </div>
    <div class="footer">
      <p>Pacific Engineering & Construction Inc.<br>470 3rd St., San Francisco, CA 94107</p>
    </div>
  </div>
</body>
</html>`
    });

    console.log('Email sent successfully:', emailResult);

    return Response.json({ 
      success: true,
      message: `Proposal shared with ${recipientEmail}`
    });

  } catch (error) {
    console.error('=== ERROR SHARING PROPOSAL ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return Response.json({ 
      error: 'Failed to share proposal',
      message: error.message,
      details: error.stack
    }, { status: 500 });
  }
});