import { zitadelConfig } from "@/shared/auth/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/** Intercambio authorization_code + PKCE en el cliente (compatible con output: export). */
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) return;

    const code = router.query.code;
    if (typeof code !== "string") {
      setError("Falta el parámetro code en la URL.");
      return;
    }

    const verifier = sessionStorage.getItem("oidc_code_verifier") ?? "";
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: zitadelConfig.redirectUri,
      client_id: zitadelConfig.clientId,
      code_verifier: verifier,
    });

    fetch(`${zitadelConfig.issuer}/oauth/v2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
      .then(async (tokenRes) => {
        if (!tokenRes.ok) {
          throw new Error(await tokenRes.text());
        }
        return tokenRes.json() as Promise<{
          access_token?: string;
          id_token?: string;
        }>;
      })
      .then((tokens) => {
        sessionStorage.setItem("access_token", tokens.access_token ?? "");
        sessionStorage.setItem("id_token", tokens.id_token ?? "");
        sessionStorage.removeItem("oidc_code_verifier");
        router.replace("/components/dashboards/crm/");
      })
      .catch((err: Error) => setError(err.message));
  }, [router, router.isReady, router.query.code]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-danger">Error al iniciar sesión: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <p>Iniciando sesión…</p>
    </div>
  );
}
