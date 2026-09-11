import type { UserRole, CustomerStatus, ChallanStatus } from '../types';

export const formatDate = (date?: string): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateTime = (date?: string): string => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    ADMIN: 'badge-admin',
    SALES: 'badge-sales',
    WAREHOUSE: 'badge-warehouse',
    ACCOUNTS: 'badge-accounts',
  };
  return colors[role];
};

export const getStatusColor = (status: CustomerStatus): string => {
  const colors: Record<CustomerStatus, string> = {
    ACTIVE: 'badge-active',
    LEAD: 'badge-lead',
    INACTIVE: 'badge-inactive',
  };
  return colors[status];
};

export const getChallanStatusColor = (status: ChallanStatus): string => {
  const colors: Record<ChallanStatus, string> = {
    CONFIRMED: 'badge-confirmed',
    DRAFT: 'badge-draft',
    CANCELLED: 'badge-cancelled',
  };
  return colors[status];
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const formatError = (error: any, fallback: string): string => {
  return error?.response?.data?.message || fallback;
};
