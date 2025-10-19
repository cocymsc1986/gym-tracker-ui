# Deployment Guide

This guide explains how to deploy the gym-tracker-ui application to AWS.

## Architecture

The application is deployed as a static site using:
- **S3 bucket** for hosting static files
- **CloudFront** for CDN and HTTPS
- **GitHub Actions** for CI/CD pipeline

## Prerequisites

1. AWS account with appropriate permissions
2. GitHub repository secrets configured
3. Terraform installed locally

## Setup Instructions

### 1. Deploy Infrastructure with Terraform

```bash
cd terraform

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit variables as needed (optional - defaults should work)
# vim terraform.tfvars

# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Deploy infrastructure
terraform apply
```

### 2. Configure GitHub Secrets

Add the following secrets to your GitHub repository:

#### Required Secrets:
- `AWS_ACCESS_KEY_ID` - AWS access key for deployment
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for deployment
- `VITE_API_URL` - Your API endpoint URL
- `VITE_COGNITO_USER_POOL_ID` - AWS Cognito user pool ID
- `VITE_COGNITO_CLIENT_ID` - AWS Cognito client ID

#### Auto-populated from Terraform outputs:
- `S3_BUCKET_NAME` - From `terraform output s3_bucket_name`
- `CLOUDFRONT_DISTRIBUTION_ID` - From `terraform output cloudfront_distribution_id`

```bash
# Get outputs after terraform apply
terraform output s3_bucket_name
terraform output cloudfront_distribution_id
```

### 3. Deployment

Once setup is complete:

1. Push to `main` branch to trigger deployment
2. GitHub Actions will:
   - Run tests and linting
   - Build the application with environment variables
   - Deploy to S3
   - Invalidate CloudFront cache

### 4. Access Your Application

After successful deployment, your application will be available at:
```
https://YOUR_CLOUDFRONT_DOMAIN.cloudfront.net
```

Get the URL with:
```bash
terraform output app_url
```

## Manual Deployment

If you need to deploy manually:

```bash
# Build the application
npm run build

# Deploy to S3 (replace bucket name)
aws s3 sync build/ s3://YOUR_BUCKET_NAME --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Environment Variables

The following environment variables are injected at build time:

- `VITE_API_URL` - Backend API endpoint
- `VITE_COGNITO_USER_POOL_ID` - AWS Cognito user pool ID  
- `VITE_COGNITO_CLIENT_ID` - AWS Cognito client ID

## Troubleshooting

### Build Issues
- Check that all environment variables are set correctly
- Verify Node.js version compatibility (requires Node 18+)

### Deployment Issues
- Verify AWS credentials have sufficient permissions
- Check S3 bucket and CloudFront distribution exist
- Ensure bucket name in GitHub secrets matches Terraform output

### Application Issues
- Verify API endpoint is accessible
- Check Cognito configuration
- Review browser console for errors