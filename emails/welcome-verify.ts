/**
 * Welcome / verify-email template.
 * Replace with @react-email/components when the Email feature is built.
 */
export function welcomeVerifyCopy(userName: string, verificationUrl: string) {
  return {
    subject: "Verify your email - HouseMe",
    text: `Hi ${userName},\n\nVerify your email to start using HouseMe:\n${verificationUrl}\n`,
  };
}
