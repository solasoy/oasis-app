import { createClient } from '@supabase/supabase-js';
import { generateTemporaryPassword } from '@/lib/auth-utils';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const profileId = body.profileId;

    // Generate temporary passwords
    const husbandPassword = generateTemporaryPassword();
    const wifePassword = generateTemporaryPassword();

    console.log('DEBUG: Temporary Passwords Generated', {
      husbandPasswordLength: husbandPassword.length,
      wifePasswordLength: wifePassword.length,
      husbandPasswordExists: !!husbandPassword,
      wifePasswordExists: !!wifePassword
    });

    const { data: updatedData, error } = await supabase
      .from('participants')
      .update({
        husband_temp_password: husbandPassword,
        wife_temp_password: wifePassword,
        // other fields...
      })
      .eq('id', profileId)
      .select('husband_temp_password, wife_temp_password');

    if (error) {
      console.error('ERROR: Failed to update participant passwords', error);
      return new Response(JSON.stringify({ error: 'Failed to update passwords' }), { status: 500 });
    }

    console.log('DEBUG: Participant Password Update', {
      husbandTempPassword: updatedData?.[0]?.husband_temp_password ? 'EXISTS' : 'MISSING',
      wifeTempPassword: updatedData?.[0]?.wife_temp_password ? 'EXISTS' : 'MISSING'
    });

    return new Response(JSON.stringify({ 
      success: true,
      husbandPasswordSet: !!updatedData?.[0]?.husband_temp_password,
      wifePasswordSet: !!updatedData?.[0]?.wife_temp_password
    }), { status: 200 });
  } catch (err) {
    console.error('CRITICAL: Unexpected error in password generation', err);
    return new Response(JSON.stringify({ error: 'Unexpected error' }), { status: 500 });
  }
}