import { getPromptsAction } from "@/app/actions/prompt.actions";
import { Suspense } from "react";
import { SidebarContent } from "./sidebar-content";

export async function Sidebar() {
  const prompts = await getPromptsAction();
  return (
    <Suspense>
      <SidebarContent prompts={prompts} />
    </Suspense>
  );
}
