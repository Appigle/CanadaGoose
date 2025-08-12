module.exports = {
  apps: [
    {
      name: 'canadagoose-api',
      script: '/opt/app/server/app.js',
      cwd: '/opt/app/server',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '127.0.0.1',
      },
      error_file: '/var/log/pm2/canadagoose-api-error.log',
      out_file: '/var/log/pm2/canadagoose-api-out.log',
      log_file: '/var/log/pm2/canadagoose-api-combined.log',
      time: true,
      max_memory_restart: '200M',
      min_uptime: '10s',
      max_restarts: 5,
      restart_delay: 4000,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 8000,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'logs', '*.log'],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      source_map_support: false,
      disable_source_map_support: true,
      // PM2 specific settings
      pmx: true,
      // Health check endpoint
      health_check_grace_period: 3000,
      // Performance
      node_args: '--max-old-space-size=512',
      // Security
      uid: 'ec2-user',
      gid: 'ec2-user',
      // Environment variables
      env_file: '/opt/app/.env',
    },
  ],

  deploy: {
    production: {
      user: 'ec2-user',
      host: '127.0.0.1',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/canadagoose.git',
      path: '/opt/app',
      'pre-deploy-local': '',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },

  // PM2 monitoring and metrics
  pmx: true,

  // Log management
  log_type: 'json',
  log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

  // Process monitoring
  monitor: true,

  // Auto restart
  autorestart: true,

  // Watch mode (disabled for production)
  watch: false,

  // Ignore patterns for watch mode
  ignore_watch: ['node_modules', 'logs', '*.log', '.git', 'tmp', 'uploads'],

  // Merge logs
  merge_logs: true,
};
