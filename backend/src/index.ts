import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import teacherRoutes from './routes/teachers';
import adminRoutes from './routes/admin';
import dashboardRoutes from './routes/dashboard';
import streakRoutes from './routes/streak';
import achievementsRoutes from './routes/achievements';
import leaderboardRoutes from './routes/leaderboard';
import journeyRoutes from './routes/journey';
import onboardingRoutes from './routes/onboarding';
import schedulerRoutes from './routes/scheduler';
import bot from './bot';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/students', dashboardRoutes);
app.use('/api/students', streakRoutes);
app.use('/api/students', achievementsRoutes);
app.use('/api/students', journeyRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cron', schedulerRoutes);

app.get('/', (req, res) => {
    res.send('Education Center Bot API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Start Telegram bot
    bot.launch().then(() => {
        console.log('Telegram bot started successfully');
    }).catch((err) => {
        console.error('Failed to start Telegram bot:', err);
    });
});
