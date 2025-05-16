import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { usePendingPayments } from '@/contexts/PendingPaymentsContext';
import { useRealTime } from '@/hooks/useRealTime';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
  ChevronDown,
  DollarSign,
  LogOut,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { openPendingPayments } = usePendingPayments();
  const { isAuthenticated, currentUser, logout, isAdmin } = useAuth();
  const [time, setTime] = React.useState('');
  const [date, setDate] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('home');

  // Fetch pending payments count
  const {
    data: pendingPayments = [],
    loading: pendingPaymentsLoading
  } = useRealTime('sessions', {
    fetchInitial: true,
    filter: '(payment_type = "Post-paid" && status = "Active") || (status = "Closed" && amount_paid < total_amount)'
  });

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

  // Handle logout
  const handleLogout = async () => {
    console.log("Logout button clicked");
    try {
      // The logout function in AuthContext handles everything:
      // - Updating login logs
      // - Clearing auth state
      // Pass the navigate function for redirection
      await logout(navigate);
      console.log("Logout successful");
    } catch (error) {
      console.error('Error during logout:', error);
    }
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

        <div className="flex items-center border-l border-border pl-4 ml-2 gap-3">
          <Button
            variant="outline"
            onClick={openPendingPayments}
            className="flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            <span>Pending Payments</span>
            {pendingPayments.length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                {pendingPayments.length}
              </span>
            )}
          </Button>

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border-r pr-2">
                <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">{currentUser?.username || 'User'}</span>
                  {currentUser?.role && (
                    <span className={`text-[10px] px-1 rounded ${currentUser.role === 'Admin'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                      }`}>
                      {currentUser.role}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => navigate('/settings')}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Logout button clicked");
                  handleLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export { Navbar };
