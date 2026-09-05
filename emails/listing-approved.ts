export function listingApprovedCopy(userName: string, listingTitle: string, listingUrl: string) {
  return {
    subject: "Your listing is live! - HouseMe",
    text: `Hi ${userName},\n\n"${listingTitle}" is now live.\n${listingUrl}\n`,
  };
}
