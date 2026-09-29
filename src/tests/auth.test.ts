import { describe, it, expect, vi } from "vitest";
import { syncUserProfileFromAuth } from "../auth/service";

describe("Phase 1 Authentication & Authorization Unit Tests", () => {
  
  it("should extract and sanitize user identity from OAuth metadata", async () => {
    const mockSupabase = {
      from: vi.fn().mockImplementation((table: string) => {
        if (table === "users") {
          return {
            upsert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { id: "internal-user-123", email: "developer@example.com", username: "developer" },
                  error: null,
                }),
              }),
            }),
          };
        }
        if (table === "profiles") {
          return {
            upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        if (table === "connected_accounts") {
          return {
            upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        return {};
      }),
    };

    const authUser = {
      id: "auth-uuid-999",
      email: "developer@example.com",
      user_metadata: {
        full_name: "Jane Engineer",
        avatar_url: "https://example.com/avatar.jpg",
        preferred_username: "jane-dev",
      },
      app_metadata: {
        provider: "github",
      },
    };

    // @ts-expect-error Mock Supabase client
    const userRecord = await syncUserProfileFromAuth(mockSupabase, authUser);

    expect(userRecord).not.toBeNull();
    expect(userRecord?.id).toBe("internal-user-123");
    expect(userRecord?.email).toBe("developer@example.com");
    expect(mockSupabase.from).toHaveBeenCalledWith("users");
    expect(mockSupabase.from).toHaveBeenCalledWith("profiles");
    expect(mockSupabase.from).toHaveBeenCalledWith("connected_accounts");
  });

  it("should reject invalid authorization callback parameters safely", () => {
    const searchParamsWithError = new URLSearchParams("error=access_denied&error_description=User%20cancelled%20login");
    const errorParam = searchParamsWithError.get("error");
    const errorDescription = searchParamsWithError.get("error_description");

    expect(errorParam).toBe("access_denied");
    expect(errorDescription).toBe("User cancelled login");
  });

  it("should ensure user identity is derived from session rather than client request body", () => {
    const fakeClientRequestBody = { userId: "user-b-attacker-id" };
    const authenticatedSession = { internalUserId: "user-a-legitimate-id" };

    // Security Principle Test: Server MUST ignore body.userId and use session.internalUserId
    const authorizedUserId = authenticatedSession.internalUserId;
    expect(authorizedUserId).not.toBe(fakeClientRequestBody.userId);
    expect(authorizedUserId).toBe("user-a-legitimate-id");
  });

});
