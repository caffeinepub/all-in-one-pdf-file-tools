import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft, Moon, Sun } from "lucide-react";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
}

export function AppHeader({ title, showBack }: AppHeaderProps) {
  const router = useRouter();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[480px] mx-auto flex items-center h-14 px-4 gap-3">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.history.back()}
            className="shrink-0 -ml-2"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="flex-1 text-base font-semibold truncate">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          data-ocid="theme.toggle"
          aria-label="Toggle theme"
          className="shrink-0"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
