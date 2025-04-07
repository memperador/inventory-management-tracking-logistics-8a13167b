import {
  BarChart,
  Package,
  FolderClosed,
  LineChart,
  MapPin,
  Wrench,
  Truck,
  Boxes,
  GitBranch,
  Users,
  FileText,
  CreditCard,
  DollarSign,
  LifeBuoy,
  MessageSquare,
  Bell,
  Settings,
  User,
} from 'lucide-react';

interface NavItem {
  title: string;
  icon: keyof typeof icons;
  href: string;
  requiredRoles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const icons = {
  BarChart,
  Package,
  FolderClosed,
  LineChart,
  MapPin,
  Wrench,
  Truck,
  Boxes,
  GitBranch,
  Users,
  FileText,
  CreditCard,
  DollarSign,
  LifeBuoy,
  MessageSquare,
  Bell,
  Settings,
  User,
};

export const navigationConfig: NavSection[] = [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', icon: 'BarChart', href: '/dashboard', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Inventory', icon: 'Package', href: '/inventory', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Projects', icon: 'FolderClosed', href: '/projects', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Analytics', icon: 'LineChart', href: '/analytics', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] }
    ],
  },
  {
    title: 'Equipment Management',
    items: [
      { title: 'GPS Integration', icon: 'MapPin', href: '/gps-integration', requiredRoles: ['operator', 'manager', 'admin'] },
      { title: 'Maintenance', icon: 'Wrench', href: '/maintenance', requiredRoles: ['operator', 'manager', 'admin'] },
      { title: 'Fleet', icon: 'Truck', href: '/fleet', requiredRoles: ['operator', 'manager', 'admin'] },
      { title: 'Materials', icon: 'Boxes', href: '/materials', requiredRoles: ['operator', 'manager', 'admin'] },
      { title: 'Workflow', icon: 'GitBranch', href: '/workflow', requiredRoles: ['operator', 'manager', 'admin'] }
    ],
  },
  {
    title: 'Administration',
    items: [
      { title: 'Users', icon: 'Users', href: '/users', requiredRoles: ['admin'] },
      { title: 'Reports', icon: 'FileText', href: '/reports', requiredRoles: ['manager', 'admin'] },
      { title: 'Billing', icon: 'CreditCard', href: '/billing', requiredRoles: ['manager', 'admin'] },
      { title: 'Payments', icon: 'DollarSign', href: '/payments', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] }
    ],
  },
  {
    title: 'Support',
    items: [
      { title: 'Documentation', icon: 'FileText', href: '/documentation', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Support', icon: 'LifeBuoy', href: '/support', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Chat', icon: 'MessageSquare', href: '/chat', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Notifications', icon: 'Bell', href: '/notifications', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] }
    ],
  },
  {
    title: 'Account',
    items: [
      { title: 'Settings', icon: 'Settings', href: '/settings', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] },
      { title: 'Account', icon: 'User', href: '/account', requiredRoles: ['viewer', 'operator', 'manager', 'admin'] }
    ],
  },
];
