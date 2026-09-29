"use client";

import React, { useState } from "react";
import { MessageSquarePlus, X, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { submitFeedbackAction } from "./actions";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<"bug" | "feature_request" | "confusing_ux" | "template_feedback" | "other">("confusing_ux");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setError("Please enter a feedback message with at least 5 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await submitFeedbackAction({
        category,
        message: message.trim(),
        contactEmail: contactEmail.trim() || undefined,
      });

      if (res.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setMessage("");
          onClose();
        }, 2000);
      } else {
        setError(res.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
      setError("An unexpected error occurred while sending feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-white text-base">
            <MessageSquarePlus className="w-5 h-5 text-indigo-400" /> Help Us Improve — Beta Feedback
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-lg">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-400">Your insights help us validate and refine PortfolioCraft.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Feedback Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as "bug" | "feature_request" | "confusing_ux" | "template_feedback" | "other")}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="confusing_ux">Confusing UX / Navigation</option>
                <option value="bug">Report a Bug</option>
                <option value="feature_request">Feature Request</option>
                <option value="template_feedback">Template Feedback</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Your Message *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What felt confusing, broken, or missing during your experience?"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Contact Email (Optional)</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30"
              >
                {submitting ? "Sending..." : "Submit Feedback"} <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
