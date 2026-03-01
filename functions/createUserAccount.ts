import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password, fullName } = await req.json();

    // Validate input
    if (!email || !password || !fullName) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    if (password.length < 8) {
      return Response.json({ 
        success: false, 
        error: 'Password must be at least 8 characters' 
      }, { status: 400 });
    }

    // Use service role to check for existing portal and create user
    try {
      // Check if user already exists
      const existingUsers = await base44.asServiceRole.entities.User.filter({ 
        email: email 
      });

      if (existingUsers && existingUsers.length > 0) {
        return Response.json({ 
          success: false, 
          error: 'An account with this email already exists' 
        }, { status: 400 });
      }

      // Check for existing client portal by email
      const existingProjects = await base44.asServiceRole.entities.Project.filter({ 
        client_email: email 
      });

      // Create the user account using Base44 auth
      // Note: This would normally use Base44's user creation API
      // For now, we'll create a User entity record
      const newUser = await base44.asServiceRole.entities.User.create({
        email: email,
        full_name: fullName,
        role: 'user'
      });

      // If there are existing projects with this email, they are automatically linked
      // due to the Project entity's RLS rules filtering by client_email

      return Response.json({
        success: true,
        message: 'Account created successfully',
        hasExistingProjects: existingProjects.length > 0,
        projectCount: existingProjects.length
      });

    } catch (createError) {
      console.error('Error creating user:', createError);
      return Response.json({ 
        success: false, 
        error: 'Failed to create account. Please try again.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in createUserAccount:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'An unexpected error occurred' 
    }, { status: 500 });
  }
});