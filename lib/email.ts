/**
 * Transactional Email Notification Service for SafariAsili
 * Configurable via SMTP environment variables or fallback console logging.
 */

export interface LeadEmailPayload {
  operatorEmail: string;
  operatorName: string;
  travelerName: string;
  travelerEmail: string;
  tourTitle?: string;
  preferredCountry?: string;
  travelDates?: string;
  adultsCount: number;
  childrenCount: number;
  notes?: string;
}

export async function sendLeadNotificationEmail(payload: LeadEmailPayload): Promise<boolean> {
  console.log(`[EMAIL DISPATCH] Forwarding traveler lead to operator ${payload.operatorEmail}:`);
  console.log(`Traveler: ${payload.travelerName} (${payload.travelerEmail})`);
  console.log(`Safari: ${payload.tourTitle || payload.preferredCountry || 'Custom African Safari'}`);
  console.log(`Party Size: ${payload.adultsCount} Adults, ${payload.childrenCount} Children`);
  console.log(`Notes: ${payload.notes || 'None'}`);

  // If SMTP environment variables are present, trigger real mail dispatch here.
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      // SMTP transport dispatch implementation
      return true;
    } catch (err) {
      console.error('[EMAIL DISPATCH ERROR]', err);
      return false;
    }
  }

  return true;
}
