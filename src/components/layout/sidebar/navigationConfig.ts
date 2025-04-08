
import { NavItem } from './SidebarNavGroup';
import { 
  LayoutDashboard, 
  Package2, 
  FileCog, 
  Settings, 
  Warehouse, 
  User, 
  Map, 
  MessageSquareText, 
  BarChart3, 
  Users, 
  CreditCard, 
  Bot, 
  Workflow, 
  Bell
} from 'lucide-react';
import { UserRole } from '@/types/roles';

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: Package2,
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Warehouse,
  },
];

export const managementNavItems: NavItem[] = [
  {
    title: 'Request Management',
    href: '/requests',
    icon: MessageSquareText,
    roles: ['admin', 'manager'] as UserRole[]
  },
  {
    title: 'GPS Integration',
    href: '/gps',
    icon: Map,
    roles: ['admin', 'manager'] as UserRole[]
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['admin', 'manager'] as UserRole[]
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
];

export const systemNavItems: NavItem[] = [
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
    roles: ['admin'] as UserRole[]
  },
  {
    title: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
  },
  {
    title: 'Workflow',
    href: '/workflow',
    icon: Workflow,
    roles: ['admin', 'manager'] as UserRole[]
  },
  {
    title: 'Payment',
    href: '/payment',
    icon: CreditCard,
    roles: ['admin'] as UserRole[]
  },
  {
    title: 'Account',
    href: '/account',
    icon: User,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
