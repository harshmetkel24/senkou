import { Link } from "@tanstack/react-router";
import { Home, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navLinkBaseClasses =
    "flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";

  return (
    <>
      <header className="p-4 flex items-center bg-sidebar text-sidebar-foreground shadow-lg">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg transition-colors hover:bg-sidebar-accent"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold">
          <Link to="/">
            <img
              src="/senkou-circle-logo.png"
              alt="Senkou Logo"
              className="w-16 h-16"
            />
          </Link>
        </h1>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-sidebar text-sidebar-foreground shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-r border-sidebar-border ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-xl font-bold">先光</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg transition-colors hover:bg-sidebar-accent"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className={navLinkBaseClasses}
            activeProps={{
              className:
                `${navLinkBaseClasses} bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90`,
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  );
}
