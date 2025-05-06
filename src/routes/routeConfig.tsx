
import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import Inventory from '@/pages/Inventory';
import AccountPage from '@/pages/AccountPage';
import Settings from '@/pages/Settings';
import Unauthorized from '@/pages/Unauthorized';
import GPSIntegration from '@/pages/GPSIntegration';
import RequestManagement from '@/pages/RequestManagement';
import RFIDetail from '@/pages/RFIDetail';
import Analytics from '@/pages/Analytics';
import Onboarding from '@/pages/Onboarding';
import ResetPassword from '@/pages/ResetPassword';
import TwoFactorAuth from '@/pages/TwoFactorAuth';
import Users from '@/pages/Users';
import PaymentPage from '@/pages/PaymentPage';
import AIAssistant from '@/pages/AIAssistant';
import WorkflowPage from '@/pages/WorkflowPage';
import Notifications from '@/pages/Notifications';
import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CustomerOnboarding from '@/pages/CustomerOnboarding';
import { ProjectRedirect, RootRedirect } from './specialRoutes';

export const publicRoutes: RouteObject[] = [
  { path: '/auth', element: <Auth /> },
  { path: '/auth/reset-password', element: <ResetPassword /> },
  { path: '/auth/two-factor', element: <TwoFactorAuth /> },
  { path: '/unauthorized', element: <Unauthorized /> },
  { path: '/login', element: <Navigate to="/auth" replace /> },
  { path: '/terms-of-service', element: <TermsOfService /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  // Default route - checks auth state and redirects appropriately
  { path: '/', element: <RootRedirect /> },
  { path: '/404', element: <NotFound /> },
];

export const protectedRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: <ProtectedRoute redirectTo="/auth"><Onboarding /></ProtectedRoute>
  },
  {
    path: '/customer-onboarding',
    element: <ProtectedRoute redirectTo="/auth"><CustomerOnboarding /></ProtectedRoute>
  },
  {
    path: '/project/:projectId',
    element: <ProjectRedirect />
  },
  {
    path: '/payment',
    element: <PaymentPage />
  },
  {
    path: '/',
    element: <ProtectedRoute redirectTo="/auth"><AppLayout>Outlet placeholder</AppLayout></ProtectedRoute>,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/projects', element: <Projects /> },
      { path: '/projects/:projectId', element: <ProjectDetail /> },
      { path: '/inventory', element: <Inventory /> },
      { path: '/account', element: <AccountPage /> },
      { path: '/settings', element: <Settings /> },
      { path: '/gps', element: <GPSIntegration /> },
      { path: '/notifications', element: <Notifications /> },
      { path: '/requests', element: <RequestManagement /> },
      { path: '/requests/:requestId', element: <RFIDetail /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/users', element: <Users /> },
      { path: '/ai-assistant', element: <AIAssistant /> },
      { path: '/workflow', element: <WorkflowPage /> },
    ]
  },
  { path: '*', element: <NotFound /> }
];
