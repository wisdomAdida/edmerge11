import TutorialSystem, { TutorialStep } from './TutorialSystem';

const tutorialSteps: TutorialStep[] = [
  {
    target: '.student-overview-section',
    title: 'Dashboard Overview',
    content: 'Welcome to your student dashboard! Here you can see your enrolled courses, upcoming classes, and overall progress at a glance.'
  },
  {
    target: '.student-courses-section',
    title: 'My Courses',
    content: 'Access all your enrolled courses here. You can resume your learning, check your progress, and explore course materials.'
  },
  {
    target: '.student-schedule-section',
    title: 'Class Schedule',
    content: 'View your upcoming live classes and sessions. Never miss a class with our calendar integration and notifications.'
  },
  {
    target: '.student-assignments-section',
    title: 'Assignments & Quizzes',
    content: 'Track your assignments, quizzes, and their deadlines. Submit your work and get feedback from tutors.'
  },
  {
    target: '.student-progress-section',
    title: 'Learning Progress',
    content: 'Monitor your learning journey with detailed analytics on course completion, quiz scores, and skill development.'
  },
  {
    target: '.student-community-section',
    title: 'Learning Communities',
    content: 'Join subject-specific study groups and connect with fellow students to enhance your learning experience.'
  },
  {
    target: '.student-mentorship-section',
    title: 'Global Mentorship',
    content: 'Connect with professional mentors in your field of study for personalized guidance and career advice.'
  },
  {
    target: '.student-resources-section',
    title: 'Learning Resources',
    content: 'Access additional learning materials, recommended readings, and supplementary resources for your courses.'
  }
];

export default function StudentDashboardTutorial() {
  return (
    <TutorialSystem
      steps={tutorialSteps}
      storageKey="student-dashboard-tutorial-completed"
      defaultShown={true}
    />
  );
}