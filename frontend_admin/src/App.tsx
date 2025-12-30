import { useEffect, useRef, useState } from "react";
import Sidebar from "./components/Sidebar";
import DashboardLayout from "./components/DashboardLayout";
import DashboardContent from "./components/DashboardContent";
import FreelancePackagePage from "./components/FreelancePackagePage";
import TeamPackagePage from "./components/TeamPackagePage";
import Floor1Page from "./components/Floor1Page";
import Floor2Page from "./components/Floor2Page";
import Floor3Page from "./components/Floor3Page";
import UserManagementPage from "./components/User_Management/UserManagement";
import Reports from "./components/Report/Reports";
import PaymentManagementPage from "./components/PaymentManagementPage";
import { Toaster } from "sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const userLoginUrl = (import.meta.env.VITE_USER_LOGIN_URL as string) || 'http://localhost:3000/login';
  const redirectingRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem('sw_token');
    const role = localStorage.getItem('sw_user_role');
    if (token && (role === 'admin' || role === 'superadmin')) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user_role');
    if (typeof window !== 'undefined') {
      redirectingRef.current = true;
      window.location.replace(userLoginUrl);
      return;
    }
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  useEffect(() => {
    if (!loading && !isAuthenticated && typeof window !== 'undefined' && !redirectingRef.current) {
      redirectingRef.current = true;
      window.location.replace(userLoginUrl);
    }
  }, [loading, isAuthenticated, userLoginUrl]);

  const wrapWithLayout = (content: JSX.Element) => (
    <DashboardLayout onNavigate={setCurrentPage}>{content}</DashboardLayout>
  );

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return wrapWithLayout(<DashboardContent />);
      case "service-freelance":
        return wrapWithLayout(<FreelancePackagePage />);
      case "service-team":
        return wrapWithLayout(<TeamPackagePage />);
      case "user-management":
        return wrapWithLayout(<UserManagementPage />);
      case "space-management":
        return wrapWithLayout(
          <div className="text-center py-20">
            <h2 className="text-[24px] font-semibold mb-2">Space Management</h2>
            <p className="text-gray-600">This page is under construction</p>
          </div>
        );
      case "floor-1":
        return wrapWithLayout(<Floor1Page />);
      case "floor-2":
        return wrapWithLayout(<Floor2Page />);
      case "floor-3":
        return wrapWithLayout(<Floor3Page />);
      case "payments":
        return wrapWithLayout(<PaymentManagementPage />);
      case "report":
        return wrapWithLayout(<Reports />);
      case "settings":
        return wrapWithLayout(
          <div className="text-center py-20">
            <h2 className="text-[24px] font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">This page is under construction</p>
          </div>
        );
      case "help-center":
        return wrapWithLayout(
          <div className="text-center py-20">
            <h2 className="text-[24px] font-semibold mb-2">Help Center</h2>
            <p className="text-gray-600">This page is under construction</p>
          </div>
        );
      default:
        return wrapWithLayout(
          <div className="text-center py-20">
            <h2 className="text-[24px] font-semibold mb-2">Page Not Found</h2>
            <p className="text-gray-600">The requested page does not exist</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-neutral-100">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
        {renderContent()}
      </div>
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}