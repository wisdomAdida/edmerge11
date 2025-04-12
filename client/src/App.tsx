import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { LocationProvider } from "@/hooks/use-location"; // For geo-location, not routing
import { CountryRestrictionModal } from "@/components/modals/CountryRestrictionModal";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import SubscriptionKeyPage from "@/pages/auth/subscription-key";
import LandingPage from "@/pages/landing-page";
import SubscriptionPage from "@/pages/subscription-page";
import SubscriptionSuccessPage from "@/pages/subscription/success";
import SubscriptionErrorPage from "@/pages/subscription/error";
import StudentDashboard from "@/pages/student/dashboard";
import TutorDashboard from "@/pages/tutor/dashboard";
import MentorDashboard from "@/pages/mentor/dashboard";
import ResearcherDashboard from "@/pages/researcher/dashboard";
import AdminDashboard from "@/pages/admin/dashboard-fixed";
import AdminSubscriptionKeysPage from "@/pages/admin/subscription-keys";
import AdminUsersPage from "@/pages/admin/users";
import AdminUserDetailPage from "@/pages/admin/users/[id]";
import AdminScholarshipsPage from "@/pages/admin/scholarships";
import CreateScholarshipPage from "@/pages/admin/scholarships/new";
import EditScholarshipPage from "@/pages/admin/scholarships/edit/[id]";
import ScholarshipsPage from "@/pages/scholarships";

// Settings pages
import StudentSettingsPage from "@/pages/student/settings";
import TutorSettingsPage from "@/pages/tutor/settings";
import MentorSettingsPage from "@/pages/mentor/settings";
import ResearcherSettingsPage from "@/pages/researcher/settings";
import AdminSettingsPage from "@/pages/admin/settings";

// Course pages
import CreateCoursePage from "@/pages/tutor/courses/create";
import CourseDetailsPage from "@/pages/student/courses/course-details";
import TutorCoursesPage from "@/pages/tutor/courses";
import TutorCoursesReviewsPage from "@/pages/tutor/courses/reviews";
import CourseDetailPage from "@/pages/tutor/courses/[id]";
import EditCoursePage from "@/pages/tutor/courses/[id]/edit";
import TutorStudentsPage from "@/pages/tutor/students";
import TutorMessagesPage from "@/pages/tutor/messages";
import TutorAnalyticsPage from "@/pages/tutor/analytics";
import TutorEarningsPage from "@/pages/tutor/earnings";
import TutorWithdrawPage from "@/pages/tutor/earnings/withdraw";

// Student pages
import StudentCoursesPage from "@/pages/student/courses";
import StudentAITutorPage from "@/pages/student/ai-tutor";
import AdvancedAITutorPage from "@/pages/student/advanced-ai-tutor";
import StudentLibraryPage from "@/pages/student/library";
import StudentNotesPage from "@/pages/student/notes";
import StudentProgressPage from "@/pages/student/progress";
import StudentMentorshipPage from "@/pages/student/mentorship";
import StudentMessagesPage from "@/pages/student/messages";
import StudentPaymentsPage from "@/pages/student/payments";
import StudentFocusTimerPage from "@/pages/student/focus-timer";

// CV Generator pages
import CvGeneratorPage from "@/pages/cv-generator";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/subscription-key" component={SubscriptionKeyPage} />
      <Route path="/subscription" component={SubscriptionPage} />
      <Route path="/subscription/success" component={SubscriptionSuccessPage} />
      <Route path="/subscription/error" component={SubscriptionErrorPage} />

      {/* Student dashboards */}
      <ProtectedRoute
        path="/dashboard"
        role="student"
        component={StudentDashboard}
      />
      <ProtectedRoute
        path="/dashboard/student"
        role="student"
        component={StudentDashboard}
      />
      <ProtectedRoute
        path="/dashboard/student/:level"
        role="student"
        component={StudentDashboard}
      />

      {/* Other role dashboards */}
      <ProtectedRoute
        path="/dashboard/tutor"
        role="tutor"
        component={TutorDashboard}
      />
      <ProtectedRoute
        path="/dashboard/mentor"
        role="mentor"
        component={MentorDashboard}
      />
      <ProtectedRoute
        path="/dashboard/researcher"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/dashboard/admin"
        role="admin"
        component={AdminDashboard}
      />

      {/* Settings routes for each role */}
      <ProtectedRoute
        path="/dashboard/student/settings"
        role="student"
        component={StudentSettingsPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/settings"
        role="tutor"
        component={TutorSettingsPage}
      />
      <ProtectedRoute
        path="/dashboard/mentor/settings"
        role="mentor"
        component={MentorSettingsPage}
      />
      <ProtectedRoute
        path="/dashboard/researcher/settings"
        role="researcher"
        component={ResearcherSettingsPage}
      />
      <ProtectedRoute
        path="/dashboard/admin/settings"
        role="admin"
        component={AdminSettingsPage}
      />
      <ProtectedRoute
        path="/admin/subscription-keys"
        role="admin"
        component={AdminSubscriptionKeysPage}
      />
      <ProtectedRoute
        path="/dashboard/admin/users"
        role="admin"
        component={AdminUsersPage}
      />
      <ProtectedRoute
        path="/dashboard/admin/users/:id"
        role="admin"
        component={AdminUserDetailPage}
      />

      {/* Tutor routes */}
      <ProtectedRoute
        path="/dashboard/tutor/courses"
        role="tutor"
        component={TutorCoursesPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/courses/create"
        role="tutor"
        component={CreateCoursePage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/courses/reviews"
        role="tutor"
        component={TutorCoursesReviewsPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/students"
        role="tutor"
        component={TutorStudentsPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/messages"
        role="tutor"
        component={TutorMessagesPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/earnings"
        role="tutor"
        component={TutorEarningsPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/earnings/withdraw"
        role="tutor"
        component={TutorWithdrawPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/analytics"
        role="tutor"
        component={TutorAnalyticsPage}
      />

      {/* Tutor course detail and edit routes */}
      <ProtectedRoute
        path="/dashboard/tutor/courses/:id"
        role="tutor"
        component={CourseDetailPage}
      />
      <ProtectedRoute
        path="/dashboard/tutor/courses/:id/edit"
        role="tutor"
        component={EditCoursePage}
      />

      {/* Student routes */}
      <ProtectedRoute
        path="/student/courses"
        role="student"
        component={StudentCoursesPage}
      />
      <ProtectedRoute
        path="student/courses/:courseId"
        role="student"
        component={CourseDetailsPage}
      />
      <ProtectedRoute
        path="/dashboard/student/ai-tutor"
        role="student"
        component={StudentAITutorPage}
      />
      <ProtectedRoute
        path="/dashboard/student/advanced-ai-tutor"
        role="student"
        component={AdvancedAITutorPage}
      />
      <ProtectedRoute
        path="/dashboard/student/library"
        role="student"
        component={StudentLibraryPage}
      />
      <ProtectedRoute
        path="/dashboard/student/notes"
        role="student"
        component={StudentNotesPage}
      />
      <ProtectedRoute
        path="/dashboard/student/progress"
        role="student"
        component={StudentProgressPage}
      />
      <ProtectedRoute
        path="/dashboard/student/mentorship"
        role="student"
        component={StudentMentorshipPage}
      />
      <ProtectedRoute
        path="/dashboard/student/messages"
        role="student"
        component={StudentMessagesPage}
      />
      <ProtectedRoute
        path="/dashboard/student/payments"
        role="student"
        component={StudentPaymentsPage}
      />
      <ProtectedRoute
        path="/dashboard/student/focus-timer"
        role="student"
        component={StudentFocusTimerPage}
      />

      {/* CV Generator routes - Publicly accessible */}
      <Route path="/cv-generator" component={CvGeneratorPage} />
      <ProtectedRoute
        path="/cv-generator/edit/:id"
        component={CvGeneratorPage}
      />

      {/* Scholarships routes */}
      <Route path="/scholarships" component={ScholarshipsPage} />
      <ProtectedRoute
        path="/dashboard/admin/scholarships"
        role="admin"
        component={AdminScholarshipsPage}
      />
      <ProtectedRoute
        path="/dashboard/admin/scholarships/new"
        role="admin"
        component={CreateScholarshipPage}
      />
      <ProtectedRoute
        path="/dashboard/admin/scholarships/edit/:id"
        role="admin"
        component={EditScholarshipPage}
      />

      {/* Researcher routes */}
      <ProtectedRoute
        path="/researcher"
        role="researcher"
        component={ResearcherDashboard}
      />

      {/* Research Projects routes */}
      <ProtectedRoute
        path="/researcher/projects"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/researcher/projects/create"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/researcher/projects/:id"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/researcher/projects/:id/edit"
        role="researcher"
        component={ResearcherDashboard}
      />

      {/* Other researcher routes */}
      <ProtectedRoute
        path="/researcher/collaboration"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/researcher/publications"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/researcher/resources"
        role="researcher"
        component={ResearcherDashboard}
      />
      <ProtectedRoute
        path="/researcher/messages"
        role="researcher"
        component={ResearcherDashboard}
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <AuthProvider>
          <Router />
          <CountryRestrictionModal />
          <Toaster />
        </AuthProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

export default App;
