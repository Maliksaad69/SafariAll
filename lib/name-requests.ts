export interface OperatorNameChangeRequest {
  requestedName: string;
  reason?: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  previousName?: string;
}

/**
 * Parses any existing name change request stored in operator.serviceSummary.
 * Fully compatible with legacy strings and TALA verification objects.
 */
export function parseNameRequest(serviceSummary: string | null | undefined): OperatorNameChangeRequest | null {
  if (!serviceSummary) return null;
  try {
    const parsed = JSON.parse(serviceSummary);
    if (typeof parsed === 'object' && parsed !== null) {
      const nr = parsed.nameRequest || parsed.nameChangeRequest;
      if (nr && typeof nr === 'object' && nr.requestedName) {
        return {
          requestedName: String(nr.requestedName).trim(),
          reason: nr.reason ? String(nr.reason).trim() : undefined,
          submittedAt: nr.submittedAt || new Date().toISOString(),
          status: (nr.status as any) || 'PENDING',
          reviewNotes: nr.reviewNotes ? String(nr.reviewNotes).trim() : undefined,
          reviewedAt: nr.reviewedAt || undefined,
          reviewedBy: nr.reviewedBy || undefined,
          previousName: nr.previousName ? String(nr.previousName).trim() : undefined,
        };
      }
    }
  } catch {
    // serviceSummary is not JSON
  }
  return null;
}

/**
 * Serializes a NameChangeRequest into serviceSummary while strictly preserving
 * all existing TALA verification data and other governance fields.
 */
export function serializeNameRequest(
  request: OperatorNameChangeRequest | null,
  existingSummary?: string | null
): string {
  let existingObj: Record<string, any> = {};
  if (existingSummary) {
    try {
      const parsed = JSON.parse(existingSummary);
      if (typeof parsed === 'object' && parsed !== null) {
        existingObj = parsed;
      }
    } catch {
      // If serviceSummary was plain text notes, preserve it
      if (typeof existingSummary === 'string' && existingSummary.trim()) {
        existingObj.legacyNotes = existingSummary.trim();
      }
    }
  }

  if (!request) {
    const { nameRequest, nameChangeRequest, ...rest } = existingObj;
    return JSON.stringify(rest);
  }

  return JSON.stringify({
    ...existingObj,
    nameRequest: request,
  });
}
