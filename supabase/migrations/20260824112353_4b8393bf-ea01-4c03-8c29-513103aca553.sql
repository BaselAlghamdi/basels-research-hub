-- roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- first signup becomes admin
create or replace function public.bootstrap_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created_bootstrap_admin
after insert on auth.users
for each row execute function public.bootstrap_first_admin();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- research
create table public.research (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Equity Research',
  summary text not null default '',
  subtitle text,
  publication_date date not null default current_date,
  reading_time integer,
  author text not null default 'Basel M. Alghamdi',
  ticker text,
  cover_image_url text,
  content_md text not null default '',
  sources jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default true,
  pdf_url text,
  pdf_meta text,
  excel_url text,
  excel_meta text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.research to anon;
grant select, insert, update, delete on public.research to authenticated;
grant all on public.research to service_role;
alter table public.research enable row level security;

create policy "published research is public" on public.research for select to anon, authenticated using (published = true);
create policy "admins read all research" on public.research for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins insert research" on public.research for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update research" on public.research for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete research" on public.research for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger research_touch before update on public.research for each row execute function public.touch_updated_at();

-- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null default 'Financial Modeling',
  project_date date not null default current_date,
  summary text not null default '',
  content_md text not null default '',
  tools text[] not null default '{}',
  cover_image_url text,
  gallery text[] not null default '{}',
  pdf_url text,
  pdf_meta text,
  excel_url text,
  excel_meta text,
  external_url text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.projects to anon;
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;
alter table public.projects enable row level security;

create policy "published projects are public" on public.projects for select to anon, authenticated using (published = true);
create policy "admins read all projects" on public.projects for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins insert projects" on public.projects for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update projects" on public.projects for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete projects" on public.projects for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();

-- site settings
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

grant select on public.site_settings to anon;
grant select, insert, update, delete on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;

create policy "settings are public" on public.site_settings for select to anon, authenticated using (true);
create policy "admins insert settings" on public.site_settings for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete settings" on public.site_settings for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

insert into public.site_settings (key, value) values
('profile', '{"name":"Basel M. Alghamdi","role":"Finance Student @ King Abdulaziz University","email":"","linkedin":"https://www.linkedin.com/in/imbasel/","resume_url":"","location":"Jeddah, Saudi Arabia"}'::jsonb),
('about', '{"intro":"I am a finance student at King Abdulaziz University focused on investment research, equity analysis, valuation, and financial modeling. This site collects my independent research notes, company analyses, and selected finance projects.","education":[{"institution":"King Abdulaziz University","credential":"Bachelor of Science in Finance","period":"Expected graduation — placeholder","detail":"Coursework in corporate finance, investments, financial statement analysis, and capital markets."}],"certifications":[{"name":"Placeholder — add certifications or programs here","detail":""}],"skills":["Financial statement analysis","Three-statement modeling","DCF valuation","Comparable company analysis","Excel","Equity research writing"],"interests":["Investment Research","Equity Analysis","Asset Management","Valuation","Financial Modeling","Capital Markets"]}'::jsonb);

-- sample content (edit or delete from the admin panel)
insert into public.research (title, slug, category, subtitle, summary, publication_date, reading_time, ticker, featured, content_md, sources, tags) values
(
 'Saudi Petrochemicals: Margin Recovery Is Narrower Than Consensus Assumes',
 'saudi-petrochemicals-margin-recovery',
 'Industry Research',
 'Feedstock advantage remains intact, but the spread cycle argues for selectivity rather than sector-wide exposure.',
 'A review of olefins and polyolefins spreads, feedstock pricing, and capacity additions, and what they imply for regional producer margins.',
 current_date - 6, 9, NULL, true,
 E'## Summary\n\nRegional petrochemical producers retain a structural feedstock cost advantage, but the incremental driver of returns over the next several quarters is the **spread cycle**, not the cost position.\n\n### Key points\n\n- Global capacity additions continue to land ahead of demand growth.\n- Ethane allocation caps volume upside even where spreads improve.\n- Working capital release, not price, explains much of recent cash flow improvement.\n\n## Spread framework\n\n| Metric | FY-2 | FY-1 | Current |\n| --- | --- | --- | --- |\n| Polyethylene spread (USD/t) | 420 | 355 | 388 |\n| Utilisation (%) | 88 | 84 | 86 |\n| EBITDA margin (%) | 31 | 24 | 27 |\n\n*Figures are illustrative placeholders — replace with your own data.*\n\n> Cost advantage protects the downside of the cycle. It does not create the upside.\n\n## What would change the view\n\n1. Sustained utilisation above the mid-80s alongside firmer spreads.\n2. Evidence of capacity discipline in the next commissioning wave.\n3. Feedstock allocation increases at existing pricing.\n\n## Conclusion\n\nSelectivity over sector beta: prefer producers with integrated downstream conversion and disciplined capital programmes.',
 '[{"label":"Company annual reports","url":"https://example.com"},{"label":"Industry spread data (placeholder)","url":"https://example.com"}]'::jsonb,
 ARRAY['petrochemicals','spreads','saudi']
),
(
 'Three-Statement Modeling: Common Errors in Working Capital Forecasting',
 'working-capital-forecasting-errors',
 'Educational',
 'Why days-based assumptions break down and how to keep the balance sheet honest.',
 'A practical note on forecasting receivables, inventory, and payables in an integrated model without breaking the cash flow bridge.',
 current_date - 14, 7, NULL, true,
 E'## Why this matters\n\nWorking capital is where most student models quietly break. The income statement looks reasonable, the balance sheet balances, and the cash flow statement still tells the wrong story.\n\n## Three recurring errors\n\n1. **Mixing revenue and COGS drivers.** Inventory and payables should be driven off COGS, not revenue.\n2. **Averaging balances inconsistently.** Days calculations built on ending balances in some years and averages in others produce a false trend.\n3. **Hardcoding the plug.** A balancing plug hides errors rather than resolving them.\n\n## A cleaner structure\n\n| Item | Driver | Basis |\n| --- | --- | --- |\n| Receivables | DSO | Revenue |\n| Inventory | DIO | COGS |\n| Payables | DPO | COGS |\n\n### Checks worth building in\n\n- Balance sheet check row equal to zero in every period.\n- Cash flow from operations reconciled to the change in cash.\n- Sanity band on each days assumption versus history.\n\n> If the model cannot be explained line by line, it cannot be defended in an interview.',
 '[{"label":"Placeholder reference","url":"https://example.com"}]'::jsonb,
 ARRAY['modeling','working capital']
),
(
 'Banking Sector Note: Deposit Costs and Net Interest Margin Sensitivity',
 'deposit-costs-nim-sensitivity',
 'Macro',
 'Funding mix is becoming the differentiating variable as policy rates plateau.',
 'Framework for decomposing net interest margin into asset yield, funding cost, and mix effects, with a simple sensitivity table.',
 current_date - 27, 8, NULL, false,
 E'## Framework\n\nNet interest margin can be decomposed into three moving parts: asset yield, cost of funds, and balance sheet mix.\n\n## Sensitivity\n\n| Deposit beta | NIM impact (bps) |\n| --- | --- |\n| 0.30 | -8 |\n| 0.45 | -18 |\n| 0.60 | -29 |\n\n*Illustrative placeholder values.*\n\n### Observations\n\n- Demand deposit share is the single most useful disclosure for comparing banks.\n- Loan repricing lags matter more than headline policy direction.\n\n## Conclusion\n\nBanks with a durable non-interest-bearing deposit base should show materially lower margin compression as rates plateau.',
 '[]'::jsonb,
 ARRAY['banks','nim','macro']
),
(
 'Company Analysis Template: From Filings to an Investment View',
 'company-analysis-template',
 'Company Analysis',
 'A repeatable process for moving from disclosure to a defensible conclusion.',
 'The structure I use for company work: business model, unit economics, capital allocation, valuation, and risks.',
 current_date - 41, 6, NULL, false,
 E'## Process\n\n1. **Business model.** How the company earns a riyal or dollar of revenue.\n2. **Unit economics.** Margin structure and its drivers.\n3. **Capital allocation.** Where cash has gone over five years, and the return on it.\n4. **Valuation.** Cross-checking multiples against a discounted cash flow.\n5. **Risks.** What would make the thesis wrong.\n\n## Output\n\nA one-page view with an explicit thesis, three supporting arguments, and the falsification test for each.\n\n> The purpose of research is not to be interesting. It is to be checkable.',
 '[]'::jsonb,
 ARRAY['process','equity research']
);

insert into public.projects (title, slug, category, project_date, summary, tools, featured, content_md) values
(
 'Three-Statement Financial Model with Integrated DCF',
 'three-statement-financial-model',
 'Financial Modeling',
 current_date - 20,
 'A fully linked operating model with revenue build, working capital schedule, debt schedule, and a DCF valuation with sensitivity tables.',
 ARRAY['Excel','DCF','Scenario analysis'], true,
 E'## Objective\n\nBuild a fully integrated three-statement model that supports scenario analysis and a discounted cash flow valuation.\n\n## Methodology\n\n- Revenue built bottom-up from volume and price drivers.\n- Working capital driven by days assumptions on the correct bases.\n- Separate debt and depreciation schedules feeding the statements.\n- Free cash flow bridged from EBIT to unlevered free cash flow.\n\n## Analysis\n\n| Output | Base | Upside | Downside |\n| --- | --- | --- | --- |\n| WACC (%) | 9.5 | 9.0 | 10.5 |\n| Terminal growth (%) | 2.0 | 2.5 | 1.5 |\n| Implied value per share | 100 | 128 | 78 |\n\n*Placeholder values — replace with your model output.*\n\n## Key findings\n\n- Valuation is most sensitive to terminal assumptions, not near-term margin.\n- Balance sheet checks and circularity controls matter more than model size.'
),
(
 'Comparable Company and Precedent Transaction Analysis',
 'comparable-company-analysis',
 'Valuation',
 current_date - 35,
 'Trading comparables and transaction multiples for a selected sector, with adjustments for capital structure and non-recurring items.',
 ARRAY['Excel','Comparables','Capital IQ (placeholder)'], true,
 E'## Objective\n\nEstablish a defensible relative valuation range for a selected sector.\n\n## Methodology\n\n- Peer screening on business model, scale, and margin structure.\n- Calendarisation and normalisation of earnings.\n- EV bridge including leases and minority interests.\n\n## Key findings\n\n- Multiple dispersion within the peer set is explained largely by return on invested capital.\n- Transaction multiples carry a control premium that should not be applied to minority stakes.'
),
(
 'Equity Research Initiation Report',
 'equity-research-initiation-report',
 'Equity Research',
 current_date - 60,
 'A full initiation-style report covering investment thesis, industry context, financial forecasts, valuation, and risks.',
 ARRAY['Excel','Research writing','Valuation'], false,
 E'## Overview\n\nAn initiation-format report structured the way sell-side research is presented.\n\n## Contents\n\n1. Investment thesis and rating rationale\n2. Industry and competitive positioning\n3. Financial forecasts\n4. Valuation and target derivation\n5. Risks to the view'
),
(
 'Portfolio Construction and Risk Analysis (University Project)',
 'portfolio-construction-risk-analysis',
 'Academic Projects',
 current_date - 90,
 'Mean-variance portfolio construction with constraints, plus attribution and risk decomposition for the resulting allocation.',
 ARRAY['Excel','Portfolio theory','Statistics'], false,
 E'## Objective\n\nConstruct a constrained multi-asset portfolio and evaluate its risk characteristics.\n\n## Methodology\n\n- Covariance estimation from historical returns.\n- Optimisation with position and sector constraints.\n- Ex-post attribution between allocation and selection.\n\n## Key findings\n\n- Constraints materially reduce estimation-error sensitivity.\n- Reported tracking error is highly dependent on the estimation window.'
);