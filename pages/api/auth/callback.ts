import type { NextApiRequest, NextApiResponse } from "next";
import { zitadelConfig } from "@/shared/auth/config";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code;
  if (typeof code !== "string") {
    res.status(400).send("missing code");
    return;
  }
  const verifier =
    typeof req.cookies.oidc_code_verifier === "string"
      ? req.cookies.oidc_code_verifier
      : "";
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: zitadelConfig.redirectUri,
    client_id: zitadelConfig.clientId,
    code_verifier: verifier,
  });
  const tokenRes = await fetch(`${zitadelConfig.issuer}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    res.status(502).send(err);
    return;
  }
  const tokens = (await tokenRes.json()) as {
    access_token?: string;
    id_token?: string;
  };
  const script = `
    sessionStorage.setItem('access_token', ${JSON.stringify(tokens.access_token ?? "")});
    sessionStorage.setItem('id_token', ${JSON.stringify(tokens.id_token ?? "")});
    window.location.replace('/components/dashboards/crm/');
  `;
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(`<!DOCTYPE html><html><body><script>${script}</script></body></html>`);
}
