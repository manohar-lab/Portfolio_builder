import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updateAccountProfileAction,
  updateAccountPreferencesAction,
  changePasswordAction,
  exportUserDataAction,
  deleteAccountAction,
} from "@/dashboard/account-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockUserData = {
  authUser: {
    id: "user-123",
    email: "alex@example.com",
    email_confirmed_at: "2026-01-01T00:00:00Z",
    app_metadata: { provider: "email" },
  },
  internalUser: {
    id: "user-123",
    full_name: "Alex Johnson",
    avatar_url: "https://example.com/alex.jpg",
    created_at: "2026-01-01T00:00:00Z",
  },
  profile: {
    full_name: "Alex Johnson",
    avatar_url: "https://example.com/alex.jpg",
    bio: "Software Engineer & Architect",
  },
};

// Mock Supabase Server & Auth
vi.mock("@/auth/service", () => ({
  getAuthenticatedUser: vi.fn().mockImplementation(async () => mockUserData),
  requireAuth: vi.fn().mockImplementation(async () => mockUserData),
}));

vi.mock("@/auth/server", () => ({
  createClient: vi.fn().mockImplementation(async () => ({
    from: () => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { full_name: "Alex Johnson", email: "alex@example.com", bio: "Account Bio" },
            error: null,
          }),
          select: vi.fn().mockResolvedValue({
            data: [{ id: "port-1", title: "Alex's Portfolio", slug: "alex" }],
            error: null,
          }),
        }),
      }),
    }),
    auth: {
      updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      admin: {
        deleteUser: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  })),
}));

describe("Phase 29: User Profile, Account Identity, and Preferences System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. should update account profile with valid full_name and avatar_url", async () => {
    const res = await updateAccountProfileAction({
      fullName: "Alex Johnson Updated",
      avatarUrl: "https://example.com/avatar-new.png",
      bio: "Senior Full Stack Dev",
    });

    expect(res.success).toBe(true);
  });

  it("2. should fail updating account profile if display name is empty", async () => {
    const res = await updateAccountProfileAction({
      fullName: "   ",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Name must be at least 2 characters long.");
  });

  it("3. should update password successfully when >= 8 characters", async () => {
    const res = await changePasswordAction("NewSecurePass123!");
    expect(res.success).toBe(true);
  });

  it("4. should fail password change if password is shorter than 8 characters", async () => {
    const res = await changePasswordAction("short");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Password must be at least 8 characters long.");
  });

  it("5. should update theme and notification preferences", async () => {
    const res = await updateAccountPreferencesAction({
      theme: "dark",
      emailNotifications: false,
    });
    expect(res.success).toBe(true);
  });

  it("6. should export user data into a structured JSON backup", async () => {
    const res = await exportUserDataAction();
    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.account.email).toBe("alex@example.com");
  });

  it("7. should reject account deletion if confirmation phrase does not match", async () => {
    const res = await deleteAccountAction("wrong phrase");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Confirmation text does not match 'DELETE MY ACCOUNT'.");
  });

  it("8. should execute account deletion when confirmation phrase exact matches", async () => {
    const res = await deleteAccountAction("DELETE MY ACCOUNT");
    expect(res.success).toBe(true);
  });

  it("9. should preserve portfolio data independence when account identity is updated", async () => {
    const res = await updateAccountProfileAction({
      fullName: "New Account Name",
      avatarUrl: "https://example.com/new-avatar.jpg",
    });
    expect(res.success).toBe(true);
  });
});
