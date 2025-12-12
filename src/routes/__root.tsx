import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { FloatingHelpButton } from "../components/helpers/FloatingHelpButton";
import { HotkeysHandlers } from "../components/helpers/HotkeysHandlers";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import { MainContent } from "../components/layouts/MainContent";
import Sidebar from "../components/layouts/Sidebar";
import { Toaster } from "../components/ui/sonner";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import { NotFound } from "@/components/helpers/NotFound";

import { getCurrentUserFn } from "@/lib/auth";
import type { AuthContextType } from "@/types";
import type { QueryClient } from "@tanstack/react-query";
import { ReactNode } from "react";

interface MyRouterContext {
  queryClient: QueryClient;
  user: AuthContextType;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: async ({ context }) => {
    const user = (await getCurrentUserFn()) || context.user;
    const userContextValue: AuthContextType = user
      ? {
          id: user?.id,
          email: user?.email,
          displayName: user?.displayName,
        }
      : undefined;
    return { user: userContextValue };
  },
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
  component: RootComponent,
});

const pathsToExcludeSidebar = ["/login", "/register"];

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="senkou-dark" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="relative min-h-screen  bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const sidebarVisible = pathsToExcludeSidebar.includes(pathname);

  return (
    <RootDocument>
      {/* WIP: enbling this makes input in /login and /register forms unusable */}
      {/* <StarlightBackground /> */}
      <HotkeysHandlers />
      {!sidebarVisible ? (
        <>
          <Sidebar />
          <div className="flex min-h-screen flex-col">
            <Header />
            <MainContent>
              <Outlet />
            </MainContent>
            <Footer />
          </div>
          <FloatingHelpButton />
        </>
      ) : (
        <Outlet />
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
    </RootDocument>
  );
}
