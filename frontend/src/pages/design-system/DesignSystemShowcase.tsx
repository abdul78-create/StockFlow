import * as React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Box,
  Check,
  Home,
  Inbox,
  Package,
  Plus,
  Settings,
  Trash2,
  User,
} from 'lucide-react';
import { AreaChart, LineChart, PieChart, StatChart } from '@/components/charts';
import {
  AccessDeniedState,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  ConfirmDialog,
  DataTable,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  ErrorState,
  Input,
  Label,
  NotFoundState,
  Pagination,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  SearchBar,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Spinner,
  StatCard,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type ColumnDef,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { fadeInUp } from '@/lib/motion';
import { cn } from '@/lib/utils';

interface DemoRow {
  id: string;
  name: string;
  sku: string;
  status: string;
}

const demoRows: DemoRow[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'WM-001', status: 'Active' },
  { id: '2', name: 'Mechanical Keyboard', sku: 'MK-002', status: 'Active' },
  { id: '3', name: 'USB-C Hub', sku: 'UH-003', status: 'Low Stock' },
  { id: '4', name: 'Monitor Stand', sku: 'MS-004', status: 'Inactive' },
];

const chartData = [
  { month: 'Jan', value: 4200, orders: 24 },
  { month: 'Feb', value: 3800, orders: 18 },
  { month: 'Mar', value: 5100, orders: 32 },
  { month: 'Apr', value: 4600, orders: 28 },
  { month: 'May', value: 5800, orders: 35 },
  { month: 'Jun', value: 6200, orders: 41 },
];

const pieData = [
  { name: 'Electronics', value: 420 },
  { name: 'Accessories', value: 280 },
  { name: 'Office', value: 190 },
  { name: 'Other', value: 95 },
];

const tableColumns: ColumnDef<DemoRow, unknown>[] = [
  { accessorKey: 'name', header: 'Product' },
  { accessorKey: 'sku', header: 'SKU' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === 'Active' ? 'success' : status === 'Low Stock' ? 'warning' : 'secondary';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
];

function Section({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={cn('space-y-4', className)}
    >
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-2">
      <div className={cn('h-14 rounded-md border border-border shadow-sm', className)} />
      <p className="text-xs text-muted-foreground">{name}</p>
    </div>
  );
}

export function DesignSystemShowcase() {
  const [search, setSearch] = React.useState('');
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [checked, setChecked] = React.useState(false);
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              StockFlow
            </p>
            <h1 className="text-lg font-semibold text-foreground">Design System</h1>
          </div>
          <Badge variant="outline">Phase 1</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 py-12">
        <Section
          title="Design Tokens"
          description="Centralized CSS variables consumed by Tailwind and all components."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <Swatch name="Background" className="bg-background" />
            <Swatch name="Surface" className="bg-surface" />
            <Swatch name="Card" className="bg-card" />
            <Swatch name="Border" className="bg-border" />
            <Swatch name="Primary" className="bg-primary" />
            <Swatch name="Muted" className="bg-muted" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Spacing: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64</span>
            <span>Motion: 150ms · 200ms · 250ms</span>
            <span>Font: Inter</span>
          </div>
        </Section>

        <Section title="Buttons" description="Variants, sizes, loading, icons, and disabled states.">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" icon={<Plus />}>
              Primary
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive" icon={<Trash2 />}>
              Destructive
            </Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" variant="outline" aria-label="Settings">
              <Settings />
            </Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Form Controls">
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="Product name" placeholder="Enter product name" hint="Visible to customers" />
            <Input label="SKU" placeholder="SKU-001" error="SKU is required" />
            <Textarea label="Description" placeholder="Product description…" />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue="electronics">
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="terms" checked={checked} onCheckedChange={(v) => setChecked(!!v)} />
                <Label htmlFor="terms">Accept terms</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <RadioGroup defaultValue="standard">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="standard" id="standard" />
                  <Label htmlFor="standard">Standard shipping</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express">Express shipping</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Section>

        <Section title="Feedback">
          <div className="grid gap-4 md:grid-cols-2">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Default alert</AlertTitle>
              <AlertDescription>Neutral informational message.</AlertDescription>
            </Alert>
            <Alert variant="success">
              <Check className="size-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Inventory updated successfully.</AlertDescription>
            </Alert>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Spinner />
            <Progress value={65} className="w-48" />
            <Button
              variant="outline"
              onClick={() => toast.success('StockFlow toast notification')}
            >
              Show toast
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </Section>

        <Section title="Data Display">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Danger</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=SF" alt="User" />
              <AvatarFallback>SF</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>AB</AvatarFallback>
            </Avatar>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Card component</CardTitle>
              <CardDescription>Minimal surface with soft shadow and generous padding.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cards use token-based borders, radius, and spacing throughout.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
        </Section>

        <Section title="Navigation">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Inventory</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="text-sm text-muted-foreground">
              Tab content with keyboard-accessible navigation.
            </TabsContent>
            <TabsContent value="analytics" className="text-sm text-muted-foreground">
              Analytics content placeholder.
            </TabsContent>
            <TabsContent value="reports" className="text-sm text-muted-foreground">
              Reports content placeholder.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Overlays">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open modal</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>
                    Modals use Radix for focus trapping and keyboard support.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline">Open drawer</Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Mobile drawer</DrawerTitle>
                  <DrawerDescription>Responsive panel for mobile workflows.</DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <Button>Save</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Dropdown</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings /> Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Popover</Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <p className="text-sm text-muted-foreground">Contextual content panel.</p>
              </PopoverContent>
            </Popover>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Notifications">
                  <Bell />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>

            <Button variant="outline" onClick={() => setConfirmOpen(true)}>
              Confirm dialog
            </Button>
            <Button variant="outline" onClick={() => setCommandOpen(true)}>
              Command palette (⌘K)
            </Button>
          </div>
        </Section>

        <Section title="Search & Tables">
          <SearchBar value={search} onChange={setSearch} placeholder="Search components…" />
          <DataTable
            columns={tableColumns}
            data={demoRows}
            enableRowSelection
            enableExport
            exportFilename="products-demo.csv"
          />
          <Pagination
            page={page}
            pageSize={10}
            totalItems={48}
            onPageChange={setPage}
          />
        </Section>

        <Section title="Stat Cards">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Revenue"
              value="$58,420"
              icon={Package}
              trend={{ value: 12.5, label: 'vs last month' }}
            />
            <StatCard
              title="Inventory Value"
              value="$124,800"
              icon={Box}
              trend={{ value: -3.2, label: 'vs last month' }}
            />
            <StatCard title="Orders" value="1,284" icon={Inbox} loading />
            <StatCard title="Low Stock" value="14" icon={AlertCircle} />
          </div>
        </Section>

        <Section title="Charts" description="Reusable chart components — pages only compose them.">
          <div className="grid gap-6 lg:grid-cols-2">
            <StatChart
              title="Revenue trend"
              type="area"
              chartProps={{
                type: 'area',
                data: chartData,
                dataKey: 'value',
                xAxisKey: 'month',
                height: 260,
              }}
            />
            <StatChart
              title="Orders"
              type="bar"
              chartProps={{
                type: 'bar',
                data: chartData,
                dataKey: 'orders',
                xAxisKey: 'month',
                height: 260,
              }}
            />
            <LineChart data={chartData} dataKey="value" xAxisKey="month" height={220} />
            <PieChart data={pieData} dataKey="value" nameKey="name" height={220} />
          </div>
        </Section>

        <Section title="Empty & Error States">
          <div className="grid gap-6 lg:grid-cols-2">
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Create your first product to start tracking inventory."
              action={{ label: 'Add product', onClick: () => {}, icon: Plus }}
            />
            <ErrorState onRetry={() => toast.message('Retrying…')} />
          </div>
          <Separator />
          <div className="grid gap-6 lg:grid-cols-2">
            <NotFoundState action={{ label: 'Go home', onClick: () => {} }} />
            <AccessDeniedState action={{ label: 'Request access', onClick: () => {} }} />
          </div>
        </Section>
      </main>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search commands…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Home /> Dashboard
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Package /> Products
            </CommandItem>
            <CommandItem onSelect={() => setCommandOpen(false)}>
              <Settings /> Settings
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete product?"
        description="This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success('Product deleted');
        }}
      />
    </div>
  );
}
