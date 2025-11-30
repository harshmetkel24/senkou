import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { NotFound } from "@/components/helpers/NotFound";
import { FloatingHelpButton } from "../components/helpers/FloatingHelpButton";
import { HotkeysHandlers } from "../components/helpers/HotkeysHandlers";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import { MainContent } from "../components/layouts/MainContent";
import Sidebar from "../components/layouts/Sidebar";
import { Toaster } from "../components/ui/sonner";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Senkou",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  notFoundComponent: NotFound,
  shellComponent: RootDocument,
});

const pathsToExcludeSidebar = ["/login", "/register"];

function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const sidebarVisible = pathsToExcludeSidebar.includes(pathname);

  return (
    <html lang="en" data-theme="senkou-dark" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="relative min-h-screen  bg-background text-foreground">
        {/* WIP: enbling this makes input in /login and /register forms unusable */}
        {/* <StarlightBackground /> */}
        <HotkeysHandlers />
        {!sidebarVisible ? (
          <>
            <Sidebar />
            <Header />
            <MainContent>{children}</MainContent>
            <Footer />
            <FloatingHelpButton />
          </>
        ) : (
          <>{children}</>
        )}
        {process.env.NODE_ENV === "development" && (
          <TanStackDevtools
            config={{
              position: "bottom-left",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        )}
        <Toaster />
        <Scripts />
      </body>
    </html>
  );
}
