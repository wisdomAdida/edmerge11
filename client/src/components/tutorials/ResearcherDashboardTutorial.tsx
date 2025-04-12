import TutorialSystem, { TutorialStep } from './TutorialSystem';

const tutorialSteps: TutorialStep[] = [
  {
    target: '.researcher-overview-section',
    title: 'Dashboard Overview',
    content: 'Welcome to your researcher dashboard! Here you can manage your projects, access data, and collaborate with other researchers.'
  },
  {
    target: '.researcher-projects-section',
    title: 'My Projects',
    content: 'Manage all your research projects. Create new projects, update existing ones, and track progress on ongoing research.'
  },
  {
    target: '.researcher-data-section',
    title: 'Data Access',
    content: 'Access research data and analytics. Our platform provides anonymized learning data for educational research.'
  },
  {
    target: '.researcher-publish-section',
    title: 'Publications',
    content: 'Manage your research publications and papers. Share findings with the academic community and platform users.'
  },
  {
    target: '.researcher-collaborate-section',
    title: 'Collaboration Hub',
    content: 'Find and connect with other researchers. Form research teams and work on joint projects.'
  },
  {
    target: '.researcher-insights-section',
    title: 'Platform Insights',
    content: 'Explore platform usage patterns and learning analytics. Use these insights to inform your research.'
  },
  {
    target: '.researcher-tools-section',
    title: 'Research Tools',
    content: 'Access our suite of research tools. Includes statistical analysis, data visualization, and survey creation tools.'
  },
  {
    target: '.researcher-funding-section',
    title: 'Funding Opportunities',
    content: 'Discover grants and funding sources for educational research projects on our platform.'
  },
  {
    target: '.researcher-reports-section',
    title: 'Reports Generation',
    content: 'Generate comprehensive reports from your research data. Export in various formats for publications or presentations.'
  }
];

export default function ResearcherDashboardTutorial() {
  return (
    <TutorialSystem
      steps={tutorialSteps}
      storageKey="researcher-dashboard-tutorial-completed"
      defaultShown={true}
    />
  );
}