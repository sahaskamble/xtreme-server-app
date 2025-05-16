import React from 'react';
import ReactDOM from 'react-dom/client';
import { createMemoryRouter, Outlet, RouterProvider, Navigate } from 'react-router-dom';
import { app, events, init, window as neuWindow } from '@neutralinojs/lib';
import './index.css';
import { ThemeProvider } from './components/theme-provider';
import Layout from './pages/layout';
import DashboarPage from './pages/(app)/dashboard/page';
import InventoryPage from './pages/(app)/inventory/page';
import AllLogs from './pages/(app)/all_logs/page';
import ReportsPage from './pages/(app)/reports/page';
import UsersPage from './pages/(app)/users/page';
import SettingsPage from './pages/(app)/settings/page';
import LoginPage from './pages/(auth)/login/page';
import RegisterPage from './pages/(auth)/register/page';
import IndexPage from './pages/page';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';

// Import PocketBase client
import pb from './lib/pocketbase/pb';

// Auth check component that uses PocketBase's auth store directly
const RequireAuth = ({ children }) => {
	// Check if user is authenticated using PocketBase's auth store
	const isAuthenticated = pb.authStore.isValid;

	console.log("Auth check - isAuthenticated:", isAuthenticated);
	console.log("Auth check - user:", pb.authStore.model);

	// Redirect to login page if not authenticated
	if (!isAuthenticated) {
		console.log("Not authenticated, redirecting to login");
		return <Navigate to="/auth/login" replace />;
	}

	// Check if the user has the Admin role
	const userRole = pb.authStore.model?.role;
	const isAdmin = userRole === "Admin";

	console.log("Auth check - userRole:", userRole, "isAdmin:", isAdmin);

	// Redirect to login if not an admin
	if (!isAdmin) {
		console.log("Not an admin, redirecting to login");
		pb.authStore.clear(); // Clear the auth store
		return <Navigate to="/auth/login" replace />;
	}

	return children;
};

const router = createMemoryRouter([
	{
		path: '/',
		element: <RequireAuth><Layout /></RequireAuth>,
		children: [
			{ index: true, element: <IndexPage /> },
			{ path: 'dashboard', element: <DashboarPage /> },
			{ path: 'inventory', element: <InventoryPage /> },
			{ path: 'logs', element: <AllLogs /> },
			{ path: 'reports', element: <ReportsPage /> },
			{ path: 'users', element: <UsersPage /> },
			{ path: 'settings', element: <SettingsPage /> },
		]
	},
	{
		path: '/auth',
		element: <div className="flex min-h-screen items-center justify-center">
			<Outlet />
		</div>,
		children: [
			{ path: 'login', element: <LoginPage /> },
			{ path: 'register', element: <RegisterPage /> }
		]
	},
	// Catch-all route to redirect to login
	{
		path: '*',
		element: <Navigate to="/auth/login" replace />
	}
]);

(async function() {
	if (import.meta.env.DEV && !window.NL_TOKEN) {
		try {
			// method 1
			const storedToken = sessionStorage.getItem('NL_TOKEN');
			if (storedToken) {
				window.NL_TOKEN = storedToken;
			} else {
				// method 2
				const authInfo = await import('../.tmp/auth_info.json');
				const { nlToken, nlPort } = authInfo;
				window.NL_PORT = nlPort;
				window.NL_TOKEN = nlToken;
				window.NL_ARGS = [
					'bin\\neutralino-win_x64.exe',
					'',
					'--load-dir-res',
					'--path=.',
					'--export-auth-info',
					'--neu-dev-extension',
					'--neu-dev-auto-reload',
					'--window-enable-inspector',
				];
			}
		} catch {
			console.error('Auth file not found, native API calls will not work.');
		}
	}

	init();

	// Create a wrapper component that provides both the router and auth context
	const App = () => {
		// Check if the user is already authenticated
		const initialEntry = pb.authStore.isValid ? '/' : '/auth/login';
		console.log("Initial entry:", initialEntry);

		// Create a router instance with the initial entry
		const routerInstance = createMemoryRouter(router.routes, {
			initialEntries: [initialEntry]
		});

		return (
			<ThemeProvider defaultTheme="dark">
				<Toaster position="top-right" theme="dark" richColors />
				<AuthProvider>
					<RouterProvider router={routerInstance} />
				</AuthProvider>
			</ThemeProvider>
		);
	};

	ReactDOM.createRoot(document.getElementById('root')).render(
		<React.StrictMode>
			<App />
		</React.StrictMode>
	);

	events.on('windowClose', () => app.exit());

	neuWindow.focus();
})();
