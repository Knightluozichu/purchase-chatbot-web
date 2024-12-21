import express from 'express';
import authRoutes from './routes/auth';
import errorLoggingRoutes from './routes/errorLogging';

const app = express();
app.use(express.json());

// Ensure the correct path for auth routes
app.use('/api/auth', authRoutes);
app.use('/api', errorLoggingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
