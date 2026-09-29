"use client";

import React, { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

export const FeedbackTriggerButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition border border-slate-800 flex items-center gap-2"
        title="Send product feedback or report friction"
      >
        <MessageSquarePlus className="w-4 h-4 text-indigo-400" /> Send Feedback
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
