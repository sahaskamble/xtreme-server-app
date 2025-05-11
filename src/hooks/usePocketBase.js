import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbase/pb';

export function usePocketBase() {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for authentication changes
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setIsAuthenticated(pb.authStore.isValid);
      setCurrentUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Login function
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const authData = await pb.collection('xtreme_users').authWithPassword(username, password);
      return authData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    pb.authStore.clear();
  }, []);

  // Generic fetch function
  const fetchData = useCallback(async (collection, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection(collection).getList(1, 50, options);
      return records;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single record
  const fetchOne = useCallback(async (collection, id, options = {}) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection(collection).getOne(id, options);
      return record;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a record
  const createRecord = useCallback(async (collection, data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection(collection).create(data);
      return record;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a record
  const updateRecord = useCallback(async (collection, id, data) => {
    setLoading(true);
    setError(null);
    try {
      const record = await pb.collection(collection).update(id, data);
      return record;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a record
  const deleteRecord = useCallback(async (collection, id) => {
    setLoading(true);
    setError(null);
    try {
      await pb.collection(collection).delete(id);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async (options = {}) => {
    return fetchData('customers', options);
  }, [fetchData]);

  // Fetch devices
  const fetchDevices = useCallback(async (options = {}) => {
    return fetchData('devices', options);
  }, [fetchData]);

  // Fetch sessions
  const fetchSessions = useCallback(async (options = {}) => {
    return fetchData('sessions', options);
  }, [fetchData]);

  return {
    pb,
    isAuthenticated,
    currentUser,
    loading,
    error,
    login,
    logout,
    fetchData,
    fetchOne,
    createRecord,
    updateRecord,
    deleteRecord,
    fetchCustomers,
    fetchDevices,
    fetchSessions
  };
}
