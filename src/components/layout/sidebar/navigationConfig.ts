
import { 
  Layers, 
  Package, 
  Users, 
  Map, 
  BarChart2, 
  Settings, 
  Bell,
  Calendar,
  HardDrive,
  Truck,
  LifeBuoy,
  Wrench,
  FileText,
  DollarSign,
  ShoppingCart,
  Book,
  MessageSquare,
  CreditCard,
  GitBranch,
  Boxes
} from 'lucide-react';
import { NavItem } from './SidebarNavGroup';

export const mainNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: Layers, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Heavy Equipment', href: '/equipment', icon: Package, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Inventory', href: '/inventory', icon: Boxes, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Projects', href: '/projects', icon: Map, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart2, roles: ['manager', 'admin'] },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['manager', 'admin'] },
];

export const integrationNavigation: NavItem[] = [
  { name: 'GPS Integration', href: '/gps-integration', icon: HardDrive, roles: ['operator', 'manager', 'admin'] },
  { name: 'Scheduling', href: '/scheduling', icon: Calendar, roles: ['operator', 'manager', 'admin'] },
  { name: 'Maintenance', href: '/maintenance', icon: Wrench, roles: ['operator', 'manager', 'admin'] },
  { name: 'Fleet', href: '/fleet', icon: Truck, roles: ['operator', 'manager', 'admin'] },
  { name: 'Materials', href: '/materials', icon: ShoppingCart, roles: ['operator', 'manager', 'admin'] },
  { name: 'Payment', href: '/payments', icon: CreditCard, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Workflow', href: '/workflow', icon: GitBranch, roles: ['operator', 'manager', 'admin'] },
];

export const settingsNavigation: NavItem[] = [
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Notifications', href: '/notifications', icon: Bell, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Documentation', href: '/documentation', icon: Book, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Support', href: '/support', icon: LifeBuoy, roles: ['viewer', 'operator', 'manager', 'admin'] },
  { name: 'Billing', href: '/billing', icon: DollarSign, roles: ['manager', 'admin'] },
  { name: 'Chat', href: '/chat', icon: MessageSquare, roles: ['viewer', 'operator', 'manager', 'admin'] },
];
