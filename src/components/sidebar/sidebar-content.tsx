"use client";

import { cn } from "@/lib/utils";
import { ArrowLeftToLine, ArrowRightToLine, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "../logo";
import { Button } from "../ui/button";

export function SidebarContent() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  function collapseSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  function expandSidebar() {
    setIsCollapsed(false);
  }

  function handleNewPrompt() {
    router.prefetch("/new");
  }

  return (
    <aside
      className={cn(
        "border-r border-gray-700 flex flex-col h-full bg-gray-800 transition-[transform,width] duration-300 ease-in-out fixed md:relative left-0 top-0 z-50 md:z-auto w-[80vw] sm:w-[320px]",
        isCollapsed ? "md:w-18" : "md:w-[384px]"
      )}
    >
      {isCollapsed && (
        <section className="px-2 py-6">
          <header className="flex items-center justify-center mb-6">
            <Button
              onClick={expandSidebar}
              variant="icon"
              className="hidden md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
              aria-label="Expandir sidebar"
              title="Expandir sidebar"
            >
              <ArrowRightToLine className="size-5 text-gray-100" />
            </Button>
          </header>
        </section>
      )}

      {!isCollapsed && (
        <>
          <section className="p-6">
            <div className="md:hidden mb-4">
              <div className="flex items-center justify-between">
                <Button variant={"secondary"} aria-label="Fechar menu" title="Fechar menu">
                  <X className="size-5 text-gray-100" />
                </Button>
              </div>
            </div>

            <div className="flex w-full items-center justify-between mb-6">
              <header className="flex items-center justify-start">
                <Logo />
                <Button
                  onClick={collapseSidebar}
                  variant={"icon"}
                  className="hidder md:inline-flex p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-lg transition-colors"
                >
                  <ArrowLeftToLine className="size-5 text-gray-100" />
                </Button>
              </header>
            </div>

            <div>
              <Button onClick={handleNewPrompt} variant={"default"} size={"lg"} className="w-full">
                <Plus className="size-5 mr-2" />
                Novo prompt
              </Button>
            </div>
          </section>
        </>
      )}
    </aside>
  );
}
