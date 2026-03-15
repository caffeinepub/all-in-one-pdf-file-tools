import { AppHeader } from "@/components/AppHeader";
import { type CategoryDef, colorClasses } from "@/data/tools";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

interface CategoryPageProps {
  category: CategoryDef;
}

export function CategoryPage({ category }: CategoryPageProps) {
  const navigate = useNavigate();
  const colors = colorClasses[category.color];

  return (
    <div className="page-container">
      <AppHeader title={category.name} showBack />
      <main className="px-4 pt-4 safe-bottom">
        <div className="grid grid-cols-2 gap-3">
          {category.tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  navigate({ to: "/tool/$toolId", params: { toolId: tool.id } })
                }
                className="text-left bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all duration-200 border border-border"
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${colors.icon}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="font-semibold text-xs text-foreground leading-tight">
                  {tool.name}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-snug line-clamp-2">
                  {tool.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
