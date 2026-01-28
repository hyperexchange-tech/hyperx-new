import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Send as SendIcon,
  Download,
  RefreshCw,
  Settings as SettingsIcon,
  Menu,
  MoreVertical,
  X,
  Bitcoin,
  Wallet,
  LogOut,
  LogIn,
  Repeat,
  History,
  Globe,
  Bell,
  CreditCard,
  Search,
  MessageSquare,
  Grid3x3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useModal } from "@/context/ModalContext";
import NotificationModal from "@/components/modals/NotificationModal";

const HeadsetIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4.285 8.344C3.70091 8.50127 3.18497 8.84674 2.81708 9.32689C2.44919 9.80705 2.24987 10.3951 2.25 11V14C2.25 14.7293 2.53973 15.4288 3.05546 15.9445C3.57118 16.4603 4.27065 16.75 5 16.75H7.5C7.69891 16.75 7.88968 16.671 8.03033 16.5303C8.17098 16.3897 8.25 16.1989 8.25 16V9C8.25 8.80109 8.17098 8.61032 8.03033 8.46967C7.88968 8.32902 7.69891 8.25 7.5 8.25H5.815C6.244 5.78 8.759 3.75 12 3.75C15.241 3.75 17.756 5.78 18.185 8.25H16.5C16.3011 8.25 16.1103 8.32902 15.9697 8.46967C15.829 8.61032 15.75 8.80109 15.75 9V16C15.75 16.414 16.086 16.75 16.5 16.75H18.163C17.9942 17.4619 17.59 18.096 17.016 18.5497C16.442 19.0034 15.7317 19.2502 15 19.25H13.855C13.6809 18.8197 13.3627 18.4634 12.9547 18.2421C12.5467 18.0207 12.0745 17.9482 11.6189 18.0368C11.1633 18.1255 10.7528 18.3698 10.4576 18.728C10.1624 19.0862 10.001 19.5359 10.001 20C10.001 20.4641 10.1624 20.9138 10.4576 21.272C10.7528 21.6302 11.1633 21.8745 11.6189 21.9632C12.0745 22.0518 12.5467 21.9793 12.9547 21.7579C13.3627 21.5366 13.6809 21.1803 13.855 20.75H15C17.4 20.75 19.384 18.97 19.705 16.659C20.2914 16.5035 20.81 16.1583 21.1799 15.6774C21.5497 15.1965 21.7502 14.6067 21.75 14V11C21.7501 10.3951 21.5508 9.80705 21.1829 9.32689C20.815 8.84674 20.2991 8.50127 19.715 8.344C19.333 4.84 15.926 2.25 12 2.25C8.074 2.25 4.667 4.84 4.285 8.344Z" fill="currentColor"/>
  </svg>
);

const CustomHomeIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M18.7497 5.92085L27.3043 12.9456C27.7856 13.3394 28.0728 13.9461 28.0728 14.5936V27.4313C28.0728 28.6184 27.1424 29.5313 26.056 29.5313H22.2395V22.6042C22.2395 21.5406 21.817 20.5205 21.0649 19.7684C20.3128 19.0163 19.2927 18.5938 18.2291 18.5938H16.7708C15.7071 18.5938 14.6871 19.0163 13.935 19.7684C13.1829 20.5205 12.7604 21.5406 12.7604 22.6042V29.5313H8.94389C7.85743 29.5313 6.92702 28.6184 6.92702 27.4313V14.595C6.92702 13.9461 7.21431 13.3409 7.69556 12.9471L16.2501 5.91939C16.6012 5.62737 17.0433 5.46749 17.4999 5.46749C17.9565 5.46749 18.3987 5.62883 18.7497 5.92085ZM26.056 31.7173C28.4039 31.7173 30.2603 29.7704 30.2603 27.4298V14.5936C30.262 13.9557 30.1223 13.3253 29.8512 12.7479C29.5802 12.1704 29.1845 11.6602 28.6926 11.254L20.1395 4.22918C19.3972 3.61581 18.4643 3.28027 17.5014 3.28027C16.5384 3.28027 15.6056 3.61581 14.8633 4.22918L6.30722 11.2554C5.81539 11.6617 5.4197 12.1719 5.14863 12.7493C4.87756 13.3268 4.73783 13.9571 4.73952 14.595V27.4313C4.73952 29.7719 6.59598 31.7188 8.94389 31.7188L26.056 31.7173Z" fill="currentColor"/>
  </svg>
);

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [headerTab, setHeaderTab] = useState("wallet");
  const { getTotalBalance, currentSection } = useWallet();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { isModalOpen } = useModal();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/swap", label: "Swap", icon: Repeat },
    { path: "/explorer", label: "Explorer", icon: Globe },
    { path: "/convert", label: "Convert", icon: RefreshCw },
    { path: "/history", label: "History", icon: History },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getUserInitials = () => {
    if (!user || !user.email) return "USER";
    return user.email.substring(0, 5).toUpperCase();
  };

  const getUserName = () => {
    if (!user || !user.email) return "User";
    const emailPrefix = user.email.split('@')[0];
    return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); 
  };
  
  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleHelpClick = () => {
    console.log('Help clicked');
  };

  const notifications = [
    {
      id: 1,
      type: "deposit",
      title: "Deposit Received",
      message: "Your Bitcoin deposit has been confirmed and added to your wallet.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
      amount: "0.00125",
      currency: "BTC"
    },
    {
      id: 2,
      type: "promotion",
      title: "Special Offer: 0% Trading Fees",
      message: "Trade with zero fees for the next 24 hours! Limited time offer for premium users.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: false
    },
    {
      id: 3,
      type: "security",
      title: "New Login Detected",
      message: "We detected a new login from Chrome on Windows. If this wasn't you, please secure your account.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      isRead: true
    },
  ];

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  // Check if current route is explorer or receive to apply full-screen layout
  const isExplorerPage = location.pathname === '/explorer';
  const isReceivePage = location.pathname === '/receive';
  const isConvertPage = location.pathname === '/convert';
  const isSwapPage = location.pathname === '/swap';
  const isHistoryPage = location.pathname === '/history';
  const isInternalTransferPage = location.pathname === '/internal-transfer';
  const isSendPage = location.pathname === '/send';
  const isSendFiatPage = location.pathname === '/send-fiat';
  const isFullScreenPage = isExplorerPage || isReceivePage || isConvertPage || isSwapPage || isHistoryPage || isInternalTransferPage || isSendPage || isSendFiatPage;

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-black">
      {!isFullScreenPage && user && (
        <header className="sticky top-0 z-50 md:hidden bg-black backdrop-blur-md border-b border-border/20">
          <div className="flex items-center justify-between px-5 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="h-10 w-10 text-foreground hover:bg-muted/50 rounded-lg"
            >
              <img src="/menu.svg" alt="Menu" className="w-6 h-4 brightness-0 dark:brightness-100 invert dark:invert-0" />
            </Button>

            <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1">
              <button
                onClick={() => {
                  setHeaderTab("wallet");
                  navigate("/");
                }}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  headerTab === "wallet"
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Wallet
              </button>
              <button
                onClick={() => {
                  setHeaderTab("web3");
                  navigate("/explorer");
                }}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  headerTab === "web3"
                    ? "bg-foreground text-background shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Web3
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-foreground hover:bg-muted/50 rounded-lg"
                onClick={handleHelpClick}
              >
                <HeadsetIcon size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-foreground hover:bg-muted/50 rounded-lg relative"
                onClick={() => setIsNotificationModalOpen(true)}
              >
                <Bell size={20} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-semibold">
                    {unreadNotificationsCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </header>
      )}

      {!isFullScreenPage && !user && (
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:hidden bg-black backdrop-blur-md border-b border-border/30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white dark:bg-white flex items-center justify-center border-2 border-primary/30 overflow-hidden">
              <img
                src="/my-new-logo.png"
                alt="HyperX Logo"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-bold text-lg">HyperX</span>
          </Link>
        </header>
      )}

      {user && (
        <motion.aside
          className={cn(
            "bg-black fixed inset-0 z-40 flex flex-col scrollable-area border-r border-border/30 p-6 md:relative md:w-64 md:translate-x-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          initial={false}
          animate={{
            translateX: isMobileMenuOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 768 ? "-100%" : 0)
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              <span className="font-bold text-2xl">HyperX</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              <X />
            </Button>
          </div>

          <div className="crypto-card rounded-xl p-4 mb-8">
            <div
              className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                navigate('/profile');
                setIsMobileMenuOpen(false);
              }}
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-white flex items-center justify-center border-2 border-primary/30 overflow-hidden shrink-0">
                <img
                  src="/my-new-logo.png"
                  alt="HyperX Logo"
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">Hi, {getUserName()}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="border-t border-border/50 pt-3">
              <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
              <h2 className="text-2xl font-bold">${getTotalBalance().toLocaleString('en-US', { maximumFractionDigits: 2 })}</h2>
            </div>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-muted relative",
                    isActive ? "bg-muted text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 h-full w-1 rounded-r-full bg-primary"
                      layoutId="sidebar-highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 space-y-2">
            {user ? (
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            ) : (
              <Button variant="default" className="w-full crypto-gradient" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bitcoin className="h-4 w-4" />
              <span>Powered by HyperX Inc.</span>
            </div>
          </div>
        </motion.aside>
      )}

      {user && isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-30 bg-black/80 backdrop-blur-sm md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <main className={cn(
        "flex-1 scrollable-area",
        !user && "md:ml-0",
        isFullScreenPage ? "p-0" : "p-4 md:p-8 pb-20 md:pb-8"
      )}>{children}</main>

      {!isModalOpen && user && (location.pathname === "/" || location.pathname === "/explorer" || location.pathname === "/card") && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-black/95 backdrop-blur-md md:hidden">
          <div className="flex justify-around items-center h-16">
            {[
              { path: "/", label: "Home", icon: CustomHomeIcon },
              {
                path: currentSection === "fiat" ? "/fiat-convert" : "/swap",
                label: currentSection === "fiat" ? "Forex" : "Swap",
                icon: Repeat,
                dynamicPath: true,
                needsState: true
              },
              { path: "/card", label: "Card", icon: CreditCard },
            ].map((item) => {
              const isActive = item.dynamicPath
                ? (currentSection === "fiat" ? location.pathname === "/fiat-convert" : location.pathname === "/swap")
                : location.pathname === item.path;
              const Icon = item.icon;

              if (item.needsState) {
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (currentSection === "fiat") {
                        navigate(item.path, { state: { fromFiat: true } });
                      } else {
                        navigate(item.path, { state: { fromCrypto: true } });
                      }
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-full transition-colors duration-200 relative",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-6 w-6 mb-0.5", isActive && "text-primary")} />
                    <span className="text-xs">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 h-0.5 w-1/2 rounded-t-full bg-primary"
                        layoutId="bottom-nav-highlight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full transition-colors duration-200 relative",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-0.5", isActive && "text-primary")} />
                  <span className="text-xs">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 h-0.5 w-1/2 rounded-t-full bg-primary"
                      layoutId="bottom-nav-highlight"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
      />
    </div>
  );
};

export default Layout;