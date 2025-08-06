const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 设置时区为中国标准时间
process.env.TZ = 'Asia/Shanghai';

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline styles and scripts for the HTML interface
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));

// Rate limiting - 更宽松的配置以支持批量操作
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes window
    max: 5000, // limit each IP to 5000 requests per windowMs (大幅增加)
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req, res) => {
        // 跳过健康检查和静态文件的限制
        return req.url.includes('/health') || req.url.includes('/static');
    }
});

// 为批量操作创建更宽松的限制器
const batchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window for batch operations
    max: 2000, // 2000 requests per minute for batch operations (大幅增加)
    message: 'Too many batch requests, please slow down your operations.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req, res) => {
        // 对特定的批量操作路径跳过限制
        return req.url.includes('/batch') || 
               req.url.includes('/import') ||
               req.url.includes('/sync') ||
               req.url.includes('/stats');
    }
});

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML interface at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes - 对需要频繁调用的路由应用批量限制器
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', batchLimiter, require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/transactions', batchLimiter, require('./routes/transactions'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/ledger', batchLimiter, require('./routes/ledger'));
app.use('/api/snapshots', require('./routes/snapshots'));
app.use('/api/init', require('./routes/init'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0' 
    });
});

// Add route for statistics endpoint that matches the frontend call
app.get('/api/products/stats/dashboard', async (req, res) => {
    try {
        const db = require('./database/connection');
        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        const lowStockItems = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock <= min_stock').get().count;
        
        // Get today's transactions
        const today = new Date().toISOString().split('T')[0];
        const todayTransactions = db.prepare(`
            SELECT COUNT(*) as count 
            FROM transactions 
            WHERE DATE(created_at) = ?
        `).get(today).count;
        
        // Calculate total inventory value
        const totalValue = db.prepare('SELECT SUM(COALESCE(total_cost_value, 0)) as total FROM products').get().total || 0;
        
        res.json({
            totalProducts: totalProducts,
            lowStockItems: lowStockItems,
            todayTransactions: todayTransactions,
            totalValue: Math.round(totalValue * 100) / 100
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to get dashboard stats' });
    }
});

// Add route for overview statistics
app.get('/api/products/stats/overview', async (req, res) => {
    try {
        const db = require('./database/connection');
        const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
        const totalValue = db.prepare('SELECT SUM(COALESCE(total_cost_value, 0)) as total FROM products').get().total || 0;
        
        res.json({
            totalProducts: totalProducts,
            totalCategories: totalCategories,
            totalValue: Math.round(totalValue * 100) / 100
        });
    } catch (error) {
        console.error('Overview stats error:', error);
        res.status(500).json({ error: 'Failed to get overview stats' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!', 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error' 
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Catch all handler - redirect to main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Database: ${process.env.DB_PATH}`);
    console.log(`Web interface available at: http://localhost:${PORT}`);
    
    // Initialize database if needed
    try {
        require('./init-database');
    } catch (error) {
        console.log('Database already initialized or error:', error.message);
    }
    
    // 初始化快照表
    try {
        const { createMonthlySnapshotTable } = require('./scripts/create-snapshot-table');
        createMonthlySnapshotTable();
    } catch (error) {
        console.error('初始化快照表失败:', error.message);
    }
    
    // 启动月度快照定时任务
    try {
        const { scheduleMonthlySnapshot } = require('./jobs/monthly-snapshot-job');
        scheduleMonthlySnapshot();
    } catch (error) {
        console.error('启动月度快照定时任务失败:', error.message);
    }
    
    // 启动自动备份调度器
    try {
        const backupService = require('./services/backupService');
        backupService.startAutoBackupScheduler();
    } catch (error) {
        console.error('启动备份调度器失败:', error.message);
    }
});

module.exports = app;
