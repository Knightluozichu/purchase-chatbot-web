import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function logRegistrationError(error: string) {
  console.log('Attempting to log registration error to Supabase:', error);
  const { data, error: insertError } = await supabase
    .from('registration_errors')
    .insert([{ message: error, timestamp: new Date() }]);

  if (insertError) {
    console.error('Failed to log registration error to Supabase:', insertError);
  } else {
    console.log('Registration error logged successfully:', data);
  }
}
