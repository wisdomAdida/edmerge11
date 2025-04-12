import TutorialSystem, { TutorialStep } from './TutorialSystem';

const tutorialSteps: TutorialStep[] = [
  {
    target: '.tutor-overview-section',
    title: 'Dashboard Overview',
    content: 'Welcome to your tutor dashboard! Here you can manage your courses, view student enrollments, and track your earnings.'
  },
  {
    target: '.tutor-courses-section',
    title: 'My Courses',
    content: 'Manage all your courses from this section. Create new courses, update existing content, and organize your teaching materials.'
  },
  {
    target: '.tutor-students-section',
    title: 'My Students',
    content: 'View all students enrolled in your courses. Track their progress, review submitted assignments, and provide feedback.'
  },
  {
    target: '.tutor-schedule-section',
    title: 'Class Schedule',
    content: 'Manage your teaching schedule and upcoming live sessions. Start or join classes with a single click.'
  },
  {
    target: '.tutor-earnings-section',
    title: 'Earnings Dashboard',
    content: 'Track your earnings from course sales. View detailed reports on revenue, commissions, and withdrawal history.'
  },
  {
    target: '.tutor-reviews-section',
    title: 'Student Reviews',
    content: 'Monitor student reviews and ratings for your courses. High-rated courses appear higher in search results.'
  },
  {
    target: '.tutor-create-section',
    title: 'Create New Course',
    content: 'Start creating a new course with our intuitive course builder. Add lectures, quizzes, assignments, and multimedia content.'
  },
  {
    target: '.tutor-analytics-section',
    title: 'Performance Analytics',
    content: 'Gain insights into how your courses are performing. Track student engagement, completion rates, and areas for improvement.'
  },
  {
    target: '.tutor-payout-section',
    title: 'Payment Settings',
    content: 'Set up your payment details for receiving payouts. Request withdrawals and track payment status.'
  }
];

export default function TutorDashboardTutorial() {
  return (
    <TutorialSystem
      steps={tutorialSteps}
      storageKey="tutor-dashboard-tutorial-completed"
      defaultShown={true}
    />
  );
}