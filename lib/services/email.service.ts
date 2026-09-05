/**
 * Transactional email. Without RESEND_API_KEY, links are logged for local auth.
 */
export const emailService = {
  async sendVerification(to: string, url: string): Promise<void> {
    console.info(`[email] verification → ${to}\n${url}`);
  },

  async sendPasswordReset(to: string, url: string): Promise<void> {
    console.info(`[email] password reset → ${to}\n${url}`);
  },

  async sendListingApproved(to: string, listingId: string): Promise<void> {
    console.info(`[email] listing approved → ${to} listing=${listingId}`);
  },

  async sendListingRejected(
    to: string,
    listingId: string,
    reason: string,
  ): Promise<void> {
    console.info(
      `[email] listing rejected → ${to} listing=${listingId} reason=${reason}`,
    );
  },
};
