import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbase/pb';

// Create the auth context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children, router }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from PocketBase
  useEffect(() => {
    // Check if user is already authenticated
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.record);
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Subscribe to auth state changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setIsAuthenticated(pb.authStore.isValid);
      setCurrentUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Create login log
  const createLoginLog = async (userId, status = 'success', details = null) => {
    try {
      const logData = {
        user: userId,
        login: new Date().toISOString(),
        logout: null,
        ip: window.location.hostname,
        user_agent: navigator.userAgent,
        status
      };

      if (details) {
        logData.details = details;
      }

      const record = await pb.collection('login_logs').create(logData);
      console.log('Login log created:', record);
      return record;
    } catch (error) {
      console.error('Error creating login log:', error);
      return null;
    }
  };

  // Login function
  const login = async (username, password, navigate) => {
    setIsLoading(true);
    try {
      // Authenticate with PocketBase
      const authData = await pb.collection('xtreme_users').authWithPassword(username, password);

      // Check if user has the Admin role
      if (authData.record.role !== "Admin") {
        // If not admin, log the attempt and throw error
        await createLoginLog(null, 'failed', `User ${username} is not an admin (role: ${authData.record.role || 'none'})`);
        pb.authStore.clear(); // Clear auth
        throw new Error('Access denied. Admin privileges required.');
      }

      // Create login log for successful login
      await createLoginLog(authData.record.id);

      setCurrentUser(authData.record);
      setIsAuthenticated(true);
      toast.success('Login successful!');

      // Use the navigate function if provided
      if (navigate) {
        navigate('/');
      }

      return authData;
    } catch (error) {
      // Log failed login attempt
      await createLoginLog(null, 'failed', `Failed login attempt for username: ${username}`);

      // Show error message
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (navigateFn) => {
    console.log("AuthContext: logout called with navigateFn:", navigateFn);
    try {
      // Update login log with logout time if user was authenticated
      if (currentUser) {
        console.log("AuthContext: Logging out user:", currentUser.id);
        try {
          // Find the most recent login log for this user
          const loginLogs = await pb.collection('login_logs').getList(1, 1, {
            filter: `user = "${currentUser.id}" && status = "success" && logout = null`,
            sort: '-created'
          });

          console.log("AuthContext: Found login logs:", loginLogs.items.length);

          // If found, update with logout time
          if (loginLogs.items.length > 0) {
            const latestLog = loginLogs.items[0];
            await pb.collection('login_logs').update(latestLog.id, {
              logout: new Date().toISOString(),
              status: 'logged_out'
            });
            console.log("AuthContext: Updated login log with logout time");
          }
        } catch (logError) {
          console.error("Error updating login logs:", logError);
          // Continue with logout even if log update fails
        }
      }

      // Clear auth store
      console.log("AuthContext: Clearing auth store");
      pb.authStore.clear();
      setCurrentUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');

      // Use the navigate function if provided
      if (navigateFn) {
        console.log("AuthContext: Navigating to login page");
        navigateFn('/auth/login');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error logging out');

      // Force logout anyway
      console.log("AuthContext: Force clearing auth store after error");
      pb.authStore.clear();
      setCurrentUser(null);
      setIsAuthenticated(false);

      // Use the navigate function if provided
      if (navigateFn) {
        console.log("AuthContext: Force navigating to login page after error");
        navigateFn('/auth/login');
      }
    }
  };

  // Check if user has admin role
  const isAdmin = () => {
    return currentUser?.role === "Admin";
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isAdmin,
    pb
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
