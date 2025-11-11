"use client";

import { Lightbulb } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MotivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function MotivationModal({
  isOpen,
  onClose,
  message,
}: MotivationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-5 mb-7">
          <Logo size={45} />
        </div>

        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">
            Tips Motivasi
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 bg-[#FCFFD9] border border-[#C2E66E] text-gray-800 text-sm rounded-xl px-4 py-3 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-[#C2E66E] flex-shrink-0 mt-[2px]" />
          <p className="text-sm leading-relaxed break-words">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
