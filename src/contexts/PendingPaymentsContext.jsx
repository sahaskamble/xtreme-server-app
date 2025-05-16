import { createContext, useContext, useState } from 'react';

// Create the context
const PendingPaymentsContext = createContext(undefined);

// Create a provider component
export function PendingPaymentsProvider({ children }) {
  const [pendingPaymentsOpen, setPendingPaymentsOpen] = useState(false);

  const openPendingPayments = () => setPendingPaymentsOpen(true);
  const closePendingPayments = () => setPendingPaymentsOpen(false);
  const togglePendingPayments = () => setPendingPaymentsOpen(prev => !prev);

  // The value that will be provided to consumers of this context
  const value = {
    pendingPaymentsOpen,
    setPendingPaymentsOpen,
    openPendingPayments,
    closePendingPayments,
    togglePendingPayments
  };

  return (
    <PendingPaymentsContext.Provider value={value}>
      {children}
    </PendingPaymentsContext.Provider>
  );
}

// Custom hook to use the context
export function usePendingPayments() {
  const context = useContext(PendingPaymentsContext);
  if (context === undefined) {
    throw new Error('usePendingPayments must be used within a PendingPaymentsProvider');
  }
  return context;
}
