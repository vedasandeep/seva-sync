import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import SidebarDrawer from './SidebarDrawer';
import BreadcrumbNav from './BreadcrumbNav';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Redirect to login if needed (handled by auth middleware)
  if (!navigate) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Top Header */}
      <TopHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Breadcrumbs */}
      <BreadcrumbNav />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <Sidebar />

        {/* Sidebar Drawer (Mobile) */}
        <SidebarDrawer isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:ml-64">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
