const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
            "img-src": ["'self'", "data:", "https:"],
        },
    },
}));
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Request logging
app.use(express.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Mock data for dashboard
const mockStats = {
    systemStatus: {
        status: 'active',
        lastArchive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    statistics: {
        totalArchives: 157,
        storageUsed: '2.3 GB',
        successRate: '99.8%'
    },
    configuration: {
        retentionPeriod: '30 days',
        archiveFrequency: 'Daily',
        compression: 'Enabled'
    }
};

// Routes
// Serve index.html
app.get('/', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'public', 'index.html');
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Internal Server Error');
    }
});

// API Endpoints
// Get system status
app.get('/api/status', (req, res) => {
    res.json(mockStats.systemStatus);
});

// Get statistics
app.get('/api/stats', (req, res) => {
    res.json(mockStats.statistics);
});

// Get configuration
app.get('/api/config', (req, res) => {
    res.json(mockStats.configuration);
});

// Get recent logs (mock data)
app.get('/api/logs', (req, res) => {
    const recentLogs = [
        { timestamp: new Date().toISOString(), type: 'info', message: 'Archive completed successfully' },
        { timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info', message: 'Starting archival process' },
        { timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'warning', message: 'Low storage space warning' }
    ];
    res.json(recentLogs);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Not found');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});