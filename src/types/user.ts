/**
 * User and Authentication Session Domain Types
 */

export interface UserSession {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider?: "google" | "github";
  createdAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}
