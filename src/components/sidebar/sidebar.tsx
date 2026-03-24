import { getPromptsAction } from "@/app/actions/prompt.actions";
import { SidebarContent } from "./sidebar-content";

export async function Sidebar() {
  const prompts = await getPromptsAction();
  return <SidebarContent prompts={prompts} />;
}
