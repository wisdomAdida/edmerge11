# EdMerge Platform - Database Setup Guide

This document provides a comprehensive guide for setting up, configuring, and maintaining the PostgreSQL database for the EdMerge E-Learning Platform.

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Installation Steps](#installation-steps)
3. [Schema Creation](#schema-creation)
4. [Data Relationships](#data-relationships)
5. [Initial Seed Data](#initial-seed-data)
6. [Backup and Restore](#backup-and-restore)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)

## Database Architecture

The EdMerge platform uses PostgreSQL as its primary database system. The database schema consists of several interconnected tables that store information about users, courses, enrollments, payments, and other educational resources.

### Key Database Tables

- **Users**: Stores user information with role-based access control
- **Courses**: Contains course details including content, pricing, and metadata
- **Enrollments**: Tracks student enrollments in courses
- **Course Sections**: Organizes course content into logical sections
- **Course Materials**: Stores individual learning resources within sections
- **Payments**: Records payment transactions for courses
- **Withdrawals**: Manages tutor withdrawal requests
- **Subscription Plans**: Defines available subscription tiers
- **User Subscriptions**: Tracks user subscription status
- **Subscription Keys**: Manages subscription activation keys
- **Live Classes**: Schedules for virtual classroom sessions
- **Mentorships**: Tracks mentor-student relationships
- **CV Templates**: Stores templates for the CV generator
- **User CVs**: Contains user-generated CVs

## Installation Steps

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

## Schema Creation

The EdMerge platform uses Drizzle ORM for database schema management. The schema is defined in `shared/schema.ts`.

### Automatic Schema Creation

The simplest way to create the schema is to use the provided npm script:

```bash
npm run db:push
```

This will automatically create all necessary tables, indexes, and relationships based on the schema definition in the codebase.

### Manual Schema Creation (Alternative)

If you need to manually create the schema, you can use the following SQL statements:

```sql
-- Users Table
CREATE TYPE user_role AS ENUM ('student', 'tutor', 'mentor', 'researcher', 'admin');
CREATE TYPE student_level AS ENUM ('primary', 'secondary', 'tertiary', 'individual');
CREATE TYPE subscription_type AS ENUM ('none', 'basic', 'premium');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  student_level student_level,
  profile_image VARCHAR(255),
  bio TEXT,
  subscription_type subscription_type NOT NULL DEFAULT 'none',
  subscription_expires_at TIMESTAMP,
  library_access_id VARCHAR(255),
  tutor_rating DECIMAL(3,2),
  tutor_rating_count INTEGER,
  mentor_rating DECIMAL(3,2),
  mentor_rating_count INTEGER,
  last_active_at TIMESTAMP,
  notification_settings JSONB,
  preference_settings JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Courses Table
CREATE TYPE course_level AS ENUM ('primary', 'secondary', 'tertiary', 'individual');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tutor_id INTEGER NOT NULL REFERENCES users(id),
  category VARCHAR(255) NOT NULL,
  level course_level NOT NULL,
  is_free BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  cover_image VARCHAR(255),
  status course_status DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Course Sections Table
CREATE TABLE course_sections (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Course Materials Table
CREATE TYPE material_type AS ENUM ('link', 'video', 'document', 'pdf', 'quiz', 'assignment');

CREATE TABLE course_materials (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES course_sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type material_type NOT NULL,
  url VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER,
  order_number INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Enrollments Table
CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Payments Table
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  amount DECIMAL(10,2) NOT NULL,
  transaction_id VARCHAR(255) NOT NULL,
  admin_commission DECIMAL(10,2) NOT NULL,
  tutor_amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals Table
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER NOT NULL REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status payment_status DEFAULT 'pending',
  transaction_id VARCHAR(255),
  withdrawal_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Plans Table
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(50) DEFAULT 'USD',
  duration_months INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Subscriptions Table
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  transaction_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Keys Table
CREATE TYPE key_status AS ENUM ('active', 'expired', 'used', 'revoked');

CREATE TABLE subscription_keys (
  id SERIAL PRIMARY KEY,
  key_value VARCHAR(255) NOT NULL UNIQUE,
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  user_id INTEGER REFERENCES users(id),
  status key_status NOT NULL DEFAULT 'active',
  valid_until TIMESTAMP,
  redeemed_at TIMESTAMP,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Live Classes Table
CREATE TYPE class_status AS ENUM ('cancelled', 'scheduled', 'live', 'ended');

CREATE TABLE live_classes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tutor_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  scheduled_start_time TIMESTAMP NOT NULL,
  scheduled_end_time TIMESTAMP NOT NULL,
  actual_start_time TIMESTAMP,
  actual_end_time TIMESTAMP,
  status class_status DEFAULT 'scheduled',
  stream_url VARCHAR(255),
  recording_url VARCHAR(255),
  room_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Mentorships Table
CREATE TABLE mentorships (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES users(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CV Templates Table
CREATE TYPE template_type AS ENUM ('classic', 'modern', 'creative', 'professional', 'academic', 'minimalist');

CREATE TABLE cv_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url VARCHAR(255) NOT NULL,
  type template_type,
  structure JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- User CVs Table
CREATE TABLE user_cvs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  template_id INTEGER NOT NULL REFERENCES cv_templates(id),
  name VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  pdf_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- Create indexes for performance optimization
CREATE INDEX idx_courses_tutor_id ON courses(tutor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_materials_course_id ON course_materials(course_id);
CREATE INDEX idx_materials_section_id ON course_materials(section_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_course_id ON payments(course_id);
CREATE INDEX idx_withdrawals_tutor_id ON withdrawals(tutor_id);
CREATE INDEX idx_live_classes_course_id ON live_classes(course_id);
CREATE INDEX idx_live_classes_tutor_id ON live_classes(tutor_id);
CREATE INDEX idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_student_id ON mentorships(student_id);
CREATE INDEX idx_user_cvs_user_id ON user_cvs(user_id);
CREATE INDEX idx_user_cvs_template_id ON user_cvs(template_id);
```

## Data Relationships

The EdMerge database schema includes the following key relationships:

1. **One-to-Many Relationships**:
   - Users -> Courses (One tutor can create many courses)
   - Courses -> Course Sections (One course has many sections)
   - Course Sections -> Course Materials (One section has many materials)
   - Users -> Enrollments (One student can enroll in many courses)
   - Courses -> Enrollments (One course can have many students enrolled)
   - Users -> Payments (One user can make many payments)
   - Users -> Withdrawals (One tutor can make many withdrawals)
   - Subscription Plans -> User Subscriptions (One plan can have many subscribers)

2. **Many-to-Many Relationships**:
   - Users <-> Courses (through Enrollments)
   - Users <-> Users (through Mentorships, as mentor and student)

## Initial Seed Data

To bootstrap the application with initial data, you can run seed scripts to populate essential tables.

### Default Admin User

```sql
INSERT INTO users (
  username, 
  email, 
  password, 
  first_name, 
  last_name, 
  role, 
  subscription_type
) VALUES (
  'admin', 
  'admin@edmerge.com', 
  '6fa9fd8e2c08518e31f3738806fee9eb78c14129c1506cc1fa653aa1515d2cae.c0cae3f0f25e89b9', -- admin123
  'EdMerge', 
  'Admin', 
  'admin', 
  'premium'
);
```

### Default Subscription Plans

```sql
INSERT INTO subscription_plans (
  name, 
  description, 
  price, 
  currency, 
  duration_months, 
  features
) VALUES 
(
  'Basic Plan', 
  'Access to basic educational resources and features', 
  3.00, 
  'USD', 
  3, 
  '["Access to all courses", "Download course materials", "Interactive quizzes", "Course completion certificates"]'
),
(
  'Premium Plan', 
  'Complete access to all platform features including live sessions', 
  10.00, 
  'USD', 
  3, 
  '["All Basic Plan features", "Live tutoring sessions", "Mentor matching", "Priority support", "Ad-free experience", "Advanced AI resources"]'
);
```

### Sample CV Templates

```sql
INSERT INTO cv_templates (
  name, 
  description, 
  thumbnail_url, 
  type, 
  structure
) VALUES 
(
  'Professional Resume', 
  'Clean, formal design for corporate positions', 
  '/assets/cv_templates/professional_thumb.png', 
  'professional', 
  '{
    "sections": [
      {"type": "header", "fields": ["name", "title", "contact"]},
      {"type": "summary", "fields": ["professionalSummary"]},
      {"type": "experience", "fields": ["company", "position", "duration", "description"]},
      {"type": "education", "fields": ["institution", "degree", "year"]},
      {"type": "skills", "fields": ["skillList"]}
    ],
    "colors": {
      "primary": "#2c3e50",
      "secondary": "#3498db",
      "background": "#ffffff",
      "text": "#333333"
    },
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans"
    }
  }'
),
(
  'Creative Portfolio', 
  'Vibrant design for creative professionals', 
  '/assets/cv_templates/creative_thumb.png', 
  'creative', 
  '{
    "sections": [
      {"type": "header", "fields": ["name", "title", "contact", "photo"]},
      {"type": "introduction", "fields": ["shortBio"]},
      {"type": "portfolio", "fields": ["projects"]},
      {"type": "experience", "fields": ["role", "company", "duration", "achievements"]},
      {"type": "skills", "fields": ["technicalSkills", "softSkills"]},
      {"type": "education", "fields": ["institution", "qualification", "year"]}
    ],
    "colors": {
      "primary": "#9b59b6",
      "secondary": "#e74c3c",
      "background": "#f9f9f9",
      "text": "#34495e"
    },
    "fonts": {
      "heading": "Poppins",
      "body": "Roboto"
    }
  }'
);
```

## Backup and Restore

### Creating Database Backups

Regular backups should be performed to prevent data loss. Use the following command to create a backup:

```bash
pg_dump -U edmerge_user -d edmerge > edmerge_backup_$(date +%Y%m%d).sql
```

For automated backups, create a cron job:

```bash
0 2 * * * /usr/bin/pg_dump -U edmerge_user -d edmerge > /path/to/backup/edmerge_backup_$(date +\%Y\%m\%d).sql
```

### Restoring from Backup

To restore a database from a backup file:

```bash
psql -U edmerge_user -d edmerge < edmerge_backup_20250402.sql
```

## Performance Optimization

For optimal database performance, consider the following:

### Indexing Strategy

Indexes have been created on frequently queried columns. Monitor query performance and add additional indexes as needed:

```sql
-- Example: Add index for user search by name
CREATE INDEX idx_users_name ON users(first_name, last_name);
```

### Query Optimization

1. Use the `EXPLAIN ANALYZE` command to understand query execution plans:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM courses WHERE level = 'tertiary' AND is_free = true;
   ```

2. Use proper joins instead of nested queries
3. Limit results when querying large datasets

### Connection Pooling

For production environments, implement connection pooling to efficiently manage database connections:

```javascript
// Example configuration in db.ts
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);
export const db = drizzle(pool, { schema });
```

## Troubleshooting

### Common Issues and Solutions

1. **Connection Problems**:
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   
   # Verify connection details
   psql -U edmerge_user -d edmerge -h localhost
   ```

2. **Permission Issues**:
   ```sql
   -- Grant proper permissions
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO edmerge_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO edmerge_user;
   ```

3. **Performance Problems**:
   - Check for missing indexes
   - Optimize slow queries
   - Consider database server tuning (shared_buffers, work_mem, etc.)

4. **Data Integrity Issues**:
   - Use transactions for critical operations
   - Implement proper constraints and validation