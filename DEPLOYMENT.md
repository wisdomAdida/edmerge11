# EdMerge Platform - Deployment Documentation

This document provides a comprehensive guide for deploying the EdMerge E-Learning Platform in both development and production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Development Deployment](#development-deployment)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying the EdMerge platform, ensure the following prerequisites are met:

### System Requirements

- Node.js (version 18.x or 20.x)
- PostgreSQL (version 14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 2GB RAM minimum (4GB recommended)
- 10GB disk space minimum

### Required Services

- Flutterwave account for payment processing
- Google Gemini API access (for AI features)
- Web hosting service (for production deployment)

## Database Setup

### Step 1: Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [PostgreSQL Official Website](https://www.postgresql.org/download/windows/)

### Step 2: Create Database and User

```bash
sudo -u postgres psql

CREATE DATABASE edmerge;
CREATE USER edmerge_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE edmerge TO edmerge_user;
\q
```

### Step 3: Configure Database Connection

Create a `.env` file in the root of your project with the following database configuration:

```
DATABASE_URL=postgresql://edmerge_user:your_secure_password@localhost:5432/edmerge
PGUSER=edmerge_user
PGHOST=localhost
PGPASSWORD=your_secure_password
PGDATABASE=edmerge
PGPORT=5432
```

### Step 4: Initialize Database Schema

Run the database schema creation script:

```bash
npm run db:push
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Database Configuration
DATABASE_URL=postgresql://edmerge_user:your_secure_password@localhost:5432/edmerge
PGUSER=edmerge_user
PGHOST=localhost
PGPASSWORD=your_secure_password
PGDATABASE=edmerge
PGPORT=5432

# Server Configuration
PORT=5000
NODE_ENV=production
SESSION_SECRET=your_secure_session_secret

# Payment Integration
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key

# AI Features
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Development Deployment

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-organization/edmerge.git
cd edmerge
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file using the template provided in the [Environment Variables](#environment-variables) section.

### Step 4: Initialize Database

```bash
npm run db:push
```

### Step 5: Start Development Server

```bash
npm run dev
```

The development server will be available at `http://localhost:5000`.

## Production Deployment

### Step 1: Build the Application

```bash
npm run build
```

### Step 2: Set Production Environment Variables

Ensure all required environment variables are set in your production environment.

### Method 1: Deployment to Replit

1. **Create a new Repl:**
   - Choose Node.js as the template
   - Import from GitHub repository

2. **Configure Secrets:**
   - Add all environment variables in the Secrets panel

3. **Deploy the Application:**
   - Click the "Deploy" button in the Replit interface

4. **Configure Domain (Optional):**
   - Set up a custom domain in the Replit dashboard

### Method 2: Deployment to Traditional Hosting

#### Prerequisites:
- VPS with Node.js installed
- Nginx or Apache web server
- PM2 process manager

#### Steps:

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Start the Application with PM2:**
   ```bash
   pm2 start npm --name "edmerge" -- start
   ```

3. **Configure Nginx as a Reverse Proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable HTTPS with Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

5. **Restart Nginx:**
   ```bash
   sudo systemctl restart nginx
   ```

### Method 3: Deployment to Cloud Services

#### AWS Elastic Beanstalk:

1. Install the AWS CLI and Elastic Beanstalk CLI
2. Configure your AWS credentials
3. Initialize your Elastic Beanstalk application:
   ```bash
   eb init
   ```
4. Create an environment and deploy:
   ```bash
   eb create production-environment
   ```
5. Configure environment variables in the AWS console

#### Heroku:

1. Install the Heroku CLI
2. Login to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create edmerge-app
   ```
4. Set environment variables:
   ```bash
   heroku config:set DATABASE_URL=your_database_url
   heroku config:set FLUTTERWAVE_SECRET_KEY=your_key
   # Set all other environment variables
   ```
5. Deploy the application:
   ```bash
   git push heroku main
   ```
6. Provision a PostgreSQL database:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

## Troubleshooting

### Database Connection Issues

1. Verify database credentials in `.env` file
2. Ensure PostgreSQL service is running:
   ```bash
   sudo systemctl status postgresql
   ```
3. Check network connectivity:
   ```bash
   telnet localhost 5432
   ```
4. Verify database exists:
   ```bash
   psql -U edmerge_user -d edmerge -h localhost
   ```

### Application Start Failures

1. Check for errors in logs:
   ```bash
   npm run dev
   ```
2. Verify that all environment variables are set correctly
3. Ensure all required dependencies are installed:
   ```bash
   npm install
   ```
4. Check for port conflicts:
   ```bash
   lsof -i :5000
   ```

### Payment Integration Issues

1. Verify Flutterwave API keys are correct
2. Test API connectivity:
   ```bash
   curl -X GET \
     https://api.flutterwave.com/v3/transactions \
     -H 'Authorization: Bearer YOUR_SECRET_KEY'
   ```
3. Check transaction logs in the Flutterwave dashboard

## Monitoring and Maintenance

### Regular Maintenance Tasks

1. **Database Backups:**
   ```bash
   pg_dump -U edmerge_user -d edmerge > backup_$(date +%Y%m%d).sql
   ```

2. **Log Rotation:**
   Implement log rotation for application logs

3. **Update Dependencies:**
   ```bash
   npm outdated
   npm update
   ```

4. **Security Updates:**
   ```bash
   npm audit
   npm audit fix
   ```

### Monitoring

1. **Server Monitoring:**
   Implement monitoring using tools like PM2, New Relic, or Datadog

2. **Error Tracking:**
   Integrate an error tracking service like Sentry

3. **Performance Monitoring:**
   Use application performance monitoring (APM) tools to track response times and resource usage

4. **Database Monitoring:**
   Monitor database performance and optimize queries as needed