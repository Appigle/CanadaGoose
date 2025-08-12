output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "rds_port" {
  description = "RDS MySQL port"
  value       = aws_db_instance.main.port
}

output "secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = local.secret_arn
  sensitive   = true
}

output "secrets_manager_status" {
  description = "Status of Secrets Manager secret"
  value       = "Created new secret with unique name to avoid conflicts"
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket for server scripts"
  value       = aws_s3_bucket.scripts.bucket
}

output "application_url" {
  description = "URL to access the application"
  value       = "http://${var.domain_host}"
}

output "api_health_check" {
  description = "API health check endpoint"
  value       = "http://${var.domain_host}/api/health"
}

output "ssh_connection" {
  description = "SSH connection command to the EC2 instance"
  value       = "ssh -i ssh_key ec2-user@${aws_eip.app.public_ip}"
}

output "deployment_instructions" {
  description = "Instructions for deploying the Vue.js SPA"
  value       = <<-EOT
    Your infrastructure is now deployed! Here's what to do next:

    1. SSH into your EC2 instance:
       ssh -i ssh_key ec2-user@${aws_eip.app.public_ip}

    2. Check the server status:
       cd /opt/app/server-scripts
       ./check-status.sh

    3. Deploy your Vue.js SPA:
       # Upload your built app to the server
       scp -i ssh_key your-app.tar.gz ec2-user@${aws_eip.app.public_ip}:/tmp/canadagoose-build.tar.gz
       
       # SSH into the server and deploy
       ssh -i ssh_key ec2-user@${aws_eip.app.public_ip}
       cd /opt/app/server-scripts
       ./deploy-app.sh

    4. Access your application:
       - Frontend: http://${aws_eip.app.public_ip}/app
       - API: http://${aws_eip.app.public_ip}/api/
       - Health: http://${aws_eip.app.public_ip}/health

    5. Monitor and manage:
       - Check status: ./check-status.sh
       - Restart services: ./restart-services.sh
       - View logs: pm2 logs canadagoose-api
       - PM2 monitoring: pm2 monit

    6. Alternative commands (no scripts needed):
       # Restart services
       sudo systemctl restart nginx
       pm2 restart all
       
       # Check status
       sudo systemctl status nginx
       pm2 status
       pm2 logs canadagoose-api

    7. PM2 ecosystem management:
       # Start with ecosystem
       pm2 start ecosystem.config.js --env production
       
       # Reload configuration
       pm2 reload ecosystem.config.js --env production
       
       # Save and setup startup
       pm2 save
       pm2 startup

    8. Set up Cloudflare DNS:
       - Point ${var.domain_host} to ${aws_eip.app.public_ip}
       - Enable Cloudflare proxy (orange cloud) for HTTPS termination

    9. Database connection details are stored in AWS Secrets Manager:
       - Secret ARN: ${local.secret_arn}
       - Access from EC2 instance using IAM role

    For more information, see the README.md and server-scripts/README.md files.
  EOT
} 