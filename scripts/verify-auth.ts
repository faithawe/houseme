import { authService } from "../lib/services/auth.service";

async function main() {
  const user = await authService.authenticateCredentials(
    "tenant@houseme.ng",
    "Tenant1!House",
  );
  if (!user) {
    console.error("AUTH_FAIL");
    process.exit(1);
  }
  console.log(`AUTH_OK role=${user.role}`);
}

main().catch((error) => {
  console.error("AUTH_ERROR", error instanceof Error ? error.message : error);
  process.exit(1);
});
