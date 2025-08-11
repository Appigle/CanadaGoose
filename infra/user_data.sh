#!/bin/bash
set -e

# Enable logging
exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1

echo "Starting user data script execution..."
echo "Timestamp: $(date)"
echo "System info: $(uname -a)"

# Update system
yum update -y

# Install nginx from Amazon Linux Extras (compatible with AL2)
amazon-linux-extras install nginx1 -y

# Install git and aws-cli
yum install -y git aws-cli

# Install Node.js 16.x (compatible with Amazon Linux 2 GLIBC 2.26)
curl -fsSL https://rpm.nodesource.com/setup_16.x | bash -
yum install -y nodejs

# Install PM2 globally
npm install -g pm2

# Verify installations
echo "Verifying installations..."
nginx -v
node --version
npm --version
pm2 --version
echo "All packages installed successfully!"

# Create application directories
mkdir -p /opt/app/server
mkdir -p /var/www/app
mkdir -p /opt/app/server-scripts

# SMART FETCH-SECRETS PRESERVATION: Check for existing script before overwriting
echo "Checking for existing fetch-secrets script..."

if [ ! -f "/opt/app/fetch-secrets.sh" ]; then
    echo "Creating fetch-secrets script (no existing script found)"
    cat > /opt/app/fetch-secrets.sh << 'EOF'
#!/bin/bash
set -e

# Get the secret ARN from user data
SECRET_ARN="${secret_arn}"

# Fetch secrets from AWS Secrets Manager
SECRETS=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text)

# Parse JSON and create .env file
echo "$SECRETS" | jq -r 'to_entries | .[] | "\(.key)=\(.value)"' > /opt/app/.env

# Set proper permissions
chmod 600 /opt/app/.env
chown ec2-user:ec2-user /opt/app/.env
EOF
else
    echo "✅ Existing fetch-secrets script found - PRESERVING your custom logic"
    echo "   Current script: $(ls -la /opt/app/fetch-secrets.sh)"
fi

# Make fetch-secrets script executable
chmod +x /opt/app/fetch-secrets.sh

# SMART NGINX CONFIGURATION: Check for existing config before overwriting
echo "Checking for existing Nginx configuration..."

if [ ! -f "/etc/nginx/conf.d/app.conf" ]; then
    echo "Creating Nginx configuration (no existing config found)"
    cat > /etc/nginx/conf.d/app.conf << 'EOF'
server {
    listen 80;
    server_name ${domain_host};

    # Cloudflare proxies HTTPS; we serve plain HTTP to CF
    root /var/www/app;
    index index.html;

    # SPA router
    location /app {
        try_files $uri $uri/ /app/index.html;
    }
    
    location = / {
        return 301 /app;
    }

    # API reverse proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}

# Upstream connection for WebSocket support
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}
EOF
else
    echo "✅ Existing Nginx configuration found - PRESERVING your custom config"
    echo "   Current config: $(ls -la /etc/nginx/conf.d/app.conf)"
fi

# Remove default Nginx site (safe to do every time)
rm -f /etc/nginx/conf.d/default.conf

# SMART FILE PRESERVATION: Only create placeholder files if they don't exist
echo "Checking for existing application code..."

# Check if backend app.js exists
if [ ! -f "/opt/app/server/app.js" ]; then
    echo "Creating placeholder backend app.js (no existing code found)"
    cat > /opt/app/server/app.js << 'EOF'
const express = require('express');
const app = express();
const port = 3000;

// Load environment variables
require('dotenv').config({ path: '/opt/app/.env' });

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Basic API endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'CanadaGoose API Server',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${port}`);
});
EOF
else
    echo "✅ Existing backend app.js found - PRESERVING your code"
fi

# Check if package.json exists
if [ ! -f "/opt/app/server/package.json" ]; then
    echo "Creating placeholder package.json (no existing file found)"
    cat > /opt/app/server/package.json << 'EOF'
{
  "name": "canadagoose-server",
  "version": "1.0.0",
  "description": "CanadaGoose API Server",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
EOF
else
    echo "✅ Existing package.json found - PRESERVING your dependencies"
fi

# Download server management scripts from S3
echo "Downloading server management scripts from S3..."
aws s3 cp s3://${s3_bucket}/server-scripts/ /opt/app/server-scripts/ --recursive --region ${aws_region}

# Make scripts executable
chmod +x /opt/app/server-scripts/*.sh

# Check if PM2 ecosystem file exists
if [ ! -f "/opt/app/ecosystem.config.js" ]; then
    echo "Creating PM2 ecosystem file (no existing file found)"
    cat > /opt/app/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'canadagoose-api',
    script: '/opt/app/server/app.js',
    cwd: '/opt/app/server',
    instances: 1,
    exec_mode: 'fork',
    env: { NODE_ENV: 'production', PORT: 3000, HOST: '127.0.0.1' },
    env_production: { NODE_ENV: 'production', PORT: 3000, HOST: '127.0.0.1' },
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
    health_check_grace_period: 3000,
    node_args: '--max-old-space-size=512',
    uid: 'ec2-user',
    gid: 'ec2-user',
    env_file: '/opt/app/.env'
  }]
};
EOF
else
    echo "✅ Existing PM2 ecosystem file found - PRESERVING your configuration"
fi

# Create PM2 log directory
mkdir -p /var/log/pm2

# Set proper ownership
chown -R ec2-user:ec2-user /opt/app
chown -R ec2-user:ec2-user /var/www/app

# Install server dependencies
cd /opt/app/server
npm install

# Fetch secrets and create .env file
echo "Updating environment variables from Secrets Manager..."
/opt/app/fetch-secrets.sh

# SMART PM2 MANAGEMENT: Check if app is already running
if pm2 list | grep -q "canadagoose-api"; then
    echo "✅ PM2 app already running - RELOADING configuration"
    pm2 reload ecosystem.config.js
else
    echo "Starting PM2 app for the first time"
    cd /opt/app
    pm2 start ecosystem.config.js
fi

pm2 save
pm2 startup

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

# SMART FRONTEND PRESERVATION: Only create placeholder if no frontend exists
if [ ! -f "/var/www/app/index.html" ] && [ ! -d "/var/www/app/app" ]; then
    echo "Creating placeholder frontend (no existing frontend found)"
    cat > /var/www/app/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CanadaGoose - Welcome</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .status { padding: 20px; margin: 20px 0; border-radius: 5px; }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🦢 CanadaGoose</h1>
        <div class="status success">
            <h2>✅ Infrastructure Deployed Successfully!</h2>
            <p>Your Terraform infrastructure is now running.</p>
        </div>
        <div class="status info">
            <h3>📋 What's Running:</h3>
            <ul style="text-align: left; display: inline-block;">
                <li>EC2 t3.micro instance with Node.js 16.x</li>
                <li>Nginx reverse proxy</li>
                <li>RDS MySQL database</li>
                <li>Secrets Manager for configuration</li>
                <li>PM2 process manager</li>
            </ul>
        </div>
        <div class="status info">
            <h3>🔗 Endpoints:</h3>
            <p><strong>Frontend:</strong> <a href="/app">/app</a></p>
            <p><strong>API Health:</strong> <a href="/api/health">/api/health</a></p>
            <p><strong>Server Health:</strong> <a href="/health">/health</a></p>
        </div>
        <p><em>Next step: Deploy your Vue.js SPA to /var/www/app/</em></p>
    </div>
</body>
</html>
EOF
else
    echo "✅ Existing frontend found - PRESERVING your deployed code"
    echo "   Frontend files: $(ls -la /var/www/app/ | wc -l) files found"
fi

# Set proper permissions for the web files
chown -R nginx:nginx /var/www/app

echo "User data script completed successfully!"
echo "Infrastructure is now ready for your CanadaGoose application."
echo ""
echo "📊 PRESERVATION SUMMARY:"
echo "- Fetch-secrets script: $(if [ -f "/opt/app/fetch-secrets.sh" ]; then echo "✅ PRESERVED"; else echo "❌ CREATED NEW"; fi)"
echo "- Nginx config: $(if [ -f "/etc/nginx/conf.d/app.conf" ]; then echo "✅ PRESERVED"; else echo "❌ CREATED NEW"; fi)"
echo "- Backend code: $(if [ -f "/opt/app/server/app.js" ]; then echo "✅ PRESERVED"; else echo "❌ CREATED NEW"; fi)"
echo "- Package.json: $(if [ -f "/opt/app/server/package.json" ]; then echo "✅ PRESERVED"; else echo "❌ CREATED NEW"; fi)"
echo "- PM2 ecosystem: $(if [ -f "/opt/app/ecosystem.config.js" ]; then echo "✅ PRESERVED"; else echo "❌ CREATED NEW"; fi)"
echo "- Dependencies: $(if [ -d "/opt/app/server/node_modules" ]; then echo "✅ PRESERVED"; else echo "❌ INSTALLED NEW"; fi)"
echo "- Frontend: $(if [ -f "/var/www/app/index.html" ] || [ -d "/var/www/app/app" ]; then echo "✅ PRESERVED"; else echo "❌ CREATED NEW"; fi)"
echo "- PM2 processes: $(if pm2 list | grep -q "canadagoose-api"; then echo "✅ RELOADED"; else echo "❌ STARTED NEW"; fi)"
echo ""
echo "Final verification:"
echo "- Nginx status: $(systemctl is-active nginx)"
echo "- PM2 processes: $(pm2 list | grep -c 'canadagoose-api' || echo '0')"
echo "- Application directory: $(ls -la /opt/app/)"
echo "Script completed at: $(date)" 