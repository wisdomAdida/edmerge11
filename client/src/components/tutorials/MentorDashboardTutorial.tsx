import TutorialSystem, { TutorialStep } from './TutorialSystem';

const tutorialSteps: TutorialStep[] = [
  {
    target: '.mentor-overview-section',
    title: 'Dashboard Overview',
    content: 'Welcome to your mentor dashboard! Here you can manage your mentees, schedule sessions, and track your impact on the platform.'
  },
  {
    target: '.mentor-mentees-section',
    title: 'My Mentees',
    content: 'View all students you are currently mentoring. Access their profiles, learning progress, and communication history.'
  },
  {
    target: '.mentor-schedule-section',
    title: 'Session Schedule',
    content: 'Manage your mentoring schedule and upcoming sessions. Set your availability and accept mentoring requests.'
  },
  {
    target: '.mentor-messages-section',
    title: 'Messages',
    content: 'Access your secure messaging center to communicate with your mentees. Share resources and provide guidance.'
  },
  {
    target: '.mentor-resources-section',
    title: 'Mentoring Resources',
    content: 'Access our library of mentoring tools, guides, and best practices to enhance your mentoring effectiveness.'
  },
  {
    target: '.mentor-feedback-section',
    title: 'Feedback & Ratings',
    content: 'View feedback from your mentees. Higher ratings increase your visibility in the Global Mentorship Network.'
  },
  {
    target: '.mentor-earnings-section',
    title: 'Earnings Dashboard',
    content: 'Track your earnings from premium mentoring sessions. View detailed reports on revenue and withdrawal history.'
  },
  {
    target: '.mentor-profile-section',
    title: 'Mentor Profile',
    content: 'Manage your public mentor profile. Highlight your expertise, experience, and mentoring approach to attract mentees.'
  }
];

export default function MentorDashboardTutorial() {
  return (
    <TutorialSystem
      steps={tutorialSteps}
      storageKey="mentor-dashboard-tutorial-completed"
      defaultShown={true}
    />
  );
}