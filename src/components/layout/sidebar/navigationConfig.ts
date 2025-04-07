
import { UserRole } from '@/types/roles';
import { 
  LayoutDashboard, 
  Boxes, 
  FolderKanban, 
  BarChart3, 
  Users, 
  Settings, 
  Bell, 
  HelpCircle, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  MapPin, 
  Calendar, 
  Wrench,
  Truck,
  PackageOpen,
  GitBranch,
  FileCode2,
  Bot,
  ClipboardCheck
} from 'lucide-react';

export const dashboardNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: Boxes
  },
  {
    name: 'Projects',
    href: '/projects',
    icon: FolderKanban
  },
  {
    name: 'RFIs',
    href: '/rfi',
    icon: FileText
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3
  }
];

export const managementNavigation = [
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    requiredRoles: ['admin' as UserRole]
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileText,
    requiredRoles: ['manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    requiredRoles: ['manager' as UserRole, 'admin' as UserRole]
  }
];

export const operationsNavigation = [
  {
    name: 'GPS Integration',
    href: '/gps-integration',
    icon: MapPin,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'Scheduling',
    href: '/scheduling',
    icon: Calendar,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'Maintenance',
    href: '/maintenance',
    icon: Wrench,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'Fleet',
    href: '/fleet',
    icon: Truck,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'Materials',
    href: '/materials',
    icon: PackageOpen,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'Workflow',
    href: '/workflow',
    icon: GitBranch,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  },
  {
    name: 'RFI Management',
    href: '/rfi',
    icon: ClipboardCheck,
    requiredRoles: ['operator' as UserRole, 'manager' as UserRole, 'admin' as UserRole]
  }
];

export const supportNavigation = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  },
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell
  },
  {
    name: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot
  },
  {
    name: 'Support',
    href: '/support',
    icon: HelpCircle
  },
  {
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare
  },
  {
    name: 'Documentation',
    href: '/documentation',
    icon: FileCode2
  }
];

export const accountNavigation = [
  {
    name: 'Profile',
    href: '/account',
    icon: Users
  },
  {
    name: 'Payments',
    href: '/payments',
    icon: CreditCard
  }
];
