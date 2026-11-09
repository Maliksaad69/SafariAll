export interface TalaVerificationData {
  talaNumber: string;
  issuingAuthority?: string;
  expiryDate?: string;
  documentUrl?: string;
  documentName?: string;
  documentMimeType?: string;
  documentSizeBytes?: number;
  submittedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'NOT_SUBMITTED';
  reviewNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

/**
 * Safely parses the stored serviceSummary JSON or reconstructs TALA verification state
 * from fallback operator columns.
 */
export function parseTalaData(
  serviceSummary: string | null | undefined,
  fallbackRegNum?: string | null,
  fallbackDocUrl?: string | null,
  isVerified?: boolean
): TalaVerificationData {
  if (serviceSummary) {
    try {
      const parsed = JSON.parse(serviceSummary);
      if (typeof parsed === 'object' && parsed !== null) {
        // If parsed JSON has talaNumber or documentUrl, use it
        return {
          talaNumber: parsed.talaNumber || fallbackRegNum || '',
          issuingAuthority: parsed.issuingAuthority || '',
          expiryDate: parsed.expiryDate || '',
          documentUrl: parsed.documentUrl || fallbackDocUrl || undefined,
          documentName: parsed.documentName || (parsed.documentUrl ? 'TALA_License_Document' : undefined),
          documentMimeType: parsed.documentMimeType || undefined,
          documentSizeBytes: parsed.documentSizeBytes || undefined,
          submittedAt: parsed.submittedAt || undefined,
          status: isVerified
            ? 'APPROVED'
            : (parsed.status as any) || (parsed.documentUrl || fallbackDocUrl ? 'PENDING' : 'NOT_SUBMITTED'),
          reviewNotes: parsed.reviewNotes || undefined,
          reviewedAt: parsed.reviewedAt || undefined,
          reviewedBy: parsed.reviewedBy || undefined,
        };
      }
    } catch {
      // Not JSON, continue to fallback
    }
  }

  // Fallback to basic operator columns
  const hasDoc = Boolean(fallbackDocUrl);
  return {
    talaNumber: fallbackRegNum || '',
    issuingAuthority: '',
    expiryDate: '',
    documentUrl: fallbackDocUrl || undefined,
    documentName: hasDoc ? 'TALA_Certificate' : undefined,
    status: isVerified ? 'APPROVED' : hasDoc ? 'PENDING' : 'NOT_SUBMITTED',
    reviewNotes: typeof serviceSummary === 'string' && serviceSummary ? serviceSummary : undefined,
  };
}

/**
 * Serializes TalaVerificationData into a JSON string suitable for storing in serviceSummary.
 */
export function serializeTalaData(data: TalaVerificationData): string {
  return JSON.stringify(data);
}
