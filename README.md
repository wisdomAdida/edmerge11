# EdMerge Platform

![EdMerge Logo](https://i.imgur.com/placeholder-logo.png)

**EdMerge** is a premium AI-enhanced e-learning platform developed for Afrimerge to transform digital education through intelligent, adaptive learning technologies and personalized user experiences.

## 🌟 Features

- **Intelligent Role-Based Dashboards**: Tailored experiences for students, tutors, mentors, researchers, and administrators
- **Adaptive Learning Paths**: Personalized learning journeys based on student level and progress
- **Integrated Payment System**: Secure payment processing through Flutterwave
- **AI-Powered Recommendations**: Smart content suggestions and learning assistance
- **Scalable Architecture**: Supporting personalized learning for thousands of users
- **Comprehensive Course Management**: Easy-to-use tools for creating and managing educational content
- **Professional CV Generator**: Create up to 10 free professional CVs without watermarks
- **Virtual Classrooms**: Interactive learning environments with real-time collaboration
- **Global Mentorship Network**: Connect students with mentors worldwide

## 📋 Documentation

- [Quick Start Guide](QUICK_START.md) - Get up and running in minutes
- [Database Setup](DATABASE_SETUP.md) - Database configuration and management
- [Deployment Documentation](DEPLOYMENT.md) - Production deployment instructions
- [Application Overview](APPLICATION_OVERVIEW.md) - System architecture and components

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.x or v20.x)
- PostgreSQL (v14+)
- Git

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/your-organization/edmerge.git
cd edmerge

# Install dependencies
npm install

# Set up environment variables (copy from example)
cp .env.example .env

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5000` to access the application.

## 🏗️ Tech Stack

### Frontend
- React.js
- TanStack Query (React Query)
- Wouter for routing
- Tailwind CSS with Shadcn UI components
- Vite build tool

### Backend
- Node.js & Express
- PostgreSQL database
- Drizzle ORM
- Passport.js authentication
- WebSockets for real-time features

### External Services
- Flutterwave for payment processing
- Google Gemini AI for intelligent features

## 🔄 Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Registration   ├────►│    Dashboard    ├────►│  Course Access  │
│   & Login       │     │  (Role-based)   │     │  & Progression  │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Subscription  │◄────┤   Interactive   │◄────┤  Course Catalog │
│   Management    │     │  Learning Tools │     │   & Creation    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 📝 User Roles

- **Students**: Access courses, track progress, and earn certificates
- **Tutors**: Create courses, manage content, and earn revenue
- **Mentors**: Provide guidance and mentorship to students
- **Researchers**: Access educational data and contribute research
- **Administrators**: Manage platform, users, and generate subscription keys

## 🌐 Subscription Model

- **Basic Plan**: $3 for three months
  - Access to all courses
  - Download course materials
  - Interactive quizzes
  - Course completion certificates

- **Premium Plan**: $10 for three months
  - All Basic Plan features
  - Live tutoring sessions
  - Mentor matching
  - Priority support
  - Ad-free experience
  - Advanced AI resources

## 💰 Revenue Model

- 70% of course payment goes to tutors
- 30% commission for the platform
- Transparent withdrawal system for tutors

## 🔒 Security

- Secure authentication with password hashing
- Role-based access control
- End-to-end encryption for sensitive communications
- HTTPS for all data transfers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE)

## 👥 Team

- Project Manager: [Name]
- Lead Developer: [Name]
- UX/UI Designer: [Name]
- Backend Developer: [Name]
- Frontend Developer: [Name]

## 📞 Contact

For inquiries, please contact [contact@edmerge.com](mailto:contact@edmerge.com)