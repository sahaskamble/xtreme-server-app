import { useState, useEffect, useCallback, useRef } from 'react';
import { usePocketBase } from './usePocketBase';

/**
 * A hook for subscribing to PocketBase realtime updates for a collection
 *
 * @param {string} collectionName - The name of the collection to subscribe to
 * @param {Object} options - Options for the subscription
 * @param {string} options.filter - Filter for the subscription (e.g. "id='123'" or "created > '2022-01-01'")
 * @param {boolean} options.fetchInitial - Whether to fetch initial data (default: true)
 * @param {Object} options.queryParams - Additional query parameters for the initial fetch
 * @param {boolean} options.autoCancel - Whether to automatically cancel the subscription on unmount (default: true)
 * @returns {Object} - { data, loading, error, subscribe, unsubscribe }
 */
export function useRealTime(collectionName, options = {}) {
  const {
    filter = '',
    fetchInitial = true,
    queryParams = {},
    autoCancel = true
  } = options;

  const { pb, fetchData } = usePocketBase();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(fetchInitial);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const unsubscribeRef = useRef(null);

  // Function to fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!fetchInitial) return;

    setLoading(true);
    setError(null);
    try {
      const result = await fetchData(collectionName, {
        filter,
        ...queryParams
      });
      setData(result?.items || []);
    } catch (err) {
      console.error(`Error fetching initial data for ${collectionName}:`, err);
      setError(err.message || "Failed to fetch data");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [collectionName, fetchData, fetchInitial, filter, queryParams]);

  // Function to subscribe to realtime updates
  const subscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      return;
    }

    try {
      // Subscribe to the collection
      const unsubscribe = pb.collection(collectionName).subscribe('*', function(e) {
        const { action, record } = e;

        setData(prevData => {
          // Handle different actions
          switch (action) {
            case 'create':
              // Add the new record to the data
              return [...prevData, record];

            case 'update':
              // Update the record in the data
              return prevData.map(item =>
                item.id === record.id ? { ...item, ...record } : item
              );

            case 'delete':
              // Remove the record from the data
              return prevData.filter(item => item.id !== record.id);

            default:
              return prevData;
          }
        });
      });

      // Store the unsubscribe function
      unsubscribeRef.current = unsubscribe;
      setIsSubscribed(true);

      return unsubscribe;
    } catch (err) {
      console.error(`Error subscribing to ${collectionName}:`, err);
      setError(err.message || "Failed to subscribe");
    }
  }, [collectionName, pb]);

  // Function to unsubscribe from realtime updates
  const unsubscribe = useCallback(() => {
    if (!unsubscribeRef.current) {
      // No need to warn, just return silently
      return;
    }

    try {
      // Call the unsubscribe function
      unsubscribeRef.current();
    } catch (err) {
      console.error(`Error unsubscribing from ${collectionName}:`, err);
      setError(err.message || "Failed to unsubscribe");
    } finally {
      // Always clean up the ref and state, even if there was an error
      unsubscribeRef.current = null;
      setIsSubscribed(false);
    }
  }, [collectionName]);

  // Fetch initial data and subscribe on mount
  useEffect(() => {
    // Fetch initial data
    fetchInitialData();

    // Subscribe to realtime updates
    subscribe();

    // Unsubscribe on unmount if autoCancel is true
    return () => {
      if (autoCancel) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName]);

  return {
    data,
    loading,
    error,
    isSubscribed,
    subscribe,
    unsubscribe,
    refresh: fetchInitialData
  };
}

/**
 * A hook for subscribing to PocketBase realtime updates for a specific record
 *
 * @param {string} collectionName - The name of the collection
 * @param {string} recordId - The ID of the record to subscribe to
 * @param {Object} options - Options for the subscription
 * @param {boolean} options.fetchInitial - Whether to fetch initial data (default: true)
 * @param {boolean} options.autoCancel - Whether to automatically cancel the subscription on unmount (default: true)
 * @returns {Object} - { data, loading, error, subscribe, unsubscribe }
 */
export function useRealTimeRecord(collectionName, recordId, options = {}) {
  const {
    fetchInitial = true,
    autoCancel = true
  } = options;

  const { pb, fetchOne } = usePocketBase();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(fetchInitial);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const unsubscribeRef = useRef(null);

  // Function to fetch initial data
  const fetchInitialData = useCallback(async () => {
    if (!fetchInitial || !recordId) return;

    setLoading(true);
    setError(null);
    try {
      const record = await fetchOne(collectionName, recordId);
      setData(record);
    } catch (err) {
      console.error(`Error fetching record ${recordId} from ${collectionName}:`, err);
      setError(err.message || "Failed to fetch record");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [collectionName, fetchOne, fetchInitial, recordId]);

  // Function to subscribe to realtime updates
  const subscribe = useCallback(() => {
    if (unsubscribeRef.current || !recordId) {
      // If already subscribed or no recordId, just return silently
      return;
    }

    try {
      // Subscribe to the record
      const unsubscribe = pb.collection(collectionName).subscribe(recordId, function(e) {
        const { action, record } = e;

        // Handle different actions
        switch (action) {
          case 'update':
            // Update the record
            setData(prevData => ({ ...prevData, ...record }));
            break;

          case 'delete':
            // Set data to null if the record is deleted
            setData(null);
            break;

          default:
            break;
        }
      });

      // Store the unsubscribe function
      unsubscribeRef.current = unsubscribe;
      setIsSubscribed(true);

      return unsubscribe;
    } catch (err) {
      console.error(`Error subscribing to ${collectionName}/${recordId}:`, err);
      setError(err.message || "Failed to subscribe to record");
    }
  }, [collectionName, pb, recordId]);

  // Function to unsubscribe from realtime updates
  const unsubscribe = useCallback(() => {
    if (!unsubscribeRef.current) {
      // No need to warn, just return silently
      return;
    }

    try {
      // Call the unsubscribe function
      unsubscribeRef.current();
    } catch (err) {
      console.error(`Error unsubscribing from ${collectionName}/${recordId}:`, err);
      setError(err.message || "Failed to unsubscribe from record");
    } finally {
      // Always clean up the ref and state, even if there was an error
      unsubscribeRef.current = null;
      setIsSubscribed(false);
    }
  }, [collectionName, recordId]);

  // Fetch initial data and subscribe on mount
  useEffect(() => {
    // Fetch initial data
    fetchInitialData();

    // Subscribe to realtime updates
    subscribe();

    // Unsubscribe on unmount if autoCancel is true
    return () => {
      if (autoCancel) {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, recordId]);

  return {
    data,
    loading,
    error,
    isSubscribed,
    subscribe,
    unsubscribe,
    refresh: fetchInitialData
  };
}
