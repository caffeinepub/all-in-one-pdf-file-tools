import { AppHeader } from "@/components/AppHeader";
import { CATEGORIES, colorClasses } from "@/data/tools";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export function Home() {
  const navigate = useNavigate();

  const ocids: Record<string, string> = {
    convert: "home.convert_card",
    edit: "home.edit_card",
    organize: "home.organize_card",
    optimize: "home.optimize_card",
    images: "home.images_card",
  };

  return (
    <div className="page-container">
      <AppHeader title="PDF & File Tools" />
      <main className="px-4 pt-5 pb-4 safe-bottom">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            All-in-One Toolkit
          </h2>
          <p className="text-sm text-muted-foreground">
            Convert, edit, and optimize your files instantly
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat, i) => {
            const colors = colorClasses[cat.color];
            const Icon = cat.icon;
            return (
              <motion.button
                key={cat.id}
                data-ocid={ocids[cat.id]}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate({ to: cat.path })}
                className="w-full text-left bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all duration-200 border border-border"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${colors.icon}`}
                  >
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">
                      {cat.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {cat.subtitle}
                    </div>
                    <div className="text-xs text-muted-foreground/60 mt-0.5">
                      {cat.tools.length} tools available
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            All processing happens in your browser — your files never leave your
            device.
          </p>
        </div>
      </main>
    </div>
  );
}
