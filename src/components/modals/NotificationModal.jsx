import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownLeft, ArrowUpRight, Info, Tag, Gift, Shield, Bell, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "@/lib/date";
import { useModal } from "@/context/ModalContext";
import { useEffect } from "react";

const getNotificationIcon = (type) => {
  switch (type) {
    case "deposit":
      return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
    case "withdrawal":
      return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
    case "promotion":
      return <Gift className="h-5 w-5 text-purple-500" />;
    case "security":
      return <Shield className="h-5 w-5 text-blue-500" />;
    case "account":
      return <Info className="h-5 w-5 text-primary" />;
    case "system":
      return <Bell className="h-5 w-5 text-muted-foreground" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "warning":
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <Info className="h-5 w-5 text-muted-foreground" />;
  }
};

const getNotificationBg = (type) => {
  switch (type) {
    case "deposit":
      return "bg-green-500/10";
    case "withdrawal":
      return "bg-orange-500/10";
    case "promotion":
      return "bg-purple-500/10";
    case "security":
      return "bg-blue-500/10";
    case "account":
      return "bg-primary/10";
    case "system":
      return "bg-muted/10";
    case "success":
      return "bg-green-500/10";
    case "warning":
      return "bg-orange-500/10";
    default:
      return "bg-muted/10";
  }
};

const NotificationItem = ({ notification, index }) => {
  const { type, title, message, timestamp, isRead = false, amount, currency } = notification;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border transition-colors duration-200 cursor-pointer hover:bg-muted/30",
        isRead ? "bg-background border-border/50" : "bg-card border-border"
      )}
    >
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", getNotificationBg(type))}>
        {getNotificationIcon(type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className={cn("font-medium text-sm", !isRead && "font-semibold")}>
              {title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {message}
            </p>
            {amount && currency && (
              <p className="text-sm font-medium text-primary mt-1">
                {amount} {currency}
              </p>
            )}
          </div>
          {!isRead && (
            <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1"></div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(timestamp))}
          </span>
          {type === "promotion" && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-primary hover:text-primary">
              View Offer
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const NotificationModal = ({ isOpen, onClose, notifications = [] }) => {
  const { setModalOpen } = useModal();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen, setModalOpen]);

  const handleMarkAllRead = () => {
    // In a real app, this would update the notifications in the backend
    console.log("Mark all notifications as read");
  };

  const handleClearAll = () => {
    // In a real app, this would clear all notifications
    console.log("Clear all notifications");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className="relative w-full max-w-md bg-card rounded-t-2xl border border-border/50 shadow-2xl max-h-[85vh] overflow-hidden"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b border-border/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleClearAll}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">No notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    You're all caught up! New notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {notifications.map((notification, index) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4">
                <Button
                  variant="outline"
                  className="w-full h-10 bg-card/80 border-border/50 hover:bg-muted/30 text-foreground"
                  onClick={() => {
                    // In a real app, this would navigate to a full notifications page
                    console.log("View all notifications");
                  }}
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationModal;