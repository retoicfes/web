import { siteConfig } from "@/lib/site";

export type ShareRetoContext = {
  puntaje?: number;
  apodo?: string;
  colegio?: string;
};

export function getShareUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return siteConfig.url;
}

export function buildShareTextBody(ctx: ShareRetoContext = {}): string {
  const { puntaje, apodo, colegio } = ctx;

  if (puntaje != null && puntaje > 0 && apodo) {
    const lugar = colegio ? `\n🏫 ${colegio}` : "";
    return (
      `🔥 ¡${apodo} sacó ${puntaje}/500 en Reto ICFES!${lugar}\n\n` +
      `Retos rápidos para Saber 11 (grado 11°). ¿Me ganas?`
    );
  }

  if (puntaje != null && puntaje > 0) {
    return (
      `🔥 ¡Saqué ${puntaje}/500 en Reto ICFES!\n\n` +
      `Practica Saber 11 con retos tipo swipe y sube en el ranking de tu colegio.`
    );
  }

  return (
    `📚 ¿Listos para Saber 11?\n\n` +
    `En Reto ICFES practicas con retos rápidos y compites con tu colegio.`
  );
}

export function buildShareMessage(ctx: ShareRetoContext = {}): string {
  return `${buildShareTextBody(ctx)}\n👉 ${getShareUrl()}`;
}

export function whatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function telegramShareUrl(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

export function twitterShareUrl(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function facebookShareUrl(url: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function canNativeShare(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function nativeShare(ctx: ShareRetoContext = {}): Promise<boolean> {
  if (!canNativeShare()) return false;
  const url = getShareUrl();
  const text = buildShareMessage(ctx);
  try {
    await navigator.share({
      title: siteConfig.name,
      text,
      url,
    });
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return false;
    return false;
  }
}
