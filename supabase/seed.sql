-- Seed-data voor pillars/services — voer uit ná schema.sql. Idempotent (on conflict do nothing),
-- dus veilig om opnieuw te draaien. Prijzen zijn indicatief uit het businessplan — pas aan via
-- /admin/diensten of rechtstreeks in Supabase zodra je tarieven definitief zijn.

insert into pillars (key, name, tagline, description, order_index) values
  ('web', 'Web', 'Websites & webapplicaties', 'Online zichtbaar zijn of een werkende applicatie — de eerste cashflow en het portfolio.', 1),
  ('data', 'Data', 'Een solide dataplatform', 'Bronnen ontsluiten, opslag en pipelines, zodat analytics én applicaties erop kunnen draaien.', 2),
  ('ai', 'AI', 'AI-toepassingen & agents', 'Van eerste AI-stappen tot agents, agentic workflows en procesautomatisering.', 3)
on conflict (key) do nothing;

with p as (select id from pillars where key = 'web')
insert into services (pillar_id, name, description, includes, price_label, order_index)
select p.id, v.name, v.description, v.includes, v.price_label, v.order_index
from p, (values
  ('Starter-website',
   'Onepager, contactformulier, mobielvriendelijk.',
   array['Onepager of kleine meerpagina-site', 'Contactformulier', 'Mobielvriendelijk ontwerp'],
   'Vaste prijs — vanaf €1.500', 1),
  ('Website + functionaliteit',
   'Reserveringen, menu/catalogus, mailkoppeling.',
   array['Reserverings- of aanvraagformulier', 'Catalogus/menu vanuit een database', 'E-mailnotificaties'],
   'Vaste prijs — vanaf €2.500', 2),
  ('Webapplicatie op maat',
   'Klantportaal, dashboard of interne tool.',
   array['Maatwerk functionaliteit', 'Inlog/beheerdeel', 'Op maat van jouw proces'],
   'Projectprijs — op aanvraag', 3),
  ('Onderhoud & hosting',
   'Doorlopend onderhoud en hosting van je site of applicatie.',
   array['Updates en kleine aanpassingen', 'Hosting en domeinbeheer', 'Vast maandbedrag'],
   'Vanaf €25-75 per maand', 4)
) as v(name, description, includes, price_label, order_index)
on conflict (pillar_id, name) do nothing;

with p as (select id from pillars where key = 'data')
insert into services (pillar_id, name, description, includes, price_label, order_index)
select p.id, v.name, v.description, v.includes, v.price_label, v.order_index
from p, (values
  ('Dataquickscan',
   'Waar staat je data nu, wat is er mogelijk? Laagdrempelige opener.',
   array['Inventarisatie huidige databronnen', 'Kansen en aanbevelingen op hoofdlijnen'],
   'Vaste prijs — laagdrempelige opener', 1),
  ('Dataplatform opzetten',
   'Het fundament: bronnen ontsluiten, opslag, pipelines.',
   array['Bronnen ontsluiten', 'Opslag en pipelines inrichten', 'Basis voor analytics én applicaties'],
   'Traject — op aanvraag', 2),
  ('Analytics & dashboards',
   'Inzicht bovenop het platform.',
   array['Dashboards en rapportages', 'Op maat van jouw KPI''s'],
   'Project of uurtarief — €100-135/uur', 3)
) as v(name, description, includes, price_label, order_index)
on conflict (pillar_id, name) do nothing;

with p as (select id from pillars where key = 'ai')
insert into services (pillar_id, name, description, includes, price_label, order_index)
select p.id, v.name, v.description, v.includes, v.price_label, v.order_index
from p, (values
  ('AI-startsessie',
   'Voor bedrijven die nog niet begonnen zijn: waar liggen kansen, wat is haalbaar?',
   array['Verkennend gesprek', 'Concrete kansen op een rij', 'Geen verplichtingen'],
   'Vaste prijs — opener', 1),
  ('AI-pilot',
   'Een concrete, afgebakende eerste toepassing.',
   array['Eén afgebakend use case', 'Werkend resultaat, geen concept'],
   'Traject — op aanvraag', 2),
  ('Agents & automatiseringen',
   'Voor meer gevorderde bedrijven: agentic workflows, procesautomatisering, integraties.',
   array['Agents en agentic workflows', 'Integraties met bestaande systemen', 'Doorlopende samenwerking mogelijk'],
   'Traject / doorlopend — €100-135/uur of dagtarief', 3)
) as v(name, description, includes, price_label, order_index)
on conflict (pillar_id, name) do nothing;
