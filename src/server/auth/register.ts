import { supabase } from '../utils/supabase';

export async function registerUser(data: any) {
  console.log('Received registration data:', data);
  try {
    // Parse the incoming data to ensure it's valid JSON
    const parsedData = JSON.parse(data);
    console.log('Parsed registration data:', parsedData);

    // Check if the data contains all required fields
    if (!parsedData.email || !parsedData.password || !parsedData.name) {
      throw new Error('Missing required fields');
    }

    // Insert user into Supabase
    const { data: userData, error: insertError } = await supabase
      .from('users')
      .insert([{
        email: parsedData.email,
        name: parsedData.name,
        password: parsedData.password // Note: In a real application, you would hash the password
      }]);

    if (insertError) {
      console.error('Error inserting user into Supabase:', insertError);
      throw new Error('Registration failed due to database error');
    }

    console.log('User registered successfully:', userData);
    return { success: true, user: userData[0] };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}
