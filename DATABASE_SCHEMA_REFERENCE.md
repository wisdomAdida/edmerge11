# EdMerge Database Schema Reference

This document provides a comprehensive reference for the EdMerge platform database schema. Use this as a guide for understanding data relationships and for any custom queries or database operations.

## Database Tables Structure

### Users Table (`users`)

Stores all user accounts regardless of role.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| first_name | TEXT | User's first name |
| last_name | TEXT | User's last name |
| username | TEXT | Unique username for login |
| email | TEXT | User's email address (unique) |
| password | TEXT | Hashed password |
| role | ENUM | User role: student, tutor, mentor, researcher, admin |
| student_level | ENUM | For students: primary, secondary, tertiary, individual |
| profile_image | TEXT | URL to profile image |
| bio | TEXT | User biography/description |
| subscription_type | ENUM | none, basic, premium |
| subscription_status | ENUM | active, inactive, expired, cancelled |
| subscription_start_date | TIMESTAMP | When subscription began |
| subscription_end_date | TIMESTAMP | When subscription expires |
| flutterwave_customer_id | VARCHAR(100) | Payment processor customer ID |
| flutterwave_subscription_id | VARCHAR(100) | Payment processor subscription ID |
| library_access_id | VARCHAR(50) | Access ID for library resources |
| cv_generations_count | INTEGER | Count of CV generations used |
| notification_settings | TEXT | User notification preferences |
| preference_settings | TEXT | General user preferences |
| created_at | TIMESTAMP | Account creation timestamp |
| updated_at | TIMESTAMP | Last account update timestamp |

### Courses Table (`courses`)

Stores all course information.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| tutor_id | INTEGER | References users.id - course creator |
| title | TEXT | Course title |
| description | TEXT | Course description |
| cover_image | TEXT | URL to course cover image |
| price | REAL | Course price in currency units |
| is_free | BOOLEAN | Whether the course is free |
| status | ENUM | draft, published, archived |
| category | TEXT | Course category |
| level | ENUM | primary, secondary, tertiary, individual |
| created_at | TIMESTAMP | Course creation timestamp |
| updated_at | TIMESTAMP | Last course update timestamp |

### Course Sections Table (`course_sections`)

Organizes course content into logical sections.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| course_id | INTEGER | References courses.id |
| title | TEXT | Section title |
| description | TEXT | Section description |
| order | INTEGER | Display order within course |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Course Materials Table (`course_materials`)

Individual learning items within course sections.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| course_id | INTEGER | References courses.id |
| section_id | INTEGER | References course_sections.id |
| title | TEXT | Material title |
| description | TEXT | Material description |
| type | ENUM | video, document, pdf, quiz, assignment, link |
| url | TEXT | URL to the material content |
| file_size | INTEGER | Size in bytes if applicable |
| duration | INTEGER | Length in seconds if applicable |
| order | INTEGER | Display order within section |
| is_required | BOOLEAN | Whether completion is required for course progress |
| thumbnail_url | TEXT | URL to material thumbnail |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Enrollments Table (`enrollments`)

Tracks student enrollment in courses.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | References users.id |
| course_id | INTEGER | References courses.id |
| progress | REAL | Percentage of course completed |
| is_completed | BOOLEAN | Whether the course is completed |
| enrolled_at | TIMESTAMP | Enrollment timestamp |
| updated_at | TIMESTAMP | Last activity timestamp |

### Payments Table (`payments`)

Records course payment transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | References users.id |
| course_id | INTEGER | References courses.id |
| amount | REAL | Payment amount |
| transaction_id | TEXT | External payment processor transaction ID |
| status | ENUM | pending, completed, failed, refunded |
| admin_commission | REAL | Platform commission amount (30%) |
| tutor_amount | REAL | Tutor's share amount (70%) |
| payment_date | TIMESTAMP | Transaction timestamp |

### CV Payments Table (`cv_payments`)

Tracks payments for CV generation service.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | References users.id |
| amount | REAL | Payment amount |
| transaction_id | TEXT | External payment processor transaction ID |
| currency | VARCHAR(10) | Currency code (default: NGN) |
| status | ENUM | pending, completed, failed, refunded |
| cv_id | INTEGER | References user_cvs.id (optional) |
| created_at | TIMESTAMP | Creation timestamp |
| completed_at | TIMESTAMP | Payment completion timestamp |

### Withdrawals Table (`withdrawals`)

Records tutor withdrawal requests and completions.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| tutor_id | INTEGER | References users.id |
| amount | REAL | Withdrawal amount |
| transaction_id | TEXT | External payment processor transaction ID |
| status | ENUM | pending, completed, failed, refunded |
| withdrawal_date | TIMESTAMP | Transaction timestamp |

### Mentorship Table (`mentorships`)

Tracks mentor-student relationships.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| mentor_id | INTEGER | References users.id |
| student_id | INTEGER | References users.id |
| status | TEXT | pending, active, completed, declined |
| start_date | TIMESTAMP | Start of mentorship |
| end_date | TIMESTAMP | End of mentorship |
| created_at | TIMESTAMP | Creation timestamp |

### Subscription Plans Table (`subscription_plans`)

Available subscription tiers and their details.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(50) | Plan name |
| description | TEXT | Plan description |
| price | REAL | Subscription price |
| currency | VARCHAR(10) | Currency code (default: USD) |
| duration_months | INTEGER | Subscription period in months |
| features | TEXT[] | Array of included features |
| created_at | TIMESTAMP | Creation timestamp |

### Subscriptions Table (`subscriptions`)

Records user subscription transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | References users.id |
| plan_id | INTEGER | References subscription_plans.id |
| transaction_id | VARCHAR(100) | External transaction reference |
| amount | REAL | Payment amount |
| status | VARCHAR(50) | pending, active, cancelled, expired |
| start_date | TIMESTAMP | Subscription start timestamp |
| end_date | TIMESTAMP | Subscription end timestamp |
| created_at | TIMESTAMP | Creation timestamp |

### Subscription Keys Table (`subscription_keys`)

Pre-generated keys for subscription activation.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| key_value | VARCHAR(64) | Unique subscription key |
| plan_id | INTEGER | References subscription_plans.id |
| user_id | INTEGER | References users.id (null if unused) |
| created_by_id | INTEGER | References users.id (admin who created) |
| status | ENUM | active, used, revoked, expired |
| description | TEXT | Key description/purpose |
| valid_until | TIMESTAMP | Key expiration timestamp |
| redeemed_at | TIMESTAMP | When key was used |
| created_at | TIMESTAMP | Creation timestamp |

### Research Projects Table (`research_projects`)

Research projects created by researchers.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| researcher_id | INTEGER | References users.id |
| title | TEXT | Project title |
| description | TEXT | Project description |
| status | TEXT | draft, active, completed, on_hold |
| category | TEXT | Research category |
| tags | TEXT[] | Array of research tags |
| funding_source | TEXT | Funding information |
| budget | REAL | Project budget |
| start_date | TIMESTAMP | Project start date |
| end_date | TIMESTAMP | Project end date |
| collaborators | INTEGER | Number of collaborators |
| is_public | BOOLEAN | Whether project is publicly visible |
| allow_collaborators | BOOLEAN | Whether project accepts collaborators |
| published_at | TIMESTAMP | Publication timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Live Classes Table (`live_classes`)

Schedules and details for live teaching sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| tutor_id | INTEGER | References users.id |
| course_id | INTEGER | References courses.id |
| title | TEXT | Class title |
| description | TEXT | Class description |
| status | ENUM | scheduled, live, ended, cancelled |
| scheduled_start_time | TIMESTAMP | Planned start time |
| scheduled_end_time | TIMESTAMP | Planned end time |
| actual_start_time | TIMESTAMP | Actual start time |
| actual_end_time | TIMESTAMP | Actual end time |
| stream_url | TEXT | Video meeting URL |
| room_id | TEXT | Meeting room identifier |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### CV Templates Table (`cv_templates`)

Available templates for CV generation.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | TEXT | Template name |
| description | TEXT | Template description |
| thumbnail_url | TEXT | URL to template preview image |
| type | ENUM | classic, modern, creative, professional, academic, minimalist |
| structure | JSONB | Template structure definition |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### User CVs Table (`user_cvs`)

CVs created by users.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | References users.id |
| template_id | INTEGER | References cv_templates.id |
| name | TEXT | CV name/title |
| content | JSONB | CV content data |
| pdf_url | TEXT | URL to generated PDF |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### Chat Messages Table (`chat_messages`)

Stores messages for various communication channels.

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| user_id | INTEGER | References users.id |
| room_id | TEXT | Chat room identifier |
| message | TEXT | Message content |
| type | ENUM | text, image, file, system |
| file_url | TEXT | URL to attached file if applicable |
| created_at | TIMESTAMP | Timestamp when message was sent |

## Database Relationships

### Key Relationships

1. **Users to Courses** (One-to-Many):
   - A tutor can create multiple courses
   - courses.tutor_id → users.id

2. **Courses to Sections** (One-to-Many):
   - A course contains multiple sections
   - course_sections.course_id → courses.id

3. **Sections to Materials** (One-to-Many):
   - A section contains multiple materials
   - course_materials.section_id → course_sections.id

4. **Users to Enrollments** (One-to-Many):
   - A student can enroll in multiple courses
   - enrollments.user_id → users.id

5. **Courses to Enrollments** (One-to-Many):
   - A course can have multiple student enrollments
   - enrollments.course_id → courses.id

6. **Users to Payments** (One-to-Many):
   - A user can make multiple payments
   - payments.user_id → users.id

7. **Mentorship Relationship** (Many-to-Many):
   - Mentors can have multiple students
   - Students can have multiple mentors
   - mentorships.mentor_id → users.id
   - mentorships.student_id → users.id

## Database Enums

The schema uses several enumerated types for consistency:

1. `user_role`: student, tutor, mentor, researcher, admin
2. `student_level`: primary, secondary, tertiary, individual
3. `course_status`: draft, published, archived
4. `payment_status`: pending, completed, failed, refunded
5. `subscription_status`: active, inactive, expired, cancelled
6. `subscription_type`: none, basic, premium
7. `live_class_status`: scheduled, live, ended, cancelled
8. `chat_message_type`: text, image, file, system
9. `course_content_type`: video, document, pdf, quiz, assignment, link
10. `subscription_key_status`: active, used, revoked, expired
11. `cv_template_type`: classic, modern, creative, professional, academic, minimalist

## Query Examples

### Get All Courses for a Student's Level

```sql
SELECT * FROM courses 
WHERE level = 'primary' AND status = 'published'
ORDER BY created_at DESC;
```

### Get Tutor Earnings

```sql
SELECT SUM(tutor_amount) as total_earnings 
FROM payments 
WHERE status = 'completed' 
AND course_id IN (SELECT id FROM courses WHERE tutor_id = 123);
```

### Get Student Course Progress

```sql
SELECT c.title, e.progress, e.is_completed, e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.user_id = 456
ORDER BY e.enrolled_at DESC;
```

### Get Active Mentorships

```sql
SELECT 
  m.id,
  student.first_name || ' ' || student.last_name as student_name,
  mentor.first_name || ' ' || mentor.last_name as mentor_name,
  m.start_date
FROM mentorships m
JOIN users student ON m.student_id = student.id
JOIN users mentor ON m.mentor_id = mentor.id
WHERE m.status = 'active';
```

## Notes for Developers

1. Always use parameterized queries to prevent SQL injection.
2. Use transactions for operations that modify multiple tables.
3. Consider index performance for frequently queried columns.
4. The database uses foreign key constraints to maintain data integrity.
5. Timestamp fields (created_at, updated_at) are automatically managed.
6. JSON fields (like content in user_cvs and structure in cv_templates) should be validated before insertion.
7. For large-scale deployments, consider table partitioning for chat_messages and payments tables.
8. Regular database backups are essential, especially before schema changes.

## Database Maintenance

Regular maintenance tasks:

1. Run `VACUUM ANALYZE` weekly to optimize performance.
2. Monitor and index frequently accessed columns.
3. Set up regular database backups.
4. Periodically review and optimize slow queries.
5. Implement a database migration strategy for schema updates.