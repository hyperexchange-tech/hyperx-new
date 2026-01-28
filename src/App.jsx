import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Send from "@/pages/Send";
import Receive from "@/pages/Receive";
import Swap from "@/pages/Swap";
import Convert from "@/pages/Convert";
import Settings from "@/pages/Settings";
import HistoryPage from "@/pages/HistoryPage";
import InternalTransfer from "@/pages/InternalTransfer";
import ExplorerPage from "@/pages/ExplorerPage";
import InternalFiatTransfer from "@/pages/InternalFiatTransfer";
import SendFiat from "@/pages/SendFiat";
import BillPayments from "@/pages/BillPayments";
import FiatConvert from "@/pages/FiatConvert";
import AssetChart from "@/pages/AssetChart";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import OtpVerification from "@/pages/OtpVerification";
import PasswordReset from "@/components/auth/PasswordReset";
import WelcomeAndPinSetup from "@/pages/WelcomeAndPinSetup";
import Profile from "@/pages/Profile";
import GiftCard from "@/pages/GiftCard";
import { WalletProvider } from "@/context/WalletContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading && !user) { 
    return (
      <div className="min-h-screen flex items-center justify-center bg-background bg-mesh text-foreground">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/my-new-logo.png" 
            alt="HyperX Logo" 
            className="w-24 h-24 object-contain drop-shadow-lg animate-pulse"
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background bg-mesh text-foreground">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<OtpVerification />} />
        <Route path="/forgot-password" element={<PasswordReset />} />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <ModalProvider>
                <WalletProvider>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/send" element={<Send />} />
                      <Route path="/internal-transfer" element={<InternalTransfer />} />
                      <Route path="/receive" element={<Receive />} />
                      <Route path="/swap" element={<Swap />} />
                      <Route path="/convert" element={<Convert />} />
                      <Route path="/internal-fiat-transfer" element={<InternalFiatTransfer />} />
                      <Route path="/send-fiat" element={<SendFiat />} />
                      <Route path="/bill-payments" element={<BillPayments />} />
                      <Route path="/fiat-convert" element={<FiatConvert />} />
                      <Route path="/asset-chart" element={<AssetChart />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/history" element={<HistoryPage />} />
                      <Route path="/explorer" element={<ExplorerPage />} />
                      <Route path="/giftcard" element={<GiftCard />} />
                      <Route path="/setup-pin" element={<WelcomeAndPinSetup />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </WalletProvider>
              </ModalProvider>
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </div>
  );
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;