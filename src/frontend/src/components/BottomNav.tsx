import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Home,
  Image,
  LayoutList,
  PenLine,
  Zap,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", icon: Home, path: "/", ocid: "nav.home_link" },
  {
    label: "Convert",
    icon: ArrowLeftRight,
    path: "/convert",
    ocid: "nav.convert_link",
  },
  { label: "Edit", icon: PenLine, path: "/edit", ocid: "nav.edit_link" },
  {
    label: "Organize",
    icon: LayoutList,
    path: "/organize",
    ocid: "nav.organize_link",
  },
  {
    label: "Optimize",
    icon: Zap,
    path: "/optimize",
    ocid: "nav.optimize_link",
  },
  { label: "Images", icon: Image, path: "/images", ocid: "nav.images_link" },
];

export function BottomNav() {
  const location = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div
        className="max-w-[480px] mx-auto flex items-center justify-around h-16 px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {NAV_ITEMS.map(({ label, icon: Icon, path, ocid }) => {
          const active = location === path;
          return (
            <Link
              key={path}
              to={path}
              data-ocid={ocid}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 min-w-0 flex-1 relative",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 1.75} />
              <span
                className={cn(
                  "text-[10px] truncate w-full text-center",
                  active ? "font-semibold" : "font-medium",
                )}
              >
                {label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
