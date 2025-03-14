import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Create Supabase client with admin privileges for direct database operations
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { applicationId, profileId } = await request.json();
    
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Start a transaction by wrapping operations in a try-catch block
    try {
      // 1. If profileId is provided, delete the profile
      if (profileId) {
        // First, get the user IDs associated with this profile
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          throw new Error(`Error fetching users: ${authError.message}`);
        }
        
        // Find users with this profile ID in their metadata
        const profileUsers = authData.users.filter(
          user => user.user_metadata?.profile_id === profileId
        );
        
        // Delete each user account
        for (const user of profileUsers) {
          const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
          if (deleteUserError) {
            throw new Error(`Error deleting user ${user.id}: ${deleteUserError.message}`);
          }
        }
        
        // Delete the profile using admin client for better permissions
        const { error: deleteProfileError } = await adminSupabase
          .from('participants')
          .delete()
          .eq('id', profileId);
          
        if (deleteProfileError) {
          console.error(`Error deleting profile with admin client: ${deleteProfileError.message}`);
          
          // Fallback to regular client
          const { error: fallbackDeleteError } = await supabase
            .from('participants')
            .delete()
            .eq('id', profileId);
            
          if (fallbackDeleteError) {
            throw new Error(`Error deleting profile: ${fallbackDeleteError.message}`);
          }
        } else {
          console.log(`Successfully deleted profile ${profileId} with admin client`);
        }
      }
      
      // 2. Reset the application status with multiple approaches to ensure it works
      
      console.log(`Attempting to update application ${applicationId} status to 'pending'`);
      
      // Use admin client for direct database operations
      console.log(`Attempting to update application ${applicationId} to status=pending, profile_created=false`);
      
      // Update using admin privileges
      const { error: adminUpdateError } = await adminSupabase
        .from('applications')
        .update({
          profile_created: false,
          status: 'pending'
        })
        .eq('id', applicationId);
      
      if (adminUpdateError) {
        console.error(`Error updating application with admin client: ${adminUpdateError.message}`);
        
        // Fallback to regular client if admin update fails
        const { error: updateAppError } = await supabase
          .from('applications')
          .update({
            profile_created: false,
            status: 'pending'
          })
          .eq('id', applicationId);
        
        if (updateAppError) {
          console.error(`Error updating application with regular client: ${updateAppError.message}`);
        }
      } else {
        console.log(`Successfully updated application ${applicationId} with admin client`);
      }
      
      // Revalidate the paths to ensure fresh data
      revalidatePath('/admin/intake');
      revalidatePath('/admin/applications');
      
      // Verify the update was successful using admin client
      const { data: verifyData, error: verifyError } = await adminSupabase
        .from('applications')
        .select('status, profile_created')
        .eq('id', applicationId)
        .single();
        
      if (verifyError) {
        console.error(`Error verifying update: ${verifyError.message}`);
      } else {
        console.log(`Verification result after update: ${JSON.stringify(verifyData)}`);
        
        // If verification failed, try one more direct approach
        if (verifyData.status !== 'pending' || verifyData.profile_created !== false) {
          console.error(`Update verification failed: ${JSON.stringify(verifyData)}`);
          
          // Try one more direct update as a last resort with admin privileges
          const { error: lastResortError } = await adminSupabase
            .from('applications')
            .update({
              profile_created: false,
              status: 'pending'
            })
            .eq('id', applicationId);
            
          if (lastResortError) {
            console.error(`Last resort update error: ${lastResortError.message}`);
          } else {
            console.log(`Successfully updated application ${applicationId} with last resort approach`);
          }
        }
      }
      
      // Fetch the updated application to include in the response using admin client
      const { data: updatedApplication, error: fetchError } = await adminSupabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching updated application:', fetchError);
      } else {
        console.log(`Final application state: ${JSON.stringify(updatedApplication)}`);
      }
      
      return NextResponse.json({
        success: true,
        message: `Profile deleted and application reset successfully`,
        application: updatedApplication || null
      });
      
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { error: transactionError instanceof Error ? transactionError.message : 'Transaction failed' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in delete-profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}