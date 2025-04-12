import TutorialSystem, { TutorialStep } from './TutorialSystem';
import { useState, useEffect } from 'react';

const tutorialSteps: TutorialStep[] = [
  {
    target: '.admin-stats-cards',
    title: 'Dashboard Overview',
    content: 'Welcome to your admin dashboard! This section shows key platform metrics at a glance, including active users, total courses, completed classes, and revenue generated.'
  },
  {
    target: '.admin-charts',
    title: 'Platform Analytics',
    content: 'These charts provide visual insights into your platform performance, including revenue trends and user distribution by role.'
  },
  {
    target: '.admin-quick-actions',
    title: 'Quick Actions',
    content: 'Access frequently used admin functions quickly from this section. Manage users, courses, and platform settings with a single click.'
  },
  {
    target: '.admin-subscription-keys',
    title: 'Subscription Key Management',
    content: 'Generate and manage subscription keys for users. Track active subscriptions and monitor usage patterns.'
  }
];

export default function AdminDashboardTutorial() {
  const [tutorialEnabled, setTutorialEnabled] = useState(false);
  
  // Delay showing the tutorial to ensure the DOM elements are rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      setTutorialEnabled(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!tutorialEnabled) return null;
  
  return (
    <TutorialSystem
      steps={tutorialSteps}
      storageKey="admin-dashboard-tutorial-completed"
      defaultShown={false} // Changed to false to prevent automatic display
    />
  );
}