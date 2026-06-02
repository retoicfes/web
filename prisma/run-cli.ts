import "./load-env";
import { execSync } from "node:child_process";

const cmd = process.argv.slice(2).join(" ");
if (!cmd) {
  console.error("Uso: tsx prisma/run-cli.ts <comando prisma>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(
    "Falta DATABASE_URL en .env.local\n" +
      "Vercel Postgres: copia POSTGRES_PRISMA_URL como DATABASE_URL",
  );
  process.exit(1);
}

execSync(`pnpm exec prisma ${cmd}`, {
  stdio: "inherit",
  env: process.env,
});
