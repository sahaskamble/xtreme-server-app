
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";
import { PendingPaymentsProvider } from "@/contexts/PendingPaymentsContext";

const Layout = () => {
  return (
    <PendingPaymentsProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <Navbar className="flex-shrink-0 w-full z-50" />
        <main className="flex-1 overflow-hidden w-full">
          <Outlet />
        </main>
      </div>
    </PendingPaymentsProvider>
  );
};

export default Layout;
