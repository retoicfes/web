import { zitadelConfig } from "./config";

function randomString(length: number): string {
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Base64Url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Inicia Authorization Code + PKCE contra Zitadel. */
export async function signInWithZitadel(): Promise<void> {
  const verifier = randomString(32);
  const challenge = await sha256Base64Url(verifier);
  sessionStorage.setItem("oidc_code_verifier", verifier);
  document.cookie = `oidc_code_verifier=${verifier}; path=/; max-age=600; SameSite=Lax`;
  const params = new URLSearchParams({
    client_id: zitadelConfig.clientId,
    redirect_uri: zitadelConfig.redirectUri,
    response_type: "code",
    scope: "openid profile email offline_access",
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  window.location.href = `${zitadelConfig.issuer}/oauth/v2/authorize?${params}`;
}

export function signOutZitadel(): void {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("id_token");
  const params = new URLSearchParams({
    post_logout_redirect_uri: zitadelConfig.postLogoutRedirectUri,
  });
  window.location.href = `${zitadelConfig.issuer}/oidc/v1/end_session?${params}`;
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("access_token");
}
