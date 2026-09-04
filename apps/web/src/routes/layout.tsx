import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastProvider } from "../components/Toaster";

export function RootLayout() {
  return (
    <ToastProvider>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </ToastProvider>
  );
}
