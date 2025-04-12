# Edmerge Platform cPanel Deployment Guide

This document provides detailed instructions for deploying the Edmerge AI-powered E-learning platform to a cPanel hosting environment.

## Prerequisites

Before beginning the deployment process, you will need:

1. A cPanel hosting account with the following features:
   - Node.js support (Version 18+ recommended)
   - PostgreSQL database support
   - SSH access (recommended for easier deployment)
   - HTTPS/SSL certificate support

2. The following information ready:
   - cPanel login credentials
   - Database credentials (will be created during setup)
   - Domain or subdomain for deployment

## Step 1: Database Setup

### Creating the PostgreSQL Database

1. Log in to your cPanel account.
2. Navigate to the "Databases" section and find "PostgreSQL Databases".
3. Create a new database:
   - Database Name: `edmerge_db` (or your preferred name)
   - Click "Create Database"

4. Create a database user:
   - Username: `edmerge_user` (or your preferred name)
   - Password: Create a strong password
   - Click "Create User"

5. Add the user to the database with all privileges:
   - Select the database and user you just created
   - Grant all privileges
   - Click "Add User to Database"

6. Note down the database connection information:
   - Hostname: Usually `localhost` or provided by your host
   - Port: Usually `5432` (standard PostgreSQL port)
   - Database name: The name you created
   - Username: The user you created
   - Password: The password you set

## Step 2: Uploading Project Files

### Method 1: Using cPanel File Manager

1. Create a ZIP archive of your project folder
2. Log in to cPanel and open "File Manager"
3. Navigate to the `public_html` directory (or a subdirectory if using a subdomain)
4. Click "Upload" and select your ZIP file
5. Once uploaded, select the ZIP file and click "Extract"
6. Extract the files to your desired directory

### Method 2: Using FTP (Recommended for Large Projects)

1. Use an FTP client like FileZilla
2. Connect to your server using your cPanel FTP credentials
3. Navigate to the `public_html` directory
4. Upload the entire project folder
5. Ensure file permissions are set correctly:
   - Directories: 755 (`drwxr-xr-x`)
   - Files: 644 (`rw-r--r--`)

## Step 3: Node.js Setup

Most cPanel hosts provide Node.js through the "Setup Node.js App" interface:

1. In cPanel, find and open "Setup Node.js App"
2. Click "Create Application"
3. Configure your application:
   - Node.js version: Select 18.x or higher
   - Application mode: Production
   - Application root: Path to your uploaded project (e.g., `/home/username/public_html/edmerge`)
   - Application URL: Your domain or subdomain
   - Application startup file: `server/index.js`
   - Save the configuration

## Step 4: Environment Configuration

1. Create a `.env` file in your project root with the following variables:

```
# Database Configuration
DATABASE_URL=postgres://edmerge_user:your_password@localhost:5432/edmerge_db

# Session Secret
SESSION_SECRET=your_secure_session_secret

# Flutterwave API Keys
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key

# Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=8080
NODE_ENV=production
```

2. Adjust the file permissions:
   ```
   chmod 600 .env
   ```

## Step 5: Installing Dependencies and Building the Project

Connect to your server via SSH or use the cPanel Terminal:

1. Navigate to your project directory:
   ```
   cd /home/username/public_html/edmerge
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the frontend:
   ```
   npm run build
   ```

4. Create the database schema:
   ```
   npm run db:push
   ```

## Step 6: Setting Up PM2 Process Manager (Recommended)

PM2 ensures your Node.js application stays running:

1. Install PM2 globally:
   ```
   npm install -g pm2
   ```

2. Start your application with PM2:
   ```
   pm2 start server/index.js --name edmerge
   ```

3. Configure PM2 to start on server reboot:
   ```
   pm2 startup
   pm2 save
   ```

## Step 7: Configuring Nginx or Apache (if necessary)

Your cPanel provider typically handles this configuration, but you may need to create or modify `.htaccess` for Apache or Nginx configs for specific routing requirements.

For Apache, create or update `.htaccess` in your project root:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Step 8: Setting Up SSL Certificate

1. In cPanel, navigate to "SSL/TLS" section
2. Use "Let's Encrypt SSL" or another SSL provider to secure your domain
3. Follow the prompts to install the certificate for your domain

## Step 9: Database Backup and Maintenance

Set up regular database backups:

1. In cPanel, navigate to "Backup" or "Backup Wizard"
2. Configure scheduled database backups
3. Optionally, set up offsite backup locations

## Troubleshooting Common Issues

### Application Not Starting

1. Check the Node.js application logs in cPanel
2. Verify the startup file path is correct
3. Check for syntax errors in your code
4. Verify environment variables are set correctly

### Database Connection Errors

1. Verify database credentials in your `.env` file
2. Check if the PostgreSQL service is running
3. Verify the database user has proper permissions
4. Check for any IP restrictions on database connections

### Missing Dependencies

1. Check npm logs for errors
2. Try reinstalling dependencies: `npm ci`
3. Verify Node.js version compatibility

## Post-Deployment Checklist

- [ ] Verify application runs correctly
- [ ] Test user registration and login
- [ ] Test payment processing with Flutterwave
- [ ] Test course enrollment and access
- [ ] Check AI tutor functionality
- [ ] Test CV generator
- [ ] Verify file uploads work correctly
- [ ] Verify WebSocket connections for chat
- [ ] Test responsive design on mobile devices
- [ ] Check SSL is working properly (https://)

## Performance Optimization

1. Enable browser caching via `.htaccess`:
   ```
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/gif "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType application/pdf "access plus 1 month"
     ExpiresByType application/javascript "access plus 1 month"
     ExpiresDefault "access plus 2 days"
   </IfModule>
   ```

2. Enable GZIP compression:
   ```
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/plain
     AddOutputFilterByType DEFLATE text/html
     AddOutputFilterByType DEFLATE text/xml
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE application/xml
     AddOutputFilterByType DEFLATE application/xhtml+xml
     AddOutputFilterByType DEFLATE application/rss+xml
     AddOutputFilterByType DEFLATE application/javascript
     AddOutputFilterByType DEFLATE application/x-javascript
   </IfModule>
   ```

## Monitoring and Maintenance

1. Set up application monitoring using PM2:
   ```
   pm2 install pm2-server-monit
   ```

2. Schedule regular database maintenance:
   ```
   # Add to crontab
   0 2 * * 0 /usr/bin/psql -U edmerge_user -d edmerge_db -c "VACUUM ANALYZE;"
   ```

3. Set up error logging and notification:
   ```
   # In your Node.js app, use a logging service
   pm2 install pm2-logrotate
   ```

## Security Considerations

1. Implement rate limiting for API endpoints
2. Ensure proper input validation throughout the application
3. Regularly update dependencies with security patches
4. Configure Content Security Policy headers
5. Enable HTTP Strict Transport Security (HSTS)
6. Use secure cookies for sessions

## Additional Resources

- [cPanel Documentation](https://docs.cpanel.net/)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)