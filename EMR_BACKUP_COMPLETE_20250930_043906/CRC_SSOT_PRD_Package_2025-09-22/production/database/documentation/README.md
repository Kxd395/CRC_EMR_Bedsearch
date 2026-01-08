# Databate Innergration Package

Everything required to stand up the Supabase/PostgreSQL schema that powers the CRC SSOT placement workflows lives here. Use this folder as the handoff bundle for anyone responsible for provisioning the database.

## Folder layout
- `runbooks/db_setup_runbook.md` — step-by-step checklist for creating the database, applying migrations, and validating objects.
- `schema/supabase_ssot_schema.sql` — canonical DDL (tables, enums, triggers, policies, and optional seeds).
- `schema/supabase_ssot_schema_diagram.md` — text diagram plus field reference for the schema entities.
- `env.example` — `.env` template containing the required connection variables.
- `apply_schema.sh` — helper script that runs the DDL against the database referenced by `EMR_DATABASE_URL`.

## Quick start
1. Duplicate `env.example` to `.env` (or export the variables in your shell) and fill in the actual Supabase credentials.
2. Verify the prerequisites in `runbooks/db_setup_runbook.md` (Supabase project, service role key, psql access).
3. Run `./apply_schema.sh` from this directory to apply the schema via `psql`.
4. Follow the validation steps in the runbook to confirm tables, indexes, triggers, and the `v_active_placement_searches` view.
5. Optionally uncomment the seed snippets at the bottom of `schema/supabase_ssot_schema.sql` to load sample data.

## Next steps
- Wire the backend service to the new database using `EMR_DATABASE_URL` (see backend runbook in `../documentation/placement_dropdown_upgrade/`).
- Store final credentials in your team vault and update the action log once provisioning is complete.
