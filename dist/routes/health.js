import { Router } from 'express';
import { db } from '@/config/database.js';
import { logger } from '@/utils/logger.js';
/**
 * Health Check Routes
 * Provides system health status and monitoring endpoints
 */
const router = Router();
// Basic health check
router.get('/', async (req, res) => {
    try {
        res.json({
            success: true,
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: 'Health check failed',
        });
    }
});
// Detailed health check
router.get('/detailed', async (req, res) => {
    const healthStatus = {
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        services: {
            database: { status: 'unknown' },
        },
        system: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            node_version: process.version,
        },
    };
    // Check database
    try {
        await db.query('SELECT 1 as test');
        healthStatus.services.database = {
            status: 'healthy',
            connected: true,
        };
    }
    catch (error) {
        healthStatus.services.database = {
            status: 'unhealthy',
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
        healthStatus.success = false;
        healthStatus.status = 'degraded';
    }
    const statusCode = healthStatus.success ? 200 : 503;
    res.status(statusCode).json(healthStatus);
});
// Readiness check (for Kubernetes/Docker)
router.get('/ready', async (req, res) => {
    try {
        // Check if database is connected
        await db.query('SELECT 1 as test');
        res.json({
            success: true,
            status: 'ready',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger.error('Readiness check failed:', error);
        res.status(503).json({
            success: false,
            status: 'not ready',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
// Liveness check (for Kubernetes/Docker)
router.get('/live', (req, res) => {
    // Simple liveness check - if the server can respond, it's alive
    res.json({
        success: true,
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// Metrics endpoint (basic)
router.get('/metrics', async (req, res) => {
    try {
        const v8 = await import('v8');
        const heapStats = v8.default.getHeapStatistics();
        const metrics = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            heapStatistics: {
                totalHeapSize: heapStats.total_heap_size,
                totalHeapSizeExecutable: heapStats.total_heap_size_executable,
                totalPhysicalSize: heapStats.total_physical_size,
                totalAvailableSize: heapStats.total_available_size,
                usedHeapSize: heapStats.used_heap_size,
                heapSizeLimit: heapStats.heap_size_limit,
                mallocedMemory: heapStats.malloced_memory,
                peakMallocedMemory: heapStats.peak_malloced_memory,
                doesZapGarbage: heapStats.does_zap_garbage
            },
            maxHeapSize: `${Math.round(heapStats.heap_size_limit / 1024 / 1024)} MB`,
            cpu: process.cpuUsage(),
            environment: process.env.NODE_ENV || 'development',
        };
        // Add database metrics if available
        try {
            await db.query('SELECT 1 as test');
            metrics.database = { connected: true };
        }
        catch (error) {
            metrics.database = { connected: false };
        }
        res.json({
            success: true,
            data: metrics,
        });
    }
    catch (error) {
        logger.error('Metrics collection failed:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to collect metrics',
        });
    }
});
// Database health check endpoint
router.get('/db', async (req, res) => {
    try {
        const pool = db.getPool();
        if (!pool) {
            return res.status(503).json({
                success: false,
                message: 'Database pool not initialized',
                status: 'disconnected'
            });
        }
        // Execute a simple query to test the connection
        const startTime = Date.now();
        await pool.execute('SELECT 1 as test');
        const queryTime = Date.now() - startTime;
        res.json({
            success: true,
            message: 'Database connection healthy',
            status: 'connected',
            queryTime: queryTime
        });
    }
    catch (error) {
        logger.error('Database health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Database connection failed',
            status: 'error',
            error: error.message
        });
    }
});
export default router;
//# sourceMappingURL=health.js.map