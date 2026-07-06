/**
 * Converts snake_case or UPPER_CASE enum strings to human-readable "Title Case".
 *
 * Examples:
 *   formatEnum("DRAFT")           → "Draft"
 *   formatEnum("APPROVED")        → "Approved"
 *   formatEnum("OPENING_STOCK")   → "Opening Stock"
 *   formatEnum("PARTIALLY_PAID")  → "Partially Paid"
 */
import { format as dateFnsFormat } from 'date-fns';

export function formatEnum(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Status → Badge variant mappings ───────────────────────────────────────────

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

export interface StatusConfig {
  label: string;
  variant: BadgeVariant;
}

/** Purchase Order statuses */
export const PO_STATUS: Record<string, StatusConfig> = {
  DRAFT:     { label: 'Draft',     variant: 'secondary' },
  PENDING:   { label: 'Pending',   variant: 'outline' },
  APPROVED:  { label: 'Approved',  variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

/** Sales Order statuses */
export const SO_STATUS: Record<string, StatusConfig> = {
  DRAFT:     { label: 'Draft',     variant: 'secondary' },
  PENDING:   { label: 'Pending',   variant: 'outline' },
  APPROVED:  { label: 'Approved',  variant: 'default' },
  PACKED:    { label: 'Packed',    variant: 'outline' },
  SHIPPED:   { label: 'Shipped',   variant: 'warning' },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

/** Invoice statuses */
export const INVOICE_STATUS: Record<string, StatusConfig> = {
  DRAFT:     { label: 'Draft',     variant: 'secondary' },
  SENT:      { label: 'Sent',      variant: 'outline' },
  PARTIAL:   { label: 'Partial',   variant: 'warning' },
  PAID:      { label: 'Paid',      variant: 'success' },
  OVERDUE:   { label: 'Overdue',   variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

/** Bill statuses */
export const BILL_STATUS: Record<string, StatusConfig> = {
  DRAFT:     { label: 'Draft',     variant: 'secondary' },
  OPEN:      { label: 'Open',      variant: 'outline' },
  PARTIAL:   { label: 'Partial',   variant: 'warning' },
  PAID:      { label: 'Paid',      variant: 'success' },
  OVERDUE:   { label: 'Overdue',   variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

/** Return statuses (purchase returns + sales returns) */
export const RETURN_STATUS: Record<string, StatusConfig> = {
  PENDING:   { label: 'Pending',   variant: 'outline' },
  APPROVED:  { label: 'Approved',  variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  REJECTED:  { label: 'Rejected',  variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

/** Quotation statuses */
export const QUOTATION_STATUS: Record<string, StatusConfig> = {
  DRAFT:     { label: 'Draft',     variant: 'secondary' },
  SENT:      { label: 'Sent',      variant: 'outline' },
  ACCEPTED:  { label: 'Accepted',  variant: 'success' },
  REJECTED:  { label: 'Rejected',  variant: 'destructive' },
  EXPIRED:   { label: 'Expired',   variant: 'destructive' },
  CONVERTED: { label: 'Converted', variant: 'default' },
};

/** Inventory transaction types */
export const TXN_TYPE: Record<string, string> = {
  PURCHASE:      'Purchase',
  SALE:          'Sale',
  RETURN:        'Return',
  TRANSFER:      'Transfer',
  ADJUSTMENT:    'Adjustment',
  DAMAGE:        'Damage',
  EXPIRED:       'Expired',
  OPENING_STOCK: 'Opening Stock',
};

/** Member/invite roles */
export const MEMBER_ROLE: Record<string, string> = {
  OWNER:  'Owner',
  ADMIN:  'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

/** Integration statuses */
export const INTEGRATION_STATUS: Record<string, StatusConfig> = {
  ACTIVE:   { label: 'Active',   variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
  ERROR:    { label: 'Error',    variant: 'destructive' },
};

/** Subscription statuses */
export const SUBSCRIPTION_STATUS: Record<string, StatusConfig> = {
  ACTIVE:    { label: 'Active',    variant: 'success' },
  TRIALING:  { label: 'Trial',     variant: 'outline' },
  PAST_DUE:  { label: 'Past Due',  variant: 'warning' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  EXPIRED:   { label: 'Expired',   variant: 'destructive' },
};

/**
 * Safe date formatting — returns '—' instead of crashing on null/invalid dates.
 */
export function safeFormat(date: string | Date | null | undefined, formatStr: string): string {
  if (!date) return '—';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    return dateFnsFormat(d, formatStr);
  } catch {
    return '—';
  }
}
