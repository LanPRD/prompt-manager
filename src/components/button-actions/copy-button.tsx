"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";

export type CopyButtonProps = {
  content: string;
};

export function CopyButton({ content }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const isContentEmpty = !content.trim();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  function clearTimer() {
    if (!timerRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }

  async function handleCopy() {
    const text = content.trim();

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      clearTimer();

      timerRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      const _error = error as Error;
      toast.error(`Erro ao copiar para a área de transferência: ${_error.message}`);
    }
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="disabled:opacity-50"
      disabled={isContentEmpty}
      onClick={handleCopy}
    >
      {isCopied ?
        <Check className="w-4 h-4 text-green-400" />
      : <Copy className="w-4 h-" />}
      <span>{isCopied ? "Copiado" : "Copiar"}</span>
    </Button>
  );
}
