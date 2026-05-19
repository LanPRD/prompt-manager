"use client";

import { createPromptAction, updatePromptAction } from "@/app/actions/prompt.actions";
import { CreatePromptDto, createPromptSchema } from "@/core/application/prompts/create-prompt.dto";
import type { Prompt } from "@/core/domain/prompts/prompt.entity";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CopyButton } from "../button-actions";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

type PromptFormProps = {
  prompt?: Prompt | null;
};

export function PromptForm({ prompt }: PromptFormProps) {
  const router = useRouter();

  const form = useForm<CreatePromptDto>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: prompt?.title ?? "",
      content: prompt?.content ?? ""
    }
  });

  const content = useWatch({ control: form.control, name: "content" });

  const isEdit = !!prompt?.id;

  async function submit(data: CreatePromptDto) {
    const result =
      isEdit ?
        await updatePromptAction({
          id: prompt.id,
          ...data
        })
      : await createPromptAction(data);

    if (!result.success) {
      toast.error(result.message || "Ocorreu um erro ao criar o prompt.");
      return;
    }

    toast.success(result.message);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
        <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
          <CopyButton content={content} />
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </header>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Título do prompt" variant="transparent" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Digite o conteúdo do prompt..." variant="transparent" size="lg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
