# EdMerge Platform - System Overview

## Introduction

EdMerge is a comprehensive AI-enhanced e-learning platform developed for Afrimerge to transform digital education through intelligent, adaptive learning technologies and personalized user experiences. This document provides an overview of the system architecture, key components, and functionality.

## System Architecture

The EdMerge platform employs a modern web application architecture with the following components:

### Frontend
- **React.js**: Core library for building the user interface
- **TanStack Query (React Query)**: Data fetching and state management
- **Wouter**: Lightweight routing solution
- **Tailwind CSS with Shadcn UI**: Styling and component library
- **Vite**: Build tool and development server

### Backend
- **Node.js & Express**: Server framework
- **Passport.js**: Authentication middleware
- **Drizzle ORM**: Database ORM for PostgreSQL
- **WebSockets**: Real-time communication for interactive features

### Database
- **PostgreSQL**: Primary relational database

### External Integrations
- **Flutterwave**: Payment processing
- **Google Gemini AI**: AI-assisted learning and content generation
- **WebRTC**: Real-time video communication

## Key Components

### 1. Role-Based Access Control

The platform implements a comprehensive role-based system with five distinct user types:

- **Students**: Categorized into primary, secondary, tertiary, and individual levels
- **Tutors**: Create and manage courses, receive payments
- **Mentors**: Provide guidance through the Global Mentorship Network
- **Researchers**: Access and contribute to educational research
- **Administrators**: Manage the platform, generate subscription keys, etc.

### 2. Course Management System

- Course creation and editing
- Section and materials management
- Interactive content delivery
- Real-time progress tracking
- Certificate generation

### 3. Payment System

- Flutterwave integration for secure payments
- Revenue sharing (70% to tutors, 30% to platform)
- Tutor withdrawals
- Subscription management

### 4. Subscription System

- Tiered subscription model (Basic: $3, Premium: $10)
- Three-month access periods
- Subscription key generation and management
- Cross-device access via subscription keys

### 5. Global Mentorship Network

- Mentor-student matching
- Scheduled mentoring sessions
- Feedback and rating system
- Resource sharing

### 6. Interactive Learning Tools

- Virtual classrooms with live interactions
- Real-time coding features
- AI-powered tutoring assistance
- End-to-end encrypted communication

### 7. CV Generator

- Professional CV templates
- Easy-to-use creation interface
- Watermark-free PDF generation
- Optional profile picture upload

## Data Flow

1. **Authentication Flow**:
   - User registers or logs in
   - System validates credentials and issues session
   - Role-specific dashboard is presented

2. **Course Creation Flow**:
   - Tutor creates course with details
   - Tutor adds sections and learning materials
   - System makes course available based on status

3. **Enrollment Flow**:
   - Student browses available courses
   - Student enrolls in desired course
   - System grants access and tracks progress

4. **Payment Flow**:
   - Student selects paid course
   - Flutterwave processes payment
   - System allocates 30% to platform, 70% to tutor
   - Student gains access to course

5. **Subscription Flow**:
   - User selects subscription tier
   - Payment is processed
   - System activates subscription for three months
   - User can access subscription-gated features

## Technical Implementation Details

### Database Schema

The database schema includes tables for:
- Users and authentication
- Courses, sections, and materials
- Enrollments and progress tracking
- Payments and financial transactions
- Subscriptions and subscription keys
- Live sessions and mentorships
- CV templates and user-generated CVs

### API Endpoints

The system exposes RESTful API endpoints for:
- User management (`/api/user`, `/api/register`, `/api/login`)
- Course operations (`/api/courses`, `/api/courses/:id`)
- Enrollment handling (`/api/enrollments`)
- Payment processing (`/api/payments`)
- Subscription management (`/api/subscriptions`)
- Analytics and reporting (`/api/analytics`)

### Real-time Features

Real-time capabilities are implemented using WebSockets for:
- Live class sessions
- Interactive polls and quizzes
- Chat functionality
- Notifications

### Security Measures

The platform implements several security features:
- Password hashing with salt using scrypt
- Session-based authentication
- HTTPS for all communications
- Input validation and sanitization
- Role-based permission checks
- End-to-end encryption for sensitive communications

## Deployment Architecture

The application can be deployed in various configurations:

### Development Environment
- Local development server
- Local PostgreSQL database
- In-memory session store

### Production Environment
- Cloud-hosted Node.js application
- Managed PostgreSQL database
- Redis session store
- CDN for static assets
- Load balancing for horizontal scaling

## Monitoring and Analytics

The platform includes monitoring capabilities for:
- User engagement and activity
- Course completion rates
- Payment transaction volume
- System performance metrics
- Error tracking and reporting

## Extensibility

The EdMerge platform is designed for extensibility with:
- Modular component architecture
- Well-defined API interfaces
- Support for third-party integrations
- Configurable features based on environment variables

## Conclusion

The EdMerge platform represents a comprehensive solution for digital education with a focus on personalization, interaction, and AI-enhanced learning. Its architecture balances scalability, performance, and feature richness to deliver an exceptional educational experience.