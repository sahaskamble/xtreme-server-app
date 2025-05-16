
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { PendingPaymentsProvider } from "@/contexts/PendingPaymentsContext";

const Layout = () => {
  return (
    <PendingPaymentsProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar className="flex-shrink-0" />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </PendingPaymentsProvider>
  );
};

export default Layout;
