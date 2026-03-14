"use client";

import { cn } from "@/lib/utils";
import { ArrowLeftToLine, ArrowRightToLine, Plus, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useState } from "react";
import { Logo } from "../logo";
import { PromptList } from "../prompts";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

type Props = {
  id: string;
  title: string;
  content: string;
};

export type SidebarContentProps = {
  prompts: Props[];
};

export function SidebarContent({ prompts }: SidebarContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function collapseSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  function expandSidebar() {
    setIsCollapsed(false);
  }

  function handleNewPrompt() {
    router.push("/new");
  }

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setQuery(value);

    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      router.replace(`/?${params.toString()}`, { scroll: false });
    });
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

          <div className="flex flex-col items-center space-y-4">
            <Button onClick={handleNewPrompt} aria-label="Novo prompt" title="Novo prompt">
              <Plus className="w-5 h-5 text-white" />
            </Button>
          </div>
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
                  title="Minimizar sidebar"
                  aria-label="Minimizar sidebar"
                >
                  <ArrowLeftToLine className="size-5 text-gray-100" />
                </Button>
              </header>
            </div>

            <section className="mb-5">
              <form action="">
                <Input
                  name="q"
                  value={query}
                  onChange={handleQueryChange}
                  type="text"
                  placeholder="Buscar prompts..."
                  autoFocus
                />
              </form>
            </section>

            <div>
              <Button onClick={handleNewPrompt} variant={"default"} size={"lg"} className="w-full">
                <Plus className="size-5 mr-2" />
                Novo prompt
              </Button>
            </div>
          </section>

          <nav className="flex-1 overflow-auto px-6 pb-6" aria-label="Lista de prompts">
            <PromptList prompts={prompts} />
          </nav>
        </>
      )}
    </aside>
  );
}
