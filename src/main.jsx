import React from 'react';
import ReactDOM from 'react-dom/client';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
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

const router = createMemoryRouter([
	{
		path: '/',
		element: <Layout />,
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

	ReactDOM.createRoot(document.getElementById('root')).render(
		<React.StrictMode>
			<ThemeProvider defaultTheme="dark">
				<RouterProvider router={router} />
			</ThemeProvider>
		</React.StrictMode>
	);

	events.on('windowClose', () => app.exit());

	neuWindow.focus();
})();
