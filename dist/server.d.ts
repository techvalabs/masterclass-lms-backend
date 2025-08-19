import express from 'express';
import 'express-async-errors';
/**
 * Real Estate Masterclass LMS Backend Server
 * Express.js application with comprehensive middleware stack
 */
declare class Server {
    private app;
    private httpServer;
    private port;
    constructor();
    /**
     * Initialize middleware stack
     */
    private initializeMiddleware;
    /**
     * Initialize API routes
     */
    private initializeRoutes;
    /**
     * Initialize error handling
     */
    private initializeErrorHandling;
    /**
     * Initialize database and external services
     */
    private initializeServices;
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Graceful shutdown
     */
    private gracefulShutdown;
    /**
     * Get Express app instance
     */
    getApp(): express.Application;
}
declare const server: Server;
export default server;
export { Server };
//# sourceMappingURL=server.d.ts.map