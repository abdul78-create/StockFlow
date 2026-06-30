import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  FileText,
  Users,
  Building2,
  Settings,
  Bell,
  Search,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  User,
  Moon,
  Sun,
  Laptop,
  Check,
  AlertCircle,
  Info,
  MoreVertical,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  SearchCode,
  type LucideIcon,
} from 'lucide-react';

export type Icon = LucideIcon;

export const Icons = {
  // Navigation
  dashboard: LayoutDashboard,
  inventory: Boxes,
  products: Package,
  purchaseOrders: ShoppingCart,
  salesOrders: FileText,
  customers: Users,
  warehouse: Building2,
  reports: FileText,
  settings: Settings,

  // Shell / Layout
  notifications: Bell,
  search: Search,
  menu: Menu,
  close: X,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  moreVertical: MoreVertical,
  moreHorizontal: MoreHorizontal,
  
  // User / Auth
  user: User,
  logout: LogOut,

  // Theme
  sun: Sun,
  moon: Moon,
  laptop: Laptop,

  // Actions
  add: Plus,
  edit: Edit2,
  delete: Trash2,
  view: Eye,
  filter: Filter,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,

  // Status / Feedback
  success: Check,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info,
  trendUp: ArrowUpRight,
  trendDown: ArrowDownRight,

  // Misc
  emptySearch: SearchCode,
} as const;
