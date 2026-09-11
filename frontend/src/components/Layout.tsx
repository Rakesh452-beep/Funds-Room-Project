import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const titleMap: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/challans\/new$/, title: 'New Challan' },
  { pattern: /^\/challans\/[^/]+$/, title: 'Challan Detail' },
  { pattern: /^\/challans$/, title: 'Sales Challans' },
  { pattern: /^\/customers\/new$/, title: 'New Customer' },
  { pattern: /^\/customers\/[^/]+\/edit$/, title: 'Edit Customer' },
  { pattern: /^\/customers\/[^/]+$/, title: 'Customer Detail' },
  { pattern: /^\/customers$/, title: 'Customers' },
  { pattern: /^\/products\/new$/, title: 'New Product' },
  { pattern: /^\/products\/[^/]+\/edit$/, title: 'Edit Product' },
  { pattern: /^\/products\/[^/]+$/, title: 'Product Detail' },
  { pattern: /^\/products$/, title: 'Products' },
  { pattern: /^\/users$/, title: 'User Management' },
  { pattern: /^\/dashboard$/, title: 'Dashboard' },
];

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const matched = titleMap.find((t) => t.pattern.test(location.pathname));
  const title = matched?.title || 'FundsRoom';

  return (
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64 min-h-screen">
        {/* playful brand strip */}
        <div className="hidden lg:block h-1 bg-gradient-to-r from-lime-500 via-pink-500 to-black sticky top-0 z-40" />
        <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">
          <div key={location.pathname} className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};