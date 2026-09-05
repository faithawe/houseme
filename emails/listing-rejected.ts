export function listingRejectedCopy(
  userName: string,
  listingTitle: string,
  reason: string,
  editUrl: string,
) {
  return {
    subject: "Your listing needs changes - HouseMe",
    text: `Hi ${userName},\n\n"${listingTitle}" was not approved.\nReason: ${reason}\nEdit and resubmit: ${editUrl}\n`,
  };
}
