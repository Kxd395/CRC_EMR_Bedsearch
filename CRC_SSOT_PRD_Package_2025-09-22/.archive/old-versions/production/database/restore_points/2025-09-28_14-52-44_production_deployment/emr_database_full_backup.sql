--
-- PostgreSQL database dump
--

\restrict IocsMthaxczEHceGa6GtgAM2ioVDOBc1BIDlU9sC1fRkVES4yZ6t4lDehPj4tp9

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS emr_placement_ssot;
--
-- Name: emr_placement_ssot; Type: DATABASE; Schema: -; Owner: emr_admin
--

CREATE DATABASE emr_placement_ssot WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';


ALTER DATABASE emr_placement_ssot OWNER TO emr_admin;

\unrestrict IocsMthaxczEHceGa6GtgAM2ioVDOBc1BIDlU9sC1fRkVES4yZ6t4lDehPj4tp9
\connect emr_placement_ssot
\restrict IocsMthaxczEHceGa6GtgAM2ioVDOBc1BIDlU9sC1fRkVES4yZ6t4lDehPj4tp9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: placement_status; Type: TYPE; Schema: public; Owner: emr_admin
--

CREATE TYPE public.placement_status AS ENUM (
    'draft',
    'sent',
    'waiting',
    'accepted',
    'denied',
    'no_beds',
    'transfer_set',
    'closed'
);


ALTER TYPE public.placement_status OWNER TO emr_admin;

--
-- Name: audit_trigger(); Type: FUNCTION; Schema: public; Owner: emr_admin
--

CREATE FUNCTION public.audit_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, old_values)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, old_values, new_values)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, new_values)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION public.audit_trigger() OWNER TO emr_admin;

--
-- Name: set_transfer_set(uuid, uuid); Type: FUNCTION; Schema: public; Owner: emr_admin
--

CREATE FUNCTION public.set_transfer_set(p_patient_id uuid, p_search_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE placement_search
    SET is_transfer_set = false
    WHERE patient_id = p_patient_id AND is_transfer_set;

  UPDATE placement_search
    SET is_transfer_set = true,
        status = 'transfer_set'
    WHERE placement_search_id = p_search_id;
END;
$$;


ALTER FUNCTION public.set_transfer_set(p_patient_id uuid, p_search_id uuid) OWNER TO emr_admin;

--
-- Name: trg_touch_placement_search(); Type: FUNCTION; Schema: public; Owner: emr_admin
--

CREATE FUNCTION public.trg_touch_placement_search() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.last_updated_at := now();
  IF NEW.facility_name IS NULL AND NEW.facility_id IS NOT NULL THEN
    SELECT f.name INTO NEW.facility_name FROM facilities f WHERE f.facility_id = NEW.facility_id;
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trg_touch_placement_search() OWNER TO emr_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log; Type: TABLE; Schema: public; Owner: emr_admin
--

CREATE TABLE public.audit_log (
    audit_id uuid DEFAULT gen_random_uuid() NOT NULL,
    table_name text NOT NULL,
    operation text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    user_id uuid,
    user_ip inet,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_log OWNER TO emr_admin;

--
-- Name: TABLE audit_log; Type: COMMENT; Schema: public; Owner: emr_admin
--

COMMENT ON TABLE public.audit_log IS 'HIPAA audit trail for all EMR operations';


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: emr_admin
--

CREATE TABLE public.facilities (
    facility_id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    city text,
    state text,
    phone text,
    accepts_302 boolean DEFAULT false NOT NULL,
    accepts_mat boolean DEFAULT false NOT NULL,
    accepts_secure boolean DEFAULT false NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.facilities OWNER TO emr_admin;

--
-- Name: TABLE facilities; Type: COMMENT; Schema: public; Owner: emr_admin
--

COMMENT ON TABLE public.facilities IS 'Healthcare facilities and their capabilities';


--
-- Name: patients; Type: TABLE; Schema: public; Owner: emr_admin
--

CREATE TABLE public.patients (
    patient_id uuid DEFAULT gen_random_uuid() NOT NULL,
    mrn text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patients OWNER TO emr_admin;

--
-- Name: TABLE patients; Type: COMMENT; Schema: public; Owner: emr_admin
--

COMMENT ON TABLE public.patients IS 'Patient demographics and basic information (PHI)';


--
-- Name: placement_notes; Type: TABLE; Schema: public; Owner: emr_admin
--

CREATE TABLE public.placement_notes (
    note_id uuid DEFAULT gen_random_uuid() NOT NULL,
    placement_search_id uuid NOT NULL,
    author_id uuid NOT NULL,
    body text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.placement_notes OWNER TO emr_admin;

--
-- Name: TABLE placement_notes; Type: COMMENT; Schema: public; Owner: emr_admin
--

COMMENT ON TABLE public.placement_notes IS 'Clinical notes and updates for placements';


--
-- Name: placement_search; Type: TABLE; Schema: public; Owner: emr_admin
--

CREATE TABLE public.placement_search (
    placement_search_id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    facility_id uuid,
    facility_name text,
    status public.placement_status DEFAULT 'draft'::public.placement_status NOT NULL,
    is_accepting boolean DEFAULT false NOT NULL,
    is_transfer_set boolean DEFAULT false NOT NULL,
    is_open boolean GENERATED ALWAYS AS ((status = ANY (ARRAY['sent'::public.placement_status, 'waiting'::public.placement_status, 'accepted'::public.placement_status, 'transfer_set'::public.placement_status]))) STORED,
    search_origin text,
    notes_summary text,
    created_by uuid,
    last_updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.placement_search OWNER TO emr_admin;

--
-- Name: TABLE placement_search; Type: COMMENT; Schema: public; Owner: emr_admin
--

COMMENT ON TABLE public.placement_search IS 'Patient placement requests and status tracking';


--
-- Name: v_active_placement_searches; Type: VIEW; Schema: public; Owner: emr_admin
--

CREATE VIEW public.v_active_placement_searches AS
 SELECT ps.placement_search_id,
    ps.patient_id,
    ps.facility_id,
    COALESCE(ps.facility_name, f.name) AS facility_name,
    ps.status,
    ps.is_accepting,
    ps.is_transfer_set,
    ps.last_updated_at
   FROM (public.placement_search ps
     LEFT JOIN public.facilities f ON ((f.facility_id = ps.facility_id)))
  WHERE ps.is_open
  ORDER BY ps.patient_id, ps.is_transfer_set DESC, ps.is_accepting DESC, ps.last_updated_at DESC;


ALTER VIEW public.v_active_placement_searches OWNER TO emr_admin;

--
-- Name: VIEW v_active_placement_searches; Type: COMMENT; Schema: public; Owner: emr_admin
--

COMMENT ON VIEW public.v_active_placement_searches IS 'Active placement searches for dropdown UI';


--
-- Data for Name: audit_log; Type: TABLE DATA; Schema: public; Owner: emr_admin
--

COPY public.audit_log (audit_id, table_name, operation, old_values, new_values, user_id, user_ip, created_at) FROM stdin;
f397e6bc-9791-4d66-bf91-a976382334c2	patients	INSERT	\N	{"mrn": "MRN001", "last_name": "Smith", "created_at": "2025-09-28T14:48:46.133294-04:00", "first_name": "John", "patient_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "updated_at": "2025-09-28T14:48:46.133294-04:00", "date_of_birth": "1985-03-15"}	\N	\N	2025-09-28 14:48:46.133294-04
3e35dda3-bdb8-4e2a-950e-497dd778fbb3	patients	INSERT	\N	{"mrn": "MRN002", "last_name": "Doe", "created_at": "2025-09-28T14:48:46.133294-04:00", "first_name": "Jane", "patient_id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "updated_at": "2025-09-28T14:48:46.133294-04:00", "date_of_birth": "1992-07-22"}	\N	\N	2025-09-28 14:48:46.133294-04
e9d8e128-5425-408c-848c-c9094c4dbe73	placement_search	INSERT	\N	{"status": "waiting", "is_open": true, "created_at": "2025-09-28T14:48:46.158012-04:00", "created_by": null, "patient_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "facility_id": "11111111-1111-1111-1111-111111111111", "is_accepting": false, "facility_name": null, "notes_summary": null, "search_origin": null, "is_transfer_set": false, "last_updated_at": "2025-09-28T14:48:46.158012-04:00", "placement_search_id": "cccccccc-cccc-cccc-cccc-cccccccccccc"}	\N	\N	2025-09-28 14:48:46.158012-04
d0d6fb4d-037c-4b04-bf3a-861e9789b978	placement_search	INSERT	\N	{"status": "accepted", "is_open": true, "created_at": "2025-09-28T14:48:46.158012-04:00", "created_by": null, "patient_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "facility_id": "22222222-2222-2222-2222-222222222222", "is_accepting": true, "facility_name": null, "notes_summary": null, "search_origin": null, "is_transfer_set": false, "last_updated_at": "2025-09-28T14:48:46.158012-04:00", "placement_search_id": "dddddddd-dddd-dddd-dddd-dddddddddddd"}	\N	\N	2025-09-28 14:48:46.158012-04
b9616009-79b3-4bff-bc6d-f2f71b565ba4	placement_notes	INSERT	\N	{"body": "Patient accepted for MAT program. Transfer scheduled for tomorrow.", "note_id": "88a43d0e-9494-4b2d-8581-a495af31909b", "metadata": {}, "author_id": "99999999-9999-9999-9999-999999999999", "created_at": "2025-09-28T14:48:46.184702-04:00", "placement_search_id": "dddddddd-dddd-dddd-dddd-dddddddddddd"}	\N	\N	2025-09-28 14:48:46.184702-04
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: emr_admin
--

COPY public.facilities (facility_id, name, city, state, phone, accepts_302, accepts_mat, accepts_secure, metadata, created_at, updated_at) FROM stdin;
11111111-1111-1111-1111-111111111111	Jefferson Abington Hospital	Abington	PA	\N	t	t	t	{}	2025-09-28 14:48:46.10698-04	2025-09-28 14:48:46.10698-04
22222222-2222-2222-2222-222222222222	Sunrise Treatment Center	Philadelphia	PA	\N	f	t	f	{}	2025-09-28 14:48:46.10698-04	2025-09-28 14:48:46.10698-04
33333333-3333-3333-3333-333333333333	Penn Medicine Lancaster General	Lancaster	PA	\N	t	f	t	{}	2025-09-28 14:48:46.10698-04	2025-09-28 14:48:46.10698-04
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: emr_admin
--

COPY public.patients (patient_id, mrn, first_name, last_name, date_of_birth, created_at, updated_at) FROM stdin;
aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	MRN001	John	Smith	1985-03-15	2025-09-28 14:48:46.133294-04	2025-09-28 14:48:46.133294-04
bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb	MRN002	Jane	Doe	1992-07-22	2025-09-28 14:48:46.133294-04	2025-09-28 14:48:46.133294-04
\.


--
-- Data for Name: placement_notes; Type: TABLE DATA; Schema: public; Owner: emr_admin
--

COPY public.placement_notes (note_id, placement_search_id, author_id, body, metadata, created_at) FROM stdin;
88a43d0e-9494-4b2d-8581-a495af31909b	dddddddd-dddd-dddd-dddd-dddddddddddd	99999999-9999-9999-9999-999999999999	Patient accepted for MAT program. Transfer scheduled for tomorrow.	{}	2025-09-28 14:48:46.184702-04
\.


--
-- Data for Name: placement_search; Type: TABLE DATA; Schema: public; Owner: emr_admin
--

COPY public.placement_search (placement_search_id, patient_id, facility_id, facility_name, status, is_accepting, is_transfer_set, search_origin, notes_summary, created_by, last_updated_at, created_at) FROM stdin;
cccccccc-cccc-cccc-cccc-cccccccccccc	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	11111111-1111-1111-1111-111111111111	\N	waiting	f	f	\N	\N	\N	2025-09-28 14:48:46.158012-04	2025-09-28 14:48:46.158012-04
dddddddd-dddd-dddd-dddd-dddddddddddd	aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	22222222-2222-2222-2222-222222222222	\N	accepted	t	f	\N	\N	\N	2025-09-28 14:48:46.158012-04	2025-09-28 14:48:46.158012-04
\.


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (audit_id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (facility_id);


--
-- Name: patients patients_mrn_key; Type: CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_mrn_key UNIQUE (mrn);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (patient_id);


--
-- Name: placement_notes placement_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.placement_notes
    ADD CONSTRAINT placement_notes_pkey PRIMARY KEY (note_id);


--
-- Name: placement_search placement_search_pkey; Type: CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.placement_search
    ADD CONSTRAINT placement_search_pkey PRIMARY KEY (placement_search_id);


--
-- Name: idx_placement_notes_psid_created; Type: INDEX; Schema: public; Owner: emr_admin
--

CREATE INDEX idx_placement_notes_psid_created ON public.placement_notes USING btree (placement_search_id, created_at DESC);


--
-- Name: idx_placement_search_facility; Type: INDEX; Schema: public; Owner: emr_admin
--

CREATE INDEX idx_placement_search_facility ON public.placement_search USING btree (facility_id);


--
-- Name: idx_placement_search_patient_status; Type: INDEX; Schema: public; Owner: emr_admin
--

CREATE INDEX idx_placement_search_patient_status ON public.placement_search USING btree (patient_id, status);


--
-- Name: idx_placement_search_transfer_unique; Type: INDEX; Schema: public; Owner: emr_admin
--

CREATE UNIQUE INDEX idx_placement_search_transfer_unique ON public.placement_search USING btree (patient_id) WHERE is_transfer_set;


--
-- Name: patients audit_patients; Type: TRIGGER; Schema: public; Owner: emr_admin
--

CREATE TRIGGER audit_patients AFTER INSERT OR DELETE OR UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();


--
-- Name: placement_notes audit_placement_notes; Type: TRIGGER; Schema: public; Owner: emr_admin
--

CREATE TRIGGER audit_placement_notes AFTER INSERT OR DELETE OR UPDATE ON public.placement_notes FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();


--
-- Name: placement_search audit_placement_search; Type: TRIGGER; Schema: public; Owner: emr_admin
--

CREATE TRIGGER audit_placement_search AFTER INSERT OR DELETE OR UPDATE ON public.placement_search FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();


--
-- Name: placement_search placement_search_touch; Type: TRIGGER; Schema: public; Owner: emr_admin
--

CREATE TRIGGER placement_search_touch BEFORE UPDATE ON public.placement_search FOR EACH ROW EXECUTE FUNCTION public.trg_touch_placement_search();


--
-- Name: placement_notes placement_notes_placement_search_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.placement_notes
    ADD CONSTRAINT placement_notes_placement_search_id_fkey FOREIGN KEY (placement_search_id) REFERENCES public.placement_search(placement_search_id) ON DELETE CASCADE;


--
-- Name: placement_search placement_search_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.placement_search
    ADD CONSTRAINT placement_search_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES public.facilities(facility_id) ON DELETE SET NULL;


--
-- Name: placement_search placement_search_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: emr_admin
--

ALTER TABLE ONLY public.placement_search
    ADD CONSTRAINT placement_search_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(patient_id) ON DELETE CASCADE;


--
-- Name: placement_search Staff read placement searches; Type: POLICY; Schema: public; Owner: emr_admin
--

CREATE POLICY "Staff read placement searches" ON public.placement_search FOR SELECT USING (true);


--
-- Name: facilities; Type: ROW SECURITY; Schema: public; Owner: emr_admin
--

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

--
-- Name: patients; Type: ROW SECURITY; Schema: public; Owner: emr_admin
--

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_notes; Type: ROW SECURITY; Schema: public; Owner: emr_admin
--

ALTER TABLE public.placement_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: placement_search; Type: ROW SECURITY; Schema: public; Owner: emr_admin
--

ALTER TABLE public.placement_search ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict IocsMthaxczEHceGa6GtgAM2ioVDOBc1BIDlU9sC1fRkVES4yZ6t4lDehPj4tp9

