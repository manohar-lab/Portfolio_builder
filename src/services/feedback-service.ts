import { createClient } from "@/auth/server";
import { getAuthenticatedUser } from "@/auth/service";
import { sanitizeHtmlText } from "@/utilities/security";

export interface SubmitFeedbackPayload {
  category: "bug" | "feature_request" | "confusing_ux" | "template_feedback" | "other";
  message: string;
  contactEmail?: string;
}

/**
 * Submits lightweight feedback safely from authenticated or guest users.
 */
export async function submitUserFeedback(payload: SubmitFeedbackPayload): Promise<{ success: boolean; error?: string }> {
  if (!payload.message || payload.message.trim().length < 5) {
    return { success: false, error: "Feedback message must be at least 5 characters long." };
  }

  const supabase = await createClient();
  const user = await getAuthenticatedUser();

  const sanitizedMessage = sanitizeHtmlText(payload.message.trim());
  const sanitizedEmail = payload.contactEmail ? sanitizeHtmlText(payload.contactEmail.trim()) : user?.authUser.email || null;

  const { error } = await supabase.from("user_feedback").insert({
    user_id: user?.internalUser?.id || null,
    category: payload.category || "other",
    message: sanitizedMessage,
    contact_email: sanitizedEmail,
  });

  if (error) {
    console.error("Error submitting user feedback:", error.message);
    return { success: false, error: "Failed to record feedback. Please try again." };
  }

  return { success: true };
}
