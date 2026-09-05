export function passwordResetCopy(userName: string, resetUrl: string) {
  return {
    subject: "Reset your password - HouseMe",
    text: `Hi ${userName},\n\nReset your HouseMe password:\n${resetUrl}\nThis link expires in 1 hour.\n`,
  };
}
