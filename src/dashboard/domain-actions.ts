"use server";

import { getAuthenticatedUser } from "@/auth/service";
import {
  addCustomDomain,
  verifyCustomDomain,
  disconnectCustomDomain,
  getCustomDomainForPortfolio,
  DomainResult,
} from "@/services/domain-service";
import { DbCustomDomain } from "@/types/database";
import { DnsInstruction, getDnsInstructions } from "@/utilities/domain-utils";
import { revalidatePath } from "next/cache";

export async function addCustomDomainAction(
  portfolioId: string,
  domainInput: string
): Promise<DomainResult<{ domainRecord: DbCustomDomain; instructions: DnsInstruction }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const result = await addCustomDomain(portfolioId, auth.authUser.id, domainInput);
    if (result.success) {
      revalidatePath(`/dashboard/portfolio/${portfolioId}`);
      revalidatePath("/dashboard/account");
    }
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add domain";
    return { success: false, error: message };
  }
}

export async function verifyCustomDomainAction(
  domainId: string,
  portfolioId: string
): Promise<DomainResult<{ status: "active" | "failed"; domainRecord: DbCustomDomain }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const result = await verifyCustomDomain(domainId, auth.authUser.id);
    revalidatePath(`/dashboard/portfolio/${portfolioId}`);
    revalidatePath("/dashboard/account");
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to verify domain";
    return { success: false, error: message };
  }
}

export async function disconnectCustomDomainAction(
  domainId: string,
  portfolioId: string
): Promise<DomainResult<{ disconnected: boolean }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const result = await disconnectCustomDomain(domainId, auth.authUser.id);
    if (result.success) {
      revalidatePath(`/dashboard/portfolio/${portfolioId}`);
      revalidatePath("/dashboard/account");
    }
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to disconnect domain";
    return { success: false, error: message };
  }
}

export async function getCustomDomainAction(
  portfolioId: string
): Promise<DomainResult<{ domainRecord: DbCustomDomain | null; instructions?: DnsInstruction }>> {
  try {
    const auth = await getAuthenticatedUser();
    if (!auth?.authUser) {
      return { success: false, error: "Unauthorized access." };
    }

    const record = await getCustomDomainForPortfolio(portfolioId, auth.authUser.id);
    let instructions: DnsInstruction | undefined = undefined;
    if (record) {
      instructions = getDnsInstructions(record.domain, record.verification_token);
    }
    return { success: true, data: { domainRecord: record, instructions } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch domain configuration";
    return { success: false, error: message };
  }
}
