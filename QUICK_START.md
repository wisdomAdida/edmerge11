# EdMerge Platform - Quick Start Guide

This guide provides the fastest way to get the EdMerge platform up and running for development or evaluation purposes.

## Prerequisites

- Node.js (v18.x or v20.x)
- PostgreSQL (v14+)
- Git

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-organization/edmerge.git
cd edmerge
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Create a PostgreSQL Database

```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE edmerge;
CREATE USER edmerge_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE edmerge TO edmerge_user;
\q
```

## Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```
# Database Configuration
DATABASE_URL=postgresql://edmerge_user:your_password@localhost:5432/edmerge
PGUSER=edmerge_user
PGHOST=localhost
PGPASSWORD=your_password
PGDATABASE=edmerge
PGPORT=5432

# Server Configuration
PORT=5000
NODE_ENV=development
SESSION_SECRET=your_session_secret

# External APIs (optional for full functionality)
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
VITE_FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Step 5: Initialize Database

Push the schema to the database:

```bash
npm run db:push
```

## Step 6: Start the Development Server

```bash
npm run dev
```

The application should now be running at http://localhost:5000

## Step 7: Create Admin User (Optional)

For testing purposes, you can create an admin user by accessing the application and registering with the username "admin" and password "admin123".

## Step 8: Explore the Application

Visit http://localhost:5000 in your browser and navigate through the application:

1. Register a new user account or log in
2. Explore the dashboard specific to your user role
3. Create or enroll in courses
4. Test the CV generator
5. Explore the platform features based on your role

## Common Issues

### Database Connection Errors

If you encounter database connection issues:

1. Verify PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Check your `.env` file for correct credentials

3. Ensure the database exists:
   ```bash
   psql -U edmerge_user -d edmerge -h localhost
   ```

### Port Conflicts

If port 5000 is already in use:

1. Change the PORT in your `.env` file
2. Restart the server

### Missing Features

Some features require API keys for external services:

- Payment features require Flutterwave API keys
- AI features require Google Gemini API key

## Next Steps

For more detailed information, refer to:

- [Database Setup Guide](DATABASE_SETUP.md) - Comprehensive database configuration
- [Deployment Documentation](DEPLOYMENT.md) - Production deployment instructions
- [Application Overview](APPLICATION_OVERVIEW.md) - System architecture and components

## Support

For additional support, contact the development team or refer to the project documentation.