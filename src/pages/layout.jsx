
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/ui/navbar";

const Layout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar className="flex-shrink-0" />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
