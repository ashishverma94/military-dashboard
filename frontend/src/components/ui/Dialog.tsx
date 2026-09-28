import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export const DialogContent = ({ children }: { children: ReactNode }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-forest/60 backdrop-blur-sm" />
    <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-auto scroll rounded-2xl border border-olive/20 bg-paper p-6 shadow-2xl">
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded p-1 text-forest/60 hover:bg-olive/10">
        <X size={18} />
      </DialogPrimitive.Close>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogTitle = ({ children }: { children: ReactNode }) => (
  <DialogPrimitive.Title className="text-xl font-bold text-forest">
    {children}
  </DialogPrimitive.Title>
);
