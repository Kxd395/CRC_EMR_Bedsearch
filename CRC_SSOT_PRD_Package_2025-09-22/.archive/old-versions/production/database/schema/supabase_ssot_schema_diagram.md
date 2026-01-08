# Supabase SSOT Schema Overview

This diagram illustrates how the core tables introduced in `supabase_ssot_schema.sql` relate to one another.

```text
+---------------------+          +------------------------+
|      patients       |<---------|    placement_search    |
|---------------------| 1     *  |------------------------|
| patient_id (PK)     |          | placement_search_id PK |
| mrn (unique)        |          | patient_id  FK --------+
| first_name          |          | facility_id FK ---------+
| last_name           |          | facility_name           |
| date_of_birth       |          | status (placement_status)
| created_at          |          | is_accepting            |
| updated_at          |          | is_transfer_set         |
+---------------------+          | is_open (generated)     |
                                 | search_origin           |
                                 | notes_summary           |
                                 | created_by              |
                                 | last_updated_at         |
                                 | created_at              |
                                 +-----------+-------------+
                                             |
                                             | 1
                                             |
                                             v *
                                 +------------------------+
                                 |    placement_notes     |
                                 |------------------------|
                                 | note_id (PK)           |
                                 | placement_search_id FK |
                                 | author_id              |
                                 | body                   |
                                 | metadata (jsonb)       |
                                 | created_at             |
                                 +------------------------+

+---------------------+
|     facilities      |
|---------------------|
| facility_id (PK)    |
| name                |
| city                |
| state               |
| phone               |
| accepts_302         |
| accepts_mat         |
| accepts_secure      |
| metadata (jsonb)    |
| created_at          |
| updated_at          |
+---------------------+
```

## Field Reference

| Table                | Key Fields                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `patients`           | `patient_id`, `mrn`, `first_name`, `last_name`, `date_of_birth`             |
| `facilities`         | `facility_id`, `name`, `accepts_302`, `accepts_mat`, `accepts_secure`       |
| `placement_search`   | `placement_search_id`, `patient_id`, `facility_id`, `status`, `is_open`     |
| `placement_notes`    | `note_id`, `placement_search_id`, `author_id`, `body`, `metadata`           |
| `v_active_placement_searches` | Derived view filtered to open searches for dropdown consumption |

> Next step: execute the roadmap in `organized/TODO_CRITICAL.md` starting with database migrations, then backend endpoints, followed by the frontend dropdown integration.
