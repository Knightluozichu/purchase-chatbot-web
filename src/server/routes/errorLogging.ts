import { Router } from 'express';
import { supabase } from '../utils/supabase';

const router = Router();

router.post('/logRegistrationError', async (req, res) => {
  console.log('Received error logging request');
  try {
    const { error } = req.body;
    const { data, error: insertError } = await supabase
      .from('registration_errors')
      .insert([{ message: error, timestamp: new Date() }]);

    if (insertError) {
      console.error('Error logging to Supabase:', insertError);
      res.status(500).json({ message: 'Failed to log error to Supabase' });
    } else {
      console.log('Error logged successfully:', data);
      res.json({ message: 'Error logged successfully' });
    }
  } catch (error) {
    console.error('Error in error logging:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
