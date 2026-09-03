import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type NotificationCenterOverlayContextValue = {
  isNotificationCenterOpen: boolean;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
};

const NotificationCenterOverlayContext = createContext<NotificationCenterOverlayContextValue | null>(null);

export function NotificationCenterOverlayProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({
    isNotificationCenterOpen: open,
    openNotificationCenter: () => setOpen(true),
    closeNotificationCenter: () => setOpen(false),
  }), [open]);
  return <NotificationCenterOverlayContext.Provider value={value}>{children}</NotificationCenterOverlayContext.Provider>;
}

export function useNotificationCenterOverlay() {
  const context = useContext(NotificationCenterOverlayContext);
  if (!context) throw new Error("useNotificationCenterOverlay must be used inside NotificationCenterOverlayProvider");
  return context;
}