import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ToastProvider } from "../components/Toaster";

export function RootLayout() {
  return (
    <ToastProvider>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ToastProvider>
  );
}
