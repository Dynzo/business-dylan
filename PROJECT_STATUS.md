# Project status — business-dylan showcase site

Werknaam-project. Eigen portfolio-/showcase-website voor de Web → Data → AI-pijlers uit het
businessplan (los repo/document, niet in deze repo — bevat persoonlijke financiële planning).
Zie de losse chatgeschiedenis voor de volledige achtergrond; dit document is de doorlopende
status voor wie hierna met Claude Code aan deze repo werkt.

## Wat dit is

Architectuur bewust vrijwel 1-op-1 hergebruikt van een eerder project
(`between-dough-and-fire`, een food-truck reserveringssite): Next.js App Router, Supabase
(Postgres + Auth), Resend (mail), Tailwind v4, Vercel. Domeinmodel vervangen:
categories/arrangements/reservations → pillars/services/leads, plus een nieuwe agentlaag
(companies/briefings/agent_runs) voor geautomatiseerd prospect-onderzoek.

Kernpitch: het contactformulier wordt zelf de demo van de AI-pijler — een research-agent zoekt
automatisch openbare bedrijfsinfo op zodra een lead een herkenbaar bedrijfsdomein gebruikt, en
zet dat om in een briefing + concept-antwoordmail voor de beheerder.

## Architectuur (kort)

- `lib/supabase.ts` / `supabase-server.ts` / `supabase-admin.ts` — drie clients (anon/nullable,
  auth-aware server, service-role/nullable), overal `null`-checks i.p.v. crashen bij ontbrekende
  env-vars.
- `lib/email.ts` + `lib/email-templates.ts` — Resend, zelfde "fail soft, log, nooit de aanroeper
  laten falen"-patroon.
- `lib/site-content.ts` + `lib/markdown-lite.ts` — beheerbare site-tekst (defaults in code,
  overrides in `site_content`-tabel), `/admin/content`.
- `lib/agents/` — de agentlaag:
  - `schema.ts` — Zod-schema voor de structured briefing-output.
  - `tools/web-search.ts` (Tavily search), `tools/fetch-site.ts` (Tavily extract),
    `tools/detect-tech.ts` (directe fetch + regex-signalen, geen Tavily nodig).
  - `research-agent.ts` — tool-loop (Haiku voor samenvatten) → `generateObject` synthese
    (Sonnet) → upsert `companies` (cache per domain) → insert `briefings`. Gebruikt door zowel
    de enrichment-agent als de standalone demo.
  - `enrichment-agent.ts` — wrapper voor nieuwe leads: skip bij generiek e-maildomein
    (gmail/hotmail/icloud/etc. — AVG-bewust, geen research op persoonlijke adressen), skip bij
    dagcap bereikt (`ENRICHMENT_DAILY_CAP`), anders research + concept-antwoordmail genereren.
  - `agent-log.ts` — elke run gelogd in `agent_runs` (tokens, status, error).
- `app/admin/(protected)/` — route group met één centrale auth-guard (`layout.tsx`) i.p.v. de
  per-pagina herhaling uit het origineel. `/admin` zelf staat BUITEN de group (toont het
  inlogformulier inline i.p.v. te redirecten).
- Admin-secties: leaddetail + briefing + reply-form, diensten-CRUD, content-editor,
  standalone research-demo (`/admin/research`, printbaar voor "aan tafel").

## Datamodel (Supabase)

`pillars`, `services` — publiek leesbaar (`active = true`).
`leads`, `companies`, `briefings`, `agent_runs` — RLS aan, GEEN publieke policies; alleen de
service-role client mag erbij (persoonsgegevens/kosteninfo).
`site_content` — publiek leesbaar, key/value.
Schema + seed: `supabase/schema.sql`, `supabase/seed.sql` (idempotent, unique constraint op
`services(pillar_id, name)`).

## Status: wat is klaar

- **Fase 0-3 uit het implementatieplan volledig gebouwd, getest, live:** bootstrap, publieke
  site (dark/animated styling, vercel.com/resend.com-achtig), lead-intake, research- +
  enrichment-agent, standalone research-demo.
- **End-to-end verified** (lokaal én in productie): een lead met een echt bedrijfsdomein
  triggert research → briefing → concept-mail → status `qualified`; een lead met een vrij
  e-maildomein slaat enrichment terecht over; agent-fouten breken de lead-flow nooit (best
  effort, alles gelogd in `agent_runs`).
- **Cost-abuse hardening** op `/api/leads` (publiek, ongeauthenticeerd endpoint):
  Cloudflare Turnstile CAPTCHA (`lib/turnstile.ts`, faalt open met warning als niet
  geconfigureerd) → rate-limit per e-mail (3/24u) én per IP (5/uur) → `ENRICHMENT_DAILY_CAP`
  (default 10) als laatste backstop in de agent zelf. **Nog niet structureel losgekoppeld**
  (bv. via Vercel Cron) — bewust uitgesteld omdat het gratis Vercel-plan cron tot 1x/dag beperkt,
  wat de "instant"-demo-ervaring zou breken. Heroverwegen als traffic/plan verandert.
- Lead-detail: status-dropdown vervangen door één "Archiveren"-knop — de overige statussen
  (new/researching/qualified/contacted) zijn agent-/reply-gedreven en niet handmatig zinvol.
- Live op Vercel: **https://business-dylan.vercel.app** (project `business-dylan` onder team
  `dynzos-projects`), gekoppeld aan GitHub-repo `Dynzo/business-dylan` (public), auto-deploy op
  push naar `main`.
- Supabase-project apart van het bruschetta-project, `.env.local` volledig ingevuld
  (Supabase/Resend/Anthropic/Tavily/Turnstile) — zowel lokaal als als Vercel env vars
  (production + preview).

## Bekende beperkingen / nog open

- **Resend zit nog in sandbox-modus**: mails komen alleen aan bij het Resend-account-e-mailadres
  totdat er een eigen domein geverifieerd is. Leads met een ander e-mailadres krijgen dus
  (nog) geen bevestigingsmail — faalt zichtbaar in de logs, breekt niets.
- **Turnstile-widget is alleen geregistreerd voor `business-dylan.vercel.app`**, niet
  `localhost` — lokaal levert het widget dus geen token op. Testen met echte CAPTCHA moet tegen
  productie, of voeg `localhost` later toe aan de widget-instellingen in Cloudflare.
- **Fase 4 (uit het implementatieplan) bewust niet gebouwd:** signaal-agent via Vercel Cron,
  site-chatagent, "gebouwd met agents"-verhaal expliciet op de site. Optioneel, later.
- Placeholder-content nog niet ingevuld: bedrijfsnaam/adres/KVK-nummer in footer en
  privacyverklaring (er is nog geen KVK-inschrijving).
- Polish nog niet gedaan: eigen domein i.p.v. `.vercel.app`, OG-image/SEO-pas, mobiel/
  toegankelijkheidscheck, reviews/testimonials (nog geen echte reviews om te tonen).

## Operationele lessen (belangrijk voor wie hierna met tools/CLI aan deze repo werkt)

- **De shell-cwd van de Bash-tool reset tussen los-vervolgende tool-calls in deze harness** —
  niet aannemen dat een eerdere `cd` blijft staan. Dit heeft één keer een echt incident
  veroorzaakt: een `vercel deploy --prod` draaide per ongeluk vanuit de bovenliggende map
  (`/Users/dylan/projecten/prive/business`, geen git-repo, bevat persoonlijke
  businessplan-documenten) en publiceerde die map kortstondig als een nieuw, onbedoeld publiek
  Vercel-project. Inmiddels verwijderd en opgeruimd (ook het lokale `.vercel/`-linkbestand in die
  map). **Altijd `pwd` checken of `cd ... &&` explitiet in hetzelfde commando zetten vóór elke
  Vercel-actie.**
- Voor Vercel CLI/API-acties is een kortstondig access-token nodig (Account Settings → Tokens);
  niet ergens opgeslagen, per sessie opnieuw aan te leveren indien nodig.
- Testpatroon dat in deze sessie werkte: een lead versturen via `curl` naar `/api/leads`
  (lokaal `:3001` of productie), daarna direct de Supabase-tabellen bekijken via een klein
  `node -e` scriptje dat `.env.local` inleest en de service-role-key gebruikt (geen `psql`/
  `supabase` CLI beschikbaar in deze omgeving). Testleads na verificatie weer opruimen, of laten
  staan als de gebruiker dat aangeeft.
- `businessplan.md` en `implementatieplan-showcase-agents.md` staan soms ook in déze map (lijkt
  een VS Code/extensie-sync-effect) — ze staan in `.gitignore` en horen NOOIT gecommit te worden
  (persoonlijke financiële/strategische inhoud, publieke repo).
