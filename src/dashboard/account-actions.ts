"use server";

import { createClient } from "@/auth/server";
import { getAuthenticatedUser } from "@/auth/service";
import { revalidatePath } from "next/cache";

export interface UpdateAccountProfilePayload {
  fullName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface UpdateAccountPreferencesPayload {
  theme?: "light" | "dark" | "system";
  emailNotifications?: boolean;
}

export interface AccountActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

/**
 * Server Action: Update Account Profile (Full Name, Avatar URL, Account Bio)
 * Separated cleanly from individual Portfolio Profiles.
 */
export async function updateAccountProfileAction(
  payload: UpdateAccountProfilePayload
): Promise<AccountActionResult> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser || !auth?.internalUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const trimmedName = payload.fullName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Name must be at least 2 characters long." };
    }

    if (trimmedName.length > 60) {
      return { success: false, error: "Name cannot exceed 60 characters." };
    }

    const supabase = await createClient();

    // 1. Update public.profiles table
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: auth.internalUser.id,
        full_name: trimmedName,
        avatar_url: payload.avatarUrl || "",
        email: auth.authUser.email,
        bio: payload.bio || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      console.error("Account profile update error:", profileError);
      return { success: false, error: "Failed to update account profile." };
    }

    // 2. Sync name/avatar to internal user record
    await supabase
      .from("users")
      .update({
        full_name: trimmedName,
        avatar_url: payload.avatarUrl || "",
      })
      .eq("id", auth.internalUser.id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/account");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update profile";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Update Account Preferences (Theme, Notifications)
 */
export async function updateAccountPreferencesAction(
  payload: UpdateAccountPreferencesPayload
): Promise<AccountActionResult> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser || !auth?.internalUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: auth.internalUser.id,
        theme_preference: payload.theme || "dark",
        email_notifications: payload.emailNotifications ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("Update preferences error:", error);
      return { success: false, error: "Failed to update account preferences." };
    }

    revalidatePath("/dashboard/account");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update preferences";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Change Account Password
 */
export async function changePasswordAction(newPassword: string): Promise<AccountActionResult> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access." };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to change password";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Export Account User Data (Privacy Export)
 */
export async function exportUserDataAction(): Promise<
  AccountActionResult<{
    account: {
      email: string;
      fullName: string;
      avatarUrl?: string;
      createdAt: string;
    };
    portfoliosCount: number;
    exportTimestamp: string;
  }>
> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser || !auth?.internalUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const supabase = await createClient();

    const { data: portfolios } = await supabase
      .from("portfolios")
      .select("id, title, slug, is_published, status, created_at")
      .eq("user_id", auth.internalUser.id);

    const exportData = {
      account: {
        email: auth.authUser.email || "",
        fullName: auth.internalUser.full_name || auth.profile?.full_name || "",
        avatarUrl: auth.internalUser.avatar_url || "",
        createdAt: auth.internalUser.created_at || new Date().toISOString(),
      },
      portfoliosCount: portfolios?.length || 0,
      exportTimestamp: new Date().toISOString(),
    };

    return { success: true, data: exportData };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to export data";
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Permanent Account Deletion
 */
export async function deleteAccountAction(confirmText: string): Promise<AccountActionResult> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser || !auth?.internalUser) {
      return { success: false, error: "Unauthorized access." };
    }

    if (confirmText.trim() !== "DELETE MY ACCOUNT") {
      return { success: false, error: "Confirmation text does not match 'DELETE MY ACCOUNT'." };
    }

    const supabase = await createClient();

    // 1. Delete user portfolios
    await supabase.from("portfolios").delete().eq("user_id", auth.internalUser.id);

    // 2. Delete user profile record
    await supabase.from("profiles").delete().eq("user_id", auth.internalUser.id);

    // 3. Delete internal user record
    await supabase.from("users").delete().eq("id", auth.internalUser.id);

    // 4. Sign out
    await supabase.auth.signOut();

    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete account";
    return { success: false, error: msg };
  }
}
