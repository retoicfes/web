export type AuthProvider = "zitadel" | "firebase";

export function getAuthProvider(): AuthProvider {
  const v = process.env.NEXT_PUBLIC_AUTH_PROVIDER?.toLowerCase();
  if (v === "firebase") return "firebase";
  return "zitadel";
}

export const zitadelConfig = {
  issuer: process.env.NEXT_PUBLIC_OIDC_ISSUER ?? "http://localhost:8080",
  clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? "lte-nexus-web",
  redirectUri:
    process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI ??
    "http://localhost:3000/auth/callback/",
  postLogoutRedirectUri:
    process.env.NEXT_PUBLIC_OIDC_POST_LOGOUT_URI ?? "http://localhost:3000/",
};
