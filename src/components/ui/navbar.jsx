import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import {
  Home,
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart,
  Settings,
  Bell,
  Sun,
  Moon,
  Clock,
  ChevronDown
} from 'lucide-react';

const NavItem = ({ icon: Icon, label, href, active, onClick, id, className }) => {
  return (
    <Link
      to={href}
      onClick={() => onClick && onClick(id)}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-1 text-xs font-medium border-b-2",
        active
          ? "text-primary border-primary"
          : "text-muted-foreground border-transparent hover:text-foreground hover:border-border",
        className
      )}
    >
      {Icon && <Icon className="h-5 w-5 mb-0.5" />}
      <span className="">{label}</span>
    </Link>
  );
};

const Navbar = ({ className }) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [time, setTime] = React.useState('');
  const [date, setDate] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('home');

  // Set active tab based on current path
  React.useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('home');
    } else {
      // Remove leading slash and set as active tab
      const tab = path.substring(1);
      setActiveTab(tab);
    }
  }, [location.pathname]);

  // Update time and date
  React.useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      setDate(`${now.getDate()} ${now.toLocaleDateString([], { month: 'short', year: 'numeric' })}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className={cn("flex h-auto items-center border-b bg-background px-4 py-3", className)}>
      <div className="flex items-center mr-6">
        <Link to="/" className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            XP
          </div>
        </Link>
      </div>

      <nav className="flex-1 flex items-center">
        <div className="flex items-center">
          <NavItem
            href="/"
            icon={Home}
            label="HOME"
            id="home"
            active={activeTab === 'home'}
            onClick={setActiveTab}
          />
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="DASHBOARD"
            id="dashboard"
            active={activeTab === 'dashboard'}
            onClick={setActiveTab}
          />
          <NavItem
            href="/inventory"
            icon={ClipboardList}
            label="INVENTORY"
            id="inventory"
            active={activeTab === 'inventory'}
            onClick={setActiveTab}
          />
          <NavItem
            href="/logs"
            icon={Users}
            label="LOGS"
            id="logs"
            active={activeTab === 'logs'}
            onClick={setActiveTab}
          />
          <NavItem
            href="/reports"
            icon={BarChart}
            label="REPORTS"
            id="reports"
            active={activeTab === 'reports'}
            onClick={setActiveTab}
          />
          <NavItem
            href="/users"
            icon={Users}
            label="USERS"
            id="users"
            active={activeTab === 'users'}
            onClick={setActiveTab}
          />
          <NavItem
            href="/settings"
            icon={Settings}
            label="SETTINGS"
            id="settings"
            active={activeTab === 'settings'}
            onClick={setActiveTab}
          />
        </div>
      </nav>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium">{time}</div>
          <div className="text-xs text-muted-foreground">{date}</div>
        </div>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8 p-0">
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative h-8 w-8 p-0">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive"></span>
        </Button>

        <div className="flex items-center border-l border-border pl-4 ml-2">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium mr-1">Payments</span>
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
              3
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5 p-0 ml-1">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export { Navbar };
