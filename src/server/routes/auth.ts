import { Router } from 'express';
import { registerUser } from './auth/register';

const router = Router();

router.post('/register', async (req, res) => {
  console.log('Received registration request');
  const result = await registerUser(JSON.stringify(req.body));
  if (result.success) {
    console.log('Sending successful registration response');
    res.json(result.user);
  } else {
    console.log('Sending registration error response');
    res.status(400).json({ message: result.error });
  }
});

export default router;
