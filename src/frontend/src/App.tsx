import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { CATEGORIES } from "@/data/tools";
import { useTheme } from "@/hooks/useTheme";
import { CategoryPage } from "@/pages/CategoryPage";
import { Home } from "@/pages/Home";
import { ToolPage } from "@/pages/ToolPage";
import {
  Outlet,
  RouterProvider,
  createBrowserHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

function RootLayout() {
  useTheme();
  return (
    <div className="min-h-dvh bg-background">
      <Outlet />
      <BottomNav />
      <Toaster position="top-center" richColors />
    </div>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const convertRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/convert",
  component: () => <CategoryPage category={CATEGORIES[0]} />,
});

const editRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit",
  component: () => <CategoryPage category={CATEGORIES[1]} />,
});

const organizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organize",
  component: () => <CategoryPage category={CATEGORIES[2]} />,
});

const optimizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/optimize",
  component: () => <CategoryPage category={CATEGORIES[3]} />,
});

const imagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/images",
  component: () => <CategoryPage category={CATEGORIES[4]} />,
});

const toolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tool/$toolId",
  component: ToolPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  convertRoute,
  editRoute,
  organizeRoute,
  optimizeRoute,
  imagesRoute,
  toolRoute,
]);

const history = createBrowserHistory();
const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
