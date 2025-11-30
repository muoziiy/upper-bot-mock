"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const teachers_1 = __importDefault(require("./routes/teachers"));
const admin_1 = __importDefault(require("./routes/admin"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const streak_1 = __importDefault(require("./routes/streak"));
const achievements_1 = __importDefault(require("./routes/achievements"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const journey_1 = __importDefault(require("./routes/journey"));
const onboarding_1 = __importDefault(require("./routes/onboarding"));
const scheduler_1 = __importDefault(require("./routes/scheduler"));
const bot_1 = __importDefault(require("./bot"));
const scheduler_2 = require("./scheduler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/onboarding', onboarding_1.default);
app.use('/api/students', students_1.default);
app.use('/api/students', dashboard_1.default);
app.use('/api/students', streak_1.default);
app.use('/api/students', achievements_1.default);
app.use('/api/students', journey_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/teachers', teachers_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/cron', scheduler_1.default);
app.get('/', (req, res) => {
    res.send('Education Center Bot API is running');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Start Scheduler
    (0, scheduler_2.startScheduler)();
    // Start Telegram bot
    bot_1.default.launch().then(() => {
        console.log('Telegram bot started successfully');
    }).catch((err) => {
        console.error('Failed to start Telegram bot:', err);
    });
});
