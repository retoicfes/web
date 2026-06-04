# Seguridad — Reto ICFES

Documento de amenazas y controles para el MVP. Objetivo: **dificultar trampas y abuso** sin exigir login (producto escolar anónimo).

## Amenazas principales

| Riesgo | Qué podía hacer un estudiante | Mitigación actual |
|--------|------------------------------|-------------------|
| **Puntaje falso en ranking** | Enviar `puntaje: 500` con curl/Postman | Calificación en servidor + `rankingToken` firmado (HMAC) |
| **Ver respuestas en la red** | Leer `correcta` en `/api/preguntas` | Ronda vía `POST /api/ronda/iniciar` sin respuestas |
| **Spam de rankings** | Miles de POST a `/api/rankings` | Rate limit por IP (60 s) |
| **Ronda instantánea (bot)** | Responder 15 preguntas en 1 s | Mínimo ~2,5 s por pregunta al finalizar |
| **Colegio inventado** | Datos DANE falsos | Validación opcional contra tabla `establecimientos` |
| **Apodo XSS** | Texto con `<script>` | Sanitización básica en servidor |
| **Scraping del banco** | Descargar todas las preguntas | Límite por ronda; GET `/api/preguntas` deprecado (410) |

## Flujo seguro de una ronda

```
1. POST /api/ronda/iniciar     → token firmado + preguntas (sin correcta)
2. POST /api/ronda/responder   → feedback por pregunta (solo ids del token)
3. POST /api/ronda/finalizar   → puntaje ICFES calculado en servidor + rankingToken
4. POST /api/rankings          → exige rankingToken válido y puntaje 0–500
```

## Variable obligatoria en producción

En Vercel → Environment Variables:

```bash
ROUND_SIGNING_SECRET=<string aleatorio largo, openssl rand -hex 32>
```

Sin esto, **no se pueden iniciar rondas ni guardar rankings** en producción.

Generar secret:

```bash
openssl rand -hex 32
```

## Limitaciones del MVP (conocidas)

1. **Rate limit en memoria** — en Vercel hay varias instancias; un atacante persistente puede repartir requests. **Próximo paso:** [Upstash Redis](https://upstash.com/) o Vercel KV.
2. **Sin login** — el mismo estudiante puede jugar muchas rondas con distintos apodos. Aceptable para MVP; mitigar con límite diario por IP más adelante.
3. **Token de ranking de un solo uso** — hoy se puede reutilizar el token 10 min; **próximo paso:** guardar nonces usados en Redis/DB.
4. **No es examen oficial** — disclaimer visible en reporte; no reemplaza Saber 11.

## Checklist deploy

- [ ] `ROUND_SIGNING_SECRET` en Vercel (Production + Preview)
- [ ] No commitear `.env.local`
- [ ] Revisar que `/api/preguntas` responde 410
- [ ] Probar ronda completa y verificar que curl directo a rankings sin token falla con 403

## Prueba manual anti-trampa

```bash
# Debe fallar (403) — puntaje inventado sin token
curl -X POST https://retoicfes.com/api/rankings \
  -H "Content-Type: application/json" \
  -d '{"apodo":"Hacker","departamento":"X","municipio":"Y","colegio":"Z","puntaje":500}'
```

## Roadmap seguridad (fase 2)

- Nonces de ranking de un solo uso (tabla `RankingTokenUsado`)
- Turnstile / hCaptcha en onboarding si hay abuso
- Detección de outliers en ranking (puntaje 500 repetido mismo colegio)
- Auditoría de logs en Neon + alertas
