/**
 * PM2 Ecosystem Configuration for ArtCollab Backend
 * 
 * Usage:
 *   pm2 start ecosystem.config.js      # Start in foreground
 *   pm2 start ecosystem.config.js --env production  # Start in production
 *   pm2 save                           # Save current process list
 *   pm2 startup                        # Generate startup script
 * 
 * For production, use: pm2 start ecosystem.config.js --env production
 */

module.exports = {
    apps: [
        {
            name: 'artcollab-backend',
            script: 'src/server.js',
            cwd: '.',

            // Production settings
            instances: 1,  // Set to 'max' for multiple instances behind load balancer
            exec_mode: 'fork',  // Use 'cluster' for clustering

            // Environment
            env: {
                NODE_ENV: 'development',
                PORT: 5000
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000
            },

            // Watch is disabled in production
            watch: false,

            // Memory limit - restart if exceeded
            max_memory_restart: '500M',

            // Logging
            out_file: 'logs/pm2-out.log',
            error_file: 'logs/pm2-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,

            // Graceful shutdown
            kill_timeout: 10000,
            wait_ready: true,
            listen_timeout: 10000,

            // Auto-restart on crash
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',

            // Resource monitoring
            node_args: '--max-old-space-size=4096'
        }
    ],

    // Deployment configuration (for use with pm2-deploy)
    deploy: {
        production: {
            user: 'node',
            host: 'your-server.com',
            ref: 'origin/main',
            repo: 'git@github.com:yourusername/artcollab-app.git',
            path: '/var/www/artcollab',
            'pre-deploy-local': '',
            'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env production',
            env: {
                NODE_ENV: 'production'
            }
        }
    }
};
