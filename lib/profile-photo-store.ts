const STORAGE_PREFIX = "houseme.profilePhoto.v1";

export type ProfileRole = "tenant" | "landlord" | "admin";

function key(role: ProfileRole, userKey: string) {
  return `${STORAGE_PREFIX}:${role}:${userKey}`;
}

export function readProfilePhoto(role: ProfileRole, userKey: string): string | null {
  if (typeof window === "undefined" || !userKey) return null;
  try {
    return localStorage.getItem(key(role, userKey));
  } catch {
    return null;
  }
}

export function writeProfilePhoto(
  role: ProfileRole,
  userKey: string,
  dataUrl: string | null,
) {
  if (typeof window === "undefined" || !userKey) return;
  try {
    const storageKey = key(role, userKey);
    if (dataUrl) localStorage.setItem(storageKey, dataUrl);
    else localStorage.removeItem(storageKey);
  } catch {
    // localStorage full or blocked — ignore in demo mode
  }
}
