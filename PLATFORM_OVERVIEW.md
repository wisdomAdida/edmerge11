# EdMerge Platform Overview

## Introduction

EdMerge is a comprehensive AI-powered e-learning platform designed to revolutionize education in Africa. The platform leverages advanced technologies to create personalized, engaging, and adaptive learning experiences for students across different educational levels (primary, secondary, tertiary, and individual learners).

## Core Features

### 1. Multi-Role User System

The platform supports multiple user roles with specialized interfaces and capabilities:

- **Students**: Categorized by educational level (primary, secondary, tertiary, individual)
- **Tutors**: Create and manage courses, interact with students, receive payments
- **Mentors**: Provide personalized guidance to students
- **Researchers**: Create and collaborate on academic research projects
- **Administrators**: Manage the platform, users, and payment commissions

### 2. AI-Powered Learning

- **AI Tutor**: Contextually aware tutoring support tailored to student's educational level
- **Educational Content Recommendation**: AI suggestions for relevant learning materials
- **Learning Analytics**: Real-time tracking of student progress and adaptive learning paths

### 3. Course Management

- **Course Creation & Management**: Tutors can create, edit, and manage courses with rich content
- **Section & Material Organization**: Structured learning content with various types of materials
- **Live Class Integration**: Google Meet integration for live class sessions

### 4. Payment System

- **Flutterwave Integration**: Secure payment processing for course purchases and subscriptions
- **Revenue Sharing**: 70% of course payments go to tutors, 30% to platform administrators
- **Withdrawal System**: Tutors can withdraw their earnings to their bank accounts
- **Subscription Tiers**: Basic ($3) and Enterprise ($10) with three-month access periods

### 5. CV Generator

- **Professional CV Creation**: AI-assisted CV generation with multiple templates
- **Paid Feature**: One-time payment model for CV generation service
- **Template Library**: Various professional templates to choose from

### 6. Communication Systems

- **Chat System**: Real-time messaging with WebSockets and database persistence
- **Group Chat**: Subject-specific communities for collaborative learning
- **End-to-End Encryption**: Secure communication between users

### 7. Subscription & Access Control

- **Subscription Key System**: Authentication and access control via subscription keys
- **Tiered Access**: Different subscription levels with varying features and content access

## Technical Architecture

### Frontend

- React-based single-page application with dynamic routing
- Responsive design with Tailwind CSS and Shadcn UI components
- Real-time updates using WebSockets and React Query

### Backend

- Node.js/Express API server with REST endpoints
- PostgreSQL database for persistent storage
- Drizzle ORM for database operations and schema management

### Integration

- Flutterwave API for payment processing
- Google Gemini API for AI functionality
- Google Meet for live classes
- WebSockets for real-time chat and notifications

## Database Schema

The platform uses a PostgreSQL database with a comprehensive schema:

- Users and user-related data (profiles, settings)
- Courses, sections, and educational materials
- Enrollments and progress tracking
- Payments and financial transactions
- CV generation data and templates
- Chat messages and communications
- Research projects and collaboration
- Subscriptions and access control

## Current Implementation Status

### Fully Implemented Features

- User authentication and role-based access control
- Dashboard interfaces for all user roles
- Course creation, management, and enrollment
- AI tutoring system with educational context awareness
- Payment processing and tutor earnings
- CV generator with template selection and customization
- Chat system with real-time messaging
- Subscription management and key-based access

### Recently Fixed Issues

- Navigation between dashboard sections now works without page refresh
- Course enrollment status properly reflects payment status
- Database configuration correctly implemented with all required tables
- CV payment system now properly tracks and verifies payments

## Deployment Requirements

The platform is designed to be deployed to a cPanel hosting environment with:

- Node.js runtime (v18+)
- PostgreSQL database
- HTTPS/SSL support
- WebSocket support

Detailed deployment instructions are available in the CPANEL_DEPLOYMENT.md document.

## User Journeys

### Student Journey

1. Register as a student, specifying educational level
2. Browse available courses relevant to their level
3. Enroll in free courses or pay for premium courses
4. Access course materials and track learning progress
5. Utilize AI tutor for personalized support
6. Join communities and participate in live classes
7. Connect with mentors for guidance

### Tutor Journey

1. Register as a tutor
2. Create courses with structured content and materials
3. Schedule and conduct live classes
4. Track student enrollments and progress
5. Receive payments for course sales (70% of course price)
6. Withdraw earnings through the platform
7. Monitor analytics to improve course offerings

### Admin Journey

1. Log in using admin credentials
2. Manage users across all roles
3. Create and manage subscription keys
4. Monitor platform revenue (30% commission from course sales)
5. Review and approve withdrawals
6. Access comprehensive analytics on platform usage

## Future Development Roadmap

- Enhanced analytics dashboards for all user roles
- Mobile application development
- Expanded AI capabilities for content creation
- Integration with additional educational tools and services
- Offline access to learning materials
- Advanced assessment and certification features

## Security and Compliance

- User data protection and privacy controls
- Role-based access restrictions
- Secure payment processing
- End-to-end encrypted communications
- Country-specific access controls (Nigeria-focused)

## Conclusion

EdMerge represents a comprehensive, AI-enhanced approach to e-learning, specifically designed for the African educational context. The platform brings together advanced technology with educational expertise to create a transformative learning experience for students across educational levels while providing opportunities for educators to share knowledge and generate income.