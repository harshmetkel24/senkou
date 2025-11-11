import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";


import { FloatingHelpButton } from "../components/helpers/FloatingHelpButton";
import { HotkeysHandlers } from "../components/helpers/HotkeysHandlers";
import { StarlightBackground } from "../components/helpers/StarlightBackground";
import Header from "../components/layouts/Header";
import { MainContent } from "../components/layouts/MainContent";
import Sidebar from "../components/layouts/Sidebar";

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

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="senkou-dark" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="relative min-h-screen  bg-background text-foreground">
        <StarlightBackground />
        <HotkeysHandlers />
        <Sidebar />
        <Header />
        <MainContent>{children}</MainContent>
        <FloatingHelpButton />
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
        <Scripts />
      </body>
    </html>
  );
}
