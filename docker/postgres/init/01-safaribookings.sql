--
-- PostgreSQL database dump
--

\restrict WzYNQFbB1S5bIdQpGvD7P8jJe0wVVfYR0I35cqSyegheuK0nnymTBNTi8ikvB3m

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ComfortLevel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ComfortLevel" AS ENUM (
    'CAMPING',
    'BUDGET',
    'MID_RANGE',
    'LUXURY',
    'SUPER_LUXURY'
);


--
-- Name: DestinationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DestinationType" AS ENUM (
    'NATIONAL_PARK',
    'GAME_RESERVE',
    'CONSERVANCY',
    'COUNTRY',
    'ISLAND',
    'NATURE_RESERVE',
    'NATURAL_WONDER'
);


--
-- Name: InquiryStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."InquiryStatus" AS ENUM (
    'PENDING',
    'ROUTED',
    'RESPONDED',
    'CLOSED'
);


--
-- Name: LeadStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."LeadStatus" AS ENUM (
    'DISPATCHED',
    'VIEWED',
    'PROPOSAL_SENT',
    'DECLINED'
);


--
-- Name: ReservationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReservationStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'DECLINED',
    'CANCELLED',
    'COMPLETED'
);


--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING_MODERATION',
    'APPROVED',
    'REJECTED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'TRAVELER',
    'OPERATOR',
    'ADMIN'
);


--
-- Name: SlotStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SlotStatus" AS ENUM (
    'OPEN',
    'CLOSED'
);


--
-- Name: TourType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TourType" AS ENUM (
    'PRIVATE',
    'SHARED_GROUP',
    'FLY_IN',
    'SELF_DRIVE'
);


--
-- Name: reservation_requires_departure(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reservation_requires_departure() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.slot_id IS NULL THEN
    RAISE EXCEPTION 'A reservation must be for a scheduled departure' USING ERRCODE = '23502';
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: reservation_seats_sync(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reservation_seats_sync() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  old_holds boolean := false;
  new_holds boolean := false;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    old_holds := OLD.slot_id IS NOT NULL AND OLD.status IN ('PENDING', 'APPROVED', 'COMPLETED');
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    new_holds := NEW.slot_id IS NOT NULL AND NEW.status IN ('PENDING', 'APPROVED', 'COMPLETED');
  END IF;

  IF TG_OP = 'UPDATE' AND old_holds AND new_holds
     AND OLD.slot_id = NEW.slot_id
     AND OLD.vehicle_id IS NOT DISTINCT FROM NEW.vehicle_id
     AND OLD.adults_count + OLD.children_count = NEW.adults_count + NEW.children_count THEN
    RETURN NEW; -- e.g. PENDING -> APPROVED: seats stay held
  END IF;

  IF old_holds THEN
    UPDATE tour_slots SET booked_seats = booked_seats - (OLD.adults_count + OLD.children_count), updated_at = now()
      WHERE id = OLD.slot_id;
    IF OLD.vehicle_id IS NOT NULL THEN
      UPDATE slot_vehicles SET booked_seats = booked_seats - (OLD.adults_count + OLD.children_count)
        WHERE slot_id = OLD.slot_id AND vehicle_id = OLD.vehicle_id;
    END IF;
  END IF;

  IF new_holds THEN
    UPDATE tour_slots SET booked_seats = booked_seats + (NEW.adults_count + NEW.children_count), updated_at = now()
      WHERE id = NEW.slot_id;
    IF NEW.vehicle_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM slot_vehicles WHERE slot_id = NEW.slot_id AND vehicle_id = NEW.vehicle_id) THEN
        RAISE EXCEPTION 'Vehicle % is not assigned to departure %', NEW.vehicle_id, NEW.slot_id USING ERRCODE = '23514';
      END IF;
      UPDATE slot_vehicles SET booked_seats = booked_seats + (NEW.adults_count + NEW.children_count)
        WHERE slot_id = NEW.slot_id AND vehicle_id = NEW.vehicle_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;


--
-- Name: slot_vehicle_no_overlap(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.slot_vehicle_no_overlap() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_start timestamp;
  v_days integer;
BEGIN
  -- Serialise concurrent assignments of the same vehicle.
  PERFORM 1 FROM vehicles WHERE id = NEW.vehicle_id FOR UPDATE;
  SELECT s.start_date, GREATEST(t.duration_days, 1) INTO v_start, v_days
    FROM tour_slots s JOIN tours t ON t.id = s.tour_id WHERE s.id = NEW.slot_id;
  IF EXISTS (
    SELECT 1 FROM slot_vehicles sv
      JOIN tour_slots s2 ON s2.id = sv.slot_id
      JOIN tours t2 ON t2.id = s2.tour_id
    WHERE sv.vehicle_id = NEW.vehicle_id
      AND sv.slot_id <> NEW.slot_id
      AND s2.start_date < v_start + v_days * interval '1 day'
      AND v_start < s2.start_date + GREATEST(t2.duration_days, 1) * interval '1 day'
  ) THEN
    RAISE EXCEPTION 'VEHICLE_OVERLAP: vehicle % is already on a departure that overlaps these dates', NEW.vehicle_id
      USING ERRCODE = '23P01';
  END IF;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id text NOT NULL,
    operator_id text NOT NULL,
    author_id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    cover_image_url text,
    tag text,
    status text DEFAULT 'PUBLISHED'::text NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: destination_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destination_sections (
    id text NOT NULL,
    destination_id text NOT NULL,
    key text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    bullet_items text[] DEFAULT ARRAY[]::text[],
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: destinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.destinations (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    country text NOT NULL,
    type public."DestinationType" NOT NULL,
    description text,
    featured_image_url text,
    latitude double precision,
    longitude double precision,
    best_time_to_visit jsonb,
    wildlife_present jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    best_time_summary text,
    daily_rates text,
    high_season text,
    popularity_rank integer,
    rating double precision,
    review_count integer DEFAULT 0 NOT NULL
);


--
-- Name: experts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experts (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    country text NOT NULL,
    review_count integer DEFAULT 0 NOT NULL,
    biography text NOT NULL,
    image_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id text NOT NULL,
    traveler_id text NOT NULL,
    tour_id text,
    preferred_country text,
    travel_date_start timestamp(3) without time zone,
    travel_date_end timestamp(3) without time zone,
    is_flexible_dates boolean DEFAULT true NOT NULL,
    adults_count integer DEFAULT 1 NOT NULL,
    children_count integer DEFAULT 0 NOT NULL,
    budget_per_person_usd double precision,
    comfort_preference public."ComfortLevel",
    custom_notes text,
    is_broadcast boolean DEFAULT false NOT NULL,
    status public."InquiryStatus" DEFAULT 'PENDING'::public."InquiryStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    slot_id text
);


--
-- Name: inquiry_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiry_leads (
    id text NOT NULL,
    inquiry_id text NOT NULL,
    operator_id text NOT NULL,
    status public."LeadStatus" DEFAULT 'DISPATCHED'::public."LeadStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: media_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_assets (
    id text NOT NULL,
    tour_id text,
    filename text NOT NULL,
    mime_type text NOT NULL,
    size_bytes integer NOT NULL,
    data bytea NOT NULL,
    alt_text text,
    is_cover boolean DEFAULT false NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id text NOT NULL,
    inquiry_lead_id text NOT NULL,
    sender_id text NOT NULL,
    content text NOT NULL,
    attachment_urls text[],
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    type text DEFAULT 'INFO'::text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: operators; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.operators (
    id text NOT NULL,
    user_id text NOT NULL,
    company_name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    banner_url text,
    country_of_origin text NOT NULL,
    headquarters_address text,
    registration_number text,
    license_document_url text,
    is_verified boolean DEFAULT false NOT NULL,
    verification_date timestamp(3) without time zone,
    overview_text text,
    year_established integer,
    price_tier public."ComfortLevel" DEFAULT 'MID_RANGE'::public."ComfortLevel",
    average_rating double precision DEFAULT 0.00 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    offices_in text[] DEFAULT ARRAY[]::text[],
    service_summary text
);


--
-- Name: reservation_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservation_messages (
    id text NOT NULL,
    reservation_id text NOT NULL,
    sender_id text NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reservations (
    id text NOT NULL,
    reference text NOT NULL,
    traveler_id text NOT NULL,
    tour_id text NOT NULL,
    operator_id text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    adults_count integer NOT NULL,
    children_count integer DEFAULT 0 NOT NULL,
    special_requests text,
    estimated_total_usd double precision NOT NULL,
    status public."ReservationStatus" DEFAULT 'PENDING'::public."ReservationStatus" NOT NULL,
    operator_note text,
    decided_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    completed_at timestamp(3) without time zone,
    slot_id text,
    vehicle_id text
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    operator_id text NOT NULL,
    tour_id text,
    traveler_id text NOT NULL,
    overall_rating double precision NOT NULL,
    guide_rating double precision,
    vehicle_rating double precision,
    value_rating double precision,
    itinerary_accuracy_rating double precision,
    review_title text NOT NULL,
    review_body text NOT NULL,
    travel_date timestamp(3) without time zone,
    is_verified_booking boolean DEFAULT true NOT NULL,
    status public."ReviewStatus" DEFAULT 'PENDING_MODERATION'::public."ReviewStatus" NOT NULL,
    operator_reply text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: slot_vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.slot_vehicles (
    slot_id text NOT NULL,
    vehicle_id text NOT NULL,
    seats integer NOT NULL,
    booked_seats integer DEFAULT 0 NOT NULL,
    CONSTRAINT slot_vehicles_seats_check CHECK (((seats > 0) AND (booked_seats >= 0) AND (booked_seats <= seats)))
);


--
-- Name: tour_availability; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_availability (
    tour_id text NOT NULL,
    mode text DEFAULT 'OPEN_DATED'::text NOT NULL,
    total_capacity integer,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: tour_destinations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_destinations (
    tour_id text NOT NULL,
    destination_id text NOT NULL
);


--
-- Name: tour_itineraries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_itineraries (
    id text NOT NULL,
    tour_id text NOT NULL,
    day_number integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    accommodation_name text,
    accommodation_type public."ComfortLevel",
    meals_included text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: tour_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tour_slots (
    id text NOT NULL,
    tour_id text NOT NULL,
    start_date timestamp(3) without time zone NOT NULL,
    max_travelers integer NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    booked_seats integer DEFAULT 0 NOT NULL,
    departure_time text DEFAULT '08:00'::text NOT NULL,
    route text,
    status public."SlotStatus" DEFAULT 'OPEN'::public."SlotStatus" NOT NULL,
    CONSTRAINT tour_slots_seats_check CHECK (((booked_seats >= 0) AND (booked_seats <= max_travelers)))
);


--
-- Name: tours; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tours (
    id text NOT NULL,
    operator_id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    duration_days integer NOT NULL,
    duration_nights integer NOT NULL,
    min_price_usd double precision NOT NULL,
    max_price_usd double precision,
    comfort_level public."ComfortLevel" NOT NULL,
    tour_type public."TourType" NOT NULL,
    primary_country text NOT NULL,
    start_location text,
    end_location text,
    inclusions text[],
    exclusions text[],
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    country text,
    role public."Role" DEFAULT 'TRAVELER'::public."Role" NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id text NOT NULL,
    operator_id text NOT NULL,
    name text NOT NULL,
    vehicle_type text DEFAULT '4x4 Safari Vehicle'::text NOT NULL,
    seats integer NOT NULL,
    plate_number text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT vehicles_seats_check CHECK (((seats > 0) AND (seats <= 100)))
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
9967420c-5a49-4b92-b8b6-ebed9b536eac	33b36c8bad0d52b2f7b0125781112eed5281752f879d5c1d748807a170b66daa	2026-10-19 16:15:04.027322+00	20260928180338_init	\N	\N	2026-10-19 16:15:03.872152+00	1
91fde21e-abbe-4720-b6ab-105863933582	8fda62b977d5b8121384ce5f48fae0166258c327da791da998fec773911e267c	2026-10-19 16:15:04.126292+00	20261019000000_add_media_slots_blog_messages_notifications	\N	\N	2026-10-19 16:15:04.032156+00	1
49c8a877-4df9-4492-9a0d-6e0083d8145c	cb997bbd4eef3d6c6c158c693c71d6e83035a331665cc4e15968eda52e274a33	2026-10-19 18:12:41.972327+00	20261019180000_catalog_countries_offices_experts	\N	\N	2026-10-19 18:12:41.924824+00	1
bd1cc9d2-e386-4db1-98c2-9f655b2b5037	40877f11f542ce16b355f852905fb4dfbe823a1a970c20f13a34985fe76f6afb	2026-10-19 19:11:42.505065+00	20261020090000_live_departure_capacity	\N	\N	2026-10-19 19:11:42.409207+00	1
f581ca79-9633-4092-9bb1-02724654d724	ef03c189fb1f654c4620c69db5967efe8805f4fb0e926a81cfc40d904ec799ca	2026-10-19 19:36:05.351965+00	20261020120000_inquiry_departure	\N	\N	2026-10-19 19:36:05.32519+00	1
a762c301-e19d-4f12-995c-12b24bd37f30	570c42cb4d49fb9dcb280324e78320a39530554382ae533be69fa1d8e770cf9b	2026-10-19 19:54:04.648976+00	20261020150000_db_enforced_seat_rules	\N	\N	2026-10-19 19:54:04.571836+00	1
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.blog_posts (id, operator_id, author_id, title, slug, excerpt, content, cover_image_url, tag, status, view_count, created_at, updated_at) FROM stdin;
8d2f1a9b-3638-46c6-a86d-6484775f2dcc	786e8685-6f8c-4c7a-9856-885e39a7f030	830419b1-14d6-45c3-9bf9-d1f39c3e818f	7 Days in Northern Tanzania: The Perfect First-Timer Safari Route	7-days-northern-tanzania-first-timer-route	How to combine Tarangire, Ngorongoro Crater, and Central Serengeti without spending entire days exhausted inside a vehicle.	<h2>Designing a Balanced Safari Itinerary</h2><p>Many travelers try to pack too much into a single week. After guiding hundreds of private groups, here is the golden ratio that guarantees maximum predator encounters with relaxed lodge evenings.</p><h3>Day 1-2: Tarangire National Park</h3><p>Start in Tarangire, famous for ancient baobabs and massive elephant herds roaming the riverbeds.</p><h3>Day 3: The Ngorongoro Caldera</h3><p>Descend 600 meters into the UNESCO World Heritage caldera early in the morning for high chances of spotting endangered black rhinos.</p><h3>Day 4-7: Serengeti National Park</h3><p>Spend three full nights in central and northern Serengeti to track resident pride dynamics and scenic sunsets.</p>	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	Travel Guides	PUBLISHED	285	2026-10-12 20:24:55.776	2026-10-12 20:24:55.776
107c395b-ff48-4a04-b66f-b1db28e33ceb	2c2cd580-7109-4a21-ad9e-da9bde7941b5	3711fe75-62b2-43ba-82cf-79971ca2662b	Secret River Crossings of Northern Serengeti 1791837249952	secret-river-crossings-of-northern-serengeti-1791837249952	Updated excerpt: Verified tips from lead safari guides.	<h2>Inside Northern Serengeti</h2><p>Our experienced guides know the exact vantage points near Kogatende. When you book our Odyssey package, our custom 4x4 allows unobstructed 360-degree photography.</p>	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	Parks & Wildlife	PUBLISHED	0	2026-10-12 20:34:23.885	2026-10-12 20:34:27.03
d8653fc0-028c-4c18-a4ba-cba9c5a16f1c	761c2fbc-af79-47f1-9390-5aeb60179942	11919b2d-abb9-4106-9f79-13dcb480440e	Secret River Crossings of Northern Serengeti 1791837299424	secret-river-crossings-of-northern-serengeti-1791837299424	Updated excerpt: Verified tips from lead safari guides.	<h2>Inside Northern Serengeti</h2><p>Our experienced guides know the exact vantage points near Kogatende. When you book our Odyssey package, our custom 4x4 allows unobstructed 360-degree photography.</p>	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	Parks & Wildlife	PUBLISHED	0	2026-10-12 20:35:01.909	2026-10-12 20:35:02.061
ce16b354-b58c-4f7f-a7a7-9c982c2bcfd9	786e8685-6f8c-4c7a-9856-885e39a7f030	830419b1-14d6-45c3-9bf9-d1f39c3e818f	The Ultimate Guide to Witnessing the Great Wildebeest Migration	ultimate-guide-great-wildebeest-migration	Timing your trip for the Mara River crossings and the Serengeti calving season: secrets directly from seasoned local guides.	<h2>When and Where to See the Great Migration</h2><p>The Great Migration is one of the most breathtaking wildlife spectacles on earth. Every year, over two million wildebeest, zebras, and gazelles travel across the Serengeti-Mara ecosystem in search of green pastures.</p><h3>January to March: The Calving Season in Southern Serengeti</h3><p>During these months, half a million wildebeest calves are born on the short-grass plains of Ndutu. Predators including lions, leopards, and cheetahs are in high concentration.</p><h3>July to October: The Iconic River Crossings</h3><p>The herds plunge into crocodile-infested waters of the Mara River. Booking with a trusted, certified local operator ensures top position along the riverbanks with ethical spacing for wildlife safety.</p><blockquote>The secret is patience. When the first zebra steps into the current, thousands follow in a thunderous rush.</blockquote>	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	Parks & Wildlife	PUBLISHED	143	2026-10-12 20:24:55.753	2026-10-12 20:48:17.86
2945c2d9-76b2-4c02-91b9-352d411a7b33	c08876d2-7864-432b-a440-5c4c1fc5af5d	7db4950e-301e-48c4-a275-56f398f34b92	Guide to Visiting Ngorongoro Crater – All You Need To Know	guide-to-visiting-ngorongoro-crater	Ngorongoro Crater is one of the premier wildlife sanctuaries in East Africa, with very high densities of game on a collapsed volcanic caldera floor.	<p>A full day in the crater usually starts early, with a guided drive down onto the crater floor before the heat rises. The road network is fairly easy to navigate, though it is best to keep your expectations flexible as wildlife movements can shift each day.</p><p>Most visitors focus on the central areas where the highest concentration of rhinos, elephants, buffalo, and lion activity can be seen. Sunrises and late afternoons are often the best times for spotting predators, while midday still offers rich grazing and birdlife.</p><p>It is worth planning ahead for permits, timing, and whether you want a private vehicle or a shared safari transfer. A well-paced day with an experienced guide is often the difference between a rushed drive and a truly memorable experience.</p>	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	Parks & Wildlife	PUBLISHED	0	2026-10-19 18:15:59.854	2026-10-19 18:20:34.262
fe536ffe-7221-4b5d-b47c-04e632316381	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	079c1019-8c6f-4d2b-bc35-95c46884b4e0	Tanzania Safari Itinerary - How To Spend 7 to 10 Days	tanzania-safari-itinerary-7-to-10-days	A practical route through the northern circuit, balancing long game drives with enough rest to enjoy every park.	<p>Seven to ten days is the sweet spot for a first Tanzania safari. It is long enough to see the Serengeti properly without rushing between parks.</p><h2>Days 1 to 2: Tarangire</h2><p>Start in Tarangire for elephants and baobabs. It is close to Arusha, so you arrive in the park the same morning.</p><h2>Days 3 to 6: Serengeti</h2><p>Give the Serengeti at least three nights. Choose your camp by season: the south in January to March for calving, the centre all year, and the north from July to October for river crossings.</p><h2>Days 7 to 8: Ngorongoro Crater</h2><p>Finish with a full day on the crater floor, one of the best places in Africa to see black rhino.</p><p>With ten days, add Lake Manyara or a couple of nights on Zanzibar.</p>	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	Itineraries	PUBLISHED	0	2026-10-19 18:15:59.844	2026-10-19 18:20:34.253
2f8319ca-ef86-4f5b-aeb1-8b41ceeb8d5e	e7914577-a3ca-4752-a51d-02f2dbc05e68	729f74ee-4cdc-4f60-806c-24c70d5c4be3	Survey Reveals the World's Politest Tourists	survey-reveals-the-worlds-polite-tourists	Safari guides and lodge staff shared which travellers leave the best impression, and what everyone can learn from them.	<p>We asked guides, lodge managers and camp staff across East and Southern Africa which guests leave the best impression.</p><p>The answers had less to do with nationality than with habits: greeting staff in the local language, keeping voices low at sightings, following the guide's lead on distance from animals, and tipping fairly.</p><p>Small courtesies matter on safari. A quiet vehicle gets better sightings, and a respectful guest often gets the extra effort that turns a good trip into a great one.</p>	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	Travel News	PUBLISHED	1	2026-10-19 18:15:59.861	2026-10-19 19:10:08.925
\.


--
-- Data for Name: destination_sections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.destination_sections (id, destination_id, key, title, body, bullet_items, sort_order, created_at, updated_at) FROM stdin;
bbe98156-f860-4f9e-96d8-38cfe5c8d957	36f605b8-2d57-424e-9fd7-60c064fe054e	overview	Overview	Serengeti National Park is arguably the most famous safari destination on Earth. Established in 1951, it covers 14,750km² of endless grassland plains, Acacia woodlands and rocky kopjes in northern Tanzania, contiguous with Kenya’s Masai Mara. The park’s name comes from the Maasai word “siringet”, meaning “the place where the land runs on forever” — a fitting description for the sweeping savannahs that support the greatest large-mammal migration on the planet.	{"UNESCO World Heritage Site since 1981","Home to roughly 3,000 lions and 1,000 leopards","Best accessed from Arusha by road (about 8 hours) or by scheduled flights"}	0	2026-09-28 16:36:51.801	2026-09-28 16:36:51.801
5b5ee030-e714-4a76-b657-de0a5cfe8bae	36f605b8-2d57-424e-9fd7-60c064fe054e	parks-reserves	Parks & Reserves	The Serengeti sits at the heart of a greater ecosystem of protected areas. Neighboring Ngorongoro Conservation Area to the southeast allows the migration to continue onto the mineral-rich calving grounds, while Maswa Game Reserve, Grumeti and Ikorongo Game Reserves and Loliondo Game Controlled Area buffer the park on other sides. Across the Kenyan border, the Masai Mara National Reserve completes the ecosystem.	{"Ngorongoro Conservation Area – calving grounds (Dec–Mar)","Maswa Game Reserve – southern buffer, excellent for wild dogs","Grumeti & Ikorongo Game Reserves – western corridor private concessions","Masai Mara National Reserve (Kenya) – northern extension of the ecosystem"}	1	2026-09-28 16:36:51.818	2026-09-28 16:36:51.818
69328f6f-f476-46d7-a77a-3e8b82a5957f	36f605b8-2d57-424e-9fd7-60c064fe054e	things-to-do	Things To Do	Game drives are the headline act — morning and afternoon drives in open or pop-up-roof 4x4 vehicles bring you within meters of predators and herds. Hot-air balloon safaris at dawn, followed by a champagne bush breakfast, are the Serengeti’s signature splurge. Selected areas also offer guided walking safaris, and a visit to a Maasai village adds a cultural dimension to the wildlife experience.	{"Year-round game drives – the classic Serengeti experience","Hot-air balloon safaris over the migration herds","Guided walking safaris in designated wilderness zones","Maasai cultural visits on the park fringes","Photography hides at Grumeti River crocodile crossings"}	2	2026-09-28 16:36:51.821	2026-09-28 16:36:51.821
8ee3bdfd-ef45-4012-811d-f9b30562ae41	36f605b8-2d57-424e-9fd7-60c064fe054e	best-beaches	Best Beaches	The Serengeti is landlocked, so beach time means flying onward to the coast. Most visitors combine their safari with the white-sand beaches of Zanzibar — Nungwi and Kendwa in the north, Paje and Jambiani on the southeast coast — or the quieter islands of Pemba and Mafia. Scheduled flights connect Seronera airstrip to Zanzibar in around two hours.	{"Nungwi & Kendwa, Zanzibar – swimming-friendly, sunset dhow cruises","Paje & Jambiani – kitesurfing and laid-back beach villages","Mafia Island – whale sharks and marine-park snorkeling"}	3	2026-09-28 16:36:51.824	2026-09-28 16:36:51.824
fd869e0e-6acf-4893-aa06-2226be1d43c3	36f605b8-2d57-424e-9fd7-60c064fe054e	reviews	Reviews	Travelers consistently rate the Serengeti as the highlight of any Tanzanian itinerary, praising the sheer density of big cats and the scale of the migration. Common critiques are the price of park fees and the crowds around big sightings in high season — many reviewers recommend the central Seronera area for first-timers and the remote north or west for those seeking solitude.	{}	4	2026-09-28 16:36:51.828	2026-09-28 16:36:51.828
d7fa574c-bc36-4744-b321-8f95baa1bb32	36f605b8-2d57-424e-9fd7-60c064fe054e	wildlife	Wildlife	The Serengeti supports around 70 large mammal species. Lion prides are exceptionally easy to find — the park holds Africa’s densest lion population — while leopard favor the riverine woodland of the Seronera Valley and cheetah hunt the open plains of the southeast. Elephant and giraffe are common in the woodlands, hippo pods crowd the Retima Pool, and the migration brings 1.5 million wildebeest plus zebra and gazelle through the park in a year-long circuit. Black rhino are present in very small numbers.	{"Big Five: lion, leopard, elephant, buffalo — rhino very rare","Great Migration: river crossings at Grumeti (Jun–Jul) and Mara River (Jul–Oct)","Cheetah, spotted hyena, jackal and bat-eared fox on the plains"}	5	2026-09-28 16:36:51.832	2026-09-28 16:36:51.832
78ced083-67ea-4742-a2e0-4d6fd55c408f	36f605b8-2d57-424e-9fd7-60c064fe054e	birds	Birds	With more than 500 recorded bird species, the Serengeti is a superb birding destination year-round, and November to April brings European and intra-African migrants in breeding plumage. Look for Kori bustard — the world’s heaviest flying bird — secretary birds, Fischer’s lovebird, rufous-tailed weaver and the endemic grey-breasted spurfowl, found almost nowhere else.	{"Grey-breasted spurfowl – Serengeti near-endemic","Lappet-faced vultures and six other vulture species at kills","Lilac-breasted roller, superc Courser, Fischer’s lovebird on the plains"}	6	2026-09-28 16:36:51.835	2026-09-28 16:36:51.835
7700a9b1-bb9a-4533-b0f8-cacf29fa7be8	36f605b8-2d57-424e-9fd7-60c064fe054e	best-time	Best Time To Visit	June to October is the classic dry-season window: animals congregate at water sources, vegetation is thin and the migration usually crosses the Mara River in the north. January and February are superb for wildebeest calving on the southern plains, with predators in attendance. November to May brings greener scenery, newborn animals, lower prices and fewer vehicles — though rain can make some tracks muddy.	{"Jun–Oct: best general wildlife viewing; Mara River crossings","Jan–Feb: wildebeest calving season on the Ndutu plains","Mar–May: long rains — some camps close, but rates drop sharply"}	7	2026-09-28 16:36:51.837	2026-09-28 16:36:51.837
673b8613-30a3-4c0b-a0ea-7344f557e8cc	36f605b8-2d57-424e-9fd7-60c064fe054e	weather-climate	Weather & Climate	The Serengeti’s altitude of 900–1,800m keeps temperatures pleasant rather than tropical. Daytime highs average 25–28°C, while nights and early game drives can be cold — pack a fleece, as June to August mornings regularly dip below 12°C. Rains fall in two seasons: short rains from November to December and long rains from March to May, usually as afternoon thunderstorms.	{}	8	2026-09-28 16:36:51.841	2026-09-28 16:36:51.841
36926750-e541-472b-98f6-02e62f8c8ee2	36f605b8-2d57-424e-9fd7-60c064fe054e	popular-routes	Popular Routes	The classic northern-circuit route links Arusha with the Serengeti via Ngorongoro Crater and often Tarangire or Lake Manyara, typically over 5–7 days. Visitors with more time add the western corridor (Grumeti) or push north to Lobo and the Mara River. Fly-in itineraries use Seronera, Grumeti, Kogatende or Lobo airstrips to skip the long drives.	{"Arusha – Tarangire – Ngorongoro – Central Serengeti (5–7 days)","Arusha – Lake Manyara – Ngorongoro – Serengeti – Zanzibar (8–10 days)","Fly-in: Arusha → Kogatende airstrip for Mara River crossings"}	9	2026-09-28 16:36:51.844	2026-09-28 16:36:51.844
df253ecc-6b51-4ef9-96b7-f7e7b620d003	e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b	best-time	Best Time to Visit	June to October, when animals concentrate on the river. January to April is good for birding.	{}	2	2026-10-19 18:47:29.476	2026-10-19 18:47:29.476
56b13c9f-f0e3-44bc-82f6-84b8d043e9f4	e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b	getting-there	Getting There	Scheduled flights to Msembe airstrip at park headquarters (also Jongomeru). By road it is about 130 km from Iringa.	{}	3	2026-10-19 18:47:29.482	2026-10-19 18:47:29.482
56fda210-b8e8-40bf-a7ec-cdf993b71871	36f605b8-2d57-424e-9fd7-60c064fe054e	getting-there	How To Get There	Most international visitors fly into Kilimanjaro International Airport (JRO) near Arusha. From Arusha it is an 8-hour drive to Central Serengeti, usually broken with a night in Ngorongoro or Karatu. Scheduled light-aircraft flights from Arusha (ARK) to Seronera, Grumeti, Lobo or Kogatende airstrips take 1–2 hours and are the standard choice for upmarket itineraries. Park entry is via Naabi Hill or Ndabaka gates.	{"By road: Arusha → Naabi Hill gate ≈ 8 hours","By air: Arusha → Seronera airstrip ≈ 1h15m","Entry fees: US$71 per adult per day (2026), payable by card"}	10	2026-09-28 16:36:51.848	2026-09-28 16:36:51.848
250bfaad-4cff-48f2-a3c1-68764e35a504	36f605b8-2d57-424e-9fd7-60c064fe054e	health-safety	Malaria & Vaccinations	The Serengeti is a malaria area, though the cool, dry climate and altitude keep mosquito numbers moderate. Take prophylactics as advised by your travel clinic, use DEET repellent and cover up at dusk. A yellow fever certificate is required if arriving from a yellow-fever-endemic country; hepatitis A, typhoid and routine vaccinations are also recommended.	{}	11	2026-09-28 16:36:51.852	2026-09-28 16:36:51.852
6c1a9fd2-6a32-4752-96b6-0bde733ae2ef	36f605b8-2d57-424e-9fd7-60c064fe054e	staying-safe	Staying Safe	The Serengeti is very safe for visitors. Wildlife is the main consideration: always remain inside your vehicle outside designated walking zones, never feed animals and keep voices low near predators. Tented camps and lodges escort guests after dark. The park’s tourism infrastructure is well established, and rangers patrol the main circuits; petty crime is essentially unknown inside the park.	{}	12	2026-09-28 16:36:51.855	2026-09-28 16:36:51.855
8fb33ab0-574e-4568-b337-61ee7f954c5e	55511666-cf14-421a-b773-eeee05ab308f	overview	Overview	The Masai Mara National Reserve is Kenya’s most visited protected area and the northern extension of the Serengeti ecosystem. Named after the Maasai people and the Mara River, the reserve’s rolling grasslands, acacia-dotted hills and riverine forest support exceptional densities of lion, cheetah, leopard and elephant. The annual wildebeest migration between July and October, with its perilous Mara River crossings, is the single most famous wildlife event in Africa.	{"1,510km² reserve plus surrounding community conservancies","Year-round big-cat viewing, peaking with the migration","Easy access from Nairobi — a 45-minute flight or 5-hour drive"}	0	2026-09-28 16:36:51.862	2026-09-28 16:36:51.862
0c538be4-dc38-47c1-a3af-2ec1212eefc9	55511666-cf14-421a-b773-eeee05ab308f	parks-reserves	Parks & Reserves	Around the core reserve, a ring of Maasai-owned conservancies — Mara North, Olare Motorogi, Naboisho, Ol Kinyei, Lemek and others — offers exclusive, low-density game viewing with walking safaris and night drives that are not permitted inside the reserve itself. Nearby Lake Nakuru National Park and Hell’s Gate National Park make easy two-center combinations.	{"Mara North Conservancy – prime leopard habitat","Olare Motorogi & Naboisho – high lion densities, low vehicle numbers","Lake Nakuru National Park – rhino and flamingos (2–3 hours away)"}	1	2026-09-28 16:36:51.865	2026-09-28 16:36:51.865
a9a9feec-7d2f-40ab-bae6-35e7bb304b5b	55511666-cf14-421a-b773-eeee05ab308f	things-to-do	Things To Do	Game drives dominate the itinerary, but the Mara offers more: dawn hot-air balloon flights ending in a champagne breakfast on the plains, guided bush walks in the conservancies, night game drives to spot nocturnal predators, and authentic Maasai village visits. Photographers can book dedicated vehicles and hides focused on the big cats and migration crossings.	{"Hot-air balloon safari over the migration (US$450–550)","Bush walks and night drives in the conservancies","Maasai cultural experiences","Specialist big-cat photography safaris"}	2	2026-09-28 16:36:51.867	2026-09-28 16:36:51.867
30b298f8-0f99-490b-9064-bd28eb39c6f3	55511666-cf14-421a-b773-eeee05ab308f	best-beaches	Best Beaches	The Mara is inland, but Kenya’s coast is a short flight away — most safaris pair seamlessly with a beach extension. Diani Beach near Mombasa is the classic white-sand choice; Watamu offers marine-park snorkeling and turtle nesting; and the Lamu archipelago provides an untouched, historic Swahili escape. Direct flights run from the Mara’s airstrips to the coast.	{"Diani Beach – 15km of powder sand south of Mombasa","Watamu – Watamu Marine National Park, snorkeling and turtles","Lamu – car-free Swahili island archipelago"}	3	2026-09-28 16:36:51.87	2026-09-28 16:36:51.87
38c37713-d7ec-4e40-8d03-ec07b5e5b7eb	55511666-cf14-421a-b773-eeee05ab308f	reviews	Reviews	Visitors rave about predator encounters — many report seeing all three big cats in a single day — and the professionalism of Maasai guides. The most frequent criticisms are vehicle congestion around migration river crossings in August and September, and entry fees; several reviewers recommend staying in a conservancy for a quieter experience at a similar price.	{}	4	2026-09-28 16:36:51.872	2026-09-28 16:36:51.872
6ca631ed-0bc7-4568-95aa-ecc963e50da8	55511666-cf14-421a-b773-eeee05ab308f	wildlife	Wildlife	The Mara holds Kenya’s highest lion population — roughly 850–900 individuals — plus well-studied cheetah and leopard. Elephant, buffalo, giraffe, topi, eland and large hippo pods are resident year-round, while the migration brings up to 1.3 million wildebeest and 300,000 zebra across the Mara River between July and October. Black rhino survive in very small numbers in the reserve.	{"Big Five present (rhino very rare)","Migration river crossings at the Mara River, Jul–Oct","Resident big cats mean excellent viewing in every month"}	5	2026-09-28 16:36:51.875	2026-09-28 16:36:51.875
e73e1e30-783c-46ed-8e85-f4281579e631	55511666-cf14-421a-b773-eeee05ab308f	birds	Birds	Over 470 bird species have been recorded. Raptors are a highlight — martial eagle, bateleur, augur buzzard and the mighty crowned eagle — while the grasslands host secretary birds, Kori bustards, lilac-breasted rollers, Jackson’s widowbird and, in the wet season, southern ground hornbills. November to April adds Palearctic migrants.	{"Martial eagle, bateleur and secretary bird – marquee raptors","Rosy-throated longclaw and Jackson’s widowbird in the grasslands","Over 470 species; migrants boost the list Nov–Apr"}	6	2026-09-28 16:36:51.878	2026-09-28 16:36:51.878
7c5add88-3237-4b97-b4a4-1b1da137d9c0	55511666-cf14-421a-b773-eeee05ab308f	best-time	Best Time To Visit	Wildlife viewing is excellent year-round, but the peak period is July to October when the migration herds are in the Mara and crossings of the Mara River peak in August–September. December to February offers dry, warm conditions and superb predator sightings with fewer crowds. The long rains of March to May turn tracks muddy and some camps close, though rates are at their lowest.	{"Jul–Oct: migration in residence — book 6+ months ahead","Dec–Feb: dry, warm and quieter","Mar–May: long rains, low-season rates"}	7	2026-09-28 16:36:51.881	2026-09-28 16:36:51.881
504d44a4-b388-4694-a9f4-75b14a7ce80e	55511666-cf14-421a-b773-eeee05ab308f	weather-climate	Weather & Climate	At 1,500–2,170m altitude, the Mara has a mild highland climate. Days are warm (25–30°C) and nights are cool — often 10–12°C on early drives. Rain falls mostly from November to May, with the heaviest downpours in April and May, typically in the form of afternoon storms that clear to dramatic skies.	{}	8	2026-09-28 16:36:51.884	2026-09-28 16:36:51.884
735d3eb1-c2aa-43f6-bd37-17e627375ca4	55511666-cf14-421a-b773-eeee05ab308f	popular-routes	Popular Routes	Most itineraries fly from Nairobi’s Wilson Airport to Ol Kiombo, Keekorok or the conservancy airstrips — a 45-minute hop. Road-based safaris combine the Mara with Lake Nakuru and Hell’s Gate or Amboseli over 5–7 days. Longer routes link the Mara with Samburu and the Kenyan coast, or continue south into Tanzania’s Serengeti at the Isebania border crossing.	{"Nairobi → Masai Mara fly-in (3 days, minimal time lost)","Nairobi – Nakuru – Mara road circuit (5–6 days)","Mara → Isebania border → Serengeti combined safari (10+ days)"}	9	2026-09-28 16:36:51.886	2026-09-28 16:36:51.886
b1716a64-fafe-4490-a1e5-01c7d11085f5	55511666-cf14-421a-b773-eeee05ab308f	getting-there	How To Get There	Fly into Jomo Kenyatta International Airport (NBO) in Nairobi. From there, scheduled 45-minute flights depart Wilson Airport (WIL) for Mara airstrips — the fastest and most popular option. By road the reserve is a 5–6 hour drive on tarmac and rough murram roads, best combined with Lake Nakuru. Park entry costs US$100 per adult per day in high season (Jul–Oct) and US$70 in low season.	{"By air: Wilson Airport → Ol Kiombo/Keekorok ≈ 45 min","By road: Nairobi → Sekenani gate ≈ 5–6 hours","Entry fees: US$100/day high season, US$70/day low season"}	10	2026-09-28 16:36:51.889	2026-09-28 16:36:51.889
4c38a03b-ad04-4071-8b24-fb7ff488dc86	55511666-cf14-421a-b773-eeee05ab308f	health-safety	Malaria & Vaccinations	The Mara is a malaria zone — take prophylaxis, use repellent and wear long sleeves at dawn and dusk. A yellow fever certificate is required when arriving from endemic countries, and hepatitis A, typhoid and tetanus vaccinations are routinely advised. Drinking water at lodges and camps is treated; drink bottled water anyway when in doubt.	{}	11	2026-09-28 16:36:51.892	2026-09-28 16:36:51.892
62ca0fef-28d9-4858-af3e-084d78d7675b	55511666-cf14-421a-b773-eeee05ab308f	staying-safe	Staying Safe	The Masai Mara is a very safe, well-policed tourist area. Standard bush rules apply: stay in your vehicle during game drives, follow camp escorts after dark and keep distance from elephants and buffalo on foot. The surrounding conservancies work closely with Maasai communities, making the region among the most secure and welcoming safari destinations in East Africa.	{}	12	2026-09-28 16:36:51.895	2026-09-28 16:36:51.895
e37b9255-1e71-4acc-8660-064afe14d413	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	overview	Overview	Ngorongoro Crater is the collapsed caldera of an ancient volcano that exploded and fell in on itself two to three million years ago. Today the crater floor is a natural amphitheater of grassland, forest and soda lakes, sheltering around 25,000 large animals that rarely leave. The surrounding Ngorongoro Conservation Area is unique in allowing Maasai pastoralists to live alongside wildlife, and the caldera became a UNESCO World Heritage Site in 1979.	{"World’s largest intact and unfilled volcanic caldera","Virtually guaranteed black rhino and lion sightings","A natural enclosure — most animals never leave the crater"}	0	2026-09-28 16:36:51.901	2026-09-28 16:36:51.901
95198b19-fd1d-4592-8347-61f24df0da0f	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	parks-reserves	Parks & Reserves	The Crater sits within the Ngorongoro Conservation Area, which also encompasses Empakaai and Olmoti craters, the Laetoli and Olduvai Gorge paleontological sites, and the vast Serengeti plains to the northwest. Neighboring Lake Manyara National Park and Tarangire National Park are less than two hours away, making Ngorongoro the hub of Tanzania’s northern safari circuit.	{"Olduvai Gorge – “cradle of mankind” paleontology museum","Empakaai Crater – flamingo lake, guided rim walks","Lake Manyara & Tarangire NP – easy circuit additions"}	1	2026-09-28 16:36:51.903	2026-09-28 16:36:51.903
3a0acacf-9231-46d4-9559-6d366b43ef4e	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	things-to-do	Things To Do	A full-day crater-floor game drive is the essential experience, descending the Seneto descent road at dawn for the best light and least traffic. Elsewhere in the conservation area you can hike to the flamingo-flecked lake in Empakaai Crater, trek the Olmoti crater rim waterfalls, walk with rangers on the Northern Highlands Forest Reserve trails, and tour Olduvai Gorge’s world-famous archaeological site.	{"Full-day 4x4 crater-floor game drive","Empakaai Crater hike with flamingo lake views","Olduvai Gorge museum and excavation-site tour","Guided rim walks and Maasai village visits"}	2	2026-09-28 16:36:51.906	2026-09-28 16:36:51.906
9cf8c933-2d2c-4d00-9b4a-7bb28953c96d	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	best-beaches	Best Beaches	Ngorongoro sits at 2,200m in the Tanzanian highlands, far from the sea. Safari circuits routinely finish with a flight from Arusha or Lake Manyara to Zanzibar, where Nungwi and Kendwa, Paje and the southeast-coast villages offer the classic Indian Ocean beach finale. Matemwe is a quieter option with excellent snorkeling off Mnemba Atoll.	{"Nungwi & Kendwa, Zanzibar – classic post-safari beach","Matemwe – quiet base for Mnemba Atoll snorkeling","Paje – kiteboarding and relaxed beach life"}	3	2026-09-28 16:36:51.908	2026-09-28 16:36:51.908
170816f3-97ef-49b9-9e45-87209409eede	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	reviews	Reviews	Travelers describe the first view from the crater rim as unforgettable and the density of animals on the floor as unlike anywhere else — many see rhino here after missing them elsewhere in Africa. The main complaint is the number of vehicles around big sightings in high season; reviewers suggest a full-day descent starting at 6am and staying on the crater rim to be first down.	{}	4	2026-09-28 16:36:51.911	2026-09-28 16:36:51.911
a149ac31-0695-415a-bd5c-436a68e63cb8	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	wildlife	Wildlife	Around 25,000 large mammals live permanently on the crater floor, including about 6,000 resident wildebeest, 4,000 zebra, 3,000 eland and 3,000 Grant’s and Thomson’s gazelles. Predators are exceptional: roughly 60–70 lions, healthy cheetah and leopard numbers, and large buffalo herds. Ngorongoro is Tanzania’s best place to see the endangered black rhino — around 30 individuals — and the soda lake draws flocks of flamingo. Giraffe are notably absent, deterred by the crater’s steep walls.	{"Black rhino – among Africa’s best viewing odds","Approximately 60–70 resident lions","No giraffe – the one Big Five absence on the floor"}	5	2026-09-28 16:36:51.914	2026-09-28 16:36:51.914
63f4b845-d3ed-4df9-99ed-51c74ced34d9	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	birds	Birds	More than 500 bird species occur across the conservation area. Lake Magadi on the crater floor clouds pink with lesser flamingos when conditions suit, while the highland forests host turacos, barbets and the rare Abbott’s starling. Endemic regional specialties such as the rufous-tailed weaver and Fischer’s lovebird appear on the plains to the north.	{"Lesser flamingos on Lake Magadi","Abbott’s starling – rare highland-forest endemic","Schalow’s turaco and Hartlaub’s turaco in the rim forest"}	6	2026-09-28 16:36:51.917	2026-09-28 16:36:51.917
13a9af8f-88ba-4116-83c2-73ffe6301b63	e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b	things-to-do	Things to Do	Popular activities in Ruaha National Park:	{"Game drives along the Great Ruaha River","Walking safaris",Birding}	4	2026-10-19 18:47:29.488	2026-10-19 18:47:29.488
2b3ffce1-839d-4e7e-801f-604d42e34296	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	best-time	Best Time To Visit	Ngorongoro is a year-round destination because the crater floor holds permanent water and resident game. June to October offers dry tracks and thin vegetation; January to February coincides with migration calving on the nearby Ndutu plains. From March to May the long rains bring mist over the rim and lush green landscapes with far fewer visitors.	{"Jun–Oct: dry season, best crater-floor driving conditions","Jan–Feb: combine with Ndutu calving season","Apr–May: green season — fewer vehicles, discounted rates"}	7	2026-09-28 16:36:51.92	2026-09-28 16:36:51.92
07e7d959-8c43-406a-86f8-0daae55e3853	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	weather-climate	Weather & Climate	The crater rim sits at about 2,300m, so expect genuinely cool highland weather — mornings can drop below 10°C and mist often blankets the rim, while the floor 600m below is noticeably warmer at 22–27°C midday. Rains follow the Tanzanian pattern: short rains November–December, long rains March–May.	{}	8	2026-09-28 16:36:51.922	2026-09-28 16:36:51.922
942c55cc-cee5-4e13-866b-1a7db1323a0e	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	popular-routes	Popular Routes	Ngorongoro anchors every northern-circuit itinerary. The classic route runs Arusha – Tarangire – Lake Manyara – Ngorongoro – Serengeti and back, usually over 5–8 days, with the crater visited either en route to the Serengeti or on the return leg. Many travelers overnight on the rim, descending at dawn, before continuing to Seronera.	{"Arusha – Ngorongoro – Serengeti – Ngorongoro (5–7 days)","Arusha – Tarangire – Manyara – Ngorongoro – Serengeti (8 days)","Crater + Ndutu calving special (Jan–Feb, 6 days)"}	9	2026-09-28 16:36:51.925	2026-09-28 16:36:51.925
09e18e18-0a63-4182-b1f8-34238b735644	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	getting-there	How To Get There	From Kilimanjaro International Airport (JRO) or Arusha, the crater rim at Lodoare Gate is a 3–4 hour drive on good tarmac via Mto wa Mbu and Karatu. Many tours combine the drive with Lake Manyara en route. Light-aircraft flights to Lake Manyara Airstrip cut the return trip. Conservation Area entry is US$71 per adult per day, plus a separate crater-service fee of US$299 per vehicle for a half-day descent.	{"By road: Arusha → Lodoare Gate ≈ 3.5 hours","By air: Arusha → Lake Manyara airstrip ≈ 30 min + transfer","Fees: US$71/person/day entry + US$299/vehicle crater descent"}	10	2026-09-28 16:36:51.928	2026-09-28 16:36:51.928
3a17d1c3-e1f5-4d3a-ab82-c43d086c824b	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	health-safety	Malaria & Vaccinations	The cool crater rim (2,300m) is lower risk for mosquitoes, but the surrounding lowlands and crater floor still warrant prophylaxis, repellent and long sleeves at dusk. Yellow fever certification applies if arriving from an endemic country; hepatitis A, typhoid and standard travel vaccinations are recommended. Altitude is modest, but visitors sensitive to cool, damp conditions should pack warm layers.	{}	11	2026-09-28 16:36:51.931	2026-09-28 16:36:51.931
2c06220b-563b-4af4-a1a5-5f0f77177755	f8889113-3b88-46c0-ada0-8fb0dd4b2da4	staying-safe	Staying Safe	Ngorongoro is an exceptionally safe destination with a strong ranger presence and controlled access. Remain in your vehicle on the crater floor — the grasslands hide buffalo and elephant — and only walk on designated rim and highland trails with an armed ranger. Camps escort guests between tent and mess after dark as standard practice.	{}	12	2026-09-28 16:36:51.933	2026-09-28 16:36:51.933
444682ad-d065-4df7-89b4-0c6f2c9b9a57	5459dbb7-8608-490b-8671-c3190be6b1c8	overview	Overview	Tanzania is Africa’s ultimate safari country: home to the Serengeti migration, Ngorongoro Crater, Mount Kilimanjaro and 22 national parks plus the spice-scented beaches of Zanzibar. The Northern circuit (Serengeti, Ngorongoro, Tarangire, Lake Manyara, Kilimanjaro) is the classic first-time route; the Southern circuit (Nyerere, Ruaha, Mikumi) delivers wild, uncrowded walking safaris; the remote Western circuit (Katavi, Gombe, Mahale) offers chimp trekking and genuine off-grid wilderness.	{"22 national parks and 1 conservation area across three circuits","Home of the Great Migration and Africa’s highest mountain","English widely spoken; currency Tanzanian shilling (TZS)"}	0	2026-09-28 16:36:51.939	2026-09-28 16:36:51.939
46b238a2-de2f-4b64-a8c0-6ea5a7e9c4a3	5459dbb7-8608-490b-8671-c3190be6b1c8	parks-reserves	Parks & Reserves	Tanzania protects close to 38% of its land area. Beyond the headline Northern parks, Ruaha and Nyerere (Selous) anchor the South with superb predator densities and boat safaris, while Katavi and Mahale Mountains in the West see a fraction of the visitors. The Ngorongoro Conservation Area uniquely blends wildlife protection with Maasai pastoralism, and the Zanzibar archipelago adds marine parks and Jozani Forest’s endemic red colobus.	{"Serengeti NP – Great Migration and Africa’s densest lion population","Ngorongoro Crater – easiest Big Five viewing in East Africa","Ruaha NP – 10% of the world’s remaining lions","Nyerere NP – boat safaris and wild dogs on the Rufiji River","Mahale Mountains NP – chimpanzee trekking on Lake Tanganyika"}	1	2026-09-28 16:36:51.942	2026-09-28 16:36:51.942
a4f4aabd-746e-452d-878c-77e5bab93860	5459dbb7-8608-490b-8671-c3190be6b1c8	things-to-do	Things To Do	Game drives are just the start. Tanzania offers multiday treks up Kilimanjaro (5,895m) and its gentler cousin Mt Meru, chimpanzee trekking at Gombe and Mahale, walking and boat safaris in the southern parks, hot-air ballooning over the Serengeti, snorkeling and diving off Zanzibar and Mafia, and cultural encounters with Maasai, Hadzabe and Chaga communities.	{"Kilimanjaro treks via Machame, Lemosho or Marangu routes","Chimp trekking at Gombe Stream and Mahale Mountains","Balloon safaris over Serengeti and Tarangire","Diving and dhow sailing in Zanzibar and Mafia"}	2	2026-09-28 16:36:51.947	2026-09-28 16:36:51.947
f2b6967e-4864-4962-9d0f-ce7e7cfc82ef	5459dbb7-8608-490b-8671-c3190be6b1c8	best-beaches	Best Beaches	Tanzania’s 1,400km Indian Ocean coastline and its islands rank among the world’s finest. Zanzibar’s Nungwi and Kendwa offer postcard sand and sunset dhow cruises; Paje and Jambiani bring kitesurfing and village calm; Pemba is the diver’s island; and remote Mafia Island hosts whale sharks from October to February. Mainland gems like Pangani and Bagamoyo see almost no tourists.	{"Nungwi & Kendwa – swimming-friendly, liveliest stretches","Paje & Jambiani – southeast coast kitesurf and quiet villages","Mafia Island – whale sharks and Chole Bay marine park"}	3	2026-09-28 16:36:51.95	2026-09-28 16:36:51.95
f0a0a682-f376-49b7-a4cd-16de23a9870a	5459dbb7-8608-490b-8671-c3190be6b1c8	reviews	Reviews	Tanzania scores among the highest-rated safari countries in traveler reviews, with the Serengeti and Ngorongoro repeatedly described as trip-of-a-lifetime destinations. Reviewers praise guide quality and the variety possible in one itinerary — bush then beach — while flagging park-fee costs and traffic around migration sightings as the few negatives.	{}	4	2026-09-28 16:36:51.953	2026-09-28 16:36:51.953
ba2a6dad-61a2-410a-946b-9ce15a1963d1	90fca831-5d85-4cdf-bbe5-b0049b30bafd	wildlife	Wildlife	Both black and white rhinos, Rothschild’s giraffe, and at times more than a million lesser and greater flamingos.	{"Black rhino","White rhino","Rothschild giraffe",Lion,Leopard,Flamingo}	1	2026-10-19 18:47:29.62	2026-10-19 18:47:29.62
901b26f9-de99-4faf-bc12-8379f099edd6	5459dbb7-8608-490b-8671-c3190be6b1c8	wildlife	Wildlife	Tanzania holds roughly 20% of Africa’s large-mammal population. The annual migration involves 1.5 million wildebeest and hundreds of thousands of zebra; the country shelters about a third of all African lions and a significant share of the world’s remaining wild dogs, found in Nyerere, Ruaha and Katavi. Elephant densities are high in Tarangire, black rhino persist in Ngorongoro, and chimpanzees live at Gombe and Mahale.	{"Big Five in the Northern circuit parks","Around a third of Africa’s lions live in Tanzania","Wild dogs best seen in Ruaha and Nyerere"}	5	2026-09-28 16:36:51.956	2026-09-28 16:36:51.956
55f3adc1-64e3-4bdb-9c0f-dc4da5975686	5459dbb7-8608-490b-8671-c3190be6b1c8	birds	Birds	With over 1,100 recorded species — including more than 20 country endemics — Tanzania is a top-tier birding destination. The Eastern Arc Mountains (Udzungwa, Usambara) hold endemics like the Udzungwa forest partridge, while the Serengeti plains and Rift Valley lakes deliver spectacular raptor and flamingo displays. November to April is peak season, when migrants arrive in breeding plumage.	{"Over 1,100 species and 20+ endemics","Usambara and Udzungwa mountains for forest endemics","Flamingo spectacle at Lake Natron and Empakaai"}	6	2026-09-28 16:36:51.958	2026-09-28 16:36:51.958
9b7acfb3-b000-4b03-85f3-25b0dbe36fa3	5459dbb7-8608-490b-8671-c3190be6b1c8	best-time	Best Time To Visit	June to October is the prime dry season across the country — ideal for wildlife viewing and the only comfortable time for Kilimanjaro summit attempts. January to February brings the wildebeest calving season to the southern Serengeti. The Southern and Western circuits are best avoided in the wet months of March to May, though the Northern parks remain productive, and Zanzibar is pleasant whenever the rains pause.	{"Jun–Oct: dry season, best game viewing nationwide","Jan–Feb: calving season in the southern Serengeti","Jul–Oct: Mara River crossings in the far north"}	7	2026-09-28 16:36:51.962	2026-09-28 16:36:51.962
87373468-1258-4e90-b221-6ce8038417b7	5459dbb7-8608-490b-8671-c3190be6b1c8	weather-climate	Weather & Climate	Coastal and island Tanzania is hot and humid year-round (28–32°C), while safari parks on the plateau enjoy warm days (23–28°C) and cool nights. The main rains fall March to May, with a shorter wet season in November and December. Altitude matters: Ngorongoro’s rim and Kilimanjaro’s slopes are genuinely cold, so layers are essential on any itinerary.	{}	8	2026-09-28 16:36:51.965	2026-09-28 16:36:51.965
5cae2d3f-fd7c-4003-87e3-236e1ca69dee	5459dbb7-8608-490b-8671-c3190be6b1c8	popular-routes	Popular Routes	The northern safari circuit is the most traveled route: Arusha – Tarangire – Lake Manyara – Ngorongoro – Serengeti, typically over 5–10 days and often ending with a Zanzibar flight from Arusha. Southern routes pair Nyerere and Ruaha out of Dar es Salaam for week-long fly-in safaris, while the western route to Katavi and Mahale suits returning safari veterans.	{"Northern circuit: Arusha – Tarangire – Ngorongoro – Serengeti (7 days)","Bush & beach: Northern circuit + Zanzibar (10–12 days)","Southern safari: Dar – Nyerere – Ruaha fly-in (7 days)"}	9	2026-09-28 16:36:51.967	2026-09-28 16:36:51.967
c9504a03-0a2c-483a-9146-78ab0d50482b	5459dbb7-8608-490b-8671-c3190be6b1c8	getting-there	How To Get There	Most international flights land at Julius Nyerere International Airport (DAR) in Dar es Salaam or Kilimanjaro International Airport (JRO) between Arusha and Moshi — the latter serving the Northern circuit. Domestic carriers connect major parks via an extensive network of bush airstrips. Zanzibar receives direct regional and some international flights. Visa-on-arrival and e-visa are available to most nationalities.	{"JRO for the Northern circuit; DAR for the South and coast","Domestic bush flights link Serengeti, Ruaha, Nyerere airstrips","E-visa available online; US$50–100 for most nationalities"}	10	2026-09-28 16:36:51.97	2026-09-28 16:36:51.97
6f8878e2-4b6b-43c8-a59c-1deff10a1738	5459dbb7-8608-490b-8671-c3190be6b1c8	health-safety	Malaria & Vaccinations	Malaria is present across Tanzania below 1,800m — prophylaxis is strongly advised for all safari areas, with repellent and long clothing at dusk. A yellow fever certificate is mandatory if arriving from an endemic country. Recommended vaccinations include hepatitis A, typhoid, tetanus and rabies (for remote circuits). Zanzibar requires the same precautions as the mainland coast.	{}	11	2026-09-28 16:36:51.972	2026-09-28 16:36:51.972
ca1b0291-dab0-49be-b626-8a6f3cf39688	5459dbb7-8608-490b-8671-c3190be6b1c8	staying-safe	Staying Safe	Tanzania is one of East Africa’s most stable and welcoming countries, and its parks are extremely safe with a strong ranger presence. In cities, take normal precautions against petty theft — use registered taxis after dark and keep valuables out of sight. On safari, follow guide instructions around wildlife; on Kilimanjaro, choose KPAP-affiliated operators for a safe, ethical trek.	{}	12	2026-09-28 16:36:51.975	2026-09-28 16:36:51.975
2d256323-5e18-4bb9-a2fc-30b68639d212	bda958ca-0181-496c-9a9a-fa3f108f7e52	overview	Overview	Kenya is the birthplace of the safari and remains one of Africa’s most rewarding wildlife destinations. The Masai Mara anchors the famous migration season, Amboseli delivers textbook elephant-with-Kilimanjaro photography, and Samburu’s arid north hosts unique “Special Five” species. Add the Rift Valley lakes, Tsavo’s red elephants and a coastline of white-sand beaches, and Kenya covers every safari style from budget camping to ultra-luxury.	{"Home of the original safari — over a century of guiding heritage","Big Five in most major parks; migration Jul–Oct in the Mara","Nairobi is the safari hub — parks within an hour’s flight"}	0	2026-09-28 16:36:51.982	2026-09-28 16:36:51.982
dd6a504b-b76a-4a5e-8ce2-02a92b88c237	bda958ca-0181-496c-9a9a-fa3f108f7e52	parks-reserves	Parks & Reserves	Kenya protects 23 national parks and 28 national reserves. The Masai Mara and its community conservancies headline the southwest; Amboseli sits beneath Kilimanjaro in the south; Tsavo East and West together form one of the largest protected areas on Earth; and the northern reserves of Samburu, Buffalo Springs and Shaba shelter arid-country endemics. Lake Nakuru is a rhino sanctuary, and Ol Pejeta Conservancy hosts the last northern white rhinos.	{"Masai Mara NR – big cats and the Great Migration","Amboseli NP – big tusker elephants under Kilimanjaro","Samburu/Buffalo Springs – Grevy’s zebra, gerenuk, reticulated giraffe","Tsavo East & West – vast wilderness and red-dust elephants"}	1	2026-09-28 16:36:51.984	2026-09-28 16:36:51.984
ddd61dec-aeb2-4ad4-b995-d98483b4f962	bda958ca-0181-496c-9a9a-fa3f108f7e52	things-to-do	Things To Do	Beyond classic game drives, Kenya offers hot-air balloon safaris over the Mara, walking and camel safaris in the north, rhino tracking on foot at Ol Pejeta, chimpanzee viewing at Sweetwaters, birding around the Rift Valley lakes, mountain climbing on Mt Kenya, and world-class kitesurfing at Diani. Cultural visits to Maasai and Samburu communities are among Africa’s most authentic.	{"Balloon safari and champagne breakfast in the Mara","Foot-based rhino tracking at Ol Pejeta Conservancy","Mt Kenya trekking — Africa’s second-highest peak","Kitesurfing and diving on the Diani and Watamu coast"}	2	2026-09-28 16:36:51.987	2026-09-28 16:36:51.987
f27de543-2e84-46b2-a5fe-fb7d69bc66bd	bda958ca-0181-496c-9a9a-fa3f108f7e52	best-beaches	Best Beaches	Kenya’s 536km coastline combines white sand, marine parks and Swahili history. Diani Beach is the country’s flagship — 15km of powder sand south of Mombasa; Watamu pairs turtle-filled creeks with a marine national park; Kilifi is the quiet middle ground; and the Lamu archipelago offers a car-free, centuries-old Swahili world. Domestic flights link the Mara directly to Ukunda and Malindi airstrips.	{"Diani Beach – Kenya’s finest white-sand strand","Watamu – marine park snorkeling and Mida Creek mangroves","Lamu – UNESCO-listed Swahili island culture"}	3	2026-09-28 16:36:51.99	2026-09-28 16:36:51.99
ed575c6c-4709-4689-846a-2a5e877cc102	bda958ca-0181-496c-9a9a-fa3f108f7e52	reviews	Reviews	Kenya earns high marks for guide expertise, migration drama and the ease of combining bush and beach. Reviewers praise the conservancy model for exclusivity and night drives, and note that the Mara itself can feel crowded in August–September — most recommend conservancy stays or shoulder-season travel for a quieter experience.	{}	4	2026-09-28 16:36:51.993	2026-09-28 16:36:51.993
59a06fbb-9342-4a53-9f5b-a237c63d376c	bda958ca-0181-496c-9a9a-fa3f108f7e52	wildlife	Wildlife	Kenya hosts all the classic safari species, with roughly 850 lions in the Mara ecosystem alone and Amboseli’s celebrated big-tusker elephants. The July–October migration brings over a million wildebeest into the Mara from the Serengeti. Rare species have dedicated strongholds: Grevy’s zebra and gerenuk in Samburu, black and white rhino at Ol Pejeta and Lake Nakuru, and sitatunga in Saiwa Swamp.	{"Big Five reliably seen in Mara, Amboseli, Nakuru and Tsavo","Special Five of the arid north: Grevy’s zebra, gerenuk, oryx, Somali ostrich, reticulated giraffe","Migration river crossings Jul–Oct"}	5	2026-09-28 16:36:51.996	2026-09-28 16:36:51.996
543643a2-464a-4601-8d69-f72ec55949f2	bda958ca-0181-496c-9a9a-fa3f108f7e52	birds	Birds	Kenya’s checklist of over 1,100 species is among the largest in Africa, crammed into habitats from coral reefs to glacial peaks. The Rift Valley lakes — Bogoria, Nakuru, Elmenteita — host flamingo spectacles and pelican flocks; Kakamega Forest shelters Central African lowland species at their eastern limit; and the arid north adds Somali-masai endemics. November to April is best for migrants and breeding plumage.	{"Over 1,100 species — fourth-longest checklist in Africa","Flamingos and pelicans on the Rift Valley lakes","Kakamega Forest – unique Guineo-Congolian rainforest birding"}	6	2026-09-28 16:36:51.999	2026-09-28 16:36:51.999
c1c615dd-63fc-48ed-aaa6-ccbb7085accc	bda958ca-0181-496c-9a9a-fa3f108f7e52	best-time	Best Time To Visit	January to March and June to October are the prime windows — dry, sunny and excellent for game viewing. July to October adds the migration in the Mara and is peak season, requiring early bookings. April–May’s long rains bring dramatic afternoon storms and lush scenery at low-season prices; wildlife remains good, though some roads and camps in the north become difficult.	{"Jul–Oct: migration and peak game viewing","Jan–Mar: dry, hot and less crowded","Apr–May: long rains — lowest rates, green season"}	7	2026-09-28 16:36:52.002	2026-09-28 16:36:52.002
aca01456-fb85-4cfd-9faf-4183d4399ec0	bda958ca-0181-496c-9a9a-fa3f108f7e52	weather-climate	Weather & Climate	Kenya straddles the equator, but altitude tempers the heat: Nairobi and the central highlands sit at 1,500–2,000m with pleasant 20–26°C days and cool nights, while the coast is hot and humid and the arid north regularly exceeds 35°C. Rains arrive in two seasons — long rains March to May and short rains November to December — usually as afternoon thunderstorms.	{}	8	2026-09-28 16:36:52.004	2026-09-28 16:36:52.004
0d40e537-7088-46c2-ad75-cc27caee3199	bda958ca-0181-496c-9a9a-fa3f108f7e52	popular-routes	Popular Routes	The classic Kenya circuit runs Nairobi – Amboseli – Lake Nakuru – Masai Mara over 6–8 days. Short fly-in safaris to the Mara suit long weekends; the grand northern route adds Samburu and Ol Pejeta; and the coast safari pairs the Mara with Diani or Watamu. Cross-border itineraries link the Mara to Tanzania’s Serengeti via the Isebania crossing.	{"Nairobi – Amboseli – Nakuru – Mara (7 days)","Nairobi – Samburu – Ol Pejeta – Mara (8–10 days)","Mara + Diani Beach bush-and-beach (8 days)"}	9	2026-09-28 16:36:52.007	2026-09-28 16:36:52.007
889a3e10-9d46-40b8-9534-d48afa8f49cf	bda958ca-0181-496c-9a9a-fa3f108f7e52	getting-there	How To Get There	Jomo Kenyatta International Airport (NBO) in Nairobi is East Africa’s busiest hub with direct flights from Europe, the Middle East and Asia. Wilson Airport handles the domestic hopper flights to Mara, Amboseli, Samburu and coastal airstrips. Mombasa’s Moi International serves beach arrivals. E-visas are issued online and at arrival for most nationalities; park fees are card-payable at the gates.	{"NBO for international arrivals; WIL for bush flights","Domestic flights to Mara, Amboseli, Samburu, coast ≤ 1.5h","E-visa: evisa.go.ke — apply before travel"}	10	2026-09-28 16:36:52.009	2026-09-28 16:36:52.009
baea6a54-1738-40aa-a58a-1469be43648e	bda958ca-0181-496c-9a9a-fa3f108f7e52	health-safety	Malaria & Vaccinations	Malaria occurs in most safari areas below 2,000m — take prophylaxis, use DEET repellent and cover up at dusk; Nairobi and the highlands are lower risk. A yellow fever certificate is required when arriving from endemic countries, and hepatitis A, typhoid and routine vaccinations are recommended. Tap water is not reliably safe — stick to bottled or filtered water.	{}	11	2026-09-28 16:36:52.013	2026-09-28 16:36:52.013
b299b90d-b951-440d-a71a-aaecff4928aa	bda958ca-0181-496c-9a9a-fa3f108f7e52	staying-safe	Staying Safe	Kenya’s safari circuits are safe, mature tourism destinations with professional ranger and security networks. Exercise normal urban caution in Nairobi — avoid walking at night, use ride-hailing apps and keep valuables secure. In parks, follow your guide’s lead around wildlife and never exit vehicles except at designated points. Coastal resorts and conservancies maintain excellent security records.	{}	12	2026-09-28 16:36:52.015	2026-09-28 16:36:52.015
07c1dd56-3670-4f8d-9873-2efc82a627a7	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	overview	Overview	Botswana practices high-value, low-volume tourism, and the result is Africa’s most exclusive safari experience. The Okavango Delta — a 15,000km² inland water wonderland and UNESCO World Heritage Site — offers mokoro trips through papyrus channels, while Chobe holds the continent’s largest elephant population and the Kalahari’s black-maned lions stalk the vast Central Kalahari Game Reserve. English is the official language and the pula is among Africa’s most stable currencies.	{"Okavango Delta – UNESCO-listed inland delta, best May–Oct","Roughly 130,000 elephants — Africa’s largest population","High-value/low-volume policy keeps crowds thin"}	0	2026-09-28 16:36:52.021	2026-09-28 16:36:52.021
a5daf9b8-e55e-4a32-a2d7-96edb7989d2a	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	staying-safe	Staying Safe	Botswana is among Africa’s safest and most politically stable countries, with a low crime rate and excellent tourism infrastructure. Wildlife presents the only real risks — elephants are genuinely dangerous: keep distance on foot, never walk between camps at night without an escort, and follow guides’ instructions around hippos and crocodiles on the waterways. Self-drivers should respect the parks’ strict off-road and night-driving rules.	{}	12	2026-09-28 16:36:52.059	2026-09-28 16:36:52.059
385dd65f-c299-4e0e-a115-6b9c2fe88393	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	parks-reserves	Parks & Reserves	Botswana’s protected network is dominated by the Okavango Delta and Moremi Game Reserve at its heart, Chobe National Park in the north, the immense Central Kalahari Game Reserve (52,800km²), the Makgadikgadi and Nxai Pan salt-pan parks, and the remote Kgalagadi Transfrontier Park. Private concession areas around the delta offer night drives, walking safaris and off-road tracking unavailable in the national parks.	{"Moremi Game Reserve – the delta’s wildlife core","Chobe NP – river cruises past thousands of elephants","Central Kalahari GR – black-maned lions on fossil riverbeds","Makgadikgadi Pans – zebra migration and meerkats"}	1	2026-09-28 16:36:52.025	2026-09-28 16:36:52.025
d4811896-5d99-41b3-9504-b619b720fd7f	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	things-to-do	Things To Do	Gliding silently through delta channels in a mokoro (dugout canoe) is Botswana’s signature activity, complemented by motorboat safaris, game drives and water-camp fly fishing for tigerfish. Chobe offers famous sunset river cruises; the Kalahari delivers San (Bushmen) guided walks and meerkat encounters at the pans; and the country’s superb infrastructure makes it Africa’s premier self-drive destination.	{"Mokoro excursions through the delta’s channels","Chobe River sunset cruise among bathing elephants","Meerkat and quad-bike adventures on the Makgadikgadi Pans","Fully outfitted 4x4 self-drive safaris"}	2	2026-09-28 16:36:52.03	2026-09-28 16:36:52.03
008a8f05-c6e1-46c6-9cd0-065034f339ff	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	best-beaches	Best Beaches	Landlocked Botswana has no coastline — but its water experiences are unique. Travelers craving sand pair Botswana with Zimbabwe’s Victoria Falls (a 90-minute drive from Chobe), Namibia’s Skeleton Coast, or fly via Johannesburg to Mozambique’s Bazaruto Archipelago for the classic delta-then-dhow combination.	{"Victoria Falls, Zimbabwe – easy add-on from Chobe","Bazaruto Archipelago, Mozambique – fly-in beach extension","Makgadikgadi Pans – surreal salt-flats “beach” under the stars"}	3	2026-09-28 16:36:52.033	2026-09-28 16:36:52.033
5b674944-8a0c-4db7-8bc1-0d044eef43ff	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	reviews	Reviews	Botswana consistently earns the highest satisfaction ratings in African travel reviews, with guests praising the exclusivity, the quality of guiding and the romance of water camps reachable only by light aircraft. The most common complaint is price — delta camps run US$600–1,500 per person per night — though reviewers overwhelmingly agree it is worth it.	{}	4	2026-09-28 16:36:52.036	2026-09-28 16:36:52.036
ac82ee40-d5ec-4bb8-a5cd-25cdeb32dc77	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	wildlife	Wildlife	The Okavango Delta supports all of the Big Five plus African wild dogs at their highest density anywhere — the delta and Linyanti are the best places on Earth to see them. Chobe’s riverfront teems with up to 120,000 elephants in the dry season, the Kalahari holds desert-adapted black-maned lions and brown hyenas, and the Makgadikgadi hosts Africa’s second-largest zebra migration.	{"Wild dogs – world’s best sighting odds in the delta","Chobe – Africa’s largest elephant concentration","Zebra migration between Okavango and Makgadikgadi (Dec–Mar)"}	5	2026-09-28 16:36:52.039	2026-09-28 16:36:52.039
56dee8c5-0684-4c05-a612-e4417d9c4f09	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	birds	Birds	Botswana counts over 590 bird species, with the Okavango’s wetlands the undoubted centerpiece: slaty egrets, wattled cranes, Pel’s fishing owls and African skimmers patrol the channels. The Kalahari adds arid specialists such as Kori bustards, crimson-breasted shrikes and Burchell’s sandgrouse. November to March brings migrants and the delta’s breeding season displays.	{"Pel’s fishing owl – delta twilight specialty","Slaty egret and wattled crane in the permanent swamps","Carmine bee-eater colonies on the sandbanks (Sep–Nov)"}	6	2026-09-28 16:36:52.042	2026-09-28 16:36:52.042
5d65099d-6699-4dfb-bbd2-a2142a0221c1	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	best-time	Best Time To Visit	May to October is the delta’s flood season coinciding with the dry winter — water levels peak, game concentrates on the islands and mokoro trips are at their best; July to October in Chobe is elephant spectacle season. The green season of November to April brings dramatic storms, newborn antelope, migrant birds and sharply discounted rates, though some delta camps close in the wettest months.	{"May–Oct: peak flood and dry season — book a year ahead","Nov–Apr: green season, lower rates, birding at its best","Dec–Mar: zebra migration on the Makgadikgadi grasslands"}	7	2026-09-28 16:36:52.045	2026-09-28 16:36:52.045
2b552e78-7dec-4c5f-8ede-5b6b2c51683f	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	weather-climate	Weather & Climate	Botswana’s climate is semi-arid with big temperature swings: Kalahari winter nights (Jun–Aug) drop near freezing while October afternoons top 40°C. Days in the dry winter season are mild and clear — perfect game-viewing weather. The single wet season runs November to March, delivering brief but violent afternoon thunderstorms that transform the pans into grasslands.	{}	8	2026-09-28 16:36:52.049	2026-09-28 16:36:52.049
6e25f711-26f7-452a-afd0-b15e55b1911a	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	popular-routes	Popular Routes	The classic fly-in delta route hops between two or three water and land camps plus Chobe, over 6–10 days, usually booked as a package from Maun or Kasane. Self-drivers follow the Maun – Moremi – Savuti – Chobe 4x4 trail. Popular combinations add Victoria Falls and/or the Makgadikgadi Pans, or continue south to the Kgalagadi.	{"Fly-in delta: Maun – water camp – land camp – Chobe (7 days)","Self-drive: Maun – Moremi – Savuti – Chobe (8–10 days)","Delta + Vic Falls + Caprivi combo (10 days)"}	9	2026-09-28 16:36:52.052	2026-09-28 16:36:52.052
a8e8645a-39ed-401c-a82f-8cd8ffc798ae	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	getting-there	How To Get There	Most visitors arrive via Sir Seretse Khama International Airport (GBE) in Gaborone or, for safari circuits, fly into Maun (MUB) or Kasane (BBK) from Johannesburg or Gaborone. Light-aircraft charters connect Maun to delta airstrips — the only way in to water camps. Chobe is a 90-minute drive from Victoria Falls or Livingstone airports. Visas are visa-free or on arrival for most Western nationalities.	{"Maun (MUB) is the delta gateway; Kasane (BBK) for Chobe","Light-aircraft transfers to delta camps ≤ 45 min","Johannesburg offers the best international connections"}	10	2026-09-28 16:36:52.054	2026-09-28 16:36:52.054
fe87b4f5-2b18-4f96-9100-4908230313b6	2c680e59-6b5b-4f73-81bd-62ea1f384ed4	health-safety	Malaria & Vaccinations	Northern Botswana — the Okavango, Chobe and Linyanti — is a malaria area during and after the wet season (November to June); prophylaxis is recommended in the delta year-round as waters sustain mosquitoes. The Kalahari is malaria-free. A yellow fever certificate is needed only when arriving from endemic countries; hepatitis A and typhoid vaccinations are standard advice.	{}	11	2026-09-28 16:36:52.057	2026-09-28 16:36:52.057
5f0be9f0-4ae7-4a2c-a429-5129b8a85662	90fca831-5d85-4cdf-bbe5-b0049b30bafd	best-time	Best Time to Visit	June to March is generally good; flamingo numbers vary with water levels.	{}	2	2026-10-19 18:47:29.627	2026-10-19 18:47:29.627
a1949342-2e58-4f8d-a914-5fcbf9a42fba	90fca831-5d85-4cdf-bbe5-b0049b30bafd	getting-there	Getting There	About 3 hours by road from Nairobi on the main highway to Nakuru town.	{}	3	2026-10-19 18:47:29.632	2026-10-19 18:47:29.632
2b2bad0a-dc9a-4615-9c15-c2f030e8a85a	16843c98-d29a-422a-b0d2-474801ace36a	overview	Overview	South Africa is the world in one country — Big Five safaris in Kruger and the private Sabi Sand reserves, Cape Town’s Table Mountain and Winelands, the Drakensberg amphitheater, and the Garden Route’s coastline, all connected by excellent roads and domestic flights. It is the easiest African safari destination for first-timers: malaria-free parks, superb infrastructure and a weak currency make it outstanding value.	{"Malaria-free Big Five viewing in Madikwe, Addo and Eastern Cape","Kruger + Sabi Sand deliver Africa’s best leopard viewing","World-class food, wine and Cape Town in one itinerary"}	0	2026-09-28 16:36:52.066	2026-09-28 16:36:52.066
b8eaf83b-9e56-4c36-9d07-df2cf3937f67	16843c98-d29a-422a-b0d2-474801ace36a	parks-reserves	Parks & Reserves	Kruger National Park (19,485km²) is the flagship, ringed by exclusive private reserves — Sabi Sand, MalaMala, Thornybush, Timbavati — where off-road driving and night safaris produce exceptional sightings. Further afield, Madikwe and Pilanesberg (malaria-free, near Johannesburg), Hluhluwe-iMfolozi (rhino cradle), iSimangaliso Wetland Park and Addo Elephant NP each offer distinct experiences.	{"Kruger NP – self-drive and lodge safaris in one park","Sabi Sand & MalaMala – legendary leopards, off-road drives","Madikwe GR – malaria-free Big Five near Jo’burg","Hluhluwe-iMfolozi – saved the white rhino from extinction"}	1	2026-09-28 16:36:52.069	2026-09-28 16:36:52.069
d47336fb-7e9b-4655-a804-853170fd457c	16843c98-d29a-422a-b0d2-474801ace36a	things-to-do	Things To Do	Safaris come in every format — self-drive Kruger, guided open-vehicle drives, luxury lodge stays and walking trails. Beyond the bush: hike the Blyde River Canyon and Drakensberg, drive the Garden Route, cage-dive with great whites from Gansbaai, tour Cape winelands, visit Robben Island and whale-watch in Hermanus (Jun–Nov). Night drives and bush walks are standard in the private reserves.	{"Sabi Sand game drives – off-road and after dark","Garden Route road trip from Cape Town","Whale watching in Hermanus and Hermanus-style bays","Table Mountain cableway and Cape Point day trips"}	2	2026-09-28 16:36:52.072	2026-09-28 16:36:52.072
223ecc1c-5235-44d9-a17c-a55abe442b8f	16843c98-d29a-422a-b0d2-474801ace36a	best-beaches	Best Beaches	South Africa has 2,800km of coastline with genuine highlights. Cape Town’s Clifton and Camps Bay are urban white-sand icons; Boulders Beach hosts a resident African penguin colony; the Garden Route offers Plettenberg Bay and Knysna; and KwaZulu-Natal’s warm waters suit swimming and diving at Sodwana Bay, gateway to one of the world’s southernmost coral reefs.	{"Camps Bay & Clifton – Cape Town’s glitzy beaches","Boulders Beach – swim alongside African penguins","Sodwana Bay – coral-reef diving in a World Heritage park"}	3	2026-09-28 16:36:52.075	2026-09-28 16:36:52.075
fdc8edf8-2b43-48b5-b47a-23612e65b178	16843c98-d29a-422a-b0d2-474801ace36a	reviews	Reviews	Reviewers love South Africa’s combination of value, ease and variety — safari, city and coast in one trip without malaria pills. Sabi Sand leopard sightings earn near-universal praise. Common cautions: self-drive visitors should observe Kruger’s gate times strictly, and visitors are advised to stay alert in major cities, especially Johannesburg, using private transfers after dark.	{}	4	2026-09-28 16:36:52.078	2026-09-28 16:36:52.078
f6c4f070-5599-4758-9f32-58cb5dc6ec2f	16843c98-d29a-422a-b0d2-474801ace36a	wildlife	Wildlife	Kruger alone supports 147 mammal species, including around 12,000 elephants, 2,000 lions and Africa’s best-viewed leopards in the adjacent private reserves. White rhinos are a conservation success story here (though poaching remains a battle), cheetah and wild dog roam the open savannah, and the coast adds southern right whales, great white sharks and Cape fur seal colonies.	{"Big Five in Kruger, Sabi Sand, Madikwe and Addo","Leopard viewing in Sabi Sand is world-famous","Marine Big Five: whale, shark, seal, dolphin, penguin"}	5	2026-09-28 16:36:52.082	2026-09-28 16:36:52.082
bcba08ec-c0a4-4a6e-8241-3d070d866996	16843c98-d29a-422a-b0d2-474801ace36a	birds	Birds	South Africa lists over 850 species, including dozens of endemics found nowhere else. Kruger offers easy raptor and roller viewing, the Cape’s fynbos hosts Cape sugarbirds and orange-breasted sunbirds, and the Western Cape is a seabird mecca — Algoa Bay and Cape Town pelagics record albatrosses and petrels. The Drakensberg adds high-altitude specials like the bearded vulture.	{"African penguin and Cape gannet colonies","Endemics: Cape sugarbird, orange-breasted sunbird, Protea canary","Pelagic trips from Cape Town for albatrosses"}	6	2026-09-28 16:36:52.085	2026-09-28 16:36:52.085
18218ad4-d05d-47b2-876f-edb243fb5bed	16843c98-d29a-422a-b0d2-474801ace36a	best-time	Best Time To Visit	May to September is prime safari season — dry, cool and the best time for Kruger and the private reserves. Whale season runs June to November, spring wildflowers bloom in Namaqualand in August–September, and Cape Town is loveliest in the dry summer (November to March). Because seasons complement each other, South Africa works year-round with sensible planning.	{"May–Sep: best Kruger game viewing","Jun–Nov: southern right whales along the Cape coast","Nov–Mar: Cape Town summer and Garden Route season"}	7	2026-09-28 16:36:52.089	2026-09-28 16:36:52.089
edbc1e55-5160-49be-96a5-a2ba558bf251	16843c98-d29a-422a-b0d2-474801ace36a	weather-climate	Weather & Climate	Lying mostly in the temperate Southern Hemisphere, South Africa has reversed seasons. The interior plateau enjoys hot wet summers and dry sunny winters; Cape Town has a Mediterranean pattern with winter rain; KwaZulu-Natal is subtropical. Kruger winter days (25°C) are ideal for game drives but mornings are cold — pack warm layers for open vehicles.	{}	8	2026-09-28 16:36:52.091	2026-09-28 16:36:52.091
0d821617-7776-4df3-b957-1da1ea688197	16843c98-d29a-422a-b0d2-474801ace36a	popular-routes	Popular Routes	The most popular itinerary is the Panorama Route plus Kruger and Sabi Sand from Johannesburg (4–6 days), often combined with Victoria Falls or Cape Town. The Cape classics — Table Mountain, Winelands, Cape Point — take 3–4 days, and the Garden Route stretches from Cape Town to Port Elizabeth over 5–7 days. KwaZulu-Natal links Hluhluwe, iSimangaliso and the Drakensberg.	{"Jo’burg – Panorama Route – Kruger/Sabi Sand (5 days)","Cape Town + Winelands + Hermanus (4 days)","Garden Route self-drive Cape Town – PE (6 days)"}	9	2026-09-28 16:36:52.094	2026-09-28 16:36:52.094
d2988206-1f50-49f7-8094-0249b8c0365d	16843c98-d29a-422a-b0d2-474801ace36a	getting-there	How To Get There	O.R. Tambo International Airport (JNB) in Johannesburg is Africa’s busiest hub; Cape Town International (CPT) is the gateway for the west. Kruger is a 50-minute hop to Skukuza (SKK) or Hoedspruit (HDS) or a scenic 5-hour drive. Domestic low-cost carriers connect all major cities cheaply. Most Western nationalities receive visa-free entry for up to 90 days.	{"JNB for safari routes; CPT for the Cape and Garden Route","Fly Jo’burg → Skukuza/Hoedspruit to land inside Kruger country","Visa-free entry for US, UK, EU and most visitors (90 days)"}	10	2026-09-28 16:36:52.098	2026-09-28 16:36:52.098
f80875c7-b44f-45ff-85cf-2e59af6d9954	90fca831-5d85-4cdf-bbe5-b0049b30bafd	things-to-do	Things to Do	Popular activities in Lake Nakuru National Park:	{"Rhino tracking on game drives","Baboon Cliff viewpoint","Makalia Falls"}	4	2026-10-19 18:47:29.637	2026-10-19 18:47:29.637
2dd9cdf8-24f5-4d68-ad13-2f9ce2234049	16843c98-d29a-422a-b0d2-474801ace36a	health-safety	Malaria & Vaccinations	Kruger and northeastern KwaZulu-Natal are low-risk malaria areas in the wet summer months — prophylaxis is optional but repellent is wise; the rest of the country, including Madikwe, Pilanesberg, the Eastern Cape reserves and Cape Town, is entirely malaria-free. No yellow fever certificate is required unless arriving from an endemic country; routine vaccinations suffice for most visits.	{}	11	2026-09-28 16:36:52.101	2026-09-28 16:36:52.101
4d4ff473-7554-476c-870a-25292297d274	16843c98-d29a-422a-b0d2-474801ace36a	staying-safe	Staying Safe	South Africa’s parks and tourist areas are safe, but urban crime requires street smarts: use private transfers or ride-hailing apps at night, avoid walking in city centers, keep car doors locked and never stop for hitchhikers on the N-series highways. In reserves, follow ranger instructions — baboons and hippos cause more incidents than predators. Emergency services are excellent in cities.	{}	12	2026-09-28 16:36:52.104	2026-09-28 16:36:52.104
30230ab6-db85-4bfa-97b0-51113c76c16c	36fc4915-b27d-4bc3-ae09-b527efe45a77	overview	Tarangire National Park Overview	Tarangire covers about 2,850 km² south of Lake Manyara and was gazetted in 1970. In the dry season the Tarangire River is the only permanent water for miles, so large herds gather along it, which gives the park one of the highest elephant densities in northern Tanzania.	{"Area: about 2,850 km²","Established: 1970","Under two hours from Arusha by paved road","More than 550 bird species recorded"}	0	2026-10-19 18:47:29.344	2026-10-19 18:47:29.344
dc562a74-4e0e-499f-a25b-3bfb6113463c	36fc4915-b27d-4bc3-ae09-b527efe45a77	wildlife	Wildlife	Thousands of zebra, wildebeest and buffalo move in from the surrounding plains in the dry season, followed by lion and leopard.	{Elephant,Lion,Leopard,Buffalo,Zebra,Wildebeest,"Fringe-eared oryx"}	1	2026-10-19 18:47:29.359	2026-10-19 18:47:29.359
26543cf3-5f30-4b19-8d6f-913797782423	36fc4915-b27d-4bc3-ae09-b527efe45a77	best-time	Best Time to Visit	June to October, when the river draws the big herds. The green season (November to May) is quieter, with good birding.	{}	2	2026-10-19 18:47:29.367	2026-10-19 18:47:29.367
0666fc56-db10-4485-8472-df33f1884fd0	36fc4915-b27d-4bc3-ae09-b527efe45a77	getting-there	Getting There	Most visitors drive from Arusha (under two hours). Kuro airstrip in the park has scheduled light-aircraft flights.	{}	3	2026-10-19 18:47:29.375	2026-10-19 18:47:29.375
3d2857b6-96ef-4a01-8b42-6e0089813b87	36fc4915-b27d-4bc3-ae09-b527efe45a77	things-to-do	Things to Do	Popular activities in Tarangire National Park:	{"Game drives along the Tarangire River","Baobab photography","Walking safaris in the wildlife management areas outside the park"}	4	2026-10-19 18:47:29.383	2026-10-19 18:47:29.383
9da9d6ee-b04b-4990-b034-8e3003f4f218	3a24c00c-fa37-4c35-a727-30a288f90129	overview	Lake Manyara National Park Overview	Lake Manyara National Park protects about 325 km², of which roughly 230 km² is the soda lake itself. It became a national park in 1960 and is part of the UNESCO Lake Manyara Biosphere Reserve (1981). Groundwater forest, the Rift Valley escarpment and the lakeshore pack a lot of habitat into a small area.	{"Area: about 325 km² (around 230 km² of lake)","National park since 1960","UNESCO Biosphere Reserve since 1981","About 126 km (1.5 hours) from Arusha"}	0	2026-10-19 18:47:29.392	2026-10-19 18:47:29.392
36be4f82-bb3b-4f9c-8b4d-269c3592ce3a	3a24c00c-fa37-4c35-a727-30a288f90129	wildlife	Wildlife	Known for tree-climbing lions, elephants in the groundwater forest and large flocks of flamingos and pelicans on the lake. Over 390 bird species have been recorded.	{Elephant,Lion,Giraffe,"Olive baboon","Blue monkey",Flamingo,"Great white pelican"}	1	2026-10-19 18:47:29.4	2026-10-19 18:47:29.4
711f47ca-92c8-4228-9f55-411d67e280e8	3a24c00c-fa37-4c35-a727-30a288f90129	best-time	Best Time to Visit	June to October for mammals; November to April for migratory birds and flamingos.	{}	2	2026-10-19 18:47:29.407	2026-10-19 18:47:29.407
02786fb1-db53-4401-972a-784b5a2128aa	3a24c00c-fa37-4c35-a727-30a288f90129	getting-there	Getting There	About 1.5 hours by road from Arusha on the way to Ngorongoro and the Serengeti. Lake Manyara airstrip sits on the escarpment above the park.	{}	3	2026-10-19 18:47:29.414	2026-10-19 18:47:29.414
a0792fcf-85a6-48b2-a01e-b9e1ba593523	3a24c00c-fa37-4c35-a727-30a288f90129	things-to-do	Things to Do	Popular activities in Lake Manyara National Park:	{"Game drives in the groundwater forest","Treetop walkway","Birding along the lakeshore","Night drives (with a permit)"}	4	2026-10-19 18:47:29.421	2026-10-19 18:47:29.421
2537d59f-5b79-4f58-9cdb-b0100a5b25cf	fc1d1251-15e0-4dea-bf78-efbe434a914b	overview	Nyerere National Park Overview	Nyerere National Park was gazetted in 2019 from the northern part of the former Selous Game Reserve, whose protection dates back to 1896. At about 30,893 km² it is the largest national park in Africa. The Rufiji River, Tanzania's largest, runs through it and feeds a chain of lakes and channels.	{"Area: about 30,893 km²","National park since 2019 (formerly part of Selous Game Reserve)","Main river: Rufiji","Flights from Dar es Salaam and Zanzibar take under an hour"}	0	2026-10-19 18:47:29.428	2026-10-19 18:47:29.428
2f1273b2-5799-428f-b278-20c989a9618e	fc1d1251-15e0-4dea-bf78-efbe434a914b	wildlife	Wildlife	One of the most important strongholds for African wild dog, with large numbers of hippo and crocodile on the Rufiji.	{"Wild dog",Lion,Leopard,Elephant,Hippo,"Nile crocodile","Masai giraffe"}	1	2026-10-19 18:47:29.435	2026-10-19 18:47:29.435
6b796dfa-f470-4792-82ec-59c7f7507011	fc1d1251-15e0-4dea-bf78-efbe434a914b	best-time	Best Time to Visit	June to October (dry season). Many camps close in April and May during the long rains.	{}	2	2026-10-19 18:47:29.442	2026-10-19 18:47:29.442
39b28c24-8a2c-4203-b7e1-c7a0ed5d9c91	fc1d1251-15e0-4dea-bf78-efbe434a914b	getting-there	Getting There	Scheduled light-aircraft flights from Dar es Salaam and Zanzibar to airstrips such as Mtemere, Matambwe, Kiba, Beho Beho and Siwandu.	{}	3	2026-10-19 18:47:29.448	2026-10-19 18:47:29.448
7b8c1701-26d9-4d4c-9cc4-d190eed9fcfb	fc1d1251-15e0-4dea-bf78-efbe434a914b	things-to-do	Things to Do	Popular activities in Nyerere National Park:	{"Boat safaris on the Rufiji","Walking safaris","Game drives",Fly-camping}	4	2026-10-19 18:47:29.453	2026-10-19 18:47:29.453
1e71d409-0418-4708-b900-eb2239d2dfc0	e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b	overview	Ruaha National Park Overview	Ruaha was established in 1964 and, after adding the Usangu Game Reserve in 2008, covers about 20,226 km². The Great Ruaha River along its south-eastern edge is the focus of game viewing. Visitor numbers are low compared with the northern parks.	{"Area: about 20,226 km²","Established: 1964","About 130 km from Iringa","Lion conservation unit since 2005","More than 571 bird species"}	0	2026-10-19 18:47:29.461	2026-10-19 18:47:29.461
21ba7a5b-68e6-41db-b5a4-764de26c748f	e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b	wildlife	Wildlife	Large lion prides, plus a mix of East and Southern African species such as greater and lesser kudu, sable and roan antelope.	{Lion,Leopard,Cheetah,"Wild dog",Elephant,"Greater kudu","Sable antelope"}	1	2026-10-19 18:47:29.469	2026-10-19 18:47:29.469
e93ddc7c-8b5a-43b1-a36b-ac97d9dc8620	febe8ce7-8ff4-4bec-9a8a-df0057411bb1	overview	Gombe National Park Overview	Gombe is Tanzania's smallest national park at about 35 km², on the eastern shore of Lake Tanganyika. It was established in 1968. Jane Goodall began studying its chimpanzees in 1960, and the Gombe Stream Research Centre (founded 1967) runs the longest field study of any wild animal species.	{"Area: about 35 km²","Established: 1968","Access by boat only, from Kigoma","Chimpanzee research since 1960"}	0	2026-10-19 18:47:29.495	2026-10-19 18:47:29.495
77827642-7cca-4d37-8a41-d35a5e286d85	febe8ce7-8ff4-4bec-9a8a-df0057411bb1	wildlife	Wildlife	Habituated chimpanzee communities and one of the highest primate concentrations in Africa.	{Chimpanzee,"Olive baboon","Red colobus","Red-tailed monkey","Blue monkey","Vervet monkey"}	1	2026-10-19 18:47:29.502	2026-10-19 18:47:29.502
6614c002-b692-4584-bf1b-283e1fc5f97c	febe8ce7-8ff4-4bec-9a8a-df0057411bb1	best-time	Best Time to Visit	July to October, when trails are drier and chimps often feed lower down. Treks run all year.	{}	2	2026-10-19 18:47:29.51	2026-10-19 18:47:29.51
3d97ef8a-9739-4f74-9c03-10fcda9f2941	febe8ce7-8ff4-4bec-9a8a-df0057411bb1	getting-there	Getting There	Fly or drive to Kigoma, then take a boat north along Lake Tanganyika. There are no roads into the park.	{}	3	2026-10-19 18:47:29.516	2026-10-19 18:47:29.516
4b5dbd75-e97f-4935-b760-2684c18fdc80	febe8ce7-8ff4-4bec-9a8a-df0057411bb1	things-to-do	Things to Do	Popular activities in Gombe National Park:	{"Chimpanzee trekking","Visit Jane Goodall’s feeding station site","Swimming and snorkelling in Lake Tanganyika"}	4	2026-10-19 18:47:29.522	2026-10-19 18:47:29.522
bc60b903-0fa9-43a6-a65e-b824a6798c95	f7cfe70b-7822-4458-950b-e0dca896f7a8	overview	Katavi National Park Overview	Katavi was established in 1974 and expanded to about 4,471 km² in 1997, making it Tanzania's third-largest national park. It is one of the country's most remote parks, usually reached by charter flight.	{"Area: about 4,471 km²","Established: 1974","About 40 km south of Mpanda","Third-largest national park in Tanzania"}	0	2026-10-19 18:47:29.529	2026-10-19 18:47:29.529
44a38104-063c-409b-9d36-97f9955100c9	f7cfe70b-7822-4458-950b-e0dca896f7a8	wildlife	Wildlife	In the late dry season huge buffalo herds and crowded hippo and crocodile pools along the Katuma River draw lions and hyenas.	{Buffalo,Hippo,"Nile crocodile",Lion,Elephant,"Masai giraffe",Zebra}	1	2026-10-19 18:47:29.534	2026-10-19 18:47:29.534
972e40f6-99fa-42db-bd3d-531dc0b2da85	f7cfe70b-7822-4458-950b-e0dca896f7a8	best-time	Best Time to Visit	July to October; the later in the dry season, the more concentrated the wildlife.	{}	2	2026-10-19 18:47:29.541	2026-10-19 18:47:29.541
efc143ee-5729-465c-94c3-edefbe857f8e	f7cfe70b-7822-4458-950b-e0dca896f7a8	getting-there	Getting There	Charter flights to Ikuu airstrip (about 3 hours from Dar es Salaam, 2 from Mwanza). Overland travel takes days on unpaved roads.	{}	3	2026-10-19 18:47:29.547	2026-10-19 18:47:29.547
1e895ce4-da39-4f64-8cf6-73ff9407ee45	f7cfe70b-7822-4458-950b-e0dca896f7a8	things-to-do	Things to Do	Popular activities in Katavi National Park:	{"Game drives on the Katuma floodplain","Walking safaris",Fly-camping}	4	2026-10-19 18:47:29.553	2026-10-19 18:47:29.553
add5878c-fd28-4921-9c30-df263fbc7611	c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e	overview	Zanzibar Overview	Unguja, the main island of Zanzibar, covers about 1,464 km² off Tanzania's coast. Its capital, Stone Town, is a UNESCO World Heritage Site, and the island's beaches make it the most popular way to end a Tanzania safari.	{"Unguja area: about 1,464 km²","Stone Town: UNESCO World Heritage Site","Abeid Amani Karume International Airport","Rains peak in March–May and November–December"}	0	2026-10-19 18:47:29.56	2026-10-19 18:47:29.56
0b5af26b-a917-44cf-ac77-ca228aa6ab4b	c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e	wildlife	Wildlife	Jozani Chwaka Bay National Park is home to about a third of the endemic Zanzibar red colobus population. Dolphins and sea turtles are seen offshore.	{"Zanzibar red colobus","Bottlenose dolphin","Green turtle"}	1	2026-10-19 18:47:29.565	2026-10-19 18:47:29.565
d1dd9cb3-1a21-4542-b2df-61ccb59d1d57	c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e	best-time	Best Time to Visit	June to October and December to February are dry. Avoid March to May, the main rainy season.	{}	2	2026-10-19 18:47:29.57	2026-10-19 18:47:29.57
b9baac3d-6979-41c5-9c43-a35c39fed20d	c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e	getting-there	Getting There	Direct international flights to Abeid Amani Karume International Airport, short flights from Arusha and the safari parks, or a ferry from Dar es Salaam.	{}	3	2026-10-19 18:47:29.575	2026-10-19 18:47:29.575
d3ecb08d-d4a8-4ec0-a4fa-94038d82e820	c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e	things-to-do	Things to Do	Popular activities in Zanzibar:	{"Stone Town walking tour","Spice farm visit","Jozani Forest red colobus walk","Snorkelling at Mnemba Atoll"}	4	2026-10-19 18:47:29.581	2026-10-19 18:47:29.581
b61d3f01-c337-40df-a5cb-1d4938d063db	084d55cf-f2d5-4f56-97ca-8ac00cb4087c	overview	Amboseli National Park Overview	Amboseli covers 392 km² at the heart of an 8,000 km² ecosystem on the Kenya–Tanzania border. It was a reserve from 1906 and became a national park in 1974. Its elephants have been studied since 1972, one of the longest-running elephant research projects in the world.	{"Area: 392 km²","Reserve from 1906, national park since 1974","Elephant research since 1972","About 400 bird species"}	0	2026-10-19 18:47:29.586	2026-10-19 18:47:29.586
d4872013-e011-41da-9670-c3a1854773c7	084d55cf-f2d5-4f56-97ca-8ac00cb4087c	wildlife	Wildlife	Best known for big-tusked elephants against the backdrop of Mount Kilimanjaro. Swamps fed by Kilimanjaro’s snowmelt keep wildlife here all year.	{Elephant,Lion,Cheetah,"Spotted hyena",Buffalo,"Masai giraffe",Hippo}	1	2026-10-19 18:47:29.591	2026-10-19 18:47:29.591
11bfb1c4-99eb-4c5b-af0a-0f41e18c1ed6	084d55cf-f2d5-4f56-97ca-8ac00cb4087c	best-time	Best Time to Visit	June to October and January to February (dry seasons). Kilimanjaro is clearest early in the morning.	{}	2	2026-10-19 18:47:29.597	2026-10-19 18:47:29.597
4041f0b8-269d-4939-8253-64d4498f7afb	084d55cf-f2d5-4f56-97ca-8ac00cb4087c	getting-there	Getting There	About 4 to 5 hours by road from Nairobi, or a short scheduled flight to Amboseli airstrip.	{}	3	2026-10-19 18:47:29.602	2026-10-19 18:47:29.602
b3d37f4e-22a9-4807-aafc-6ee308aafb14	084d55cf-f2d5-4f56-97ca-8ac00cb4087c	things-to-do	Things to Do	Popular activities in Amboseli National Park:	{"Game drives in the swamps","Observation Hill viewpoint","Maasai village visit"}	4	2026-10-19 18:47:29.607	2026-10-19 18:47:29.607
1e2998dd-a28a-4d17-ade1-b39af9070c82	90fca831-5d85-4cdf-bbe5-b0049b30bafd	overview	Lake Nakuru National Park Overview	Lake Nakuru National Park covers 188 km² around a Rift Valley soda lake, about 164 km north of Nairobi. It was created in 1961, is a Ramsar wetland (1990) and since 2011 is part of the Kenya Lake System UNESCO World Heritage Site. A fenced sanctuary makes it one of the best places in Kenya to see rhino.	{"Area: 188 km²","Established: 1961","Ramsar site since 1990","UNESCO World Heritage (Kenya Lake System) since 2011","About 164 km from Nairobi"}	0	2026-10-19 18:47:29.615	2026-10-19 18:47:29.615
a493af7a-27d4-448f-ab23-37b0204025a1	29a7d6bf-7860-46a6-900a-05f01a4e2e96	overview	Samburu National Reserve Overview	Samburu National Reserve covers 165 km² on the north bank of the Ewaso Ng'iro River, about 350 km north of Nairobi. It was gazetted in 1985. The semi-arid landscape supports dry-country species found nowhere else on the usual Kenya safari circuit.	{"Area: 165 km²","Established: 1985","River: Ewaso Ng'iro","About 350 km from Nairobi"}	0	2026-10-19 18:47:29.643	2026-10-19 18:47:29.643
27ab022f-ca71-4d32-b23a-3b7b28b8e450	29a7d6bf-7860-46a6-900a-05f01a4e2e96	wildlife	Wildlife	Home to the 'Samburu Special Five': Grevy's zebra, reticulated giraffe, gerenuk, Beisa oryx and Somali ostrich.	{"Grevy's zebra","Reticulated giraffe",Gerenuk,"Beisa oryx","Somali ostrich",Elephant,Leopard}	1	2026-10-19 18:47:29.648	2026-10-19 18:47:29.648
dbcf37ec-141d-429e-a14f-b945dac76a6c	29a7d6bf-7860-46a6-900a-05f01a4e2e96	best-time	Best Time to Visit	June to October and December to March (dry seasons), when animals stay close to the river.	{}	2	2026-10-19 18:47:29.653	2026-10-19 18:47:29.653
226f88b7-3519-439a-bd2c-9f7905790be3	29a7d6bf-7860-46a6-900a-05f01a4e2e96	getting-there	Getting There	About 6 hours by road from Nairobi via Isiolo, or scheduled flights to Kalama or Buffalo Springs airstrips.	{}	3	2026-10-19 18:47:29.659	2026-10-19 18:47:29.659
195a6304-16df-4981-a66f-bfec02a0d80c	29a7d6bf-7860-46a6-900a-05f01a4e2e96	things-to-do	Things to Do	Popular activities in Samburu National Reserve:	{"Game drives along the river","Samburu cultural visits","Combine with Buffalo Springs across the river"}	4	2026-10-19 18:47:29.663	2026-10-19 18:47:29.663
2f0c1a18-32bd-4356-8fb0-7a9532fd3761	12fe89f3-3a12-40a9-be90-ca793fd95384	overview	Buffalo Springs National Reserve Overview	Buffalo Springs covers about 131 km² on the south bank of the Ewaso Ng'iro River, directly opposite Samburu. It was part of the Samburu-Isiolo Game Reserve from 1948 and has had its current boundaries since 1985. It is named after an oasis of clear spring water at its western end.	{"Area: about 131 km²","Protected since 1948; current boundaries since 1985","Over 365 bird species"}	0	2026-10-19 18:47:29.668	2026-10-19 18:47:29.668
7850aabd-bc1a-492d-9cbd-99f25dace1d6	12fe89f3-3a12-40a9-be90-ca793fd95384	wildlife	Wildlife	The same northern specials as Samburu, plus hippos and crocodiles in the river.	{"Grevy's zebra","Reticulated giraffe",Gerenuk,Oryx,Elephant,Lion,Cheetah}	1	2026-10-19 18:47:29.673	2026-10-19 18:47:29.673
c9de01cf-f13b-4e69-b88b-52badb89b331	12fe89f3-3a12-40a9-be90-ca793fd95384	best-time	Best Time to Visit	June to October and December to March.	{}	2	2026-10-19 18:47:29.679	2026-10-19 18:47:29.679
30838b9d-d5c8-40f1-b19c-9ff78edad0c0	12fe89f3-3a12-40a9-be90-ca793fd95384	getting-there	Getting There	Reached together with Samburu: about 6 hours from Nairobi by road, or fly to Buffalo Springs airstrip.	{}	3	2026-10-19 18:47:29.683	2026-10-19 18:47:29.683
c3463434-8472-48cc-90c5-324e9730b717	12fe89f3-3a12-40a9-be90-ca793fd95384	things-to-do	Things to Do	Popular activities in Buffalo Springs National Reserve:	{"Game drives","Visit the springs","Birding along the river"}	4	2026-10-19 18:47:29.688	2026-10-19 18:47:29.688
bea045ce-3f43-4ba0-94e5-5e059d375e8f	0a5b6408-4b91-4f8d-846e-b02dcdd6cc16	overview	Tsavo East National Park Overview	Tsavo East covers about 13,747 km² and was established in April 1948, making it one of Kenya's oldest and largest parks. Landmarks include the 290 km Yatta Plateau lava flow, Lugard Falls on the Galana River and Mudanda Rock, a viewpoint over a dry-season waterhole.	{"Area: about 13,747 km²","Established: 1948","Yatta Plateau: about 290 km long","Easy access from the coast at Mombasa"}	0	2026-10-19 18:47:29.694	2026-10-19 18:47:29.694
15fd8ff2-50fc-4957-9c77-9324ef086142	0a5b6408-4b91-4f8d-846e-b02dcdd6cc16	wildlife	Wildlife	Famous for elephants coated in red dust, plus large herds of buffalo and dry-country antelope.	{Elephant,Lion,Buffalo,"Lesser kudu","Fringe-eared oryx",Gerenuk}	1	2026-10-19 18:47:29.699	2026-10-19 18:47:29.699
feafd16b-391b-4dc7-9ef3-e0c3caf7c7c1	0a5b6408-4b91-4f8d-846e-b02dcdd6cc16	best-time	Best Time to Visit	June to October and January to February.	{}	2	2026-10-19 18:47:29.704	2026-10-19 18:47:29.704
48f328ee-2ec1-4a8b-a908-c6e95735f26f	0a5b6408-4b91-4f8d-846e-b02dcdd6cc16	getting-there	Getting There	About 2 to 3 hours by road from Mombasa or the Diani coast. The Nairobi–Mombasa railway stops at Voi near the park gate.	{}	3	2026-10-19 18:47:29.709	2026-10-19 18:47:29.709
19cae843-94e2-4ebc-908d-f32b4111db1f	0a5b6408-4b91-4f8d-846e-b02dcdd6cc16	things-to-do	Things to Do	Popular activities in Tsavo East National Park:	{"Game drives","Lugard Falls","Mudanda Rock","Combine with a beach stay"}	4	2026-10-19 18:47:29.715	2026-10-19 18:47:29.715
3607956a-3854-4e23-9382-25caffc551de	97102495-84e6-436a-8eb1-e7edf0227c86	overview	Chobe National Park Overview	Chobe National Park covers about 11,700 km² in northern Botswana and was proclaimed in 1967–68. It has four main areas: the Chobe riverfront (Serondela), the Savuti Marsh, the Linyanti Marsh and the dry Nogatsaa hinterland.	{"Area: about 11,700 km²","Established: 1967–68","Estimated 50,000 elephants","Northern entrance at Kasane"}	0	2026-10-19 18:47:29.72	2026-10-19 18:47:29.72
5800dcb2-7a1a-44e7-b5fc-1fbc0bdcce66	97102495-84e6-436a-8eb1-e7edf0227c86	wildlife	Wildlife	Home to one of the largest elephant populations on Earth. The riverfront also has buffalo, hippo and the rare puku antelope; Savuti is known for lions.	{Elephant,Buffalo,Lion,Hippo,"Sable antelope",Puku}	1	2026-10-19 18:47:29.725	2026-10-19 18:47:29.725
1d89a650-b634-4314-b2ba-a0fd1d08fc05	97102495-84e6-436a-8eb1-e7edf0227c86	best-time	Best Time to Visit	May to October, when elephants gather on the Chobe River.	{}	2	2026-10-19 18:47:29.731	2026-10-19 18:47:29.731
58d5deae-4ded-47d3-bedb-bc50cec0f219	97102495-84e6-436a-8eb1-e7edf0227c86	getting-there	Getting There	Fly to Kasane International Airport, about 80 km from Victoria Falls. Savuti and Linyanti are reached by light aircraft from Maun or Kasane.	{}	3	2026-10-19 18:47:29.735	2026-10-19 18:47:29.735
749d5e36-e4e1-475c-b913-1e0129785692	97102495-84e6-436a-8eb1-e7edf0227c86	things-to-do	Things to Do	Popular activities in Chobe National Park:	{"Sunset boat cruise on the Chobe River","Game drives on the riverfront","Day trip to Victoria Falls"}	4	2026-10-19 18:47:29.74	2026-10-19 18:47:29.74
5abbaae0-533e-4ba5-b0c4-91874531d6f8	d1496a97-dfd3-49d9-b792-8cb74bd520ad	overview	Okavango Delta Overview	The Okavango Delta is a vast inland delta in northern Botswana, inscribed as a UNESCO World Heritage Site in 2014. Rain in the Angolan highlands in January and February reaches the delta months later, so the floodwaters spread from March and peak between June and August, during Botswana's dry winter.	{"UNESCO World Heritage Site since 2014","Core area: about 20,000 km²","Floods peak June to August","Fed by the Okavango River from Angola"}	0	2026-10-19 18:47:29.745	2026-10-19 18:47:29.745
a8ad5131-b5c1-4de5-ad2a-8ce2670a73ac	d1496a97-dfd3-49d9-b792-8cb74bd520ad	wildlife	Wildlife	All of the Big Five are present. Red lechwe are the most common large mammal (about 88,000), and over 400 bird species have been recorded.	{Lion,Leopard,Elephant,"Wild dog","Red lechwe",Hippo,Sitatunga}	1	2026-10-19 18:47:29.751	2026-10-19 18:47:29.751
3c24965c-1cfc-47e3-aa25-44882368b6cb	d1496a97-dfd3-49d9-b792-8cb74bd520ad	best-time	Best Time to Visit	June to October, when the floodwater is high and wildlife concentrates on the islands.	{}	2	2026-10-19 18:47:29.756	2026-10-19 18:47:29.756
1eaaa37d-5c8b-4656-bcd4-4b2176f5fa83	d1496a97-dfd3-49d9-b792-8cb74bd520ad	getting-there	Getting There	Fly to Maun, then by light aircraft to camp airstrips in the delta.	{}	3	2026-10-19 18:47:29.762	2026-10-19 18:47:29.762
e0ae0e88-eec8-4b30-8879-74b08a9da890	d1496a97-dfd3-49d9-b792-8cb74bd520ad	things-to-do	Things to Do	Popular activities in Okavango Delta:	{"Mokoro (dugout canoe) excursions","Walking safaris on islands","Game drives","Scenic helicopter flights"}	4	2026-10-19 18:47:29.767	2026-10-19 18:47:29.767
3dd04068-9818-4f16-ae07-1b60002e5bd4	d41df8c6-bfb3-4dbe-8ecb-85318acd4631	overview	Moremi Game Reserve Overview	Moremi Game Reserve covers just under 5,000 km² on the eastern side of the Okavango Delta. It was proclaimed in 1963 at the initiative of the local community, led by Elizabeth Pulane Moremi, widow of Chief Moremi III. Chief's Island was added in the 1970s.	{"Area: just under 5,000 km²","Proclaimed: 1963","Includes Chief’s Island and the Moremi Tongue","Campsites at South Gate, Third Bridge, Xakanaxa and Khwai"}	0	2026-10-19 18:47:29.772	2026-10-19 18:47:29.772
292fb87f-d7d4-4526-ab4d-bea90f016180	d41df8c6-bfb3-4dbe-8ecb-85318acd4631	wildlife	Wildlife	A mix of floodplain and dry land gives some of Africa’s best predator viewing. African wild dogs have been studied here since 1989, and nearly 500 bird species are recorded.	{"Wild dog",Lion,Leopard,Cheetah,Elephant,Buffalo,"Red lechwe"}	1	2026-10-19 18:47:29.778	2026-10-19 18:47:29.778
e7c2717a-a4ef-4765-9601-bd45341e4279	d41df8c6-bfb3-4dbe-8ecb-85318acd4631	best-time	Best Time to Visit	July to October.	{}	2	2026-10-19 18:47:29.783	2026-10-19 18:47:29.783
099a8123-e2c9-4d5c-ab30-e17e686fdf8e	d41df8c6-bfb3-4dbe-8ecb-85318acd4631	getting-there	Getting There	About 100 km by 4x4 from Maun to South Gate, or a short light-aircraft flight to lodge airstrips.	{}	3	2026-10-19 18:47:29.787	2026-10-19 18:47:29.787
f432944e-7ce5-4ae0-a113-91813f21a569	d41df8c6-bfb3-4dbe-8ecb-85318acd4631	things-to-do	Things to Do	Popular activities in Moremi Game Reserve:	{"Game drives","Mokoro trips","Self-drive camping"}	4	2026-10-19 18:47:29.793	2026-10-19 18:47:29.793
82ba02e7-f5d0-4b98-91bf-649dda5726e3	2f275b73-0b8f-4251-ba67-d2a69a046e07	overview	Central Kalahari Game Reserve Overview	The Central Kalahari Game Reserve was established in 1961 and covers about 52,800 km², larger than the Netherlands and one of the largest game reserves in the world. Deception Valley is one of four fossil river valleys that wind through it.	{"Area: about 52,800 km²","Established: 1961","Nearly 10% of Botswana’s land area","Home of San communities for thousands of years"}	0	2026-10-19 18:47:29.798	2026-10-19 18:47:29.798
896b86a2-4310-4682-aa32-bab74f5a2872	2f275b73-0b8f-4251-ba67-d2a69a046e07	wildlife	Wildlife	After the summer rains, springbok and gemsbok gather on the fossil valleys and attract black-maned Kalahari lions and cheetah.	{Lion,Cheetah,Leopard,"Wild dog",Gemsbok,Springbok,"Brown hyena"}	1	2026-10-19 18:47:29.804	2026-10-19 18:47:29.804
4e5d3769-9d7e-4540-91fd-f0159d28f835	2f275b73-0b8f-4251-ba67-d2a69a046e07	best-time	Best Time to Visit	December to April (green season) for plains game; the dry season is hot and sparse.	{}	2	2026-10-19 18:47:29.811	2026-10-19 18:47:29.811
2345bd58-2036-4b31-8574-5a0340795a88	2f275b73-0b8f-4251-ba67-d2a69a046e07	getting-there	Getting There	A long 4x4 drive from Maun or Ghanzi, or light aircraft to lodge airstrips.	{}	3	2026-10-19 18:47:29.816	2026-10-19 18:47:29.816
88294247-13d6-4a2d-ba22-343c7944711f	2f275b73-0b8f-4251-ba67-d2a69a046e07	things-to-do	Things to Do	Popular activities in Central Kalahari Game Reserve:	{"Game drives in Deception Valley","San bushwalks",Stargazing}	4	2026-10-19 18:47:29.821	2026-10-19 18:47:29.821
6c0815f6-295c-448e-ac4b-b26f3904dd79	61c5a145-5f24-453d-bdfa-64f6723199a4	overview	Makgadikgadi Pans National Park Overview	Makgadikgadi Pans National Park lies on the edge of one of the largest salt-pan systems in the world (about 16,000 km² in total). The Boteti River along its western boundary is the only permanent water in the dry season.	{"Pan system: about 16,000 km²","Boteti River forms the western boundary","Adjoins Nxai Pan National Park to the north"}	0	2026-10-19 18:47:29.827	2026-10-19 18:47:29.827
ddba4d3e-e087-4bfc-bd4d-13ed8709ad67	61c5a145-5f24-453d-bdfa-64f6723199a4	wildlife	Wildlife	From about April to November, zebra and wildebeest move from the pans to the Boteti River, one of Southern Africa’s largest zebra migrations. Habituated meerkats can be visited on the pans.	{Zebra,Wildebeest,Meerkat,"Brown hyena",Lion,Flamingo}	1	2026-10-19 18:47:29.833	2026-10-19 18:47:29.833
cb5e2154-4792-4819-b95b-e45b30e6becf	61c5a145-5f24-453d-bdfa-64f6723199a4	best-time	Best Time to Visit	December to March for the pans in green season; May to October for the zebra on the Boteti River.	{}	2	2026-10-19 18:47:29.837	2026-10-19 18:47:29.837
0fa9f0e2-d2ce-4242-adaa-ed353a636f9a	61c5a145-5f24-453d-bdfa-64f6723199a4	getting-there	Getting There	By road from Maun or Nata, or light aircraft to camp airstrips.	{}	3	2026-10-19 18:47:29.844	2026-10-19 18:47:29.844
d23edab9-5542-4b5d-a271-b9a855926eef	61c5a145-5f24-453d-bdfa-64f6723199a4	things-to-do	Things to Do	Popular activities in Makgadikgadi Pans National Park:	{"Meerkat visits","Quad biking on the pans (dry season)","Sleep-outs under the stars"}	4	2026-10-19 18:47:29.849	2026-10-19 18:47:29.849
a8ec3265-d2b5-465a-88f8-4e4b7f9b39b6	ea4950a4-027b-4b94-8cfb-e486a8845631	overview	Nxai Pan National Park Overview	Nxai Pan National Park covers about 2,578 km² north of the Maun–Nata road, adjoining Makgadikgadi Pans National Park. It was established in 1992. Its fossil pans turn to grassland after the summer rains.	{"Area: about 2,578 km²","Established: 1992","Home of Baines' Baobabs"}	0	2026-10-19 18:47:29.854	2026-10-19 18:47:29.854
55fa27f8-18cc-4f88-8a71-de8cb92d3c46	ea4950a4-027b-4b94-8cfb-e486a8845631	wildlife	Wildlife	Plains game arrives with the rains, followed by lion and cheetah.	{Zebra,Springbok,Giraffe,Lion,Cheetah,"Bat-eared fox"}	1	2026-10-19 18:47:29.86	2026-10-19 18:47:29.86
daac4781-1d6f-4603-8226-226dccc264c9	ea4950a4-027b-4b94-8cfb-e486a8845631	best-time	Best Time to Visit	December to April (green season).	{}	2	2026-10-19 18:47:29.866	2026-10-19 18:47:29.866
f698cc6f-c998-4aad-87af-6429a4a6a72d	ea4950a4-027b-4b94-8cfb-e486a8845631	getting-there	Getting There	Self-drive 4x4 from Maun (about 2 to 3 hours), or a light-aircraft flight.	{}	3	2026-10-19 18:47:29.871	2026-10-19 18:47:29.871
b2e0cf52-7b47-4e5c-b3a9-ab06401b2df0	ea4950a4-027b-4b94-8cfb-e486a8845631	things-to-do	Things to Do	Popular activities in Nxai Pan National Park:	{"Visit Baines' Baobabs, painted by Thomas Baines in the 1860s","Game drives around the waterhole"}	4	2026-10-19 18:47:29.877	2026-10-19 18:47:29.877
247c7e6b-20bd-44ef-bb21-b8593cb6876f	badc1354-056a-478b-9e96-335674907dc5	things-to-do	Things to Do	Popular activities in Hluhluwe-iMfolozi Park:	{"Self-drive game viewing","Guided wilderness trails","Combine with iSimangaliso Wetland Park"}	4	2026-10-19 18:47:30.015	2026-10-19 18:47:30.015
9753b18e-4988-4754-b1c6-c41fe362faa0	6d53a473-4153-4478-b4e2-87ca0e20a77b	overview	Kruger National Park Overview	Kruger National Park covers about 19,600 km² and became South Africa's first national park on 31 May 1926. Part of the area was first protected in 1898 as the Sabi Game Reserve. It has nine entrance gates, from Crocodile Bridge in the south to Pafuri in the north, and good tarred roads for self-drive.	{"Area: about 19,600 km²","National park since 1926 (Sabi Game Reserve from 1898)","Nine entrance gates","147 large mammal species"}	0	2026-10-19 18:47:29.883	2026-10-19 18:47:29.883
217b895e-6ae2-4bd5-bd86-c3810486c2cb	6d53a473-4153-4478-b4e2-87ca0e20a77b	wildlife	Wildlife	Big Five country, with (2010–2011 counts) about 13,750 elephants, 37,000 buffalo and 1,600 lions.	{Lion,Leopard,Elephant,"White rhino",Buffalo,"Wild dog",Cheetah}	1	2026-10-19 18:47:29.888	2026-10-19 18:47:29.888
6469c068-4990-41f8-8e0a-f3a4a7d16ade	6d53a473-4153-4478-b4e2-87ca0e20a77b	best-time	Best Time to Visit	May to September (dry winter), when vegetation thins and animals gather at water.	{}	2	2026-10-19 18:47:29.894	2026-10-19 18:47:29.894
813fb789-5a75-4b55-a94d-32087e2a9b9d	6d53a473-4153-4478-b4e2-87ca0e20a77b	getting-there	Getting There	Fly to Kruger Mpumalanga International, Skukuza, Hoedspruit or Phalaborwa, or drive about 5 hours from Johannesburg.	{}	3	2026-10-19 18:47:29.9	2026-10-19 18:47:29.9
52db4eb6-cc3e-4b40-85a6-0df994b6d776	6d53a473-4153-4478-b4e2-87ca0e20a77b	things-to-do	Things to Do	Popular activities in Kruger National Park:	{"Self-drive game viewing","Guided sunrise and night drives","Bush walks","Stay in rest camps"}	4	2026-10-19 18:47:29.904	2026-10-19 18:47:29.904
40c1499d-ec45-4848-b442-7af7d600bde7	ea1b85dc-d35f-4bcc-9ecc-7069996745f3	overview	MalaMala Game Reserve Overview	MalaMala Game Reserve covers 13,500 hectares in the Sabi Sand area and shares a 19 km unfenced boundary with Kruger National Park. Its land has been private wildlife property since 1927, and it was a pioneer of photographic safaris.	{"Area: 13,500 ha","Private wildlife land since 1927","About 27 km of Sand River frontage","19 km unfenced boundary with Kruger"}	0	2026-10-19 18:47:29.911	2026-10-19 18:47:29.911
6e05d6c0-a7f6-41c9-8386-c3ce2b06f1a7	ea1b85dc-d35f-4bcc-9ecc-7069996745f3	wildlife	Wildlife	Exceptional leopard viewing and all of the Big Five, with very few vehicles at each sighting.	{Leopard,Lion,Elephant,Rhino,Buffalo,Cheetah}	1	2026-10-19 18:47:29.917	2026-10-19 18:47:29.917
211b8fac-4bc2-4f9a-a999-ce3f611b5e8e	ea1b85dc-d35f-4bcc-9ecc-7069996745f3	best-time	Best Time to Visit	May to September.	{}	2	2026-10-19 18:47:29.922	2026-10-19 18:47:29.922
a48af670-4fa2-4ee6-aa83-648682981849	ea1b85dc-d35f-4bcc-9ecc-7069996745f3	getting-there	Getting There	Fly to Skukuza or Kruger Mpumalanga International, or charter to the reserve’s own airstrip.	{}	3	2026-10-19 18:47:29.927	2026-10-19 18:47:29.927
96645f81-c095-45b9-90d8-c24a4fe6ddb1	ea1b85dc-d35f-4bcc-9ecc-7069996745f3	things-to-do	Things to Do	Popular activities in MalaMala Game Reserve:	{"Open-vehicle game drives","Bush walks",Photography}	4	2026-10-19 18:47:29.932	2026-10-19 18:47:29.932
8df9bfc7-fc8d-46f3-ac4b-2227b855213d	7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc	overview	Phinda Private Game Reserve Overview	Phinda Private Game Reserve covers about 28,555 hectares in northern KwaZulu-Natal. It was created in 1991 from former farmland and hunting land, a landmark land-restoration project. It has seven habitats, including about 1,000 ha of rare dry sand forest.	{"Area: about 28,555 ha","Established: 1991","Seven distinct habitats","436 bird species"}	0	2026-10-19 18:47:29.937	2026-10-19 18:47:29.937
1274cc5c-fdb4-4a49-bda1-509c6e5ba1b3	7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc	wildlife	Wildlife	Big Five plus cheetah, wild dog and both black and white rhino. Cheetah reintroduction was part of its early conservation work.	{Cheetah,Lion,Leopard,Elephant,"Black rhino","White rhino","Wild dog"}	1	2026-10-19 18:47:29.943	2026-10-19 18:47:29.943
aaef0d8c-67d8-42de-9188-9fed4d0195ed	7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc	best-time	Best Time to Visit	May to September; summer (October to April) is hot but green.	{}	2	2026-10-19 18:47:29.947	2026-10-19 18:47:29.947
3f0bac2d-7696-43c2-bb86-e09c4ad549e0	7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc	getting-there	Getting There	About 4 hours by road from Durban, or fly to the reserve airstrip.	{}	3	2026-10-19 18:47:29.952	2026-10-19 18:47:29.952
e43062ab-9f45-452d-8440-de5e13c4218c	7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc	things-to-do	Things to Do	Popular activities in Phinda Private Game Reserve:	{"Game drives","Rhino conservation experiences","Day trips to the iSimangaliso coast"}	4	2026-10-19 18:47:29.958	2026-10-19 18:47:29.958
01f1834a-d08b-49ec-b384-3ccf3bb60c69	325e3920-c657-4edb-9a36-bcdf9fde014f	overview	Sabi Sand Nature Reserve Overview	Sabi Sand is a group of private reserves covering about 650 km² next to Kruger National Park, established in 1948. Members include MalaMala and Londolozi. There are no fences with Kruger, so wildlife moves freely.	{"Area: about 650 km²","Established: 1948","Unfenced with Kruger National Park"}	0	2026-10-19 18:47:29.963	2026-10-19 18:47:29.963
49ec7501-f8bd-49e2-b567-5718cfd22487	325e3920-c657-4edb-9a36-bcdf9fde014f	wildlife	Wildlife	World-famous for relaxed leopards. Off-road driving lets guides follow animals closely.	{Leopard,Lion,Elephant,Rhino,Buffalo,"Wild dog"}	1	2026-10-19 18:47:29.968	2026-10-19 18:47:29.968
24c396a0-af1a-412c-bd6c-e6d52c08b996	325e3920-c657-4edb-9a36-bcdf9fde014f	best-time	Best Time to Visit	May to September.	{}	2	2026-10-19 18:47:29.973	2026-10-19 18:47:29.973
a93d5f39-f5c8-476b-856a-9a20f7a5cd02	325e3920-c657-4edb-9a36-bcdf9fde014f	getting-there	Getting There	Fly to Skukuza or Kruger Mpumalanga International Airport, then a road transfer or charter to a lodge airstrip.	{}	3	2026-10-19 18:47:29.979	2026-10-19 18:47:29.979
51b9e536-820f-4d02-856a-ecd5194221e2	325e3920-c657-4edb-9a36-bcdf9fde014f	things-to-do	Things to Do	Popular activities in Sabi Sand Nature Reserve:	{"Off-road game drives","Walking safaris","Luxury lodge stays"}	4	2026-10-19 18:47:29.984	2026-10-19 18:47:29.984
b6a9abed-984d-4898-936c-925f824e8031	badc1354-056a-478b-9e96-335674907dc5	overview	Hluhluwe-iMfolozi Park Overview	Hluhluwe-iMfolozi was proclaimed on 30 April 1895, making it Africa's oldest proclaimed nature reserve. It covers about 960 km². In the 1950s and 60s warden Ian Player's Operation Rhino moved hundreds of rhinos from here to restock reserves across Africa.	{"Area: about 960 km²","Proclaimed: 1895","Birthplace of Operation Rhino","340 bird species"}	0	2026-10-19 18:47:29.989	2026-10-19 18:47:29.989
03885162-e224-4baa-8028-3cd9c6d08d02	badc1354-056a-478b-9e96-335674907dc5	wildlife	Wildlife	One of the largest populations of southern white rhino in the world, plus black rhino and the rest of the Big Five. Excellent for nyala.	{"White rhino","Black rhino",Lion,Elephant,Buffalo,Leopard,Nyala}	1	2026-10-19 18:47:29.996	2026-10-19 18:47:29.996
e2451e1a-5f74-48ef-b55a-e4b0d47100e6	badc1354-056a-478b-9e96-335674907dc5	best-time	Best Time to Visit	May to September; the park is open all year.	{}	2	2026-10-19 18:47:30.001	2026-10-19 18:47:30.001
9c030f20-9c54-4104-a67c-25d4589b4a84	badc1354-056a-478b-9e96-335674907dc5	getting-there	Getting There	About 3 hours by road from Durban.	{}	3	2026-10-19 18:47:30.009	2026-10-19 18:47:30.009
d7deedf1-4192-418a-9f9c-901be4c87bfb	623aa1c3-0d50-4ead-bae3-e28f5ba253f2	overview	Addo Elephant National Park Overview	Addo Elephant National Park was established in 1931 to save the area's last elephants; hunting had reduced the herd to 16 by 1920. It now covers about 1,640 km² and protects more than 600 elephants. Its marine section makes it the only park with the 'Big Seven'.	{"Area: about 1,640 km²","Established: 1931","More than 600 elephants","'Big Seven': Big Five plus southern right whale and great white shark"}	0	2026-10-19 18:47:30.02	2026-10-19 18:47:30.02
a7415792-bdf3-4a4c-94de-b52d90cb3f2b	623aa1c3-0d50-4ead-bae3-e28f5ba253f2	wildlife	Wildlife	Dense elephant herds, plus lion, buffalo, black rhino and leopard. Whales and sharks in Algoa Bay.	{Elephant,Lion,Buffalo,"Black rhino",Leopard,"Southern right whale","Great white shark"}	1	2026-10-19 18:47:30.027	2026-10-19 18:47:30.027
610980f4-c428-4726-9e32-220930339af1	623aa1c3-0d50-4ead-bae3-e28f5ba253f2	best-time	Best Time to Visit	All year. Whales are seen roughly June to November.	{}	2	2026-10-19 18:47:30.032	2026-10-19 18:47:30.032
a4f4f805-45ca-411e-b7c0-b3fe382320eb	623aa1c3-0d50-4ead-bae3-e28f5ba253f2	getting-there	Getting There	About an hour by road from Gqeberha (Port Elizabeth). Easy to add to a Garden Route trip.	{}	3	2026-10-19 18:47:30.037	2026-10-19 18:47:30.037
eb569193-4ce4-41ff-b3f2-338d8e76580d	623aa1c3-0d50-4ead-bae3-e28f5ba253f2	things-to-do	Things to Do	Popular activities in Addo Elephant National Park:	{"Self-drive game viewing","Guided night drives","Whale watching in Algoa Bay"}	4	2026-10-19 18:47:30.043	2026-10-19 18:47:30.043
6ccf5d00-91bd-4467-841e-ced6e6ce8709	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc	overview	Bwindi Impenetrable National Park Overview	Bwindi Impenetrable National Park covers about 331 km² of ancient montane rainforest in south-western Uganda. It became a national park in 1991 and a UNESCO World Heritage Site in 1994. Gorilla treks start from four sectors: Buhoma, Ruhija, Rushaga and Nkuringo.	{"Area: about 331 km²","National park since 1991","UNESCO World Heritage Site since 1994","2018 census: 459 mountain gorillas in 36 groups"}	0	2026-10-19 18:47:30.048	2026-10-19 18:47:30.048
5ce4dbf8-3760-456a-a6a1-530bf42f0ac8	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc	wildlife	Wildlife	Close to half of the world’s mountain gorillas live here. The forest also holds chimpanzees, forest elephants and many Albertine Rift endemic birds.	{"Mountain gorilla",Chimpanzee,"L'Hoest's monkey","Forest elephant","Black-and-white colobus"}	1	2026-10-19 18:47:30.053	2026-10-19 18:47:30.053
4928e905-c7a0-41de-9372-5366654afcd0	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc	best-time	Best Time to Visit	June to August and December to February (drier months). Treks run all year.	{}	2	2026-10-19 18:47:30.058	2026-10-19 18:47:30.058
21882c34-2738-4fc8-9b54-33ace79f0a01	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc	getting-there	Getting There	Light-aircraft flights from Entebbe to Kihihi (for Buhoma) or Kisoro (for Rushaga and Nkuringo), or a long drive from Kampala. Many travellers come via Kigali in Rwanda.	{}	3	2026-10-19 18:47:30.063	2026-10-19 18:47:30.063
a8f4295e-1a17-4043-ab72-17a5b8bc48ae	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc	things-to-do	Things to Do	Popular activities in Bwindi Impenetrable National Park:	{"Mountain gorilla trekking (permit required)","Gorilla habituation experience","Batwa community visit","Forest walks and birding"}	4	2026-10-19 18:47:30.068	2026-10-19 18:47:30.068
ecddaecb-1c96-4eb9-bf3b-900f40f88907	9c2b179c-0f79-437d-b84d-30eee3da3313	overview	Queen Elizabeth National Park Overview	Queen Elizabeth National Park covers about 1,978 km². It was founded in 1952 as Kazinga National Park and renamed in 1954 after a visit by Queen Elizabeth II. The Kazinga Channel links Lake George and Lake Edward.	{"Area: about 1,978 km²","Established: 1952","95 mammal species","Over 600 bird species"}	0	2026-10-19 18:47:30.073	2026-10-19 18:47:30.073
e90887d8-4545-4c8c-a719-f9406af077e5	9c2b179c-0f79-437d-b84d-30eee3da3313	wildlife	Wildlife	The Ishasha sector is famous for tree-climbing lions. The Kazinga Channel has some of Africa’s highest concentrations of hippo, and Kyambura Gorge has chimpanzees.	{"Tree-climbing lion",Hippo,Elephant,Buffalo,"Uganda kob",Chimpanzee}	1	2026-10-19 18:47:30.078	2026-10-19 18:47:30.078
d89dbcf0-a6ac-46e9-9958-eff38e2b9c55	9c2b179c-0f79-437d-b84d-30eee3da3313	best-time	Best Time to Visit	June to August and December to February.	{}	2	2026-10-19 18:47:30.083	2026-10-19 18:47:30.083
9e3a2594-ab45-48b1-a907-bf78d838b2dc	9c2b179c-0f79-437d-b84d-30eee3da3313	getting-there	Getting There	About 6 to 7 hours by road from Kampala (nearest town Kasese), or scheduled flights to Mweya or Kasese airstrips.	{}	3	2026-10-19 18:47:30.09	2026-10-19 18:47:30.09
7a2d5ef1-1297-46ae-9b27-ab53578ff7d9	9c2b179c-0f79-437d-b84d-30eee3da3313	things-to-do	Things to Do	Popular activities in Queen Elizabeth National Park:	{"Kazinga Channel boat trip","Ishasha tree-climbing lions","Chimp tracking in Kyambura Gorge"}	4	2026-10-19 18:47:30.097	2026-10-19 18:47:30.097
955cadbb-e7d9-45cb-8f0b-e9bf68cde461	cb4dd5d8-59b6-47da-ad56-324fb3c96662	overview	Murchison Falls National Park Overview	Murchison Falls is Uganda's largest national park at about 3,893 km², established in 1952. Here the Nile squeezes through a gorge about 7 metres wide and drops 43 metres.	{"Area: about 3,893 km²","Established: 1952","Nile gorge about 7 m wide, 43 m drop","About 450 bird species"}	0	2026-10-19 18:47:30.102	2026-10-19 18:47:30.102
0e5d7787-6900-4301-aca4-a8147a3276f4	cb4dd5d8-59b6-47da-ad56-324fb3c96662	wildlife	Wildlife	Rothschild’s giraffe, elephants, lions and big herds of Uganda kob north of the Nile. The delta is one of the best places to see the shoebill.	{"Rothschild giraffe",Elephant,Lion,Hippo,"Nile crocodile",Shoebill}	1	2026-10-19 18:47:30.107	2026-10-19 18:47:30.107
33736863-6a70-48d9-8062-d7987977ebef	cb4dd5d8-59b6-47da-ad56-324fb3c96662	best-time	Best Time to Visit	December to February and June to September.	{}	2	2026-10-19 18:47:30.113	2026-10-19 18:47:30.113
b9b00dbf-0e1b-4388-8ba9-9fbc1662a03b	cb4dd5d8-59b6-47da-ad56-324fb3c96662	getting-there	Getting There	About 5 to 6 hours by road from Kampala via Masindi, or scheduled flights to Pakuba or Bugungu airstrips.	{}	3	2026-10-19 18:47:30.118	2026-10-19 18:47:30.118
7ddb88d8-5297-4467-91d4-7251175b13bc	cb4dd5d8-59b6-47da-ad56-324fb3c96662	things-to-do	Things to Do	Popular activities in Murchison Falls National Park:	{"Boat trip to the base of the falls","Hike to the top of the falls","Game drives on the north bank","Shoebill trip to the Nile delta"}	4	2026-10-19 18:47:30.123	2026-10-19 18:47:30.123
d20a3e07-6b62-4648-9d46-cb0cf06ba7c8	ded914c3-9f36-4421-a54c-0f7fea77fc4d	overview	South Luangwa National Park Overview	South Luangwa covers about 9,050 km² of the Luangwa River valley. It became a game reserve in 1938 and a national park in 1972. Conservationist Norman Carr pioneered walking safaris here, and it is still known as the home of the walking safari.	{"Area: about 9,050 km²","Game reserve 1938, national park 1972","Birthplace of the walking safari","Main entry via Mfuwe"}	0	2026-10-19 18:47:30.128	2026-10-19 18:47:30.128
13bdf0bb-3f9b-4d51-a120-bd0a86112a6f	ded914c3-9f36-4421-a54c-0f7fea77fc4d	wildlife	Wildlife	Very high leopard densities and endemic subspecies such as Cookson's wildebeest and Crawshay's zebra. The Luangwa River holds huge numbers of hippo.	{Leopard,Lion,"Wild dog",Elephant,Hippo,"Cookson's wildebeest","Thornicroft's giraffe"}	1	2026-10-19 18:47:30.134	2026-10-19 18:47:30.134
3a530f56-c962-4442-89c4-c0f6e8d43094	ded914c3-9f36-4421-a54c-0f7fea77fc4d	best-time	Best Time to Visit	June to October (dry season). Many bush camps close from November to April.	{}	2	2026-10-19 18:47:30.139	2026-10-19 18:47:30.139
4ad05183-a220-4b95-a4eb-8d16ad893869	ded914c3-9f36-4421-a54c-0f7fea77fc4d	getting-there	Getting There	Fly to Mfuwe Airport from Lusaka, Lower Zambezi or Lilongwe (Malawi). Mfuwe is just outside the park.	{}	3	2026-10-19 18:47:30.144	2026-10-19 18:47:30.144
a581bae1-3067-4f7b-8823-3aa67be11e73	ded914c3-9f36-4421-a54c-0f7fea77fc4d	things-to-do	Things to Do	Popular activities in South Luangwa National Park:	{"Walking safaris","Night drives for leopard","Bush camp stays"}	4	2026-10-19 18:47:30.149	2026-10-19 18:47:30.149
cfdc490d-6935-464f-8733-6547d0f8b15d	94244faf-8d2a-4665-b21d-868592ce4f6d	overview	Lower Zambezi National Park Overview	Lower Zambezi National Park covers about 4,092 km² on the north bank of the Zambezi, opposite Zimbabwe's Mana Pools. It was declared a national park in 1983; before that it was a private reserve for Zambia's president.	{"Area: about 4,092 km²","National park since 1983","Opposite Mana Pools (Zimbabwe)","Served by Jeki airstrip"}	0	2026-10-19 18:47:30.154	2026-10-19 18:47:30.154
e46d4536-5b69-4cf7-b733-3be64945bdeb	94244faf-8d2a-4665-b21d-868592ce4f6d	wildlife	Wildlife	Elephant herds cross between the river islands, with buffalo, lion, leopard and abundant hippo and crocodile.	{Elephant,Buffalo,Lion,Leopard,Hippo,"Nile crocodile","Wild dog"}	1	2026-10-19 18:47:30.159	2026-10-19 18:47:30.159
b86ee7bb-e2f1-465a-b99b-72ee51207b2b	94244faf-8d2a-4665-b21d-868592ce4f6d	best-time	Best Time to Visit	June to October.	{}	2	2026-10-19 18:47:30.164	2026-10-19 18:47:30.164
287b1a16-cab4-4a67-af47-78fa169781d4	94244faf-8d2a-4665-b21d-868592ce4f6d	getting-there	Getting There	Scheduled flights from Lusaka to Jeki or Royal airstrips. There are no paved roads in the park.	{}	3	2026-10-19 18:47:30.168	2026-10-19 18:47:30.168
82d557ae-50b8-47b8-9e9b-e0be75477699	94244faf-8d2a-4665-b21d-868592ce4f6d	things-to-do	Things to Do	Popular activities in Lower Zambezi National Park:	{"Canoe safaris on the Zambezi","Boat cruises","Tiger fishing (catch and release)","Game drives"}	4	2026-10-19 18:47:30.174	2026-10-19 18:47:30.174
6cbccbd4-22fc-4596-b1ed-363cd1874289	f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3	overview	Etosha National Park Overview	Etosha National Park covers about 22,270 km² of northern Namibia. It was proclaimed a game reserve in March 1907 and became a national park in 1967. The Etosha Pan, a salt pan of about 4,760 km², takes up nearly a quarter of the park.	{"Area: about 22,270 km²","Proclaimed: 1907","Etosha Pan: about 4,760 km²","Main rest camps: Okaukuejo, Halali and Namutoni"}	0	2026-10-19 18:47:30.179	2026-10-19 18:47:30.179
869cda95-b90e-4948-9519-737768179dd2	f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3	wildlife	Wildlife	Considered one of the world’s most important black rhino strongholds. In the dry season animals queue at floodlit waterholes in front of the rest camps.	{"Black rhino",Lion,Elephant,Giraffe,Springbok,Gemsbok,"Black-faced impala"}	1	2026-10-19 18:47:30.184	2026-10-19 18:47:30.184
9558e709-98a3-4a4c-b52e-d9f816abeb49	f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3	best-time	Best Time to Visit	May to October, when wildlife gathers at the waterholes.	{}	2	2026-10-19 18:47:30.189	2026-10-19 18:47:30.189
36e34470-30f3-42a7-93cb-4131231fb35e	f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3	getting-there	Getting There	About 4 to 5 hours by tar road from Windhoek to Andersson Gate. Ideal for self-drive.	{}	3	2026-10-19 18:47:30.195	2026-10-19 18:47:30.195
8eb8f99e-434b-4d88-83df-eb94e394e6ce	f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3	things-to-do	Things to Do	Popular activities in Etosha National Park:	{"Self-drive game viewing","Floodlit waterhole watching at night","Guided drives"}	4	2026-10-19 18:47:30.2	2026-10-19 18:47:30.2
52725fcd-d84f-412d-803b-ab908b2e77fa	5489d3fd-9970-4016-a50b-75cefb2e8949	overview	Sossusvlei Overview	Sossusvlei is a clay pan surrounded by towering red dunes in the southern Namib Desert, inside Namib-Naukluft National Park. The Namib Sand Sea was inscribed as a UNESCO World Heritage Site in 2013.	{"Inside Namib-Naukluft National Park","Namib Sand Sea: UNESCO World Heritage Site","Big Daddy dune: about 325 m","Dune 45: about 80 m, 45 km past Sesriem gate"}	0	2026-10-19 18:47:30.205	2026-10-19 18:47:30.205
0ff33536-af0a-466f-b2a8-0148a876d7d3	5489d3fd-9970-4016-a50b-75cefb2e8949	wildlife	Wildlife	Desert-adapted species such as oryx, springbok and ostrich.	{Oryx,Springbok,Ostrich,"Black-backed jackal"}	1	2026-10-19 18:47:30.213	2026-10-19 18:47:30.213
a87908d3-164c-4dcb-af95-406aef1ac2c1	5489d3fd-9970-4016-a50b-75cefb2e8949	best-time	Best Time to Visit	May to September for cooler days. Arrive at sunrise for the best light on the dunes.	{}	2	2026-10-19 18:47:30.218	2026-10-19 18:47:30.218
fd7195d0-aaa1-4c12-ae2e-94df6d54edd7	5489d3fd-9970-4016-a50b-75cefb2e8949	getting-there	Getting There	About 5 hours by road from Windhoek to Sesriem gate, then 60 km of tar road to the dunes.	{}	3	2026-10-19 18:47:30.223	2026-10-19 18:47:30.223
6a850294-6bc3-422b-be85-a88977d15825	5489d3fd-9970-4016-a50b-75cefb2e8949	things-to-do	Things to Do	Popular activities in Sossusvlei:	{"Climb Dune 45 or Big Daddy at sunrise","Walk to Deadvlei","Sesriem Canyon","Scenic flights and balloon rides"}	4	2026-10-19 18:47:30.229	2026-10-19 18:47:30.229
75457ce9-914b-4129-afd6-28d156868edf	28c217ab-298b-4a38-af72-ba7233b2da7c	overview	Hwange National Park Overview	Hwange is Zimbabwe's largest national park at about 14,651 km², between Bulawayo and Victoria Falls. It was founded as a game reserve in 1928 and became a national park in 1961. Many pans are kept full by pumped water in the dry season.	{"Area: about 14,651 km²","Game reserve 1928, national park 1961","Pumped waterholes such as Nyamandlovu Pan","Home of Cecil the lion (killed 2015)"}	0	2026-10-19 18:47:30.234	2026-10-19 18:47:30.234
02b63c02-a718-4557-9127-3bc05d669144	28c217ab-298b-4a38-af72-ba7233b2da7c	wildlife	Wildlife	One of Africa’s largest elephant populations, plus lion, wild dog, sable and roan antelope.	{Elephant,Lion,"Wild dog",Buffalo,"Sable antelope","Roan antelope"}	1	2026-10-19 18:47:30.24	2026-10-19 18:47:30.24
6062bd38-706d-4706-ad30-fbc516a8b204	28c217ab-298b-4a38-af72-ba7233b2da7c	best-time	Best Time to Visit	July to October, when elephants crowd the waterholes.	{}	2	2026-10-19 18:47:30.246	2026-10-19 18:47:30.246
4fa0634e-231a-421f-812f-f57173a2cda7	28c217ab-298b-4a38-af72-ba7233b2da7c	getting-there	Getting There	About 2 hours by road from Victoria Falls, or light-aircraft flights to camp airstrips.	{}	3	2026-10-19 18:47:30.251	2026-10-19 18:47:30.251
b354bc43-e6b8-48aa-bfa1-2ed762979b71	28c217ab-298b-4a38-af72-ba7233b2da7c	things-to-do	Things to Do	Popular activities in Hwange National Park:	{"Game drives at the pans","Walking safaris","Hide sits at waterholes"}	4	2026-10-19 18:47:30.257	2026-10-19 18:47:30.257
8d3cb5e8-b736-44dd-9f27-592b2ac6225b	03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e	overview	Mana Pools National Park Overview	Mana Pools National Park covers about 2,196 km² of the Zambezi floodplain. 'Mana' means 'four' in Shona, after the four large pools left by the river. Together with the Sapi and Chewore Safari Areas it was inscribed as a UNESCO World Heritage Site in 1984.	{"Area: about 2,196 km²","UNESCO World Heritage Site since 1984","Name means 'four (pools)' in Shona"}	0	2026-10-19 18:47:30.263	2026-10-19 18:47:30.263
f1f6ee43-70f4-4132-9962-f90ec376ee1f	03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e	wildlife	Wildlife	Elephants that stand on their hind legs to reach acacia pods, plus wild dog, lion, buffalo and large hippo numbers.	{Elephant,"Wild dog",Lion,Buffalo,Hippo,Eland}	1	2026-10-19 18:47:30.268	2026-10-19 18:47:30.268
a9f8dee8-bc94-4c63-9f3c-1ed56e0ee0c1	03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e	best-time	Best Time to Visit	July to October. The park is largely inaccessible in the rainy season.	{}	2	2026-10-19 18:47:30.274	2026-10-19 18:47:30.274
b6630df0-0ac3-459b-a986-9f2052fb7129	03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e	getting-there	Getting There	Charter flights from Harare or Victoria Falls to Mana Pools airstrip, or a long 4x4 drive from Harare.	{}	3	2026-10-19 18:47:30.279	2026-10-19 18:47:30.279
2d7fc96c-5e68-4ec2-af09-c9086d24c7bf	03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e	things-to-do	Things to Do	Popular activities in Mana Pools National Park:	{"Walking safaris","Canoe safaris on the Zambezi","Game drives"}	4	2026-10-19 18:47:30.285	2026-10-19 18:47:30.285
960406d6-477d-460b-aa8c-a1c2938f6b1b	af4fedbb-bf03-4c54-96d0-bab67ca6dc19	overview	Victoria Falls Overview	Victoria Falls, Mosi-oa-Tunya ('the smoke that thunders'), is about 1,708 m wide and 108 m high, on the Zambezi between Zimbabwe and Zambia. It was inscribed as a UNESCO World Heritage Site in 1989. The town of Victoria Falls (Zimbabwe) and Livingstone (Zambia) are the bases for visits.	{"Width: about 1,708 m; height: about 108 m","UNESCO World Heritage Site since 1989","Peak flow February to May (highest in April)","Lowest flow around November"}	0	2026-10-19 18:47:30.295	2026-10-19 18:47:30.295
ee2b02f3-1ec8-49f1-870c-e9996e90bf6b	af4fedbb-bf03-4c54-96d0-bab67ca6dc19	wildlife	Wildlife	The surrounding national parks have elephant, buffalo and hippo, and the gorges host raptors such as Taita falcon.	{Elephant,Buffalo,Hippo,"Taita falcon"}	1	2026-10-19 18:47:30.303	2026-10-19 18:47:30.303
d49ca23f-e6d8-4d88-be7b-34fca7326983	af4fedbb-bf03-4c54-96d0-bab67ca6dc19	best-time	Best Time to Visit	February to May for maximum spray; September to December for clearer views and Devil’s Pool on the Zambian side.	{}	2	2026-10-19 18:47:30.313	2026-10-19 18:47:30.313
fc46d2d9-f59a-41a3-a2e7-e142322133a9	af4fedbb-bf03-4c54-96d0-bab67ca6dc19	getting-there	Getting There	Fly to Victoria Falls Airport (Zimbabwe) or Livingstone (Zambia). Kasane in Botswana is about 80 km away.	{}	3	2026-10-19 18:47:30.319	2026-10-19 18:47:30.319
16e55f5d-ee31-41e9-beed-273684a93101	af4fedbb-bf03-4c54-96d0-bab67ca6dc19	things-to-do	Things to Do	Popular activities in Victoria Falls:	{"Walk the rainforest trail","Swim in Devil's Pool (Sep–Dec)","Sunset cruise on the Zambezi","White-water rafting","Helicopter flight"}	4	2026-10-19 18:47:30.325	2026-10-19 18:47:30.325
2844ceb2-0464-4a04-8ed8-f49cad041b14	023588d3-884a-4486-a987-5e9c7e9c015c	overview	Volcanoes National Park Overview	Volcanoes National Park protects about 160 km² of rainforest and bamboo on five of the eight Virunga volcanoes: Karisimbi, Bisoke, Muhabura, Gahinga and Sabyinyo. Created in 1925, it was the first national park in Africa. Dian Fossey founded the Karisoke Research Centre here in 1967.	{"Area: about 160 km²","Established: 1925 (Africa’s first national park)","Karisoke Research Centre founded 1967","Gateway town: Musanze"}	0	2026-10-19 18:47:30.331	2026-10-19 18:47:30.331
d754a97e-2274-4ed1-92b4-87dd8068ca58	023588d3-884a-4486-a987-5e9c7e9c015c	wildlife	Wildlife	Habituated mountain gorilla families and the endangered golden monkey.	{"Mountain gorilla","Golden monkey",Buffalo,"Black-fronted duiker"}	1	2026-10-19 18:47:30.336	2026-10-19 18:47:30.336
f997d160-521a-4537-b053-14e614446a3f	023588d3-884a-4486-a987-5e9c7e9c015c	best-time	Best Time to Visit	June to September and December to February (drier months). Treks run all year.	{}	2	2026-10-19 18:47:30.341	2026-10-19 18:47:30.341
840a7549-6365-4e03-9163-7810b95fabb3	023588d3-884a-4486-a987-5e9c7e9c015c	getting-there	Getting There	About 2.5 hours by road from Kigali to Musanze and the park headquarters at Kinigi.	{}	3	2026-10-19 18:47:30.346	2026-10-19 18:47:30.346
dd9dca25-e608-41dc-a518-00b92920c089	023588d3-884a-4486-a987-5e9c7e9c015c	things-to-do	Things to Do	Popular activities in Volcanoes National Park:	{"Mountain gorilla trekking (permit required)","Golden monkey tracking","Hike to Dian Fossey's grave","Climb Mount Bisoke"}	4	2026-10-19 18:47:30.351	2026-10-19 18:47:30.351
da286970-28e0-4eb1-88fa-116141ddf759	2239a52a-9f27-4df0-89e9-525e9622c3fc	overview	Akagera National Park Overview	Akagera National Park covers about 1,122 km² of savannah, lakes and papyrus swamp in eastern Rwanda. It was established in 1934 and has been managed by African Parks with the Rwanda Development Board since 2010. Lions were reintroduced in 2015 and rhinos in 2017 and 2021, restoring the Big Five.	{"Area: about 1,122 km²","Established: 1934","Managed by African Parks since 2010","Lions back since 2015; rhinos since 2017"}	0	2026-10-19 18:47:30.357	2026-10-19 18:47:30.357
ca4c56dd-4b5f-4f1e-b968-5e0ea3687e72	2239a52a-9f27-4df0-89e9-525e9622c3fc	wildlife	Wildlife	Rwanda’s only Big Five park, with lakes such as Ihema full of hippo and crocodile.	{Lion,"Black rhino","White rhino",Elephant,Giraffe,Hippo,Buffalo}	1	2026-10-19 18:47:30.363	2026-10-19 18:47:30.363
1f544964-9ee5-44f3-9174-c91d9f395638	2239a52a-9f27-4df0-89e9-525e9622c3fc	best-time	Best Time to Visit	June to September.	{}	2	2026-10-19 18:47:30.368	2026-10-19 18:47:30.368
3f50b266-1dae-4020-9c87-8e9f7463413f	2239a52a-9f27-4df0-89e9-525e9622c3fc	getting-there	Getting There	About 2.5 hours by road from Kigali.	{}	3	2026-10-19 18:47:30.372	2026-10-19 18:47:30.372
1c87632a-480c-4125-9002-3e8110db2729	2239a52a-9f27-4df0-89e9-525e9622c3fc	things-to-do	Things to Do	Popular activities in Akagera National Park:	{"Game drives","Boat trip on Lake Ihema","Night drives","Combine with gorilla trekking"}	4	2026-10-19 18:47:30.378	2026-10-19 18:47:30.378
8098ee8d-5df1-4d2c-86dd-c46b1ead522b	4e44e6c3-0fce-41a7-8684-828cb99608d3	overview	Zambia Overview	Zambia is the home of the walking safari. South Luangwa has some of the best leopard viewing in Africa, the Lower Zambezi offers canoe safaris past elephant herds, and Victoria Falls thunders on the border with Zimbabwe. Camps are small and owner-run, so it feels wild and uncrowded.	{"Daily safari rates: $260 to $910 per day","High season: August to October"}	0	2026-10-19 18:47:46.979	2026-10-19 18:47:46.979
4226790c-2bfe-47a6-bf31-d27e849d4d48	4e44e6c3-0fce-41a7-8684-828cb99608d3	best-time	Best Time to Visit	June to October (Dry season)	{}	1	2026-10-19 18:47:47	2026-10-19 18:47:47
65cde400-d4fd-4102-8a15-ade4b750fada	4e44e6c3-0fce-41a7-8684-828cb99608d3	getting-there	Getting There	Fly into Lusaka or Livingstone, then take scheduled light-aircraft flights to Mfuwe (South Luangwa) or the Lower Zambezi airstrips.	{"Main airports: Kenneth Kaunda International (Lusaka), Harry Mwanga Nkumbula International (Livingstone)"}	2	2026-10-19 18:47:47.009	2026-10-19 18:47:47.009
8d9295c0-2c40-4aa5-82db-2569867fa2f1	50eafda4-e46e-4452-bc07-dc24cf627d25	overview	Namibia Overview	Namibia is a land of vast deserts, towering red dunes and wide open skies. Etosha National Park is one of the easiest places in Africa to see rhino and lion at waterholes, while Sossusvlei and the Skeleton Coast offer some of the most striking landscapes on Earth. Good roads make it ideal for self-drive safaris.	{"Daily safari rates: $150 to $720 per day","High season: July to October"}	0	2026-10-19 18:47:47.019	2026-10-19 18:47:47.019
0b82a4e1-e689-4472-8af9-8b7b3f4861c2	50eafda4-e46e-4452-bc07-dc24cf627d25	best-time	Best Time to Visit	May to October	{}	1	2026-10-19 18:47:47.025	2026-10-19 18:47:47.025
dbd9a572-c154-42f9-af13-3f2840370788	50eafda4-e46e-4452-bc07-dc24cf627d25	getting-there	Getting There	Fly into Windhoek. Most visitors rent a 4x4 and self-drive on well-maintained gravel and tar roads; fly-in safaris use light aircraft.	{"Main airports: Hosea Kutako International (Windhoek)"}	2	2026-10-19 18:47:47.03	2026-10-19 18:47:47.03
cdf3b00f-a98c-4fe4-a310-52a9c1b05a7c	9e6b195c-aadb-4141-81c2-eb378188d1f6	overview	Uganda Overview	Uganda is the best place in Africa to combine mountain gorilla trekking with a classic savannah safari. Bwindi Impenetrable Forest is home to almost half the world's mountain gorillas, Kibale has the region's best chimpanzee tracking, and Queen Elizabeth and Murchison Falls parks offer lions, elephants and Nile boat trips.	{"Daily safari rates: $180 to $820 per day","High season: June to September and December to February"}	0	2026-10-19 18:47:47.039	2026-10-19 18:47:47.039
2a4790e9-80f0-4299-b3b0-cb7dd41f6343	9e6b195c-aadb-4141-81c2-eb378188d1f6	best-time	Best Time to Visit	June to August and December to February	{}	1	2026-10-19 18:47:47.045	2026-10-19 18:47:47.045
1d7ee099-e679-470b-bf23-1dfbb2abceeb	9e6b195c-aadb-4141-81c2-eb378188d1f6	getting-there	Getting There	Fly into Entebbe. Parks are reached by road with a driver-guide or by domestic flights to Kihihi, Kisoro, Kasese and Murchison Falls airstrips.	{"Main airports: Entebbe International"}	2	2026-10-19 18:47:47.05	2026-10-19 18:47:47.05
581a9169-be0d-437d-b16d-931e1f49302b	f7cbafbd-feed-4000-bbe4-309688c93bdb	overview	Zimbabwe Overview	Zimbabwe has superb guiding and wild, uncrowded parks. Hwange is famous for its huge elephant herds, Mana Pools offers walking and canoeing along the Zambezi, and Victoria Falls is one of the natural wonders of the world.	{"Daily safari rates: $170 to $780 per day","High season: August to October"}	0	2026-10-19 18:47:47.059	2026-10-19 18:47:47.059
7ed4807b-1901-4787-9f1f-b4c6ce6f20da	f7cbafbd-feed-4000-bbe4-309688c93bdb	best-time	Best Time to Visit	July to October	{}	1	2026-10-19 18:47:47.065	2026-10-19 18:47:47.065
a486e997-9896-4263-b30b-088a44103654	f7cbafbd-feed-4000-bbe4-309688c93bdb	getting-there	Getting There	Fly into Victoria Falls for Hwange and the falls, or Harare for Mana Pools. Light-aircraft charters link the main parks.	{"Main airports: Victoria Falls International, Robert Gabriel Mugabe International (Harare)"}	2	2026-10-19 18:47:47.069	2026-10-19 18:47:47.069
8be4a791-9f80-40c8-882f-c06ee785d82c	75ac6bb7-c754-48e5-8bee-6d3c14aca686	overview	Rwanda Overview	Rwanda is small, safe and easy to travel. Volcanoes National Park offers world-class mountain gorilla trekking, Nyungwe Forest protects chimpanzees and other primates, and Akagera National Park has been restored as a Big Five savannah reserve.	{"Daily safari rates: $250 to $1,500 per day","High season: June to September"}	0	2026-10-19 18:47:47.079	2026-10-19 18:47:47.079
819a9b22-ca64-419d-bcef-d57081a3c378	75ac6bb7-c754-48e5-8bee-6d3c14aca686	best-time	Best Time to Visit	June to September and December to February	{}	1	2026-10-19 18:47:47.084	2026-10-19 18:47:47.084
dee6b7b8-bd34-4b9c-9220-21773d496b56	75ac6bb7-c754-48e5-8bee-6d3c14aca686	getting-there	Getting There	Fly into Kigali. Volcanoes National Park and Akagera are each about 2.5 hours by road.	{"Main airports: Kigali International"}	2	2026-10-19 18:47:47.089	2026-10-19 18:47:47.089
\.


--
-- Data for Name: destinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.destinations (id, name, slug, country, type, description, featured_image_url, latitude, longitude, best_time_to_visit, wildlife_present, created_at, best_time_summary, daily_rates, high_season, popularity_rank, rating, review_count) FROM stdin;
2c680e59-6b5b-4f73-81bd-62ea1f384ed4	Botswana	botswana	Botswana	COUNTRY	In and around the Okavango Delta, which can be discovered on an unforgettable game drive or mokoro trip. Elsewhere, Chobe National Park, Moremi Game Reserve and the Central Kalahari Game Reserve are world-class safari destinations, combining stunning landscapes with exceptional wildlife. Botswana is also excellent for self-drive safaris.	https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80	-22.33	24.68	\N	\N	2026-09-28 16:36:52.018	April to October (Okavango, Moremi, Chobe), December to May (Central Kalahari, Khutse, Kgalagadi)	$193 to $878 per day	July to October (Only Chobe gets crowded)	2	4.8	372
bda958ca-0181-496c-9a9a-fa3f108f7e52	Kenya	kenya	Kenya	COUNTRY	Regardless of whether this is your first time on safari or you're a safari veteran, Kenya is a fantastic place to go looking for wildlife. The Masai Mara National Reserve and surrounding conservancies get all the attention for big cat sightings and the annual wildebeest migration. But Kenya has numerous world-class parks to explore, and it's also an excellent place to relax on a beach holiday once your safari is over.	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	-0.02	37.91	\N	\N	2026-09-28 16:36:51.978	June to October and January and February	$173 to $696 per day	July to October and December to March	3	4.6	1752
4e44e6c3-0fce-41a7-8684-828cb99608d3	Zambia	zambia	Zambia	COUNTRY	Zambia is the home of the walking safari. South Luangwa has some of the best leopard viewing in Africa, the Lower Zambezi offers canoe safaris past elephant herds, and Victoria Falls thunders on the border with Zimbabwe. Camps are small and owner-run, so it feels wild and uncrowded.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-13.13	27.85	\N	\N	2026-10-19 18:15:58.523	June to October (Dry season)	$260 to $910 per day	August to October	4	4.8	284
50eafda4-e46e-4452-bc07-dc24cf627d25	Namibia	namibia	Namibia	COUNTRY	Namibia is a land of vast deserts, towering red dunes and wide open skies. Etosha National Park is one of the easiest places in Africa to see rhino and lion at waterholes, while Sossusvlei and the Skeleton Coast offer some of the most striking landscapes on Earth. Good roads make it ideal for self-drive safaris.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-22.96	18.49	\N	\N	2026-10-19 18:15:58.535	May to October	$150 to $720 per day	July to October	6	4.7	498
f8889113-3b88-46c0-ada0-8fb0dd4b2da4	Ngorongoro Crater	ngorongoro-crater	Tanzania	GAME_RESERVE	The world’s largest intact volcanic caldera — 610m deep, 19km wide and 264km² in area — encloses a permanent population of roughly 25,000 large mammals. Ngorongoro offers possibly the easiest Big Five viewing in East Africa, including one of the densest black-rhino populations on the continent, all inside the UNESCO-listed Ngorongoro Conservation Area.	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	-3.1833	35.5	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "EXCELLENT", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Black Rhino", "Lion", "Elephant", "Hippo", "Flamingo", "Hyena"]	2026-09-26 17:07:27.762	\N	\N	\N	\N	\N	0
5459dbb7-8608-490b-8671-c3190be6b1c8	Tanzania	tanzania	Tanzania	COUNTRY	Tanzania, with its three safari circuits, is one of Africa's top wildlife destinations. The popular Northern circuit incorporates bucket-list landmarks such as Serengeti National Park, Ngorongoro Crater and Mt Kilimanjaro. Repeat visitors might prefer the remote wilderness vibe of the Southern or Western circuits. For some beach time, the 'Spice Island' of Zanzibar is only a short flight away.	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	-6.37	34.89	\N	\N	2026-09-28 16:36:51.936	June to October; January to February (For wildebeest calving)	$229 to $659 per day	July to March (North), June to October (South and West)	1	4.8	2172
16843c98-d29a-422a-b0d2-474801ace36a	South Africa	south-africa	South Africa	COUNTRY	South Africa is one of Africa's great wildlife destinations. Vast Kruger National Park has an abundance of animals and is one of the continent's iconic attractions. For outdoor adventure, the Blyde River Canyon is the third-largest canyon on the planet, and the jagged peaks of the Drakensberg Mountains punch into the sky. Cape Town hums with an urban beat and is fringed by white sandy beaches.	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	-30.56	22.94	\N	\N	2026-09-28 16:36:52.063	May to September (Most parks), October to March (Cape Town)	$187 to $917 per day	October to March (Crowded during school holidays)	5	4.6	1320
9e6b195c-aadb-4141-81c2-eb378188d1f6	Uganda	uganda	Uganda	COUNTRY	Uganda is the best place in Africa to combine mountain gorilla trekking with a classic savannah safari. Bwindi Impenetrable Forest is home to almost half the world's mountain gorillas, Kibale has the region's best chimpanzee tracking, and Queen Elizabeth and Murchison Falls parks offer lions, elephants and Nile boat trips.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	1.37	32.29	\N	\N	2026-10-19 18:15:58.541	June to August and December to February	$180 to $820 per day	June to September and December to February	7	4.7	642
55511666-cf14-421a-b773-eeee05ab308f	Masai Mara National Reserve	masai-mara-national-reserve	Kenya	NATIONAL_PARK	Kenya’s flagship reserve covers 1,510km² of open savannah in the Great Rift Valley and delivers what many consider the finest big-cat viewing in Africa. Between July and October the Great Migration pours across the Mara River from the Serengeti, creating the most dramatic wildlife spectacle on the continent.	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	-1.4931	35.1439	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "GOOD", "jan": "GOOD", "jul": "EXCELLENT", "jun": "GOOD", "mar": "GOOD", "may": "FAIR", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Lion", "Leopard", "Elephant", "Rhino", "Buffalo", "Giraffe"]	2026-09-26 17:07:27.756	\N	\N	\N	\N	\N	0
75ac6bb7-c754-48e5-8bee-6d3c14aca686	Rwanda	rwanda	Rwanda	COUNTRY	Rwanda is small, safe and easy to travel. Volcanoes National Park offers world-class mountain gorilla trekking, Nyungwe Forest protects chimpanzees and other primates, and Akagera National Park has been restored as a Big Five savannah reserve.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	-1.94	29.87	\N	\N	2026-10-19 18:15:58.554	June to September and December to February	$250 to $1,500 per day	June to September	9	4.8	356
36fc4915-b27d-4bc3-ae09-b527efe45a77	Tarangire National Park	tarangire-national-park	Tanzania	NATIONAL_PARK	Famous for its ancient baobab trees and some of the largest elephant herds in Tanzania, which gather along the Tarangire River in the dry season.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-4.16	36.09	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Lion", "Leopard", "Buffalo", "Giraffe"]	2026-10-19 18:15:58.561	\N	\N	\N	\N	\N	0
3a24c00c-fa37-4c35-a727-30a288f90129	Lake Manyara National Park	lake-manyara-national-park	Tanzania	NATIONAL_PARK	A compact park below the Rift Valley escarpment, known for groundwater forest, flamingos on the soda lake and tree-climbing lions.	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	-3.53	35.82	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Giraffe", "Baboon", "Flamingo", "Lion"]	2026-10-19 18:15:58.57	\N	\N	\N	\N	\N	0
fc1d1251-15e0-4dea-bf78-efbe434a914b	Nyerere National Park	nyerere-national-park	Tanzania	NATIONAL_PARK	Africa's largest protected area, formerly the Selous Game Reserve, offering boat safaris on the Rufiji River and excellent African wild dog sightings.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-8.8	37.8	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Wild dog", "Elephant", "Lion", "Hippo", "Buffalo"]	2026-10-19 18:15:58.577	\N	\N	\N	\N	\N	0
e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b	Ruaha National Park	ruaha-national-park	Tanzania	NATIONAL_PARK	A remote and rugged park with very large lion prides, big elephant numbers and few visitors, centred on the Great Ruaha River.	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	-7.67	34.93	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Lion", "Elephant", "Kudu", "Wild dog", "Leopard"]	2026-10-19 18:15:58.585	\N	\N	\N	\N	\N	0
febe8ce7-8ff4-4bec-9a8a-df0057411bb1	Gombe National Park	gombe-national-park	Tanzania	NATIONAL_PARK	A small forested park on Lake Tanganyika where Jane Goodall began her chimpanzee research. Chimp trekking is the main activity.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	-4.67	29.63	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Chimpanzee", "Baboon", "Red colobus"]	2026-10-19 18:15:58.591	\N	\N	\N	\N	\N	0
f7cfe70b-7822-4458-950b-e0dca896f7a8	Katavi National Park	katavi-national-park	Tanzania	NATIONAL_PARK	One of Tanzania's wildest parks, where huge buffalo herds and crowded hippo pools draw predators in the late dry season.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-6.85	31.25	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "GOOD", "mar": "FAIR", "may": "FAIR", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Buffalo", "Hippo", "Lion", "Crocodile", "Elephant"]	2026-10-19 18:15:58.598	\N	\N	\N	\N	\N	0
c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e	Zanzibar	zanzibar	Tanzania	ISLAND	The 'Spice Island' off Tanzania's coast, with white beaches, the historic Stone Town and Jozani Forest's red colobus monkeys. The classic beach finish to a safari.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-6.16	39.2	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Red colobus", "Dolphin", "Sea turtle"]	2026-10-19 18:15:58.605	\N	\N	\N	\N	\N	0
084d55cf-f2d5-4f56-97ca-8ac00cb4087c	Amboseli National Park	amboseli-national-park	Kenya	NATIONAL_PARK	Best known for big-tusked elephants framed by Mount Kilimanjaro, with open plains and swamps that make wildlife easy to spot.	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	-2.65	37.26	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Lion", "Buffalo", "Hippo", "Zebra"]	2026-10-19 18:15:58.611	\N	\N	\N	\N	\N	0
90fca831-5d85-4cdf-bbe5-b0049b30bafd	Lake Nakuru National Park	lake-nakuru-national-park	Kenya	NATIONAL_PARK	A Rift Valley soda lake and rhino sanctuary, one of the best places in Kenya to see both black and white rhino.	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	-0.37	36.09	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Rhino", "Flamingo", "Lion", "Rothschild giraffe", "Leopard"]	2026-10-19 18:15:58.618	\N	\N	\N	\N	\N	0
29a7d6bf-7860-46a6-900a-05f01a4e2e96	Samburu National Reserve	samburu-national-reserve	Kenya	GAME_RESERVE	A semi-arid reserve along the Ewaso Ng'iro River, home to the 'Samburu Special Five' found only in northern Kenya.	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	0.57	37.53	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Grevy zebra", "Reticulated giraffe", "Gerenuk", "Leopard", "Elephant"]	2026-10-19 18:15:58.624	\N	\N	\N	\N	\N	0
0a5b6408-4b91-4f8d-846e-b02dcdd6cc16	Tsavo East National Park	tsavo-east-national-park	Kenya	NATIONAL_PARK	One of Kenya's largest parks, famous for its red-dust elephants and easy access from the coast at Mombasa.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-2.76	38.77	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Red elephant", "Lion", "Buffalo", "Lesser kudu"]	2026-10-19 18:15:58.638	\N	\N	\N	\N	\N	0
97102495-84e6-436a-8eb1-e7edf0227c86	Chobe National Park	chobe-national-park	Botswana	NATIONAL_PARK	Home to one of the largest elephant populations on Earth, best seen from a boat on the Chobe River at sunset.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-18.6	24.5	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Buffalo", "Lion", "Hippo", "Sable"]	2026-10-19 18:15:58.646	\N	\N	\N	\N	\N	0
d1496a97-dfd3-49d9-b792-8cb74bd520ad	Okavango Delta	okavango-delta	Botswana	NATURAL_WONDER	A vast inland delta and UNESCO World Heritage Site where floodwaters create a maze of channels explored by mokoro canoe, on foot and by vehicle.	https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80	-19.3	22.9	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Lion", "Leopard", "Wild dog", "Elephant", "Red lechwe"]	2026-10-19 18:15:58.653	\N	\N	\N	\N	\N	0
d41df8c6-bfb3-4dbe-8ecb-85318acd4631	Moremi Game Reserve	moremi-game-reserve	Botswana	GAME_RESERVE	The protected eastern heart of the Okavango Delta, combining water and dry land for some of the best predator viewing in Africa.	https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80	-19.2	23.4	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Wild dog", "Lion", "Leopard", "Elephant", "Buffalo"]	2026-10-19 18:15:58.659	\N	\N	\N	\N	\N	0
2f275b73-0b8f-4251-ba67-d2a69a046e07	Central Kalahari Game Reserve	central-kalahari-game-reserve	Botswana	GAME_RESERVE	An enormous, remote desert reserve that comes alive after summer rains, when springbok and gemsbok gather on fossil river valleys.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-22	23.5	{"apr": "EXCELLENT", "aug": "FAIR", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "FAIR", "jun": "FAIR", "mar": "EXCELLENT", "may": "GOOD", "nov": "GOOD", "oct": "FAIR", "sep": "FAIR"}	["Black-maned lion", "Cheetah", "Gemsbok", "Springbok", "Brown hyena"]	2026-10-19 18:15:58.666	\N	\N	\N	\N	\N	0
61c5a145-5f24-453d-bdfa-64f6723199a4	Makgadikgadi Pans National Park	makgadikgadi-pans-national-park	Botswana	NATIONAL_PARK	Huge salt pans with a zebra migration in the wet season and habituated meerkats in the dry season.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-20.7	25.2	{"apr": "EXCELLENT", "aug": "GOOD", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "EXCELLENT", "may": "GOOD", "nov": "GOOD", "oct": "FAIR", "sep": "FAIR"}	["Zebra", "Meerkat", "Brown hyena", "Flamingo"]	2026-10-19 18:15:58.672	\N	\N	\N	\N	\N	0
ea4950a4-027b-4b94-8cfb-e486a8845631	Nxai Pan National Park	nxai-pan-national-park	Botswana	NATIONAL_PARK	Grassy fossil pans and the famous Baines' Baobabs, at their best in the green season when plains game arrive.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-19.9	24.8	{"apr": "EXCELLENT", "aug": "FAIR", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "FAIR", "jun": "FAIR", "mar": "EXCELLENT", "may": "GOOD", "nov": "GOOD", "oct": "FAIR", "sep": "FAIR"}	["Zebra", "Springbok", "Lion", "Cheetah"]	2026-10-19 18:15:58.679	\N	\N	\N	\N	\N	0
6d53a473-4153-4478-b4e2-87ca0e20a77b	Kruger National Park	kruger-national-park	South Africa	NATIONAL_PARK	South Africa's flagship park, almost two million hectares with excellent Big Five viewing, good roads and options from self-drive to luxury lodges.	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	-23.99	31.55	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["Lion", "Leopard", "Elephant", "Rhino", "Buffalo"]	2026-10-19 18:15:58.685	\N	\N	\N	\N	\N	0
ea1b85dc-d35f-4bcc-9ecc-7069996745f3	MalaMala Game Reserve	malamala-game-reserve	South Africa	GAME_RESERVE	A private reserve bordering Kruger, with unfenced boundaries, very exclusive traffic and outstanding leopard sightings.	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	-24.8	31.53	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["Leopard", "Lion", "Elephant", "Rhino", "Buffalo"]	2026-10-19 18:15:58.694	\N	\N	\N	\N	\N	0
7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc	Phinda Private Game Reserve	phinda-private-game-reserve	South Africa	GAME_RESERVE	A KwaZulu-Natal reserve with seven different habitats, known for cheetah and rhino conservation, close to the Indian Ocean coast.	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	-27.8	32.35	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["Cheetah", "Rhino", "Lion", "Elephant"]	2026-10-19 18:15:58.701	\N	\N	\N	\N	\N	0
325e3920-c657-4edb-9a36-bcdf9fde014f	Sabi Sand Nature Reserve	sabi-sand-nature-reserve	South Africa	NATURE_RESERVE	A group of private reserves next to Kruger, famous for relaxed leopards and luxury lodges with off-road game drives.	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	-24.85	31.45	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["Leopard", "Lion", "Elephant", "Rhino", "Buffalo"]	2026-10-19 18:15:58.708	\N	\N	\N	\N	\N	0
623aa1c3-0d50-4ead-bae3-e28f5ba253f2	Addo Elephant National Park	addo-elephant-national-park	South Africa	NATIONAL_PARK	A malaria-free park on the Eastern Cape, with more than 600 elephants and a marine section for whales and great white sharks.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-33.48	25.75	{"apr": "EXCELLENT", "aug": "EXCELLENT", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "EXCELLENT", "may": "EXCELLENT", "nov": "EXCELLENT", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Lion", "Buffalo", "Southern right whale"]	2026-10-19 18:15:58.721	\N	\N	\N	\N	\N	0
b15d842c-34ee-4d1c-a0a7-c9895fcb24dc	Bwindi Impenetrable National Park	bwindi-impenetrable-national-park	Uganda	NATIONAL_PARK	An ancient rainforest that protects nearly half of the world's mountain gorillas. Guided treks visit habituated gorilla families.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	-1.06	29.66	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "FAIR", "oct": "FAIR", "sep": "GOOD"}	["Mountain gorilla", "Chimpanzee", "Forest elephant", "L'Hoest monkey"]	2026-10-19 18:15:58.728	\N	\N	\N	\N	\N	0
9c2b179c-0f79-437d-b84d-30eee3da3313	Queen Elizabeth National Park	queen-elizabeth-national-park	Uganda	NATIONAL_PARK	Uganda's most visited savannah park, known for the Kazinga Channel boat trip and the tree-climbing lions of Ishasha.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	-0.2	29.9	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "FAIR", "oct": "FAIR", "sep": "GOOD"}	["Tree-climbing lion", "Hippo", "Elephant", "Chimpanzee", "Buffalo"]	2026-10-19 18:15:58.735	\N	\N	\N	\N	\N	0
cb4dd5d8-59b6-47da-ad56-324fb3c96662	Murchison Falls National Park	murchison-falls-national-park	Uganda	NATIONAL_PARK	Where the Nile forces through a 7-metre gorge. Game drives on the north bank and a boat trip to the base of the falls.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	2.28	31.8	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "FAIR", "oct": "FAIR", "sep": "GOOD"}	["Giraffe", "Elephant", "Lion", "Hippo", "Shoebill"]	2026-10-19 18:15:58.741	\N	\N	\N	\N	\N	0
ded914c3-9f36-4421-a54c-0f7fea77fc4d	South Luangwa National Park	south-luangwa-national-park	Zambia	NATIONAL_PARK	The birthplace of the walking safari, with dense wildlife along the Luangwa River and excellent night drives for leopard.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-13.08	31.8	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Leopard", "Lion", "Wild dog", "Thornicroft giraffe", "Hippo"]	2026-10-19 18:15:58.748	\N	\N	\N	\N	\N	0
94244faf-8d2a-4665-b21d-868592ce4f6d	Lower Zambezi National Park	lower-zambezi-national-park	Zambia	NATIONAL_PARK	A riverside park opposite Mana Pools, best explored by canoe and boat, with elephants crossing between the islands.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-15.4	29.6	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Hippo", "Buffalo", "Lion", "Crocodile"]	2026-10-19 18:15:58.754	\N	\N	\N	\N	\N	0
f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3	Etosha National Park	etosha-national-park	Namibia	NATIONAL_PARK	A huge salt pan surrounded by waterholes where rhino, lion and elephant gather in the dry season. Ideal for self-drive.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-18.85	16.33	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Black rhino", "Lion", "Elephant", "Springbok", "Giraffe"]	2026-10-19 18:15:58.76	\N	\N	\N	\N	\N	0
5489d3fd-9970-4016-a50b-75cefb2e8949	Sossusvlei	sossusvlei	Namibia	NATURAL_WONDER	The towering red dunes of the Namib Desert and the white clay pan of Deadvlei, among the most photographed landscapes in Africa.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-24.73	15.29	{"apr": "EXCELLENT", "aug": "EXCELLENT", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "EXCELLENT", "may": "EXCELLENT", "nov": "EXCELLENT", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Oryx", "Springbok", "Ostrich"]	2026-10-19 18:15:58.766	\N	\N	\N	\N	\N	0
28c217ab-298b-4a38-af72-ba7233b2da7c	Hwange National Park	hwange-national-park	Zimbabwe	NATIONAL_PARK	Zimbabwe's largest park, with tens of thousands of elephants drawn to pumped waterholes in the dry season.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-19	26.5	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "GOOD", "mar": "FAIR", "may": "FAIR", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Lion", "Wild dog", "Sable", "Buffalo"]	2026-10-19 18:15:58.772	\N	\N	\N	\N	\N	0
03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e	Mana Pools National Park	mana-pools-national-park	Zimbabwe	NATIONAL_PARK	A UNESCO site on the Zambezi floodplain known for walking safaris, canoeing and elephants standing on their hind legs to feed.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-15.75	29.4	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "GOOD", "mar": "FAIR", "may": "FAIR", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Wild dog", "Lion", "Hippo", "Eland"]	2026-10-19 18:15:58.778	\N	\N	\N	\N	\N	0
af4fedbb-bf03-4c54-96d0-bab67ca6dc19	Victoria Falls	victoria-falls	Zimbabwe	NATURAL_WONDER	One of the world's largest waterfalls, 'The Smoke that Thunders', on the Zambezi between Zimbabwe and Zambia.	https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1200&q=80	-17.92	25.86	{"apr": "EXCELLENT", "aug": "GOOD", "dec": "FAIR", "feb": "EXCELLENT", "jan": "GOOD", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "EXCELLENT", "may": "EXCELLENT", "nov": "FAIR", "oct": "FAIR", "sep": "FAIR"}	["Elephant", "Buffalo", "Hippo"]	2026-10-19 18:15:58.785	\N	\N	\N	\N	\N	0
f7cbafbd-feed-4000-bbe4-309688c93bdb	Zimbabwe	zimbabwe	Zimbabwe	COUNTRY	Zimbabwe has superb guiding and wild, uncrowded parks. Hwange is famous for its huge elephant herds, Mana Pools offers walking and canoeing along the Zambezi, and Victoria Falls is one of the natural wonders of the world.	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	-19.02	29.15	\N	\N	2026-10-19 18:15:58.547	July to October	$170 to $780 per day	August to October	8	4.7	231
12fe89f3-3a12-40a9-be90-ca793fd95384	Buffalo Springs National Reserve	buffalo-springs-national-reserve	Kenya	GAME_RESERVE	Samburu’s quieter neighbour across the river, with natural springs, palm groves and the same northern Kenyan wildlife.	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	0.53	37.6	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Elephant", "Lion", "Grevy zebra", "Oryx"]	2026-10-19 18:15:58.631	\N	\N	\N	\N	\N	0
badc1354-056a-478b-9e96-335674907dc5	Hluhluwe-iMfolozi Park	hluhluwe-imfolozi-park	South Africa	NATIONAL_PARK	Africa's oldest proclaimed reserve and the place where the white rhino was saved from extinction.	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	-28.22	31.95	{"apr": "GOOD", "aug": "EXCELLENT", "dec": "FAIR", "feb": "FAIR", "jan": "FAIR", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "FAIR", "may": "EXCELLENT", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["White rhino", "Black rhino", "Lion", "Elephant", "Buffalo"]	2026-10-19 18:15:58.714	\N	\N	\N	\N	\N	0
023588d3-884a-4486-a987-5e9c7e9c015c	Volcanoes National Park	volcanoes-national-park	Rwanda	NATIONAL_PARK	Bamboo-covered volcanoes in the Virunga range, where Dian Fossey studied mountain gorillas. Rwanda’s premier gorilla trekking park.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	-1.48	29.53	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["Mountain gorilla", "Golden monkey"]	2026-10-19 18:15:58.791	\N	\N	\N	\N	\N	0
2239a52a-9f27-4df0-89e9-525e9622c3fc	Akagera National Park	akagera-national-park	Rwanda	NATIONAL_PARK	Rwanda's savannah park, restored with reintroduced lions and rhinos to become a Big Five destination.	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	-1.88	30.72	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "GOOD", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "FAIR", "oct": "GOOD", "sep": "EXCELLENT"}	["Lion", "Rhino", "Elephant", "Giraffe", "Hippo"]	2026-10-19 18:15:58.798	\N	\N	\N	\N	\N	0
36f605b8-2d57-424e-9fd7-60c064fe054e	Serengeti National Park	serengeti-national-park	Tanzania	NATIONAL_PARK	The Serengeti is Tanzania’s oldest and most celebrated national park, a 14,750km² sea of grass immortalized in countless wildlife documentaries. It hosts the Great Migration — over 1.5 million wildebeest, 250,000 zebra and hundreds of thousands of gazelle on their annual circular trek — and boasts the highest lion density in Africa.	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	-2.3333	34.8333	{"apr": "FAIR", "aug": "EXCELLENT", "dec": "EXCELLENT", "feb": "EXCELLENT", "jan": "EXCELLENT", "jul": "EXCELLENT", "jun": "EXCELLENT", "mar": "GOOD", "may": "GOOD", "nov": "GOOD", "oct": "EXCELLENT", "sep": "EXCELLENT"}	["Lion", "Leopard", "Elephant", "Rhino", "Buffalo", "Cheetah", "Wildebeest"]	2026-09-26 17:07:27.745	\N	\N	\N	\N	\N	0
\.


--
-- Data for Name: experts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.experts (id, slug, name, country, review_count, biography, image_url, sort_order, created_at) FROM stdin;
615701cf-d3b4-4fc3-8c91-130497e6d1a3	stephen-bailey	Stephen Bailey	United Kingdom	318	Stephen is a travel writer and Africa expert who has spent the last decade exploring the continent, particularly focusing on East and Southern Africa.	https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80	0	2026-10-19 18:15:59.827
00220bfe-bda4-4c85-8513-e25875bf9344	harriet-akinyi	Harriet Akinyi	Kenya	245	Born and raised in Nairobi, Harriet has an intimate knowledge of Kenya and Tanzania's parks, and specializes in custom family safaris.	https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?auto=format&fit=crop&w=150&q=80	1	2026-10-19 18:15:59.834
596adc59-79c1-4c18-bfb8-33eb04af1d67	james-visser	James Visser	South Africa	189	A former game ranger, James now uses his expertise to design specialized photographic safaris across Botswana and South Africa.	https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80	2	2026-10-19 18:15:59.838
\.


--
-- Data for Name: inquiries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiries (id, traveler_id, tour_id, preferred_country, travel_date_start, travel_date_end, is_flexible_dates, adults_count, children_count, budget_per_person_usd, comfort_preference, custom_notes, is_broadcast, status, created_at, slot_id) FROM stdin;
44ffcf87-a7db-4740-a63d-5980846ab682	7925a103-ae62-471d-b09b-ddc4a2dcc42f	\N	Tanzania	\N	\N	t	2	0	2500	MID_RANGE	Test	t	ROUTED	2026-09-26 18:10:38.092	\N
\.


--
-- Data for Name: inquiry_leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.inquiry_leads (id, inquiry_id, operator_id, status, created_at) FROM stdin;
f285b8af-a5b1-45ee-9948-6e12cf046bee	44ffcf87-a7db-4740-a63d-5980846ab682	42b041e2-036b-4aa0-bbff-422050609f5b	DISPATCHED	2026-09-26 18:10:38.123
71de01b0-424d-4c60-bcd9-26508915d675	44ffcf87-a7db-4740-a63d-5980846ab682	786e8685-6f8c-4c7a-9856-885e39a7f030	DISPATCHED	2026-09-26 18:10:38.139
\.


--
-- Data for Name: media_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.media_assets (id, tour_id, filename, mime_type, size_bytes, data, alt_text, is_cover, sort_order, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, inquiry_lead_id, sender_id, content, attachment_urls, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, body, link, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: operators; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.operators (id, user_id, company_name, slug, logo_url, banner_url, country_of_origin, headquarters_address, registration_number, license_document_url, is_verified, verification_date, overview_text, year_established, price_tier, average_rating, total_reviews, created_at, offices_in, service_summary) FROM stdin;
786e8685-6f8c-4c7a-9856-885e39a7f030	830419b1-14d6-45c3-9bf9-d1f39c3e818f	Mara Wilderness Safaris	mara-wilderness-safaris	\N	\N	Kenya	Karen Road, Nairobi, Kenya	KE-MIN-39201	\N	t	2026-09-26 17:07:27.734	Authentic Kenyan safari experts guiding travelers through the Great Migration in Masai Mara, Amboseli elephant plains, and Lake Nakuru flamingos.	2015	LUXURY	4.95	62	2026-09-26 17:07:27.737	{Kenya}	\N
42b041e2-036b-4aa0-bbff-422050609f5b	9d1483f8-235f-4742-b1bb-baaeff166dfc	Kili Tanzanian Expeditions	kili-tanzanian-expeditions	\N	\N	Tanzania	Arusha Tourism Complex, Arusha, Tanzania	TZ-TOUR-84920	\N	t	2026-09-26 17:07:27.709	Premier locally owned safari operator specializing in high-end Big Five game drives, Ngorongoro Crater tours, and private tailor-made itineraries across Tanzania.	2012	MID_RANGE	5	1	2026-09-26 17:07:27.716	{Tanzania}	\N
2c2cd580-7109-4a21-ad9e-da9bde7941b5	3711fe75-62b2-43ba-82cf-79971ca2662b	Serengeti Eco Safaris 1791837249952	serengeti-eco-safaris-1791837249952-7507	\N	\N	Tanzania	\N	\N	\N	f	\N	\N	\N	MID_RANGE	0	0	2026-10-12 20:34:14.418	{Tanzania}	\N
761c2fbc-af79-47f1-9390-5aeb60179942	11919b2d-abb9-4106-9f79-13dcb480440e	Serengeti Eco Safaris 1791837299424	serengeti-eco-safaris-1791837299424-2678	\N	\N	Tanzania	\N	\N	\N	f	\N	\N	\N	MID_RANGE	0	0	2026-10-12 20:34:59.874	{Tanzania}	\N
885fdd7f-43c3-43ae-a75d-d6801c5e3225	d4323868-ca5d-4163-9856-e22045dde08c	Majestic Wins Adventures	majestic-wins-adventures	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	Tanzania	Arusha, Tanzania	TAN-OPS-3016	\N	t	2026-09-01 00:00:00	Majestic Wins Adventures is an Arusha-based operator running private mid-range and luxury safaris across the northern circuit, with departures any day of the year.	2016	LUXURY	5	16	2026-10-19 18:15:58.88	{Tanzania}	Custom mid-range & luxury tours that can start every day
e7914577-a3ca-4752-a51d-02f2dbc05e68	729f74ee-4cdc-4f60-806c-24c70d5c4be3	Shadows of Africa	shadows-of-africa	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80	Tanzania	Arusha, Tanzania	TAN-OPS-3007	\N	t	2026-09-01 00:00:00	Shadows of Africa designs tailor-made safaris in East and Southern Africa, from first-time family trips to multi-country honeymoons, with local offices in five countries.	2007	MID_RANGE	4.8	168	2026-10-19 18:15:58.901	{Tanzania,Kenya,Rwanda,"South Africa","United States"}	Custom safari itineraries for couples, families and private groups
6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	6944323c-c7fc-4596-b7a2-161829f50256	Activentures Africa Safaris	activentures-africa-safaris	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	Uganda	Kampala, Uganda	UGA-OPS-3018	\N	t	2026-09-01 00:00:00	Activentures Africa Safaris specialises in gorilla and chimpanzee trekking in Uganda and Rwanda, combined with savannah game drives and community conservation visits.	2018	LUXURY	5	6	2026-10-19 18:15:58.919	{Uganda,"United States"}	Luxury gorilla trekking, wildlife and conservation-led tours
c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	079c1019-8c6f-4d2b-bc35-95c46884b4e0	Josh Dreamland Safari	josh-dreamland-safari	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1200&q=80	Tanzania	Arusha, Tanzania	TAN-OPS-3014	\N	t	2026-09-01 00:00:00	Josh Dreamland Safari is a family-run Tanzanian operator known for Great Migration safaris and patient, knowledgeable driver-guides.	2014	MID_RANGE	4.9	112	2026-10-19 18:15:58.936	{Tanzania}	Tailor-made safari experiences in the Serengeti and northern circuit
e425e04a-d831-4569-b0d2-c82e0a5291fd	00d46c0c-258f-4aa1-bd87-7984d76e0428	Serengeti Sunrise Safaris	serengeti-sunrise-safaris	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1200&q=80	Tanzania	Moshi, Tanzania	TAN-OPS-3012	\N	t	2026-09-01 00:00:00	Serengeti Sunrise Safaris runs family-friendly road safaris in Tanzania and walking safaris in Zambia, with a sales office in the United States.	2012	MID_RANGE	4.8	98	2026-10-19 18:15:58.954	{Tanzania,"United States"}	Family road safaris and premium small-group departures
1df9f16f-f050-442b-9759-73d8fdd573a6	4ef63763-e5ca-4a4d-ba51-252d39592893	Go Serengeti African Tours	go-serengeti-african-tours	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	Tanzania	Arusha, Tanzania	TAN-OPS-3011	\N	t	2026-09-01 00:00:00	Go Serengeti African Tours offers great-value camping and shared group safaris in northern Tanzania, often combined with a few days on Zanzibar.	2011	BUDGET	4.9	662	2026-10-19 18:15:58.973	{Tanzania}	Budget camping and shared group safaris with beach extensions
c08876d2-7864-432b-a440-5c4c1fc5af5d	7db4950e-301e-48c4-a275-56f398f34b92	Shemeji Safari	shemeji-safari	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80	Tanzania	Arusha, Tanzania	TAN-OPS-3013	\N	t	2026-09-01 00:00:00	Shemeji Safari runs private tented safaris across Tarangire, Serengeti and Ngorongoro, with a strong focus on Big Five tracking and photography.	2013	MID_RANGE	4.9	307	2026-10-19 18:15:58.991	{Tanzania}	Private tented safaris focused on the Big Five
d73ec798-0d36-4bcc-9773-bbae289fba53	ea71fa3e-6e6f-4578-915a-16f80c9b091f	Sunstrip Africa Safaris	sunstrip-africa-safaris	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80	Kenya	Nairobi, Kenya	KEN-OPS-3015	\N	t	2026-09-01 00:00:00	Sunstrip Africa Safaris runs affordable small-group safaris from Nairobi to the Masai Mara, Amboseli, Lake Nakuru and Samburu.	2015	BUDGET	4.8	49	2026-10-19 18:15:59.01	{Kenya}	Small shared group safaris with a maximum of 8 people
9422b5d1-d807-48ce-ba6f-b674d3cb26ff	f8b5d924-8892-467c-80a6-bba4ebe2c044	Pula Adventures	pula-adventures	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80	Botswana	Maun, Botswana	BOT-OPS-3009	\N	t	2026-09-01 00:00:00	Pula Adventures is a Maun-based operator running private mobile and lodge safaris through the Okavango Delta, Chobe and the Kalahari, with extensions to Victoria Falls.	2009	MID_RANGE	4.9	231	2026-10-19 18:15:59.029	{Botswana}	Private guided safaris in the Okavango, Chobe and Kalahari
aad63409-b4e3-449b-ae96-72ddaec3ac94	02f98643-d032-4281-91d5-ede28ae07188	Mubala Wildlife Safaris	mubala-wildlife-safaris	https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80	https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1200&q=80	Uganda	Entebbe, Uganda	UGA-OPS-3010	\N	t	2026-09-01 00:00:00	Mubala Wildlife Safaris combines gorilla trekking in Bwindi with Queen Elizabeth and Murchison Falls national parks on private mid-range tours.	2010	MID_RANGE	4.8	204	2026-10-19 18:15:59.047	{Uganda}	Gorilla trekking combined with classic Ugandan game drives
\.


--
-- Data for Name: reservation_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservation_messages (id, reservation_id, sender_id, body, is_read, created_at) FROM stdin;
a66e804a-fa6b-4fce-ae2b-8a05382da090	608e3684-c002-442a-83cf-0e103dfee803	a2351356-9bdb-4985-b369-ce26f60239e6	Reservation request: 2 adults · Nov 20, 2026 · Serengeti Great Migration & Crater Odyssey 1791837249952. Estimated total $5600.00. Special requests: Honeymoon safari setup	f	2026-10-12 20:34:18.131
221481f9-3d1a-472b-a25b-4b8235bd188d	be174175-912d-4aff-b0a2-22824399076b	3711fe75-62b2-43ba-82cf-79971ca2662b	Agency: approved your reservation cmv5pn0ry0001tzt8cw7x47jq. Note: Confirmed! Private safari 4x4 allocated with Guide John.	t	2026-10-12 20:34:20.35
7f4eda59-e8a6-4d47-8e18-24be971ae05c	be174175-912d-4aff-b0a2-22824399076b	3711fe75-62b2-43ba-82cf-79971ca2662b	Hello Alice, welcome to SafariAsili! We have noted your vegetarian meals and confirmed your window seats.	t	2026-10-12 20:34:22.829
9d8ec5a3-2591-44ff-a232-aa9e80747262	be174175-912d-4aff-b0a2-22824399076b	c0f0f7fa-197b-432b-ab93-b8b96cb0b70d	Reservation request: 2 adults · Nov 20, 2026 · Serengeti Great Migration & Crater Odyssey 1791837249952. Estimated total $5600.00. Special requests: Vegetarian meals, window seats requested	t	2026-10-12 20:34:17.938
a219c446-08d6-41ea-af10-381743df85c4	be174175-912d-4aff-b0a2-22824399076b	c0f0f7fa-197b-432b-ab93-b8b96cb0b70d	Thank you Juma! Could you also let us know the exact airport pickup time at JRO?	t	2026-10-12 20:34:22.997
d5732b1d-e71d-4fa8-9084-78fd17caa813	242947e3-47e6-40e0-8c31-c6ba851d952e	8ed21cca-720b-4430-9e8b-88cf51433402	Reservation request: 2 adults · Nov 20, 2026 · Serengeti Great Migration & Crater Odyssey 1791837299424. Estimated total $5600.00. Special requests: Honeymoon safari setup	f	2026-10-12 20:35:01.185
5f5a4ee8-7691-47f1-bde3-de5498a65c24	8550172a-cc8f-4b44-b2ef-83fcb62fe4fb	11919b2d-abb9-4106-9f79-13dcb480440e	Agency: approved your reservation cmv5pny0d0005tzt8h5rbodar. Note: Confirmed! Private safari 4x4 allocated with Guide John.	t	2026-10-12 20:35:01.569
9f87a6f2-eb87-4d83-b7a7-1af338d6d715	8550172a-cc8f-4b44-b2ef-83fcb62fe4fb	11919b2d-abb9-4106-9f79-13dcb480440e	Hello Alice, welcome to SafariAsili! We have noted your vegetarian meals and confirmed your window seats.	t	2026-10-12 20:35:01.654
ec951e9b-97bb-457f-9c9e-67227f0e3f06	8550172a-cc8f-4b44-b2ef-83fcb62fe4fb	46ca9148-ac17-46d4-99c0-59c7e2a66b48	Reservation request: 2 adults · Nov 20, 2026 · Serengeti Great Migration & Crater Odyssey 1791837299424. Estimated total $5600.00. Special requests: Vegetarian meals, window seats requested	t	2026-10-12 20:35:00.978
c4c31f61-f99f-46d8-a8fd-bd6c5eeb4cf4	8550172a-cc8f-4b44-b2ef-83fcb62fe4fb	46ca9148-ac17-46d4-99c0-59c7e2a66b48	Thank you Juma! Could you also let us know the exact airport pickup time at JRO?	t	2026-10-12 20:35:01.783
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reservations (id, reference, traveler_id, tour_id, operator_id, start_date, adults_count, children_count, special_requests, estimated_total_usd, status, operator_note, decided_at, created_at, updated_at, completed_at, slot_id, vehicle_id) FROM stdin;
6e744bff-088a-4ac7-b4e8-611777416f7c	cmujlk0a50001tz1wa2ka9srr	398f99dc-4f97-4dcc-a55a-d732c325481f	db1583d7-156f-4c73-8e0e-e61cc5eac04c	42b041e2-036b-4aa0-bbff-422050609f5b	2026-11-15 00:00:00	3	1	Vegetarian meals, anniversary trip	5775	APPROVED	Confirmed, karibu!	2026-09-27 09:09:06.657	2026-09-27 09:09:02.955	2026-09-27 09:09:06.663	\N	\N	\N
27568823-4d68-4a97-a2d0-d6cee272b4a6	cmujpn2ow0003tz1wpb4n74d7	398f99dc-4f97-4dcc-a55a-d732c325481f	de687d5f-4b18-4edd-8eda-807a1e6021ef	786e8685-6f8c-4c7a-9856-885e39a7f030	2027-02-10 00:00:00	2	2	Family with young kids	3870	APPROVED	Family tent confirmed	2026-09-27 11:03:25.756	2026-09-27 11:03:24.512	2026-09-27 11:03:25.764	\N	\N	\N
cd6103e2-3dbf-4fda-a1fc-17b6c03ac368	cmujqrzdw0005tz1we0es9aoi	9d1483f8-235f-4742-b1bb-baaeff166dfc	db1583d7-156f-4c73-8e0e-e61cc5eac04c	42b041e2-036b-4aa0-bbff-422050609f5b	2027-03-15 00:00:00	2	0	Window seat preference	3300	PENDING	\N	\N	2026-09-27 11:35:13.124	2026-09-27 11:35:13.124	\N	\N	\N
fb984da2-ef8b-4ab7-807b-0dca88a7d069	cmv5pbjz50001tzc8z2uw7uff	398f99dc-4f97-4dcc-a55a-d732c325481f	db1583d7-156f-4c73-8e0e-e61cc5eac04c	42b041e2-036b-4aa0-bbff-422050609f5b	2026-12-15 00:00:00	4	0	Photographic equipment vehicle	10000	APPROVED	\N	\N	2026-10-12 20:25:22.912	2026-10-19 19:40:40.552	\N	5895c2fe-d89b-4c9b-9803-1b6be6ce3af4	cf715d2d-e162-475f-812a-c033865054c9
be174175-912d-4aff-b0a2-22824399076b	cmv5pn0ry0001tzt8cw7x47jq	c0f0f7fa-197b-432b-ab93-b8b96cb0b70d	684eafde-f233-4f87-b8a5-76a45cb18253	2c2cd580-7109-4a21-ad9e-da9bde7941b5	2026-11-20 00:00:00	2	0	Vegetarian meals, window seats requested	5600	APPROVED	Confirmed! Private safari 4x4 allocated with Guide John.	2026-10-12 20:34:20.335	2026-10-12 20:34:17.902	2026-10-19 19:40:40.891	\N	2b056883-5301-424b-9282-99302870aad0	2207b4ac-ab44-4247-8ceb-d2851bbb90d8
608e3684-c002-442a-83cf-0e103dfee803	cmv5pn0y50003tzt8c1fznjd1	a2351356-9bdb-4985-b369-ce26f60239e6	684eafde-f233-4f87-b8a5-76a45cb18253	2c2cd580-7109-4a21-ad9e-da9bde7941b5	2026-11-20 00:00:00	2	0	Honeymoon safari setup	5600	PENDING	\N	\N	2026-10-12 20:34:18.125	2026-10-19 19:40:40.898	\N	2b056883-5301-424b-9282-99302870aad0	2207b4ac-ab44-4247-8ceb-d2851bbb90d8
8550172a-cc8f-4b44-b2ef-83fcb62fe4fb	cmv5pny0d0005tzt8h5rbodar	46ca9148-ac17-46d4-99c0-59c7e2a66b48	7c0f3706-def2-4435-a0f0-8af36ea2217b	761c2fbc-af79-47f1-9390-5aeb60179942	2026-11-20 00:00:00	2	0	Vegetarian meals, window seats requested	5600	APPROVED	Confirmed! Private safari 4x4 allocated with Guide John.	2026-10-12 20:35:01.525	2026-10-12 20:35:00.973	2026-10-19 19:40:41.08	\N	2b2e32d8-8bd3-4e3b-8485-0f7250ae92ea	73dfbfd2-7f2e-47b3-810f-70e2541f6a68
242947e3-47e6-40e0-8c31-c6ba851d952e	cmv5pny630007tzt8rqm04xnt	8ed21cca-720b-4430-9e8b-88cf51433402	7c0f3706-def2-4435-a0f0-8af36ea2217b	761c2fbc-af79-47f1-9390-5aeb60179942	2026-11-20 00:00:00	2	0	Honeymoon safari setup	5600	PENDING	\N	\N	2026-10-12 20:35:01.179	2026-10-19 19:40:41.086	\N	2b2e32d8-8bd3-4e3b-8485-0f7250ae92ea	73dfbfd2-7f2e-47b3-810f-70e2541f6a68
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reviews (id, operator_id, tour_id, traveler_id, overall_rating, guide_rating, vehicle_rating, value_rating, itinerary_accuracy_rating, review_title, review_body, travel_date, is_verified_booking, status, operator_reply, created_at) FROM stdin;
34a64a51-6e5a-4bb7-9678-60e406965079	42b041e2-036b-4aa0-bbff-422050609f5b	\N	398f99dc-4f97-4dcc-a55a-d732c325481f	5	\N	\N	\N	\N	Great trip	Amazing experience	\N	t	APPROVED	\N	2026-09-26 18:11:23.115
959ee440-74d9-4cb2-8f17-61e34194df5d	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	34251e48-a8bd-412b-acca-dcf737215b0c	5	5	5	5	\N	Perfectly organized and unforgettable	We saw a river crossing on day five. Our guide read the herds brilliantly and every camp was spotless.	2026-01-09 19:00:00	t	APPROVED	\N	2026-08-31 19:00:00
970307bd-08c6-4d99-819a-e15ce01be0a9	1df9f16f-f050-442b-9759-73d8fdd573a6	7b73b43a-7ac4-467a-a0ff-668736ded876	97ef72d9-e92b-4e4e-b51c-188eb29c4268	5	5	4	5	\N	Worth every penny	Great value. Camping in the Serengeti was the highlight, and Zanzibar was the perfect way to finish.	2026-02-09 19:00:00	t	APPROVED	\N	2026-09-01 19:00:00
5ab9725c-1693-4ebe-adf8-355d91c8f8cf	c08876d2-7864-432b-a440-5c4c1fc5af5d	0050eece-311b-427b-8cca-996362950d27	9c6d8a8f-799d-4476-a6b3-939e7e3afb44	5	5	5	5	\N	All Big Five in ten days	Rhino in the crater, leopard in the central Serengeti. The tented camps felt wild but comfortable.	2026-03-09 19:00:00	t	APPROVED	\N	2026-09-02 19:00:00
8b90c9cd-13cf-4997-a59e-acff295a7975	d73ec798-0d36-4bcc-9773-bbae289fba53	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	31dcbb8e-dc18-4491-b2a8-2c5fb3817c36	4	4	3	4	\N	Great group, great guide	The group was small and friendly. Amboseli elephants with Kilimanjaro behind them were unreal.	2026-04-09 19:00:00	t	APPROVED	\N	2026-09-03 19:00:00
ba929f92-c78e-4d75-ad0e-1a060adff151	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	34251e48-a8bd-412b-acca-dcf737215b0c	5	5	5	5	\N	The Delta exceeded every expectation	Mokoro trips at sunrise and wild dogs on our last morning. Pula handled every flight transfer perfectly.	2026-05-09 19:00:00	t	APPROVED	\N	2026-09-04 19:00:00
c48f2d05-79be-4f43-b700-f8494f2359ba	aad63409-b4e3-449b-ae96-72ddaec3ac94	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	97ef72d9-e92b-4e4e-b51c-188eb29c4268	5	5	4	5	\N	An hour with the gorillas I will never forget	Tough hike in Bwindi but completely worth it. The Kazinga Channel boat trip was a bonus highlight.	2026-06-09 19:00:00	t	APPROVED	\N	2026-09-05 19:00:00
e1cb8a34-4c94-437d-bdde-b2ecdd2aa96b	885fdd7f-43c3-43ae-a75d-d6801c5e3225	f5d69c5b-0635-43bd-9c0d-51ceabadf201	9c6d8a8f-799d-4476-a6b3-939e7e3afb44	5	5	5	5	\N	Luxury done right	Beautiful lodges, private vehicle and a guide who knew exactly where to be at the right time.	2026-07-09 19:00:00	t	APPROVED	\N	2026-09-06 19:00:00
735a5699-ac5a-4efe-83f4-c6930ec86397	e7914577-a3ca-4752-a51d-02f2dbc05e68	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	31dcbb8e-dc18-4491-b2a8-2c5fb3817c36	5	5	4	5	\N	Gorillas and the Big Five in one trip	Volcanoes was magical and Akagera surprised us with lions on the first drive.	2026-08-09 19:00:00	t	APPROVED	\N	2026-09-07 19:00:00
19ac2739-9742-44a5-8080-e8a373d8ca08	e7914577-a3ca-4752-a51d-02f2dbc05e68	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	34251e48-a8bd-412b-acca-dcf737215b0c	4	4	4	4	\N	Leopards every day in Sabi Sand	Kruger self-drive days plus private game drives in Sabi Sand was the perfect mix.	2026-09-09 19:00:00	t	APPROVED	\N	2026-09-08 19:00:00
4599542b-9b88-4668-9c25-bd78b136a4dd	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	4b10b727-136a-4942-a888-49513425164c	97ef72d9-e92b-4e4e-b51c-188eb29c4268	5	5	4	5	\N	Short, smooth and spectacular	The fly-in saved us two long road days. Gorilla trek and lodge were both excellent.	2026-01-09 19:00:00	t	APPROVED	\N	2026-09-09 19:00:00
65e39130-2521-44be-859f-88dd33967ed8	e425e04a-d831-4569-b0d2-c82e0a5291fd	a52e3b15-970d-440b-a449-16b38fbd1f74	9c6d8a8f-799d-4476-a6b3-939e7e3afb44	5	5	5	5	\N	Walking safari heaven	Tracking lions on foot with an armed scout is something else. Night drives found three leopards.	2026-02-09 19:00:00	t	APPROVED	\N	2026-09-10 19:00:00
5fc10a74-dcbf-481d-835f-8f66100ee328	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	54a64fbb-a198-4a52-bb05-b4826eadb6d6	31dcbb8e-dc18-4491-b2a8-2c5fb3817c36	4	4	3	4	\N	Elephants and the Falls	Huge elephant herds at the Hwange waterholes, then the spray of Victoria Falls. Well organised.	2026-03-09 19:00:00	t	APPROVED	\N	2026-09-11 19:00:00
f761daa1-1061-46c0-b4b9-7cb5d225a31e	e7914577-a3ca-4752-a51d-02f2dbc05e68	bb38656c-40f7-4b5a-97bb-401927daa1ae	34251e48-a8bd-412b-acca-dcf737215b0c	5	5	5	5	\N	Self-drive made easy	Clear route notes, great lodges and rhino at the Okaukuejo waterhole at night.	2026-04-09 19:00:00	t	APPROVED	\N	2026-09-12 19:00:00
d6b0e02d-8eb5-43d0-9a16-dc32b2a00afc	d73ec798-0d36-4bcc-9773-bbae289fba53	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	97ef72d9-e92b-4e4e-b51c-188eb29c4268	4	4	3	4	\N	Northern Kenya gems	Grevy zebra and reticulated giraffe in Samburu, then rhinos at Nakuru. Good value.	2026-05-09 19:00:00	t	APPROVED	\N	2026-09-13 19:00:00
\.


--
-- Data for Name: slot_vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.slot_vehicles (slot_id, vehicle_id, seats, booked_seats) FROM stdin;
fbaf63cb-4675-45e5-b108-d292dab36387	04863699-2977-44e6-bbd5-0b715946227c	7	0
fbaf63cb-4675-45e5-b108-d292dab36387	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
aa776cfb-03c3-41ae-a6ca-cc86a4a69423	04863699-2977-44e6-bbd5-0b715946227c	7	0
aa776cfb-03c3-41ae-a6ca-cc86a4a69423	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
4fedf96d-f630-4768-85e5-a2f412743ef7	04863699-2977-44e6-bbd5-0b715946227c	7	0
715b77d5-5687-4897-9afe-5c20374b7592	cf715d2d-e162-475f-812a-c033865054c9	22	0
e9d0fd48-91a3-4736-b71d-79fcf650c600	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
e9d0fd48-91a3-4736-b71d-79fcf650c600	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
916b8c73-9f03-4cfa-9a55-01179baf3782	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
916b8c73-9f03-4cfa-9a55-01179baf3782	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
84c06695-3ed6-4179-a54f-ce8d27ddd7bc	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
0dcb4ccf-e093-4823-bc02-d3a293a6ef82	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
0dcb4ccf-e093-4823-bc02-d3a293a6ef82	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
f9a0c51f-0040-484c-8ef2-d5e8f7c105de	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
fae37385-dde6-448c-83ca-1ef09a84ffbd	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
fae37385-dde6-448c-83ca-1ef09a84ffbd	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
60b020a9-acb4-496e-be87-89c77335b932	4a2bc76d-c792-445f-801e-832f87339577	6	0
d2dc22fa-c1ad-40ee-82c8-a719a8fd13fe	4a2bc76d-c792-445f-801e-832f87339577	6	0
d34fa0a4-0f90-45d5-a448-9a3765b39652	4a2bc76d-c792-445f-801e-832f87339577	6	0
ac449702-98f0-40fb-969f-9bc0794df2ab	4a2bc76d-c792-445f-801e-832f87339577	6	0
403f00df-2218-4a52-a4fe-ffa840f2f272	4a2bc76d-c792-445f-801e-832f87339577	6	0
bb1bcfd4-4500-4875-bf98-4d78aaab85c9	4a2bc76d-c792-445f-801e-832f87339577	6	0
e1075ef5-1be6-4e85-a36f-85090bd731a4	4a2bc76d-c792-445f-801e-832f87339577	6	0
98d291a6-a192-4219-9aef-393f020426c5	4a2bc76d-c792-445f-801e-832f87339577	6	0
e7d2f96e-6d68-49c7-8650-860a3941ecab	4a2bc76d-c792-445f-801e-832f87339577	6	0
d2d69025-0e43-43ec-a76a-13a32065ca12	4a2bc76d-c792-445f-801e-832f87339577	6	0
33104973-91cf-4f17-a2d3-d131965af749	4a2bc76d-c792-445f-801e-832f87339577	6	0
611f2420-4333-4ed9-abc0-d698a883e8fe	4a2bc76d-c792-445f-801e-832f87339577	6	0
a21629d2-a169-410a-9d22-b3e227ef7bb1	4a2bc76d-c792-445f-801e-832f87339577	6	0
b3190f13-044d-40b3-8c46-c7b3b99ac8f2	4a2bc76d-c792-445f-801e-832f87339577	6	0
a1a50528-275d-444e-a1c6-08dd677e0a9b	4a2bc76d-c792-445f-801e-832f87339577	6	0
34afae4f-c491-4475-b0a7-114e1536a5be	4a2bc76d-c792-445f-801e-832f87339577	6	0
7d7ac41d-9f8b-4f37-9a7c-a4c3ddc3b7d8	cf715d2d-e162-475f-812a-c033865054c9	22	0
f26474fa-c195-4735-8b3a-c7fefe5b246d	cf715d2d-e162-475f-812a-c033865054c9	22	0
5895c2fe-d89b-4c9b-9803-1b6be6ce3af4	cf715d2d-e162-475f-812a-c033865054c9	22	4
1fbde96e-c6ec-4d71-ade2-46d4294f3ed8	04863699-2977-44e6-bbd5-0b715946227c	7	0
7a6aa3c5-c2e8-4ff4-97f9-12c3bfeaf569	04863699-2977-44e6-bbd5-0b715946227c	7	0
7c1688be-6bd7-41e7-8fda-f496361c84a5	04863699-2977-44e6-bbd5-0b715946227c	7	0
2a82d299-3e36-4235-b261-f22bdbf89e6f	04863699-2977-44e6-bbd5-0b715946227c	7	0
0f018c47-330f-4993-bb4c-6b7644f40c2a	04863699-2977-44e6-bbd5-0b715946227c	7	0
2012c6d7-ccc3-4f07-88b4-995b0f74178f	04863699-2977-44e6-bbd5-0b715946227c	7	0
0b403db8-c68a-4a62-820a-926952809302	04863699-2977-44e6-bbd5-0b715946227c	7	0
18b5b685-58bf-43e4-81b6-a088c7fc2dc9	04863699-2977-44e6-bbd5-0b715946227c	7	0
5b076a4c-9b12-4c90-b16e-f57137bf3317	04863699-2977-44e6-bbd5-0b715946227c	7	0
cfa55f14-99f5-40c0-bb73-461e7d3ee7b9	04863699-2977-44e6-bbd5-0b715946227c	7	0
2f30fec9-dc9d-4b7f-8b8c-4e4d4441c2bb	04863699-2977-44e6-bbd5-0b715946227c	7	0
479e279a-a58b-4237-a8e4-9581fe4a9d8a	04863699-2977-44e6-bbd5-0b715946227c	7	0
52bb5369-8a0d-4cc3-bd49-ae11c9f23a20	04863699-2977-44e6-bbd5-0b715946227c	7	0
069d0ac4-816e-4ddc-bd1e-5ed2018c7baf	04863699-2977-44e6-bbd5-0b715946227c	7	0
e358ced1-df1b-4c39-bc01-79b1f8354c31	04863699-2977-44e6-bbd5-0b715946227c	7	0
342001a0-d630-4b52-ad75-614ffbc1b6ba	04863699-2977-44e6-bbd5-0b715946227c	7	0
5dc58394-655a-4b88-845f-792aa29f5f0d	552a9f0f-e9c4-4951-8592-3290772f64e4	7	0
655149fa-f1da-4fe6-8f34-ed957e9c46f8	cf715d2d-e162-475f-812a-c033865054c9	22	0
98611f31-3241-443a-a30c-cfa5d7c28be0	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
f16e58f1-1025-46bb-959b-db6a29958007	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
778d9c82-e215-4b88-a368-6aa427ab55b6	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
884b3db5-1ba7-4e3c-9430-1f1de266e529	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
bf91f943-a212-4a6f-96b2-5df817aa1cf9	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
e3108552-73b1-4c57-bdec-4ee098c86ed2	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
b2426c9c-ae96-4b67-9338-a6979b1a625a	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
da7886ce-3035-40ca-9ce6-3f3f8af6ad52	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
c44ac73d-544e-4f08-8673-e47e32b021fb	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
53786b2c-517d-46d4-be0e-7fddf70d2f7b	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
dde76275-db65-4d8e-ae08-2e5fd38a30e3	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
5c298432-d4d4-40db-9566-3de9f9012268	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
b50f5b5a-ea94-4cc0-bb52-e615ff64e849	335d6fc0-74d5-4eec-b0f1-655ec2354c11	7	0
2b056883-5301-424b-9282-99302870aad0	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	4
52917845-7f87-4333-9d3b-29794e9327fd	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
69750cea-a576-42a4-89d8-7b517b9bbc80	b4b5955b-76eb-4b41-afed-0801296eb95a	7	0
75ec16fa-d59c-4d78-813e-70ce3dea4fc7	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
a37317b1-7bed-440f-a137-772602e7f390	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
e42d8666-ae3c-4902-ab98-2eafa579f24c	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
458e537e-6e19-49d2-af94-677acbca0fe5	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
7961eb78-a1c2-43c1-a90e-ed237135f3cf	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
72c13792-3a07-42f7-94b5-1d7ca27399c9	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
8a53eb52-e57a-4615-91d1-8d3edcd4445e	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
aacc960c-2af7-4cd5-b607-121e130805fd	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
b328f7bd-ed75-4262-b1f2-81414fe138ed	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
5de99707-0e3d-4d74-b049-ed22d9c01888	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
9a2554c8-58b0-4a56-b509-60257d38dcd2	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
3fc1e4ec-efac-4025-97b8-988baf415bb6	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
7320d066-330e-4d57-be35-ce05ee00352f	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
7da10624-7451-4c4e-beb7-d4a3f6cdb94b	2207b4ac-ab44-4247-8ceb-d2851bbb90d8	7	0
2b2e32d8-8bd3-4e3b-8485-0f7250ae92ea	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	4
1c435a74-d42d-4f07-8455-fc10144f1c07	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
8a3f9bfc-de7d-4cd1-8369-56a0e9d42a65	094ccfec-4931-4d6f-ba2b-8e40094638d2	7	0
df714c24-4386-4921-854b-b08e6e145613	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
08de42e8-0fd9-4761-8795-1f65e119793c	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
87d8c922-b485-4d58-9464-fa4046b2dd01	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
e8acfb00-bb94-4474-87d7-8769d80e2da8	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
a576c51f-dbae-4b2f-b9ed-f2ea37ca1824	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
dd0bb152-b1ee-487c-ac80-0641c8e5eed4	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
90892213-885f-4e9c-9cbe-eaf7d5e344a6	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
70d80caa-97a2-4e0f-9c6d-628afc2bd860	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
fb1315e3-55a8-4b30-ac2c-4e829b79251c	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
7913156e-7b98-4a05-8c05-c4b46ec9c987	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
1af1ac0c-c771-4b4e-a7a1-bd0738ba7354	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
a35c3cea-5d22-4980-908c-00c71ecf57c9	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
b14c4cca-0642-492a-bacd-1a31469e2d48	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
5c799648-ab4a-4ab1-a482-6385aaa9b8cd	73dfbfd2-7f2e-47b3-810f-70e2541f6a68	7	0
6dc5bbe2-4966-483b-b640-007d61d5fe19	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
c7bb8e0f-87c5-43a7-9218-6020f88ae353	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
80ae0e64-d9b2-4eff-b2a2-92e866753aa5	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
f070a563-26bc-4531-ba62-bb90bdc9cd5f	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
f21e81b9-b6dc-41b2-be87-4a92671934a7	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
5c30c94b-2731-4f8e-8ae1-969cdde7eaf3	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
409db071-b610-42e7-84e8-c9e4f3207f7c	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
62e8900a-daae-4e8f-9776-ed2a760cb57b	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
f97e41eb-a8e4-4414-9eaa-e639a9556a9f	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
e2712c9b-363d-4570-b49d-c1c898e73528	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
04c95eac-e211-474d-9ec5-502d6fc7d501	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
f8fe622d-269e-4399-bc9f-af3b5c7c8a1a	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
ec05805e-5a6d-4387-ae6b-1597b9c36556	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
9c6258c5-d1cc-435f-ae8f-06406b0697f7	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
06a218aa-40b3-4016-bb53-080d8c9d4ee8	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
56665826-9395-4bb7-90c5-e5c7978feef1	2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	7	0
2d2bc196-c45f-4d84-ac38-85ef9c98a6b6	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
5d0a4460-7fc8-4711-a49e-264b1ebb38bb	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
93b9bb74-6371-4a14-a04e-7ca641e8c69b	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
b0a01013-17ad-4924-a7c4-93bcc8147ef4	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
5617e60e-e4e4-411d-b05a-d5636cfb796f	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
6515a8ee-743e-4631-b0cb-0d1500c6549f	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
b92cd8b1-266d-4187-ba02-dbdc05f7c66f	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
1040eb85-006b-4946-bcd1-1cce834e5ee5	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
cceea282-9216-43cc-90a9-aaa997b82acd	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
46639747-287c-41a1-b4d5-353decef61f4	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
1807d8d0-c1e3-40f0-a582-31d2dc29b890	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
417baa3f-db09-4a7f-8377-1e6010bbd67a	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
fee38a87-6311-40ff-a80d-83d949d6c834	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
c8e920fc-9ca3-41cf-908a-f06c0bbec0de	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
f0eedf43-b604-4ea6-84d5-b23e4d9ed82a	51edeeb6-c87e-4494-a918-db7d1b96dff2	7	0
067ae234-7238-421d-bd6d-23768e37a9cd	72df6463-5711-4476-9c11-312d1ee6f431	7	0
1a9521d5-fbf2-40f5-b1eb-589272f52e1c	72df6463-5711-4476-9c11-312d1ee6f431	7	0
7b611dbd-fdc5-44d5-8f7c-f3fb59e39000	72df6463-5711-4476-9c11-312d1ee6f431	7	0
ef60f21d-7b78-464e-8cb1-f7887d5a9092	72df6463-5711-4476-9c11-312d1ee6f431	7	0
2620f0a6-72be-476b-94e4-e4f8d4338d98	72df6463-5711-4476-9c11-312d1ee6f431	7	0
c96cbe1a-ffca-42a2-89a2-204ba3c7f4bf	72df6463-5711-4476-9c11-312d1ee6f431	7	0
a5ac32ae-8449-4d69-86b5-1b95e49a51ec	72df6463-5711-4476-9c11-312d1ee6f431	7	0
c6885e94-bca9-40a7-b111-7c0f978eadc3	72df6463-5711-4476-9c11-312d1ee6f431	7	0
3a8f0112-cc31-4d29-a64a-5e4e7f7ebd18	72df6463-5711-4476-9c11-312d1ee6f431	7	0
e105e187-fbe7-4200-80dc-63d894e87646	72df6463-5711-4476-9c11-312d1ee6f431	7	0
b3066313-38c0-4182-bf69-d05e0223939f	72df6463-5711-4476-9c11-312d1ee6f431	7	0
7981985e-a671-47f4-81c3-5b2386fa3b70	72df6463-5711-4476-9c11-312d1ee6f431	7	0
0b2f8554-b5c1-4fff-b3a0-2fcf758abad8	72df6463-5711-4476-9c11-312d1ee6f431	7	0
37b6b93d-ef69-4700-99da-cb5b65834081	72df6463-5711-4476-9c11-312d1ee6f431	7	0
dcbeef3c-209f-4af6-b336-78d612bd6487	72df6463-5711-4476-9c11-312d1ee6f431	7	0
a26374bd-880b-42cc-a1a4-0cedbfd296dc	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
b66f7db4-0519-47a5-9998-7f17bc961390	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
22c4b381-9d7f-44f4-af32-8ec88d110a32	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
d65bfb40-2cca-4791-9595-a0fe683fafe3	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
1ead0bd2-e687-45e7-8ef1-8ab935d88033	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
9d4bdfe8-eec6-4471-9c4c-e50eab9dffe8	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
f4a20cd4-c947-4a94-950d-2be2863fa88d	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
d4ea894f-9d81-443c-99f1-58e43d2d560e	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
50f2c472-bb8f-44af-9dae-83b0938d4209	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
87186e3c-f910-43b1-a187-6be0c9d68ad8	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
66bb41e4-271f-4621-8239-3b12335dc918	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
0db87e3c-0726-487a-8e36-8eab0dba7819	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
a6a8a542-016f-44da-9c9e-75357b21327e	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
ccb02693-b8b1-49a1-9969-6ace5ad486c5	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
786fba9c-253d-4f86-9c7a-cd5f87dba076	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
d08c998c-f912-457e-8b6c-68b12b0b0917	d97a56fc-d3db-436b-b01a-09cdefe71b48	7	0
7dfae3ca-394d-406e-b1f2-5c20ace8d9f9	431d3913-3501-4e77-92d0-262525f78eda	6	0
10259454-2300-423a-94d2-8fe7272f8aa0	431d3913-3501-4e77-92d0-262525f78eda	6	0
aef59294-f51e-4316-bcf5-882d95a4e0f6	431d3913-3501-4e77-92d0-262525f78eda	6	0
1ada3b11-2146-4bd4-8328-af31d9202933	431d3913-3501-4e77-92d0-262525f78eda	6	0
126bdce7-16f4-42aa-a42e-d6d606c79d99	431d3913-3501-4e77-92d0-262525f78eda	6	0
aaf651d1-1abb-4d7e-b401-f15098ea1427	431d3913-3501-4e77-92d0-262525f78eda	6	0
609df587-2255-4431-bccf-f750c51b7898	431d3913-3501-4e77-92d0-262525f78eda	6	0
36fddcd2-4845-4f40-b9c2-4f8bdfdd6aba	431d3913-3501-4e77-92d0-262525f78eda	6	0
a97ebe2a-9d61-4a49-9089-f01c306a7b64	431d3913-3501-4e77-92d0-262525f78eda	6	0
bd5dc2e2-90b8-4c2f-879a-c5bf39aa2ba0	431d3913-3501-4e77-92d0-262525f78eda	6	0
ab008948-b592-47ae-b6b6-73163d6e0d6d	431d3913-3501-4e77-92d0-262525f78eda	6	0
3e9198c2-2eb5-4abb-b82f-27691e2f1190	431d3913-3501-4e77-92d0-262525f78eda	6	0
c9952c7b-3aeb-4fca-9adb-95f244e9abe9	431d3913-3501-4e77-92d0-262525f78eda	6	0
625cf72f-a8f1-4e76-81a3-0831399956c9	431d3913-3501-4e77-92d0-262525f78eda	6	0
96f6c12d-8a3f-4d84-a854-255f26198c57	431d3913-3501-4e77-92d0-262525f78eda	6	0
1f78b81c-10ab-43c7-84ce-addc4120cea0	431d3913-3501-4e77-92d0-262525f78eda	6	0
eb3919dd-0c32-4f91-8f53-c795e81b6182	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
21ec2e82-eb0a-4434-9001-1cff78937194	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
85ab07c5-d578-4ce1-a88b-e38e0d789149	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
6263ef66-ccb1-4f32-bcfb-88f226ed48c1	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
ead19daf-fb22-4424-819b-b2624c84a581	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
9f391efa-e827-4608-b9f6-444dbf7c24e3	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
25af2aab-b237-43ae-a5ec-dad4bd52f796	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
c946b6df-aff4-4dfb-baaf-ac7794248808	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
92752c42-c2cd-4906-8c2b-38bf7f2eadaa	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
a7901adf-b8d2-4005-ab09-903edc94647d	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
4f6efd32-dfec-4fa6-850d-74499fe97eb0	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
77056016-37aa-40c8-9df2-5bfc3796a52d	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
290ef867-e2d4-4977-989b-eaee91dec1a6	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
00a18508-2df2-48b1-b17d-97d3177f6162	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
a8b2b2aa-7769-47aa-8ee3-9ca0b78b5ab9	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
153e0150-4466-438e-aad3-299ffad354cd	021bc577-3248-4b0f-bc3f-25b9edd64c07	7	0
426b01b2-4799-4e1e-a664-32db8e01fac5	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
cfa5c340-e55f-4b44-8b60-a864d2d2c0ab	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
4142244f-0bac-4c68-90ad-606caa91726e	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
6f37e93c-38ab-4b6e-8f16-c51ca60abe84	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
3ea02eb7-f96e-4307-b8cb-65f757451939	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
65ddcc2e-a2f6-4243-a4ec-00ce38edf913	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
b73b2484-0109-4ce3-abc3-989db14b84a8	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
667fd052-a151-4ef9-a743-4cf3fb38b623	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
80f85513-779a-42f1-8ccb-8fde84da83ad	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
57a707b0-900f-48e6-84c9-1ca495a0fa63	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
c012e687-ddd7-47e4-976f-3ec7cd9b2fdd	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
c6ebb6dc-eb7d-4e73-b2a5-16463c8e160a	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
b19848b7-22fa-4c13-acdd-fe7f1a1f6a80	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
047fa3fa-fe66-4159-9566-88cad239389d	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
46ab233d-4e64-4223-8252-c5fda9cd162f	051eac1f-92dc-4ee5-8689-989c8fa2d24b	7	0
241675a8-ae38-4171-9052-5d072a68c75d	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
241675a8-ae38-4171-9052-5d072a68c75d	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
1f3c89df-e49d-4c42-92f8-6c4325d796ee	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
1f3c89df-e49d-4c42-92f8-6c4325d796ee	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
fdc38a63-0493-46a7-9c5f-57e1574138a6	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
fdc38a63-0493-46a7-9c5f-57e1574138a6	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
94c579ec-dac5-464e-a9f7-89a2f0eab2a8	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
94c579ec-dac5-464e-a9f7-89a2f0eab2a8	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
519de1b4-f6e7-404f-ad7b-9b9387171fd4	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
519de1b4-f6e7-404f-ad7b-9b9387171fd4	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
674ce9e9-a209-48a3-ab7e-39c22f1bd055	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
674ce9e9-a209-48a3-ab7e-39c22f1bd055	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
ed92cd20-2a0b-430b-a350-990774d9f310	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
ed92cd20-2a0b-430b-a350-990774d9f310	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
62303334-aaba-467b-80b0-d90382559c3d	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
62303334-aaba-467b-80b0-d90382559c3d	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
69ab73a7-35b4-46b9-800f-aec223c383cd	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
69ab73a7-35b4-46b9-800f-aec223c383cd	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
523c88b7-45c9-47b4-b0f0-8963d231373c	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
523c88b7-45c9-47b4-b0f0-8963d231373c	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
e275c969-a267-4dc4-ad1b-2fd59fe7e84a	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
e275c969-a267-4dc4-ad1b-2fd59fe7e84a	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
1de647ad-ed0c-4f38-8d70-358abd3f1820	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
1de647ad-ed0c-4f38-8d70-358abd3f1820	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
45a89a24-1d2c-4a48-ab1f-3ef78c14d0f5	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
45a89a24-1d2c-4a48-ab1f-3ef78c14d0f5	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
4484ebba-1605-4a4d-9efa-ef326e51e85a	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
4484ebba-1605-4a4d-9efa-ef326e51e85a	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
228b83b9-b64c-4eda-8bec-7ab79fe2e608	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
228b83b9-b64c-4eda-8bec-7ab79fe2e608	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
2b8182f8-ae48-4110-9ffc-8507f92b0d62	37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	4	0
2b8182f8-ae48-4110-9ffc-8507f92b0d62	0f56172c-929f-4b60-b573-36bbcae6638d	4	0
1bf0f709-5326-47fa-8e1e-2976effe9d06	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
5978863d-30b8-4185-93a2-43e5d9fc8aff	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
8280d994-17d8-43b2-83fc-e87b91944a42	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
4dc472bb-9b03-48fe-a00a-592c5ba9f0a7	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
c4d388a6-f9a9-4f15-bd21-1973db509b6c	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
3527b435-7a68-43b1-aa4e-9a4d4c8046db	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
90cf9d6d-e8cc-4c08-93c4-dc5257f95501	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
265e9da0-5a9f-4117-8806-d60e44bf9e14	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
d539063b-69d2-4c7a-b2f3-454a8d690e40	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
2033fe3b-c60d-48ec-a01c-791abf241889	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
344ea2c9-c36b-48ad-a60b-fe434047c21e	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
d76fa5c1-aab8-48d0-9809-588a4dd59925	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
80bb8db1-34a3-428f-a39e-2401ed7328a8	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
54f523f4-97e1-4604-b67a-f828a0bcd0c2	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
9a94144e-4c63-4b1b-95cc-314d46d06aec	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
223a8e22-af24-4b44-b50d-861a87b0ab5e	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
5db4f4d9-52f0-4879-9792-b754e519b775	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
4af095ae-6f52-459f-aef7-6168ac7879cb	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
d370a2e3-ab95-4e97-a8fa-9b6973410744	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
8f95f13e-a4d4-4fdd-b303-d3c091f89ac0	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
6ca4b8ad-73f2-4403-8a6c-ae324af0f3ad	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
6e16f57e-e34d-4167-a0a6-6354c632d07c	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
c94fd077-8a20-4df1-8b0b-f8cc21b28bce	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
99096832-10ab-40d5-9be7-3d30bb20ac38	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
c71e2efd-a6ef-4900-8f27-8fbb1465cc63	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
34c1dd49-ba72-42bc-83d8-5e07fcd214e4	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
f1db4f0f-28fc-4c07-9ee7-e85d5b191f3c	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
dd7a6137-96ce-451f-ad87-34c78b630aff	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
b6fa223b-1cff-4100-bd94-60e943733c1d	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
6c5e3fb5-7cbd-4ed4-be8d-3b0f0ef38ba4	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
59a7edcf-56b2-412e-b6e4-7e06504f681d	a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	7	0
87f5fb0a-852c-4366-930f-24df29aad1f1	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
01d5a46d-6db8-4c15-980d-fee42333e428	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
05c3700a-15e5-4cac-b3f3-8296bebe224f	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
c9e5e456-b3da-4e4a-a076-b3495953480f	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
06d633a0-9fb0-4132-b71c-de772ecf0803	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
e9c3d159-eade-4c3e-8e05-37735fe8e25d	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
7d6dcc89-7707-41b4-9eed-24623bd7633e	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
c971866e-c2ba-4177-98c5-ed917adfe890	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
f39cfbf1-2896-4d2f-a56c-4817adacfd67	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
fbb2a57f-aa5d-49b7-96d2-2ad01ffbc8be	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
b65692cd-2394-4bf3-b908-e943570dcd8f	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
344f7adf-49e6-497d-ae1a-e46d249227fc	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
793203ea-792a-4c8d-a68a-68bbae10e67c	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
f2215a39-5b82-4468-bd63-9e4328c23d44	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
a0e1f6f7-ebc7-48fc-8a30-32ec943a8ea7	074a51ed-e58a-45ec-9e84-9a041170a5ae	7	0
f6ff16e6-2ed6-4f2c-b724-9a1b8932bf80	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
82d0fd6f-9324-4a3a-94c0-7a27cc88fcbe	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
0585eac1-4b92-4bee-8262-851bde6aa2bb	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
00295383-2acc-4a0f-a445-e1fda47e753c	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
a1a59ca3-0349-4c24-863e-b0bd5823ca5a	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
938c4fa3-cd1b-4819-8ae3-fb009db972f4	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
742aa027-d14e-49c3-be09-267f4b3ab287	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
2227800a-eb8c-4ca4-897c-b83017f3de3c	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
9d13f852-ab90-4569-bb1d-a74506597f7a	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
9d73ad51-e716-4e4e-923f-43080ae4cdfa	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
b82183b7-d7b2-4079-bfd5-35c676f149c1	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
11467f0f-465b-4eec-944e-4ade3791fc40	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
e70f3c0c-c046-4525-8ca6-a78d1535c32b	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
180cc9b3-1af4-4929-a0e1-99c6394742c1	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
59325d29-23e5-48e5-bbee-b629974edcd3	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
56a8c5fb-ded6-4435-ab4a-5e84377f6cc3	add5b844-038b-4e82-9b89-61623e4e5ce5	7	0
f615a726-0936-4fdd-90aa-c541cc057239	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
6b8e2c61-ed85-43e2-8c91-423c1369d595	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
f0c67b9a-8e63-4636-9d8e-c470f1c6b284	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
9daf8b84-5142-4066-9d40-16caf9246365	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
c5e22033-1303-4c63-af92-93cc2119b7c4	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
fd279e17-cc03-434f-815a-6ff2744d2fc2	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
97611566-9c03-4b93-9a96-e1920dca24bf	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
d97f3bb1-a287-4129-b81d-e9019c877b97	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
6b784c87-ed6c-456b-bb71-de80bcc2ce48	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
0aa624a7-a9d8-4d31-9f10-7124b29c1637	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
e01b0438-9394-4706-bc66-6623ca044893	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
79302dd3-37e7-47df-9488-c54db5221642	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
bb82f084-993b-4fd5-b30e-0135c7588851	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
3470c8e3-cb23-46a0-8be0-324b021e0de0	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
78549d72-8665-48ef-a01d-29991b0c37f9	85948425-e4ea-45a5-99f6-5149c6b8bc82	6	0
dccca622-0424-4634-9273-c06c0b15303e	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
2f5107fe-777d-479e-8b67-eeae90e42d8b	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
cca8c768-146a-41ba-84ba-95fd1a45b74d	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
a6b354d5-4697-4cd3-aa34-78cd6d290ea6	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
992c0890-89e4-4812-b0a0-2776f4a7e7a9	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
e3e6ebd5-dde5-41b8-9c12-f2d44fd0b43d	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
fa3864b8-1a3d-4206-8e16-b97556f1aa68	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
24e0fe63-5165-479b-b81f-768dc7f686d2	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
238bf4f0-d986-4c67-aed4-440e5239fa89	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
772e74f3-3eaf-491b-a95c-7ecf71fab33f	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
d933b1b7-828f-420f-bb6e-96da541fd19d	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
ccfd062f-8b4f-4246-8721-dd5dd15f8425	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
c898c658-5e20-4191-96af-1b484d263027	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
ce6d6560-3650-42a8-a256-c885280db35f	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
6b4a3a48-66f5-4d34-9bb0-26fdc73c3499	7caf2d05-d154-4cc8-bb10-97d0f77da61e	7	0
3b18d46b-b32f-45dd-af51-8e3de846d36f	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
a2d2ef7a-9d6d-4fb9-b583-aa9bbe2b1257	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
9b078675-d457-4d6b-a5da-a2f5b494a62d	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
8711e167-72a8-4e0a-9ba9-91adcfa09bcf	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
a4bc9f1e-2db0-439d-9f4c-9f04725c0862	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
c26a825b-5afc-474a-947f-dd039d2d8fc6	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
0035b751-392c-4ebf-b1a2-ae81c03b2782	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
a3dc51ed-7150-4c84-9d4e-457b580718f4	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
b16b69e6-5f46-4ca3-8914-b3f93bacb765	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
497569e8-1ad2-4766-9ad4-3127dcba0a50	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
b7358801-2102-4ba4-a892-657485a022b1	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
a73fd4bd-7b07-4b84-b353-ed2f0f977c46	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
cfdf07d1-123b-4e38-8eb2-7912350bd986	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
8eaa25bf-e571-4e1f-b29c-90412e84139d	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
98357606-2319-417d-a370-363bfb476b54	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
1f41a137-d871-400f-bec5-96b5b3381bfe	8789d8ef-99c2-4b9c-a968-8eade6eb3642	7	0
a7666d70-9014-451d-b6fd-bc9af03e933e	d106f009-8a6e-4f63-918c-841635b5685d	7	0
aef2f0fd-7987-4114-ba99-d7b521a4c123	d106f009-8a6e-4f63-918c-841635b5685d	7	0
8dbbb0af-84d0-4b52-986f-35f9e4ff20a9	d106f009-8a6e-4f63-918c-841635b5685d	7	0
65f8762d-da88-43f9-b15f-6116f98919de	d106f009-8a6e-4f63-918c-841635b5685d	7	0
fde2322c-3f24-45df-8637-02de1ff6aaf4	d106f009-8a6e-4f63-918c-841635b5685d	7	0
d40923b9-e11a-48f1-9974-7d284e2c70c9	d106f009-8a6e-4f63-918c-841635b5685d	7	0
b87d5b8e-6fa8-485b-aeb1-e38ecf9d3816	d106f009-8a6e-4f63-918c-841635b5685d	7	0
057cbcaf-1ded-452f-b284-5ff5175b9c71	d106f009-8a6e-4f63-918c-841635b5685d	7	0
64544672-5f9c-4c5a-9c32-0d30b3a671c9	d106f009-8a6e-4f63-918c-841635b5685d	7	0
fb5dbfc0-3490-41c4-9b47-df0b0faee86e	d106f009-8a6e-4f63-918c-841635b5685d	7	0
05a4dd64-f2ac-4062-8c8c-27d73360d990	d106f009-8a6e-4f63-918c-841635b5685d	7	0
9a75b069-c845-4dee-9fce-11d7966cb404	d106f009-8a6e-4f63-918c-841635b5685d	7	0
4508cf8b-e2bb-4eec-9374-c3e58ef5eae0	d106f009-8a6e-4f63-918c-841635b5685d	7	0
b8f2f263-94ff-44e8-b223-0b576c76e4d0	d106f009-8a6e-4f63-918c-841635b5685d	7	0
36d22832-1f54-41ee-bf29-d5279978504e	d106f009-8a6e-4f63-918c-841635b5685d	7	0
17ef2fe9-c79a-4230-840b-c9c9da80bc51	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
1543180b-e696-45f2-9bc2-aad59d463010	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
542243cd-9a13-415d-86d4-710fced2d21f	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
514528ab-c68f-4a7f-a610-4c3dee6342c2	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
96ce069a-b6da-41a6-8875-8e4803d47661	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
59c60c8c-108e-4684-b4e8-d8686b938c94	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
86f5939e-2e4b-46b0-a58c-4a2883ac4762	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
5c8b650d-796f-466d-b110-d79abba10fff	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
cdd7c292-0606-40d1-9bf6-448a864b5bc3	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
4c81b543-b8ff-403a-afdf-6a72ee20f45d	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
33252c39-5a1c-4705-824a-a03b16d2fbb3	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
24547be1-807f-4332-9505-fc8a35713272	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
dee89c60-5daa-4074-8c69-aa88ca813236	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
0e56dee9-bc10-464a-bed2-184cc1afb1a4	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
66883738-b903-464b-912f-85e1b2313450	69a8931f-1434-46e9-9a92-b6d01acd0c11	7	0
1b3d512e-cc34-4357-8747-3c103eb8a3d4	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
bb3cc643-8775-4227-a2b8-e4199b6317a0	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
513f51f6-ac9f-4cfb-a26e-5428e02b5324	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
4506a4c2-8bf9-48bc-a927-aa62388b6cc0	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
d7d5548b-3080-4265-820b-85a8cc1422b7	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
d3a0d4e7-a77b-4f8c-b18e-5c6380856477	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
04670199-e0e3-43b2-ac22-8c7afe588584	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
2035219f-56f4-4543-a19e-9e44006330b1	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
42ce7a25-d962-4d5a-8363-9656252f293f	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
d1ac1bb4-8c37-4572-a926-e7f35b472b85	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
82c9544f-d7ec-40ce-a041-3448d48ffc0e	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
8c37a419-d7c8-4cc6-a4d5-d216ac9f02ac	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
6110817f-67fc-4640-9c74-92d3198005f9	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
ec4dd96b-1b83-4bfe-a4eb-d69abe51b1cb	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
3ebc8f1a-343e-4708-8371-b6908f40becb	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
aeda1026-66ac-48a4-8d16-7d086141af9d	cc56d79e-f474-48a8-8d04-5d673d9f5144	6	0
490417c9-4ee4-43f1-9e15-cc7a07733f3e	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
490417c9-4ee4-43f1-9e15-cc7a07733f3e	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
33db44cc-6c41-412f-86a6-605fce9f68c4	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
33db44cc-6c41-412f-86a6-605fce9f68c4	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
15f85944-9711-4d8f-950d-695aad7e7444	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
15f85944-9711-4d8f-950d-695aad7e7444	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
8551a0eb-da42-443e-9104-75ab3acf7f7e	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
8551a0eb-da42-443e-9104-75ab3acf7f7e	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
0a88991d-883c-4b29-bed6-4a7c958c6e03	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
0a88991d-883c-4b29-bed6-4a7c958c6e03	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
02609493-aefe-4016-95ca-51618fa5b728	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
02609493-aefe-4016-95ca-51618fa5b728	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
9a3f9903-a17f-4f0f-8ae7-9c6c972c9c02	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
9a3f9903-a17f-4f0f-8ae7-9c6c972c9c02	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
db9975ba-f115-4e20-8474-0ea32c72d4fe	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
db9975ba-f115-4e20-8474-0ea32c72d4fe	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
3b770794-a37c-4afb-82f7-e90e4383d8f3	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
3b770794-a37c-4afb-82f7-e90e4383d8f3	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
85b21ccc-47ec-4392-8357-81242a4de4cb	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
85b21ccc-47ec-4392-8357-81242a4de4cb	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
98e8fe8e-86a6-4f28-bee9-def2608d674b	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
98e8fe8e-86a6-4f28-bee9-def2608d674b	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
129b9aa5-b050-435c-b248-aa5e3a92a5e6	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
129b9aa5-b050-435c-b248-aa5e3a92a5e6	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
a8a12b76-34de-4dfe-92d8-792eec3132e2	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
a8a12b76-34de-4dfe-92d8-792eec3132e2	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
613790fa-507f-4ad9-8e1d-e6e0ce71b6f8	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
613790fa-507f-4ad9-8e1d-e6e0ce71b6f8	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
94d9f97b-045e-4dfb-8444-e16670ee3ee5	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
94d9f97b-045e-4dfb-8444-e16670ee3ee5	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
3a28b7f0-6a55-404a-a6fc-6cc1bd29c0fd	c531f764-9f0b-4b80-a504-0fc642e1aba4	7	0
3a28b7f0-6a55-404a-a6fc-6cc1bd29c0fd	83f2d0a0-6a1e-458b-85eb-bb183f502109	7	0
c710cdc6-28c6-4fd3-a304-493cba4b5dbc	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
e4881147-c1af-4dc2-9677-f380184c3eef	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
de22fb3f-eee9-47a1-ab58-22ba7e3a83c1	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
9af48930-46f7-42fd-b917-e5a7ffe9a435	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
e7257cdf-5ca5-4eb6-a8b3-37ed8c4e0290	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
5565697c-a914-4625-ac71-c5680e3c4935	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
977f27ca-e18f-471d-973e-ad876ec3d1c1	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
cd19ba03-e869-427a-bab9-0ac6914ec9bf	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
1be3467e-2e33-4c3a-8ca5-70e1e0094981	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
e67737bd-44c7-4a70-b2c7-43962d4d965e	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
ccdfd18a-aaa6-4af3-a556-ba4675e2a9d4	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
c27fe65a-9fe7-4ff2-899f-dd10ca149e3e	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
33ed711c-30fc-4d1e-b17e-c9a44dbd166c	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
1637c17c-d60b-4b44-bf2d-ad4a3082fedd	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
84298ec8-f1a2-42b0-a572-8cddff770cc3	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
46b57663-f611-493b-b99e-b429b001d078	a59cb8cc-fc03-4840-ad10-2241ddb18851	7	0
0d8e3eae-449e-40c1-81d0-aab0e61888bf	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
0d8e3eae-449e-40c1-81d0-aab0e61888bf	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
b23157f1-a264-4c06-9d87-aee8bc2c8ede	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
b23157f1-a264-4c06-9d87-aee8bc2c8ede	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
59808e43-acf9-49ee-abc7-8e1abb93c88f	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
59808e43-acf9-49ee-abc7-8e1abb93c88f	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
81e6f9a2-e046-48e7-99fb-b4d6256f814f	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
81e6f9a2-e046-48e7-99fb-b4d6256f814f	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
1bc26a6b-7c61-4b18-9a5b-5edb3dd57996	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
1bc26a6b-7c61-4b18-9a5b-5edb3dd57996	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
4f95be18-fc34-4cde-affe-ed7308c264ee	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
4f95be18-fc34-4cde-affe-ed7308c264ee	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
d77bb1f0-1ad4-4f67-b0f9-98a51de4075d	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
d77bb1f0-1ad4-4f67-b0f9-98a51de4075d	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
f094ee84-8743-4b22-be0a-6fcdff3660c6	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
f094ee84-8743-4b22-be0a-6fcdff3660c6	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
aeffcdc8-3570-448f-8644-27773d911cbf	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
aeffcdc8-3570-448f-8644-27773d911cbf	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
49706598-06e8-4199-805c-a4632c00b2a4	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
49706598-06e8-4199-805c-a4632c00b2a4	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
5be38d4d-1ef9-40d6-8c63-283841def077	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
5be38d4d-1ef9-40d6-8c63-283841def077	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
37b2f0a7-b3d2-4f65-bec1-426842a16ff8	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
37b2f0a7-b3d2-4f65-bec1-426842a16ff8	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
0a888ebc-fc91-4b7d-8c8c-ccc8657855cd	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
0a888ebc-fc91-4b7d-8c8c-ccc8657855cd	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
74733b06-19ad-4410-bdf7-6a5aad0158ca	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
74733b06-19ad-4410-bdf7-6a5aad0158ca	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
8d12542a-3c73-4261-8cd1-f8654bd124ea	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
8d12542a-3c73-4261-8cd1-f8654bd124ea	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
a9b79927-6eee-4156-856b-3104035ded05	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
a9b79927-6eee-4156-856b-3104035ded05	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
6270104a-7202-4aad-b80f-e20f1d78770e	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
6270104a-7202-4aad-b80f-e20f1d78770e	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
718676e3-a2ba-4ab0-952d-5561974c69e5	74f40025-0078-4e42-b632-87017f3e21b6	8	0
718676e3-a2ba-4ab0-952d-5561974c69e5	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
93405252-6224-4d32-ba34-51c5bf668399	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
93405252-6224-4d32-ba34-51c5bf668399	74f40025-0078-4e42-b632-87017f3e21b6	8	0
862f0280-4572-411f-9dad-a577df20148b	74f40025-0078-4e42-b632-87017f3e21b6	8	0
862f0280-4572-411f-9dad-a577df20148b	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
9b78a074-1ff4-4003-ac13-0b9266c27791	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
9b78a074-1ff4-4003-ac13-0b9266c27791	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
71c1490a-2c68-4c3f-964f-21ebedc5ea39	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
71c1490a-2c68-4c3f-964f-21ebedc5ea39	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
0f33f72a-0f24-443b-997e-def7b7873975	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
0f33f72a-0f24-443b-997e-def7b7873975	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
f63ba0a3-a4c0-4819-8123-5b3a88b84b0c	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
f63ba0a3-a4c0-4819-8123-5b3a88b84b0c	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
99692f50-1077-4a4d-83d7-663a8403058d	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
99692f50-1077-4a4d-83d7-663a8403058d	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
45dd01bd-45c1-45b5-b7c1-23bb42b1910d	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
45dd01bd-45c1-45b5-b7c1-23bb42b1910d	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
725f17df-0cc3-45d9-bc30-5e032534e0e1	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
725f17df-0cc3-45d9-bc30-5e032534e0e1	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
55cacbb9-6b3f-4ec7-895e-1e4aebdab5cd	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
55cacbb9-6b3f-4ec7-895e-1e4aebdab5cd	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
797264d6-69bf-4594-bbb3-b54646f1f394	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
797264d6-69bf-4594-bbb3-b54646f1f394	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
b66ce371-895a-4d69-950b-090190c0be4e	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
b66ce371-895a-4d69-950b-090190c0be4e	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
c716038d-a471-4e0e-a937-2220db8f0285	13bd55a7-0a8d-45db-aed7-f9c031f25e6d	8	0
c716038d-a471-4e0e-a937-2220db8f0285	6e5d41ab-ca1e-47a5-862e-bc296aa09228	8	0
f95bbb7d-1eb4-4f0b-95cd-13a57cee5ac8	74f40025-0078-4e42-b632-87017f3e21b6	8	0
f95bbb7d-1eb4-4f0b-95cd-13a57cee5ac8	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
e44787e1-cd88-46fb-91e5-c52d8f7ed6ec	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
e44787e1-cd88-46fb-91e5-c52d8f7ed6ec	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
afee30c7-fb94-468b-bdd2-26ebeec6f2fd	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
afee30c7-fb94-468b-bdd2-26ebeec6f2fd	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
fa596dba-25a6-4404-94eb-39831a77abc4	f8904604-365d-44f2-90ff-8c4d8de2fec0	8	0
fa596dba-25a6-4404-94eb-39831a77abc4	ca34108d-2a9b-43eb-9340-cf625362fdea	8	0
1c0aa5f9-5eb7-46cb-8d9a-c42667f9f10a	74f40025-0078-4e42-b632-87017f3e21b6	8	0
1c0aa5f9-5eb7-46cb-8d9a-c42667f9f10a	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
4ad46bf0-f17f-4b72-8167-b19b45ed028e	74f40025-0078-4e42-b632-87017f3e21b6	8	0
4ad46bf0-f17f-4b72-8167-b19b45ed028e	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
0564461a-7dc5-4e29-92e8-da66027fe73f	74f40025-0078-4e42-b632-87017f3e21b6	8	0
0564461a-7dc5-4e29-92e8-da66027fe73f	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
e8795a08-e3ed-4f1e-803d-d0c447fd73f0	74f40025-0078-4e42-b632-87017f3e21b6	8	0
e8795a08-e3ed-4f1e-803d-d0c447fd73f0	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
c534b479-7c90-4664-9a2a-c87c92e8b2b0	74f40025-0078-4e42-b632-87017f3e21b6	8	0
c534b479-7c90-4664-9a2a-c87c92e8b2b0	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
30971fb2-789c-45ae-a4e6-7c83c34935bc	74f40025-0078-4e42-b632-87017f3e21b6	8	0
30971fb2-789c-45ae-a4e6-7c83c34935bc	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
d4391211-0a6d-4806-83d3-3644d75ac738	74f40025-0078-4e42-b632-87017f3e21b6	8	0
d4391211-0a6d-4806-83d3-3644d75ac738	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
f3c220b2-1b8c-4bcf-8dae-593d7551171b	74f40025-0078-4e42-b632-87017f3e21b6	8	0
f3c220b2-1b8c-4bcf-8dae-593d7551171b	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
e3535945-39b9-4999-a21b-ff25db7cd9c0	74f40025-0078-4e42-b632-87017f3e21b6	8	0
e3535945-39b9-4999-a21b-ff25db7cd9c0	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
6ffb0518-f5a8-4bb9-ba93-979fd989c2c0	74f40025-0078-4e42-b632-87017f3e21b6	8	0
6ffb0518-f5a8-4bb9-ba93-979fd989c2c0	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
f525d5a7-e991-4553-9224-6cf68a68adb7	74f40025-0078-4e42-b632-87017f3e21b6	8	0
f525d5a7-e991-4553-9224-6cf68a68adb7	d045fd98-2c9a-4482-a8e9-fb9f50b347e8	8	0
b3e20dd8-4982-4c9f-8ad3-7a3168a4ebd7	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
590da68b-6570-4cce-9e70-97a4382d6bee	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
f73b964a-b599-4d49-b316-8d8877475df1	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
c8f31d9e-1ff5-41dd-923c-8557d7fef516	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
adab0856-b3df-4705-a7b6-3185e3673e82	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
cf1cb19a-c4ed-4c7a-b950-134ff189e7ad	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
7acc8641-47a3-428e-b24f-5e8a87893fe4	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
f11c1167-203f-4410-b01d-60b21256bde0	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
ef015365-fd83-4355-b726-29d4062d8343	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
838461bc-378f-4ccc-b320-b94b88b3e786	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
cc5eb504-f993-44fe-be81-7ca9383fd86f	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
54d23faf-5aa6-4cf3-8d40-0c69117b4ba2	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
62e7ff5a-6a18-4a93-9118-e9c95f0a7cd1	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
a8d9f823-6c1e-4377-938a-1347c6d07c93	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
96787a16-42d2-46b6-959e-2217044922b4	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
a3f2371b-fc03-413b-b972-63bc0da2556b	3837200d-f941-46ee-a1ac-f998b13b2aa4	7	0
4e776a9b-c502-4713-81e6-b66c92fd5160	4ab63669-6730-4768-a263-fc02b9090856	7	0
6b11126d-e6d3-4c12-95ea-ef5924661b51	4ab63669-6730-4768-a263-fc02b9090856	7	0
9ed7561f-2d28-4413-a2f1-f678d41126b8	4ab63669-6730-4768-a263-fc02b9090856	7	0
978ae638-6f12-43bc-994a-5d257cdc8bd0	4ab63669-6730-4768-a263-fc02b9090856	7	0
9143e6aa-2ec2-47df-8d95-fdee3d929d84	4ab63669-6730-4768-a263-fc02b9090856	7	0
ea001182-1bd7-46a3-91f5-9cbbfe86a864	4ab63669-6730-4768-a263-fc02b9090856	7	0
e8b32296-6bae-4af1-b0a8-2770679c14f3	4ab63669-6730-4768-a263-fc02b9090856	7	0
f74e5f2c-31ee-4996-ad05-7fd82c6729b5	4ab63669-6730-4768-a263-fc02b9090856	7	0
8b5e21d0-bd8e-4326-ba28-725978075393	4ab63669-6730-4768-a263-fc02b9090856	7	0
82132dac-5dc0-4600-b452-e8a025c3ee51	4ab63669-6730-4768-a263-fc02b9090856	7	0
abfb0d07-d912-4b5f-a7ff-abec7c26f72f	4ab63669-6730-4768-a263-fc02b9090856	7	0
d17e6851-e869-4240-bd99-2959a69cca02	4ab63669-6730-4768-a263-fc02b9090856	7	0
1eda51ef-2ad6-4ff0-911d-b11649dcb4ec	4ab63669-6730-4768-a263-fc02b9090856	7	0
620e2259-9f37-4ac9-bce6-8f45a367dcbc	4ab63669-6730-4768-a263-fc02b9090856	7	0
c14bf4da-0782-41a0-a729-72fa9ac85a43	4ab63669-6730-4768-a263-fc02b9090856	7	0
a8c3751f-7e97-4629-aa1e-54bbe5b8dbee	4ab63669-6730-4768-a263-fc02b9090856	7	0
244026f3-3c30-48b5-9742-79e2c30ea6b8	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
dbceeb66-429a-4aa2-99cc-5b3807370624	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
b8e1a964-3ece-4434-b5ab-049f75bea0de	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
2811362e-dbba-48ee-8ded-3b8fb312757e	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
a5963387-25bb-47a8-ad12-54ce83e456a8	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
208c66f5-bbfc-4932-b6b6-e73045e7d9d0	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
15789fdb-5cf6-414e-ae70-83e5d9b31187	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
2f1a20ec-9a37-4d21-a7f4-61bebd6d4d56	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
0b56ad21-82b4-42fe-9313-0fa284ef03a8	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
5ec907c5-9557-40ab-986c-3a94057496f4	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
68ad53f4-fbf8-4f43-8330-4526beed4129	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
fa076504-9b62-4b35-95cb-e20d0cddc6c4	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
97e85e1f-3d35-4ce4-85b2-e214ee05fa29	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
66756bc7-0be5-49b7-8a0a-00bae832c799	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
b978a71a-c74c-4cb6-a4bd-291bd338bbfa	1e354e3f-4099-4334-a614-3c5941f6b2cc	7	0
719eafa1-8232-4e5c-b25c-10b706d57760	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
3aa36d7a-6ad8-411d-980f-fea8fec79e67	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
1dc44325-790d-475a-8d39-d941852d2b5a	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
827b1388-3212-473a-9a67-1ddacd60bc74	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
32e726f3-21c9-454c-a3e7-fa08911bedf5	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
95a1e322-0ad8-4f54-b8b0-d3326c3b3328	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
d7c5741b-329f-4526-8121-6feaef2f22a0	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
12eacc69-933e-4f48-b749-e0539a5b46b4	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
bfae9e83-c0ac-4b97-ad5d-190a97524960	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
1be4afb4-6229-4954-bcf5-b8f1149d1f42	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
e96ab8d6-0cba-44ac-9710-713b6ddfb048	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
d15cba86-f27f-41de-b010-85c8abb35aa4	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
26ad9d0c-f9b8-4e59-9345-def9c4e3f4d2	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
8b3b1a97-415d-4089-a02d-ae6be35f7399	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
9b72ad20-4dc9-421f-85d4-b6a0f15801f5	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
7030f248-41f8-45d4-a276-802b93d5044c	cf08dee5-3447-49fb-8dbb-4f90e8f9b178	7	0
\.


--
-- Data for Name: tour_availability; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_availability (tour_id, mode, total_capacity, updated_at) FROM stdin;
\.


--
-- Data for Name: tour_destinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_destinations (tour_id, destination_id) FROM stdin;
db1583d7-156f-4c73-8e0e-e61cc5eac04c	36f605b8-2d57-424e-9fd7-60c064fe054e
db1583d7-156f-4c73-8e0e-e61cc5eac04c	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
de687d5f-4b18-4edd-8eda-807a1e6021ef	55511666-cf14-421a-b773-eeee05ab308f
ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	3a24c00c-fa37-4c35-a727-30a288f90129
ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	36f605b8-2d57-424e-9fd7-60c064fe054e
ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
7b73b43a-7ac4-467a-a0ff-668736ded876	36f605b8-2d57-424e-9fd7-60c064fe054e
7b73b43a-7ac4-467a-a0ff-668736ded876	36fc4915-b27d-4bc3-ae09-b527efe45a77
7b73b43a-7ac4-467a-a0ff-668736ded876	c84f6c57-8b2d-411f-9ba5-285f2eb8ca3e
0050eece-311b-427b-8cca-996362950d27	36fc4915-b27d-4bc3-ae09-b527efe45a77
0050eece-311b-427b-8cca-996362950d27	36f605b8-2d57-424e-9fd7-60c064fe054e
0050eece-311b-427b-8cca-996362950d27	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
48216cfe-fb0d-4f88-8886-f8e6f1c768c1	55511666-cf14-421a-b773-eeee05ab308f
48216cfe-fb0d-4f88-8886-f8e6f1c768c1	084d55cf-f2d5-4f56-97ca-8ac00cb4087c
1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	d1496a97-dfd3-49d9-b792-8cb74bd520ad
1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	97102495-84e6-436a-8eb1-e7edf0227c86
1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2f275b73-0b8f-4251-ba67-d2a69a046e07
cf9c4c10-cb65-4809-b97d-f2da3b8960c8	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc
cf9c4c10-cb65-4809-b97d-f2da3b8960c8	9c2b179c-0f79-437d-b84d-30eee3da3313
cf9c4c10-cb65-4809-b97d-f2da3b8960c8	cb4dd5d8-59b6-47da-ad56-324fb3c96662
f5d69c5b-0635-43bd-9c0d-51ceabadf201	36fc4915-b27d-4bc3-ae09-b527efe45a77
f5d69c5b-0635-43bd-9c0d-51ceabadf201	36f605b8-2d57-424e-9fd7-60c064fe054e
f5d69c5b-0635-43bd-9c0d-51ceabadf201	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
71e890c8-2e87-44b3-b5c3-d04b815d70d7	36fc4915-b27d-4bc3-ae09-b527efe45a77
71e890c8-2e87-44b3-b5c3-d04b815d70d7	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
13435108-836b-427e-9e78-4f16ffe841b6	36fc4915-b27d-4bc3-ae09-b527efe45a77
13435108-836b-427e-9e78-4f16ffe841b6	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
f73d46c4-c167-4371-a318-468d9d8269fe	55511666-cf14-421a-b773-eeee05ab308f
f73d46c4-c167-4371-a318-468d9d8269fe	084d55cf-f2d5-4f56-97ca-8ac00cb4087c
f73d46c4-c167-4371-a318-468d9d8269fe	36f605b8-2d57-424e-9fd7-60c064fe054e
f73d46c4-c167-4371-a318-468d9d8269fe	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
13fcbd1a-14e3-47df-9fce-f57f6ff2694f	023588d3-884a-4486-a987-5e9c7e9c015c
13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2239a52a-9f27-4df0-89e9-525e9622c3fc
99ad6b22-e9fe-4c72-b92b-84595de4f1b4	6d53a473-4153-4478-b4e2-87ca0e20a77b
99ad6b22-e9fe-4c72-b92b-84595de4f1b4	325e3920-c657-4edb-9a36-bcdf9fde014f
bb38656c-40f7-4b5a-97bb-401927daa1ae	5489d3fd-9970-4016-a50b-75cefb2e8949
bb38656c-40f7-4b5a-97bb-401927daa1ae	f1e1d801-8ce7-4b81-9605-8c0f1e59e0d3
4b10b727-136a-4942-a888-49513425164c	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc
841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	cb4dd5d8-59b6-47da-ad56-324fb3c96662
b0018478-834e-4bf0-abf6-6d3b44b1acec	9c2b179c-0f79-437d-b84d-30eee3da3313
b0018478-834e-4bf0-abf6-6d3b44b1acec	b15d842c-34ee-4d1c-a0a7-c9895fcb24dc
e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	36fc4915-b27d-4bc3-ae09-b527efe45a77
e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	36f605b8-2d57-424e-9fd7-60c064fe054e
e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
ed84ea48-915b-4857-bef2-540b3d396616	36fc4915-b27d-4bc3-ae09-b527efe45a77
ed84ea48-915b-4857-bef2-540b3d396616	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
39596113-bf53-4c77-8d0b-affaabb30a9f	36fc4915-b27d-4bc3-ae09-b527efe45a77
39596113-bf53-4c77-8d0b-affaabb30a9f	36f605b8-2d57-424e-9fd7-60c064fe054e
39596113-bf53-4c77-8d0b-affaabb30a9f	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
86b698b2-aa4a-409d-93c3-b2f32ef5932c	3a24c00c-fa37-4c35-a727-30a288f90129
86b698b2-aa4a-409d-93c3-b2f32ef5932c	f8889113-3b88-46c0-ada0-8fb0dd4b2da4
cebedd8f-a91a-44ca-82d7-a8c814290735	fc1d1251-15e0-4dea-bf78-efbe434a914b
cebedd8f-a91a-44ca-82d7-a8c814290735	e3ca55d0-31b2-480c-9d18-e8e0e9dbc56b
a52e3b15-970d-440b-a449-16b38fbd1f74	ded914c3-9f36-4421-a54c-0f7fea77fc4d
a52e3b15-970d-440b-a449-16b38fbd1f74	94244faf-8d2a-4665-b21d-868592ce4f6d
54a64fbb-a198-4a52-bb05-b4826eadb6d6	af4fedbb-bf03-4c54-96d0-bab67ca6dc19
54a64fbb-a198-4a52-bb05-b4826eadb6d6	28c217ab-298b-4a38-af72-ba7233b2da7c
e681fcb2-4cce-4a59-adf3-e5e111d573e6	03a9ee6c-f0c6-47c2-b2ab-8e3f3614e54e
e681fcb2-4cce-4a59-adf3-e5e111d573e6	97102495-84e6-436a-8eb1-e7edf0227c86
f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	29a7d6bf-7860-46a6-900a-05f01a4e2e96
f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	90fca831-5d85-4cdf-bbe5-b0049b30bafd
d7798d79-c50f-4d0b-a025-fe7ab9366703	0a5b6408-4b91-4f8d-846e-b02dcdd6cc16
d7798d79-c50f-4d0b-a025-fe7ab9366703	084d55cf-f2d5-4f56-97ca-8ac00cb4087c
7df8b9f0-242a-4859-b009-340bf5453b80	badc1354-056a-478b-9e96-335674907dc5
7df8b9f0-242a-4859-b009-340bf5453b80	7ecf0fd9-eb8d-4c76-8aa4-7af77c4439dc
\.


--
-- Data for Name: tour_itineraries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_itineraries (id, tour_id, day_number, title, description, accommodation_name, accommodation_type, meals_included, created_at) FROM stdin;
87e7b165-e7c4-41b4-933d-9521421dcedc	db1583d7-156f-4c73-8e0e-e61cc5eac04c	1	Arusha to Lake Manyara National Park	Morning pickup from Arusha. Drive to Lake Manyara for afternoon game drive searching for tree-climbing lions.	Manyara Wildlife Lodge	MID_RANGE	Lunch, Dinner	2026-09-26 17:07:27.769
f08bdc1f-ddd6-4583-b1b1-870c063d064b	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2	Lake Manyara to Central Serengeti Plains	Drive through Ngorongoro highlands into the vast Serengeti plains. Afternoon game drive in Seronera region.	Serengeti Heritage Tented Camp	MID_RANGE	Breakfast, Lunch, Dinner	2026-09-26 17:07:27.769
829c1cb0-24af-405f-9eeb-3a528bed4f4b	db1583d7-156f-4c73-8e0e-e61cc5eac04c	3	Full Day Game Drive in Serengeti National Park	Full day exploring central Serengeti. Track lion prides, leopards lounging in acacia trees, and cheetah hunts.	Serengeti Heritage Tented Camp	MID_RANGE	Breakfast, Lunch, Dinner	2026-09-26 17:07:27.769
f25e11ff-f546-4990-8b91-cf1b110c260d	db1583d7-156f-4c73-8e0e-e61cc5eac04c	4	Serengeti to Ngorongoro Conservation Area	Early morning game drive in Serengeti. Afternoon transit to the rim of Ngorongoro Crater for sunset views.	Rhino Lodge Ngorongoro	MID_RANGE	Breakfast, Lunch, Dinner	2026-09-26 17:07:27.769
35ab4318-4108-4316-8ff2-0b7a80e17c59	db1583d7-156f-4c73-8e0e-e61cc5eac04c	5	Ngorongoro Crater Floor & Return to Arusha	Descend 600m into the crater floor for a 5-hour game drive. Spot rare black rhinos. Return to Arusha in evening.	N/A (Departure)	MID_RANGE	Breakfast, Lunch	2026-09-26 17:07:27.769
062c3c84-9bbe-4c82-a513-1b135e239551	de687d5f-4b18-4edd-8eda-807a1e6021ef	1	Fly Nairobi to Masai Mara & Afternoon Safari	Board bush plane from Wilson Airport to Masai Mara. Arrive at luxury camp for lunch followed by afternoon game drive.	Ashnil Mara Luxury Camp	LUXURY	Lunch, Dinner	2026-09-26 17:07:27.794
ac270bbd-d49a-4891-960d-cebbbfb7aa73	de687d5f-4b18-4edd-8eda-807a1e6021ef	2	Full Day Game Viewing in Masai Mara	Full day game drive along Mara River tracking wildebeest migration crossings and big cats.	Ashnil Mara Luxury Camp	LUXURY	Breakfast, Lunch, Dinner	2026-09-26 17:07:27.794
61221e14-8524-436e-b398-344bb8535ebb	de687d5f-4b18-4edd-8eda-807a1e6021ef	3	Early Morning Safari & Fly Back to Nairobi	Final sunrise game drive. Breakfast at camp before transferring to airstrip for return flight to Nairobi.	N/A (Departure)	LUXURY	Breakfast	2026-09-26 17:07:27.794
a7c04610-d8e0-4f28-9184-2174a4a6b41b	fe28c470-d608-4792-a60e-891a0f15be4f	1	Arrival	Arrive	Lodge	\N	Dinner	2026-09-26 18:10:53.093
61fe83af-22ad-40ea-9606-a5abf4d2a8ad	684eafde-f233-4f87-b8a5-76a45cb18253	1	Tarangire National Park Game Drive	Explore the home of elephant herds and ancient baobabs.	Tarangire Safari Camp	\N	Lunch, Dinner	2026-10-12 20:34:15.545
507e9a91-839a-4a24-a15b-1185340a6d56	684eafde-f233-4f87-b8a5-76a45cb18253	2	Ngorongoro Crater Floor Safari	Descend 600m to seek out black rhino and resident lion prides.	Ngorongoro Serena Lodge	\N	Breakfast, Lunch, Dinner	2026-10-12 20:34:15.545
b8202e38-dc46-4479-8542-e4902a62bf72	7c0f3706-def2-4435-a0f0-8af36ea2217b	1	Tarangire National Park Game Drive	Explore the home of elephant herds and ancient baobabs.	Tarangire Safari Camp	\N	Lunch, Dinner	2026-10-12 20:35:00.66
6cb8babd-bccf-4f71-a9df-34df48211ba4	7c0f3706-def2-4435-a0f0-8af36ea2217b	2	Ngorongoro Crater Floor Safari	Descend 600m to seek out black rhino and resident lion prides.	Ngorongoro Serena Lodge	\N	Breakfast, Lunch, Dinner	2026-10-12 20:35:00.66
9b9ac460-e1fd-4d25-ad75-9cd52b2facf6	4b10b727-136a-4942-a888-49513425164c	1	Arrival in Entebbe	Meet your guide in Entebbe for a safari briefing, then settle in for the night.	Luxury lodge	LUXURY	Dinner	2026-10-19 18:20:33.88
afa5e4e3-dabe-4dc2-ac05-a718f349836c	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.496
614bf7aa-e5b9-44c9-8136-d3de06c15b61	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2	Lake Manyara National Park	Full day exploring Lake Manyara National Park with morning and afternoon game drives, looking for elephant, giraffe, baboon.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.496
1297544d-ce62-4212-bbd7-80adf38064b6	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	3	Lake Manyara National Park	Full day exploring Lake Manyara National Park with morning and afternoon game drives, looking for elephant, giraffe, baboon.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.496
4dbe74a3-bedf-416e-96d2-1f8cf425e892	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	4	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.496
f8db22bd-df46-4721-be80-4a5ca4f66068	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	5	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.496
b20a0a33-5c14-44e5-b768-86d9c0716fa1	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	6	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.496
10adb835-97f5-43ce-b259-d574573d5dce	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	7	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.496
c25eeef1-d047-496b-9114-ad01dc6909ec	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	8	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.496
99091d97-8387-46ae-9335-c5fad0d120ec	7b73b43a-7ac4-467a-a0ff-668736ded876	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Budget tented camp	BUDGET	Dinner	2026-10-19 18:20:33.527
102b89ed-be14-4540-888b-eb31971bd2dd	7b73b43a-7ac4-467a-a0ff-668736ded876	2	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
78b15610-4b25-4652-ad86-bde446f309d6	7b73b43a-7ac4-467a-a0ff-668736ded876	3	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
f120b0b9-e689-4cd3-9111-bd8ca00d61f4	7b73b43a-7ac4-467a-a0ff-668736ded876	4	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
851022d3-a906-499e-88d5-195717046e8c	7b73b43a-7ac4-467a-a0ff-668736ded876	5	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
3d04ba74-f7d2-4b86-a7f7-244ee3c44236	7b73b43a-7ac4-467a-a0ff-668736ded876	6	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
7af76339-d9a4-4c8b-bf96-382b8942fb4a	7b73b43a-7ac4-467a-a0ff-668736ded876	7	Zanzibar	Full day exploring Zanzibar with morning and afternoon game drives, looking for red colobus, dolphin, sea turtle.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
bc5465e8-fc5c-4fbc-9c32-1f4ad83a8ad0	7b73b43a-7ac4-467a-a0ff-668736ded876	8	Zanzibar	Full day exploring Zanzibar with morning and afternoon game drives, looking for red colobus, dolphin, sea turtle.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.527
272b1957-fc3b-40e2-978c-181263af7595	7b73b43a-7ac4-467a-a0ff-668736ded876	9	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	BUDGET	Breakfast & lunch	2026-10-19 18:20:33.527
f318d678-e952-4876-86f2-3741a517d469	0050eece-311b-427b-8cca-996362950d27	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.556
3f121c03-6c57-4314-a226-6cedf916632c	0050eece-311b-427b-8cca-996362950d27	2	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
d988c4e0-e6ab-4cd4-9ebe-a87d05ce261e	0050eece-311b-427b-8cca-996362950d27	3	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
a6ba99e7-2150-4734-a3b7-7b1a09595867	0050eece-311b-427b-8cca-996362950d27	4	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
ff25c27a-3be4-4bf4-b284-1609dfa251b3	0050eece-311b-427b-8cca-996362950d27	5	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
0cd55c1e-5743-49a5-a607-d022d4e4ca74	0050eece-311b-427b-8cca-996362950d27	6	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
0f6f88c6-77ec-45e6-b820-071ac19cb970	0050eece-311b-427b-8cca-996362950d27	7	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
d1b4bd34-d0d8-4870-9078-41e9c4f07f8b	0050eece-311b-427b-8cca-996362950d27	8	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
cd68d1bd-34c5-4983-8403-0f737c985ff4	0050eece-311b-427b-8cca-996362950d27	9	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.556
7ad90faa-e703-4bb6-81a6-8149bf896b77	0050eece-311b-427b-8cca-996362950d27	10	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.556
2589d994-f525-414b-a94c-742de3e45f6b	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	1	Arrival in Nairobi	Meet your guide in Nairobi for a safari briefing, then settle in for the night.	Budget tented camp	BUDGET	Dinner	2026-10-19 18:20:33.59
e304b8c9-f45f-4248-8997-d9a295b4804a	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2	Masai Mara National Reserve	Full day exploring Masai Mara National Reserve with morning and afternoon game drives, looking for wildlife.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.59
8eb68436-8889-4b1b-9e6f-a1700a3765ab	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	3	Masai Mara National Reserve	Full day exploring Masai Mara National Reserve with morning and afternoon game drives, looking for wildlife.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.59
af5d570d-9302-4f8b-9703-c580a540d599	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	4	Masai Mara National Reserve	Full day exploring Masai Mara National Reserve with morning and afternoon game drives, looking for wildlife.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.59
91a8ca4b-f215-49ad-8ab8-48b3de7c6d71	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	5	Amboseli National Park	Full day exploring Amboseli National Park with morning and afternoon game drives, looking for elephant, lion, buffalo.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.59
7a532db6-f454-46ff-b482-fcc92f6f2316	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	6	Amboseli National Park	Full day exploring Amboseli National Park with morning and afternoon game drives, looking for elephant, lion, buffalo.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:33.59
7250bb3d-da20-498f-adc2-5a3ad7caa1fd	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	7	Departure	A final morning activity, then transfer back to Nairobi for your onward journey.	\N	BUDGET	Breakfast & lunch	2026-10-19 18:20:33.59
c9c78b13-3dd4-459b-95be-1298b3089e71	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	1	Arrival in Maun	Meet your guide in Maun for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.621
1ad5236b-859b-45e5-8b03-a575334395a7	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2	Okavango Delta	Full day exploring Okavango Delta with morning and afternoon game drives, looking for lion, leopard, wild dog.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
35dc3022-dff6-45f9-8731-e59ac786dc48	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	3	Okavango Delta	Full day exploring Okavango Delta with morning and afternoon game drives, looking for lion, leopard, wild dog.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
a34bf1f9-ef8a-4edc-8cc4-aa0212299df2	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	4	Okavango Delta	Full day exploring Okavango Delta with morning and afternoon game drives, looking for lion, leopard, wild dog.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
daf7fc32-0c9a-47f7-ab1f-c26d723469d8	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	5	Chobe National Park	Full day exploring Chobe National Park with morning and afternoon game drives, looking for elephant, buffalo, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
727f10db-5905-4b89-a552-ed2f7fad22be	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	6	Chobe National Park	Full day exploring Chobe National Park with morning and afternoon game drives, looking for elephant, buffalo, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
37e1d48a-5a31-403d-9ce6-b8a3776eb08d	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	7	Central Kalahari Game Reserve	Full day exploring Central Kalahari Game Reserve with morning and afternoon game drives, looking for black-maned lion, cheetah, gemsbok.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
1986cff3-40fc-4295-b319-ea9829fc07b7	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	8	Central Kalahari Game Reserve	Full day exploring Central Kalahari Game Reserve with morning and afternoon game drives, looking for black-maned lion, cheetah, gemsbok.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.621
f2141292-7124-4ac9-a7bf-c1c16216227f	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	9	Departure	A final morning activity, then transfer back to Maun for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.621
c318c4ec-2c91-4485-a457-1d0ffe070a35	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	1	Arrival in Entebbe	Meet your guide in Entebbe for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.65
8210863c-420d-4f9f-b335-e977c5e4635f	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2	Bwindi Impenetrable National Park	Full day exploring Bwindi Impenetrable National Park with morning and afternoon game drives, looking for mountain gorilla, chimpanzee, forest elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.65
8b4a2ce2-110b-4589-946c-6c5608e682ae	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	3	Bwindi Impenetrable National Park	Full day exploring Bwindi Impenetrable National Park with morning and afternoon game drives, looking for mountain gorilla, chimpanzee, forest elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.65
d88fcb9f-142f-4ff7-8074-c744b92ae74b	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	4	Queen Elizabeth National Park	Full day exploring Queen Elizabeth National Park with morning and afternoon game drives, looking for tree-climbing lion, hippo, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.65
2471dd13-b4d4-4a6f-85d5-867eb7f2fc91	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	5	Queen Elizabeth National Park	Full day exploring Queen Elizabeth National Park with morning and afternoon game drives, looking for tree-climbing lion, hippo, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.65
33d18fce-cec2-4f5e-9ba8-e586ac4726cf	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	6	Murchison Falls National Park	Full day exploring Murchison Falls National Park with morning and afternoon game drives, looking for giraffe, elephant, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.65
33294967-136f-4593-b024-b687e06a721f	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	7	Murchison Falls National Park	Full day exploring Murchison Falls National Park with morning and afternoon game drives, looking for giraffe, elephant, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.65
e2b19957-dc60-44ab-8033-66200adfb322	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	8	Departure	A final morning activity, then transfer back to Entebbe for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.65
b25099a7-1763-411c-bbc2-24ddbe14e725	f5d69c5b-0635-43bd-9c0d-51ceabadf201	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Luxury lodge	LUXURY	Dinner	2026-10-19 18:20:33.677
1792cd40-4a3b-40b6-b75f-01cab4f345c4	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.677
974a2206-0549-45b5-9b50-9584498be6b9	f5d69c5b-0635-43bd-9c0d-51ceabadf201	3	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.677
6b2b96d7-a1f9-4b76-a60d-f0f2a792a340	f5d69c5b-0635-43bd-9c0d-51ceabadf201	4	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.677
6b2d6618-3b07-4acd-8958-1d610e32a89d	f5d69c5b-0635-43bd-9c0d-51ceabadf201	5	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.677
b6ec2dcb-2ad9-4b29-a158-0c1ec211f35f	f5d69c5b-0635-43bd-9c0d-51ceabadf201	6	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.677
74b9b1e2-f705-4f50-bffb-6173868e3e67	f5d69c5b-0635-43bd-9c0d-51ceabadf201	7	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	LUXURY	Breakfast & lunch	2026-10-19 18:20:33.677
334675f8-6ba5-4b7e-bea2-9d78fc3b5e72	71e890c8-2e87-44b3-b5c3-d04b815d70d7	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.704
cbf7bb13-7f19-4a18-bd86-239ada40ae35	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.704
5f323755-8f9e-477d-91d8-85cd3a1022e1	71e890c8-2e87-44b3-b5c3-d04b815d70d7	3	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.704
f73609dc-dd91-40a4-a291-5498b6d89556	71e890c8-2e87-44b3-b5c3-d04b815d70d7	4	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.704
916220c7-b981-4ee5-8d4f-ed580e253e21	13435108-836b-427e-9e78-4f16ffe841b6	1	Arrival in Arusha	Pick-up in Arusha and drive to Tarangire National Park for an afternoon game drive.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.731
a0deb77d-9ef0-4cba-aea5-1019c82dbd3e	13435108-836b-427e-9e78-4f16ffe841b6	2	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.731
2a836fd9-90dd-4f3e-9c6b-63868d1fd8f6	f73d46c4-c167-4371-a318-468d9d8269fe	1	Arrival in Nairobi	Meet your guide in Nairobi for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.758
ad56506a-e944-46f3-afad-9c5b2da216ba	f73d46c4-c167-4371-a318-468d9d8269fe	2	Masai Mara National Reserve	Full day exploring Masai Mara National Reserve with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
649c36e8-6850-470c-a27f-cbbac38f1603	f73d46c4-c167-4371-a318-468d9d8269fe	3	Masai Mara National Reserve	Full day exploring Masai Mara National Reserve with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
fa0dc197-a912-4f09-854e-3e44efe51ea6	f73d46c4-c167-4371-a318-468d9d8269fe	4	Amboseli National Park	Full day exploring Amboseli National Park with morning and afternoon game drives, looking for elephant, lion, buffalo.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
013404b2-65ab-4faa-97f4-fd6a394b7d58	f73d46c4-c167-4371-a318-468d9d8269fe	5	Amboseli National Park	Full day exploring Amboseli National Park with morning and afternoon game drives, looking for elephant, lion, buffalo.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
ed02f4e7-c481-4793-bebd-2098c60aeff8	f73d46c4-c167-4371-a318-468d9d8269fe	6	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
0fa5989c-f4dd-4b07-abeb-941dc5ac4d34	f73d46c4-c167-4371-a318-468d9d8269fe	7	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
ebc1cad2-1283-4b1e-8381-d590407f5fd9	f73d46c4-c167-4371-a318-468d9d8269fe	8	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.758
1251cb3b-6d90-46d0-95f8-7e958e811046	f73d46c4-c167-4371-a318-468d9d8269fe	9	Departure	A final morning activity, then transfer back to Nairobi for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.758
5fde0608-c772-4f07-9f1b-29245c2d01c3	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	1	Arrival in Kigali	Meet your guide in Kigali for a safari briefing, then settle in for the night.	Luxury lodge	LUXURY	Dinner	2026-10-19 18:20:33.786
c5c50717-b248-47e0-8c12-43caa724dd8b	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2	Volcanoes National Park	Full day exploring Volcanoes National Park with morning and afternoon game drives, looking for mountain gorilla, golden monkey.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.786
40c594ec-5eb2-4eda-ba98-365860130519	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	3	Volcanoes National Park	Full day exploring Volcanoes National Park with morning and afternoon game drives, looking for mountain gorilla, golden monkey.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.786
f31f601c-e9fe-4083-877c-0ce1ff6469f3	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	4	Akagera National Park	Full day exploring Akagera National Park with morning and afternoon game drives, looking for lion, rhino, elephant.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.786
d1889852-5106-4819-9ec5-b95bf9cf451d	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	5	Departure	A final morning activity, then transfer back to Kigali for your onward journey.	\N	LUXURY	Breakfast & lunch	2026-10-19 18:20:33.786
6423fc96-dbcc-4d59-9fda-6e1cf87621d4	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	1	Arrival in Johannesburg	Meet your guide in Johannesburg for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.814
c8ced934-3227-4f75-87dd-5b7c2d0c48fb	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2	Kruger National Park	Full day exploring Kruger National Park with morning and afternoon game drives, looking for lion, leopard, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.814
df07c087-23a2-4d01-b397-a18806c917a4	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	3	Kruger National Park	Full day exploring Kruger National Park with morning and afternoon game drives, looking for lion, leopard, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.814
ea340093-57e3-4355-a0aa-b38d797d200d	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	4	Sabi Sand Nature Reserve	Full day exploring Sabi Sand Nature Reserve with morning and afternoon game drives, looking for leopard, lion, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.814
677bed5e-92c3-447a-8ffb-ffffd184e099	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	5	Sabi Sand Nature Reserve	Full day exploring Sabi Sand Nature Reserve with morning and afternoon game drives, looking for leopard, lion, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.814
124b4c5a-72f0-4488-89d4-67fd3039b9a6	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	6	Departure	A final morning activity, then transfer back to Johannesburg for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.814
1d6542d1-3dfd-41cc-96e3-ee4d7959f037	bb38656c-40f7-4b5a-97bb-401927daa1ae	1	Arrival in Windhoek	Meet your guide in Windhoek for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.843
07997f63-a99e-4436-b159-4a161db7bbe2	bb38656c-40f7-4b5a-97bb-401927daa1ae	2	Sossusvlei	Full day exploring Sossusvlei with morning and afternoon game drives, looking for oryx, springbok, ostrich.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
16313642-47b5-459c-8530-6dbe1fea1559	bb38656c-40f7-4b5a-97bb-401927daa1ae	3	Sossusvlei	Full day exploring Sossusvlei with morning and afternoon game drives, looking for oryx, springbok, ostrich.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
ec0b9825-3223-4800-b8dd-9f47215ef21d	bb38656c-40f7-4b5a-97bb-401927daa1ae	4	Sossusvlei	Full day exploring Sossusvlei with morning and afternoon game drives, looking for oryx, springbok, ostrich.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
598cfc4a-6e81-4435-bb0e-1da810a3b01b	bb38656c-40f7-4b5a-97bb-401927daa1ae	5	Sossusvlei	Full day exploring Sossusvlei with morning and afternoon game drives, looking for oryx, springbok, ostrich.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
38c92cfd-3747-43af-a8de-0a60427dc575	bb38656c-40f7-4b5a-97bb-401927daa1ae	6	Etosha National Park	Full day exploring Etosha National Park with morning and afternoon game drives, looking for black rhino, lion, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
9bb9090b-6e75-482c-99d7-cfc2368a00cd	bb38656c-40f7-4b5a-97bb-401927daa1ae	7	Etosha National Park	Full day exploring Etosha National Park with morning and afternoon game drives, looking for black rhino, lion, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
df661932-1a07-446d-9686-a94b4ff61645	bb38656c-40f7-4b5a-97bb-401927daa1ae	8	Etosha National Park	Full day exploring Etosha National Park with morning and afternoon game drives, looking for black rhino, lion, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
e1895c20-0148-48fa-93ec-f789c18ad673	bb38656c-40f7-4b5a-97bb-401927daa1ae	9	Etosha National Park	Full day exploring Etosha National Park with morning and afternoon game drives, looking for black rhino, lion, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.843
da676e61-eb36-4d05-9568-fc6a87528959	bb38656c-40f7-4b5a-97bb-401927daa1ae	10	Departure	A final morning activity, then transfer back to Windhoek for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.843
0000ba42-0607-497f-b328-4dd318237327	4b10b727-136a-4942-a888-49513425164c	2	Bwindi Impenetrable National Park	Full day exploring Bwindi Impenetrable National Park with morning and afternoon game drives, looking for mountain gorilla, chimpanzee, forest elephant.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.88
f9c71333-0e21-492d-84b1-d9388cf42f0e	4b10b727-136a-4942-a888-49513425164c	3	Bwindi Impenetrable National Park	Full day exploring Bwindi Impenetrable National Park with morning and afternoon game drives, looking for mountain gorilla, chimpanzee, forest elephant.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:33.88
e42029f1-cc8a-4b08-8eb8-3a9dc870099a	4b10b727-136a-4942-a888-49513425164c	4	Departure	A final morning activity, then transfer back to Entebbe for your onward journey.	\N	LUXURY	Breakfast & lunch	2026-10-19 18:20:33.88
6d61fcb9-c2fd-40e8-bedd-10f09f3e50b8	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	1	Arrival in Kampala	Meet your guide in Kampala for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.906
62adbd8d-df6d-437d-9c63-b652229b928a	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2	Murchison Falls National Park	Full day exploring Murchison Falls National Park with morning and afternoon game drives, looking for giraffe, elephant, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.906
17c1ba91-1560-4893-8358-4aedb5114d85	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	3	Departure	A final morning activity, then transfer back to Kampala for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.906
658aa50c-25e7-46da-a3be-71c890c35366	b0018478-834e-4bf0-abf6-6d3b44b1acec	1	Arrival in Entebbe	Meet your guide in Entebbe for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.933
138651e3-d74b-45ad-8157-53eac9df534f	b0018478-834e-4bf0-abf6-6d3b44b1acec	2	Queen Elizabeth National Park	Full day exploring Queen Elizabeth National Park with morning and afternoon game drives, looking for tree-climbing lion, hippo, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.933
8a4365bd-77a3-498b-b18f-d7fef17295d1	b0018478-834e-4bf0-abf6-6d3b44b1acec	3	Queen Elizabeth National Park	Full day exploring Queen Elizabeth National Park with morning and afternoon game drives, looking for tree-climbing lion, hippo, elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.933
4d5a3a60-26f8-4441-ad4d-de247bf5d427	b0018478-834e-4bf0-abf6-6d3b44b1acec	4	Bwindi Impenetrable National Park	Full day exploring Bwindi Impenetrable National Park with morning and afternoon game drives, looking for mountain gorilla, chimpanzee, forest elephant.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.933
6e0b5c28-f3ad-423e-bff8-aed34e86186f	b0018478-834e-4bf0-abf6-6d3b44b1acec	5	Departure	A final morning activity, then transfer back to Entebbe for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.933
d0b6a470-06a6-48a3-9ef1-def7a27e5627	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.961
4a41a1e7-1fab-49c4-b512-c2445c8dfd6c	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.961
8236b08d-5fda-4e83-b28b-533d6bf2e17f	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	3	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.961
5f1bf8c1-0a24-4b2a-824d-f8645a67d43b	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	4	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.961
15a89f86-3797-45b0-8d13-4eb3c6cd6e6c	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	5	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.961
606d37e3-1be7-492b-9ea2-9bcfc9e3f688	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	6	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.961
f9d24c36-3992-4063-aaa1-645dc6d385f3	ed84ea48-915b-4857-bef2-540b3d396616	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:33.989
76d185a9-81c7-4238-955f-dc6c50382b53	ed84ea48-915b-4857-bef2-540b3d396616	2	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:33.989
91304f1c-4933-4704-b6f3-e14177ac5a6b	ed84ea48-915b-4857-bef2-540b3d396616	3	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:33.989
8de77827-a675-4409-9d5e-9827a71d27d7	39596113-bf53-4c77-8d0b-affaabb30a9f	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Luxury lodge	LUXURY	Dinner	2026-10-19 18:20:34.016
8e09fbf0-c526-466f-a429-8209d5f44a7a	39596113-bf53-4c77-8d0b-affaabb30a9f	2	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.016
c4432e0b-cad9-4646-afce-bff24605221c	39596113-bf53-4c77-8d0b-affaabb30a9f	3	Tarangire National Park	Full day exploring Tarangire National Park with morning and afternoon game drives, looking for elephant, lion, leopard.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.016
12d0775f-88be-4def-a8e3-269841861e3b	39596113-bf53-4c77-8d0b-affaabb30a9f	4	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.016
04d280b8-b243-4916-bd8b-6eaafd2bd025	39596113-bf53-4c77-8d0b-affaabb30a9f	5	Serengeti National Park	Full day exploring Serengeti National Park with morning and afternoon game drives, looking for wildlife.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.016
cf1a012a-be0b-4044-a11c-b3e9e4e367d0	39596113-bf53-4c77-8d0b-affaabb30a9f	6	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.016
62d218fc-6f60-4b65-950e-46e9a8b7f31b	39596113-bf53-4c77-8d0b-affaabb30a9f	7	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	LUXURY	Breakfast & lunch	2026-10-19 18:20:34.016
8b9c09a6-50e4-4a68-98f1-bc01c5749a4d	86b698b2-aa4a-409d-93c3-b2f32ef5932c	1	Arrival in Arusha	Meet your guide in Arusha for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:34.044
4577de79-47a2-490b-a36e-61a5ae1b67aa	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2	Lake Manyara National Park	Full day exploring Lake Manyara National Park with morning and afternoon game drives, looking for elephant, giraffe, baboon.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.044
bb54765d-56a9-4281-bc00-3f53a00bf83d	86b698b2-aa4a-409d-93c3-b2f32ef5932c	3	Ngorongoro Crater	Full day exploring Ngorongoro Crater with morning and afternoon game drives, looking for wildlife.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.044
976b2652-a9c3-4bc5-b463-eff23d0ae7b4	86b698b2-aa4a-409d-93c3-b2f32ef5932c	4	Departure	A final morning activity, then transfer back to Arusha for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:34.044
06cf3ec1-a9de-4b59-a7b1-e9890d83a798	cebedd8f-a91a-44ca-82d7-a8c814290735	1	Arrival in Dar es Salaam	Meet your guide in Dar es Salaam for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:34.07
ae84dbed-b8d2-42d8-a5f2-daa34b294243	cebedd8f-a91a-44ca-82d7-a8c814290735	2	Nyerere National Park	Full day exploring Nyerere National Park with morning and afternoon game drives, looking for wild dog, elephant, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.07
bd189964-1a14-4509-af34-5ed7ab36cc7b	cebedd8f-a91a-44ca-82d7-a8c814290735	3	Nyerere National Park	Full day exploring Nyerere National Park with morning and afternoon game drives, looking for wild dog, elephant, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.07
ae0d8961-4e7e-4fa7-8af9-d2595eca5345	cebedd8f-a91a-44ca-82d7-a8c814290735	4	Ruaha National Park	Full day exploring Ruaha National Park with morning and afternoon game drives, looking for lion, elephant, kudu.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.07
665a84c8-084c-4ea5-a361-110235e70bda	cebedd8f-a91a-44ca-82d7-a8c814290735	5	Departure	A final morning activity, then transfer back to Dar es Salaam for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:34.07
adad6fc2-8c42-4de6-98bd-129ee3fb62e0	a52e3b15-970d-440b-a449-16b38fbd1f74	1	Arrival in Mfuwe	Meet your guide in Mfuwe for a safari briefing, then settle in for the night.	Luxury lodge	LUXURY	Dinner	2026-10-19 18:20:34.097
8a217998-2397-4904-947c-8f0bc196ca40	a52e3b15-970d-440b-a449-16b38fbd1f74	2	South Luangwa National Park	Full day exploring South Luangwa National Park with morning and afternoon game drives, looking for leopard, lion, wild dog.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.097
e360d7f9-4deb-4edb-93d3-b8415834edf6	a52e3b15-970d-440b-a449-16b38fbd1f74	3	South Luangwa National Park	Full day exploring South Luangwa National Park with morning and afternoon game drives, looking for leopard, lion, wild dog.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.097
938410ef-b174-4615-b21b-a711b19ae72c	a52e3b15-970d-440b-a449-16b38fbd1f74	4	Lower Zambezi National Park	Full day exploring Lower Zambezi National Park with morning and afternoon game drives, looking for elephant, hippo, buffalo.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.097
28afb059-396c-457c-bae7-af6ecd471785	a52e3b15-970d-440b-a449-16b38fbd1f74	5	Lower Zambezi National Park	Full day exploring Lower Zambezi National Park with morning and afternoon game drives, looking for elephant, hippo, buffalo.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.097
a4787f47-a6ba-427d-80c6-da6b9af1e54e	a52e3b15-970d-440b-a449-16b38fbd1f74	6	Departure	A final morning activity, then transfer back to Mfuwe for your onward journey.	\N	LUXURY	Breakfast & lunch	2026-10-19 18:20:34.097
aee452c8-f2d5-4e8b-a749-bb9dc30a0a04	54a64fbb-a198-4a52-bb05-b4826eadb6d6	1	Arrival in Victoria Falls	Meet your guide in Victoria Falls for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:34.122
a063192e-c44f-4c1d-878a-b11bde218255	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2	Victoria Falls	Full day exploring Victoria Falls with morning and afternoon game drives, looking for elephant, buffalo, hippo.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.122
d40491eb-4b0d-44b6-9911-447a9f164b8c	54a64fbb-a198-4a52-bb05-b4826eadb6d6	3	Victoria Falls	Full day exploring Victoria Falls with morning and afternoon game drives, looking for elephant, buffalo, hippo.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.122
82e70551-ff32-40e6-bc53-46f59b34abd8	54a64fbb-a198-4a52-bb05-b4826eadb6d6	4	Hwange National Park	Full day exploring Hwange National Park with morning and afternoon game drives, looking for elephant, lion, wild dog.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.122
cdd2a878-ed75-47fe-9745-8b8e8a3313dc	54a64fbb-a198-4a52-bb05-b4826eadb6d6	5	Departure	A final morning activity, then transfer back to Victoria Falls for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:34.122
b49a318d-e19d-4e00-b804-924c6f9ff694	e681fcb2-4cce-4a59-adf3-e5e111d573e6	1	Arrival in Victoria Falls	Meet your guide in Victoria Falls for a safari briefing, then settle in for the night.	Luxury lodge	LUXURY	Dinner	2026-10-19 18:20:34.149
f5c35843-ab38-4b14-a951-5c5d678496c4	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2	Mana Pools National Park	Full day exploring Mana Pools National Park with morning and afternoon game drives, looking for elephant, wild dog, lion.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.149
521d6997-4822-4426-9b47-c4926b4715e5	e681fcb2-4cce-4a59-adf3-e5e111d573e6	3	Mana Pools National Park	Full day exploring Mana Pools National Park with morning and afternoon game drives, looking for elephant, wild dog, lion.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.149
3fe8a591-5a2d-4f7e-8be9-be3b2d450ff4	e681fcb2-4cce-4a59-adf3-e5e111d573e6	4	Mana Pools National Park	Full day exploring Mana Pools National Park with morning and afternoon game drives, looking for elephant, wild dog, lion.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.149
4a6372b2-cdee-4f55-b6a9-223099aa07c7	e681fcb2-4cce-4a59-adf3-e5e111d573e6	5	Chobe National Park	Full day exploring Chobe National Park with morning and afternoon game drives, looking for elephant, buffalo, lion.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.149
aa5fa0ef-f3e4-4eb8-9f0c-1f31c9beaa22	e681fcb2-4cce-4a59-adf3-e5e111d573e6	6	Chobe National Park	Full day exploring Chobe National Park with morning and afternoon game drives, looking for elephant, buffalo, lion.	Luxury lodge	LUXURY	Breakfast, lunch & dinner	2026-10-19 18:20:34.149
f25fd5e5-da33-40fb-97d7-c35c690bda70	e681fcb2-4cce-4a59-adf3-e5e111d573e6	7	Departure	A final morning activity, then transfer back to Victoria Falls for your onward journey.	\N	LUXURY	Breakfast & lunch	2026-10-19 18:20:34.149
b82db4f3-949e-4e75-9eb3-33a3f698d4ca	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	1	Arrival in Nairobi	Meet your guide in Nairobi for a safari briefing, then settle in for the night.	Budget tented camp	BUDGET	Dinner	2026-10-19 18:20:34.176
9be99067-a80f-4729-afb8-40aaa42f118b	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2	Samburu National Reserve	Full day exploring Samburu National Reserve with morning and afternoon game drives, looking for grevy zebra, reticulated giraffe, gerenuk.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:34.176
42da11e3-90d8-4a5a-8ffe-ec8cd8d490e3	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	3	Lake Nakuru National Park	Full day exploring Lake Nakuru National Park with morning and afternoon game drives, looking for rhino, flamingo, lion.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:34.176
056b8c8e-92a1-42fe-be24-d4556f15a636	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	4	Departure	A final morning activity, then transfer back to Nairobi for your onward journey.	\N	BUDGET	Breakfast & lunch	2026-10-19 18:20:34.176
c11f311a-8488-49cf-98a2-d1d247bc89e2	d7798d79-c50f-4d0b-a025-fe7ab9366703	1	Arrival in Mombasa	Meet your guide in Mombasa for a safari briefing, then settle in for the night.	Budget tented camp	BUDGET	Dinner	2026-10-19 18:20:34.202
d4d8a4a9-f4d9-4721-a1c8-72e8edddbfeb	d7798d79-c50f-4d0b-a025-fe7ab9366703	2	Tsavo East National Park	Full day exploring Tsavo East National Park with morning and afternoon game drives, looking for red elephant, lion, buffalo.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:34.202
f1ffe9fb-519b-4a86-8d57-b38284d693bf	d7798d79-c50f-4d0b-a025-fe7ab9366703	3	Tsavo East National Park	Full day exploring Tsavo East National Park with morning and afternoon game drives, looking for red elephant, lion, buffalo.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:34.202
600848be-84c5-4c10-bf93-bdf7e778ade0	d7798d79-c50f-4d0b-a025-fe7ab9366703	4	Amboseli National Park	Full day exploring Amboseli National Park with morning and afternoon game drives, looking for elephant, lion, buffalo.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:34.202
47f7b232-e1e9-4b05-9c78-f050c7855c0b	d7798d79-c50f-4d0b-a025-fe7ab9366703	5	Amboseli National Park	Full day exploring Amboseli National Park with morning and afternoon game drives, looking for elephant, lion, buffalo.	Budget tented camp	BUDGET	Breakfast, lunch & dinner	2026-10-19 18:20:34.202
e602c438-977e-42e2-8a43-28e7f9a8e0cb	d7798d79-c50f-4d0b-a025-fe7ab9366703	6	Departure	A final morning activity, then transfer back to Mombasa for your onward journey.	\N	BUDGET	Breakfast & lunch	2026-10-19 18:20:34.202
df2d3776-e6af-4912-a02e-e18d2e026994	7df8b9f0-242a-4859-b009-340bf5453b80	1	Arrival in Durban	Meet your guide in Durban for a safari briefing, then settle in for the night.	Mid-range lodge or tented camp	MID_RANGE	Dinner	2026-10-19 18:20:34.229
a049b936-f4d8-4bc3-ae4e-c252ae0b9663	7df8b9f0-242a-4859-b009-340bf5453b80	2	Hluhluwe-iMfolozi Park	Full day exploring Hluhluwe-iMfolozi Park with morning and afternoon game drives, looking for white rhino, black rhino, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.229
86849bea-86c9-4c8a-a58b-a384d21770e3	7df8b9f0-242a-4859-b009-340bf5453b80	3	Hluhluwe-iMfolozi Park	Full day exploring Hluhluwe-iMfolozi Park with morning and afternoon game drives, looking for white rhino, black rhino, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.229
926cc7c6-7bc3-42cc-b655-bf38a6307426	7df8b9f0-242a-4859-b009-340bf5453b80	4	Phinda Private Game Reserve	Full day exploring Phinda Private Game Reserve with morning and afternoon game drives, looking for cheetah, rhino, lion.	Mid-range lodge or tented camp	MID_RANGE	Breakfast, lunch & dinner	2026-10-19 18:20:34.229
3b693686-ced0-4762-83c1-3f08513396c5	7df8b9f0-242a-4859-b009-340bf5453b80	5	Departure	A final morning activity, then transfer back to Durban for your onward journey.	\N	MID_RANGE	Breakfast & lunch	2026-10-19 18:20:34.229
\.


--
-- Data for Name: tour_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tour_slots (id, tour_id, start_date, max_travelers, note, created_at, updated_at, booked_seats, departure_time, route, status) FROM stdin;
f26474fa-c195-4735-8b3a-c7fefe5b246d	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-12-01 00:00:00	22	Small group — limited	2026-10-09 17:59:50.908	2026-10-19 19:40:40.531	0	08:00	\N	OPEN
5895c2fe-d89b-4c9b-9803-1b6be6ce3af4	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-12-15 00:00:00	22	Sold Out Peak Season departure	2026-10-12 20:25:22.893	2026-10-19 19:40:40.544	4	08:00	\N	OPEN
2b056883-5301-424b-9282-99302870aad0	684eafde-f233-4f87-b8a5-76a45cb18253	2026-11-20 00:00:00	7	Small group Land Cruiser — Max 4 Pax	2026-10-12 20:34:17.549	2026-10-19 19:40:40.884	4	08:00	\N	OPEN
2b2e32d8-8bd3-4e3b-8485-0f7250ae92ea	7c0f3706-def2-4435-a0f0-8af36ea2217b	2026-11-20 00:00:00	7	Small group Land Cruiser — Max 4 Pax	2026-10-12 20:35:00.805	2026-10-19 19:40:41.073	4	08:00	\N	OPEN
fbaf63cb-4675-45e5-b108-d292dab36387	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-11-08 00:00:00	14	\N	2026-10-19 19:21:32.801	2026-10-19 19:21:32.801	0	07:00	Arusha → Tarangire → Serengeti → Ngorongoro	OPEN
aa776cfb-03c3-41ae-a6ca-cc86a4a69423	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-11-22 00:00:00	14	\N	2026-10-19 19:21:32.827	2026-10-19 19:21:32.827	0	07:00	Arusha → Tarangire → Serengeti → Ngorongoro	OPEN
4fedf96d-f630-4768-85e5-a2f412743ef7	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-12-06 00:00:00	7	\N	2026-10-19 19:21:32.841	2026-10-19 19:21:32.841	0	06:30	Arusha → Serengeti → Ngorongoro (express)	OPEN
715b77d5-5687-4897-9afe-5c20374b7592	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-01-10 00:00:00	22	\N	2026-10-19 19:21:32.856	2026-10-19 19:21:32.856	0	07:00	Arusha → Tarangire → Serengeti → Ngorongoro	OPEN
e9d0fd48-91a3-4736-b71d-79fcf650c600	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-07-05 00:00:00	13	\N	2026-10-19 19:21:32.891	2026-10-19 19:21:32.891	0	07:30	Arusha → Lake Manyara → Northern Serengeti → Ngorongoro	OPEN
916b8c73-9f03-4cfa-9a55-01179baf3782	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-08-02 00:00:00	13	\N	2026-10-19 19:21:32.905	2026-10-19 19:21:32.905	0	07:30	Arusha → Lake Manyara → Northern Serengeti → Ngorongoro	OPEN
84c06695-3ed6-4179-a54f-ce8d27ddd7bc	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-09-06 00:00:00	7	\N	2026-10-19 19:21:32.918	2026-10-19 19:21:32.918	0	07:30	Arusha → Lake Manyara → Northern Serengeti → Ngorongoro	OPEN
0dcb4ccf-e093-4823-bc02-d3a293a6ef82	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-11-15 00:00:00	16	\N	2026-10-19 19:21:32.95	2026-10-19 19:21:32.95	0	06:00	Nairobi → Masai Mara → Amboseli	OPEN
f9a0c51f-0040-484c-8ef2-d5e8f7c105de	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-11-29 00:00:00	8	\N	2026-10-19 19:21:32.963	2026-10-19 19:21:32.963	0	06:00	Nairobi → Masai Mara → Amboseli	OPEN
fae37385-dde6-448c-83ca-1ef09a84ffbd	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-12-13 00:00:00	16	\N	2026-10-19 19:21:32.977	2026-10-19 19:21:32.977	0	06:00	Nairobi → Masai Mara → Amboseli	OPEN
60b020a9-acb4-496e-be87-89c77335b932	de687d5f-4b18-4edd-8eda-807a1e6021ef	2026-11-02 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.308	2026-10-19 19:40:40.308	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
d2dc22fa-c1ad-40ee-82c8-a719a8fd13fe	de687d5f-4b18-4edd-8eda-807a1e6021ef	2026-11-16 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.331	2026-10-19 19:40:40.331	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
d34fa0a4-0f90-45d5-a448-9a3765b39652	de687d5f-4b18-4edd-8eda-807a1e6021ef	2026-11-30 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.343	2026-10-19 19:40:40.343	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
ac449702-98f0-40fb-969f-9bc0794df2ab	de687d5f-4b18-4edd-8eda-807a1e6021ef	2026-12-14 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.353	2026-10-19 19:40:40.353	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
403f00df-2218-4a52-a4fe-ffa840f2f272	de687d5f-4b18-4edd-8eda-807a1e6021ef	2026-12-28 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.364	2026-10-19 19:40:40.364	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
bb1bcfd4-4500-4875-bf98-4d78aaab85c9	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-01-11 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.374	2026-10-19 19:40:40.374	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
e1075ef5-1be6-4e85-a36f-85090bd731a4	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-01-25 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.385	2026-10-19 19:40:40.385	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
98d291a6-a192-4219-9aef-393f020426c5	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-02-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.394	2026-10-19 19:40:40.394	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
e7d2f96e-6d68-49c7-8650-860a3941ecab	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-02-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.405	2026-10-19 19:40:40.405	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
d2d69025-0e43-43ec-a76a-13a32065ca12	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-03-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.414	2026-10-19 19:40:40.414	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
33104973-91cf-4f17-a2d3-d131965af749	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-03-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.424	2026-10-19 19:40:40.424	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
611f2420-4333-4ed9-abc0-d698a883e8fe	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-04-05 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.433	2026-10-19 19:40:40.433	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
a21629d2-a169-410a-9d22-b3e227ef7bb1	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-04-19 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.444	2026-10-19 19:40:40.444	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
b3190f13-044d-40b3-8c46-c7b3b99ac8f2	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-05-03 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.453	2026-10-19 19:40:40.453	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
a1a50528-275d-444e-a1c6-08dd677e0a9b	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-05-17 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.464	2026-10-19 19:40:40.464	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
34afae4f-c491-4475-b0a7-114e1536a5be	de687d5f-4b18-4edd-8eda-807a1e6021ef	2027-05-31 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.473	2026-10-19 19:40:40.473	0	07:30	Nairobi Wilson Airport → Masai Mara National Reserve → Nairobi Wilson Airport	OPEN
7d7ac41d-9f8b-4f37-9a7c-a4c3ddc3b7d8	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-11-01 00:00:00	22	High season departure	2026-10-09 17:59:50.879	2026-10-19 19:40:40.498	0	08:00	\N	OPEN
1fbde96e-c6ec-4d71-ade2-46d4294f3ed8	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.569	2026-10-19 19:40:40.569	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
7a6aa3c5-c2e8-4ff4-97f9-12c3bfeaf569	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.58	2026-10-19 19:40:40.58	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
7c1688be-6bd7-41e7-8fda-f496361c84a5	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.589	2026-10-19 19:40:40.589	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
2a82d299-3e36-4235-b261-f22bdbf89e6f	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.599	2026-10-19 19:40:40.599	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
0f018c47-330f-4993-bb4c-6b7644f40c2a	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.608	2026-10-19 19:40:40.608	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
2012c6d7-ccc3-4f07-88b4-995b0f74178f	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.618	2026-10-19 19:40:40.618	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
0b403db8-c68a-4a62-820a-926952809302	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.628	2026-10-19 19:40:40.628	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
18b5b685-58bf-43e4-81b6-a088c7fc2dc9	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.637	2026-10-19 19:40:40.637	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
5b076a4c-9b12-4c90-b16e-f57137bf3317	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.646	2026-10-19 19:40:40.646	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
cfa55f14-99f5-40c0-bb73-461e7d3ee7b9	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.656	2026-10-19 19:40:40.656	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
2f30fec9-dc9d-4b7f-8b8c-4e4d4441c2bb	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.665	2026-10-19 19:40:40.665	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
479e279a-a58b-4237-a8e4-9581fe4a9d8a	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.675	2026-10-19 19:40:40.675	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
52bb5369-8a0d-4cc3-bd49-ae11c9f23a20	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.685	2026-10-19 19:40:40.685	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
069d0ac4-816e-4ddc-bd1e-5ed2018c7baf	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.694	2026-10-19 19:40:40.694	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e358ced1-df1b-4c39-bc01-79b1f8354c31	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.704	2026-10-19 19:40:40.704	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
342001a0-d630-4b52-ad75-614ffbc1b6ba	db1583d7-156f-4c73-8e0e-e61cc5eac04c	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.713	2026-10-19 19:40:40.713	0	07:30	Arusha / Kilimanjaro Airport → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
5dc58394-655a-4b88-845f-792aa29f5f0d	fe28c470-d608-4792-a60e-891a0f15be4f	2026-11-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.726	2026-10-19 19:40:40.726	0	07:30	Arusha → Arusha	OPEN
655149fa-f1da-4fe6-8f34-ed957e9c46f8	fe28c470-d608-4792-a60e-891a0f15be4f	2026-11-19 00:00:00	22	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.736	2026-10-19 19:40:40.736	0	07:30	Arusha → Arusha	OPEN
98611f31-3241-443a-a30c-cfa5d7c28be0	fe28c470-d608-4792-a60e-891a0f15be4f	2026-12-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.745	2026-10-19 19:40:40.745	0	07:30	Arusha → Arusha	OPEN
f16e58f1-1025-46bb-959b-db6a29958007	fe28c470-d608-4792-a60e-891a0f15be4f	2026-12-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.755	2026-10-19 19:40:40.755	0	07:30	Arusha → Arusha	OPEN
778d9c82-e215-4b88-a368-6aa427ab55b6	fe28c470-d608-4792-a60e-891a0f15be4f	2026-12-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.764	2026-10-19 19:40:40.764	0	07:30	Arusha → Arusha	OPEN
884b3db5-1ba7-4e3c-9430-1f1de266e529	fe28c470-d608-4792-a60e-891a0f15be4f	2027-01-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.774	2026-10-19 19:40:40.774	0	07:30	Arusha → Arusha	OPEN
bf91f943-a212-4a6f-96b2-5df817aa1cf9	fe28c470-d608-4792-a60e-891a0f15be4f	2027-01-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.783	2026-10-19 19:40:40.783	0	07:30	Arusha → Arusha	OPEN
e3108552-73b1-4c57-bdec-4ee098c86ed2	fe28c470-d608-4792-a60e-891a0f15be4f	2027-02-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.792	2026-10-19 19:40:40.792	0	07:30	Arusha → Arusha	OPEN
b2426c9c-ae96-4b67-9338-a6979b1a625a	fe28c470-d608-4792-a60e-891a0f15be4f	2027-02-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.802	2026-10-19 19:40:40.802	0	07:30	Arusha → Arusha	OPEN
da7886ce-3035-40ca-9ce6-3f3f8af6ad52	fe28c470-d608-4792-a60e-891a0f15be4f	2027-03-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.811	2026-10-19 19:40:40.811	0	07:30	Arusha → Arusha	OPEN
c44ac73d-544e-4f08-8673-e47e32b021fb	fe28c470-d608-4792-a60e-891a0f15be4f	2027-03-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.823	2026-10-19 19:40:40.823	0	07:30	Arusha → Arusha	OPEN
53786b2c-517d-46d4-be0e-7fddf70d2f7b	fe28c470-d608-4792-a60e-891a0f15be4f	2027-04-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.833	2026-10-19 19:40:40.833	0	07:30	Arusha → Arusha	OPEN
dde76275-db65-4d8e-ae08-2e5fd38a30e3	fe28c470-d608-4792-a60e-891a0f15be4f	2027-04-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.842	2026-10-19 19:40:40.842	0	07:30	Arusha → Arusha	OPEN
5c298432-d4d4-40db-9566-3de9f9012268	fe28c470-d608-4792-a60e-891a0f15be4f	2027-05-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.851	2026-10-19 19:40:40.851	0	07:30	Arusha → Arusha	OPEN
b50f5b5a-ea94-4cc0-bb52-e615ff64e849	fe28c470-d608-4792-a60e-891a0f15be4f	2027-05-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.861	2026-10-19 19:40:40.861	0	07:30	Arusha → Arusha	OPEN
52917845-7f87-4333-9d3b-29794e9327fd	684eafde-f233-4f87-b8a5-76a45cb18253	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.91	2026-10-19 19:40:40.91	0	07:30	Arusha → Arusha	OPEN
69750cea-a576-42a4-89d8-7b517b9bbc80	684eafde-f233-4f87-b8a5-76a45cb18253	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.92	2026-10-19 19:40:40.92	0	07:30	Arusha → Arusha	OPEN
75ec16fa-d59c-4d78-813e-70ce3dea4fc7	684eafde-f233-4f87-b8a5-76a45cb18253	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.932	2026-10-19 19:40:40.932	0	07:30	Arusha → Arusha	OPEN
a37317b1-7bed-440f-a137-772602e7f390	684eafde-f233-4f87-b8a5-76a45cb18253	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.942	2026-10-19 19:40:40.942	0	07:30	Arusha → Arusha	OPEN
e42d8666-ae3c-4902-ab98-2eafa579f24c	684eafde-f233-4f87-b8a5-76a45cb18253	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.951	2026-10-19 19:40:40.951	0	07:30	Arusha → Arusha	OPEN
458e537e-6e19-49d2-af94-677acbca0fe5	684eafde-f233-4f87-b8a5-76a45cb18253	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.96	2026-10-19 19:40:40.96	0	07:30	Arusha → Arusha	OPEN
7961eb78-a1c2-43c1-a90e-ed237135f3cf	684eafde-f233-4f87-b8a5-76a45cb18253	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.969	2026-10-19 19:40:40.969	0	07:30	Arusha → Arusha	OPEN
72c13792-3a07-42f7-94b5-1d7ca27399c9	684eafde-f233-4f87-b8a5-76a45cb18253	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.978	2026-10-19 19:40:40.978	0	07:30	Arusha → Arusha	OPEN
8a53eb52-e57a-4615-91d1-8d3edcd4445e	684eafde-f233-4f87-b8a5-76a45cb18253	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.987	2026-10-19 19:40:40.987	0	07:30	Arusha → Arusha	OPEN
aacc960c-2af7-4cd5-b607-121e130805fd	684eafde-f233-4f87-b8a5-76a45cb18253	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:40.996	2026-10-19 19:40:40.996	0	07:30	Arusha → Arusha	OPEN
b328f7bd-ed75-4262-b1f2-81414fe138ed	684eafde-f233-4f87-b8a5-76a45cb18253	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.005	2026-10-19 19:40:41.005	0	07:30	Arusha → Arusha	OPEN
5de99707-0e3d-4d74-b049-ed22d9c01888	684eafde-f233-4f87-b8a5-76a45cb18253	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.014	2026-10-19 19:40:41.014	0	07:30	Arusha → Arusha	OPEN
9a2554c8-58b0-4a56-b509-60257d38dcd2	684eafde-f233-4f87-b8a5-76a45cb18253	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.023	2026-10-19 19:40:41.023	0	07:30	Arusha → Arusha	OPEN
3fc1e4ec-efac-4025-97b8-988baf415bb6	684eafde-f233-4f87-b8a5-76a45cb18253	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.032	2026-10-19 19:40:41.032	0	07:30	Arusha → Arusha	OPEN
7320d066-330e-4d57-be35-ce05ee00352f	684eafde-f233-4f87-b8a5-76a45cb18253	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.042	2026-10-19 19:40:41.042	0	07:30	Arusha → Arusha	OPEN
7da10624-7451-4c4e-beb7-d4a3f6cdb94b	684eafde-f233-4f87-b8a5-76a45cb18253	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.052	2026-10-19 19:40:41.052	0	07:30	Arusha → Arusha	OPEN
1c435a74-d42d-4f07-8455-fc10144f1c07	7c0f3706-def2-4435-a0f0-8af36ea2217b	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.098	2026-10-19 19:40:41.098	0	07:30	Arusha → Arusha	OPEN
8a3f9bfc-de7d-4cd1-8369-56a0e9d42a65	7c0f3706-def2-4435-a0f0-8af36ea2217b	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.107	2026-10-19 19:40:41.107	0	07:30	Arusha → Arusha	OPEN
df714c24-4386-4921-854b-b08e6e145613	7c0f3706-def2-4435-a0f0-8af36ea2217b	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.116	2026-10-19 19:40:41.116	0	07:30	Arusha → Arusha	OPEN
08de42e8-0fd9-4761-8795-1f65e119793c	7c0f3706-def2-4435-a0f0-8af36ea2217b	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.126	2026-10-19 19:40:41.126	0	07:30	Arusha → Arusha	OPEN
87d8c922-b485-4d58-9464-fa4046b2dd01	7c0f3706-def2-4435-a0f0-8af36ea2217b	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.135	2026-10-19 19:40:41.135	0	07:30	Arusha → Arusha	OPEN
e8acfb00-bb94-4474-87d7-8769d80e2da8	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.145	2026-10-19 19:40:41.145	0	07:30	Arusha → Arusha	OPEN
a576c51f-dbae-4b2f-b9ed-f2ea37ca1824	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.154	2026-10-19 19:40:41.154	0	07:30	Arusha → Arusha	OPEN
dd0bb152-b1ee-487c-ac80-0641c8e5eed4	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.163	2026-10-19 19:40:41.163	0	07:30	Arusha → Arusha	OPEN
90892213-885f-4e9c-9cbe-eaf7d5e344a6	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.173	2026-10-19 19:40:41.173	0	07:30	Arusha → Arusha	OPEN
70d80caa-97a2-4e0f-9c6d-628afc2bd860	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.182	2026-10-19 19:40:41.182	0	07:30	Arusha → Arusha	OPEN
fb1315e3-55a8-4b30-ac2c-4e829b79251c	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.191	2026-10-19 19:40:41.191	0	07:30	Arusha → Arusha	OPEN
7913156e-7b98-4a05-8c05-c4b46ec9c987	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.2	2026-10-19 19:40:41.2	0	07:30	Arusha → Arusha	OPEN
1af1ac0c-c771-4b4e-a7a1-bd0738ba7354	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.209	2026-10-19 19:40:41.209	0	07:30	Arusha → Arusha	OPEN
a35c3cea-5d22-4980-908c-00c71ecf57c9	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.219	2026-10-19 19:40:41.219	0	07:30	Arusha → Arusha	OPEN
b14c4cca-0642-492a-bacd-1a31469e2d48	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.229	2026-10-19 19:40:41.229	0	07:30	Arusha → Arusha	OPEN
5c799648-ab4a-4ab1-a482-6385aaa9b8cd	7c0f3706-def2-4435-a0f0-8af36ea2217b	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.238	2026-10-19 19:40:41.238	0	07:30	Arusha → Arusha	OPEN
6dc5bbe2-4966-483b-b640-007d61d5fe19	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.275	2026-10-19 19:40:41.275	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
c7bb8e0f-87c5-43a7-9218-6020f88ae353	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.285	2026-10-19 19:40:41.285	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
80ae0e64-d9b2-4eff-b2a2-92e866753aa5	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.294	2026-10-19 19:40:41.294	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
f070a563-26bc-4531-ba62-bb90bdc9cd5f	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.304	2026-10-19 19:40:41.304	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
f21e81b9-b6dc-41b2-be87-4a92671934a7	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.313	2026-10-19 19:40:41.313	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
5c30c94b-2731-4f8e-8ae1-969cdde7eaf3	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.323	2026-10-19 19:40:41.323	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
409db071-b610-42e7-84e8-c9e4f3207f7c	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.332	2026-10-19 19:40:41.332	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
62e8900a-daae-4e8f-9776-ed2a760cb57b	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.342	2026-10-19 19:40:41.342	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
f97e41eb-a8e4-4414-9eaa-e639a9556a9f	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.351	2026-10-19 19:40:41.351	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e2712c9b-363d-4570-b49d-c1c898e73528	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.36	2026-10-19 19:40:41.36	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
04c95eac-e211-474d-9ec5-502d6fc7d501	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.369	2026-10-19 19:40:41.369	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
f8fe622d-269e-4399-bc9f-af3b5c7c8a1a	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.378	2026-10-19 19:40:41.378	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
ec05805e-5a6d-4387-ae6b-1597b9c36556	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.387	2026-10-19 19:40:41.387	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
9c6258c5-d1cc-435f-ae8f-06406b0697f7	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.396	2026-10-19 19:40:41.396	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
06a218aa-40b3-4016-bb53-080d8c9d4ee8	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.405	2026-10-19 19:40:41.405	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
56665826-9395-4bb7-90c5-e5c7978feef1	f5d69c5b-0635-43bd-9c0d-51ceabadf201	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.414	2026-10-19 19:40:41.414	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
2d2bc196-c45f-4d84-ac38-85ef9c98a6b6	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2026-11-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.425	2026-10-19 19:40:41.425	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
5d0a4460-7fc8-4711-a49e-264b1ebb38bb	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2026-11-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.435	2026-10-19 19:40:41.435	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
93b9bb74-6371-4a14-a04e-7ca641e8c69b	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2026-12-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.444	2026-10-19 19:40:41.444	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
b0a01013-17ad-4924-a7c4-93bcc8147ef4	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2026-12-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.453	2026-10-19 19:40:41.453	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
5617e60e-e4e4-411d-b05a-d5636cfb796f	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2026-12-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.462	2026-10-19 19:40:41.462	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
6515a8ee-743e-4631-b0cb-0d1500c6549f	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-01-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.472	2026-10-19 19:40:41.472	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
b92cd8b1-266d-4187-ba02-dbdc05f7c66f	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-01-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.482	2026-10-19 19:40:41.482	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
1040eb85-006b-4946-bcd1-1cce834e5ee5	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-02-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.491	2026-10-19 19:40:41.491	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
cceea282-9216-43cc-90a9-aaa997b82acd	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-02-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.5	2026-10-19 19:40:41.5	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
46639747-287c-41a1-b4d5-353decef61f4	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-03-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.508	2026-10-19 19:40:41.508	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
1807d8d0-c1e3-40f0-a582-31d2dc29b890	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-03-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.518	2026-10-19 19:40:41.518	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
417baa3f-db09-4a7f-8377-1e6010bbd67a	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-04-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.527	2026-10-19 19:40:41.527	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
fee38a87-6311-40ff-a80d-83d949d6c834	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-04-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.536	2026-10-19 19:40:41.536	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
c8e920fc-9ca3-41cf-908a-f06c0bbec0de	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-05-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.545	2026-10-19 19:40:41.545	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
f0eedf43-b604-4ea6-84d5-b23e4d9ed82a	71e890c8-2e87-44b3-b5c3-d04b815d70d7	2027-05-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.554	2026-10-19 19:40:41.554	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
067ae234-7238-421d-bd6d-23768e37a9cd	13435108-836b-427e-9e78-4f16ffe841b6	2026-11-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.567	2026-10-19 19:40:41.567	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
1a9521d5-fbf2-40f5-b1eb-589272f52e1c	13435108-836b-427e-9e78-4f16ffe841b6	2026-11-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.576	2026-10-19 19:40:41.576	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
7b611dbd-fdc5-44d5-8f7c-f3fb59e39000	13435108-836b-427e-9e78-4f16ffe841b6	2026-12-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.585	2026-10-19 19:40:41.585	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
ef60f21d-7b78-464e-8cb1-f7887d5a9092	13435108-836b-427e-9e78-4f16ffe841b6	2026-12-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.594	2026-10-19 19:40:41.594	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
2620f0a6-72be-476b-94e4-e4f8d4338d98	13435108-836b-427e-9e78-4f16ffe841b6	2027-01-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.603	2026-10-19 19:40:41.603	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
c96cbe1a-ffca-42a2-89a2-204ba3c7f4bf	13435108-836b-427e-9e78-4f16ffe841b6	2027-01-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.613	2026-10-19 19:40:41.613	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
a5ac32ae-8449-4d69-86b5-1b95e49a51ec	13435108-836b-427e-9e78-4f16ffe841b6	2027-01-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.621	2026-10-19 19:40:41.621	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
c6885e94-bca9-40a7-b111-7c0f978eadc3	13435108-836b-427e-9e78-4f16ffe841b6	2027-02-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.631	2026-10-19 19:40:41.631	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
3a8f0112-cc31-4d29-a64a-5e4e7f7ebd18	13435108-836b-427e-9e78-4f16ffe841b6	2027-02-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.64	2026-10-19 19:40:41.64	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
e105e187-fbe7-4200-80dc-63d894e87646	13435108-836b-427e-9e78-4f16ffe841b6	2027-03-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.649	2026-10-19 19:40:41.649	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
b3066313-38c0-4182-bf69-d05e0223939f	13435108-836b-427e-9e78-4f16ffe841b6	2027-03-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.66	2026-10-19 19:40:41.66	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
7981985e-a671-47f4-81c3-5b2386fa3b70	13435108-836b-427e-9e78-4f16ffe841b6	2027-04-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.668	2026-10-19 19:40:41.668	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
0b2f8554-b5c1-4fff-b3a0-2fcf758abad8	13435108-836b-427e-9e78-4f16ffe841b6	2027-04-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.678	2026-10-19 19:40:41.678	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
37b6b93d-ef69-4700-99da-cb5b65834081	13435108-836b-427e-9e78-4f16ffe841b6	2027-05-09 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.689	2026-10-19 19:40:41.689	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
dcbeef3c-209f-4af6-b336-78d612bd6487	13435108-836b-427e-9e78-4f16ffe841b6	2027-05-23 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.698	2026-10-19 19:40:41.698	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
a26374bd-880b-42cc-a1a4-0cedbfd296dc	f73d46c4-c167-4371-a318-468d9d8269fe	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.717	2026-10-19 19:40:41.717	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
b66f7db4-0519-47a5-9998-7f17bc961390	f73d46c4-c167-4371-a318-468d9d8269fe	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.726	2026-10-19 19:40:41.726	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
22c4b381-9d7f-44f4-af32-8ec88d110a32	f73d46c4-c167-4371-a318-468d9d8269fe	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.736	2026-10-19 19:40:41.736	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
d65bfb40-2cca-4791-9595-a0fe683fafe3	f73d46c4-c167-4371-a318-468d9d8269fe	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.745	2026-10-19 19:40:41.745	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
1ead0bd2-e687-45e7-8ef1-8ab935d88033	f73d46c4-c167-4371-a318-468d9d8269fe	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.755	2026-10-19 19:40:41.755	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
9d4bdfe8-eec6-4471-9c4c-e50eab9dffe8	f73d46c4-c167-4371-a318-468d9d8269fe	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.764	2026-10-19 19:40:41.764	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
f4a20cd4-c947-4a94-950d-2be2863fa88d	f73d46c4-c167-4371-a318-468d9d8269fe	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.774	2026-10-19 19:40:41.774	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
d4ea894f-9d81-443c-99f1-58e43d2d560e	f73d46c4-c167-4371-a318-468d9d8269fe	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.783	2026-10-19 19:40:41.783	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
50f2c472-bb8f-44af-9dae-83b0938d4209	f73d46c4-c167-4371-a318-468d9d8269fe	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.794	2026-10-19 19:40:41.794	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
87186e3c-f910-43b1-a187-6be0c9d68ad8	f73d46c4-c167-4371-a318-468d9d8269fe	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.805	2026-10-19 19:40:41.805	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
66bb41e4-271f-4621-8239-3b12335dc918	f73d46c4-c167-4371-a318-468d9d8269fe	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.815	2026-10-19 19:40:41.815	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
0db87e3c-0726-487a-8e36-8eab0dba7819	f73d46c4-c167-4371-a318-468d9d8269fe	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.83	2026-10-19 19:40:41.83	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
a6a8a542-016f-44da-9c9e-75357b21327e	f73d46c4-c167-4371-a318-468d9d8269fe	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.843	2026-10-19 19:40:41.843	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
ccb02693-b8b1-49a1-9969-6ace5ad486c5	f73d46c4-c167-4371-a318-468d9d8269fe	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.856	2026-10-19 19:40:41.856	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
786fba9c-253d-4f86-9c7a-cd5f87dba076	f73d46c4-c167-4371-a318-468d9d8269fe	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.868	2026-10-19 19:40:41.868	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
d08c998c-f912-457e-8b6c-68b12b0b0917	f73d46c4-c167-4371-a318-468d9d8269fe	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.879	2026-10-19 19:40:41.879	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Serengeti National Park → Ngorongoro Crater → Nairobi	OPEN
7dfae3ca-394d-406e-b1f2-5c20ace8d9f9	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2026-11-02 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.901	2026-10-19 19:40:41.901	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
10259454-2300-423a-94d2-8fe7272f8aa0	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2026-11-16 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.911	2026-10-19 19:40:41.911	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
aef59294-f51e-4316-bcf5-882d95a4e0f6	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2026-11-30 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.921	2026-10-19 19:40:41.921	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
1ada3b11-2146-4bd4-8328-af31d9202933	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2026-12-14 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.931	2026-10-19 19:40:41.931	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
126bdce7-16f4-42aa-a42e-d6d606c79d99	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2026-12-28 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.942	2026-10-19 19:40:41.942	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
aaf651d1-1abb-4d7e-b401-f15098ea1427	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-01-11 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.952	2026-10-19 19:40:41.952	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
609df587-2255-4431-bccf-f750c51b7898	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-01-25 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.962	2026-10-19 19:40:41.962	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
36fddcd2-4845-4f40-b9c2-4f8bdfdd6aba	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-02-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.971	2026-10-19 19:40:41.971	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
a97ebe2a-9d61-4a49-9089-f01c306a7b64	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-02-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.98	2026-10-19 19:40:41.98	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
bd5dc2e2-90b8-4c2f-879a-c5bf39aa2ba0	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-03-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.989	2026-10-19 19:40:41.989	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
ab008948-b592-47ae-b6b6-73163d6e0d6d	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-03-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:41.998	2026-10-19 19:40:41.998	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
3e9198c2-2eb5-4abb-b82f-27691e2f1190	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-04-05 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.008	2026-10-19 19:40:42.008	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
c9952c7b-3aeb-4fca-9adb-95f244e9abe9	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-04-19 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.018	2026-10-19 19:40:42.018	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
625cf72f-a8f1-4e76-81a3-0831399956c9	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-05-03 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.027	2026-10-19 19:40:42.027	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
96f6c12d-8a3f-4d84-a854-255f26198c57	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-05-17 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.036	2026-10-19 19:40:42.036	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
1f78b81c-10ab-43c7-84ce-addc4120cea0	13fcbd1a-14e3-47df-9fce-f57f6ff2694f	2027-05-31 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.045	2026-10-19 19:40:42.045	0	05:30	Kigali → Volcanoes National Park → Akagera National Park → Kigali	OPEN
eb3919dd-0c32-4f91-8f53-c795e81b6182	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.076	2026-10-19 19:40:42.076	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
21ec2e82-eb0a-4434-9001-1cff78937194	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.087	2026-10-19 19:40:42.087	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
85ab07c5-d578-4ce1-a88b-e38e0d789149	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.097	2026-10-19 19:40:42.097	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
99692f50-1077-4a4d-83d7-663a8403058d	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-02-25 00:00:00	16	\N	2026-10-19 19:40:44.988	2026-10-19 19:40:44.988	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
6263ef66-ccb1-4f32-bcfb-88f226ed48c1	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.106	2026-10-19 19:40:42.106	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
ead19daf-fb22-4424-819b-b2624c84a581	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.117	2026-10-19 19:40:42.117	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
9f391efa-e827-4608-b9f6-444dbf7c24e3	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.126	2026-10-19 19:40:42.126	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
25af2aab-b237-43ae-a5ec-dad4bd52f796	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.136	2026-10-19 19:40:42.136	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
c946b6df-aff4-4dfb-baaf-ac7794248808	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.147	2026-10-19 19:40:42.147	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
92752c42-c2cd-4906-8c2b-38bf7f2eadaa	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.157	2026-10-19 19:40:42.157	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
a7901adf-b8d2-4005-ab09-903edc94647d	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.174	2026-10-19 19:40:42.174	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
4f6efd32-dfec-4fa6-850d-74499fe97eb0	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.185	2026-10-19 19:40:42.185	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
77056016-37aa-40c8-9df2-5bfc3796a52d	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.196	2026-10-19 19:40:42.196	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
290ef867-e2d4-4977-989b-eaee91dec1a6	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.208	2026-10-19 19:40:42.208	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
00a18508-2df2-48b1-b17d-97d3177f6162	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.22	2026-10-19 19:40:42.22	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
a8b2b2aa-7769-47aa-8ee3-9ca0b78b5ab9	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.231	2026-10-19 19:40:42.231	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
153e0150-4466-438e-aad3-299ffad354cd	99ad6b22-e9fe-4c72-b92b-84595de4f1b4	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.243	2026-10-19 19:40:42.243	0	06:00	Johannesburg → Kruger National Park → Sabi Sand Nature Reserve → Johannesburg	OPEN
426b01b2-4799-4e1e-a664-32db8e01fac5	7df8b9f0-242a-4859-b009-340bf5453b80	2026-11-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.26	2026-10-19 19:40:42.26	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
cfa5c340-e55f-4b44-8b60-a864d2d2c0ab	7df8b9f0-242a-4859-b009-340bf5453b80	2026-11-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.271	2026-10-19 19:40:42.271	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
4142244f-0bac-4c68-90ad-606caa91726e	7df8b9f0-242a-4859-b009-340bf5453b80	2026-12-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.285	2026-10-19 19:40:42.285	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
6f37e93c-38ab-4b6e-8f16-c51ca60abe84	7df8b9f0-242a-4859-b009-340bf5453b80	2026-12-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.296	2026-10-19 19:40:42.296	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
3ea02eb7-f96e-4307-b8cb-65f757451939	7df8b9f0-242a-4859-b009-340bf5453b80	2026-12-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.308	2026-10-19 19:40:42.308	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
65ddcc2e-a2f6-4243-a4ec-00ce38edf913	7df8b9f0-242a-4859-b009-340bf5453b80	2027-01-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.32	2026-10-19 19:40:42.32	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
b73b2484-0109-4ce3-abc3-989db14b84a8	7df8b9f0-242a-4859-b009-340bf5453b80	2027-01-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.333	2026-10-19 19:40:42.333	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
667fd052-a151-4ef9-a743-4cf3fb38b623	7df8b9f0-242a-4859-b009-340bf5453b80	2027-02-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.348	2026-10-19 19:40:42.348	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
80f85513-779a-42f1-8ccb-8fde84da83ad	7df8b9f0-242a-4859-b009-340bf5453b80	2027-02-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.363	2026-10-19 19:40:42.363	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
57a707b0-900f-48e6-84c9-1ca495a0fa63	7df8b9f0-242a-4859-b009-340bf5453b80	2027-03-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.378	2026-10-19 19:40:42.378	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
c012e687-ddd7-47e4-976f-3ec7cd9b2fdd	7df8b9f0-242a-4859-b009-340bf5453b80	2027-03-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.39	2026-10-19 19:40:42.39	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
c6ebb6dc-eb7d-4e73-b2a5-16463c8e160a	7df8b9f0-242a-4859-b009-340bf5453b80	2027-04-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.403	2026-10-19 19:40:42.403	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
b19848b7-22fa-4c13-acdd-fe7f1a1f6a80	7df8b9f0-242a-4859-b009-340bf5453b80	2027-04-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.418	2026-10-19 19:40:42.418	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
047fa3fa-fe66-4159-9566-88cad239389d	7df8b9f0-242a-4859-b009-340bf5453b80	2027-05-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.429	2026-10-19 19:40:42.429	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
46ab233d-4e64-4223-8252-c5fda9cd162f	7df8b9f0-242a-4859-b009-340bf5453b80	2027-05-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.442	2026-10-19 19:40:42.442	0	07:00	Durban → Hluhluwe-iMfolozi Park → Phinda Private Game Reserve → Durban	OPEN
241675a8-ae38-4171-9052-5d072a68c75d	bb38656c-40f7-4b5a-97bb-401927daa1ae	2026-11-02 00:00:00	8	\N	2026-10-19 19:40:42.486	2026-10-19 19:40:42.486	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
1f3c89df-e49d-4c42-92f8-6c4325d796ee	bb38656c-40f7-4b5a-97bb-401927daa1ae	2026-11-16 00:00:00	8	\N	2026-10-19 19:40:42.498	2026-10-19 19:40:42.498	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
fdc38a63-0493-46a7-9c5f-57e1574138a6	bb38656c-40f7-4b5a-97bb-401927daa1ae	2026-11-30 00:00:00	8	\N	2026-10-19 19:40:42.508	2026-10-19 19:40:42.508	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
94c579ec-dac5-464e-a9f7-89a2f0eab2a8	bb38656c-40f7-4b5a-97bb-401927daa1ae	2026-12-14 00:00:00	8	\N	2026-10-19 19:40:42.519	2026-10-19 19:40:42.519	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
519de1b4-f6e7-404f-ad7b-9b9387171fd4	bb38656c-40f7-4b5a-97bb-401927daa1ae	2026-12-28 00:00:00	8	\N	2026-10-19 19:40:42.529	2026-10-19 19:40:42.529	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
674ce9e9-a209-48a3-ab7e-39c22f1bd055	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-01-11 00:00:00	8	\N	2026-10-19 19:40:42.539	2026-10-19 19:40:42.539	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
ed92cd20-2a0b-430b-a350-990774d9f310	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-01-25 00:00:00	8	\N	2026-10-19 19:40:42.549	2026-10-19 19:40:42.549	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
62303334-aaba-467b-80b0-d90382559c3d	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-02-08 00:00:00	8	\N	2026-10-19 19:40:42.559	2026-10-19 19:40:42.559	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
69ab73a7-35b4-46b9-800f-aec223c383cd	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-02-22 00:00:00	8	\N	2026-10-19 19:40:42.568	2026-10-19 19:40:42.568	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
523c88b7-45c9-47b4-b0f0-8963d231373c	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-03-08 00:00:00	8	\N	2026-10-19 19:40:42.578	2026-10-19 19:40:42.578	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
e275c969-a267-4dc4-ad1b-2fd59fe7e84a	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-03-22 00:00:00	8	\N	2026-10-19 19:40:42.588	2026-10-19 19:40:42.588	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
1de647ad-ed0c-4f38-8d70-358abd3f1820	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-04-05 00:00:00	8	\N	2026-10-19 19:40:42.598	2026-10-19 19:40:42.598	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
45a89a24-1d2c-4a48-ab1f-3ef78c14d0f5	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-04-19 00:00:00	8	\N	2026-10-19 19:40:42.608	2026-10-19 19:40:42.608	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
4484ebba-1605-4a4d-9efa-ef326e51e85a	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-05-03 00:00:00	8	\N	2026-10-19 19:40:42.617	2026-10-19 19:40:42.617	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
228b83b9-b64c-4eda-8bec-7ab79fe2e608	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-05-17 00:00:00	8	\N	2026-10-19 19:40:42.627	2026-10-19 19:40:42.627	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
2b8182f8-ae48-4110-9ffc-8507f92b0d62	bb38656c-40f7-4b5a-97bb-401927daa1ae	2027-05-31 00:00:00	8	\N	2026-10-19 19:40:42.636	2026-10-19 19:40:42.636	0	09:00	Windhoek → Sossusvlei → Etosha National Park → Windhoek	OPEN
1bf0f709-5326-47fa-8e1e-2976effe9d06	4b10b727-136a-4942-a888-49513425164c	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.672	2026-10-19 19:40:42.672	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
5978863d-30b8-4185-93a2-43e5d9fc8aff	4b10b727-136a-4942-a888-49513425164c	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.682	2026-10-19 19:40:42.682	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
8280d994-17d8-43b2-83fc-e87b91944a42	4b10b727-136a-4942-a888-49513425164c	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.693	2026-10-19 19:40:42.693	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
4dc472bb-9b03-48fe-a00a-592c5ba9f0a7	4b10b727-136a-4942-a888-49513425164c	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.703	2026-10-19 19:40:42.703	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
c4d388a6-f9a9-4f15-bd21-1973db509b6c	4b10b727-136a-4942-a888-49513425164c	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.714	2026-10-19 19:40:42.714	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
3527b435-7a68-43b1-aa4e-9a4d4c8046db	4b10b727-136a-4942-a888-49513425164c	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.726	2026-10-19 19:40:42.726	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
90cf9d6d-e8cc-4c08-93c4-dc5257f95501	4b10b727-136a-4942-a888-49513425164c	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.737	2026-10-19 19:40:42.737	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
265e9da0-5a9f-4117-8806-d60e44bf9e14	4b10b727-136a-4942-a888-49513425164c	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.749	2026-10-19 19:40:42.749	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
d539063b-69d2-4c7a-b2f3-454a8d690e40	4b10b727-136a-4942-a888-49513425164c	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.761	2026-10-19 19:40:42.761	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
2033fe3b-c60d-48ec-a01c-791abf241889	4b10b727-136a-4942-a888-49513425164c	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.771	2026-10-19 19:40:42.771	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
344ea2c9-c36b-48ad-a60b-fe434047c21e	4b10b727-136a-4942-a888-49513425164c	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.782	2026-10-19 19:40:42.782	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
d76fa5c1-aab8-48d0-9809-588a4dd59925	4b10b727-136a-4942-a888-49513425164c	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.793	2026-10-19 19:40:42.793	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
80bb8db1-34a3-428f-a39e-2401ed7328a8	4b10b727-136a-4942-a888-49513425164c	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.803	2026-10-19 19:40:42.803	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
54f523f4-97e1-4604-b67a-f828a0bcd0c2	4b10b727-136a-4942-a888-49513425164c	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.815	2026-10-19 19:40:42.815	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
9a94144e-4c63-4b1b-95cc-314d46d06aec	4b10b727-136a-4942-a888-49513425164c	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.826	2026-10-19 19:40:42.826	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
223a8e22-af24-4b44-b50d-861a87b0ab5e	4b10b727-136a-4942-a888-49513425164c	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.835	2026-10-19 19:40:42.835	0	07:00	Entebbe → Bwindi Impenetrable National Park → Entebbe	OPEN
5db4f4d9-52f0-4879-9792-b754e519b775	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2026-11-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.848	2026-10-19 19:40:42.848	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
4af095ae-6f52-459f-aef7-6168ac7879cb	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2026-11-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.858	2026-10-19 19:40:42.858	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
d370a2e3-ab95-4e97-a8fa-9b6973410744	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2026-12-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.868	2026-10-19 19:40:42.868	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
8f95f13e-a4d4-4fdd-b303-d3c091f89ac0	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2026-12-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.878	2026-10-19 19:40:42.878	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
6ca4b8ad-73f2-4403-8a6c-ae324af0f3ad	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2026-12-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.888	2026-10-19 19:40:42.888	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
6e16f57e-e34d-4167-a0a6-6354c632d07c	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-01-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.898	2026-10-19 19:40:42.898	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
c94fd077-8a20-4df1-8b0b-f8cc21b28bce	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-01-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.908	2026-10-19 19:40:42.908	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
99096832-10ab-40d5-9be7-3d30bb20ac38	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-02-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.917	2026-10-19 19:40:42.917	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
c71e2efd-a6ef-4900-8f27-8fbb1465cc63	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-02-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.927	2026-10-19 19:40:42.927	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
34c1dd49-ba72-42bc-83d8-5e07fcd214e4	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-03-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.939	2026-10-19 19:40:42.939	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
f1db4f0f-28fc-4c07-9ee7-e85d5b191f3c	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-03-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.95	2026-10-19 19:40:42.95	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
dd7a6137-96ce-451f-ad87-34c78b630aff	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-04-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.959	2026-10-19 19:40:42.959	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
b6fa223b-1cff-4100-bd94-60e943733c1d	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-04-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.969	2026-10-19 19:40:42.969	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
6c5e3fb5-7cbd-4ed4-be8d-3b0f0ef38ba4	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-05-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.979	2026-10-19 19:40:42.979	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
59a7edcf-56b2-412e-b6e4-7e06504f681d	841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	2027-05-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:42.988	2026-10-19 19:40:42.988	0	06:30	Kampala → Murchison Falls National Park → Kampala	OPEN
87f5fb0a-852c-4366-930f-24df29aad1f1	b0018478-834e-4bf0-abf6-6d3b44b1acec	2026-11-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.001	2026-10-19 19:40:43.001	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
01d5a46d-6db8-4c15-980d-fee42333e428	b0018478-834e-4bf0-abf6-6d3b44b1acec	2026-11-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.011	2026-10-19 19:40:43.011	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
05c3700a-15e5-4cac-b3f3-8296bebe224f	b0018478-834e-4bf0-abf6-6d3b44b1acec	2026-12-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.021	2026-10-19 19:40:43.021	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
c9e5e456-b3da-4e4a-a076-b3495953480f	b0018478-834e-4bf0-abf6-6d3b44b1acec	2026-12-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.03	2026-10-19 19:40:43.03	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
06d633a0-9fb0-4132-b71c-de772ecf0803	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-01-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.04	2026-10-19 19:40:43.04	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
e9c3d159-eade-4c3e-8e05-37735fe8e25d	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-01-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.049	2026-10-19 19:40:43.049	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
7d6dcc89-7707-41b4-9eed-24623bd7633e	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-01-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.06	2026-10-19 19:40:43.06	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
c971866e-c2ba-4177-98c5-ed917adfe890	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-02-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.071	2026-10-19 19:40:43.071	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
f39cfbf1-2896-4d2f-a56c-4817adacfd67	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-02-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.08	2026-10-19 19:40:43.08	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
fbb2a57f-aa5d-49b7-96d2-2ad01ffbc8be	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-03-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.09	2026-10-19 19:40:43.09	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
b65692cd-2394-4bf3-b908-e943570dcd8f	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-03-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.1	2026-10-19 19:40:43.1	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
344f7adf-49e6-497d-ae1a-e46d249227fc	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-04-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.109	2026-10-19 19:40:43.109	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
793203ea-792a-4c8d-a68a-68bbae10e67c	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-04-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.117	2026-10-19 19:40:43.117	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
f2215a39-5b82-4468-bd63-9e4328c23d44	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-05-09 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.127	2026-10-19 19:40:43.127	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
a0e1f6f7-ebc7-48fc-8a30-32ec943a8ea7	b0018478-834e-4bf0-abf6-6d3b44b1acec	2027-05-23 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.135	2026-10-19 19:40:43.135	0	07:00	Entebbe → Queen Elizabeth National Park → Bwindi Impenetrable National Park → Entebbe	OPEN
f6ff16e6-2ed6-4f2c-b724-9a1b8932bf80	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.165	2026-10-19 19:40:43.165	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
82d0fd6f-9324-4a3a-94c0-7a27cc88fcbe	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.174	2026-10-19 19:40:43.174	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
0585eac1-4b92-4bee-8262-851bde6aa2bb	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.183	2026-10-19 19:40:43.183	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
00295383-2acc-4a0f-a445-e1fda47e753c	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.192	2026-10-19 19:40:43.192	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
a1a59ca3-0349-4c24-863e-b0bd5823ca5a	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.203	2026-10-19 19:40:43.203	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
938c4fa3-cd1b-4819-8ae3-fb009db972f4	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.215	2026-10-19 19:40:43.215	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
742aa027-d14e-49c3-be09-267f4b3ab287	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.225	2026-10-19 19:40:43.225	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
2227800a-eb8c-4ca4-897c-b83017f3de3c	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.234	2026-10-19 19:40:43.234	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
9d13f852-ab90-4569-bb1d-a74506597f7a	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.244	2026-10-19 19:40:43.244	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
9d73ad51-e716-4e4e-923f-43080ae4cdfa	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.253	2026-10-19 19:40:43.253	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
b82183b7-d7b2-4079-bfd5-35c676f149c1	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.262	2026-10-19 19:40:43.262	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
11467f0f-465b-4eec-944e-4ade3791fc40	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.271	2026-10-19 19:40:43.271	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e70f3c0c-c046-4525-8ca6-a78d1535c32b	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.28	2026-10-19 19:40:43.28	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
180cc9b3-1af4-4929-a0e1-99c6394742c1	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.29	2026-10-19 19:40:43.29	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
59325d29-23e5-48e5-bbee-b629974edcd3	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.299	2026-10-19 19:40:43.299	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
56a8c5fb-ded6-4435-ab4a-5e84377f6cc3	ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.308	2026-10-19 19:40:43.308	0	07:30	Arusha → Lake Manyara National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
f615a726-0936-4fdd-90aa-c541cc057239	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2026-11-05 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.32	2026-10-19 19:40:43.32	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
6b8e2c61-ed85-43e2-8c91-423c1369d595	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2026-11-19 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.329	2026-10-19 19:40:43.329	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
f0c67b9a-8e63-4636-9d8e-c470f1c6b284	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2026-12-03 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.338	2026-10-19 19:40:43.338	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
9daf8b84-5142-4066-9d40-16caf9246365	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2026-12-17 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.347	2026-10-19 19:40:43.347	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
c5e22033-1303-4c63-af92-93cc2119b7c4	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2026-12-31 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.357	2026-10-19 19:40:43.357	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
fd279e17-cc03-434f-815a-6ff2744d2fc2	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-01-14 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.366	2026-10-19 19:40:43.366	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
97611566-9c03-4b93-9a96-e1920dca24bf	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-01-28 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.375	2026-10-19 19:40:43.375	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
d97f3bb1-a287-4129-b81d-e9019c877b97	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-02-11 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.385	2026-10-19 19:40:43.385	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
6b784c87-ed6c-456b-bb71-de80bcc2ce48	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-02-25 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.395	2026-10-19 19:40:43.395	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
0aa624a7-a9d8-4d31-9f10-7124b29c1637	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-03-11 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.404	2026-10-19 19:40:43.404	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e01b0438-9394-4706-bc66-6623ca044893	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-03-25 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.414	2026-10-19 19:40:43.414	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
79302dd3-37e7-47df-9488-c54db5221642	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-04-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.424	2026-10-19 19:40:43.424	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
bb82f084-993b-4fd5-b30e-0135c7588851	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-04-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.433	2026-10-19 19:40:43.433	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
3470c8e3-cb23-46a0-8be0-324b021e0de0	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-05-06 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.443	2026-10-19 19:40:43.443	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
78549d72-8665-48ef-a01d-29991b0c37f9	e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	2027-05-20 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.453	2026-10-19 19:40:43.453	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
dccca622-0424-4634-9273-c06c0b15303e	ed84ea48-915b-4857-bef2-540b3d396616	2026-11-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.467	2026-10-19 19:40:43.467	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
2f5107fe-777d-479e-8b67-eeae90e42d8b	ed84ea48-915b-4857-bef2-540b3d396616	2026-11-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.477	2026-10-19 19:40:43.477	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
cca8c768-146a-41ba-84ba-95fd1a45b74d	ed84ea48-915b-4857-bef2-540b3d396616	2026-12-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.486	2026-10-19 19:40:43.486	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
a6b354d5-4697-4cd3-aa34-78cd6d290ea6	ed84ea48-915b-4857-bef2-540b3d396616	2026-12-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.494	2026-10-19 19:40:43.494	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
992c0890-89e4-4812-b0a0-2776f4a7e7a9	ed84ea48-915b-4857-bef2-540b3d396616	2027-01-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.503	2026-10-19 19:40:43.503	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
e3e6ebd5-dde5-41b8-9c12-f2d44fd0b43d	ed84ea48-915b-4857-bef2-540b3d396616	2027-01-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.513	2026-10-19 19:40:43.513	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
fa3864b8-1a3d-4206-8e16-b97556f1aa68	ed84ea48-915b-4857-bef2-540b3d396616	2027-01-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.525	2026-10-19 19:40:43.525	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
24e0fe63-5165-479b-b81f-768dc7f686d2	ed84ea48-915b-4857-bef2-540b3d396616	2027-02-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.535	2026-10-19 19:40:43.535	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
238bf4f0-d986-4c67-aed4-440e5239fa89	ed84ea48-915b-4857-bef2-540b3d396616	2027-02-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.544	2026-10-19 19:40:43.544	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
772e74f3-3eaf-491b-a95c-7ecf71fab33f	ed84ea48-915b-4857-bef2-540b3d396616	2027-03-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.554	2026-10-19 19:40:43.554	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
d933b1b7-828f-420f-bb6e-96da541fd19d	ed84ea48-915b-4857-bef2-540b3d396616	2027-03-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.564	2026-10-19 19:40:43.564	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
ccfd062f-8b4f-4246-8721-dd5dd15f8425	ed84ea48-915b-4857-bef2-540b3d396616	2027-04-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.573	2026-10-19 19:40:43.573	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
c898c658-5e20-4191-96af-1b484d263027	ed84ea48-915b-4857-bef2-540b3d396616	2027-04-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.583	2026-10-19 19:40:43.583	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
ce6d6560-3650-42a8-a256-c885280db35f	ed84ea48-915b-4857-bef2-540b3d396616	2027-05-09 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.593	2026-10-19 19:40:43.593	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
6b4a3a48-66f5-4d34-9bb0-26fdc73c3499	ed84ea48-915b-4857-bef2-540b3d396616	2027-05-23 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.602	2026-10-19 19:40:43.602	0	07:30	Arusha → Tarangire National Park → Ngorongoro Crater → Arusha	OPEN
3b18d46b-b32f-45dd-af51-8e3de846d36f	39596113-bf53-4c77-8d0b-affaabb30a9f	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.64	2026-10-19 19:40:43.64	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
a2d2ef7a-9d6d-4fb9-b583-aa9bbe2b1257	39596113-bf53-4c77-8d0b-affaabb30a9f	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.65	2026-10-19 19:40:43.65	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
9b078675-d457-4d6b-a5da-a2f5b494a62d	39596113-bf53-4c77-8d0b-affaabb30a9f	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.66	2026-10-19 19:40:43.66	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
8711e167-72a8-4e0a-9ba9-91adcfa09bcf	39596113-bf53-4c77-8d0b-affaabb30a9f	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.67	2026-10-19 19:40:43.67	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
a4bc9f1e-2db0-439d-9f4c-9f04725c0862	39596113-bf53-4c77-8d0b-affaabb30a9f	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.679	2026-10-19 19:40:43.679	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
c26a825b-5afc-474a-947f-dd039d2d8fc6	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.689	2026-10-19 19:40:43.689	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
0035b751-392c-4ebf-b1a2-ae81c03b2782	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.698	2026-10-19 19:40:43.698	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
a3dc51ed-7150-4c84-9d4e-457b580718f4	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.709	2026-10-19 19:40:43.709	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
b16b69e6-5f46-4ca3-8914-b3f93bacb765	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.718	2026-10-19 19:40:43.718	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
497569e8-1ad2-4766-9ad4-3127dcba0a50	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.728	2026-10-19 19:40:43.728	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
b7358801-2102-4ba4-a892-657485a022b1	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.737	2026-10-19 19:40:43.737	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
a73fd4bd-7b07-4b84-b353-ed2f0f977c46	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.747	2026-10-19 19:40:43.747	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
cfdf07d1-123b-4e38-8eb2-7912350bd986	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.757	2026-10-19 19:40:43.757	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
8eaa25bf-e571-4e1f-b29c-90412e84139d	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.766	2026-10-19 19:40:43.766	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
98357606-2319-417d-a370-363bfb476b54	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.776	2026-10-19 19:40:43.776	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
1f41a137-d871-400f-bec5-96b5b3381bfe	39596113-bf53-4c77-8d0b-affaabb30a9f	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.786	2026-10-19 19:40:43.786	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
a7666d70-9014-451d-b6fd-bc9af03e933e	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2026-11-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.798	2026-10-19 19:40:43.798	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
aef2f0fd-7987-4114-ba99-d7b521a4c123	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2026-11-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.807	2026-10-19 19:40:43.807	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
8dbbb0af-84d0-4b52-986f-35f9e4ff20a9	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2026-12-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.816	2026-10-19 19:40:43.816	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
65f8762d-da88-43f9-b15f-6116f98919de	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2026-12-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.825	2026-10-19 19:40:43.825	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
fde2322c-3f24-45df-8637-02de1ff6aaf4	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2026-12-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.834	2026-10-19 19:40:43.834	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
d40923b9-e11a-48f1-9974-7d284e2c70c9	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-01-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.844	2026-10-19 19:40:43.844	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
b87d5b8e-6fa8-485b-aeb1-e38ecf9d3816	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-01-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.854	2026-10-19 19:40:43.854	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
057cbcaf-1ded-452f-b284-5ff5175b9c71	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-02-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.864	2026-10-19 19:40:43.864	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
64544672-5f9c-4c5a-9c32-0d30b3a671c9	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-02-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.874	2026-10-19 19:40:43.874	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
fb5dbfc0-3490-41c4-9b47-df0b0faee86e	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-03-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.884	2026-10-19 19:40:43.884	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
05a4dd64-f2ac-4062-8c8c-27d73360d990	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-03-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.894	2026-10-19 19:40:43.894	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
9a75b069-c845-4dee-9fce-11d7966cb404	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-04-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.904	2026-10-19 19:40:43.904	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
4508cf8b-e2bb-4eec-9374-c3e58ef5eae0	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-04-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.913	2026-10-19 19:40:43.913	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
b8f2f263-94ff-44e8-b223-0b576c76e4d0	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-05-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.923	2026-10-19 19:40:43.923	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
36d22832-1f54-41ee-bf29-d5279978504e	86b698b2-aa4a-409d-93c3-b2f32ef5932c	2027-05-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.933	2026-10-19 19:40:43.933	0	07:30	Arusha → Lake Manyara National Park → Ngorongoro Crater → Arusha	OPEN
17ef2fe9-c79a-4230-840b-c9c9da80bc51	cebedd8f-a91a-44ca-82d7-a8c814290735	2026-11-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.946	2026-10-19 19:40:43.946	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
1543180b-e696-45f2-9bc2-aad59d463010	cebedd8f-a91a-44ca-82d7-a8c814290735	2026-11-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.957	2026-10-19 19:40:43.957	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
542243cd-9a13-415d-86d4-710fced2d21f	cebedd8f-a91a-44ca-82d7-a8c814290735	2026-12-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.967	2026-10-19 19:40:43.967	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
514528ab-c68f-4a7f-a610-4c3dee6342c2	cebedd8f-a91a-44ca-82d7-a8c814290735	2026-12-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.977	2026-10-19 19:40:43.977	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
96ce069a-b6da-41a6-8875-8e4803d47661	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-01-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.987	2026-10-19 19:40:43.987	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
59c60c8c-108e-4684-b4e8-d8686b938c94	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-01-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:43.996	2026-10-19 19:40:43.996	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
86f5939e-2e4b-46b0-a58c-4a2883ac4762	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-01-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.006	2026-10-19 19:40:44.006	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
5c8b650d-796f-466d-b110-d79abba10fff	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-02-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.016	2026-10-19 19:40:44.016	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
cdd7c292-0606-40d1-9bf6-448a864b5bc3	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-02-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.025	2026-10-19 19:40:44.025	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
4c81b543-b8ff-403a-afdf-6a72ee20f45d	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-03-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.035	2026-10-19 19:40:44.035	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
33252c39-5a1c-4705-824a-a03b16d2fbb3	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-03-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.045	2026-10-19 19:40:44.045	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
24547be1-807f-4332-9505-fc8a35713272	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-04-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.057	2026-10-19 19:40:44.057	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
dee89c60-5daa-4074-8c69-aa88ca813236	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-04-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.067	2026-10-19 19:40:44.067	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
0e56dee9-bc10-464a-bed2-184cc1afb1a4	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-05-09 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.077	2026-10-19 19:40:44.077	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
66883738-b903-464b-912f-85e1b2313450	cebedd8f-a91a-44ca-82d7-a8c814290735	2027-05-23 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.087	2026-10-19 19:40:44.087	0	08:30	Dar es Salaam → Nyerere National Park → Ruaha National Park → Dar es Salaam	OPEN
1b3d512e-cc34-4357-8747-3c103eb8a3d4	a52e3b15-970d-440b-a449-16b38fbd1f74	2026-11-02 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.108	2026-10-19 19:40:44.108	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
bb3cc643-8775-4227-a2b8-e4199b6317a0	a52e3b15-970d-440b-a449-16b38fbd1f74	2026-11-16 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.118	2026-10-19 19:40:44.118	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
513f51f6-ac9f-4cfb-a26e-5428e02b5324	a52e3b15-970d-440b-a449-16b38fbd1f74	2026-11-30 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.127	2026-10-19 19:40:44.127	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
4506a4c2-8bf9-48bc-a927-aa62388b6cc0	a52e3b15-970d-440b-a449-16b38fbd1f74	2026-12-14 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.136	2026-10-19 19:40:44.136	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
d7d5548b-3080-4265-820b-85a8cc1422b7	a52e3b15-970d-440b-a449-16b38fbd1f74	2026-12-28 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.146	2026-10-19 19:40:44.146	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
d3a0d4e7-a77b-4f8c-b18e-5c6380856477	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-01-11 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.155	2026-10-19 19:40:44.155	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
04670199-e0e3-43b2-ac22-8c7afe588584	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-01-25 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.165	2026-10-19 19:40:44.165	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
2035219f-56f4-4543-a19e-9e44006330b1	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-02-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.175	2026-10-19 19:40:44.175	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
42ce7a25-d962-4d5a-8363-9656252f293f	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-02-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.185	2026-10-19 19:40:44.185	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
d1ac1bb4-8c37-4572-a926-e7f35b472b85	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-03-08 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.194	2026-10-19 19:40:44.194	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
82c9544f-d7ec-40ce-a041-3448d48ffc0e	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-03-22 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.204	2026-10-19 19:40:44.204	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
8c37a419-d7c8-4cc6-a4d5-d216ac9f02ac	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-04-05 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.213	2026-10-19 19:40:44.213	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
45dd01bd-45c1-45b5-b7c1-23bb42b1910d	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-03-11 00:00:00	16	\N	2026-10-19 19:40:45.001	2026-10-19 19:40:45.001	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
6110817f-67fc-4640-9c74-92d3198005f9	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-04-19 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.223	2026-10-19 19:40:44.223	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
ec4dd96b-1b83-4bfe-a4eb-d69abe51b1cb	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-05-03 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.232	2026-10-19 19:40:44.232	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
3ebc8f1a-343e-4708-8371-b6908f40becb	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-05-17 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.242	2026-10-19 19:40:44.242	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
aeda1026-66ac-48a4-8d16-7d086141af9d	a52e3b15-970d-440b-a449-16b38fbd1f74	2027-05-31 00:00:00	6	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.251	2026-10-19 19:40:44.251	0	10:00	Mfuwe → South Luangwa National Park → Lower Zambezi National Park → Mfuwe	OPEN
490417c9-4ee4-43f1-9e15-cc7a07733f3e	7b73b43a-7ac4-467a-a0ff-668736ded876	2026-11-02 00:00:00	14	\N	2026-10-19 19:40:44.271	2026-10-19 19:40:44.271	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
33db44cc-6c41-412f-86a6-605fce9f68c4	7b73b43a-7ac4-467a-a0ff-668736ded876	2026-11-16 00:00:00	14	\N	2026-10-19 19:40:44.28	2026-10-19 19:40:44.28	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
15f85944-9711-4d8f-950d-695aad7e7444	7b73b43a-7ac4-467a-a0ff-668736ded876	2026-11-30 00:00:00	14	\N	2026-10-19 19:40:44.29	2026-10-19 19:40:44.29	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
8551a0eb-da42-443e-9104-75ab3acf7f7e	7b73b43a-7ac4-467a-a0ff-668736ded876	2026-12-14 00:00:00	14	\N	2026-10-19 19:40:44.301	2026-10-19 19:40:44.301	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
0a88991d-883c-4b29-bed6-4a7c958c6e03	7b73b43a-7ac4-467a-a0ff-668736ded876	2026-12-28 00:00:00	14	\N	2026-10-19 19:40:44.312	2026-10-19 19:40:44.312	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
02609493-aefe-4016-95ca-51618fa5b728	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-01-11 00:00:00	14	\N	2026-10-19 19:40:44.323	2026-10-19 19:40:44.323	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
9a3f9903-a17f-4f0f-8ae7-9c6c972c9c02	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-01-25 00:00:00	14	\N	2026-10-19 19:40:44.334	2026-10-19 19:40:44.334	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
db9975ba-f115-4e20-8474-0ea32c72d4fe	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-02-08 00:00:00	14	\N	2026-10-19 19:40:44.344	2026-10-19 19:40:44.344	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
3b770794-a37c-4afb-82f7-e90e4383d8f3	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-02-22 00:00:00	14	\N	2026-10-19 19:40:44.355	2026-10-19 19:40:44.355	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
85b21ccc-47ec-4392-8357-81242a4de4cb	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-03-08 00:00:00	14	\N	2026-10-19 19:40:44.365	2026-10-19 19:40:44.365	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
98e8fe8e-86a6-4f28-bee9-def2608d674b	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-03-22 00:00:00	14	\N	2026-10-19 19:40:44.375	2026-10-19 19:40:44.375	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
129b9aa5-b050-435c-b248-aa5e3a92a5e6	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-04-05 00:00:00	14	\N	2026-10-19 19:40:44.385	2026-10-19 19:40:44.385	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
a8a12b76-34de-4dfe-92d8-792eec3132e2	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-04-19 00:00:00	14	\N	2026-10-19 19:40:44.395	2026-10-19 19:40:44.395	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
613790fa-507f-4ad9-8e1d-e6e0ce71b6f8	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-05-03 00:00:00	14	\N	2026-10-19 19:40:44.407	2026-10-19 19:40:44.407	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
94d9f97b-045e-4dfb-8444-e16670ee3ee5	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-05-17 00:00:00	14	\N	2026-10-19 19:40:44.422	2026-10-19 19:40:44.422	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
3a28b7f0-6a55-404a-a6fc-6cc1bd29c0fd	7b73b43a-7ac4-467a-a0ff-668736ded876	2027-05-31 00:00:00	14	\N	2026-10-19 19:40:44.435	2026-10-19 19:40:44.435	0	07:30	Arusha → Serengeti National Park → Tarangire National Park → Zanzibar → Arusha	OPEN
c710cdc6-28c6-4fd3-a304-493cba4b5dbc	0050eece-311b-427b-8cca-996362950d27	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.462	2026-10-19 19:40:44.462	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e4881147-c1af-4dc2-9677-f380184c3eef	0050eece-311b-427b-8cca-996362950d27	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.481	2026-10-19 19:40:44.481	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
de22fb3f-eee9-47a1-ab58-22ba7e3a83c1	0050eece-311b-427b-8cca-996362950d27	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.497	2026-10-19 19:40:44.497	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
9af48930-46f7-42fd-b917-e5a7ffe9a435	0050eece-311b-427b-8cca-996362950d27	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.516	2026-10-19 19:40:44.516	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e7257cdf-5ca5-4eb6-a8b3-37ed8c4e0290	0050eece-311b-427b-8cca-996362950d27	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.539	2026-10-19 19:40:44.539	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
5565697c-a914-4625-ac71-c5680e3c4935	0050eece-311b-427b-8cca-996362950d27	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.553	2026-10-19 19:40:44.553	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
977f27ca-e18f-471d-973e-ad876ec3d1c1	0050eece-311b-427b-8cca-996362950d27	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.566	2026-10-19 19:40:44.566	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
cd19ba03-e869-427a-bab9-0ac6914ec9bf	0050eece-311b-427b-8cca-996362950d27	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.58	2026-10-19 19:40:44.58	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
1be3467e-2e33-4c3a-8ca5-70e1e0094981	0050eece-311b-427b-8cca-996362950d27	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.594	2026-10-19 19:40:44.594	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
e67737bd-44c7-4a70-b2c7-43962d4d965e	0050eece-311b-427b-8cca-996362950d27	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.607	2026-10-19 19:40:44.607	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
ccdfd18a-aaa6-4af3-a556-ba4675e2a9d4	0050eece-311b-427b-8cca-996362950d27	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.622	2026-10-19 19:40:44.622	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
c27fe65a-9fe7-4ff2-899f-dd10ca149e3e	0050eece-311b-427b-8cca-996362950d27	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.634	2026-10-19 19:40:44.634	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
33ed711c-30fc-4d1e-b17e-c9a44dbd166c	0050eece-311b-427b-8cca-996362950d27	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.647	2026-10-19 19:40:44.647	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
1637c17c-d60b-4b44-bf2d-ad4a3082fedd	0050eece-311b-427b-8cca-996362950d27	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.657	2026-10-19 19:40:44.657	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
84298ec8-f1a2-42b0-a572-8cddff770cc3	0050eece-311b-427b-8cca-996362950d27	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.667	2026-10-19 19:40:44.667	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
46b57663-f611-493b-b99e-b429b001d078	0050eece-311b-427b-8cca-996362950d27	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:44.678	2026-10-19 19:40:44.678	0	07:30	Arusha → Tarangire National Park → Serengeti National Park → Ngorongoro Crater → Arusha	OPEN
0d8e3eae-449e-40c1-81d0-aab0e61888bf	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-11-02 00:00:00	16	\N	2026-10-19 19:40:44.711	2026-10-19 19:40:44.711	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
b23157f1-a264-4c06-9d87-aee8bc2c8ede	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-11-16 00:00:00	16	\N	2026-10-19 19:40:44.721	2026-10-19 19:40:44.721	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
59808e43-acf9-49ee-abc7-8e1abb93c88f	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-11-30 00:00:00	16	\N	2026-10-19 19:40:44.731	2026-10-19 19:40:44.731	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
81e6f9a2-e046-48e7-99fb-b4d6256f814f	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-12-14 00:00:00	16	\N	2026-10-19 19:40:44.74	2026-10-19 19:40:44.74	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
1bc26a6b-7c61-4b18-9a5b-5edb3dd57996	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2026-12-28 00:00:00	16	\N	2026-10-19 19:40:44.75	2026-10-19 19:40:44.75	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
4f95be18-fc34-4cde-affe-ed7308c264ee	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-01-11 00:00:00	16	\N	2026-10-19 19:40:44.76	2026-10-19 19:40:44.76	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
d77bb1f0-1ad4-4f67-b0f9-98a51de4075d	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-01-25 00:00:00	16	\N	2026-10-19 19:40:44.771	2026-10-19 19:40:44.771	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
f094ee84-8743-4b22-be0a-6fcdff3660c6	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-02-08 00:00:00	16	\N	2026-10-19 19:40:44.782	2026-10-19 19:40:44.782	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
aeffcdc8-3570-448f-8644-27773d911cbf	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-02-22 00:00:00	16	\N	2026-10-19 19:40:44.796	2026-10-19 19:40:44.796	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
49706598-06e8-4199-805c-a4632c00b2a4	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-03-08 00:00:00	16	\N	2026-10-19 19:40:44.809	2026-10-19 19:40:44.809	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
5be38d4d-1ef9-40d6-8c63-283841def077	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-03-22 00:00:00	16	\N	2026-10-19 19:40:44.821	2026-10-19 19:40:44.821	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
37b2f0a7-b3d2-4f65-bec1-426842a16ff8	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-04-05 00:00:00	16	\N	2026-10-19 19:40:44.832	2026-10-19 19:40:44.832	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
0a888ebc-fc91-4b7d-8c8c-ccc8657855cd	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-04-19 00:00:00	16	\N	2026-10-19 19:40:44.844	2026-10-19 19:40:44.844	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
74733b06-19ad-4410-bdf7-6a5aad0158ca	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-05-03 00:00:00	16	\N	2026-10-19 19:40:44.856	2026-10-19 19:40:44.856	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
8d12542a-3c73-4261-8cd1-f8654bd124ea	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-05-17 00:00:00	16	\N	2026-10-19 19:40:44.867	2026-10-19 19:40:44.867	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
a9b79927-6eee-4156-856b-3104035ded05	48216cfe-fb0d-4f88-8886-f8e6f1c768c1	2027-05-31 00:00:00	16	\N	2026-10-19 19:40:44.881	2026-10-19 19:40:44.881	0	06:30	Nairobi → Masai Mara National Reserve → Amboseli National Park → Nairobi	OPEN
6270104a-7202-4aad-b80f-e20f1d78770e	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2026-11-05 00:00:00	16	\N	2026-10-19 19:40:44.898	2026-10-19 19:40:44.898	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
718676e3-a2ba-4ab0-952d-5561974c69e5	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2026-11-19 00:00:00	16	\N	2026-10-19 19:40:44.909	2026-10-19 19:40:44.909	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
93405252-6224-4d32-ba34-51c5bf668399	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2026-12-03 00:00:00	16	\N	2026-10-19 19:40:44.92	2026-10-19 19:40:44.92	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
862f0280-4572-411f-9dad-a577df20148b	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2026-12-17 00:00:00	16	\N	2026-10-19 19:40:44.93	2026-10-19 19:40:44.93	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
9b78a074-1ff4-4003-ac13-0b9266c27791	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2026-12-31 00:00:00	16	\N	2026-10-19 19:40:44.941	2026-10-19 19:40:44.941	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
71c1490a-2c68-4c3f-964f-21ebedc5ea39	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-01-14 00:00:00	16	\N	2026-10-19 19:40:44.953	2026-10-19 19:40:44.953	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
0f33f72a-0f24-443b-997e-def7b7873975	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-01-28 00:00:00	16	\N	2026-10-19 19:40:44.963	2026-10-19 19:40:44.963	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
f63ba0a3-a4c0-4819-8123-5b3a88b84b0c	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-02-11 00:00:00	16	\N	2026-10-19 19:40:44.975	2026-10-19 19:40:44.975	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
725f17df-0cc3-45d9-bc30-5e032534e0e1	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-03-25 00:00:00	16	\N	2026-10-19 19:40:45.015	2026-10-19 19:40:45.015	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
55cacbb9-6b3f-4ec7-895e-1e4aebdab5cd	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-04-08 00:00:00	16	\N	2026-10-19 19:40:45.027	2026-10-19 19:40:45.027	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
797264d6-69bf-4594-bbb3-b54646f1f394	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-04-22 00:00:00	16	\N	2026-10-19 19:40:45.038	2026-10-19 19:40:45.038	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
b66ce371-895a-4d69-950b-090190c0be4e	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-05-06 00:00:00	16	\N	2026-10-19 19:40:45.049	2026-10-19 19:40:45.049	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
c716038d-a471-4e0e-a937-2220db8f0285	f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	2027-05-20 00:00:00	16	\N	2026-10-19 19:40:45.06	2026-10-19 19:40:45.06	0	06:30	Nairobi → Samburu National Reserve → Lake Nakuru National Park → Nairobi	OPEN
f95bbb7d-1eb4-4f0b-95cd-13a57cee5ac8	d7798d79-c50f-4d0b-a025-fe7ab9366703	2026-11-08 00:00:00	16	\N	2026-10-19 19:40:45.08	2026-10-19 19:40:45.08	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
e44787e1-cd88-46fb-91e5-c52d8f7ed6ec	d7798d79-c50f-4d0b-a025-fe7ab9366703	2026-11-22 00:00:00	16	\N	2026-10-19 19:40:45.093	2026-10-19 19:40:45.093	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
afee30c7-fb94-468b-bdd2-26ebeec6f2fd	d7798d79-c50f-4d0b-a025-fe7ab9366703	2026-12-06 00:00:00	16	\N	2026-10-19 19:40:45.106	2026-10-19 19:40:45.106	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
fa596dba-25a6-4404-94eb-39831a77abc4	d7798d79-c50f-4d0b-a025-fe7ab9366703	2026-12-20 00:00:00	16	\N	2026-10-19 19:40:45.117	2026-10-19 19:40:45.117	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
1c0aa5f9-5eb7-46cb-8d9a-c42667f9f10a	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-01-03 00:00:00	16	\N	2026-10-19 19:40:45.13	2026-10-19 19:40:45.13	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
4ad46bf0-f17f-4b72-8167-b19b45ed028e	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-01-17 00:00:00	16	\N	2026-10-19 19:40:45.142	2026-10-19 19:40:45.142	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
0564461a-7dc5-4e29-92e8-da66027fe73f	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-01-31 00:00:00	16	\N	2026-10-19 19:40:45.152	2026-10-19 19:40:45.152	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
e8795a08-e3ed-4f1e-803d-d0c447fd73f0	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-02-14 00:00:00	16	\N	2026-10-19 19:40:45.164	2026-10-19 19:40:45.164	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
c534b479-7c90-4664-9a2a-c87c92e8b2b0	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-02-28 00:00:00	16	\N	2026-10-19 19:40:45.174	2026-10-19 19:40:45.174	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
30971fb2-789c-45ae-a4e6-7c83c34935bc	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-03-14 00:00:00	16	\N	2026-10-19 19:40:45.184	2026-10-19 19:40:45.184	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
d4391211-0a6d-4806-83d3-3644d75ac738	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-03-28 00:00:00	16	\N	2026-10-19 19:40:45.194	2026-10-19 19:40:45.194	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
f3c220b2-1b8c-4bcf-8dae-593d7551171b	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-04-11 00:00:00	16	\N	2026-10-19 19:40:45.204	2026-10-19 19:40:45.204	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
e3535945-39b9-4999-a21b-ff25db7cd9c0	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-04-25 00:00:00	16	\N	2026-10-19 19:40:45.214	2026-10-19 19:40:45.214	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
6ffb0518-f5a8-4bb9-ba93-979fd989c2c0	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-05-09 00:00:00	16	\N	2026-10-19 19:40:45.224	2026-10-19 19:40:45.224	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
f525d5a7-e991-4553-9224-6cf68a68adb7	d7798d79-c50f-4d0b-a025-fe7ab9366703	2027-05-23 00:00:00	16	\N	2026-10-19 19:40:45.234	2026-10-19 19:40:45.234	0	06:00	Mombasa → Tsavo East National Park → Amboseli National Park → Mombasa	OPEN
b3e20dd8-4982-4c9f-8ad3-7a3168a4ebd7	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.256	2026-10-19 19:40:45.256	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
590da68b-6570-4cce-9e70-97a4382d6bee	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.266	2026-10-19 19:40:45.266	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
f73b964a-b599-4d49-b316-8d8877475df1	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.276	2026-10-19 19:40:45.276	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
c8f31d9e-1ff5-41dd-923c-8557d7fef516	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.286	2026-10-19 19:40:45.286	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
adab0856-b3df-4705-a7b6-3185e3673e82	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.296	2026-10-19 19:40:45.296	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
cf1cb19a-c4ed-4c7a-b950-134ff189e7ad	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.309	2026-10-19 19:40:45.309	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
7acc8641-47a3-428e-b24f-5e8a87893fe4	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.322	2026-10-19 19:40:45.322	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
f11c1167-203f-4410-b01d-60b21256bde0	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.333	2026-10-19 19:40:45.333	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
ef015365-fd83-4355-b726-29d4062d8343	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.345	2026-10-19 19:40:45.345	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
838461bc-378f-4ccc-b320-b94b88b3e786	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.358	2026-10-19 19:40:45.358	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
cc5eb504-f993-44fe-be81-7ca9383fd86f	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.371	2026-10-19 19:40:45.371	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
54d23faf-5aa6-4cf3-8d40-0c69117b4ba2	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.382	2026-10-19 19:40:45.382	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
62e7ff5a-6a18-4a93-9118-e9c95f0a7cd1	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.393	2026-10-19 19:40:45.393	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
a8d9f823-6c1e-4377-938a-1347c6d07c93	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.403	2026-10-19 19:40:45.403	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
96787a16-42d2-46b6-959e-2217044922b4	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.415	2026-10-19 19:40:45.415	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
a3f2371b-fc03-413b-b972-63bc0da2556b	1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.425	2026-10-19 19:40:45.425	0	08:00	Maun → Okavango Delta → Chobe National Park → Central Kalahari Game Reserve → Maun	OPEN
4e776a9b-c502-4713-81e6-b66c92fd5160	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.462	2026-10-19 19:40:45.462	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
6b11126d-e6d3-4c12-95ea-ef5924661b51	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.474	2026-10-19 19:40:45.474	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
9ed7561f-2d28-4413-a2f1-f678d41126b8	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.486	2026-10-19 19:40:45.486	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
978ae638-6f12-43bc-994a-5d257cdc8bd0	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.498	2026-10-19 19:40:45.498	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
9143e6aa-2ec2-47df-8d95-fdee3d929d84	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.509	2026-10-19 19:40:45.509	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
ea001182-1bd7-46a3-91f5-9cbbfe86a864	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.52	2026-10-19 19:40:45.52	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
e8b32296-6bae-4af1-b0a8-2770679c14f3	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.53	2026-10-19 19:40:45.53	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
f74e5f2c-31ee-4996-ad05-7fd82c6729b5	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.541	2026-10-19 19:40:45.541	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
8b5e21d0-bd8e-4326-ba28-725978075393	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.551	2026-10-19 19:40:45.551	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
82132dac-5dc0-4600-b452-e8a025c3ee51	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.563	2026-10-19 19:40:45.563	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
abfb0d07-d912-4b5f-a7ff-abec7c26f72f	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.574	2026-10-19 19:40:45.574	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
d17e6851-e869-4240-bd99-2959a69cca02	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.584	2026-10-19 19:40:45.584	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
1eda51ef-2ad6-4ff0-911d-b11649dcb4ec	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.594	2026-10-19 19:40:45.594	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
620e2259-9f37-4ac9-bce6-8f45a367dcbc	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.605	2026-10-19 19:40:45.605	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
c14bf4da-0782-41a0-a729-72fa9ac85a43	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.617	2026-10-19 19:40:45.617	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
a8c3751f-7e97-4629-aa1e-54bbe5b8dbee	54a64fbb-a198-4a52-bb05-b4826eadb6d6	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.628	2026-10-19 19:40:45.628	0	07:30	Victoria Falls → Victoria Falls → Hwange National Park → Victoria Falls	OPEN
244026f3-3c30-48b5-9742-79e2c30ea6b8	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2026-11-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.641	2026-10-19 19:40:45.641	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
dbceeb66-429a-4aa2-99cc-5b3807370624	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2026-11-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.652	2026-10-19 19:40:45.652	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
b8e1a964-3ece-4434-b5ab-049f75bea0de	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2026-12-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.662	2026-10-19 19:40:45.662	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
2811362e-dbba-48ee-8ded-3b8fb312757e	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2026-12-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.673	2026-10-19 19:40:45.673	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
a5963387-25bb-47a8-ad12-54ce83e456a8	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2026-12-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.683	2026-10-19 19:40:45.683	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
208c66f5-bbfc-4932-b6b6-e73045e7d9d0	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-01-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.693	2026-10-19 19:40:45.693	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
15789fdb-5cf6-414e-ae70-83e5d9b31187	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-01-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.703	2026-10-19 19:40:45.703	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
2f1a20ec-9a37-4d21-a7f4-61bebd6d4d56	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-02-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.714	2026-10-19 19:40:45.714	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
0b56ad21-82b4-42fe-9313-0fa284ef03a8	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-02-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.725	2026-10-19 19:40:45.725	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
5ec907c5-9557-40ab-986c-3a94057496f4	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-03-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.735	2026-10-19 19:40:45.735	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
68ad53f4-fbf8-4f43-8330-4526beed4129	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-03-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.745	2026-10-19 19:40:45.745	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
fa076504-9b62-4b35-95cb-e20d0cddc6c4	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-04-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.756	2026-10-19 19:40:45.756	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
97e85e1f-3d35-4ce4-85b2-e214ee05fa29	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-04-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.768	2026-10-19 19:40:45.768	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
66756bc7-0be5-49b7-8a0a-00bae832c799	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-05-06 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.782	2026-10-19 19:40:45.782	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
b978a71a-c74c-4cb6-a4bd-291bd338bbfa	e681fcb2-4cce-4a59-adf3-e5e111d573e6	2027-05-20 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.795	2026-10-19 19:40:45.795	0	07:30	Victoria Falls → Mana Pools National Park → Chobe National Park → Victoria Falls	OPEN
719eafa1-8232-4e5c-b25c-10b706d57760	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2026-11-02 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.817	2026-10-19 19:40:45.817	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
3aa36d7a-6ad8-411d-980f-fea8fec79e67	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2026-11-16 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.826	2026-10-19 19:40:45.826	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
1dc44325-790d-475a-8d39-d941852d2b5a	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2026-11-30 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.836	2026-10-19 19:40:45.836	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
827b1388-3212-473a-9a67-1ddacd60bc74	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2026-12-14 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.846	2026-10-19 19:40:45.846	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
32e726f3-21c9-454c-a3e7-fa08911bedf5	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2026-12-28 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.856	2026-10-19 19:40:45.856	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
95a1e322-0ad8-4f54-b8b0-d3326c3b3328	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-01-11 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.865	2026-10-19 19:40:45.865	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
d7c5741b-329f-4526-8121-6feaef2f22a0	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-01-25 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.875	2026-10-19 19:40:45.875	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
12eacc69-933e-4f48-b749-e0539a5b46b4	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-02-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.884	2026-10-19 19:40:45.884	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
bfae9e83-c0ac-4b97-ad5d-190a97524960	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-02-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.894	2026-10-19 19:40:45.894	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
1be4afb4-6229-4954-bcf5-b8f1149d1f42	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-03-08 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.904	2026-10-19 19:40:45.904	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
e96ab8d6-0cba-44ac-9710-713b6ddfb048	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-03-22 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.914	2026-10-19 19:40:45.914	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
d15cba86-f27f-41de-b010-85c8abb35aa4	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-04-05 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.925	2026-10-19 19:40:45.925	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
26ad9d0c-f9b8-4e59-9345-def9c4e3f4d2	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-04-19 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.936	2026-10-19 19:40:45.936	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
8b3b1a97-415d-4089-a02d-ae6be35f7399	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-05-03 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.949	2026-10-19 19:40:45.949	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
9b72ad20-4dc9-421f-85d4-b6a0f15801f5	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-05-17 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.963	2026-10-19 19:40:45.963	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
7030f248-41f8-45d4-a276-802b93d5044c	cf9c4c10-cb65-4809-b97d-f2da3b8960c8	2027-05-31 00:00:00	7	Private departure: one vehicle reserved for your group	2026-10-19 19:40:45.974	2026-10-19 19:40:45.974	0	07:00	Entebbe → Bwindi Impenetrable National Park → Queen Elizabeth National Park → Murchison Falls National Park → Entebbe	OPEN
\.


--
-- Data for Name: tours; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tours (id, operator_id, title, slug, duration_days, duration_nights, min_price_usd, max_price_usd, comfort_level, tour_type, primary_country, start_location, end_location, inclusions, exclusions, is_published, created_at) FROM stdin;
db1583d7-156f-4c73-8e0e-e61cc5eac04c	42b041e2-036b-4aa0-bbff-422050609f5b	5-Day Serengeti & Ngorongoro Big Five Classic Safari	5-day-serengeti-ngorongoro-big-five-safari	5	4	1650	2100	MID_RANGE	PRIVATE	Tanzania	Arusha / Kilimanjaro Airport	Arusha	{"Private 4x4 Land Cruiser with popup roof","All park entry fees & conservation permits","Full board mid-range safari lodges","Professional English-speaking driver guide","Unlimited game drives & mineral water"}	{"International flights & visa fees","Tips for guide ($20/day recommended)","Personal travel insurance","Alcoholic beverages"}	t	2026-09-26 17:07:27.769
de687d5f-4b18-4edd-8eda-807a1e6021ef	786e8685-6f8c-4c7a-9856-885e39a7f030	3-Day Masai Mara Express Fly-in Luxury Safari	3-day-masai-mara-express-fly-in-safari	3	2	1290	1550	LUXURY	FLY_IN	Kenya	Nairobi Wilson Airport	Nairobi Wilson Airport	{"Return domestic flights (Nairobi to Mara airstrip)","Luxury tented camp accommodation","Shared 4x4 open safari vehicle game drives","All park entrance fees","All meals & house wines/beers"}	{"International flights","Hot air balloon safari ($480 addon)","Maasai village cultural fee ($30)"}	t	2026-09-26 17:07:27.794
fe28c470-d608-4792-a60e-891a0f15be4f	42b041e2-036b-4aa0-bbff-422050609f5b	Test Safari Package	test-safari-package-muipgylb	5	4	1500	2000	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"Game drives"}	{Flights}	t	2026-09-26 18:10:53.093
684eafde-f233-4f87-b8a5-76a45cb18253	2c2cd580-7109-4a21-ad9e-da9bde7941b5	Serengeti Great Migration & Crater Odyssey 1791837249952	serengeti-great-migration-crater-odyssey-1791837249952	6	5	2800	3600	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"4x4 Land Cruiser","Park Fees","Professional Guide","All Lodges & Meals"}	{"International Flights",Tips,"Travel Insurance"}	t	2026-10-12 20:34:15.545
7c0f3706-def2-4435-a0f0-8af36ea2217b	761c2fbc-af79-47f1-9390-5aeb60179942	Serengeti Great Migration & Crater Odyssey 1791837299424	serengeti-great-migration-crater-odyssey-1791837299424	6	5	2800	3600	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"4x4 Land Cruiser","Park Fees","Professional Guide","All Lodges & Meals"}	{"International Flights",Tips,"Travel Insurance"}	t	2026-10-12 20:35:00.66
7b73b43a-7ac4-467a-a0ff-668736ded876	1df9f16f-f050-442b-9759-73d8fdd573a6	9-Day Tanzania Budget Safari with Beach Holiday	9-day-tanzania-budget-safari-with-beach-holiday	9	8	1432	1647	BUDGET	SHARED_GROUP	Tanzania	Arusha	Arusha	{"Camping & Hotel","Shared tour",Budget}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.101
0050eece-311b-427b-8cca-996362950d27	c08876d2-7864-432b-a440-5c4c1fc5af5d	10-Day Chasing the Big 5 Tented Safari	10-day-chasing-the-big-5-tented-safari	10	9	2744	3156	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"Lodge & Tented Camp","Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.132
48216cfe-fb0d-4f88-8886-f8e6f1c768c1	d73ec798-0d36-4bcc-9773-bbae289fba53	7 Day Living Among the Elephants Group Safari	7-day-living-among-the-elephants-group-safari	7	6	790	908	BUDGET	SHARED_GROUP	Kenya	Nairobi	Nairobi	{"Tented Camp & Hotel","Shared tour (max 8 people)",Budget}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.163
1b23a0fa-0c50-4955-8d93-0c6ef2c587ba	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	9-Day Botswana Okavango & Kalahari Adventure	9-day-botswana-okavango-and-kalahari-adventure	9	8	3360	3864	MID_RANGE	PRIVATE	Botswana	Maun	Maun	{"Luxury tented camp","Private guide",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.195
cf9c4c10-cb65-4809-b97d-f2da3b8960c8	aad63409-b4e3-449b-ae96-72ddaec3ac94	8-Day Uganda Gorilla & Wildlife Safari	8-day-uganda-gorilla-and-wildlife-safari	8	7	3190	3668	MID_RANGE	PRIVATE	Uganda	Entebbe	Entebbe	{"Lodge & River Camp","Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.223
f5d69c5b-0635-43bd-9c0d-51ceabadf201	885fdd7f-43c3-43ae-a75d-d6801c5e3225	7-Day Karibu Safari	7-day-karibu-safari	7	6	5892	6776	LUXURY	PRIVATE	Tanzania	Arusha	Arusha	{"Luxury lodges","Private tour",Luxury}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.252
71e890c8-2e87-44b3-b5c3-d04b815d70d7	885fdd7f-43c3-43ae-a75d-d6801c5e3225	4-Day Tanzania Express Safari Medium	4-day-tanzania-express-safari-medium	4	3	1849	2126	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{Lodge,"Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.279
13435108-836b-427e-9e78-4f16ffe841b6	885fdd7f-43c3-43ae-a75d-d6801c5e3225	2-Day Safari to Tarangire and Ngorongoro	2-day-safari-to-tarangire-and-ngorongoro	2	1	903	1038	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{Lodge,"Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.318
f73d46c4-c167-4371-a318-468d9d8269fe	e7914577-a3ca-4752-a51d-02f2dbc05e68	9-Day Kenya & Tanzania Classic Safari	9-day-kenya-and-tanzania-classic-safari	9	8	4350	5003	MID_RANGE	PRIVATE	Kenya	Nairobi	Nairobi	{"Lodge & Tented Camp","Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.347
13fcbd1a-14e3-47df-9fce-f57f6ff2694f	e7914577-a3ca-4752-a51d-02f2dbc05e68	5-Day Rwanda Gorillas & Akagera	5-day-rwanda-gorillas-and-akagera	5	4	3980	4577	LUXURY	PRIVATE	Rwanda	Kigali	Kigali	{"Luxury lodge","Gorilla permit","Private tour"}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.376
99ad6b22-e9fe-4c72-b92b-84595de4f1b4	e7914577-a3ca-4752-a51d-02f2dbc05e68	6-Day Kruger & Sabi Sand Safari	6-day-kruger-and-sabi-sand-safari	6	5	2960	3404	MID_RANGE	PRIVATE	South Africa	Johannesburg	Johannesburg	{Lodge,"Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.405
bb38656c-40f7-4b5a-97bb-401927daa1ae	e7914577-a3ca-4752-a51d-02f2dbc05e68	10-Day Namibia Etosha & Sossusvlei Self-Drive	10-day-namibia-etosha-and-sossusvlei-self-drive	10	9	2150	2473	MID_RANGE	SELF_DRIVE	Namibia	Windhoek	Windhoek	{"4x4 rental",Lodges,Self-drive}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.435
ab7cc28c-4bf9-4c90-98fc-1cdfefebd560	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	8-Day Mid-Range Great Migration Safari (July–October)	8-day-mid-range-great-migration-safari	8	7	2859	3288	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"Lodge & Tented Camp","Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.059
4b10b727-136a-4942-a888-49513425164c	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	4-Day Fly-in Luxury Bwindi Gorilla Trekking Safari	4-day-fly-in-luxury-bwindi-gorilla-trekking-safari	4	3	2043	2349	LUXURY	FLY_IN	Uganda	Entebbe	Entebbe	{"Scheduled flights","Gorilla permit","Luxury lodge"}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.466
841fcbcf-bfaa-4930-91c6-7e9d17c7a56e	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	3-Day Midrange Wildlife Game Safari Murchison Falls NP	3-day-midrange-wildlife-game-safari-murchison-falls-np	3	2	960	1104	MID_RANGE	PRIVATE	Uganda	Kampala	Kampala	{Lodge,"Nile boat trip",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.493
b0018478-834e-4bf0-abf6-6d3b44b1acec	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	5-Day Mid-Range Chimpanzee & Gorilla Safari Uganda	5-day-mid-range-chimpanzee-and-gorilla-safari-uganda	5	4	2104	2420	MID_RANGE	PRIVATE	Uganda	Entebbe	Entebbe	{Lodge,"Gorilla permit",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.519
e1a7447c-1e60-49c4-b3dd-f5a33cf89f6a	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	6-Day Northern Tanzania Explorer	6-day-northern-tanzania-explorer	6	5	2680	3082	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"Lodge & Tented Camp","Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.543
ed84ea48-915b-4857-bef2-540b3d396616	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	3-Day Tarangire & Ngorongoro Escape	3-day-tarangire-and-ngorongoro-escape	3	2	1260	1449	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{Lodge,"Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.57
39596113-bf53-4c77-8d0b-affaabb30a9f	e425e04a-d831-4569-b0d2-c82e0a5291fd	7-Day Big Five Circuit	7-day-big-five-circuit	7	6	4210	4842	LUXURY	PRIVATE	Tanzania	Arusha	Arusha	{"Luxury tented camp","Private tour",Luxury}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.595
86b698b2-aa4a-409d-93c3-b2f32ef5932c	e425e04a-d831-4569-b0d2-c82e0a5291fd	4-Day Family Safari	4-day-family-safari	4	3	1760	2024	MID_RANGE	PRIVATE	Tanzania	Arusha	Arusha	{"Family rooms","Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.622
cebedd8f-a91a-44ca-82d7-a8c814290735	e425e04a-d831-4569-b0d2-c82e0a5291fd	5-Day Southern Tanzania Wilderness	5-day-southern-tanzania-wilderness	5	4	2380	2737	MID_RANGE	FLY_IN	Tanzania	Dar es Salaam	Dar es Salaam	{"Scheduled flights","Tented camp",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.649
a52e3b15-970d-440b-a449-16b38fbd1f74	e425e04a-d831-4569-b0d2-c82e0a5291fd	6-Day South Luangwa Walking Safari	6-day-south-luangwa-walking-safari	6	5	3420	3933	LUXURY	FLY_IN	Zambia	Mfuwe	Mfuwe	{"Bush camps","Walking safaris",Luxury}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.676
54a64fbb-a198-4a52-bb05-b4826eadb6d6	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	5-Day Hwange & Victoria Falls Safari	5-day-hwange-and-victoria-falls-safari	5	4	1980	2277	MID_RANGE	PRIVATE	Zimbabwe	Victoria Falls	Victoria Falls	{Lodge,"Private guide",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.701
e681fcb2-4cce-4a59-adf3-e5e111d573e6	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	7-Day Mana Pools & Chobe River Safari	7-day-mana-pools-and-chobe-river-safari	7	6	3650	4198	LUXURY	FLY_IN	Zimbabwe	Victoria Falls	Victoria Falls	{"Charter flights","Tented camp",Luxury}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.726
f47dd0f2-295e-44d0-ba8e-d9fc7b034eb5	d73ec798-0d36-4bcc-9773-bbae289fba53	4-Day Samburu & Lake Nakuru Safari	4-day-samburu-and-lake-nakuru-safari	4	3	980	1127	BUDGET	SHARED_GROUP	Kenya	Nairobi	Nairobi	{"Tented camp","Shared tour (max 8 people)",Budget}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.752
d7798d79-c50f-4d0b-a025-fe7ab9366703	d73ec798-0d36-4bcc-9773-bbae289fba53	6-Day Tsavo & Amboseli Budget Safari	6-day-kenya-tsavo-and-amboseli-budget-safari	6	5	1150	1323	BUDGET	SHARED_GROUP	Kenya	Mombasa	Mombasa	{"Camping & lodge","Shared tour",Budget}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.777
7df8b9f0-242a-4859-b009-340bf5453b80	e7914577-a3ca-4752-a51d-02f2dbc05e68	5-Day Hluhluwe & Phinda Zulu Safari	5-day-hluhluwe-and-phinda-zulu-safari	5	4	2290	2634	MID_RANGE	PRIVATE	South Africa	Durban	Durban	{Lodge,"Private tour",Mid-range}	{"International flights","Visa fees",Tips,"Travel insurance"}	t	2026-10-19 18:15:59.802
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, first_name, last_name, phone, country, role, email_verified, created_at, updated_at) FROM stdin;
7fa59162-6a08-407a-820d-f2253a96a853	admin@safariasili.com	$2b$10$jDlfiMvu2ms4QUNNH35EBuzVdN185g/7pFQl5pmNc9mO3tBzXSJDq	System	Admin	\N	Kenya	ADMIN	t	2026-09-26 17:07:27.657	2026-09-26 17:07:27.657
9d1483f8-235f-4742-b1bb-baaeff166dfc	info@kiliexpeditions.co.tz	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Amara	Mrema	+255 754 123 456	Tanzania	OPERATOR	t	2026-09-26 17:07:27.706	2026-09-26 17:07:27.706
830419b1-14d6-45c3-9bf9-d1f39c3e818f	safari@marawilderness.co.ke	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	David	Kimani	+254 722 987 654	Kenya	OPERATOR	t	2026-09-26 17:07:27.731	2026-09-26 17:07:27.731
398f99dc-4f97-4dcc-a55a-d732c325481f	traveler@gmail.com	$2b$10$2WpRp5GpKAZ1CQNumTzYK.cnO3xX4/9UA1HX.OnWdTQrfbFAfQo5W	Sarah	Jenkins	+44 7700 900077	United Kingdom	TRAVELER	t	2026-09-26 17:07:27.804	2026-09-26 17:07:27.804
7925a103-ae62-471d-b09b-ddc4a2dcc42f	test@example.com	guest_inquiry	Test	User	\N	\N	TRAVELER	f	2026-09-26 18:10:38.061	2026-09-26 18:10:38.061
3711fe75-62b2-43ba-82cf-79971ca2662b	agency_1791837249952@serengetieco.com	$2b$10$bqd4Aq9qyA14Dv8cxAp2Qechf3PjWym/qKWhphePl49XdRruL7jp6	Juma	Makena	+255 788 123 456	Tanzania	OPERATOR	t	2026-10-12 20:34:14.409	2026-10-12 20:34:14.409
c0f0f7fa-197b-432b-ab93-b8b96cb0b70d	traveler1_1791837249952@gmail.com	$2b$10$Z.BcA7/AlJn0TSLsJlkx3..wAvf.cUwD5FurNxZV8rbJR3/ZDZJAi	Alice	Smith	+1 555 019 2834	United States	TRAVELER	t	2026-10-12 20:34:14.837	2026-10-12 20:34:14.837
a2351356-9bdb-4985-b369-ce26f60239e6	traveler2_1791837249952@yahoo.com	$2b$10$.gCIG6NhI05QPdavkdZmD.44Mkd0ytLoC6eE9W7S4bb4svivhRIH6	Bob	Johnson	+44 20 7946 0958	United Kingdom	TRAVELER	t	2026-10-12 20:34:15.154	2026-10-12 20:34:15.154
11919b2d-abb9-4106-9f79-13dcb480440e	agency_1791837299424@serengetieco.com	$2b$10$qgjV4z0hIFyjC3n3HYBU6ugV3UxLP.cjkqgXnmRElsstSgYx5MMOC	Juma	Makena	+255 788 123 456	Tanzania	OPERATOR	t	2026-10-12 20:34:59.869	2026-10-12 20:34:59.869
46ca9148-ac17-46d4-99c0-59c7e2a66b48	traveler1_1791837299424@gmail.com	$2b$10$QzmzR.eRuSZvUnEVchc7n.EkifLCIK1futsOgpL16FkPoBGv.CJNe	Alice	Smith	+1 555 019 2834	United States	TRAVELER	t	2026-10-12 20:35:00.208	2026-10-12 20:35:00.208
8ed21cca-720b-4430-9e8b-88cf51433402	traveler2_1791837299424@yahoo.com	$2b$10$xFYal6GfRIK2xoF1tBecvOLOkbvHiT4C6pdgdjXH2Ls1XIX0q2c7O	Bob	Johnson	+44 20 7946 0958	United Kingdom	TRAVELER	t	2026-10-12 20:35:00.535	2026-10-12 20:35:00.535
d4323868-ca5d-4163-9856-e22045dde08c	hello@majesticwins.co.tz	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Baraka	Mollel	+255 765 410 221	Tanzania	OPERATOR	t	2026-10-19 18:15:58.861	2026-10-19 18:15:58.861
729f74ee-4cdc-4f60-806c-24c70d5c4be3	info@shadowsofafrica.com	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Pieter	Smit	+255 754 330 118	Tanzania	OPERATOR	t	2026-10-19 18:15:58.89	2026-10-19 18:15:58.89
6944323c-c7fc-4596-b7a2-161829f50256	trips@activentures.co.ug	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Moses	Okello	+256 772 508 911	Uganda	OPERATOR	t	2026-10-19 18:15:58.908	2026-10-19 18:15:58.908
079c1019-8c6f-4d2b-bc35-95c46884b4e0	book@joshdreamland.co.tz	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Joshua	Lyimo	+255 784 220 615	Tanzania	OPERATOR	t	2026-10-19 18:15:58.926	2026-10-19 18:15:58.926
00d46c0c-258f-4aa1-bd87-7984d76e0428	hello@serengetisunrise.com	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Neema	Kisanga	+255 689 401 772	Tanzania	OPERATOR	t	2026-10-19 18:15:58.944	2026-10-19 18:15:58.944
4ef63763-e5ca-4a4d-ba51-252d39592893	info@goserengeti.co.tz	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Elia	Massawe	+255 755 901 334	Tanzania	OPERATOR	t	2026-10-19 18:15:58.963	2026-10-19 18:15:58.963
7db4950e-301e-48c4-a275-56f398f34b92	karibu@shemejisafari.com	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Rehema	Shemeji	+255 713 650 902	Tanzania	OPERATOR	t	2026-10-19 18:15:58.981	2026-10-19 18:15:58.981
ea71fa3e-6e6f-4578-915a-16f80c9b091f	safaris@sunstripafrica.co.ke	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Wanjiru	Kamau	+254 721 448 309	Kenya	OPERATOR	t	2026-10-19 18:15:58.999	2026-10-19 18:15:58.999
f8b5d924-8892-467c-80a6-bba4ebe2c044	info@pulaadventures.co.bw	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Kagiso	Molefe	+267 71 554 210	Botswana	OPERATOR	t	2026-10-19 18:15:59.018	2026-10-19 18:15:59.018
02f98643-d032-4281-91d5-ede28ae07188	book@mubalasafaris.co.ug	$2b$10$sFnZvmWKZRanFSh4eLtjwukO50gCjvN867WT9uQdtLqIzV0d6kqfm	Grace	Nakato	+256 701 223 845	Uganda	OPERATOR	t	2026-10-19 18:15:59.036	2026-10-19 18:15:59.036
34251e48-a8bd-412b-acca-dcf737215b0c	emma.clark@example.com	$2b$10$2WpRp5GpKAZ1CQNumTzYK.cnO3xX4/9UA1HX.OnWdTQrfbFAfQo5W	Emma	Clark	\N	United Kingdom	TRAVELER	t	2026-10-19 18:20:34.277	2026-10-19 18:20:34.277
97ef72d9-e92b-4e4e-b51c-188eb29c4268	daniel.morgan@example.com	$2b$10$2WpRp5GpKAZ1CQNumTzYK.cnO3xX4/9UA1HX.OnWdTQrfbFAfQo5W	Daniel	Morgan	\N	United States	TRAVELER	t	2026-10-19 18:20:34.288	2026-10-19 18:20:34.288
9c6d8a8f-799d-4476-a6b3-939e7e3afb44	maya.tran@example.com	$2b$10$2WpRp5GpKAZ1CQNumTzYK.cnO3xX4/9UA1HX.OnWdTQrfbFAfQo5W	Maya	Tran	\N	Australia	TRAVELER	t	2026-10-19 18:20:34.297	2026-10-19 18:20:34.297
31dcbb8e-dc18-4491-b2a8-2c5fb3817c36	lukas.weber@example.com	$2b$10$2WpRp5GpKAZ1CQNumTzYK.cnO3xX4/9UA1HX.OnWdTQrfbFAfQo5W	Lukas	Weber	\N	Germany	TRAVELER	t	2026-10-19 18:20:34.308	2026-10-19 18:20:34.308
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, operator_id, name, vehicle_type, seats, plate_number, is_active, created_at) FROM stdin;
04863699-2977-44e6-bbd5-0b715946227c	42b041e2-036b-4aa0-bbff-422050609f5b	Land Cruiser KTE-1	4x4 Land Cruiser	7	T 412 DKL	t	2026-10-19 19:21:32.758
335d6fc0-74d5-4eec-b0f1-655ec2354c11	42b041e2-036b-4aa0-bbff-422050609f5b	Land Cruiser KTE-2	4x4 Land Cruiser	7	T 418 DKL	t	2026-10-19 19:21:32.775
cf715d2d-e162-475f-812a-c033865054c9	42b041e2-036b-4aa0-bbff-422050609f5b	Coaster Minibus	Toyota Coaster minibus	22	T 501 DLM	t	2026-10-19 19:21:32.782
add5b844-038b-4e82-9b89-61623e4e5ce5	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	Land Cruiser JD-1	4x4 Land Cruiser	7	T 220 DFG	t	2026-10-19 19:21:32.877
85948425-e4ea-45a5-99f6-5149c6b8bc82	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	Land Cruiser JD-2	4x4 Land Cruiser	6	T 221 DFG	t	2026-10-19 19:21:32.884
f8904604-365d-44f2-90ff-8c4d8de2fec0	d73ec798-0d36-4bcc-9773-bbae289fba53	Safari Van SS-1	Pop-up roof safari van	8	KDA 114X	t	2026-10-19 19:21:32.937
ca34108d-2a9b-43eb-9340-cf625362fdea	d73ec798-0d36-4bcc-9773-bbae289fba53	Safari Van SS-2	Pop-up roof safari van	8	KDA 115X	t	2026-10-19 19:21:32.943
4a2bc76d-c792-445f-801e-832f87339577	786e8685-6f8c-4c7a-9856-885e39a7f030	Luxury Cruiser MWS-1 (Nairobi)	4x4 Land Cruiser (luxury, 6 window seats)	6	KDB 951C	t	2026-10-19 19:40:40.28
184ef9c3-2a6a-477d-890f-2fe0a29f4835	786e8685-6f8c-4c7a-9856-885e39a7f030	Luxury Cruiser MWS-2 (Nairobi)	4x4 Land Cruiser (luxury, 6 window seats)	6	KDB 988C	t	2026-10-19 19:40:40.292
552a9f0f-e9c4-4951-8592-3290772f64e4	42b041e2-036b-4aa0-bbff-422050609f5b	Land Cruiser KTE-4 (Arusha)	4x4 Land Cruiser	7	T 1173 DRS	t	2026-10-19 19:40:40.483
2207b4ac-ab44-4247-8ceb-d2851bbb90d8	2c2cd580-7109-4a21-ad9e-da9bde7941b5	Land Cruiser SES-1 (Arusha)	4x4 Land Cruiser	7	T 1580 DRS	t	2026-10-19 19:40:40.871
b4b5955b-76eb-4b41-afed-0801296eb95a	2c2cd580-7109-4a21-ad9e-da9bde7941b5	Land Cruiser SES-2 (Arusha)	4x4 Land Cruiser	7	T 1617 DRS	t	2026-10-19 19:40:40.874
73dfbfd2-7f2e-47b3-810f-70e2541f6a68	761c2fbc-af79-47f1-9390-5aeb60179942	Land Cruiser SES-1 (Arusha)	4x4 Land Cruiser	7	T 1580 DRS	t	2026-10-19 19:40:41.06
094ccfec-4931-4d6f-ba2b-8e40094638d2	761c2fbc-af79-47f1-9390-5aeb60179942	Land Cruiser SES-2 (Arusha)	4x4 Land Cruiser	7	T 1617 DRS	t	2026-10-19 19:40:41.065
2c4dd3ba-17c0-4577-ba6c-eda2a3d74fbb	885fdd7f-43c3-43ae-a75d-d6801c5e3225	Land Cruiser MWA-1 (Arusha)	4x4 Land Cruiser	7	T 988 DRS	t	2026-10-19 19:40:41.247
51edeeb6-c87e-4494-a918-db7d1b96dff2	885fdd7f-43c3-43ae-a75d-d6801c5e3225	Land Cruiser MWA-2 (Arusha)	4x4 Land Cruiser	7	T 1025 DRS	t	2026-10-19 19:40:41.252
72df6463-5711-4476-9c11-312d1ee6f431	885fdd7f-43c3-43ae-a75d-d6801c5e3225	Land Cruiser MWA-3 (Arusha)	4x4 Land Cruiser	7	T 1062 DRS	t	2026-10-19 19:40:41.257
d32db75f-e850-4bd6-9765-819eadda5368	885fdd7f-43c3-43ae-a75d-d6801c5e3225	Land Cruiser MWA-4 (Arusha)	4x4 Land Cruiser	7	T 1099 DRS	t	2026-10-19 19:40:41.26
648405f7-ac3d-4440-8392-40209d91223d	885fdd7f-43c3-43ae-a75d-d6801c5e3225	Land Cruiser MWA-5 (Arusha)	4x4 Land Cruiser	7	T 1136 DRS	t	2026-10-19 19:40:41.265
1b16fc8b-4742-4c79-a616-a20de28fd0d0	885fdd7f-43c3-43ae-a75d-d6801c5e3225	Land Cruiser MWA-6 (Arusha)	4x4 Land Cruiser	7	T 1173 DRS	t	2026-10-19 19:40:41.269
d97a56fc-d3db-436b-b01a-09cdefe71b48	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-1 (Nairobi)	4x4 Land Cruiser	7	KDB 729C	t	2026-10-19 19:40:41.707
7dbbc1cb-911e-4c4d-a10e-76c14ae813a5	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-2 (Nairobi)	4x4 Land Cruiser	7	KDB 766C	t	2026-10-19 19:40:41.711
431d3913-3501-4e77-92d0-262525f78eda	e7914577-a3ca-4752-a51d-02f2dbc05e68	Luxury Cruiser SA-1 (Kigali)	4x4 Land Cruiser (luxury, 6 window seats)	6	RAD 729 C	t	2026-10-19 19:40:41.889
d03b793b-4663-4f64-a5ca-521b2bae410c	e7914577-a3ca-4752-a51d-02f2dbc05e68	Luxury Cruiser SA-2 (Kigali)	4x4 Land Cruiser (luxury, 6 window seats)	6	RAD 766 C	t	2026-10-19 19:40:41.894
021bc577-3248-4b0f-bc3f-25b9edd64c07	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-1 (Johannesburg)	4x4 Land Cruiser	7	CA 729-940	t	2026-10-19 19:40:42.055
051eac1f-92dc-4ee5-8689-989c8fa2d24b	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-2 (Johannesburg)	4x4 Land Cruiser	7	CA 766-977	t	2026-10-19 19:40:42.059
f2d01660-3de9-41d6-9945-b887d19ad2fc	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-3 (Johannesburg)	4x4 Land Cruiser	7	CA 803-1014	t	2026-10-19 19:40:42.063
351ee76f-edb2-49ed-a009-e64c9fb6898d	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-4 (Johannesburg)	4x4 Land Cruiser	7	CA 840-1051	t	2026-10-19 19:40:42.067
d84b2443-e8d3-479a-b30d-28024955cfdc	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-1 (Windhoek)	4x4 Land Cruiser	7	N 1729 W	t	2026-10-19 19:40:42.456
b6cc091b-22f8-479a-969c-87fd4f236905	e7914577-a3ca-4752-a51d-02f2dbc05e68	Land Cruiser SA-2 (Windhoek)	4x4 Land Cruiser	7	N 1766 W	t	2026-10-19 19:40:42.462
37ab6396-d77e-423c-8df8-2c8c1b9b5bb6	e7914577-a3ca-4752-a51d-02f2dbc05e68	Self-drive 4x4 SA-1 (Windhoek)	4x4 self-drive with rooftop tent	4	N 2950 W	t	2026-10-19 19:40:42.468
0f56172c-929f-4b60-b573-36bbcae6638d	e7914577-a3ca-4752-a51d-02f2dbc05e68	Self-drive 4x4 SA-2 (Windhoek)	4x4 self-drive with rooftop tent	4	N 2987 W	t	2026-10-19 19:40:42.474
c5bc4aca-94bb-43bd-acd0-5a4a0399a75b	e7914577-a3ca-4752-a51d-02f2dbc05e68	Self-drive 4x4 SA-3 (Windhoek)	4x4 self-drive with rooftop tent	4	N 3024 W	t	2026-10-19 19:40:42.478
074a51ed-e58a-45ec-9e84-9a041170a5ae	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	Land Cruiser AAS-1 (Entebbe)	4x4 Land Cruiser	7	UBF 1099K	t	2026-10-19 19:40:42.646
a2f9d3f5-2beb-4cba-b1c2-b8e2d0a6dd61	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	Land Cruiser AAS-2 (Entebbe)	4x4 Land Cruiser	7	UBF 1136K	t	2026-10-19 19:40:42.65
f48e2e1c-eac9-4869-8ac3-57356733a30f	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	Land Cruiser AAS-3 (Entebbe)	4x4 Land Cruiser	7	UBF 1173K	t	2026-10-19 19:40:42.654
90cf511b-1741-40f2-a55f-ae7b40667b57	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	Land Cruiser AAS-4 (Entebbe)	4x4 Land Cruiser	7	UBF 1210K	t	2026-10-19 19:40:42.658
8a47042a-425a-4d7d-ac3d-221c1789cc5d	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	Land Cruiser AAS-5 (Entebbe)	4x4 Land Cruiser	7	UBF 1247K	t	2026-10-19 19:40:42.662
cb7df771-66f4-4712-a16c-0da4cf6128c3	6a5bcf45-8ddf-4f18-b58a-272fd4dd34ba	Land Cruiser AAS-6 (Entebbe)	4x4 Land Cruiser	7	UBF 1284K	t	2026-10-19 19:40:42.666
7caf2d05-d154-4cc8-bb10-97d0f77da61e	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	Land Cruiser JDS-3 (Arusha)	4x4 Land Cruiser	7	T 951 DRS	t	2026-10-19 19:40:43.144
87a2e2fb-e63d-4592-a1f4-a00dde9d4d24	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	Land Cruiser JDS-4 (Arusha)	4x4 Land Cruiser	7	T 988 DRS	t	2026-10-19 19:40:43.148
802c28e0-8be9-4fa6-93cb-30d91565cf00	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	Land Cruiser JDS-5 (Arusha)	4x4 Land Cruiser	7	T 1025 DRS	t	2026-10-19 19:40:43.152
227be35d-834f-420c-845c-eda4ad4c43fa	c6d6c9c6-5f78-4ef0-917f-e988caff2d8e	Land Cruiser JDS-6 (Arusha)	4x4 Land Cruiser	7	T 1062 DRS	t	2026-10-19 19:40:43.156
8789d8ef-99c2-4b9c-a968-8eade6eb3642	e425e04a-d831-4569-b0d2-c82e0a5291fd	Land Cruiser SSS-1 (Arusha)	4x4 Land Cruiser	7	T 1025 DRS	t	2026-10-19 19:40:43.613
d106f009-8a6e-4f63-918c-841635b5685d	e425e04a-d831-4569-b0d2-c82e0a5291fd	Land Cruiser SSS-2 (Arusha)	4x4 Land Cruiser	7	T 1062 DRS	t	2026-10-19 19:40:43.617
69a8931f-1434-46e9-9a92-b6d01acd0c11	e425e04a-d831-4569-b0d2-c82e0a5291fd	Land Cruiser SSS-3 (Arusha)	4x4 Land Cruiser	7	T 1099 DRS	t	2026-10-19 19:40:43.621
967d330b-7c12-4b57-a74e-51d89c8eb4ff	e425e04a-d831-4569-b0d2-c82e0a5291fd	Land Cruiser SSS-4 (Arusha)	4x4 Land Cruiser	7	T 1136 DRS	t	2026-10-19 19:40:43.625
dfacd4e0-cbf5-42f1-8d2e-4b458bfd2616	e425e04a-d831-4569-b0d2-c82e0a5291fd	Land Cruiser SSS-5 (Arusha)	4x4 Land Cruiser	7	T 1173 DRS	t	2026-10-19 19:40:43.629
e2afdd9f-3773-4a42-8a05-20c68760d26c	e425e04a-d831-4569-b0d2-c82e0a5291fd	Land Cruiser SSS-6 (Arusha)	4x4 Land Cruiser	7	T 1210 DRS	t	2026-10-19 19:40:43.633
cc56d79e-f474-48a8-8d04-5d673d9f5144	e425e04a-d831-4569-b0d2-c82e0a5291fd	Luxury Cruiser SSS-1 (Mfuwe)	4x4 Land Cruiser (luxury, 6 window seats)	6	BAH 2025	t	2026-10-19 19:40:44.097
cc1e5b08-a437-4504-9cfe-7a5669a382c0	e425e04a-d831-4569-b0d2-c82e0a5291fd	Luxury Cruiser SSS-2 (Mfuwe)	4x4 Land Cruiser (luxury, 6 window seats)	6	BAH 2062	t	2026-10-19 19:40:44.102
c531f764-9f0b-4b80-a504-0fc642e1aba4	1df9f16f-f050-442b-9759-73d8fdd573a6	Group Cruiser GSA-1 (Arusha)	Pop-up roof Land Cruiser	7	T 1062 DRS	t	2026-10-19 19:40:44.261
83f2d0a0-6a1e-458b-85eb-bb183f502109	1df9f16f-f050-442b-9759-73d8fdd573a6	Group Cruiser GSA-2 (Arusha)	Pop-up roof Land Cruiser	7	T 1099 DRS	t	2026-10-19 19:40:44.265
a59cb8cc-fc03-4840-ad10-2241ddb18851	c08876d2-7864-432b-a440-5c4c1fc5af5d	Land Cruiser SS-1 (Arusha)	4x4 Land Cruiser	7	T 618 DRS	t	2026-10-19 19:40:44.447
e4828827-4fcb-4d8a-9136-669454391924	c08876d2-7864-432b-a440-5c4c1fc5af5d	Land Cruiser SS-2 (Arusha)	4x4 Land Cruiser	7	T 655 DRS	t	2026-10-19 19:40:44.452
13bd55a7-0a8d-45db-aed7-f9c031f25e6d	d73ec798-0d36-4bcc-9773-bbae289fba53	Safari Van SAS-3 (Nairobi)	Pop-up roof safari van	8	KDB 1025C	t	2026-10-19 19:40:44.688
6e5d41ab-ca1e-47a5-862e-bc296aa09228	d73ec798-0d36-4bcc-9773-bbae289fba53	Safari Van SAS-4 (Nairobi)	Pop-up roof safari van	8	KDB 1062C	t	2026-10-19 19:40:44.692
74f40025-0078-4e42-b632-87017f3e21b6	d73ec798-0d36-4bcc-9773-bbae289fba53	Safari Van SAS-5 (Nairobi)	Pop-up roof safari van	8	KDB 1099C	t	2026-10-19 19:40:44.696
d045fd98-2c9a-4482-a8e9-fb9f50b347e8	d73ec798-0d36-4bcc-9773-bbae289fba53	Safari Van SAS-6 (Nairobi)	Pop-up roof safari van	8	KDB 1136C	t	2026-10-19 19:40:44.701
3837200d-f941-46ee-a1ac-f998b13b2aa4	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	Land Cruiser PA-1 (Maun)	4x4 Land Cruiser	7	B 655 BWA	t	2026-10-19 19:40:45.244
3f95fe85-4efa-4ca9-addf-6c368bb6fc2e	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	Land Cruiser PA-2 (Maun)	4x4 Land Cruiser	7	B 692 BWA	t	2026-10-19 19:40:45.248
4ab63669-6730-4768-a263-fc02b9090856	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	Land Cruiser PA-1 (Victoria Falls)	4x4 Land Cruiser	7	AEZ 1655	t	2026-10-19 19:40:45.436
1e354e3f-4099-4334-a614-3c5941f6b2cc	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	Land Cruiser PA-2 (Victoria Falls)	4x4 Land Cruiser	7	AEZ 1692	t	2026-10-19 19:40:45.442
ac3b4c31-0b82-45e2-ab46-881a593311ab	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	Land Cruiser PA-3 (Victoria Falls)	4x4 Land Cruiser	7	AEZ 1729	t	2026-10-19 19:40:45.448
541f9774-9b10-4180-96e9-ea9ca25665a1	9422b5d1-d807-48ce-ba6f-b674d3cb26ff	Land Cruiser PA-4 (Victoria Falls)	4x4 Land Cruiser	7	AEZ 1766	t	2026-10-19 19:40:45.453
cf08dee5-3447-49fb-8dbb-4f90e8f9b178	aad63409-b4e3-449b-ae96-72ddaec3ac94	Land Cruiser MWS-1 (Entebbe)	4x4 Land Cruiser	7	UBF 951K	t	2026-10-19 19:40:45.805
32fc9f47-66d4-43b3-8c36-c2c75f3f16ac	aad63409-b4e3-449b-ae96-72ddaec3ac94	Land Cruiser MWS-2 (Entebbe)	4x4 Land Cruiser	7	UBF 988K	t	2026-10-19 19:40:45.809
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: destination_sections destination_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_sections
    ADD CONSTRAINT destination_sections_pkey PRIMARY KEY (id);


--
-- Name: destinations destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destinations
    ADD CONSTRAINT destinations_pkey PRIMARY KEY (id);


--
-- Name: experts experts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experts
    ADD CONSTRAINT experts_pkey PRIMARY KEY (id);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: inquiry_leads inquiry_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_leads
    ADD CONSTRAINT inquiry_leads_pkey PRIMARY KEY (id);


--
-- Name: media_assets media_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: operators operators_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_pkey PRIMARY KEY (id);


--
-- Name: reservation_messages reservation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_messages
    ADD CONSTRAINT reservation_messages_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: slot_vehicles slot_vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_vehicles
    ADD CONSTRAINT slot_vehicles_pkey PRIMARY KEY (slot_id, vehicle_id);


--
-- Name: tour_availability tour_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_availability
    ADD CONSTRAINT tour_availability_pkey PRIMARY KEY (tour_id);


--
-- Name: tour_destinations tour_destinations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_destinations
    ADD CONSTRAINT tour_destinations_pkey PRIMARY KEY (tour_id, destination_id);


--
-- Name: tour_itineraries tour_itineraries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_itineraries
    ADD CONSTRAINT tour_itineraries_pkey PRIMARY KEY (id);


--
-- Name: tour_slots tour_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_slots
    ADD CONSTRAINT tour_slots_pkey PRIMARY KEY (id);


--
-- Name: tours tours_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: blog_posts_operator_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX blog_posts_operator_id_idx ON public.blog_posts USING btree (operator_id);


--
-- Name: blog_posts_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX blog_posts_slug_key ON public.blog_posts USING btree (slug);


--
-- Name: destination_sections_destination_id_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX destination_sections_destination_id_key_key ON public.destination_sections USING btree (destination_id, key);


--
-- Name: destinations_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX destinations_slug_key ON public.destinations USING btree (slug);


--
-- Name: experts_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX experts_slug_key ON public.experts USING btree (slug);


--
-- Name: media_assets_tour_id_sort_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX media_assets_tour_id_sort_order_idx ON public.media_assets USING btree (tour_id, sort_order);


--
-- Name: notifications_user_id_is_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_is_read_idx ON public.notifications USING btree (user_id, is_read);


--
-- Name: operators_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX operators_slug_key ON public.operators USING btree (slug);


--
-- Name: operators_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX operators_user_id_key ON public.operators USING btree (user_id);


--
-- Name: reservation_messages_reservation_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX reservation_messages_reservation_id_idx ON public.reservation_messages USING btree (reservation_id);


--
-- Name: reservations_reference_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX reservations_reference_key ON public.reservations USING btree (reference);


--
-- Name: tour_slots_tour_id_start_date_departure_time_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tour_slots_tour_id_start_date_departure_time_key ON public.tour_slots USING btree (tour_id, start_date, departure_time);


--
-- Name: tours_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX tours_slug_key ON public.tours USING btree (slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: vehicles_operator_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vehicles_operator_id_idx ON public.vehicles USING btree (operator_id);


--
-- Name: reservations reservations_require_departure; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER reservations_require_departure BEFORE INSERT ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.reservation_requires_departure();


--
-- Name: reservations reservations_seats_sync; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER reservations_seats_sync AFTER INSERT OR DELETE OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.reservation_seats_sync();


--
-- Name: slot_vehicles slot_vehicles_no_overlap; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER slot_vehicles_no_overlap BEFORE INSERT OR UPDATE OF vehicle_id, slot_id ON public.slot_vehicles FOR EACH ROW EXECUTE FUNCTION public.slot_vehicle_no_overlap();


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: destination_sections destination_sections_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.destination_sections
    ADD CONSTRAINT destination_sections_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inquiries inquiries_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.tour_slots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inquiries inquiries_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: inquiries inquiries_traveler_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_traveler_id_fkey FOREIGN KEY (traveler_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inquiry_leads inquiry_leads_inquiry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_leads
    ADD CONSTRAINT inquiry_leads_inquiry_id_fkey FOREIGN KEY (inquiry_id) REFERENCES public.inquiries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inquiry_leads inquiry_leads_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiry_leads
    ADD CONSTRAINT inquiry_leads_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: media_assets media_assets_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_assets
    ADD CONSTRAINT media_assets_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_inquiry_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_inquiry_lead_id_fkey FOREIGN KEY (inquiry_lead_id) REFERENCES public.inquiry_leads(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: operators operators_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.operators
    ADD CONSTRAINT operators_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservation_messages reservation_messages_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_messages
    ADD CONSTRAINT reservation_messages_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservation_messages reservation_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservation_messages
    ADD CONSTRAINT reservation_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.tour_slots(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reservations reservations_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_traveler_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_traveler_id_fkey FOREIGN KEY (traveler_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reservations reservations_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reviews reviews_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reviews reviews_traveler_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_traveler_id_fkey FOREIGN KEY (traveler_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: slot_vehicles slot_vehicles_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_vehicles
    ADD CONSTRAINT slot_vehicles_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.tour_slots(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: slot_vehicles slot_vehicles_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.slot_vehicles
    ADD CONSTRAINT slot_vehicles_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tour_availability tour_availability_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_availability
    ADD CONSTRAINT tour_availability_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_destinations tour_destinations_destination_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_destinations
    ADD CONSTRAINT tour_destinations_destination_id_fkey FOREIGN KEY (destination_id) REFERENCES public.destinations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_destinations tour_destinations_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_destinations
    ADD CONSTRAINT tour_destinations_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_itineraries tour_itineraries_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_itineraries
    ADD CONSTRAINT tour_itineraries_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tour_slots tour_slots_tour_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tour_slots
    ADD CONSTRAINT tour_slots_tour_id_fkey FOREIGN KEY (tour_id) REFERENCES public.tours(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tours tours_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tours
    ADD CONSTRAINT tours_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vehicles vehicles_operator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_operator_id_fkey FOREIGN KEY (operator_id) REFERENCES public.operators(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict WzYNQFbB1S5bIdQpGvD7P8jJe0wVVfYR0I35cqSyegheuK0nnymTBNTi8ikvB3m

