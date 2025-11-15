--
-- PostgreSQL database dump
--

\restrict EbVnZTUDcBF0vLykWV5StQWiY7VybJugeYZFmNpsiNmaBvqmTb9KYdIyVjDdpzZ

-- Dumped from database version 15.14
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-14 10:57:14

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
-- TOC entry 2 (class 3079 OID 16385)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 928 (class 1247 OID 16484)
-- Name: automation_trigger_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.automation_trigger_enum AS ENUM (
    'rule',
    'admin'
);


ALTER TYPE public.automation_trigger_enum OWNER TO swspace_user;

--
-- TOC entry 898 (class 1247 OID 16397)
-- Name: booking_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.booking_status_enum AS ENUM (
    'pending',
    'awaiting_payment',
    'paid',
    'failed',
    'canceled',
    'refunded',
    'checked_in',
    'checked_out'
);


ALTER TYPE public.booking_status_enum OWNER TO swspace_user;

--
-- TOC entry 919 (class 1247 OID 16462)
-- Name: checkin_direction_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.checkin_direction_enum AS ENUM (
    'in',
    'out'
);


ALTER TYPE public.checkin_direction_enum OWNER TO swspace_user;

--
-- TOC entry 916 (class 1247 OID 16456)
-- Name: checkin_method_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.checkin_method_enum AS ENUM (
    'qr',
    'face'
);


ALTER TYPE public.checkin_method_enum OWNER TO swspace_user;

--
-- TOC entry 1006 (class 1247 OID 33340)
-- Name: checkin_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.checkin_status_enum AS ENUM (
    'checked-in',
    'checked-out'
);


ALTER TYPE public.checkin_status_enum OWNER TO swspace_user;

--
-- TOC entry 922 (class 1247 OID 16468)
-- Name: notification_channel_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.notification_channel_enum AS ENUM (
    'email',
    'in_app'
);


ALTER TYPE public.notification_channel_enum OWNER TO swspace_user;

--
-- TOC entry 925 (class 1247 OID 16474)
-- Name: notification_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.notification_status_enum AS ENUM (
    'created',
    'sent',
    'delivered',
    'read'
);


ALTER TYPE public.notification_status_enum OWNER TO swspace_user;

--
-- TOC entry 910 (class 1247 OID 16436)
-- Name: payment_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.payment_status_enum AS ENUM (
    'created',
    'processing',
    'success',
    'failed',
    'expired'
);


ALTER TYPE public.payment_status_enum OWNER TO swspace_user;

--
-- TOC entry 913 (class 1247 OID 16448)
-- Name: refund_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.refund_status_enum AS ENUM (
    'requested',
    'success',
    'failed'
);


ALTER TYPE public.refund_status_enum OWNER TO swspace_user;

--
-- TOC entry 901 (class 1247 OID 16414)
-- Name: seat_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.seat_status_enum AS ENUM (
    'available',
    'occupied',
    'reserved',
    'disabled'
);


ALTER TYPE public.seat_status_enum OWNER TO swspace_user;

--
-- TOC entry 931 (class 1247 OID 16490)
-- Name: service_package_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.service_package_status_enum AS ENUM (
    'active',
    'paused',
    'inactive'
);


ALTER TYPE public.service_package_status_enum OWNER TO swspace_user;

--
-- TOC entry 904 (class 1247 OID 16424)
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.user_role_enum AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.user_role_enum OWNER TO swspace_user;

--
-- TOC entry 907 (class 1247 OID 16430)
-- Name: user_status_enum; Type: TYPE; Schema: public; Owner: swspace_user
--

CREATE TYPE public.user_status_enum AS ENUM (
    'active',
    'inactive'
);


ALTER TYPE public.user_status_enum OWNER TO swspace_user;

--
-- TOC entry 275 (class 1255 OID 33418)
-- Name: touch_updated_at(); Type: FUNCTION; Schema: public; Owner: swspace_user
--

CREATE FUNCTION public.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;$$;


ALTER FUNCTION public.touch_updated_at() OWNER TO swspace_user;

--
-- TOC entry 274 (class 1255 OID 16850)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: swspace_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO swspace_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 255 (class 1259 OID 16836)
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.auth_sessions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    refresh_token_hash text NOT NULL,
    user_agent text,
    ip character varying(64),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at timestamp without time zone NOT NULL
);


ALTER TABLE public.auth_sessions OWNER TO swspace_user;

--
-- TOC entry 254 (class 1259 OID 16835)
-- Name: auth_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.auth_sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_sessions_id_seq OWNER TO swspace_user;

--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 254
-- Name: auth_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.auth_sessions_id_seq OWNED BY public.auth_sessions.id;


--
-- TOC entry 253 (class 1259 OID 16826)
-- Name: automation_actions; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.automation_actions (
    id bigint NOT NULL,
    floor_id smallint,
    zone_id bigint,
    action character varying(40) NOT NULL,
    reason text,
    triggered_by public.automation_trigger_enum NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    extra jsonb
);


ALTER TABLE public.automation_actions OWNER TO swspace_user;

--
-- TOC entry 252 (class 1259 OID 16825)
-- Name: automation_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.automation_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.automation_actions_id_seq OWNER TO swspace_user;

--
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 252
-- Name: automation_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.automation_actions_id_seq OWNED BY public.automation_actions.id;


--
-- TOC entry 234 (class 1259 OID 16634)
-- Name: bookings; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.bookings (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    category_id smallint NOT NULL,
    service_id smallint NOT NULL,
    package_id bigint,
    zone_id bigint,
    seat_id bigint,
    room_id bigint,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price_total numeric(14,0) NOT NULL,
    status public.booking_status_enum DEFAULT 'pending'::public.booking_status_enum NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    service_type character varying(40),
    package_duration character varying(20),
    seat_code character varying(30),
    seat_name character varying(60),
    floor_no smallint,
    base_price numeric(14,0),
    discount_pct numeric(5,2) DEFAULT 0,
    final_price numeric(14,0),
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    payment_method character varying(30),
    transaction_id character varying(100),
    booking_reference character varying(60),
    cancelled_at timestamp without time zone,
    cancellation_reason character varying(200),
    CONSTRAINT chk_seat_or_room CHECK ((((seat_id IS NOT NULL) AND (room_id IS NULL)) OR ((seat_id IS NULL) AND (room_id IS NOT NULL)) OR ((seat_id IS NULL) AND (room_id IS NULL))))
);


ALTER TABLE public.bookings OWNER TO swspace_user;

--
-- TOC entry 233 (class 1259 OID 16633)
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO swspace_user;

--
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 233
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- TOC entry 245 (class 1259 OID 16759)
-- Name: cameras; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.cameras (
    id character varying(50) NOT NULL,
    floor_id smallint,
    zone_id bigint,
    name character varying(80)
);


ALTER TABLE public.cameras OWNER TO swspace_user;

--
-- TOC entry 242 (class 1259 OID 16732)
-- Name: cancellation_policies; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.cancellation_policies (
    id smallint NOT NULL,
    name character varying(60) DEFAULT 'default_24h'::character varying NOT NULL,
    full_refund_before_hours integer DEFAULT 24 NOT NULL
);


ALTER TABLE public.cancellation_policies OWNER TO swspace_user;

--
-- TOC entry 241 (class 1259 OID 16731)
-- Name: cancellation_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.cancellation_policies_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cancellation_policies_id_seq OWNER TO swspace_user;

--
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 241
-- Name: cancellation_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.cancellation_policies_id_seq OWNED BY public.cancellation_policies.id;


--
-- TOC entry 247 (class 1259 OID 16775)
-- Name: checkins; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.checkins (
    id bigint NOT NULL,
    booking_id bigint,
    user_id bigint NOT NULL,
    method public.checkin_method_enum NOT NULL,
    direction public.checkin_direction_enum NOT NULL,
    detected_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    camera_id character varying(50),
    extra jsonb
);


ALTER TABLE public.checkins OWNER TO swspace_user;

--
-- TOC entry 246 (class 1259 OID 16774)
-- Name: checkins_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.checkins_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkins_id_seq OWNER TO swspace_user;

--
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 246
-- Name: checkins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.checkins_id_seq OWNED BY public.checkins.id;


--
-- TOC entry 222 (class 1259 OID 16532)
-- Name: floors; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.floors (
    id smallint NOT NULL,
    code character varying(20) NOT NULL,
    name character varying(80) NOT NULL
);


ALTER TABLE public.floors OWNER TO swspace_user;

--
-- TOC entry 221 (class 1259 OID 16531)
-- Name: floors_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.floors_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.floors_id_seq OWNER TO swspace_user;

--
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 221
-- Name: floors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.floors_id_seq OWNED BY public.floors.id;


--
-- TOC entry 249 (class 1259 OID 16795)
-- Name: notifications; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint,
    booking_id bigint,
    type character varying(40) NOT NULL,
    title character varying(140),
    content text NOT NULL,
    channel public.notification_channel_enum NOT NULL,
    status public.notification_status_enum DEFAULT 'created'::public.notification_status_enum NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO swspace_user;

--
-- TOC entry 248 (class 1259 OID 16794)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO swspace_user;

--
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 248
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 251 (class 1259 OID 16816)
-- Name: occupancy_events; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.occupancy_events (
    id bigint NOT NULL,
    camera_id character varying(50),
    floor_id smallint,
    zone_id bigint,
    people_count integer NOT NULL,
    detected_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    model_version character varying(40),
    extra jsonb
);


ALTER TABLE public.occupancy_events OWNER TO swspace_user;

--
-- TOC entry 250 (class 1259 OID 16815)
-- Name: occupancy_events_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.occupancy_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.occupancy_events_id_seq OWNER TO swspace_user;

--
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 250
-- Name: occupancy_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.occupancy_events_id_seq OWNED BY public.occupancy_events.id;


--
-- TOC entry 236 (class 1259 OID 16683)
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.payment_methods (
    id smallint NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(60) NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO swspace_user;

--
-- TOC entry 235 (class 1259 OID 16682)
-- Name: payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.payment_methods_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_methods_id_seq OWNER TO swspace_user;

--
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 235
-- Name: payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.payment_methods_id_seq OWNED BY public.payment_methods.id;


--
-- TOC entry 238 (class 1259 OID 16692)
-- Name: payments; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    booking_id bigint NOT NULL,
    method_id smallint NOT NULL,
    amount numeric(14,0) NOT NULL,
    currency character(3) DEFAULT 'VND'::bpchar NOT NULL,
    provider_txn_id character varying(100),
    status public.payment_status_enum DEFAULT 'created'::public.payment_status_enum NOT NULL,
    qr_url text,
    qr_payload text,
    provider_meta jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.payments OWNER TO swspace_user;

--
-- TOC entry 237 (class 1259 OID 16691)
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO swspace_user;

--
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 237
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- TOC entry 262 (class 1259 OID 33387)
-- Name: qr_checkins; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.qr_checkins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id bigint NOT NULL,
    user_id bigint NOT NULL,
    qr_code_id uuid,
    status public.checkin_status_enum DEFAULT 'checked-in'::public.checkin_status_enum NOT NULL,
    check_in_at timestamp with time zone DEFAULT now(),
    check_out_at timestamp with time zone,
    notes text,
    rating integer,
    device_info jsonb DEFAULT '{}'::jsonb,
    location jsonb DEFAULT '{}'::jsonb,
    actual_seat text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.qr_checkins OWNER TO swspace_user;

--
-- TOC entry 261 (class 1259 OID 33366)
-- Name: qrcodes; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.qrcodes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    booking_id bigint NOT NULL,
    qr_string text NOT NULL,
    secret_key text NOT NULL,
    qr_data jsonb NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    usage_count integer DEFAULT 0,
    max_usage integer DEFAULT 20,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.qrcodes OWNER TO swspace_user;

--
-- TOC entry 240 (class 1259 OID 16717)
-- Name: refunds; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.refunds (
    id bigint NOT NULL,
    payment_id bigint NOT NULL,
    amount numeric(14,0) NOT NULL,
    reason text,
    status public.refund_status_enum NOT NULL,
    provider_refund_id character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refunds OWNER TO swspace_user;

--
-- TOC entry 239 (class 1259 OID 16716)
-- Name: refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.refunds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refunds_id_seq OWNER TO swspace_user;

--
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 239
-- Name: refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.refunds_id_seq OWNED BY public.refunds.id;


--
-- TOC entry 232 (class 1259 OID 16619)
-- Name: rooms; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.rooms (
    id bigint NOT NULL,
    zone_id bigint NOT NULL,
    room_code character varying(20) NOT NULL,
    capacity integer NOT NULL,
    status public.seat_status_enum DEFAULT 'available'::public.seat_status_enum NOT NULL,
    pos_x numeric(5,2),
    pos_y numeric(5,2),
    display_name text,
    attributes jsonb
);


ALTER TABLE public.rooms OWNER TO swspace_user;

--
-- TOC entry 231 (class 1259 OID 16618)
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rooms_id_seq OWNER TO swspace_user;

--
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 231
-- Name: rooms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.rooms_id_seq OWNED BY public.rooms.id;


--
-- TOC entry 230 (class 1259 OID 16604)
-- Name: seats; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.seats (
    id bigint NOT NULL,
    zone_id bigint NOT NULL,
    seat_code character varying(20) NOT NULL,
    status public.seat_status_enum DEFAULT 'available'::public.seat_status_enum NOT NULL,
    pos_x numeric(5,2),
    pos_y numeric(5,2)
);


ALTER TABLE public.seats OWNER TO swspace_user;

--
-- TOC entry 229 (class 1259 OID 16603)
-- Name: seats_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.seats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.seats_id_seq OWNER TO swspace_user;

--
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 229
-- Name: seats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.seats_id_seq OWNED BY public.seats.id;


--
-- TOC entry 218 (class 1259 OID 16507)
-- Name: service_categories; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.service_categories (
    id smallint NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(60) NOT NULL
);


ALTER TABLE public.service_categories OWNER TO swspace_user;

--
-- TOC entry 217 (class 1259 OID 16506)
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.service_categories_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_categories_id_seq OWNER TO swspace_user;

--
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 217
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- TOC entry 244 (class 1259 OID 16741)
-- Name: service_floor_rules; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.service_floor_rules (
    id smallint NOT NULL,
    service_id smallint NOT NULL,
    floor_id smallint NOT NULL
);


ALTER TABLE public.service_floor_rules OWNER TO swspace_user;

--
-- TOC entry 243 (class 1259 OID 16740)
-- Name: service_floor_rules_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.service_floor_rules_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_floor_rules_id_seq OWNER TO swspace_user;

--
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 243
-- Name: service_floor_rules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.service_floor_rules_id_seq OWNED BY public.service_floor_rules.id;


--
-- TOC entry 228 (class 1259 OID 16577)
-- Name: service_packages; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.service_packages (
    id bigint NOT NULL,
    service_id smallint NOT NULL,
    name character varying(120) NOT NULL,
    description text,
    price numeric(14,0) NOT NULL,
    unit_id smallint NOT NULL,
    access_days integer,
    features jsonb,
    thumbnail_url text,
    badge character varying(40),
    max_capacity integer,
    status public.service_package_status_enum DEFAULT 'active'::public.service_package_status_enum NOT NULL,
    created_by bigint,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    bundle_hours smallint DEFAULT 1,
    is_custom boolean DEFAULT false,
    price_per_unit numeric(14,0),
    discount_pct integer DEFAULT 0
);


ALTER TABLE public.service_packages OWNER TO swspace_user;

--
-- TOC entry 227 (class 1259 OID 16576)
-- Name: service_packages_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.service_packages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_packages_id_seq OWNER TO swspace_user;

--
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 227
-- Name: service_packages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.service_packages_id_seq OWNED BY public.service_packages.id;


--
-- TOC entry 220 (class 1259 OID 16516)
-- Name: services; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.services (
    id smallint NOT NULL,
    category_id smallint NOT NULL,
    code character varying(40) NOT NULL,
    name character varying(80) NOT NULL,
    description text,
    image_url text,
    features jsonb,
    min_advance_days integer DEFAULT 1,
    capacity_min integer,
    capacity_max integer,
    is_active boolean DEFAULT true,
    CONSTRAINT chk_services_capacity_range CHECK (((capacity_min IS NULL) OR (capacity_max IS NULL) OR (capacity_min <= capacity_max)))
);


ALTER TABLE public.services OWNER TO swspace_user;

--
-- TOC entry 219 (class 1259 OID 16515)
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.services_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO swspace_user;

--
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 219
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- TOC entry 216 (class 1259 OID 16498)
-- Name: time_units; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.time_units (
    id smallint NOT NULL,
    code character varying(20) NOT NULL,
    days_equivalent integer NOT NULL
);


ALTER TABLE public.time_units OWNER TO swspace_user;

--
-- TOC entry 215 (class 1259 OID 16497)
-- Name: time_units_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.time_units_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_units_id_seq OWNER TO swspace_user;

--
-- TOC entry 3868 (class 0 OID 0)
-- Dependencies: 215
-- Name: time_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.time_units_id_seq OWNED BY public.time_units.id;


--
-- TOC entry 260 (class 1259 OID 33346)
-- Name: user_payment_methods; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.user_payment_methods (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    code text NOT NULL,
    display_name text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb,
    is_default boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.user_payment_methods OWNER TO swspace_user;

--
-- TOC entry 259 (class 1259 OID 33345)
-- Name: user_payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.user_payment_methods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_payment_methods_id_seq OWNER TO swspace_user;

--
-- TOC entry 3869 (class 0 OID 0)
-- Dependencies: 259
-- Name: user_payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.user_payment_methods_id_seq OWNED BY public.user_payment_methods.id;


--
-- TOC entry 226 (class 1259 OID 16563)
-- Name: users; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    password_hash text NOT NULL,
    full_name character varying(120),
    role public.user_role_enum DEFAULT 'user'::public.user_role_enum NOT NULL,
    status public.user_status_enum DEFAULT 'active'::public.user_status_enum NOT NULL,
    avatar_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reset_password_token_hash text,
    reset_password_expires_at timestamp with time zone,
    username character varying(30) NOT NULL,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO swspace_user;

--
-- TOC entry 225 (class 1259 OID 16562)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO swspace_user;

--
-- TOC entry 3870 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 256 (class 1259 OID 16863)
-- Name: v_admin_kpis; Type: VIEW; Schema: public; Owner: swspace_user
--

CREATE VIEW public.v_admin_kpis AS
 SELECT ( SELECT count(*) AS count
           FROM public.users
          WHERE (users.role = 'user'::public.user_role_enum)) AS total_users,
    ( SELECT count(*) AS count
           FROM public.service_packages
          WHERE (service_packages.status = 'active'::public.service_package_status_enum)) AS active_packages,
    ( SELECT count(*) AS count
           FROM public.bookings
          WHERE (bookings.status = ANY (ARRAY['paid'::public.booking_status_enum, 'checked_in'::public.booking_status_enum, 'checked_out'::public.booking_status_enum]))) AS total_bookings,
    ( SELECT COALESCE(sum(payments.amount), (0)::numeric) AS "coalesce"
           FROM public.payments
          WHERE (payments.status = 'success'::public.payment_status_enum)) AS revenue_total;


ALTER VIEW public.v_admin_kpis OWNER TO swspace_user;

--
-- TOC entry 257 (class 1259 OID 16868)
-- Name: v_revenue_daily; Type: VIEW; Schema: public; Owner: swspace_user
--

CREATE VIEW public.v_revenue_daily AS
 SELECT date(payments.updated_at) AS day,
    sum(
        CASE
            WHEN (payments.status = 'success'::public.payment_status_enum) THEN payments.amount
            ELSE (0)::numeric
        END) AS revenue
   FROM public.payments
  GROUP BY (date(payments.updated_at));


ALTER VIEW public.v_revenue_daily OWNER TO swspace_user;

--
-- TOC entry 258 (class 1259 OID 16872)
-- Name: v_utilization_daily; Type: VIEW; Schema: public; Owner: swspace_user
--

CREATE VIEW public.v_utilization_daily AS
 SELECT date(bookings.start_time) AS day,
    bookings.service_id,
    sum(
        CASE
            WHEN (bookings.status = ANY (ARRAY['paid'::public.booking_status_enum, 'checked_in'::public.booking_status_enum, 'checked_out'::public.booking_status_enum])) THEN 1
            ELSE 0
        END) AS bookings_count
   FROM public.bookings
  GROUP BY (date(bookings.start_time)), bookings.service_id;


ALTER VIEW public.v_utilization_daily OWNER TO swspace_user;

--
-- TOC entry 263 (class 1259 OID 33422)
-- Name: vw_qr_daily_attendance; Type: VIEW; Schema: public; Owner: swspace_user
--

CREATE VIEW public.vw_qr_daily_attendance AS
 SELECT date_trunc('day'::text, qr_checkins.check_in_at) AS day,
    count(*) FILTER (WHERE (qr_checkins.status = 'checked-in'::public.checkin_status_enum)) AS active_checkins,
    count(*) FILTER (WHERE (qr_checkins.status = 'checked-out'::public.checkin_status_enum)) AS completed_checkouts
   FROM public.qr_checkins
  GROUP BY (date_trunc('day'::text, qr_checkins.check_in_at))
  ORDER BY (date_trunc('day'::text, qr_checkins.check_in_at)) DESC;


ALTER VIEW public.vw_qr_daily_attendance OWNER TO swspace_user;

--
-- TOC entry 224 (class 1259 OID 16541)
-- Name: zones; Type: TABLE; Schema: public; Owner: swspace_user
--

CREATE TABLE public.zones (
    id bigint NOT NULL,
    floor_id smallint NOT NULL,
    service_id smallint NOT NULL,
    name character varying(80) NOT NULL,
    capacity integer NOT NULL,
    layout_image_url text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.zones OWNER TO swspace_user;

--
-- TOC entry 223 (class 1259 OID 16540)
-- Name: zones_id_seq; Type: SEQUENCE; Schema: public; Owner: swspace_user
--

CREATE SEQUENCE public.zones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.zones_id_seq OWNER TO swspace_user;

--
-- TOC entry 3871 (class 0 OID 0)
-- Dependencies: 223
-- Name: zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.zones_id_seq OWNED BY public.zones.id;


--
-- TOC entry 3492 (class 2604 OID 16839)
-- Name: auth_sessions id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.auth_sessions ALTER COLUMN id SET DEFAULT nextval('public.auth_sessions_id_seq'::regclass);


--
-- TOC entry 3490 (class 2604 OID 16829)
-- Name: automation_actions id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.automation_actions ALTER COLUMN id SET DEFAULT nextval('public.automation_actions_id_seq'::regclass);


--
-- TOC entry 3464 (class 2604 OID 16637)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 3479 (class 2604 OID 16735)
-- Name: cancellation_policies id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cancellation_policies ALTER COLUMN id SET DEFAULT nextval('public.cancellation_policies_id_seq'::regclass);


--
-- TOC entry 3483 (class 2604 OID 16778)
-- Name: checkins id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins ALTER COLUMN id SET DEFAULT nextval('public.checkins_id_seq'::regclass);


--
-- TOC entry 3445 (class 2604 OID 16535)
-- Name: floors id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.floors ALTER COLUMN id SET DEFAULT nextval('public.floors_id_seq'::regclass);


--
-- TOC entry 3485 (class 2604 OID 16798)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3488 (class 2604 OID 16819)
-- Name: occupancy_events id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.occupancy_events ALTER COLUMN id SET DEFAULT nextval('public.occupancy_events_id_seq'::regclass);


--
-- TOC entry 3471 (class 2604 OID 16686)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3472 (class 2604 OID 16695)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3477 (class 2604 OID 16720)
-- Name: refunds id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.refunds ALTER COLUMN id SET DEFAULT nextval('public.refunds_id_seq'::regclass);


--
-- TOC entry 3462 (class 2604 OID 16622)
-- Name: rooms id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq'::regclass);


--
-- TOC entry 3460 (class 2604 OID 16607)
-- Name: seats id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats ALTER COLUMN id SET DEFAULT nextval('public.seats_id_seq'::regclass);


--
-- TOC entry 3441 (class 2604 OID 16510)
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- TOC entry 3482 (class 2604 OID 16744)
-- Name: service_floor_rules id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules ALTER COLUMN id SET DEFAULT nextval('public.service_floor_rules_id_seq'::regclass);


--
-- TOC entry 3453 (class 2604 OID 16580)
-- Name: service_packages id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages ALTER COLUMN id SET DEFAULT nextval('public.service_packages_id_seq'::regclass);


--
-- TOC entry 3442 (class 2604 OID 16519)
-- Name: services id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- TOC entry 3440 (class 2604 OID 16501)
-- Name: time_units id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.time_units ALTER COLUMN id SET DEFAULT nextval('public.time_units_id_seq'::regclass);


--
-- TOC entry 3494 (class 2604 OID 33349)
-- Name: user_payment_methods id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.user_payment_methods ALTER COLUMN id SET DEFAULT nextval('public.user_payment_methods_id_seq'::regclass);


--
-- TOC entry 3448 (class 2604 OID 16566)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3446 (class 2604 OID 16544)
-- Name: zones id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones ALTER COLUMN id SET DEFAULT nextval('public.zones_id_seq'::regclass);


--
-- TOC entry 3840 (class 0 OID 16836)
-- Dependencies: 255
-- Data for Name: auth_sessions; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.auth_sessions (id, user_id, refresh_token_hash, user_agent, ip, created_at, expires_at) FROM stdin;
1	5	79f2cfec1f98e0b3fdb6686cc2611c624265c00922ccf210b29a5102e8a8873aa3941fa7b9ef0aa08cc305ab99847402	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:04:04.243672	2025-11-30 00:08:09.942
2	5	2b1301375f15993b64c761d31da54fca6c1215687f0ac66e289a3a3cf67385dd7e04a811a812b257e9bb23a566a6a6e0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:08:34.078994	2025-11-30 00:08:34.077
3	5	20a6c0b6ea0ad53c598fc33e832f626f8d7cf70e5f8917951b80487f99397fc5217094d8a75666b1c57b001fc5fb5f8e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:09:18.260644	2025-11-30 00:09:18.259
4	5	23528be972acd9a187eb23e75cb2611880652fc2c95700d731b3cf23cca2e6f5dda006dbe8a9cd44db63ccfaaae9941b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:13:49.891506	2025-11-30 00:27:53.779
5	5	466b3432ac5b1bff2dc4e43c8844f91d21de01fbafb2918ba411caec5cc212e2b1c5724efca701c464890bbf1f6564ce	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:28:04.47088	2025-11-30 00:29:41.244
6	5	18c4e0ae2fb2157849a39c009ee2ae2c7db7381ea367268da75d87aafd61735a5995c54f260f62d1c010146d04d7662a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:29:47.802048	2025-11-30 00:29:47.799
7	5	11acb7623a2d0f082a26b9440f0c392d26b39191b3ed01a155c8521a62672f1c36e19705731f03e5e6bc1b0679a0865b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:30:03.301643	2025-11-30 00:30:35.659
8	5	36782796cda679fc1cc6f07400e54eef303cde17ed588d7423ec7a5b0ca034ae1df73472ec65edf6090d79b119cea82c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:30:38.733541	2025-11-30 00:30:38.731
9	3	22c104530a0ebff8950280aa46cefb938914ee1e866432b3428b7e259df43edaf41ffb461d7bd8a173c47a66afa7a740	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:32:16.510119	2025-11-30 00:32:16.508
10	5	f27b9f99e0a67393c69189f8b662a3da29d21ebf5fd4464a2c8a01f0f46b87366f5af1f18e142c72d7f840522941d2b0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:42:34.436829	2025-11-30 00:42:34.436
11	5	4eec4e010438b224defac488294a6719c010a8d63c6efbf1bdc5224f2f323c441ddd1a92c368f8e7634747d5b773582b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:45:44.080728	2025-11-30 00:45:44.079
12	5	b1d0f05fec91095c751bb729616e9403a2da2df1fbdb187153d1f6facc5024bcdebe85ad7f251870a2b4c9a4c39f24c2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:45:52.065663	2025-11-30 00:45:52.063
13	6	e1a4acd179f8fee1c0681e855c5607cd1b60bfc104fdfb3fd9f3b9cf9229a93a14694442b08a3fcfb1cba93f2927bd13	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:56:12.047322	2025-11-30 00:56:12.053
14	6	642b26c7490c98bb758cee8adba5a61099ca5b4fbf17fac76a1e4d582fb91895623542d2bf56c872ec94fea6a49ac464	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:56:21.982978	2025-11-30 00:56:21.984
15	5	dc5e9b08a0d0f498388095b8da91cf84bc1ae9e63c220740feb34e2d7e58e5f9d13826525a76845c9c7345ab940a4ac6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:56:37.711324	2025-11-30 00:56:37.71
16	5	e034f027fdd2162dda72ad3d78bffb0b3c2e7ec6040c93403fb89754d8983533df5bd3f39b3cb127a929cbcac5dc9385	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 17:57:00.275138	2025-11-30 00:57:00.275
17	7	baa8cadce5691b332d347898e588fdf7e551cf293c788302e01552bf07373b2963f997920aa474a773333899c750bb32	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:00:48.104295	2025-11-30 01:00:48.102
18	8	3147383cc0ec1c04662b6e32f22fa554d6d93f77c69a6056edaea1ea644f8b2b81aa226a5e04673f2c821e899bdd0ab3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:07:15.848342	2025-11-30 01:07:15.846
19	8	1e0436b43f167a2c1632c07acb0edf8280d08d9ecd5a205c174dba49ebadd5eca5759f9436c3f2cda684b029f659e6ee	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:07:22.418634	2025-11-30 01:07:22.416
20	6	ab6d9d9e210eb3f40c14bf30e9613ca02e9cb37bee37d41216b797d5feb05c9553627cac4d7842a3f0fcacf4e90a2951	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:07:30.628653	2025-11-30 01:07:30.628
21	5	25b908bb25a0625fabd118bad65b29aa17d3339d733b54fdbcadcdb6c69ec13115e6cd8f6ba324b06c17a2a7add2e861	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:08:04.821836	2025-11-30 01:08:04.82
22	5	f6fae39b840dcc7192147ab617b5201aafdd23f3557bed430ec79c03ffef138cf5997763573c9b884d29fabad106c341	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:15:04.34494	2025-11-30 01:15:04.343
23	5	a72b594199041e039c3cf671210bd897010b8c85d4e39e99762f976332b1f3ac2c4b54913c26f748d51875b365d39789	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:15:17.49202	2025-11-30 01:15:17.487
24	5	ccc345f25352b43af99d3592c5a9c5995084598201ff225a1825961f17d55e0a52e4cf9c87fca3dc7aa9c3a1f5b2851e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:15:51.236277	2025-11-30 01:15:51.23
25	5	4f832492afd044f599fa1865154fe2428a6ec0013e2218ed42d13d4f0023e276a2afbee5aa3a89b8a916751827df49c8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:41:46.416481	2025-11-30 01:41:46.413
26	5	657169a3d06a176d2f9d4911ea2cdc93d1095e1b7886f85678cfca6ec46a7626fa0719a7f70b5c088c3bea9d1fc91019	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-30 18:46:28.045088	2025-11-30 01:46:28.042
27	5	76cd5b8df4e6e9e8f781548a5962da60080816294fb5094c90ffe88453499d9a87c1b0b297a69c8e63222b60fd33f8c8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 02:31:20.839331	2025-11-30 09:31:20.86
28	6	90c237d0e5311666b385bf4030cd9865c55869cca5ff25f25b9bb2adc05aeaf72d4fd4a86d486489ac55c7b222617f78	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 02:31:41.041991	2025-11-30 09:31:41.011
29	5	e235146b30a28ff35153e3f36c5d361768c478e8506d8c816c2760b9feabe174dda9603fbe6f9efdb61957cd5e0c0749	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 03:13:42.708123	2025-11-30 10:13:42.724
30	5	482ad8c0f5bcdc68ef18ae4711f84a0f045d0c2138f2c0a111a5aeb83b45a1c9cde33b3d52f7bde5dc5747dcb3463f96	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 03:16:10.282442	2025-11-30 10:16:10.282
31	5	ab4a6e7f367a8a7450c2589c6aa7081db22d875a20209f53546da2c36332c1503681ba4c3b25471e04b3163f9488a9a8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 03:17:58.793252	2025-11-30 10:17:58.788
32	5	8e5415d62ddd401a7e908b10afcbfdc0641093fd3cdb78130e8275fc91423dba67cb7ab7ce098d0eafc8e6f138347249	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 03:18:41.478543	2025-11-30 10:18:41.499
33	5	6019bf0858fa802c41a4a902b9f25d1d4d2aa6b1d732a22687dd60f0e15a63f9fb215b54a7c99d05842f6a7346b678d1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:00:28.99293	2025-11-30 11:00:28.99
34	5	5008af5afdff31946d00fa3dd55aed14ad4d2d61eb4dbf5bbb37aa6aafb7e0bef5f26070497fe0233d282683890d5ccb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:00:42.016906	2025-11-30 11:00:42.013
35	6	c9c45e08e8a55629c22a34a5084afea50fb7eedb16b0a0831af864e20057f3c127a71b5f2c34d8c0e424fce3a17a516a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:00:54.853431	2025-11-30 11:00:54.854
36	9	6fb1db97eddeacb2659c2c68ef2199b233a38779d7df1d955cb33dedf38bd9c30677803a5a9e5269ef52b42088a1ab77	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:01:15.188864	2025-11-30 11:24:44.154
37	5	b8e2856cd5f7900eaace7471c2e10f36f5c1ad8bd8c0fa9dc2b7b817b22fb4a79c253e7b90b1d5ae5232aee5f7ba99ff	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:24:56.211079	2025-11-30 11:40:28.158
38	6	da4d65c932d10295b6b1da746ef2f7fea804ddd83394571a70cbffc80a1b3454df352c2fc520e5ed412c870d3e853c73	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:41:14.784385	2025-11-30 11:41:14.799
39	5	ecc7b1086062d95f1d230b44b0ec995a9edc2e73fd301aab6e45f68ed7316d67f92b2cf35e62a400a6577a79fdb37bec	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:41:26.663017	2025-11-30 11:47:47.859
40	5	627e424c86b3997710b6cb1f7946cafbbca0f34853a56e4b62e62139c655700dbe4ea228381c51e83913ecf8cbd16d60	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 04:59:00.700575	2025-11-30 11:59:00.701
41	5	f7ef3c1c3155c85de990268bf1916a59ca0f05b4488361cf5fdb2dded9151acb62486f2e20abc8184109e9b6ae3810a2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 07:33:02.691723	2025-11-30 14:33:02.686
42	5	1b1c6c66cabc84f63992ed9875ba4fcc05723534ded143159b9b02270a66837a645ea72385a9552f0eae9bcb66cc223a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-10-31 07:41:57.654856	2025-11-30 14:41:57.629
43	6	811454d7bc44402313311e0267aa2edacdf7f292f94d8f413fbdf904544f86906a69cc2c043e17f9ceeacee3196c67ac	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-01 13:36:14.897149	2025-12-01 20:36:14.893
44	5	a5906207f78188c18f759858391fc5645f54686788b5bbfa2cc226809224b7f8ed4dc1b0c984fcc6ea76b494233a1492	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-01 13:36:27.370613	2025-12-01 20:36:27.369
45	5	faf04d6123188ecece8abaf37b84530f80c5c7b71c7c201763c4d6c6ef81bee315205c8fa5f534daadeaaf0bde3ad869	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-01 13:38:26.555112	2025-12-01 20:38:26.554
46	5	161716dfc2dbc7abb76f99305adcef3a305e1ff1f6c9b59593c567e92a78f6c685e3dda70ef66ac21345fbb6128efcfb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-01 14:35:11.744693	2025-12-01 21:35:11.742
47	5	f632fab270ddbf2dd7d2dea3245f04f73ba380627a16fc933562cde823bbb12a20a99696267e1aab289ed39d950de8c3	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-01 14:39:40.378067	2025-12-01 21:39:40.373
48	5	6bc09c1a0091a53417024b0352b369d2256c3cf15a75c98822b78899c42ac5c76287c3bc89a373ee40a57a3f2fcff3bc	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-01 14:45:26.2646	2025-12-01 21:45:26.323
81	5	fbb76f69183ec4ea81df3c9e3fe47d73357aa79e7a822c52c0ead414003538a94cdb32954383da1a366cc6816e899561	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 02:47:41.016988	2025-12-02 09:47:41.011
82	5	d766e79ed3493f84fb9021d778185acad9e5854db9da27a234cb8bec93f522adbc592f57ca26cdce93b0aabc951efcdd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 03:14:08.559128	2025-12-02 10:14:08.558
83	5	6ae77a56f857b391557b6dfa9b895393a4713b17f84c489798284232c88ee7d516b58d0c01db36396c8dc7f435e1430f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 05:26:39.066151	2025-12-02 12:26:39.067
84	5	ecde6b0fd22c217bb1e521653ae1d5a8f71708ea9dcc52dea9e21a341a840af53b2ef2cb81e6bc698a14b929b5645524	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 06:59:43.901742	2025-12-02 13:59:43.899
85	5	e5d0c73272c95c3d5026b24e9c98e6a9b1faaca6386f5a269c974f9c0a7da26f85647fc1695e7079e51a9c164aa7437c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:00:24.197339	2025-12-02 14:00:24.198
86	5	bc8df05eb1e8ab3e28d865efe9e0f6d594e5f697793ba4d3157999c843c7183ce984453144b6f7d2a37431c4b4f459b9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:22:08.797897	2025-12-02 14:22:08.794
87	5	2f0bc9ca34e149c46e18209a88b4402259ff842b9199da895f80009d957319a7d93e62103104ef6111b98250900cceac	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:24:01.702898	2025-12-02 14:24:01.7
88	5	93069e080214c700819d365e423754685eaa37898d37e1f66f8eb8ff3c24b25896253b352d2a4ab7595f8daae8a13e2a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:24:11.47849	2025-12-02 14:24:11.476
89	5	785db2377692a88f11220853b24b531a20fa434753f0d317989782db27b275771077007f582f27622f12bfc511a269fb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:24:42.061155	2025-12-02 14:24:42.06
90	5	8aee81e8ac451759cddcad26f35b5b7a8aa004399fa840072d14cd9a41b5aa72b940b85f73b0b7bd12c7a234e9d63213	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:30:06.196003	2025-12-02 14:30:06.19
91	5	679c552ce457b026b2f72390ba84bda96627bdb73bf8a820f84b73ded5204b56cd3448f64f622d18449d044f3ed7a6e9	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:30:29.717479	2025-12-02 14:30:29.714
92	5	aa5bfa6595580722b97cc5902e4fcf5108e96ee599fd4a18c73d862d7e2cb948edc613b0957399cc0bda85e5cb55ba94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:34:37.516852	2025-12-02 14:34:37.515
93	5	1f16975d17e537c6f6c04a0962831e3986b356f5f096e870bb3e87a737a8d084a696a44c0a2cc16b9f47d569d4fd7fc5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:40:37.079115	2025-12-02 14:40:37.077
94	5	3dc9b7ff612aa28474c3f2d997f0bd3241c1f1c5d2fff5cffdf3feb22760837b6d2629218c255d1bf11dd3b891e5a5f7	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 07:48:20.37174	2025-12-02 14:48:20.375
95	5	9f54fa4d4950e659da0e344e69c4e27ef0f54382e1d4d84e5e4182744903ae726efe628a4170ebcfc2db4d212ff6262e	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 08:01:37.272553	2025-12-02 15:01:37.27
96	5	bd15e682d933263ff12712b30168164bf06eed5cd00e857206fa4c70744c1c2e55b0f106afb5f560a51b5939d084c446	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 08:25:55.974786	2025-12-02 15:25:55.984
97	5	27af172f2404ab967ca8fe1b322ae8df7fbd4248bd76746d626235b9e037aa234ee83739b611307c1bcc9ca527c5459f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 08:37:31.942812	2025-12-02 15:37:31.941
98	5	92695681c44a5cbef49b49781e2e98b915add1d89172e8be7279f0c2f2059d81b8be33ed8ec2aee1f58f06c2f812309b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 09:58:30.575931	2025-12-02 16:58:30.574
99	5	e294e7c529168d2401538e2550e3dd56d49dfe437d2b3c8d6182236193bc467ef4cc848eb1d7f5778419dbe4eb787bd2	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 10:49:56.843295	2025-12-02 17:49:56.844
100	5	0aaab38377226e2a9bec2646b411ad422aa06c7e50e023c6939d29b1be75fee93e3b02e3a1b014c20cb1a863f4e4f2d8	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 10:52:46.04994	2025-12-02 17:52:46.043
101	5	d191fa50899e6786edee721f64071095970d1405b7648e62b6c45b8bbe6bc4b0c63de819dcbed7c2b1ed70eb5ad4bf1f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 11:20:16.437352	2025-12-02 18:20:16.438
102	5	84c88df52e48b1110349e8f888005da8776cd3ff35188a088dad65897b46d00df10cacd5f39cfe1e872675ddd7cb8ac6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 12:06:02.776714	2025-12-02 19:06:02.776
103	5	1573b8c6e976ab25ca3f3106d14da9d4caa4c470813c71cb5dc3d9aa68eaa7265b4a28088cdb942930caf28c67659106	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 12:26:41.16976	2025-12-02 19:26:41.144
104	5	d8dd9daf22e28263cc9d931cd61615c9637dbb78f3c00ecb32b5ee7baa2422f059b04c14cb21b72ddb14258063c7f800	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 12:34:57.65684	2025-12-02 19:34:57.667
105	5	3d9a4ea010b4a939990f47373d44aa031a61223f9cacbe4865067829a4ec84c6488a298b6152829b5d008a815eaf6a10	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 12:56:12.669535	2025-12-02 19:56:12.416
106	5	72fb788dd8d0cb51dcda82f941aee6464b41154a3ce69c52b055b96eb79780e999e44195b9e9a8a1294cb217defe9a83	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 13:25:17.459105	2025-12-02 20:25:17.458
107	5	bfc475fa65217020cd4a807b543bcf65a7613e75383178aa9b2ee6e45ec6fbb453690866a4302f5d6463050bc96419cd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 13:31:03.620386	2025-12-02 20:31:03.616
108	5	96eba19a9f42d36a6f014cddffd8ebd3a78459e1df27e7b37c78e417c3124873121722ee7ad2e57340f3646eb7ad77b4	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 13:48:07.44474	2025-12-02 20:48:07.444
109	5	b47b03b5496f9e746c8b6ae03936804084a96f0d4e323b06181ae0c4f0369becc85a2a89e3be0295040c9d9c3714259f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 14:16:33.002193	2025-12-02 21:16:32.998
110	5	87e5a11227070c585fc5a27bf0baf20f227eee3e733b3d547427bcea7d7ee216f5bc2c4831848e39f0f4cf0f99b06a00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 14:34:20.618892	2025-12-02 21:34:20.621
111	5	34864f40e4374d5ded21a54fe0914bdc4b221b26ac2587c269a701db90b85aa92cf12b7ade154b5a2e9f90bac0ee3fca	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 14:58:15.173549	2025-12-02 21:58:15.173
112	5	2f3c2afc16887f414490159f055ddafd05a672f611e5d370fcecf8096e8f1157c4bf8bbaf3606283fc178032acdcde0d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 14:58:53.062723	2025-12-02 21:58:53.061
113	5	743b900a2ff2c961a56f2e23bc41c81e41139cbfc0a79472891c7d06fb20f962dddf9f2d8e2d76c81985e88d185c6710	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:03:20.268822	2025-12-02 22:03:20.267
114	5	06d659502d67ff392c89a15a4344a747716255a77eabe4326d00ffaa401cc6b426418d0460f02554630400c2fa662eca	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:12:48.141713	2025-12-02 22:12:48.135
115	5	8d5a8649031a0c258ea84ab87d8a4b9ce311c0485827f0903abced18b700ff568a9aaca2989a2dd78e7bb49f53c6aa86	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:22:26.245818	2025-12-02 22:22:26.243
116	5	105e8f6fd7f12e59be6db30be5e23ef4f9b40129c4bbef7c5284964ae5ee48e9d33e61e148157354b55f60d7aa5e2d6d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:27:03.400733	2025-12-02 22:27:03.398
117	5	2bc7625189ac1800ba8649885889648489468528fefad39481e5f0555ecdb2a82966e7065576e9e6fa97a85c9efcb51f	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:27:47.361077	2025-12-02 22:27:47.36
118	5	d110c5a1e5e0bc42849facce4b5ead2a82678d7201859d0f8fc3d8d84d3e39574197e6988abb24a9bd241d7b78e087ba	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:29:58.829495	2025-12-02 22:29:58.827
119	5	4d37e53802abf10748bb1b76242f87000476408e181855737245d1db2c3eb09446893df5b76b7c1abfd274809c3c1918	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-02 15:31:03.4012	2025-12-02 22:31:03.398
120	5	3255d202d66eacb215e65f6674cfe34b0233a9368c0ff099f97a0a5f1e26669dca20a8d1496c1580f229041c9fa2cf5d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 03:29:07.550031	2025-12-03 10:29:07.547
121	5	8c98751df2f43069f81d4a3a942c9535d1443cfd4f88bc964da6155e1fb45eeb373273e5fabece93150084b9a5fa6919	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 04:02:07.919267	2025-12-03 11:02:07.918
122	5	923166b41c22439735403a77d6e6a9ad8030a445bf6e745173a5cf3b11bafa82df2964c3fe4baf6354f971a2b18e3e7a	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 04:23:40.910035	2025-12-03 11:23:40.908
123	5	d2c9954d58594810d88bacf75d679e01e1a00306e86306a1612d8d5919a43d84c3cafb348e68a4e7ed07cdc977fc4597	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 04:43:55.396843	2025-12-03 11:43:55.396
124	5	b6ac1581fcdbaa17669f3fe3b53fe0997f49395dc78df2adaa20d31946cc47d884ea108f90a5bdea18d0820868f91869	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 04:45:09.720346	2025-12-03 11:45:09.719
125	5	ff566720e66098daa66d48ea6a5974fff9c6025543c66321157d2e45eaaf8b4966dd691d7be7de89f50345d3f64ed8bb	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 04:55:33.384975	2025-12-03 11:55:33.384
126	5	86af4c6910b20ad01b993722c18691e8816200fc5e91c42a0203b5552a49130510bc111e068f396e48d2ce761551c352	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 06:03:55.759858	2025-12-03 13:03:55.757
127	5	d05532df45e8f7507a9a3060e8af3c8ce107f93c515b3bd47f07491070d66a7bedc0d9dc56b85359a9b0dc86be4a4880	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 06:52:12.104923	2025-12-03 13:52:12.104
128	5	5c7d46f73d2042718183c0c480b63d9f39482873ec9a972332516c65aa97761f5e37e4b84de204ff6c15469c25dc7316	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 06:57:02.434863	2025-12-03 13:57:02.432
129	5	ed92012019a8a3be89f19fa34781a6ff2f6d4951779b7678296c0a9c0076c6936efb151e77eee1477b33c9ebd19b7b94	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 07:15:58.493842	2025-12-03 14:15:58.497
130	5	422bb0937bd8dbdd63f497cd760a4174e6d914a1fdb83fa1776c7d9d1a7035c27755b4728c375e22716654e36907722c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 07:18:15.133556	2025-12-03 14:18:15.132
131	5	ae28d0e62c896c0cfbe173496fffb5724c0bcb6d43111d06b64709bea95532b81dea9f48b6a2bcde6ef0539af074d1e6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 07:44:26.713732	2025-12-03 14:44:26.711
132	5	cd2aa2d1c5efeb2271bdb03fdcaa1a0e23605704abdc994e7461ae66ec23484a9ca8f347d497098b9022a5e24c92c0e0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 10:16:47.761122	2025-12-03 17:16:47.752
133	5	5bd9ec42ced0a351552712fa14f236b583505f3f37c868613e10539708b38639313d9e0bebf22c925b14c105597c989c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 13:05:15.575755	2025-12-03 20:05:15.574
134	5	9d4d3854f1371a8ce5471bded5136c71ea5afbc9de7a387d7307594c6808975e89e2254880e427b3bb7f535eeffd405d	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 14:03:32.082526	2025-12-03 21:03:32.08
135	5	250ea13b8a91ebcf7b39a370f376b684f386f8ee55582d2646933da2ce936c025166527fddda0092e0d726f003e7d3aa	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 15:32:46.831441	2025-12-03 22:32:46.83
136	5	5954c104e43dbea21663fd7c323fdab3646a7596a364e601ccb97201c72661b4982f88fb75a02aa1553a00adde36b5ab	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 15:38:05.181727	2025-12-03 22:38:05.179
137	5	c161addd84eceb52a36f9ff01b212f57a04fd60c67003b8781ccf77a00de06f00edc0db8d1162465440703dd83e3c2c5	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-03 15:57:18.268691	2025-12-03 22:57:18.267
138	5	725cc7fd85634d8d83e5a9617e6937d44165866b3207780c0e1110591e11a8a112d9d1f3cf0eadbadc2dae6c96966400	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-04 02:39:16.840539	2025-12-04 09:39:16.837
139	5	5c9bf396ce31b6a08ecd047697592edb17e85146576ccab6d005b70dfbcdea31e5f93d9fbbb31baa360eb6ffb8c248ec	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-04 05:47:17.028117	2025-12-04 12:47:17.027
140	5	a90874a9462f027d6bcc8a7b3fe40f8590e17b359cbd921934e14f242ea85242a579710bd72499260c693399364ed0dd	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-04 06:06:31.555791	2025-12-04 13:06:31.554
141	5	6abc767919e6861001e48500d8c3c32d8ac560107b86be520361a183a33a7c6fcb25849fdfa81167534cd3b5d19efe6b	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-04 06:31:50.58416	2025-12-04 13:31:50.586
142	5	fb1cb10149cc87ea0456269fc8a7a5b4d0b26e7ea03fa5000cb13eb82dc38072cf1c9ad6594e2b112d7e7ec59ae96672	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-04 10:28:28.574297	2025-12-04 17:28:28.571
143	5	89e2f3aafdcdae4298eba0bc1b56aa561f36413e313538869a0cef9776f18404a5a60c5f530f969c51e72fe60e9f6a19	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-04 12:45:12.751603	2025-12-04 19:45:12.75
144	5	c8876740412deb211c839088d264e5b787ac35a3aed8f8293d60a168ec36ab7926543db19c11d1877902d9753b01c600	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-06 14:23:43.217238	2025-12-06 21:23:43.214
145	9	4a0b95965f4dcd8ac2ff1aca29bcfc60e47d51fd1ae646165796594eef269fb4f8fd2262258bf7b4c78c7a4b1608d27c	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-06 15:32:11.04764	2025-12-06 22:32:11.089
146	5	7ef8d61a080c96663374cfa380a3ffeffc695d856b305106e7711c7c9ba8f61452f42c1ba5cab0951fff528926b97bf0	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36	::1	2025-11-06 15:32:24.350962	2025-12-06 22:32:24.391
\.


--
-- TOC entry 3838 (class 0 OID 16826)
-- Dependencies: 253
-- Data for Name: automation_actions; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.automation_actions (id, floor_id, zone_id, action, reason, triggered_by, executed_at, extra) FROM stdin;
\.


--
-- TOC entry 3819 (class 0 OID 16634)
-- Dependencies: 234
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.bookings (id, user_id, category_id, service_id, package_id, zone_id, seat_id, room_id, start_time, end_time, quantity, price_total, status, notes, created_at, updated_at, service_type, package_duration, seat_code, seat_name, floor_no, base_price, discount_pct, final_price, payment_status, payment_method, transaction_id, booking_reference, cancelled_at, cancellation_reason) FROM stdin;
\.


--
-- TOC entry 3830 (class 0 OID 16759)
-- Dependencies: 245
-- Data for Name: cameras; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.cameras (id, floor_id, zone_id, name) FROM stdin;
\.


--
-- TOC entry 3827 (class 0 OID 16732)
-- Dependencies: 242
-- Data for Name: cancellation_policies; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.cancellation_policies (id, name, full_refund_before_hours) FROM stdin;
1	default_24h	24
\.


--
-- TOC entry 3832 (class 0 OID 16775)
-- Dependencies: 247
-- Data for Name: checkins; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.checkins (id, booking_id, user_id, method, direction, detected_at, camera_id, extra) FROM stdin;
\.


--
-- TOC entry 3807 (class 0 OID 16532)
-- Dependencies: 222
-- Data for Name: floors; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.floors (id, code, name) FROM stdin;
1	F1	Floor 1 – Main Workspace
2	F2	Floor 2 – Meeting & Private Office
3	F3	Floor 3 – Networking & Workshop
\.


--
-- TOC entry 3834 (class 0 OID 16795)
-- Dependencies: 249
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.notifications (id, user_id, booking_id, type, title, content, channel, status, created_at, read_at) FROM stdin;
\.


--
-- TOC entry 3836 (class 0 OID 16816)
-- Dependencies: 251
-- Data for Name: occupancy_events; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.occupancy_events (id, camera_id, floor_id, zone_id, people_count, detected_at, model_version, extra) FROM stdin;
1	\N	1	\N	1	2025-11-03 06:11:05.414363	\N	\N
2	\N	1	\N	1	2025-11-03 06:11:06.412378	\N	\N
3	\N	1	\N	1	2025-11-03 06:11:07.451951	\N	\N
4	\N	1	\N	1	2025-11-03 06:11:08.472494	\N	\N
5	\N	1	\N	1	2025-11-03 06:11:09.526453	\N	\N
6	\N	1	\N	1	2025-11-03 06:11:10.673565	\N	\N
7	\N	1	\N	1	2025-11-03 06:11:11.724202	\N	\N
8	\N	1	\N	0	2025-11-03 06:11:12.736506	\N	\N
9	\N	1	\N	0	2025-11-03 06:11:13.74947	\N	\N
10	\N	1	\N	0	2025-11-03 06:11:14.763888	\N	\N
11	\N	1	\N	0	2025-11-03 06:11:15.764199	\N	\N
12	\N	1	\N	1	2025-11-03 06:11:16.789569	\N	\N
13	\N	1	\N	1	2025-11-03 06:11:17.854392	\N	\N
14	\N	1	\N	1	2025-11-03 06:11:18.936562	\N	\N
15	\N	1	\N	1	2025-11-03 06:11:20.016781	\N	\N
16	\N	1	\N	1	2025-11-03 06:11:21.058031	\N	\N
17	\N	1	\N	0	2025-11-03 06:11:22.114006	\N	\N
18	\N	1	\N	0	2025-11-03 06:11:23.165432	\N	\N
19	\N	1	\N	0	2025-11-03 06:11:24.191803	\N	\N
20	\N	1	\N	0	2025-11-03 06:11:25.20556	\N	\N
21	\N	1	\N	1	2025-11-03 06:11:26.24357	\N	\N
22	\N	1	\N	1	2025-11-03 06:11:27.227468	\N	\N
23	\N	1	\N	0	2025-11-03 06:11:28.255067	\N	\N
24	\N	1	\N	0	2025-11-03 06:11:29.312134	\N	\N
25	\N	1	\N	1	2025-11-03 06:11:30.344973	\N	\N
26	\N	1	\N	1	2025-11-03 06:11:31.371658	\N	\N
27	\N	1	\N	1	2025-11-03 06:11:32.397093	\N	\N
28	\N	1	\N	1	2025-11-03 06:11:33.419868	\N	\N
29	\N	1	\N	1	2025-11-03 06:11:34.434908	\N	\N
30	\N	1	\N	1	2025-11-03 06:11:35.506912	\N	\N
31	\N	1	\N	1	2025-11-03 06:11:36.609235	\N	\N
32	\N	1	\N	1	2025-11-03 06:11:37.680503	\N	\N
33	\N	1	\N	0	2025-11-03 06:11:38.688167	\N	\N
34	\N	1	\N	0	2025-11-03 06:11:39.717909	\N	\N
35	\N	1	\N	1	2025-11-03 06:11:40.781621	\N	\N
36	\N	1	\N	2	2025-11-03 06:11:41.789626	\N	\N
37	\N	1	\N	1	2025-11-03 06:11:42.800829	\N	\N
38	\N	1	\N	1	2025-11-03 06:11:43.839291	\N	\N
39	\N	1	\N	1	2025-11-03 06:11:44.856249	\N	\N
40	\N	1	\N	1	2025-11-03 06:11:45.868929	\N	\N
41	\N	1	\N	1	2025-11-03 06:11:46.881329	\N	\N
42	\N	1	\N	1	2025-11-03 06:11:47.921628	\N	\N
43	\N	1	\N	1	2025-11-03 06:11:48.954873	\N	\N
44	\N	1	\N	1	2025-11-03 06:11:50.003933	\N	\N
45	\N	1	\N	1	2025-11-03 06:11:51.031623	\N	\N
46	\N	1	\N	1	2025-11-03 06:11:52.062612	\N	\N
47	\N	1	\N	1	2025-11-03 06:11:53.076213	\N	\N
48	\N	1	\N	1	2025-11-03 06:11:54.101013	\N	\N
49	\N	1	\N	3	2025-11-03 06:11:55.130267	\N	\N
50	\N	1	\N	1	2025-11-03 06:11:56.160645	\N	\N
51	\N	1	\N	1	2025-11-03 06:11:57.202048	\N	\N
52	\N	1	\N	1	2025-11-03 06:11:58.243142	\N	\N
53	\N	1	\N	1	2025-11-03 06:11:59.272173	\N	\N
54	\N	1	\N	1	2025-11-03 06:12:00.296141	\N	\N
55	\N	1	\N	1	2025-11-03 06:12:01.311006	\N	\N
56	\N	1	\N	1	2025-11-03 06:12:02.313521	\N	\N
57	\N	1	\N	1	2025-11-03 06:12:03.35488	\N	\N
58	\N	1	\N	1	2025-11-03 06:12:04.376469	\N	\N
59	\N	1	\N	1	2025-11-03 06:12:05.453947	\N	\N
60	\N	1	\N	1	2025-11-03 06:12:06.476723	\N	\N
61	\N	1	\N	0	2025-11-03 06:12:07.520709	\N	\N
62	\N	1	\N	1	2025-11-03 06:12:08.535264	\N	\N
63	\N	1	\N	3	2025-11-03 06:12:09.55525	\N	\N
64	\N	1	\N	3	2025-11-03 06:12:10.590818	\N	\N
65	\N	1	\N	1	2025-11-03 06:12:11.610032	\N	\N
66	\N	1	\N	1	2025-11-03 06:12:12.635646	\N	\N
67	\N	1	\N	1	2025-11-03 06:12:13.650447	\N	\N
68	\N	1	\N	1	2025-11-03 06:12:14.708114	\N	\N
69	\N	1	\N	1	2025-11-03 06:12:15.758002	\N	\N
70	\N	1	\N	1	2025-11-03 06:12:16.766705	\N	\N
71	\N	1	\N	1	2025-11-03 06:12:17.794989	\N	\N
72	\N	1	\N	1	2025-11-03 06:12:18.846492	\N	\N
73	\N	1	\N	1	2025-11-03 06:12:19.850968	\N	\N
74	\N	1	\N	1	2025-11-03 06:12:20.896599	\N	\N
75	\N	1	\N	1	2025-11-03 06:12:21.969635	\N	\N
76	\N	1	\N	1	2025-11-03 06:12:22.985957	\N	\N
77	\N	1	\N	1	2025-11-03 06:12:24.069453	\N	\N
78	\N	1	\N	1	2025-11-03 06:12:25.157551	\N	\N
79	\N	1	\N	1	2025-11-03 06:12:26.215015	\N	\N
80	\N	1	\N	1	2025-11-03 06:12:27.258562	\N	\N
81	\N	1	\N	1	2025-11-03 06:12:28.323562	\N	\N
82	\N	1	\N	1	2025-11-03 06:12:29.34521	\N	\N
83	\N	1	\N	1	2025-11-03 06:12:30.356968	\N	\N
84	\N	1	\N	1	2025-11-03 06:12:31.363679	\N	\N
85	\N	1	\N	1	2025-11-03 06:12:32.406007	\N	\N
86	\N	1	\N	1	2025-11-03 06:12:33.440029	\N	\N
87	\N	1	\N	1	2025-11-03 06:12:34.44896	\N	\N
88	\N	1	\N	1	2025-11-03 06:12:35.473515	\N	\N
89	\N	1	\N	1	2025-11-03 06:12:36.527311	\N	\N
90	\N	1	\N	1	2025-11-03 06:12:37.561392	\N	\N
91	\N	1	\N	1	2025-11-03 06:12:38.579762	\N	\N
92	\N	1	\N	1	2025-11-03 06:12:39.586077	\N	\N
93	\N	1	\N	1	2025-11-03 06:12:40.639564	\N	\N
94	\N	1	\N	1	2025-11-03 06:12:41.686314	\N	\N
95	\N	1	\N	1	2025-11-03 06:12:42.755517	\N	\N
96	\N	1	\N	1	2025-11-03 06:12:43.825615	\N	\N
97	\N	1	\N	1	2025-11-03 06:12:44.86492	\N	\N
98	\N	1	\N	1	2025-11-03 06:12:45.923892	\N	\N
99	\N	1	\N	1	2025-11-03 06:12:46.982663	\N	\N
100	\N	1	\N	1	2025-11-03 06:12:47.998056	\N	\N
101	\N	1	\N	1	2025-11-03 06:12:49.069387	\N	\N
102	\N	1	\N	1	2025-11-03 06:12:50.084175	\N	\N
103	\N	1	\N	1	2025-11-03 06:12:51.138873	\N	\N
104	\N	1	\N	1	2025-11-03 06:12:52.145874	\N	\N
105	\N	1	\N	1	2025-11-03 06:12:53.175885	\N	\N
106	\N	1	\N	1	2025-11-03 06:12:54.20081	\N	\N
107	\N	1	\N	1	2025-11-03 06:12:55.209636	\N	\N
108	\N	1	\N	1	2025-11-03 06:12:56.226306	\N	\N
109	\N	1	\N	1	2025-11-03 06:12:57.262305	\N	\N
110	\N	1	\N	1	2025-11-03 06:12:58.313005	\N	\N
111	\N	1	\N	1	2025-11-03 06:12:59.368572	\N	\N
112	\N	1	\N	1	2025-11-03 06:13:00.382462	\N	\N
113	\N	1	\N	1	2025-11-03 06:13:01.39303	\N	\N
114	\N	1	\N	1	2025-11-03 06:13:02.39954	\N	\N
115	\N	1	\N	1	2025-11-03 06:13:03.454211	\N	\N
116	\N	1	\N	1	2025-11-03 06:13:04.521527	\N	\N
117	\N	1	\N	1	2025-11-03 06:13:05.592491	\N	\N
118	\N	1	\N	1	2025-11-03 06:13:06.617599	\N	\N
119	\N	1	\N	1	2025-11-03 06:13:07.618904	\N	\N
120	\N	1	\N	1	2025-11-03 06:13:08.633158	\N	\N
121	\N	1	\N	1	2025-11-03 06:13:09.670026	\N	\N
122	\N	1	\N	0	2025-11-03 06:13:10.693856	\N	\N
123	\N	1	\N	0	2025-11-03 06:13:11.711757	\N	\N
124	\N	1	\N	1	2025-11-03 06:13:12.725776	\N	\N
125	\N	1	\N	1	2025-11-03 06:13:13.735346	\N	\N
126	\N	1	\N	2	2025-11-03 06:13:14.762547	\N	\N
127	\N	1	\N	0	2025-11-03 06:13:15.831069	\N	\N
128	\N	1	\N	2	2025-11-03 06:13:16.853612	\N	\N
129	\N	1	\N	2	2025-11-03 06:13:17.912578	\N	\N
130	\N	1	\N	1	2025-11-03 06:13:18.925682	\N	\N
131	\N	1	\N	1	2025-11-03 06:13:19.952148	\N	\N
132	\N	1	\N	1	2025-11-03 06:13:20.972702	\N	\N
133	\N	1	\N	1	2025-11-03 06:13:21.993488	\N	\N
134	\N	1	\N	0	2025-11-03 06:13:23.013155	\N	\N
135	\N	1	\N	0	2025-11-03 06:13:24.050982	\N	\N
136	\N	1	\N	0	2025-11-03 06:13:25.067342	\N	\N
137	\N	1	\N	1	2025-11-03 06:13:26.085268	\N	\N
138	\N	1	\N	1	2025-11-03 06:13:27.107226	\N	\N
139	\N	1	\N	1	2025-11-03 06:13:28.112166	\N	\N
140	\N	1	\N	0	2025-11-03 06:13:29.130882	\N	\N
141	\N	1	\N	1	2025-11-03 06:13:30.144873	\N	\N
142	\N	1	\N	1	2025-11-03 06:13:31.203457	\N	\N
143	\N	1	\N	1	2025-11-03 06:13:32.266358	\N	\N
144	\N	1	\N	1	2025-11-03 06:13:33.321524	\N	\N
145	\N	1	\N	1	2025-11-03 06:13:34.33521	\N	\N
146	\N	1	\N	2	2025-11-03 06:13:35.356164	\N	\N
147	\N	1	\N	0	2025-11-03 06:13:36.427686	\N	\N
148	\N	1	\N	1	2025-11-03 06:13:37.43074	\N	\N
149	\N	1	\N	0	2025-11-03 06:13:38.446668	\N	\N
150	\N	1	\N	1	2025-11-03 06:13:39.474088	\N	\N
151	\N	1	\N	1	2025-11-03 06:13:40.503825	\N	\N
152	\N	1	\N	1	2025-11-03 06:13:41.519132	\N	\N
153	\N	1	\N	1	2025-11-03 06:13:42.547213	\N	\N
154	\N	1	\N	1	2025-11-03 06:13:43.606127	\N	\N
155	\N	1	\N	1	2025-11-03 06:13:44.631119	\N	\N
156	\N	1	\N	1	2025-11-03 06:13:45.662173	\N	\N
157	\N	1	\N	1	2025-11-03 06:13:46.684686	\N	\N
158	\N	1	\N	1	2025-11-03 06:13:47.691066	\N	\N
159	\N	1	\N	1	2025-11-03 06:13:48.732412	\N	\N
160	\N	1	\N	1	2025-11-03 06:13:49.764902	\N	\N
161	\N	1	\N	1	2025-11-03 06:13:50.787882	\N	\N
162	\N	1	\N	1	2025-11-03 06:13:51.810206	\N	\N
163	\N	1	\N	1	2025-11-03 06:13:52.836223	\N	\N
164	\N	1	\N	1	2025-11-03 06:13:53.875688	\N	\N
165	\N	1	\N	1	2025-11-03 06:13:54.908014	\N	\N
166	\N	1	\N	1	2025-11-03 06:13:55.919418	\N	\N
167	\N	1	\N	1	2025-11-03 06:13:56.936795	\N	\N
168	\N	1	\N	1	2025-11-03 06:13:57.981868	\N	\N
169	\N	1	\N	1	2025-11-03 06:13:59.043917	\N	\N
170	\N	1	\N	1	2025-11-03 06:14:00.078787	\N	\N
171	\N	1	\N	1	2025-11-03 06:14:01.093239	\N	\N
172	\N	1	\N	2	2025-11-03 06:14:02.109759	\N	\N
173	\N	1	\N	1	2025-11-03 06:14:03.138663	\N	\N
174	\N	1	\N	1	2025-11-03 06:14:04.148129	\N	\N
175	\N	1	\N	2	2025-11-03 06:14:05.171632	\N	\N
176	\N	1	\N	1	2025-11-03 06:14:06.23153	\N	\N
177	\N	1	\N	1	2025-11-03 06:14:07.277145	\N	\N
178	\N	1	\N	1	2025-11-03 06:14:08.320658	\N	\N
179	\N	1	\N	1	2025-11-03 06:14:09.338467	\N	\N
180	\N	1	\N	1	2025-11-03 06:14:10.366497	\N	\N
181	\N	1	\N	1	2025-11-03 06:14:11.385181	\N	\N
182	\N	1	\N	1	2025-11-03 06:14:12.396956	\N	\N
183	\N	1	\N	1	2025-11-03 06:14:13.408996	\N	\N
184	\N	1	\N	1	2025-11-03 06:14:14.425967	\N	\N
185	\N	1	\N	1	2025-11-03 06:14:15.51461	\N	\N
186	\N	1	\N	1	2025-11-03 06:14:16.538046	\N	\N
187	\N	1	\N	1	2025-11-03 06:14:17.544405	\N	\N
188	\N	1	\N	1	2025-11-03 06:14:18.577087	\N	\N
189	\N	1	\N	1	2025-11-03 06:14:19.600558	\N	\N
190	\N	1	\N	1	2025-11-03 06:14:20.655516	\N	\N
191	\N	1	\N	1	2025-11-03 06:14:21.660487	\N	\N
192	\N	1	\N	1	2025-11-03 06:14:22.679667	\N	\N
193	\N	1	\N	1	2025-11-03 06:14:23.722437	\N	\N
194	\N	1	\N	1	2025-11-03 06:14:24.737976	\N	\N
195	\N	1	\N	1	2025-11-03 06:14:25.799041	\N	\N
196	\N	1	\N	1	2025-11-03 06:14:26.806118	\N	\N
197	\N	1	\N	1	2025-11-03 06:14:27.813041	\N	\N
198	\N	1	\N	1	2025-11-03 06:14:28.881859	\N	\N
199	\N	1	\N	1	2025-11-03 06:14:29.937249	\N	\N
200	\N	1	\N	1	2025-11-03 06:14:30.95041	\N	\N
201	\N	1	\N	1	2025-11-03 06:14:32.044513	\N	\N
202	\N	1	\N	1	2025-11-03 06:14:33.065987	\N	\N
203	\N	1	\N	1	2025-11-03 06:14:34.123718	\N	\N
204	\N	1	\N	1	2025-11-03 06:14:35.173842	\N	\N
205	\N	1	\N	1	2025-11-03 06:14:36.238087	\N	\N
206	\N	1	\N	1	2025-11-03 06:14:37.30828	\N	\N
207	\N	1	\N	1	2025-11-03 06:14:38.338266	\N	\N
208	\N	1	\N	1	2025-11-03 06:14:39.372852	\N	\N
209	\N	1	\N	1	2025-11-03 06:14:40.400578	\N	\N
210	\N	1	\N	1	2025-11-03 06:14:41.413534	\N	\N
211	\N	1	\N	1	2025-11-03 06:14:42.464412	\N	\N
212	\N	1	\N	1	2025-11-03 06:14:43.528059	\N	\N
213	\N	1	\N	1	2025-11-03 06:14:44.545892	\N	\N
214	\N	1	\N	1	2025-11-03 06:14:45.560909	\N	\N
215	\N	1	\N	1	2025-11-03 06:14:46.572279	\N	\N
216	\N	1	\N	1	2025-11-03 06:14:47.616083	\N	\N
217	\N	1	\N	1	2025-11-03 06:14:48.62896	\N	\N
218	\N	1	\N	1	2025-11-03 06:14:49.671815	\N	\N
219	\N	1	\N	1	2025-11-03 06:14:50.679149	\N	\N
220	\N	1	\N	1	2025-11-03 06:14:51.703242	\N	\N
221	\N	1	\N	1	2025-11-03 06:14:52.739771	\N	\N
222	\N	1	\N	1	2025-11-03 06:14:53.742038	\N	\N
223	\N	1	\N	1	2025-11-03 06:14:54.76071	\N	\N
224	\N	1	\N	1	2025-11-03 06:14:55.807983	\N	\N
225	\N	1	\N	1	2025-11-03 06:14:56.882133	\N	\N
226	\N	1	\N	1	2025-11-03 06:14:57.917989	\N	\N
227	\N	1	\N	1	2025-11-03 06:14:58.979665	\N	\N
228	\N	1	\N	1	2025-11-03 06:15:00.072268	\N	\N
229	\N	1	\N	1	2025-11-03 06:15:01.079852	\N	\N
230	\N	1	\N	1	2025-11-03 06:15:02.149235	\N	\N
231	\N	1	\N	1	2025-11-03 06:15:03.207857	\N	\N
232	\N	1	\N	1	2025-11-03 06:15:04.268677	\N	\N
233	\N	1	\N	1	2025-11-03 06:15:05.339254	\N	\N
234	\N	1	\N	1	2025-11-03 06:15:06.376899	\N	\N
235	\N	1	\N	1	2025-11-03 06:15:07.415127	\N	\N
236	\N	1	\N	1	2025-11-03 06:15:41.198423	\N	\N
237	\N	1	\N	1	2025-11-03 06:15:42.249481	\N	\N
238	\N	1	\N	1	2025-11-03 06:15:43.260821	\N	\N
239	\N	1	\N	1	2025-11-03 06:15:44.31434	\N	\N
240	\N	1	\N	1	2025-11-03 06:15:45.373007	\N	\N
241	\N	1	\N	1	2025-11-03 06:15:46.405568	\N	\N
242	\N	1	\N	0	2025-11-03 06:15:47.424471	\N	\N
243	\N	1	\N	2	2025-11-03 06:15:48.484611	\N	\N
244	\N	1	\N	1	2025-11-03 06:15:49.514193	\N	\N
245	\N	1	\N	1	2025-11-03 06:15:50.555626	\N	\N
246	\N	1	\N	1	2025-11-03 06:15:51.571483	\N	\N
247	\N	1	\N	1	2025-11-03 06:15:52.582748	\N	\N
248	\N	1	\N	1	2025-11-03 06:15:53.616374	\N	\N
249	\N	1	\N	1	2025-11-03 06:15:54.653993	\N	\N
250	\N	1	\N	1	2025-11-03 06:15:55.694732	\N	\N
251	\N	1	\N	1	2025-11-03 06:15:56.682905	\N	\N
252	\N	1	\N	1	2025-11-03 06:15:57.739579	\N	\N
253	\N	1	\N	1	2025-11-03 06:15:58.744719	\N	\N
254	\N	1	\N	1	2025-11-03 06:15:59.803695	\N	\N
255	\N	1	\N	1	2025-11-03 06:16:00.884734	\N	\N
256	\N	1	\N	1	2025-11-03 06:16:01.932245	\N	\N
257	\N	1	\N	1	2025-11-03 06:16:03.150023	\N	\N
258	\N	1	\N	1	2025-11-03 06:16:04.172267	\N	\N
259	\N	1	\N	1	2025-11-03 06:16:05.203339	\N	\N
260	\N	1	\N	1	2025-11-03 07:04:11.187552	\N	\N
261	\N	1	\N	1	2025-11-03 07:04:12.257829	\N	\N
262	\N	1	\N	1	2025-11-03 07:04:13.339351	\N	\N
263	\N	1	\N	1	2025-11-03 07:04:14.390325	\N	\N
264	\N	1	\N	1	2025-11-03 07:04:15.40748	\N	\N
265	\N	1	\N	1	2025-11-03 07:04:23.268401	\N	\N
266	\N	1	\N	1	2025-11-03 07:04:24.297343	\N	\N
267	\N	1	\N	1	2025-11-03 07:04:25.314477	\N	\N
268	\N	1	\N	1	2025-11-03 07:04:26.327001	\N	\N
269	\N	1	\N	1	2025-11-03 07:04:27.35025	\N	\N
270	\N	1	\N	1	2025-11-03 07:04:28.39606	\N	\N
271	\N	1	\N	1	2025-11-03 07:04:29.433568	\N	\N
272	\N	1	\N	1	2025-11-03 07:04:30.490685	\N	\N
273	\N	1	\N	1	2025-11-03 07:04:31.554331	\N	\N
274	\N	1	\N	1	2025-11-03 07:04:32.588062	\N	\N
275	\N	1	\N	1	2025-11-03 07:04:33.645478	\N	\N
276	\N	1	\N	1	2025-11-03 07:04:34.691312	\N	\N
277	\N	1	\N	1	2025-11-03 07:05:36.232861	\N	\N
278	\N	1	\N	1	2025-11-03 07:05:37.301082	\N	\N
279	\N	1	\N	0	2025-11-03 07:05:38.358838	\N	\N
280	\N	1	\N	1	2025-11-03 07:05:39.426666	\N	\N
281	\N	1	\N	1	2025-11-03 07:05:40.432496	\N	\N
282	\N	1	\N	0	2025-11-03 07:05:41.509917	\N	\N
283	\N	1	\N	1	2025-11-03 07:05:42.570166	\N	\N
284	\N	1	\N	1	2025-11-03 07:05:43.612423	\N	\N
285	\N	1	\N	1	2025-11-03 07:05:44.689448	\N	\N
286	\N	1	\N	0	2025-11-03 07:05:45.712812	\N	\N
287	\N	1	\N	2	2025-11-03 07:05:46.757353	\N	\N
288	\N	1	\N	4	2025-11-03 07:05:47.817554	\N	\N
289	\N	1	\N	1	2025-11-03 07:05:48.850468	\N	\N
290	\N	1	\N	2	2025-11-03 07:05:49.915839	\N	\N
291	\N	1	\N	2	2025-11-03 07:05:50.955083	\N	\N
292	\N	1	\N	1	2025-11-03 07:05:52.031558	\N	\N
293	\N	1	\N	1	2025-11-03 07:05:53.085243	\N	\N
294	\N	1	\N	1	2025-11-03 07:05:54.099189	\N	\N
295	\N	1	\N	2	2025-11-03 07:05:55.111046	\N	\N
296	\N	1	\N	1	2025-11-03 07:05:56.122443	\N	\N
297	\N	1	\N	1	2025-11-03 07:05:57.13367	\N	\N
298	\N	1	\N	1	2025-11-03 07:05:58.155815	\N	\N
299	\N	1	\N	3	2025-11-03 07:05:59.181833	\N	\N
300	\N	1	\N	2	2025-11-03 07:06:00.236449	\N	\N
301	\N	1	\N	2	2025-11-03 07:06:01.266844	\N	\N
302	\N	1	\N	1	2025-11-03 07:06:02.313579	\N	\N
303	\N	1	\N	1	2025-11-03 07:06:03.369143	\N	\N
304	\N	1	\N	1	2025-11-03 07:06:04.396388	\N	\N
305	\N	1	\N	1	2025-11-03 07:06:05.423814	\N	\N
306	\N	1	\N	1	2025-11-03 07:06:06.483403	\N	\N
307	\N	1	\N	1	2025-11-03 07:06:07.514467	\N	\N
308	\N	1	\N	1	2025-11-03 07:06:08.521056	\N	\N
309	\N	1	\N	1	2025-11-03 07:06:09.537644	\N	\N
310	\N	1	\N	2	2025-11-03 07:06:10.607844	\N	\N
311	\N	1	\N	1	2025-11-03 07:06:11.616345	\N	\N
312	\N	1	\N	3	2025-11-03 07:06:12.649804	\N	\N
313	\N	1	\N	1	2025-11-03 07:06:13.693443	\N	\N
314	\N	1	\N	1	2025-11-03 07:06:14.705024	\N	\N
315	\N	1	\N	1	2025-11-03 07:06:15.709334	\N	\N
316	\N	1	\N	1	2025-11-03 07:06:16.784615	\N	\N
317	\N	1	\N	1	2025-11-03 07:06:17.787383	\N	\N
318	\N	1	\N	1	2025-11-03 07:06:18.969303	\N	\N
319	\N	1	\N	1	2025-11-03 07:06:20.033847	\N	\N
320	\N	1	\N	1	2025-11-03 07:06:21.091994	\N	\N
321	\N	1	\N	1	2025-11-03 07:06:22.152482	\N	\N
322	\N	1	\N	1	2025-11-03 07:06:23.212673	\N	\N
323	\N	1	\N	1	2025-11-03 07:06:24.232911	\N	\N
324	\N	1	\N	1	2025-11-03 07:06:25.247036	\N	\N
325	\N	1	\N	1	2025-11-03 07:06:26.282671	\N	\N
326	\N	1	\N	0	2025-11-03 07:06:27.360274	\N	\N
327	\N	1	\N	1	2025-11-03 07:06:28.381774	\N	\N
328	\N	1	\N	1	2025-11-03 07:06:29.399526	\N	\N
329	\N	1	\N	1	2025-11-03 07:06:30.469871	\N	\N
330	\N	1	\N	0	2025-11-03 07:06:31.493505	\N	\N
331	\N	1	\N	0	2025-11-03 07:06:32.522807	\N	\N
332	\N	1	\N	1	2025-11-03 07:06:33.544642	\N	\N
333	\N	1	\N	1	2025-11-03 07:06:34.597972	\N	\N
334	\N	1	\N	0	2025-11-03 07:06:35.634719	\N	\N
335	\N	1	\N	0	2025-11-03 07:06:36.684894	\N	\N
336	\N	1	\N	1	2025-11-03 07:06:37.732696	\N	\N
337	\N	1	\N	1	2025-11-03 07:06:38.773023	\N	\N
338	\N	1	\N	1	2025-11-03 07:06:39.832718	\N	\N
339	\N	1	\N	1	2025-11-03 07:06:40.821962	\N	\N
340	\N	1	\N	1	2025-11-03 07:06:41.835839	\N	\N
341	\N	1	\N	0	2025-11-03 07:06:42.865755	\N	\N
342	\N	1	\N	0	2025-11-03 07:06:43.891205	\N	\N
343	\N	1	\N	1	2025-11-03 07:06:44.890551	\N	\N
344	\N	1	\N	1	2025-11-03 07:06:45.902444	\N	\N
345	\N	1	\N	1	2025-11-03 07:06:46.944986	\N	\N
346	\N	1	\N	1	2025-11-03 07:06:47.958211	\N	\N
347	\N	1	\N	1	2025-11-03 07:06:48.983853	\N	\N
348	\N	1	\N	1	2025-11-03 07:06:50.017078	\N	\N
349	\N	1	\N	0	2025-11-03 07:06:51.057278	\N	\N
350	\N	1	\N	1	2025-11-03 07:06:52.072651	\N	\N
351	\N	1	\N	1	2025-11-03 07:06:53.101852	\N	\N
352	\N	1	\N	1	2025-11-03 07:06:54.122237	\N	\N
353	\N	1	\N	1	2025-11-03 07:06:55.143558	\N	\N
354	\N	1	\N	1	2025-11-03 07:06:56.168361	\N	\N
355	\N	1	\N	1	2025-11-03 07:06:57.225835	\N	\N
356	\N	1	\N	1	2025-11-03 07:06:58.236275	\N	\N
357	\N	1	\N	1	2025-11-03 07:06:59.238353	\N	\N
358	\N	1	\N	1	2025-11-03 07:07:00.259688	\N	\N
359	\N	1	\N	1	2025-11-03 07:07:01.27148	\N	\N
360	\N	1	\N	1	2025-11-03 07:07:02.337736	\N	\N
361	\N	1	\N	1	2025-11-03 07:07:03.344664	\N	\N
362	\N	1	\N	1	2025-11-03 07:07:12.127648	\N	\N
363	\N	1	\N	1	2025-11-03 07:07:13.187127	\N	\N
364	\N	1	\N	1	2025-11-03 07:07:14.209938	\N	\N
365	\N	1	\N	1	2025-11-03 07:07:15.229573	\N	\N
366	\N	1	\N	1	2025-11-03 07:07:45.301984	\N	\N
367	\N	1	\N	1	2025-11-03 07:07:46.328168	\N	\N
368	\N	1	\N	1	2025-11-03 07:07:47.339202	\N	\N
369	\N	1	\N	1	2025-11-03 07:07:48.367519	\N	\N
370	\N	1	\N	1	2025-11-03 07:07:49.424134	\N	\N
371	\N	1	\N	1	2025-11-03 07:07:50.481165	\N	\N
372	\N	1	\N	1	2025-11-03 07:07:51.504718	\N	\N
373	\N	1	\N	1	2025-11-03 07:07:52.530989	\N	\N
374	\N	1	\N	2	2025-11-03 07:07:53.5502	\N	\N
375	\N	1	\N	1	2025-11-03 07:07:54.57709	\N	\N
376	\N	1	\N	1	2025-11-03 07:07:55.583378	\N	\N
377	\N	1	\N	1	2025-11-03 07:07:56.603999	\N	\N
378	\N	1	\N	1	2025-11-03 07:07:57.631496	\N	\N
379	\N	1	\N	1	2025-11-03 07:07:58.653416	\N	\N
380	\N	1	\N	1	2025-11-03 07:07:59.737853	\N	\N
381	\N	1	\N	1	2025-11-03 07:08:11.209195	\N	\N
382	\N	1	\N	1	2025-11-03 07:08:12.282014	\N	\N
383	\N	1	\N	1	2025-11-03 07:08:13.355244	\N	\N
384	\N	1	\N	1	2025-11-03 07:08:14.39827	\N	\N
385	\N	1	\N	1	2025-11-03 07:08:15.397771	\N	\N
386	\N	1	\N	1	2025-11-03 07:08:16.449589	\N	\N
387	\N	1	\N	1	2025-11-03 07:08:17.517979	\N	\N
388	\N	1	\N	1	2025-11-03 07:08:18.583118	\N	\N
389	\N	1	\N	1	2025-11-03 07:08:19.611462	\N	\N
390	\N	1	\N	1	2025-11-03 07:08:20.716096	\N	\N
391	\N	1	\N	1	2025-11-03 07:08:21.765123	\N	\N
392	\N	1	\N	1	2025-11-03 07:08:22.889792	\N	\N
393	\N	1	\N	1	2025-11-03 07:08:23.922266	\N	\N
394	\N	1	\N	1	2025-11-03 07:08:24.997092	\N	\N
395	\N	1	\N	1	2025-11-03 07:08:26.056713	\N	\N
396	\N	1	\N	1	2025-11-03 07:08:27.095143	\N	\N
397	\N	1	\N	1	2025-11-03 07:08:28.098121	\N	\N
398	\N	1	\N	1	2025-11-03 07:08:29.12287	\N	\N
399	\N	1	\N	1	2025-11-03 07:08:30.1743	\N	\N
400	\N	1	\N	1	2025-11-03 07:08:31.201117	\N	\N
401	\N	1	\N	1	2025-11-03 07:08:32.269281	\N	\N
402	\N	1	\N	1	2025-11-03 07:08:33.275128	\N	\N
403	\N	1	\N	1	2025-11-03 07:08:34.364298	\N	\N
404	\N	1	\N	1	2025-11-03 07:08:35.395362	\N	\N
405	\N	1	\N	1	2025-11-03 07:08:36.460787	\N	\N
406	\N	1	\N	1	2025-11-03 07:08:37.474118	\N	\N
407	\N	1	\N	1	2025-11-03 07:08:38.567225	\N	\N
408	\N	1	\N	1	2025-11-03 07:08:39.699042	\N	\N
409	\N	1	\N	0	2025-11-03 07:08:40.75825	\N	\N
410	\N	1	\N	1	2025-11-03 07:08:41.826962	\N	\N
411	\N	1	\N	0	2025-11-03 07:08:42.903494	\N	\N
412	\N	1	\N	0	2025-11-03 07:08:43.935469	\N	\N
413	\N	1	\N	0	2025-11-03 07:08:44.962473	\N	\N
414	\N	1	\N	0	2025-11-03 07:08:46.013158	\N	\N
415	\N	1	\N	1	2025-11-03 07:08:47.05112	\N	\N
416	\N	1	\N	1	2025-11-03 07:08:48.131156	\N	\N
417	\N	1	\N	0	2025-11-03 07:08:49.190985	\N	\N
418	\N	1	\N	0	2025-11-03 07:08:50.270695	\N	\N
419	\N	1	\N	0	2025-11-03 07:08:51.30525	\N	\N
420	\N	1	\N	0	2025-11-03 07:08:52.332923	\N	\N
421	\N	1	\N	0	2025-11-03 07:08:53.399288	\N	\N
422	\N	1	\N	0	2025-11-03 07:08:54.426805	\N	\N
423	\N	1	\N	0	2025-11-03 07:08:55.448169	\N	\N
424	\N	1	\N	0	2025-11-03 07:08:56.458152	\N	\N
425	\N	1	\N	0	2025-11-03 07:08:57.494799	\N	\N
426	\N	1	\N	0	2025-11-03 07:08:58.527999	\N	\N
427	\N	1	\N	0	2025-11-03 07:08:59.55709	\N	\N
428	\N	1	\N	0	2025-11-03 07:09:00.580945	\N	\N
429	\N	1	\N	0	2025-11-03 07:09:01.631008	\N	\N
430	\N	1	\N	0	2025-11-03 07:09:02.717668	\N	\N
431	\N	1	\N	0	2025-11-03 07:09:03.794613	\N	\N
432	\N	1	\N	0	2025-11-03 07:09:04.822076	\N	\N
433	\N	1	\N	0	2025-11-03 07:09:05.898557	\N	\N
434	\N	1	\N	0	2025-11-03 07:09:06.956605	\N	\N
435	\N	1	\N	0	2025-11-03 07:09:07.968588	\N	\N
436	\N	1	\N	0	2025-11-03 07:09:09.045059	\N	\N
437	\N	1	\N	0	2025-11-03 07:09:10.105764	\N	\N
438	\N	1	\N	0	2025-11-03 07:09:11.17522	\N	\N
439	\N	1	\N	0	2025-11-03 07:09:12.186399	\N	\N
440	\N	1	\N	0	2025-11-03 07:09:13.229453	\N	\N
441	\N	1	\N	0	2025-11-03 07:09:14.290846	\N	\N
442	\N	1	\N	0	2025-11-03 07:09:15.326419	\N	\N
443	\N	1	\N	0	2025-11-03 07:09:16.33291	\N	\N
444	\N	1	\N	0	2025-11-03 07:09:17.364228	\N	\N
445	\N	1	\N	0	2025-11-03 07:09:18.375552	\N	\N
446	\N	1	\N	0	2025-11-03 07:09:19.393366	\N	\N
447	\N	1	\N	0	2025-11-03 07:09:20.412496	\N	\N
448	\N	1	\N	0	2025-11-03 07:09:21.474338	\N	\N
449	\N	1	\N	0	2025-11-03 07:09:22.548044	\N	\N
450	\N	1	\N	0	2025-11-03 07:09:23.568176	\N	\N
451	\N	1	\N	0	2025-11-03 07:09:24.59402	\N	\N
452	\N	1	\N	0	2025-11-03 07:09:25.600967	\N	\N
453	\N	1	\N	0	2025-11-03 07:09:26.625315	\N	\N
454	\N	1	\N	0	2025-11-03 07:09:27.638743	\N	\N
455	\N	1	\N	0	2025-11-03 07:09:28.652521	\N	\N
456	\N	1	\N	0	2025-11-03 07:09:29.67637	\N	\N
457	\N	1	\N	0	2025-11-03 07:09:30.67915	\N	\N
458	\N	1	\N	0	2025-11-03 07:09:31.703356	\N	\N
459	\N	1	\N	0	2025-11-03 07:09:32.727225	\N	\N
460	\N	1	\N	0	2025-11-03 07:09:33.741316	\N	\N
461	\N	1	\N	0	2025-11-03 07:09:34.78352	\N	\N
462	\N	1	\N	0	2025-11-03 07:09:35.842217	\N	\N
463	\N	1	\N	0	2025-11-03 07:09:36.935658	\N	\N
464	\N	1	\N	0	2025-11-03 07:09:37.93337	\N	\N
465	\N	1	\N	0	2025-11-03 07:09:38.978325	\N	\N
466	\N	1	\N	0	2025-11-03 07:09:40.053843	\N	\N
467	\N	1	\N	0	2025-11-03 07:09:41.119205	\N	\N
468	\N	1	\N	0	2025-11-03 07:09:42.178907	\N	\N
469	\N	1	\N	0	2025-11-03 07:09:43.235899	\N	\N
470	\N	1	\N	0	2025-11-03 07:09:44.278098	\N	\N
471	\N	1	\N	0	2025-11-03 07:09:45.37462	\N	\N
472	\N	1	\N	0	2025-11-03 07:09:46.412087	\N	\N
473	\N	1	\N	0	2025-11-03 07:09:47.433376	\N	\N
474	\N	1	\N	0	2025-11-03 07:09:48.473666	\N	\N
475	\N	1	\N	0	2025-11-03 07:09:49.490804	\N	\N
476	\N	1	\N	0	2025-11-03 07:09:50.53016	\N	\N
477	\N	1	\N	0	2025-11-03 07:09:51.547109	\N	\N
478	\N	1	\N	0	2025-11-03 07:09:52.564476	\N	\N
479	\N	1	\N	0	2025-11-03 07:09:53.587618	\N	\N
480	\N	1	\N	0	2025-11-03 07:09:54.601062	\N	\N
481	\N	1	\N	0	2025-11-03 07:09:55.632162	\N	\N
482	\N	1	\N	0	2025-11-03 07:09:56.657136	\N	\N
483	\N	1	\N	0	2025-11-03 07:09:57.672942	\N	\N
484	\N	1	\N	0	2025-11-03 07:09:58.683066	\N	\N
485	\N	1	\N	0	2025-11-03 07:09:59.712074	\N	\N
486	\N	1	\N	0	2025-11-03 07:10:00.721945	\N	\N
487	\N	1	\N	0	2025-11-03 07:10:01.765683	\N	\N
488	\N	1	\N	0	2025-11-03 07:10:02.791884	\N	\N
489	\N	1	\N	0	2025-11-03 07:10:03.809322	\N	\N
490	\N	1	\N	0	2025-11-03 07:10:04.81874	\N	\N
491	\N	1	\N	0	2025-11-03 07:10:05.848397	\N	\N
492	\N	1	\N	0	2025-11-03 07:10:06.87569	\N	\N
493	\N	1	\N	0	2025-11-03 07:10:07.890366	\N	\N
494	\N	1	\N	0	2025-11-03 07:10:08.90679	\N	\N
495	\N	1	\N	0	2025-11-03 07:10:09.949086	\N	\N
496	\N	1	\N	0	2025-11-03 07:10:11.009098	\N	\N
497	\N	1	\N	0	2025-11-03 07:10:12.084254	\N	\N
498	\N	1	\N	0	2025-11-03 07:10:13.116966	\N	\N
499	\N	1	\N	0	2025-11-03 07:10:14.142338	\N	\N
500	\N	1	\N	1	2025-11-03 07:10:15.168789	\N	\N
501	\N	1	\N	2	2025-11-03 07:10:16.17627	\N	\N
502	\N	1	\N	1	2025-11-03 07:10:17.225029	\N	\N
503	\N	1	\N	1	2025-11-03 07:10:18.244826	\N	\N
504	\N	1	\N	1	2025-11-03 07:10:19.300121	\N	\N
505	\N	1	\N	1	2025-11-03 07:10:20.31315	\N	\N
506	\N	1	\N	1	2025-11-03 07:15:25.154129	\N	\N
507	\N	1	\N	1	2025-11-03 07:15:26.207859	\N	\N
508	\N	1	\N	1	2025-11-03 07:15:27.267752	\N	\N
509	\N	1	\N	1	2025-11-03 07:15:28.300141	\N	\N
510	\N	1	\N	1	2025-11-03 07:15:29.315372	\N	\N
511	\N	1	\N	2	2025-11-03 07:15:30.343026	\N	\N
512	\N	1	\N	1	2025-11-03 07:15:31.412839	\N	\N
513	\N	1	\N	1	2025-11-03 07:15:32.439025	\N	\N
514	\N	1	\N	1	2025-11-03 07:15:33.480623	\N	\N
515	\N	1	\N	1	2025-11-03 07:15:34.489804	\N	\N
516	\N	1	\N	1	2025-11-03 07:15:35.50295	\N	\N
517	\N	1	\N	1	2025-11-03 07:15:36.559251	\N	\N
518	\N	1	\N	1	2025-11-03 07:15:37.579255	\N	\N
519	\N	1	\N	1	2025-11-03 07:15:38.597757	\N	\N
520	\N	1	\N	1	2025-11-03 07:15:48.603564	\N	\N
521	\N	1	\N	1	2025-11-03 07:15:49.65942	\N	\N
522	\N	1	\N	1	2025-11-03 07:15:50.733788	\N	\N
523	\N	1	\N	1	2025-11-03 07:16:16.005355	\N	\N
524	\N	1	\N	1	2025-11-03 07:16:17.051173	\N	\N
525	\N	1	\N	1	2025-11-03 07:16:18.091498	\N	\N
526	\N	1	\N	1	2025-11-03 07:16:19.112234	\N	\N
527	\N	1	\N	1	2025-11-03 07:16:20.154582	\N	\N
528	\N	1	\N	1	2025-11-03 07:16:21.211051	\N	\N
529	\N	1	\N	1	2025-11-03 07:16:22.264505	\N	\N
530	\N	1	\N	1	2025-11-03 07:16:23.294123	\N	\N
531	\N	1	\N	1	2025-11-03 07:16:24.321799	\N	\N
532	\N	1	\N	1	2025-11-03 07:16:25.356589	\N	\N
533	\N	1	\N	1	2025-11-03 07:16:26.382215	\N	\N
534	\N	1	\N	1	2025-11-03 07:16:27.40779	\N	\N
535	\N	1	\N	1	2025-11-03 07:16:28.421299	\N	\N
536	\N	1	\N	1	2025-11-03 07:16:29.43364	\N	\N
537	\N	1	\N	1	2025-11-03 07:16:30.475928	\N	\N
538	\N	1	\N	1	2025-11-03 07:16:31.517152	\N	\N
539	\N	1	\N	1	2025-11-03 07:16:32.53051	\N	\N
540	\N	1	\N	1	2025-11-03 07:16:33.559785	\N	\N
541	\N	1	\N	2	2025-11-03 07:16:34.575525	\N	\N
542	\N	1	\N	1	2025-11-03 07:16:35.593495	\N	\N
543	\N	1	\N	0	2025-11-03 07:16:36.614618	\N	\N
544	\N	1	\N	1	2025-11-03 07:16:37.697118	\N	\N
545	\N	1	\N	1	2025-11-03 07:16:38.780769	\N	\N
546	\N	1	\N	1	2025-11-03 07:16:39.794739	\N	\N
547	\N	1	\N	1	2025-11-03 07:16:45.711858	\N	\N
548	\N	1	\N	1	2025-11-03 07:16:46.736248	\N	\N
549	\N	1	\N	1	2025-11-03 07:16:47.802374	\N	\N
550	\N	1	\N	1	2025-11-03 07:16:48.81271	\N	\N
551	\N	1	\N	1	2025-11-03 07:16:49.865652	\N	\N
552	\N	1	\N	1	2025-11-03 07:16:58.465788	\N	\N
553	\N	1	\N	1	2025-11-03 07:16:59.46516	\N	\N
554	\N	1	\N	1	2025-11-03 07:17:00.539893	\N	\N
555	\N	1	\N	1	2025-11-03 07:17:01.586164	\N	\N
556	\N	1	\N	1	2025-11-03 07:17:02.606073	\N	\N
557	\N	1	\N	1	2025-11-03 07:17:10.804728	\N	\N
558	\N	1	\N	1	2025-11-03 07:17:11.820535	\N	\N
559	\N	1	\N	1	2025-11-03 07:17:12.865682	\N	\N
560	\N	1	\N	1	2025-11-03 07:17:13.928028	\N	\N
561	\N	1	\N	0	2025-11-03 07:17:15.020644	\N	\N
562	\N	1	\N	0	2025-11-03 07:17:16.042159	\N	\N
563	\N	1	\N	0	2025-11-03 07:17:17.09728	\N	\N
564	\N	1	\N	0	2025-11-03 07:17:18.170678	\N	\N
565	\N	1	\N	0	2025-11-03 07:17:19.243934	\N	\N
566	\N	1	\N	0	2025-11-03 07:17:20.309145	\N	\N
567	\N	1	\N	0	2025-11-03 07:17:21.353251	\N	\N
568	\N	1	\N	0	2025-11-03 07:17:22.412768	\N	\N
569	\N	1	\N	0	2025-11-03 07:17:23.465602	\N	\N
570	\N	1	\N	1	2025-11-03 07:17:24.481983	\N	\N
571	\N	1	\N	1	2025-11-03 07:17:25.523085	\N	\N
572	\N	1	\N	1	2025-11-03 07:17:26.556256	\N	\N
573	\N	1	\N	0	2025-11-03 07:17:27.573548	\N	\N
574	\N	1	\N	0	2025-11-03 07:17:28.583438	\N	\N
575	\N	1	\N	0	2025-11-03 07:17:29.612066	\N	\N
576	\N	1	\N	1	2025-11-03 07:17:30.618956	\N	\N
577	\N	1	\N	1	2025-11-03 07:17:31.689671	\N	\N
578	\N	1	\N	1	2025-11-03 07:17:40.546845	\N	\N
579	\N	1	\N	1	2025-11-03 07:17:41.570782	\N	\N
580	\N	1	\N	1	2025-11-03 07:17:42.580411	\N	\N
581	\N	1	\N	1	2025-11-03 07:17:43.604194	\N	\N
582	\N	1	\N	1	2025-11-03 07:17:44.62896	\N	\N
583	\N	1	\N	0	2025-11-03 07:17:45.643058	\N	\N
584	\N	1	\N	0	2025-11-03 07:17:46.654636	\N	\N
585	\N	1	\N	0	2025-11-03 07:17:47.704128	\N	\N
586	\N	1	\N	0	2025-11-03 07:17:48.729439	\N	\N
587	\N	1	\N	1	2025-11-03 07:17:49.768831	\N	\N
588	\N	1	\N	1	2025-11-03 07:17:55.258919	\N	\N
589	\N	1	\N	0	2025-11-03 07:17:56.283092	\N	\N
590	\N	1	\N	0	2025-11-03 07:17:57.32342	\N	\N
591	\N	1	\N	0	2025-11-03 07:18:04.642143	\N	\N
592	\N	1	\N	1	2025-11-03 07:18:05.67913	\N	\N
593	\N	1	\N	0	2025-11-03 07:18:06.719849	\N	\N
594	\N	1	\N	0	2025-11-03 07:18:07.747891	\N	\N
595	\N	1	\N	0	2025-11-03 07:18:08.757596	\N	\N
596	\N	1	\N	0	2025-11-03 07:18:09.85252	\N	\N
597	\N	1	\N	1	2025-11-03 07:18:10.854469	\N	\N
598	\N	1	\N	1	2025-11-03 07:18:11.900289	\N	\N
599	\N	1	\N	1	2025-11-03 07:18:12.948849	\N	\N
600	\N	1	\N	1	2025-11-03 07:18:13.965349	\N	\N
601	\N	1	\N	0	2025-11-03 07:18:14.980087	\N	\N
602	\N	1	\N	0	2025-11-03 07:18:16.005984	\N	\N
603	\N	1	\N	1	2025-11-03 07:18:17.007201	\N	\N
604	\N	1	\N	1	2025-11-03 07:18:18.041882	\N	\N
605	\N	1	\N	1	2025-11-03 07:18:19.059693	\N	\N
606	\N	1	\N	0	2025-11-03 07:18:28.40453	\N	\N
607	\N	1	\N	0	2025-11-03 07:18:29.439513	\N	\N
608	\N	1	\N	0	2025-11-03 07:18:30.44826	\N	\N
609	\N	1	\N	0	2025-11-03 07:18:31.477874	\N	\N
610	\N	1	\N	0	2025-11-03 07:18:32.531136	\N	\N
611	\N	1	\N	0	2025-11-03 07:18:33.536757	\N	\N
612	\N	1	\N	0	2025-11-03 07:18:34.566837	\N	\N
613	\N	1	\N	0	2025-11-03 07:18:35.581724	\N	\N
614	\N	1	\N	0	2025-11-03 07:18:36.599692	\N	\N
615	\N	1	\N	0	2025-11-03 07:18:37.628364	\N	\N
616	\N	1	\N	0	2025-11-03 07:18:38.631406	\N	\N
617	\N	1	\N	0	2025-11-03 07:18:39.727652	\N	\N
618	\N	1	\N	0	2025-11-03 07:18:40.777589	\N	\N
619	\N	1	\N	0	2025-11-03 07:18:41.826805	\N	\N
620	\N	1	\N	0	2025-11-03 07:18:42.849255	\N	\N
621	\N	1	\N	0	2025-11-03 07:18:43.888226	\N	\N
622	\N	1	\N	0	2025-11-03 07:18:44.907281	\N	\N
623	\N	1	\N	0	2025-11-03 07:18:45.926888	\N	\N
624	\N	1	\N	0	2025-11-03 07:18:46.941361	\N	\N
625	\N	1	\N	0	2025-11-03 07:18:48.030003	\N	\N
626	\N	1	\N	0	2025-11-03 07:18:49.052941	\N	\N
627	\N	1	\N	0	2025-11-03 07:18:50.07958	\N	\N
628	\N	1	\N	0	2025-11-03 07:18:51.159031	\N	\N
629	\N	1	\N	0	2025-11-03 07:18:52.204202	\N	\N
630	\N	1	\N	0	2025-11-03 07:18:53.248659	\N	\N
631	\N	1	\N	0	2025-11-03 07:18:54.274231	\N	\N
632	\N	1	\N	0	2025-11-03 07:18:55.309238	\N	\N
633	\N	1	\N	0	2025-11-03 07:18:56.339076	\N	\N
634	\N	1	\N	0	2025-11-03 07:18:57.363679	\N	\N
635	\N	1	\N	0	2025-11-03 07:18:58.425056	\N	\N
636	\N	1	\N	0	2025-11-03 07:18:59.43914	\N	\N
637	\N	1	\N	0	2025-11-03 07:19:00.501641	\N	\N
638	\N	1	\N	0	2025-11-03 07:19:01.559401	\N	\N
639	\N	1	\N	0	2025-11-03 07:19:02.592606	\N	\N
640	\N	1	\N	0	2025-11-03 07:19:03.654571	\N	\N
641	\N	1	\N	0	2025-11-03 07:19:04.682398	\N	\N
642	\N	1	\N	0	2025-11-03 07:19:05.704562	\N	\N
643	\N	1	\N	0	2025-11-03 07:19:06.714253	\N	\N
644	\N	1	\N	0	2025-11-03 07:19:07.726687	\N	\N
645	\N	1	\N	0	2025-11-03 07:19:08.737826	\N	\N
646	\N	1	\N	0	2025-11-03 07:19:09.776845	\N	\N
647	\N	1	\N	0	2025-11-03 07:19:10.772953	\N	\N
648	\N	1	\N	0	2025-11-03 07:19:11.779753	\N	\N
649	\N	1	\N	0	2025-11-03 07:19:12.820817	\N	\N
650	\N	1	\N	0	2025-11-03 07:19:13.922248	\N	\N
651	\N	1	\N	0	2025-11-03 07:19:14.950444	\N	\N
652	\N	1	\N	0	2025-11-03 07:19:16.018842	\N	\N
653	\N	1	\N	0	2025-11-03 07:19:17.035549	\N	\N
654	\N	1	\N	0	2025-11-03 07:19:18.070221	\N	\N
655	\N	1	\N	0	2025-11-03 07:19:19.111738	\N	\N
656	\N	1	\N	0	2025-11-03 07:19:20.155412	\N	\N
657	\N	1	\N	0	2025-11-03 07:19:21.16446	\N	\N
658	\N	1	\N	0	2025-11-03 07:19:22.19541	\N	\N
659	\N	1	\N	0	2025-11-03 07:19:23.224869	\N	\N
660	\N	1	\N	0	2025-11-03 07:19:24.245131	\N	\N
661	\N	1	\N	0	2025-11-03 07:19:25.263705	\N	\N
662	\N	1	\N	0	2025-11-03 07:19:26.28454	\N	\N
663	\N	1	\N	0	2025-11-03 07:19:27.322833	\N	\N
664	\N	1	\N	0	2025-11-03 07:19:28.344896	\N	\N
665	\N	1	\N	0	2025-11-03 07:19:29.409048	\N	\N
666	\N	1	\N	0	2025-11-03 07:19:30.45168	\N	\N
667	\N	1	\N	0	2025-11-03 07:19:31.499771	\N	\N
668	\N	1	\N	0	2025-11-03 07:19:32.510628	\N	\N
669	\N	1	\N	0	2025-11-03 07:19:33.557593	\N	\N
670	\N	1	\N	0	2025-11-03 07:19:34.608177	\N	\N
671	\N	1	\N	0	2025-11-03 07:19:35.631789	\N	\N
672	\N	1	\N	0	2025-11-03 07:19:36.656717	\N	\N
673	\N	1	\N	0	2025-11-03 07:19:37.661538	\N	\N
674	\N	1	\N	0	2025-11-03 07:19:38.676973	\N	\N
675	\N	1	\N	0	2025-11-03 07:19:39.691235	\N	\N
676	\N	1	\N	0	2025-11-03 07:19:40.721551	\N	\N
677	\N	1	\N	0	2025-11-03 07:19:41.720769	\N	\N
678	\N	1	\N	0	2025-11-03 07:19:42.733045	\N	\N
679	\N	1	\N	0	2025-11-03 07:19:43.766809	\N	\N
680	\N	1	\N	0	2025-11-03 07:19:44.784677	\N	\N
681	\N	1	\N	0	2025-11-03 07:19:45.808838	\N	\N
682	\N	1	\N	0	2025-11-03 07:19:46.873418	\N	\N
683	\N	1	\N	0	2025-11-03 07:19:47.899057	\N	\N
684	\N	1	\N	0	2025-11-03 07:19:48.978742	\N	\N
685	\N	1	\N	0	2025-11-03 07:19:50.023244	\N	\N
686	\N	1	\N	0	2025-11-03 07:19:51.083962	\N	\N
687	\N	1	\N	0	2025-11-03 07:19:52.12326	\N	\N
688	\N	1	\N	0	2025-11-03 07:19:53.176562	\N	\N
689	\N	1	\N	0	2025-11-03 07:19:54.207616	\N	\N
690	\N	1	\N	0	2025-11-03 07:19:55.229976	\N	\N
691	\N	1	\N	0	2025-11-03 07:19:56.254262	\N	\N
692	\N	1	\N	0	2025-11-03 07:19:57.300496	\N	\N
693	\N	1	\N	0	2025-11-03 07:19:58.352862	\N	\N
694	\N	1	\N	0	2025-11-03 07:19:59.362243	\N	\N
695	\N	1	\N	0	2025-11-03 07:20:00.412897	\N	\N
696	\N	1	\N	0	2025-11-03 07:20:01.419097	\N	\N
697	\N	1	\N	0	2025-11-03 07:20:02.463249	\N	\N
698	\N	1	\N	0	2025-11-03 07:20:03.512338	\N	\N
699	\N	1	\N	0	2025-11-03 07:20:04.60189	\N	\N
700	\N	1	\N	0	2025-11-03 07:20:05.63827	\N	\N
701	\N	1	\N	0	2025-11-03 07:20:06.648508	\N	\N
702	\N	1	\N	0	2025-11-03 07:20:07.666313	\N	\N
703	\N	1	\N	0	2025-11-03 07:20:08.711221	\N	\N
704	\N	1	\N	1	2025-11-03 07:20:09.725661	\N	\N
705	\N	1	\N	0	2025-11-03 07:20:10.790017	\N	\N
706	\N	1	\N	0	2025-11-03 07:20:11.826343	\N	\N
707	\N	1	\N	0	2025-11-03 07:20:12.882349	\N	\N
708	\N	1	\N	0	2025-11-03 07:20:13.929319	\N	\N
709	\N	1	\N	0	2025-11-03 07:20:14.98829	\N	\N
710	\N	1	\N	0	2025-11-03 07:20:16.018662	\N	\N
711	\N	1	\N	0	2025-11-03 07:20:17.098996	\N	\N
712	\N	1	\N	0	2025-11-03 07:20:18.169351	\N	\N
713	\N	1	\N	1	2025-11-03 07:20:19.211469	\N	\N
714	\N	1	\N	1	2025-11-03 07:20:20.284031	\N	\N
715	\N	1	\N	1	2025-11-03 07:20:21.353473	\N	\N
716	\N	1	\N	1	2025-11-03 07:20:22.414583	\N	\N
717	\N	1	\N	1	2025-11-03 07:20:23.479037	\N	\N
718	\N	1	\N	1	2025-11-03 07:20:24.502582	\N	\N
719	\N	1	\N	1	2025-11-03 07:20:25.535727	\N	\N
720	\N	1	\N	1	2025-11-03 07:20:26.563631	\N	\N
721	\N	1	\N	1	2025-11-03 07:20:27.593045	\N	\N
722	\N	1	\N	1	2025-11-03 07:20:28.663173	\N	\N
723	\N	1	\N	1	2025-11-03 07:20:29.689453	\N	\N
724	\N	1	\N	1	2025-11-03 07:20:30.757497	\N	\N
725	\N	1	\N	1	2025-11-03 07:20:31.789524	\N	\N
726	\N	1	\N	1	2025-11-03 07:20:32.806333	\N	\N
727	\N	1	\N	1	2025-11-03 07:20:33.819468	\N	\N
728	\N	1	\N	1	2025-11-03 07:20:34.865782	\N	\N
729	\N	1	\N	1	2025-11-03 07:20:35.872126	\N	\N
730	\N	1	\N	1	2025-11-03 07:20:36.900914	\N	\N
731	\N	1	\N	1	2025-11-03 07:20:37.981933	\N	\N
732	\N	1	\N	1	2025-11-03 07:20:39.015269	\N	\N
733	\N	1	\N	1	2025-11-03 07:20:40.041783	\N	\N
734	\N	1	\N	1	2025-11-03 07:20:41.054443	\N	\N
735	\N	1	\N	1	2025-11-03 07:20:42.099308	\N	\N
736	\N	1	\N	1	2025-11-03 07:20:43.134971	\N	\N
737	\N	1	\N	1	2025-11-03 07:20:44.181726	\N	\N
738	\N	1	\N	1	2025-11-03 07:20:45.202193	\N	\N
739	\N	1	\N	1	2025-11-03 07:20:46.224152	\N	\N
740	\N	1	\N	1	2025-11-03 07:20:47.260097	\N	\N
741	\N	1	\N	1	2025-11-03 07:20:48.281543	\N	\N
742	\N	1	\N	1	2025-11-03 07:20:49.314234	\N	\N
743	\N	1	\N	1	2025-11-03 07:20:50.334635	\N	\N
744	\N	1	\N	1	2025-11-03 07:20:51.392735	\N	\N
745	\N	1	\N	1	2025-11-03 07:20:52.422686	\N	\N
746	\N	1	\N	1	2025-11-03 07:20:53.466091	\N	\N
747	\N	1	\N	1	2025-11-03 07:20:54.481696	\N	\N
748	\N	1	\N	1	2025-11-03 07:20:55.494152	\N	\N
749	\N	1	\N	1	2025-11-03 07:20:56.507594	\N	\N
750	\N	1	\N	1	2025-11-03 07:20:57.517564	\N	\N
751	\N	1	\N	1	2025-11-03 07:20:58.583804	\N	\N
752	\N	1	\N	1	2025-11-03 07:20:59.61561	\N	\N
753	\N	1	\N	1	2025-11-03 07:21:00.658075	\N	\N
754	\N	1	\N	1	2025-11-03 07:21:01.712569	\N	\N
755	\N	1	\N	1	2025-11-03 07:21:02.724511	\N	\N
756	\N	1	\N	1	2025-11-03 07:21:03.754799	\N	\N
757	\N	1	\N	1	2025-11-03 07:21:04.787193	\N	\N
758	\N	1	\N	1	2025-11-03 07:21:05.827381	\N	\N
759	\N	1	\N	1	2025-11-03 07:21:06.87481	\N	\N
760	\N	1	\N	1	2025-11-03 07:21:07.926252	\N	\N
761	\N	1	\N	1	2025-11-03 07:21:08.991855	\N	\N
762	\N	1	\N	1	2025-11-03 07:21:10.050981	\N	\N
763	\N	1	\N	1	2025-11-03 07:21:11.09559	\N	\N
764	\N	1	\N	1	2025-11-03 07:21:12.099523	\N	\N
765	\N	1	\N	1	2025-11-03 07:21:13.126703	\N	\N
766	\N	1	\N	1	2025-11-03 07:21:14.147174	\N	\N
767	\N	1	\N	1	2025-11-03 07:21:15.168857	\N	\N
768	\N	1	\N	1	2025-11-03 07:21:16.199968	\N	\N
769	\N	1	\N	1	2025-11-03 07:21:17.236344	\N	\N
770	\N	1	\N	1	2025-11-03 07:21:18.285383	\N	\N
771	\N	1	\N	1	2025-11-03 07:21:19.304	\N	\N
772	\N	1	\N	1	2025-11-03 07:21:20.378758	\N	\N
773	\N	1	\N	1	2025-11-03 07:21:21.383035	\N	\N
774	\N	1	\N	1	2025-11-03 07:21:22.461651	\N	\N
775	\N	1	\N	1	2025-11-03 07:21:23.514826	\N	\N
776	\N	1	\N	1	2025-11-03 07:21:24.572519	\N	\N
777	\N	1	\N	1	2025-11-03 07:21:25.629469	\N	\N
778	\N	1	\N	1	2025-11-03 07:21:26.7268	\N	\N
779	\N	1	\N	1	2025-11-03 07:21:27.760334	\N	\N
780	\N	1	\N	1	2025-11-03 07:21:28.820945	\N	\N
781	\N	1	\N	1	2025-11-03 07:21:29.885581	\N	\N
782	\N	1	\N	1	2025-11-03 07:21:30.961976	\N	\N
783	\N	1	\N	1	2025-11-03 07:21:31.962506	\N	\N
784	\N	1	\N	1	2025-11-03 07:21:33.014233	\N	\N
785	\N	1	\N	1	2025-11-03 07:21:34.072512	\N	\N
786	\N	1	\N	1	2025-11-03 07:21:35.094346	\N	\N
787	\N	1	\N	1	2025-11-03 07:21:36.127799	\N	\N
788	\N	1	\N	1	2025-11-03 07:21:37.184174	\N	\N
789	\N	1	\N	1	2025-11-03 07:21:38.246951	\N	\N
790	\N	1	\N	1	2025-11-03 07:21:39.340043	\N	\N
791	\N	1	\N	1	2025-11-03 07:21:40.375661	\N	\N
792	\N	1	\N	1	2025-11-03 07:21:41.426622	\N	\N
793	\N	1	\N	1	2025-11-03 07:21:42.496358	\N	\N
794	\N	1	\N	1	2025-11-03 07:21:43.556415	\N	\N
795	\N	1	\N	1	2025-11-03 07:21:44.586825	\N	\N
796	\N	1	\N	1	2025-11-03 07:21:45.612066	\N	\N
797	\N	1	\N	1	2025-11-03 07:21:46.628506	\N	\N
798	\N	1	\N	1	2025-11-03 07:21:47.652522	\N	\N
799	\N	1	\N	1	2025-11-03 07:21:48.661864	\N	\N
800	\N	1	\N	1	2025-11-03 07:21:49.677207	\N	\N
801	\N	1	\N	1	2025-11-03 07:21:50.746397	\N	\N
802	\N	1	\N	1	2025-11-03 07:21:51.753904	\N	\N
803	\N	1	\N	1	2025-11-03 07:21:52.796849	\N	\N
804	\N	1	\N	1	2025-11-03 07:21:53.800939	\N	\N
805	\N	1	\N	1	2025-11-03 07:21:54.84289	\N	\N
806	\N	1	\N	1	2025-11-03 07:21:55.896277	\N	\N
807	\N	1	\N	1	2025-11-03 07:21:56.922598	\N	\N
808	\N	1	\N	1	2025-11-03 07:21:57.973696	\N	\N
809	\N	1	\N	1	2025-11-03 07:21:59.038033	\N	\N
810	\N	1	\N	1	2025-11-03 07:22:00.057264	\N	\N
811	\N	1	\N	1	2025-11-03 07:22:01.059819	\N	\N
812	\N	1	\N	1	2025-11-03 07:22:02.091851	\N	\N
813	\N	1	\N	1	2025-11-03 07:22:03.133578	\N	\N
814	\N	1	\N	1	2025-11-03 07:22:04.158098	\N	\N
815	\N	1	\N	1	2025-11-03 07:22:05.171965	\N	\N
816	\N	1	\N	1	2025-11-03 07:22:06.179719	\N	\N
817	\N	1	\N	1	2025-11-03 07:22:07.201803	\N	\N
818	\N	1	\N	1	2025-11-03 07:22:08.217655	\N	\N
819	\N	1	\N	1	2025-11-03 07:22:09.22775	\N	\N
820	\N	1	\N	1	2025-11-03 07:22:10.245762	\N	\N
821	\N	1	\N	1	2025-11-03 07:22:11.284153	\N	\N
822	\N	1	\N	1	2025-11-03 07:22:12.294155	\N	\N
823	\N	1	\N	1	2025-11-03 07:22:13.349452	\N	\N
824	\N	1	\N	1	2025-11-03 07:22:14.365102	\N	\N
825	\N	1	\N	1	2025-11-03 07:22:15.39247	\N	\N
826	\N	1	\N	1	2025-11-03 07:22:16.433343	\N	\N
827	\N	1	\N	1	2025-11-03 07:22:17.451255	\N	\N
828	\N	1	\N	1	2025-11-03 07:22:18.496447	\N	\N
829	\N	1	\N	1	2025-11-03 07:22:19.560204	\N	\N
830	\N	1	\N	1	2025-11-03 07:22:20.595241	\N	\N
831	\N	1	\N	1	2025-11-03 07:22:21.60756	\N	\N
832	\N	1	\N	1	2025-11-03 07:22:22.636208	\N	\N
833	\N	1	\N	1	2025-11-03 07:22:23.660534	\N	\N
834	\N	1	\N	1	2025-11-03 07:22:24.689375	\N	\N
835	\N	1	\N	1	2025-11-03 07:22:25.764273	\N	\N
836	\N	1	\N	1	2025-11-03 07:22:26.779073	\N	\N
837	\N	1	\N	1	2025-11-03 07:22:27.827865	\N	\N
838	\N	1	\N	1	2025-11-03 07:22:28.898652	\N	\N
839	\N	1	\N	1	2025-11-03 07:22:29.908003	\N	\N
840	\N	1	\N	1	2025-11-03 07:22:30.910104	\N	\N
841	\N	1	\N	1	2025-11-03 07:22:31.940668	\N	\N
842	\N	1	\N	1	2025-11-03 07:22:32.97855	\N	\N
843	\N	1	\N	1	2025-11-03 07:22:34.022312	\N	\N
844	\N	1	\N	1	2025-11-03 07:22:35.040782	\N	\N
845	\N	1	\N	1	2025-11-03 07:22:36.072732	\N	\N
846	\N	1	\N	1	2025-11-03 07:22:37.110461	\N	\N
847	\N	1	\N	1	2025-11-03 07:22:38.19361	\N	\N
848	\N	1	\N	1	2025-11-03 07:22:39.19843	\N	\N
849	\N	1	\N	1	2025-11-03 07:22:40.198577	\N	\N
850	\N	1	\N	1	2025-11-03 07:22:41.235264	\N	\N
851	\N	1	\N	1	2025-11-03 07:22:42.277599	\N	\N
852	\N	1	\N	1	2025-11-03 07:22:43.351408	\N	\N
853	\N	1	\N	1	2025-11-03 07:22:44.388879	\N	\N
854	\N	1	\N	1	2025-11-03 07:22:45.404014	\N	\N
855	\N	1	\N	1	2025-11-03 07:22:46.421501	\N	\N
856	\N	1	\N	1	2025-11-03 07:22:47.434003	\N	\N
857	\N	1	\N	1	2025-11-03 07:22:48.45523	\N	\N
858	\N	1	\N	1	2025-11-03 07:22:49.5319	\N	\N
859	\N	1	\N	1	2025-11-03 07:22:50.538022	\N	\N
860	\N	1	\N	1	2025-11-03 07:22:51.599293	\N	\N
861	\N	1	\N	1	2025-11-03 07:22:52.639478	\N	\N
862	\N	1	\N	1	2025-11-03 07:22:53.681942	\N	\N
863	\N	1	\N	1	2025-11-03 07:22:54.691328	\N	\N
864	\N	1	\N	1	2025-11-03 07:22:55.705805	\N	\N
865	\N	1	\N	1	2025-11-03 07:22:56.718963	\N	\N
866	\N	1	\N	1	2025-11-03 07:22:57.737546	\N	\N
867	\N	1	\N	1	2025-11-03 07:22:58.812113	\N	\N
868	\N	1	\N	1	2025-11-03 07:22:59.83026	\N	\N
869	\N	1	\N	1	2025-11-03 07:23:00.947775	\N	\N
870	\N	1	\N	1	2025-11-03 07:23:02.029197	\N	\N
871	\N	1	\N	1	2025-11-03 07:23:03.049275	\N	\N
872	\N	1	\N	1	2025-11-03 07:23:04.081253	\N	\N
873	\N	1	\N	1	2025-11-03 07:23:05.103525	\N	\N
874	\N	1	\N	1	2025-11-03 07:23:06.121028	\N	\N
875	\N	1	\N	1	2025-11-03 07:23:07.135325	\N	\N
876	\N	1	\N	1	2025-11-03 07:23:08.15448	\N	\N
877	\N	1	\N	1	2025-11-03 07:23:09.176425	\N	\N
878	\N	1	\N	1	2025-11-03 07:23:10.190597	\N	\N
879	\N	1	\N	1	2025-11-03 07:23:11.249324	\N	\N
880	\N	1	\N	1	2025-11-03 07:23:12.279564	\N	\N
881	\N	1	\N	1	2025-11-03 07:23:13.336332	\N	\N
882	\N	1	\N	1	2025-11-03 07:23:14.357421	\N	\N
883	\N	1	\N	1	2025-11-03 07:23:15.379869	\N	\N
884	\N	1	\N	1	2025-11-03 07:23:16.373953	\N	\N
885	\N	1	\N	1	2025-11-03 07:23:17.396617	\N	\N
886	\N	1	\N	1	2025-11-03 07:23:18.412937	\N	\N
887	\N	1	\N	1	2025-11-03 07:23:19.429126	\N	\N
888	\N	1	\N	1	2025-11-03 07:23:20.493207	\N	\N
889	\N	1	\N	1	2025-11-03 07:23:21.510166	\N	\N
890	\N	1	\N	1	2025-11-03 07:23:22.541415	\N	\N
891	\N	1	\N	1	2025-11-03 07:23:23.578022	\N	\N
892	\N	1	\N	1	2025-11-03 07:23:24.599603	\N	\N
893	\N	1	\N	1	2025-11-03 07:23:25.610875	\N	\N
894	\N	1	\N	1	2025-11-03 07:23:26.626382	\N	\N
895	\N	1	\N	1	2025-11-03 07:23:27.640784	\N	\N
896	\N	1	\N	1	2025-11-03 07:23:28.704369	\N	\N
897	\N	1	\N	1	2025-11-03 07:23:29.727097	\N	\N
898	\N	1	\N	1	2025-11-03 07:23:30.754871	\N	\N
899	\N	1	\N	1	2025-11-03 07:23:31.815945	\N	\N
900	\N	1	\N	1	2025-11-03 07:23:32.834735	\N	\N
901	\N	1	\N	1	2025-11-03 07:23:33.862838	\N	\N
902	\N	1	\N	1	2025-11-03 07:23:34.883642	\N	\N
903	\N	1	\N	1	2025-11-03 07:23:35.908845	\N	\N
904	\N	1	\N	1	2025-11-03 07:23:36.928244	\N	\N
905	\N	1	\N	1	2025-11-03 07:23:37.943066	\N	\N
906	\N	1	\N	1	2025-11-03 07:23:38.959341	\N	\N
907	\N	1	\N	1	2025-11-03 07:23:40.031282	\N	\N
908	\N	1	\N	1	2025-11-03 07:23:41.113915	\N	\N
909	\N	1	\N	1	2025-11-03 07:23:42.126987	\N	\N
910	\N	1	\N	1	2025-11-03 07:23:43.183439	\N	\N
911	\N	1	\N	1	2025-11-03 07:23:44.217735	\N	\N
912	\N	1	\N	1	2025-11-03 07:23:45.236828	\N	\N
913	\N	1	\N	1	2025-11-03 07:23:46.250891	\N	\N
914	\N	1	\N	1	2025-11-03 07:23:47.26501	\N	\N
915	\N	1	\N	1	2025-11-03 07:23:48.275023	\N	\N
916	\N	1	\N	1	2025-11-03 07:23:49.289901	\N	\N
917	\N	1	\N	1	2025-11-03 07:23:50.346145	\N	\N
918	\N	1	\N	1	2025-11-03 07:23:51.417455	\N	\N
919	\N	1	\N	1	2025-11-03 07:23:52.457605	\N	\N
920	\N	1	\N	1	2025-11-03 07:23:53.494945	\N	\N
921	\N	1	\N	1	2025-11-03 07:23:54.506965	\N	\N
922	\N	1	\N	1	2025-11-03 07:23:55.528086	\N	\N
923	\N	1	\N	1	2025-11-03 07:23:56.539579	\N	\N
924	\N	1	\N	1	2025-11-03 07:23:57.546704	\N	\N
925	\N	1	\N	1	2025-11-03 07:23:58.579797	\N	\N
926	\N	1	\N	1	2025-11-03 07:23:59.637042	\N	\N
927	\N	1	\N	1	2025-11-03 07:24:00.679505	\N	\N
928	\N	1	\N	1	2025-11-03 07:24:01.737929	\N	\N
929	\N	1	\N	1	2025-11-03 07:24:02.754715	\N	\N
930	\N	1	\N	1	2025-11-03 07:24:03.798035	\N	\N
931	\N	1	\N	1	2025-11-03 07:24:04.814604	\N	\N
932	\N	1	\N	1	2025-11-03 07:24:05.82934	\N	\N
933	\N	1	\N	1	2025-11-03 07:24:06.83832	\N	\N
934	\N	1	\N	1	2025-11-03 07:24:07.859064	\N	\N
935	\N	1	\N	1	2025-11-03 07:24:08.906823	\N	\N
936	\N	1	\N	1	2025-11-03 07:24:09.929269	\N	\N
937	\N	1	\N	1	2025-11-03 07:24:10.999568	\N	\N
938	\N	1	\N	1	2025-11-03 07:24:12.022531	\N	\N
939	\N	1	\N	1	2025-11-03 07:24:13.087306	\N	\N
940	\N	1	\N	1	2025-11-03 07:24:14.136652	\N	\N
941	\N	1	\N	1	2025-11-03 07:24:15.162668	\N	\N
942	\N	1	\N	1	2025-11-03 07:24:16.164713	\N	\N
943	\N	1	\N	1	2025-11-03 07:24:17.208134	\N	\N
944	\N	1	\N	1	2025-11-03 07:24:18.220102	\N	\N
945	\N	1	\N	1	2025-11-03 07:24:19.23411	\N	\N
946	\N	1	\N	1	2025-11-03 07:24:20.253478	\N	\N
947	\N	1	\N	1	2025-11-03 07:24:21.258102	\N	\N
948	\N	1	\N	1	2025-11-03 07:24:22.287721	\N	\N
949	\N	1	\N	1	2025-11-03 07:24:23.316328	\N	\N
950	\N	1	\N	1	2025-11-03 07:24:24.332905	\N	\N
951	\N	1	\N	1	2025-11-03 07:24:25.353664	\N	\N
952	\N	1	\N	1	2025-11-03 07:24:26.36439	\N	\N
953	\N	1	\N	1	2025-11-03 07:24:27.376443	\N	\N
954	\N	1	\N	1	2025-11-03 07:24:28.385738	\N	\N
955	\N	1	\N	1	2025-11-03 07:24:29.386702	\N	\N
956	\N	1	\N	1	2025-11-03 07:24:30.433916	\N	\N
957	\N	1	\N	1	2025-11-03 07:24:31.495043	\N	\N
958	\N	1	\N	1	2025-11-03 07:24:32.522734	\N	\N
959	\N	1	\N	1	2025-11-03 07:24:33.567521	\N	\N
960	\N	1	\N	1	2025-11-03 07:24:34.596204	\N	\N
961	\N	1	\N	1	2025-11-03 07:24:35.606524	\N	\N
962	\N	1	\N	1	2025-11-03 07:24:36.623019	\N	\N
963	\N	1	\N	1	2025-11-03 07:24:37.640902	\N	\N
964	\N	1	\N	1	2025-11-03 07:24:38.671529	\N	\N
965	\N	1	\N	1	2025-11-03 07:24:39.717253	\N	\N
966	\N	1	\N	1	2025-11-03 07:24:40.797237	\N	\N
967	\N	1	\N	1	2025-11-03 07:24:41.84998	\N	\N
968	\N	1	\N	1	2025-11-03 07:24:42.872007	\N	\N
969	\N	1	\N	1	2025-11-03 07:24:43.916693	\N	\N
970	\N	1	\N	1	2025-11-03 07:24:44.929834	\N	\N
971	\N	1	\N	1	2025-11-03 07:24:45.944763	\N	\N
972	\N	1	\N	1	2025-11-03 07:24:46.978776	\N	\N
973	\N	1	\N	1	2025-11-03 07:24:47.990347	\N	\N
974	\N	1	\N	1	2025-11-03 07:24:49.004025	\N	\N
975	\N	1	\N	1	2025-11-03 07:24:50.012208	\N	\N
976	\N	1	\N	1	2025-11-03 07:24:51.079264	\N	\N
977	\N	1	\N	1	2025-11-03 07:24:52.097733	\N	\N
978	\N	1	\N	5	2025-11-03 07:24:53.159674	\N	\N
979	\N	1	\N	2	2025-11-03 07:24:54.199092	\N	\N
980	\N	1	\N	2	2025-11-03 07:24:55.220258	\N	\N
981	\N	1	\N	2	2025-11-03 07:24:56.232536	\N	\N
982	\N	1	\N	2	2025-11-03 07:24:57.295018	\N	\N
983	\N	1	\N	1	2025-11-03 07:25:11.650191	\N	\N
984	\N	1	\N	2	2025-11-03 07:25:12.699412	\N	\N
985	\N	1	\N	1	2025-11-03 07:25:13.703416	\N	\N
986	\N	1	\N	1	2025-11-03 07:25:28.152171	\N	\N
987	\N	1	\N	1	2025-11-03 07:25:29.184933	\N	\N
988	\N	1	\N	1	2025-11-03 07:25:30.212146	\N	\N
989	\N	1	\N	1	2025-11-03 07:25:31.291814	\N	\N
990	\N	1	\N	1	2025-11-03 07:25:32.365638	\N	\N
991	\N	1	\N	1	2025-11-03 07:25:33.413849	\N	\N
992	\N	1	\N	2	2025-11-03 07:36:08.947186	\N	\N
993	\N	1	\N	2	2025-11-03 07:36:10.006649	\N	\N
994	\N	1	\N	1	2025-11-03 07:36:11.077893	\N	\N
995	\N	1	\N	0	2025-11-03 07:36:12.136998	\N	\N
996	\N	1	\N	1	2025-11-03 07:36:13.156373	\N	\N
997	\N	1	\N	1	2025-11-03 07:36:14.203844	\N	\N
998	\N	1	\N	1	2025-11-03 07:36:15.239652	\N	\N
999	\N	1	\N	1	2025-11-03 07:36:16.304595	\N	\N
1000	\N	1	\N	0	2025-11-03 07:36:17.335226	\N	\N
1001	\N	1	\N	0	2025-11-03 07:36:18.380551	\N	\N
1002	\N	1	\N	1	2025-11-03 07:36:19.412684	\N	\N
1003	\N	1	\N	0	2025-11-03 07:36:20.423523	\N	\N
1004	\N	1	\N	1	2025-11-03 07:36:21.490468	\N	\N
1005	\N	1	\N	1	2025-11-03 07:36:22.566148	\N	\N
1006	\N	1	\N	1	2025-11-03 07:36:23.582182	\N	\N
1007	\N	1	\N	1	2025-11-03 07:36:24.60155	\N	\N
1008	\N	1	\N	1	2025-11-03 07:36:25.61906	\N	\N
1009	\N	1	\N	1	2025-11-03 07:36:26.693852	\N	\N
1010	\N	1	\N	1	2025-11-03 07:36:27.698003	\N	\N
1011	\N	1	\N	1	2025-11-03 07:36:28.7076	\N	\N
1012	\N	1	\N	1	2025-11-03 07:36:29.738409	\N	\N
1013	\N	1	\N	1	2025-11-03 07:36:30.771801	\N	\N
1014	\N	1	\N	1	2025-11-03 07:36:31.78319	\N	\N
1015	\N	1	\N	1	2025-11-03 07:36:32.803023	\N	\N
1016	\N	1	\N	1	2025-11-03 07:36:33.828489	\N	\N
1017	\N	1	\N	1	2025-11-03 07:36:34.856981	\N	\N
1018	\N	1	\N	1	2025-11-03 07:36:35.955737	\N	\N
1019	\N	1	\N	1	2025-11-03 07:36:36.964991	\N	\N
1020	\N	1	\N	1	2025-11-03 07:36:38.041636	\N	\N
1021	\N	1	\N	1	2025-11-03 07:36:39.116414	\N	\N
1022	\N	1	\N	1	2025-11-03 07:36:40.164951	\N	\N
1023	\N	1	\N	1	2025-11-03 07:36:41.171059	\N	\N
1024	\N	1	\N	1	2025-11-03 07:36:42.175618	\N	\N
1025	\N	1	\N	1	2025-11-03 07:36:43.18	\N	\N
1026	\N	1	\N	1	2025-11-03 07:36:44.220993	\N	\N
1027	\N	1	\N	1	2025-11-03 07:36:45.307473	\N	\N
1028	\N	1	\N	1	2025-11-03 07:36:46.450793	\N	\N
1029	\N	1	\N	1	2025-11-03 07:36:47.460001	\N	\N
1030	\N	1	\N	1	2025-11-03 07:36:48.495388	\N	\N
1031	\N	1	\N	1	2025-11-03 07:36:49.518033	\N	\N
1032	\N	1	\N	1	2025-11-03 07:36:50.55937	\N	\N
1033	\N	1	\N	1	2025-11-03 07:36:51.589994	\N	\N
1034	\N	1	\N	1	2025-11-03 07:36:52.620112	\N	\N
1035	\N	1	\N	1	2025-11-03 07:36:53.667155	\N	\N
1036	\N	1	\N	1	2025-11-03 07:36:54.672829	\N	\N
1037	\N	1	\N	1	2025-11-03 07:36:55.685705	\N	\N
1038	\N	1	\N	1	2025-11-03 07:36:56.708604	\N	\N
1039	\N	1	\N	1	2025-11-03 07:36:57.720627	\N	\N
1040	\N	1	\N	1	2025-11-03 07:36:58.732997	\N	\N
1041	\N	1	\N	1	2025-11-03 07:36:59.789353	\N	\N
1042	\N	1	\N	1	2025-11-03 07:37:00.801616	\N	\N
1043	\N	1	\N	1	2025-11-03 07:37:01.82382	\N	\N
1044	\N	1	\N	1	2025-11-03 07:37:02.829754	\N	\N
1045	\N	1	\N	1	2025-11-03 07:37:03.872326	\N	\N
1046	\N	1	\N	1	2025-11-03 07:37:04.918817	\N	\N
1047	\N	1	\N	1	2025-11-03 07:37:05.982793	\N	\N
1048	\N	1	\N	1	2025-11-03 07:37:06.993013	\N	\N
1049	\N	1	\N	1	2025-11-03 07:37:08.01414	\N	\N
1050	\N	1	\N	1	2025-11-03 07:37:09.041142	\N	\N
1051	\N	1	\N	1	2025-11-03 07:37:10.061245	\N	\N
1052	\N	1	\N	1	2025-11-03 07:37:11.124015	\N	\N
1053	\N	1	\N	1	2025-11-03 07:37:12.153043	\N	\N
1054	\N	1	\N	1	2025-11-03 07:37:13.201434	\N	\N
1055	\N	1	\N	1	2025-11-03 07:37:14.274534	\N	\N
1056	\N	1	\N	1	2025-11-03 07:37:15.322526	\N	\N
1057	\N	1	\N	1	2025-11-03 07:37:16.384122	\N	\N
1058	\N	1	\N	1	2025-11-03 07:37:17.385082	\N	\N
1059	\N	1	\N	1	2025-11-03 07:37:18.413057	\N	\N
1060	\N	1	\N	1	2025-11-03 07:37:19.467484	\N	\N
1061	\N	1	\N	1	2025-11-03 07:37:20.512948	\N	\N
1062	\N	1	\N	1	2025-11-03 07:37:21.550923	\N	\N
1063	\N	1	\N	1	2025-11-03 07:37:22.612542	\N	\N
1064	\N	1	\N	1	2025-11-03 07:37:23.674672	\N	\N
1065	\N	1	\N	1	2025-11-03 07:37:24.712101	\N	\N
1066	\N	1	\N	1	2025-11-03 07:37:25.791928	\N	\N
1067	\N	1	\N	1	2025-11-03 07:37:26.860418	\N	\N
1068	\N	1	\N	1	2025-11-03 07:37:27.935321	\N	\N
1069	\N	1	\N	1	2025-11-03 07:37:28.940425	\N	\N
1070	\N	1	\N	1	2025-11-03 07:37:29.959947	\N	\N
1071	\N	1	\N	1	2025-11-03 07:37:30.996568	\N	\N
1072	\N	1	\N	1	2025-11-03 07:37:32.05781	\N	\N
1073	\N	1	\N	1	2025-11-03 07:37:33.102332	\N	\N
1074	\N	1	\N	1	2025-11-03 07:37:34.186823	\N	\N
1075	\N	1	\N	1	2025-11-03 07:37:35.193438	\N	\N
1076	\N	1	\N	1	2025-11-03 07:37:36.27345	\N	\N
1077	\N	1	\N	1	2025-11-03 07:37:37.340666	\N	\N
1078	\N	1	\N	1	2025-11-03 07:37:38.353324	\N	\N
1079	\N	1	\N	1	2025-11-03 07:37:39.419808	\N	\N
1080	\N	1	\N	1	2025-11-03 07:37:40.474161	\N	\N
1081	\N	1	\N	1	2025-11-03 07:37:41.529439	\N	\N
1082	\N	1	\N	1	2025-11-03 07:37:42.572843	\N	\N
1083	\N	1	\N	1	2025-11-03 07:37:43.587781	\N	\N
1084	\N	1	\N	1	2025-11-03 07:37:44.658771	\N	\N
1085	\N	1	\N	1	2025-11-03 07:37:45.694585	\N	\N
1086	\N	1	\N	1	2025-11-03 07:37:46.724625	\N	\N
1087	\N	1	\N	1	2025-11-03 07:37:47.773262	\N	\N
1088	\N	1	\N	1	2025-11-03 07:37:48.838948	\N	\N
1089	\N	1	\N	1	2025-11-03 07:37:49.859312	\N	\N
1090	\N	1	\N	1	2025-11-03 07:37:50.893663	\N	\N
1091	\N	1	\N	1	2025-11-03 07:37:51.963065	\N	\N
1092	\N	1	\N	1	2025-11-03 07:37:52.976487	\N	\N
1093	\N	1	\N	1	2025-11-03 07:37:54.019724	\N	\N
1094	\N	1	\N	1	2025-11-03 07:37:55.037994	\N	\N
1095	\N	1	\N	1	2025-11-03 07:37:56.058051	\N	\N
1096	\N	1	\N	1	2025-11-03 07:37:57.124425	\N	\N
1097	\N	1	\N	1	2025-11-03 07:37:58.129276	\N	\N
1098	\N	1	\N	1	2025-11-03 07:37:59.196376	\N	\N
1099	\N	1	\N	1	2025-11-03 07:38:00.214183	\N	\N
1100	\N	1	\N	1	2025-11-03 07:38:01.279774	\N	\N
1101	\N	1	\N	1	2025-11-03 07:38:02.332723	\N	\N
1102	\N	1	\N	1	2025-11-03 07:38:03.473742	\N	\N
1103	\N	1	\N	1	2025-11-03 07:38:04.472701	\N	\N
1104	\N	1	\N	1	2025-11-03 07:38:05.502332	\N	\N
1105	\N	1	\N	1	2025-11-03 07:38:06.532281	\N	\N
1106	\N	1	\N	1	2025-11-03 07:38:07.540213	\N	\N
1107	\N	1	\N	1	2025-11-03 07:38:08.548711	\N	\N
1108	\N	1	\N	1	2025-11-03 07:38:09.633934	\N	\N
1109	\N	1	\N	1	2025-11-03 07:38:10.652724	\N	\N
1110	\N	1	\N	1	2025-11-03 07:38:11.715033	\N	\N
1111	\N	1	\N	1	2025-11-03 07:38:12.771842	\N	\N
1112	\N	1	\N	1	2025-11-03 07:38:13.816017	\N	\N
1113	\N	1	\N	1	2025-11-03 07:38:14.878892	\N	\N
1114	\N	1	\N	1	2025-11-03 07:38:15.910907	\N	\N
1115	\N	1	\N	1	2025-11-03 07:38:16.933862	\N	\N
1116	\N	1	\N	1	2025-11-03 07:38:17.962051	\N	\N
1117	\N	1	\N	1	2025-11-03 07:38:19.015234	\N	\N
1118	\N	1	\N	1	2025-11-03 07:38:20.042882	\N	\N
1119	\N	1	\N	1	2025-11-03 07:38:21.058817	\N	\N
1120	\N	1	\N	1	2025-11-03 07:38:22.094199	\N	\N
1121	\N	1	\N	1	2025-11-03 07:38:23.119949	\N	\N
1122	\N	1	\N	1	2025-11-03 07:38:24.163946	\N	\N
1123	\N	1	\N	1	2025-11-03 07:38:25.19913	\N	\N
1124	\N	1	\N	1	2025-11-03 07:38:26.280627	\N	\N
1125	\N	1	\N	1	2025-11-03 07:38:27.312926	\N	\N
1126	\N	1	\N	1	2025-11-03 07:38:28.365488	\N	\N
1127	\N	1	\N	1	2025-11-03 07:38:29.389858	\N	\N
1128	\N	1	\N	1	2025-11-03 07:38:30.410769	\N	\N
1129	\N	1	\N	1	2025-11-03 07:38:31.442819	\N	\N
1130	\N	1	\N	1	2025-11-03 07:38:32.455065	\N	\N
1131	\N	1	\N	1	2025-11-03 07:38:33.534947	\N	\N
1132	\N	1	\N	1	2025-11-03 07:38:34.542682	\N	\N
1133	\N	1	\N	1	2025-11-03 07:38:35.574966	\N	\N
1134	\N	1	\N	1	2025-11-03 07:38:36.660624	\N	\N
1135	\N	1	\N	1	2025-11-03 07:38:37.674807	\N	\N
1136	\N	1	\N	1	2025-11-03 07:38:38.684975	\N	\N
1137	\N	1	\N	1	2025-11-03 07:38:39.687807	\N	\N
1138	\N	1	\N	1	2025-11-03 07:38:40.717596	\N	\N
1139	\N	1	\N	1	2025-11-03 07:38:41.736463	\N	\N
1140	\N	1	\N	1	2025-11-03 07:38:42.752469	\N	\N
1141	\N	1	\N	1	2025-11-03 07:38:43.78669	\N	\N
1142	\N	1	\N	1	2025-11-03 07:38:44.815314	\N	\N
1143	\N	1	\N	1	2025-11-03 07:38:45.820331	\N	\N
1144	\N	1	\N	1	2025-11-03 07:38:46.869601	\N	\N
1145	\N	1	\N	1	2025-11-03 07:38:47.964531	\N	\N
1146	\N	1	\N	1	2025-11-03 07:38:48.998661	\N	\N
1147	\N	1	\N	1	2025-11-03 07:38:50.059477	\N	\N
1148	\N	1	\N	1	2025-11-03 07:38:51.081328	\N	\N
1149	\N	1	\N	1	2025-11-03 07:38:52.098201	\N	\N
1150	\N	1	\N	1	2025-11-03 07:38:53.133891	\N	\N
1151	\N	1	\N	1	2025-11-03 07:38:54.145575	\N	\N
1152	\N	1	\N	1	2025-11-03 07:38:55.177214	\N	\N
1153	\N	1	\N	1	2025-11-03 07:38:56.231727	\N	\N
1154	\N	1	\N	1	2025-11-03 07:38:57.24299	\N	\N
1155	\N	1	\N	1	2025-11-03 07:38:58.317954	\N	\N
1156	\N	1	\N	1	2025-11-03 07:38:59.357065	\N	\N
1157	\N	1	\N	1	2025-11-03 07:39:00.361555	\N	\N
1158	\N	1	\N	1	2025-11-03 07:39:01.407122	\N	\N
1159	\N	1	\N	1	2025-11-03 07:39:02.426256	\N	\N
1160	\N	1	\N	1	2025-11-03 07:39:03.456964	\N	\N
1161	\N	1	\N	1	2025-11-03 07:39:04.467395	\N	\N
1162	\N	1	\N	1	2025-11-03 07:39:05.536029	\N	\N
1163	\N	1	\N	1	2025-11-03 07:39:06.548904	\N	\N
1164	\N	1	\N	1	2025-11-03 07:39:07.563054	\N	\N
1165	\N	1	\N	1	2025-11-03 07:39:08.63076	\N	\N
1166	\N	1	\N	1	2025-11-03 07:39:09.721259	\N	\N
1167	\N	1	\N	1	2025-11-03 07:39:10.823249	\N	\N
1168	\N	1	\N	1	2025-11-03 07:39:11.8424	\N	\N
1169	\N	1	\N	1	2025-11-03 07:39:12.849387	\N	\N
1170	\N	1	\N	1	2025-11-03 07:39:14.017516	\N	\N
1171	\N	1	\N	1	2025-11-03 07:39:15.060812	\N	\N
1172	\N	1	\N	1	2025-11-03 07:39:16.163096	\N	\N
1173	\N	1	\N	1	2025-11-03 07:39:17.192341	\N	\N
1174	\N	1	\N	1	2025-11-03 07:39:18.211411	\N	\N
1175	\N	1	\N	1	2025-11-03 07:39:19.324452	\N	\N
1176	\N	1	\N	1	2025-11-03 07:39:20.39071	\N	\N
1177	\N	1	\N	1	2025-11-03 07:39:21.479193	\N	\N
1178	\N	1	\N	1	2025-11-03 07:39:22.537526	\N	\N
1179	\N	1	\N	1	2025-11-03 07:39:23.538601	\N	\N
1180	\N	1	\N	1	2025-11-03 07:39:24.538526	\N	\N
1181	\N	1	\N	1	2025-11-03 07:39:25.578719	\N	\N
1182	\N	1	\N	1	2025-11-03 07:39:26.608319	\N	\N
1183	\N	1	\N	1	2025-11-03 07:39:27.642469	\N	\N
1184	\N	1	\N	1	2025-11-03 07:39:28.729329	\N	\N
1185	\N	1	\N	1	2025-11-03 07:39:29.813807	\N	\N
1186	\N	1	\N	1	2025-11-03 07:39:30.839991	\N	\N
1187	\N	1	\N	1	2025-11-03 07:39:31.904211	\N	\N
1188	\N	1	\N	1	2025-11-03 07:39:32.918439	\N	\N
1189	\N	1	\N	1	2025-11-03 07:39:33.944461	\N	\N
1190	\N	1	\N	1	2025-11-03 07:39:34.945436	\N	\N
1191	\N	1	\N	1	2025-11-03 07:39:35.989355	\N	\N
1192	\N	1	\N	1	2025-11-03 07:39:37.051273	\N	\N
1193	\N	1	\N	1	2025-11-03 07:39:38.090492	\N	\N
1194	\N	1	\N	1	2025-11-03 07:39:39.173433	\N	\N
1195	\N	1	\N	1	2025-11-03 07:39:40.223418	\N	\N
1196	\N	1	\N	1	2025-11-03 07:39:41.315044	\N	\N
1197	\N	1	\N	1	2025-11-03 07:39:42.358791	\N	\N
1198	\N	1	\N	1	2025-11-03 07:39:43.368643	\N	\N
1199	\N	1	\N	1	2025-11-03 07:39:44.37011	\N	\N
1200	\N	1	\N	1	2025-11-03 07:39:45.376318	\N	\N
1201	\N	1	\N	1	2025-11-03 07:39:46.418838	\N	\N
1202	\N	1	\N	1	2025-11-03 07:39:47.492107	\N	\N
1203	\N	1	\N	1	2025-11-03 07:39:48.495759	\N	\N
1204	\N	1	\N	1	2025-11-03 07:39:49.541531	\N	\N
1205	\N	1	\N	1	2025-11-03 07:39:50.553506	\N	\N
1206	\N	1	\N	1	2025-11-03 07:39:51.586118	\N	\N
1207	\N	1	\N	1	2025-11-03 07:39:52.60946	\N	\N
1208	\N	1	\N	1	2025-11-03 07:39:53.628103	\N	\N
1209	\N	1	\N	1	2025-11-03 07:39:54.666438	\N	\N
1210	\N	1	\N	1	2025-11-03 07:39:55.732711	\N	\N
1211	\N	1	\N	1	2025-11-03 07:39:56.755531	\N	\N
1212	\N	1	\N	1	2025-11-03 07:39:57.806908	\N	\N
1213	\N	1	\N	1	2025-11-03 07:39:58.829579	\N	\N
1214	\N	1	\N	1	2025-11-03 07:39:59.860659	\N	\N
1215	\N	1	\N	1	2025-11-03 07:40:00.8868	\N	\N
1216	\N	1	\N	1	2025-11-03 07:40:01.901745	\N	\N
1217	\N	1	\N	1	2025-11-03 07:40:02.936304	\N	\N
1218	\N	1	\N	1	2025-11-03 07:40:03.980645	\N	\N
1219	\N	1	\N	1	2025-11-03 07:40:05.000984	\N	\N
1220	\N	1	\N	1	2025-11-03 07:40:06.031297	\N	\N
1221	\N	1	\N	1	2025-11-03 07:40:07.039774	\N	\N
1222	\N	1	\N	1	2025-11-03 07:40:08.181077	\N	\N
1223	\N	1	\N	1	2025-11-03 07:40:09.262878	\N	\N
1224	\N	1	\N	1	2025-11-03 07:40:10.282679	\N	\N
1225	\N	1	\N	1	2025-11-03 07:40:11.289368	\N	\N
1226	\N	1	\N	1	2025-11-03 07:40:12.324793	\N	\N
1227	\N	1	\N	1	2025-11-03 07:40:13.37787	\N	\N
1228	\N	1	\N	1	2025-11-03 07:40:14.377334	\N	\N
1229	\N	1	\N	1	2025-11-03 07:40:15.390888	\N	\N
1230	\N	1	\N	1	2025-11-03 07:40:16.448874	\N	\N
1231	\N	1	\N	1	2025-11-03 07:40:17.478896	\N	\N
1232	\N	1	\N	1	2025-11-03 07:40:18.521956	\N	\N
1233	\N	1	\N	1	2025-11-03 07:40:19.525223	\N	\N
1234	\N	1	\N	1	2025-11-03 07:40:20.53072	\N	\N
1235	\N	1	\N	1	2025-11-03 07:40:21.574566	\N	\N
1236	\N	1	\N	1	2025-11-03 07:40:22.616021	\N	\N
1237	\N	1	\N	1	2025-11-03 07:40:23.650208	\N	\N
1238	\N	1	\N	1	2025-11-03 07:40:24.700806	\N	\N
1239	\N	1	\N	1	2025-11-03 07:40:25.706187	\N	\N
1240	\N	1	\N	1	2025-11-03 07:40:26.781534	\N	\N
1241	\N	1	\N	1	2025-11-03 07:40:27.863541	\N	\N
1242	\N	1	\N	1	2025-11-03 07:40:29.123837	\N	\N
1243	\N	1	\N	1	2025-11-03 07:40:40.218473	\N	\N
1244	\N	1	\N	1	2025-11-03 07:40:41.285908	\N	\N
1245	\N	1	\N	1	2025-11-03 07:40:42.350906	\N	\N
1246	\N	1	\N	1	2025-11-03 07:40:43.37768	\N	\N
1247	\N	1	\N	1	2025-11-03 07:40:44.432318	\N	\N
1248	\N	1	\N	1	2025-11-03 07:40:45.464798	\N	\N
1249	\N	1	\N	1	2025-11-03 07:40:46.477917	\N	\N
1250	\N	1	\N	1	2025-11-03 07:40:47.488826	\N	\N
1251	\N	1	\N	2	2025-11-03 07:40:48.550628	\N	\N
1252	\N	1	\N	1	2025-11-03 07:40:49.63131	\N	\N
1253	\N	1	\N	1	2025-11-03 07:40:50.680654	\N	\N
1254	\N	1	\N	1	2025-11-03 07:40:51.725066	\N	\N
1255	\N	1	\N	0	2025-11-03 07:41:01.905443	\N	\N
1256	\N	1	\N	2	2025-11-03 07:41:02.952862	\N	\N
1257	\N	1	\N	1	2025-11-03 07:41:03.998224	\N	\N
1258	\N	1	\N	2	2025-11-03 07:41:05.034085	\N	\N
1259	\N	1	\N	2	2025-11-03 07:41:06.063062	\N	\N
1260	\N	1	\N	2	2025-11-03 07:41:07.091531	\N	\N
1261	\N	1	\N	1	2025-11-03 07:41:08.117835	\N	\N
1262	\N	1	\N	2	2025-11-03 07:41:09.144685	\N	\N
1263	\N	1	\N	1	2025-11-03 07:41:10.159702	\N	\N
1264	\N	1	\N	1	2025-11-03 07:41:11.192047	\N	\N
1265	\N	1	\N	1	2025-11-03 07:41:12.2121	\N	\N
1266	\N	1	\N	1	2025-11-03 07:44:48.445027	\N	\N
1267	\N	1	\N	1	2025-11-03 07:44:49.509856	\N	\N
1268	\N	1	\N	1	2025-11-03 07:44:50.566127	\N	\N
1269	\N	1	\N	1	2025-11-03 07:44:51.579984	\N	\N
1270	\N	1	\N	1	2025-11-03 07:44:52.634572	\N	\N
1271	\N	1	\N	1	2025-11-03 07:44:53.646232	\N	\N
1272	\N	1	\N	1	2025-11-03 07:44:54.678007	\N	\N
1273	\N	1	\N	0	2025-11-03 07:44:55.69128	\N	\N
1274	\N	1	\N	0	2025-11-03 07:44:56.704918	\N	\N
1275	\N	1	\N	1	2025-11-03 07:44:57.711126	\N	\N
1276	\N	1	\N	1	2025-11-03 07:44:58.733306	\N	\N
1277	\N	1	\N	0	2025-11-03 07:45:07.171439	\N	\N
1278	\N	1	\N	0	2025-11-03 07:45:08.20796	\N	\N
1279	\N	1	\N	1	2025-11-03 07:45:09.219852	\N	\N
1280	\N	1	\N	1	2025-11-03 07:45:10.227347	\N	\N
1281	\N	1	\N	1	2025-11-03 07:45:11.257989	\N	\N
1282	\N	1	\N	1	2025-11-03 07:45:12.273274	\N	\N
1283	\N	1	\N	1	2025-11-03 07:45:13.314116	\N	\N
1284	\N	1	\N	1	2025-11-03 07:45:14.356063	\N	\N
1285	\N	1	\N	1	2025-11-03 07:45:15.371743	\N	\N
1286	\N	1	\N	1	2025-11-03 07:45:16.440138	\N	\N
1287	\N	1	\N	1	2025-11-03 07:45:17.453732	\N	\N
1288	\N	1	\N	1	2025-11-03 07:45:18.466829	\N	\N
1289	\N	1	\N	1	2025-11-03 07:45:19.508435	\N	\N
1290	\N	1	\N	1	2025-11-03 07:45:20.528352	\N	\N
1291	\N	1	\N	1	2025-11-03 07:45:21.567383	\N	\N
1292	\N	1	\N	1	2025-11-03 07:45:22.614851	\N	\N
1293	\N	1	\N	1	2025-11-03 07:45:23.641463	\N	\N
1294	\N	1	\N	1	2025-11-03 07:45:24.70017	\N	\N
1295	\N	1	\N	1	2025-11-03 07:45:25.721045	\N	\N
1296	\N	1	\N	1	2025-11-03 07:45:26.737327	\N	\N
1297	\N	1	\N	1	2025-11-03 07:45:27.761922	\N	\N
1298	\N	1	\N	1	2025-11-03 07:45:28.789355	\N	\N
1299	\N	1	\N	1	2025-11-03 07:45:29.790021	\N	\N
1300	\N	1	\N	1	2025-11-03 07:45:30.791702	\N	\N
1301	\N	1	\N	1	2025-11-03 07:45:31.823087	\N	\N
1302	\N	1	\N	1	2025-11-03 07:45:32.863388	\N	\N
1303	\N	1	\N	1	2025-11-03 07:45:33.875321	\N	\N
1304	\N	1	\N	1	2025-11-03 07:45:34.921554	\N	\N
1305	\N	1	\N	1	2025-11-03 07:45:35.933325	\N	\N
1306	\N	1	\N	1	2025-11-03 07:45:36.964946	\N	\N
1307	\N	1	\N	1	2025-11-03 07:45:38.027004	\N	\N
1308	\N	1	\N	1	2025-11-03 07:45:39.028083	\N	\N
1309	\N	1	\N	1	2025-11-03 07:45:40.049487	\N	\N
1310	\N	1	\N	1	2025-11-03 07:45:41.12138	\N	\N
1311	\N	1	\N	1	2025-11-03 07:45:42.14222	\N	\N
1312	\N	1	\N	1	2025-11-03 07:45:43.157529	\N	\N
1313	\N	1	\N	1	2025-11-03 07:45:44.178205	\N	\N
1314	\N	1	\N	1	2025-11-03 07:45:45.187596	\N	\N
1315	\N	1	\N	1	2025-11-03 07:45:46.201068	\N	\N
1316	\N	1	\N	1	2025-11-03 07:45:47.209346	\N	\N
1317	\N	1	\N	1	2025-11-03 07:45:48.238057	\N	\N
1318	\N	1	\N	1	2025-11-03 07:45:49.266943	\N	\N
1319	\N	1	\N	1	2025-11-03 07:45:50.331733	\N	\N
1320	\N	1	\N	1	2025-11-03 07:45:51.356599	\N	\N
1321	\N	1	\N	1	2025-11-03 07:45:52.432907	\N	\N
1322	\N	1	\N	1	2025-11-03 07:45:53.454401	\N	\N
1323	\N	1	\N	1	2025-11-03 07:45:54.482439	\N	\N
1324	\N	1	\N	1	2025-11-03 07:45:55.513519	\N	\N
1325	\N	1	\N	1	2025-11-03 07:45:56.530559	\N	\N
1326	\N	1	\N	1	2025-11-03 07:45:57.592269	\N	\N
1327	\N	1	\N	1	2025-11-03 07:45:58.600923	\N	\N
1328	\N	1	\N	1	2025-11-03 07:45:59.613874	\N	\N
1329	\N	1	\N	1	2025-11-03 07:46:00.625817	\N	\N
1330	\N	1	\N	1	2025-11-03 07:46:01.674278	\N	\N
1331	\N	1	\N	1	2025-11-03 07:46:02.742328	\N	\N
1332	\N	1	\N	1	2025-11-03 07:46:03.762519	\N	\N
1333	\N	1	\N	1	2025-11-03 07:46:04.791089	\N	\N
1334	\N	1	\N	1	2025-11-03 07:46:05.795029	\N	\N
1335	\N	1	\N	1	2025-11-03 07:46:06.805482	\N	\N
1336	\N	1	\N	1	2025-11-03 07:46:07.861333	\N	\N
1337	\N	1	\N	1	2025-11-03 07:46:08.876436	\N	\N
1338	\N	1	\N	1	2025-11-03 07:46:09.8995	\N	\N
1339	\N	1	\N	1	2025-11-03 07:46:10.914541	\N	\N
1340	\N	1	\N	1	2025-11-03 07:46:11.941246	\N	\N
1341	\N	1	\N	1	2025-11-03 07:46:12.984531	\N	\N
1342	\N	1	\N	1	2025-11-03 07:46:13.997621	\N	\N
1343	\N	1	\N	1	2025-11-03 07:46:15.041468	\N	\N
1344	\N	1	\N	1	2025-11-03 07:46:16.055288	\N	\N
1345	\N	1	\N	1	2025-11-03 07:46:17.116888	\N	\N
1346	\N	1	\N	1	2025-11-03 07:46:18.129714	\N	\N
1347	\N	1	\N	1	2025-11-03 07:46:19.138409	\N	\N
1348	\N	1	\N	1	2025-11-03 07:46:20.148099	\N	\N
1349	\N	1	\N	1	2025-11-03 07:46:21.193003	\N	\N
1350	\N	1	\N	1	2025-11-03 07:46:22.254249	\N	\N
1351	\N	1	\N	1	2025-11-03 07:46:23.262929	\N	\N
1352	\N	1	\N	1	2025-11-03 07:46:24.279044	\N	\N
1353	\N	1	\N	1	2025-11-03 07:46:25.302457	\N	\N
1354	\N	1	\N	1	2025-11-03 07:46:26.377195	\N	\N
1355	\N	1	\N	1	2025-11-03 07:46:27.401105	\N	\N
1356	\N	1	\N	1	2025-11-03 07:46:28.417451	\N	\N
1357	\N	1	\N	1	2025-11-03 07:46:29.430985	\N	\N
1358	\N	1	\N	1	2025-11-03 07:46:30.442234	\N	\N
1359	\N	1	\N	1	2025-11-03 07:46:31.492259	\N	\N
1360	\N	1	\N	1	2025-11-03 07:46:32.564981	\N	\N
1361	\N	1	\N	1	2025-11-03 07:46:33.593435	\N	\N
1362	\N	1	\N	1	2025-11-03 07:46:34.616698	\N	\N
1363	\N	1	\N	1	2025-11-03 07:46:35.633091	\N	\N
1364	\N	1	\N	1	2025-11-03 07:46:36.655759	\N	\N
1365	\N	1	\N	1	2025-11-03 07:46:37.710767	\N	\N
1366	\N	1	\N	1	2025-11-03 07:46:38.786797	\N	\N
1367	\N	1	\N	1	2025-11-03 07:46:39.79867	\N	\N
1368	\N	1	\N	1	2025-11-03 07:46:40.81536	\N	\N
1369	\N	1	\N	1	2025-11-03 07:46:41.868899	\N	\N
1370	\N	1	\N	1	2025-11-03 07:46:42.909503	\N	\N
1371	\N	1	\N	1	2025-11-03 07:46:43.921062	\N	\N
1372	\N	1	\N	1	2025-11-03 07:46:44.946657	\N	\N
1373	\N	1	\N	1	2025-11-03 07:46:45.958893	\N	\N
1374	\N	1	\N	1	2025-11-03 07:46:47.026624	\N	\N
1375	\N	1	\N	1	2025-11-03 07:46:48.126922	\N	\N
1376	\N	1	\N	1	2025-11-03 07:46:49.129364	\N	\N
1377	\N	1	\N	1	2025-11-03 07:46:50.172754	\N	\N
1378	\N	1	\N	1	2025-11-03 07:46:51.212084	\N	\N
1379	\N	1	\N	1	2025-11-03 07:46:52.288804	\N	\N
1380	\N	1	\N	1	2025-11-03 07:46:53.309565	\N	\N
1381	\N	1	\N	1	2025-11-03 07:46:54.318543	\N	\N
1382	\N	1	\N	1	2025-11-03 07:46:55.348581	\N	\N
1383	\N	1	\N	1	2025-11-03 07:46:56.368403	\N	\N
1384	\N	1	\N	1	2025-11-03 07:46:57.372578	\N	\N
1385	\N	1	\N	1	2025-11-03 07:46:58.400948	\N	\N
1386	\N	1	\N	1	2025-11-03 07:46:59.465001	\N	\N
1387	\N	1	\N	1	2025-11-03 07:47:00.476852	\N	\N
1388	\N	1	\N	1	2025-11-03 07:47:01.525881	\N	\N
1389	\N	1	\N	1	2025-11-03 07:47:02.593775	\N	\N
1390	\N	1	\N	1	2025-11-03 07:47:03.624415	\N	\N
1391	\N	1	\N	1	2025-11-03 07:47:04.636909	\N	\N
1392	\N	1	\N	1	2025-11-03 07:47:05.656329	\N	\N
1393	\N	1	\N	1	2025-11-03 07:47:06.668891	\N	\N
1394	\N	1	\N	1	2025-11-03 07:47:07.73264	\N	\N
1395	\N	1	\N	1	2025-11-03 07:47:08.754913	\N	\N
1396	\N	1	\N	1	2025-11-03 07:47:09.771282	\N	\N
1397	\N	1	\N	1	2025-11-03 07:47:10.797268	\N	\N
1398	\N	1	\N	1	2025-11-03 07:47:11.847469	\N	\N
1399	\N	1	\N	1	2025-11-03 07:47:12.914764	\N	\N
1400	\N	1	\N	1	2025-11-03 07:47:13.954774	\N	\N
1401	\N	1	\N	1	2025-11-03 07:47:14.989346	\N	\N
1402	\N	1	\N	1	2025-11-03 07:47:16.014369	\N	\N
1403	\N	1	\N	1	2025-11-03 07:47:17.01759	\N	\N
1404	\N	1	\N	1	2025-11-03 07:47:18.032887	\N	\N
1405	\N	1	\N	1	2025-11-03 07:47:19.043483	\N	\N
1406	\N	1	\N	1	2025-11-03 07:47:20.053904	\N	\N
1407	\N	1	\N	1	2025-11-03 07:47:21.12906	\N	\N
1408	\N	1	\N	1	2025-11-03 07:47:22.13405	\N	\N
1409	\N	1	\N	1	2025-11-03 07:47:23.156141	\N	\N
1410	\N	1	\N	1	2025-11-03 07:47:24.169316	\N	\N
1411	\N	1	\N	1	2025-11-03 07:47:25.204506	\N	\N
1412	\N	1	\N	1	2025-11-03 07:47:26.228695	\N	\N
1413	\N	1	\N	1	2025-11-03 07:47:27.256772	\N	\N
1414	\N	1	\N	1	2025-11-03 07:47:28.332818	\N	\N
1415	\N	1	\N	1	2025-11-03 07:47:29.363524	\N	\N
1416	\N	1	\N	1	2025-11-03 07:47:30.377343	\N	\N
1417	\N	1	\N	1	2025-11-03 07:47:31.419561	\N	\N
1418	\N	1	\N	1	2025-11-03 07:47:32.473506	\N	\N
1419	\N	1	\N	1	2025-11-03 07:47:33.49012	\N	\N
1420	\N	1	\N	1	2025-11-03 07:47:34.518592	\N	\N
1421	\N	1	\N	1	2025-11-03 07:47:35.536586	\N	\N
1422	\N	1	\N	1	2025-11-03 07:47:36.546384	\N	\N
1423	\N	1	\N	1	2025-11-03 07:47:37.611289	\N	\N
1424	\N	1	\N	1	2025-11-03 07:47:38.626024	\N	\N
1425	\N	1	\N	1	2025-11-03 07:47:39.656483	\N	\N
1426	\N	1	\N	1	2025-11-03 07:47:40.677613	\N	\N
1427	\N	1	\N	1	2025-11-03 07:47:41.692781	\N	\N
1428	\N	1	\N	1	2025-11-03 07:47:42.74742	\N	\N
1429	\N	1	\N	1	2025-11-03 07:47:43.757912	\N	\N
1430	\N	1	\N	1	2025-11-03 07:47:44.782649	\N	\N
1431	\N	1	\N	1	2025-11-03 07:47:45.877891	\N	\N
1432	\N	1	\N	1	2025-11-03 07:47:46.900314	\N	\N
1433	\N	1	\N	1	2025-11-03 07:47:47.906621	\N	\N
1434	\N	1	\N	1	2025-11-03 07:47:48.968319	\N	\N
1435	\N	1	\N	1	2025-11-03 07:47:50.010728	\N	\N
1436	\N	1	\N	1	2025-11-03 07:47:51.018168	\N	\N
1437	\N	1	\N	1	2025-11-03 07:47:52.044268	\N	\N
1438	\N	1	\N	1	2025-11-03 07:47:53.04893	\N	\N
1439	\N	1	\N	1	2025-11-03 07:47:54.083987	\N	\N
1440	\N	1	\N	1	2025-11-03 07:47:55.109662	\N	\N
1441	\N	1	\N	1	2025-11-03 07:47:56.185618	\N	\N
1442	\N	1	\N	1	2025-11-03 07:47:57.211453	\N	\N
1443	\N	1	\N	1	2025-11-03 07:47:58.279101	\N	\N
1444	\N	1	\N	1	2025-11-03 07:47:59.280326	\N	\N
1445	\N	1	\N	1	2025-11-03 07:48:00.309514	\N	\N
1446	\N	1	\N	1	2025-11-03 07:48:01.336043	\N	\N
1447	\N	1	\N	1	2025-11-03 07:48:02.338631	\N	\N
1448	\N	1	\N	1	2025-11-03 07:48:03.349382	\N	\N
1449	\N	1	\N	1	2025-11-03 07:48:04.390564	\N	\N
1450	\N	1	\N	1	2025-11-03 07:48:05.41307	\N	\N
1451	\N	1	\N	1	2025-11-03 07:48:06.480126	\N	\N
1452	\N	1	\N	1	2025-11-03 07:48:07.552905	\N	\N
1453	\N	1	\N	1	2025-11-03 07:48:08.558104	\N	\N
1454	\N	1	\N	1	2025-11-03 07:48:09.5688	\N	\N
1455	\N	1	\N	1	2025-11-03 07:48:10.58102	\N	\N
1456	\N	1	\N	1	2025-11-03 07:48:11.610092	\N	\N
1457	\N	1	\N	1	2025-11-03 07:48:12.669984	\N	\N
1458	\N	1	\N	1	2025-11-03 07:48:13.689235	\N	\N
1459	\N	1	\N	1	2025-11-03 07:48:14.728069	\N	\N
1460	\N	1	\N	1	2025-11-03 07:48:15.754274	\N	\N
1461	\N	1	\N	1	2025-11-03 07:48:16.816297	\N	\N
1462	\N	1	\N	1	2025-11-03 07:48:17.844132	\N	\N
1463	\N	1	\N	1	2025-11-03 07:48:18.865766	\N	\N
1464	\N	1	\N	2	2025-11-03 07:48:19.871136	\N	\N
1465	\N	1	\N	1	2025-11-03 07:48:20.903829	\N	\N
1466	\N	1	\N	1	2025-11-03 07:48:21.920227	\N	\N
1467	\N	1	\N	1	2025-11-03 07:48:22.956007	\N	\N
1468	\N	1	\N	1	2025-11-03 07:48:23.983757	\N	\N
1469	\N	1	\N	1	2025-11-03 07:48:25.065123	\N	\N
1470	\N	1	\N	1	2025-11-03 07:48:26.091239	\N	\N
1471	\N	1	\N	1	2025-11-03 07:48:27.103514	\N	\N
1472	\N	1	\N	1	2025-11-03 07:48:28.122276	\N	\N
1473	\N	1	\N	1	2025-11-03 07:48:29.152176	\N	\N
1474	\N	1	\N	1	2025-11-03 07:48:30.16394	\N	\N
1475	\N	1	\N	1	2025-11-03 07:48:31.210789	\N	\N
1476	\N	1	\N	1	2025-11-03 07:48:32.259149	\N	\N
1477	\N	1	\N	0	2025-11-03 07:57:58.914595	\N	\N
1478	\N	1	\N	0	2025-11-03 07:57:59.970049	\N	\N
1479	\N	1	\N	1	2025-11-03 07:58:01.022704	\N	\N
1480	\N	1	\N	1	2025-11-03 07:58:02.066967	\N	\N
1481	\N	1	\N	1	2025-11-03 07:58:03.120442	\N	\N
1482	\N	1	\N	0	2025-11-03 07:58:04.137967	\N	\N
1483	\N	1	\N	1	2025-11-03 07:58:05.164257	\N	\N
1484	\N	1	\N	1	2025-11-03 07:58:06.233778	\N	\N
1485	\N	1	\N	1	2025-11-03 07:58:07.271721	\N	\N
1486	\N	1	\N	1	2025-11-03 07:58:08.333391	\N	\N
1487	\N	1	\N	1	2025-11-03 07:58:09.357528	\N	\N
1488	\N	1	\N	1	2025-11-03 07:58:10.356138	\N	\N
1489	\N	1	\N	1	2025-11-03 07:58:11.360112	\N	\N
1490	\N	1	\N	1	2025-11-03 07:58:12.370714	\N	\N
1491	\N	1	\N	1	2025-11-03 07:58:13.406918	\N	\N
1492	\N	1	\N	1	2025-11-03 07:58:14.377933	\N	\N
1493	\N	1	\N	0	2025-11-03 07:58:15.421333	\N	\N
1494	\N	1	\N	1	2025-11-03 07:58:16.424663	\N	\N
1495	\N	1	\N	1	2025-11-03 07:58:17.444113	\N	\N
1496	\N	1	\N	1	2025-11-03 07:58:18.470651	\N	\N
1497	\N	1	\N	0	2025-11-03 07:58:19.523544	\N	\N
1498	\N	1	\N	1	2025-11-03 07:58:20.547358	\N	\N
1499	\N	1	\N	0	2025-11-03 07:58:21.57898	\N	\N
1500	\N	1	\N	0	2025-11-03 07:58:22.634053	\N	\N
1501	\N	1	\N	0	2025-11-03 07:58:23.655789	\N	\N
1502	\N	1	\N	0	2025-11-03 07:58:24.69834	\N	\N
1503	\N	1	\N	0	2025-11-03 07:58:25.721183	\N	\N
1504	\N	1	\N	1	2025-11-03 07:58:26.737064	\N	\N
1505	\N	1	\N	1	2025-11-03 07:58:27.762316	\N	\N
1506	\N	1	\N	1	2025-11-03 07:58:28.788638	\N	\N
1507	\N	1	\N	1	2025-11-03 07:58:29.861665	\N	\N
1508	\N	1	\N	1	2025-11-03 07:58:30.956084	\N	\N
1509	\N	1	\N	0	2025-11-03 07:59:12.959201	\N	\N
1510	\N	1	\N	0	2025-11-03 07:59:14.044947	\N	\N
1511	\N	1	\N	0	2025-11-03 07:59:15.088141	\N	\N
1512	\N	1	\N	1	2025-11-03 07:59:16.094876	\N	\N
1513	\N	1	\N	1	2025-11-03 07:59:17.095144	\N	\N
1514	\N	1	\N	1	2025-11-03 07:59:18.143979	\N	\N
1515	\N	1	\N	2	2025-11-03 07:59:19.147317	\N	\N
1516	\N	1	\N	1	2025-11-03 07:59:20.196902	\N	\N
1517	\N	1	\N	0	2025-11-03 07:59:21.232784	\N	\N
1518	\N	1	\N	1	2025-11-03 07:59:22.269143	\N	\N
1519	\N	1	\N	1	2025-11-03 07:59:23.288072	\N	\N
1520	\N	1	\N	1	2025-11-03 07:59:24.314704	\N	\N
1521	\N	1	\N	1	2025-11-03 07:59:25.375412	\N	\N
1522	\N	1	\N	2	2025-11-03 13:05:56.982007	\N	\N
1523	\N	1	\N	1	2025-11-03 13:05:58.034321	\N	\N
1524	\N	1	\N	2	2025-11-03 13:05:59.060652	\N	\N
1525	\N	1	\N	1	2025-11-03 13:06:00.078922	\N	\N
1526	\N	1	\N	1	2025-11-03 13:06:01.096553	\N	\N
1527	\N	1	\N	1	2025-11-03 13:06:02.11335	\N	\N
1528	\N	1	\N	1	2025-11-03 13:06:03.120289	\N	\N
1529	\N	1	\N	2	2025-11-03 13:06:04.141114	\N	\N
1530	\N	1	\N	2	2025-11-03 13:06:05.19842	\N	\N
1531	\N	1	\N	3	2025-11-03 13:06:06.25126	\N	\N
1532	\N	1	\N	0	2025-11-03 13:06:07.297192	\N	\N
1533	\N	1	\N	0	2025-11-03 13:06:08.342616	\N	\N
1534	\N	1	\N	0	2025-11-03 13:06:09.400718	\N	\N
1535	\N	1	\N	1	2025-11-03 13:06:10.430802	\N	\N
1536	\N	1	\N	1	2025-11-03 13:06:11.486639	\N	\N
1537	\N	1	\N	1	2025-11-03 13:06:12.500592	\N	\N
1538	\N	1	\N	1	2025-11-03 13:06:13.574355	\N	\N
1539	\N	1	\N	1	2025-11-03 13:06:14.584445	\N	\N
1540	\N	1	\N	1	2025-11-03 13:06:15.593167	\N	\N
1541	\N	1	\N	1	2025-11-03 13:06:16.623399	\N	\N
1542	\N	1	\N	1	2025-11-03 13:06:17.637555	\N	\N
1543	\N	1	\N	1	2025-11-03 13:06:18.648036	\N	\N
1544	\N	1	\N	1	2025-11-03 13:06:19.66153	\N	\N
1545	\N	1	\N	1	2025-11-03 13:06:20.703016	\N	\N
1546	\N	1	\N	1	2025-11-03 13:06:21.70973	\N	\N
1547	\N	1	\N	1	2025-11-03 13:06:22.761429	\N	\N
1548	\N	1	\N	1	2025-11-03 13:06:23.781568	\N	\N
1549	\N	1	\N	1	2025-11-03 13:06:24.809418	\N	\N
1550	\N	1	\N	0	2025-11-03 13:06:25.814783	\N	\N
1551	\N	1	\N	0	2025-11-03 13:06:26.928398	\N	\N
1552	\N	1	\N	1	2025-11-03 13:06:27.968028	\N	\N
1553	\N	1	\N	0	2025-11-03 14:03:57.459417	\N	\N
1554	\N	1	\N	0	2025-11-03 14:03:58.459004	\N	\N
1555	\N	1	\N	0	2025-11-03 14:03:59.496787	\N	\N
1556	\N	1	\N	0	2025-11-03 14:04:00.486463	\N	\N
1557	\N	1	\N	0	2025-11-03 14:04:01.496419	\N	\N
1558	\N	1	\N	0	2025-11-03 14:04:02.511284	\N	\N
1559	\N	1	\N	0	2025-11-03 14:04:03.543236	\N	\N
1560	\N	1	\N	0	2025-11-03 14:04:04.570474	\N	\N
1561	\N	1	\N	0	2025-11-03 14:04:05.605871	\N	\N
1562	\N	1	\N	0	2025-11-03 14:04:06.638058	\N	\N
1563	\N	1	\N	0	2025-11-03 14:04:07.680254	\N	\N
1564	\N	1	\N	0	2025-11-03 14:04:08.700804	\N	\N
1565	\N	1	\N	0	2025-11-03 14:04:09.734404	\N	\N
1566	\N	1	\N	1	2025-11-03 14:04:10.724664	\N	\N
1567	\N	1	\N	1	2025-11-03 14:04:11.754679	\N	\N
1568	\N	1	\N	0	2025-11-03 14:04:12.769973	\N	\N
1569	\N	1	\N	0	2025-11-03 14:04:13.810121	\N	\N
1570	\N	1	\N	1	2025-11-03 14:04:14.859691	\N	\N
1571	\N	1	\N	1	2025-11-03 14:04:15.905037	\N	\N
1572	\N	1	\N	0	2025-11-03 14:04:16.936291	\N	\N
1573	\N	1	\N	0	2025-11-03 14:04:17.968077	\N	\N
1574	\N	1	\N	1	2025-11-03 14:04:19.021225	\N	\N
1575	\N	1	\N	1	2025-11-03 14:04:20.037709	\N	\N
1576	\N	1	\N	3	2025-11-03 14:04:21.051599	\N	\N
1577	\N	1	\N	1	2025-11-03 14:04:22.077883	\N	\N
1578	\N	1	\N	1	2025-11-03 14:04:23.10918	\N	\N
1579	\N	1	\N	1	2025-11-03 14:04:24.139562	\N	\N
1580	\N	1	\N	1	2025-11-03 14:04:25.165572	\N	\N
1581	\N	1	\N	2	2025-11-03 14:04:26.18634	\N	\N
1582	\N	1	\N	2	2025-11-03 14:04:27.214239	\N	\N
1583	\N	1	\N	2	2025-11-03 14:04:28.28047	\N	\N
1584	\N	1	\N	1	2025-11-03 14:04:29.305235	\N	\N
1585	\N	1	\N	1	2025-11-03 14:04:30.356738	\N	\N
1586	\N	1	\N	2	2025-11-03 14:04:31.419224	\N	\N
1587	\N	1	\N	2	2025-11-03 14:04:32.4789	\N	\N
1588	\N	1	\N	1	2025-11-03 14:04:33.528291	\N	\N
1589	\N	1	\N	2	2025-11-03 14:04:34.568339	\N	\N
1590	\N	1	\N	3	2025-11-03 14:04:35.600072	\N	\N
1591	\N	1	\N	2	2025-11-03 14:04:36.612193	\N	\N
1592	\N	1	\N	2	2025-11-03 14:04:37.647933	\N	\N
1593	\N	1	\N	2	2025-11-03 14:04:38.661488	\N	\N
1594	\N	1	\N	1	2025-11-03 14:04:39.681362	\N	\N
1595	\N	1	\N	1	2025-11-03 14:04:40.714835	\N	\N
1596	\N	1	\N	1	2025-11-03 14:04:41.733166	\N	\N
1597	\N	1	\N	1	2025-11-03 14:04:42.808994	\N	\N
1598	\N	1	\N	1	2025-11-03 14:04:43.899111	\N	\N
1599	\N	1	\N	1	2025-11-03 14:04:45.309976	\N	\N
1600	\N	1	\N	1	2025-11-03 14:04:46.510144	\N	\N
1601	\N	1	\N	1	2025-11-03 14:04:47.656246	\N	\N
1602	\N	1	\N	1	2025-11-03 14:04:48.756173	\N	\N
1603	\N	1	\N	1	2025-11-03 14:04:49.839917	\N	\N
1604	\N	1	\N	1	2025-11-03 14:04:50.929419	\N	\N
1605	\N	1	\N	1	2025-11-03 14:04:51.93981	\N	\N
1606	\N	1	\N	1	2025-11-03 14:04:52.982043	\N	\N
1607	\N	1	\N	1	2025-11-03 14:04:54.04659	\N	\N
1608	\N	1	\N	1	2025-11-03 14:04:55.072244	\N	\N
1609	\N	1	\N	1	2025-11-03 14:04:56.131625	\N	\N
1610	\N	1	\N	1	2025-11-03 14:04:57.170797	\N	\N
1611	\N	1	\N	1	2025-11-03 14:04:58.19165	\N	\N
1612	\N	1	\N	1	2025-11-03 14:04:59.218536	\N	\N
1613	\N	1	\N	1	2025-11-03 14:05:00.328327	\N	\N
1614	\N	1	\N	1	2025-11-03 14:05:01.326282	\N	\N
1615	\N	1	\N	1	2025-11-03 14:05:02.344854	\N	\N
1616	\N	1	\N	1	2025-11-03 14:05:03.347073	\N	\N
1617	\N	1	\N	1	2025-11-03 14:05:04.411981	\N	\N
1618	\N	1	\N	1	2025-11-03 14:05:05.469606	\N	\N
1619	\N	1	\N	1	2025-11-03 14:05:06.541976	\N	\N
1620	\N	1	\N	1	2025-11-03 14:05:07.602618	\N	\N
1621	\N	1	\N	1	2025-11-03 14:05:08.658488	\N	\N
1622	\N	1	\N	1	2025-11-03 14:05:09.727691	\N	\N
1623	\N	1	\N	1	2025-11-03 14:05:10.804157	\N	\N
1624	\N	1	\N	1	2025-11-03 14:05:11.824547	\N	\N
1625	\N	1	\N	1	2025-11-03 14:05:12.887772	\N	\N
1626	\N	1	\N	1	2025-11-03 14:05:13.929048	\N	\N
1627	\N	1	\N	1	2025-11-03 14:05:14.935704	\N	\N
1628	\N	1	\N	1	2025-11-03 14:05:15.977683	\N	\N
1629	\N	1	\N	1	2025-11-03 14:05:17.035951	\N	\N
1630	\N	1	\N	1	2025-11-03 14:05:18.11589	\N	\N
1631	\N	1	\N	1	2025-11-03 14:05:19.129421	\N	\N
1632	\N	1	\N	1	2025-11-03 14:05:20.163076	\N	\N
1633	\N	1	\N	1	2025-11-03 14:05:21.239176	\N	\N
1634	\N	1	\N	1	2025-11-03 14:05:22.245826	\N	\N
1635	\N	1	\N	1	2025-11-03 14:05:23.364049	\N	\N
1636	\N	1	\N	1	2025-11-03 14:05:24.423713	\N	\N
1637	\N	1	\N	1	2025-11-03 14:05:25.514422	\N	\N
1638	\N	1	\N	1	2025-11-03 14:05:26.570322	\N	\N
1639	\N	1	\N	1	2025-11-03 14:05:27.622426	\N	\N
1640	\N	1	\N	1	2025-11-03 14:05:28.808725	\N	\N
1641	\N	1	\N	1	2025-11-03 14:05:44.17993	\N	\N
1642	\N	1	\N	1	2025-11-03 14:05:45.255234	\N	\N
1643	\N	1	\N	1	2025-11-03 14:05:46.271622	\N	\N
1644	\N	1	\N	0	2025-11-03 14:05:47.307619	\N	\N
1645	\N	1	\N	0	2025-11-03 14:05:48.477251	\N	\N
1646	\N	1	\N	1	2025-11-03 14:05:49.575096	\N	\N
1647	\N	1	\N	1	2025-11-03 14:05:50.612561	\N	\N
1648	\N	1	\N	1	2025-11-03 14:05:51.633465	\N	\N
1649	\N	1	\N	2	2025-11-03 14:05:52.69105	\N	\N
1650	\N	1	\N	1	2025-11-03 14:05:53.770838	\N	\N
1651	\N	1	\N	1	2025-11-03 14:05:54.757871	\N	\N
1652	\N	1	\N	1	2025-11-03 14:05:55.821578	\N	\N
1653	\N	1	\N	1	2025-11-03 14:05:56.862681	\N	\N
1654	\N	1	\N	1	2025-11-03 14:05:57.955004	\N	\N
1655	\N	1	\N	1	2025-11-03 14:05:58.982734	\N	\N
1656	\N	1	\N	1	2025-11-03 14:06:00.024338	\N	\N
1657	\N	1	\N	1	2025-11-03 14:06:01.059734	\N	\N
1658	\N	1	\N	0	2025-11-03 14:24:40.807162	\N	\N
1659	\N	1	\N	0	2025-11-03 14:24:41.864304	\N	\N
1660	\N	1	\N	0	2025-11-03 14:24:42.877378	\N	\N
1661	\N	1	\N	1	2025-11-03 14:24:43.895215	\N	\N
1662	\N	1	\N	1	2025-11-03 14:24:44.924945	\N	\N
1663	\N	1	\N	0	2025-11-03 14:24:45.949726	\N	\N
1664	\N	1	\N	1	2025-11-03 14:24:47.001556	\N	\N
1665	\N	1	\N	1	2025-11-03 14:24:48.023307	\N	\N
1666	\N	1	\N	0	2025-11-03 14:24:49.055557	\N	\N
1667	\N	1	\N	1	2025-11-03 14:24:50.096269	\N	\N
1668	\N	1	\N	1	2025-11-03 14:24:51.117464	\N	\N
1669	\N	1	\N	2	2025-11-03 15:14:33.191481	\N	\N
1670	\N	1	\N	2	2025-11-03 15:14:34.239308	\N	\N
1671	\N	1	\N	2	2025-11-03 15:14:35.242196	\N	\N
1672	\N	1	\N	2	2025-11-03 15:14:36.255481	\N	\N
1673	\N	1	\N	2	2025-11-03 15:14:37.307372	\N	\N
1674	\N	1	\N	2	2025-11-03 15:14:38.34465	\N	\N
1675	\N	1	\N	1	2025-11-03 15:14:39.349887	\N	\N
1676	\N	1	\N	1	2025-11-03 15:14:40.374356	\N	\N
1677	\N	1	\N	1	2025-11-03 15:14:41.380892	\N	\N
1678	\N	1	\N	1	2025-11-03 15:14:42.45346	\N	\N
1679	\N	1	\N	1	2025-11-03 15:14:43.475461	\N	\N
1680	\N	1	\N	1	2025-11-03 15:14:44.498292	\N	\N
1681	\N	1	\N	2	2025-11-03 15:15:37.604546	\N	\N
1682	\N	1	\N	2	2025-11-03 15:15:38.646175	\N	\N
1683	\N	1	\N	2	2025-11-03 15:15:39.675169	\N	\N
1684	\N	1	\N	2	2025-11-03 15:15:40.705789	\N	\N
1685	\N	1	\N	2	2025-11-03 15:15:41.755383	\N	\N
1686	\N	1	\N	1	2025-11-03 15:15:42.802243	\N	\N
1687	\N	1	\N	1	2025-11-03 15:15:43.850725	\N	\N
1688	\N	1	\N	2	2025-11-03 15:32:51.953562	\N	\N
1689	\N	1	\N	2	2025-11-03 15:32:52.989147	\N	\N
1690	\N	1	\N	2	2025-11-03 15:44:34.994557	\N	\N
1691	\N	1	\N	2	2025-11-03 15:44:36.055276	\N	\N
1692	\N	1	\N	2	2025-11-03 15:44:37.093078	\N	\N
1693	\N	1	\N	2	2025-11-03 15:44:38.260382	\N	\N
1694	\N	1	\N	2	2025-11-03 15:44:39.310472	\N	\N
1695	\N	1	\N	2	2025-11-03 15:44:40.345379	\N	\N
1696	\N	1	\N	2	2025-11-03 15:44:41.413527	\N	\N
1697	\N	1	\N	2	2025-11-03 15:44:42.426413	\N	\N
1698	\N	1	\N	1	2025-11-03 15:44:43.469455	\N	\N
1699	\N	1	\N	1	2025-11-03 15:44:44.483803	\N	\N
1700	\N	1	\N	2	2025-11-03 15:57:24.764215	\N	\N
1701	\N	1	\N	2	2025-11-03 15:57:25.771273	\N	\N
1702	\N	1	\N	2	2025-11-03 15:57:26.7947	\N	\N
1703	\N	1	\N	2	2025-11-03 15:57:27.835173	\N	\N
1704	\N	1	\N	2	2025-11-03 15:57:28.849704	\N	\N
1705	\N	1	\N	1	2025-11-03 15:57:29.859971	\N	\N
1706	\N	1	\N	1	2025-11-03 15:57:30.877779	\N	\N
1707	\N	1	\N	1	2025-11-03 15:57:31.895875	\N	\N
1708	\N	1	\N	1	2025-11-03 15:57:32.909378	\N	\N
1709	\N	1	\N	1	2025-11-03 15:57:33.918543	\N	\N
1710	\N	1	\N	1	2025-11-03 15:57:34.936311	\N	\N
1711	\N	1	\N	1	2025-11-03 15:57:35.959288	\N	\N
1712	\N	1	\N	2	2025-11-03 15:58:53.626285	\N	\N
1713	\N	1	\N	2	2025-11-03 15:58:54.658642	\N	\N
1714	\N	1	\N	2	2025-11-03 15:58:55.697358	\N	\N
1715	\N	1	\N	2	2025-11-03 15:58:56.723459	\N	\N
1716	\N	1	\N	2	2025-11-03 15:58:57.743532	\N	\N
1717	\N	1	\N	2	2025-11-03 15:58:58.75951	\N	\N
1718	\N	1	\N	1	2025-11-03 15:58:59.783825	\N	\N
1719	\N	1	\N	1	2025-11-03 15:59:00.810461	\N	\N
1720	\N	1	\N	1	2025-11-03 15:59:01.823628	\N	\N
1721	\N	1	\N	1	2025-11-03 15:59:02.862764	\N	\N
1722	\N	1	\N	1	2025-11-03 15:59:03.91793	\N	\N
1723	\N	1	\N	1	2025-11-03 15:59:04.962199	\N	\N
1724	\N	1	\N	2	2025-11-04 02:39:29.529946	\N	\N
1725	\N	1	\N	2	2025-11-04 02:39:30.596045	\N	\N
1726	\N	1	\N	2	2025-11-04 02:39:31.645896	\N	\N
1727	\N	1	\N	2	2025-11-04 02:39:32.683027	\N	\N
1728	\N	1	\N	2	2025-11-04 02:39:33.687279	\N	\N
1729	\N	1	\N	2	2025-11-04 02:39:34.719723	\N	\N
1730	\N	1	\N	1	2025-11-04 02:39:35.737047	\N	\N
1731	\N	1	\N	1	2025-11-04 02:39:36.750821	\N	\N
1732	\N	1	\N	1	2025-11-04 02:39:37.754367	\N	\N
1733	\N	1	\N	1	2025-11-04 02:39:38.806298	\N	\N
1734	\N	1	\N	1	2025-11-04 02:39:39.853618	\N	\N
1735	\N	1	\N	1	2025-11-04 02:39:40.880849	\N	\N
1736	\N	1	\N	1	2025-11-04 02:39:41.903156	\N	\N
1737	\N	1	\N	2	2025-11-04 02:52:48.162615	\N	\N
1738	\N	1	\N	2	2025-11-04 02:52:49.166495	\N	\N
1739	\N	1	\N	2	2025-11-04 02:52:50.19232	\N	\N
1740	\N	1	\N	2	2025-11-04 02:52:51.22846	\N	\N
1741	\N	1	\N	2	2025-11-04 02:52:52.254198	\N	\N
1742	\N	1	\N	2	2025-11-04 02:52:53.257684	\N	\N
1743	\N	1	\N	2	2025-11-04 02:52:54.313451	\N	\N
1744	\N	1	\N	2	2025-11-04 02:52:55.38503	\N	\N
1745	\N	1	\N	1	2025-11-04 02:52:56.386162	\N	\N
1746	\N	1	\N	1	2025-11-04 02:52:57.427638	\N	\N
1747	\N	1	\N	1	2025-11-04 02:52:58.43618	\N	\N
1748	\N	1	\N	1	2025-11-04 02:52:59.478261	\N	\N
1749	\N	1	\N	1	2025-11-04 02:53:00.532654	\N	\N
1750	\N	1	\N	1	2025-11-04 02:53:01.587663	\N	\N
1751	\N	1	\N	1	2025-11-04 02:53:02.658551	\N	\N
1752	\N	1	\N	2	2025-11-04 03:11:47.575948	\N	\N
1753	\N	1	\N	2	2025-11-04 03:11:48.623513	\N	\N
1754	\N	1	\N	2	2025-11-04 03:11:49.661199	\N	\N
1755	\N	1	\N	2	2025-11-04 03:11:50.723659	\N	\N
1756	\N	1	\N	2	2025-11-04 03:11:51.750895	\N	\N
1757	\N	1	\N	2	2025-11-04 03:11:52.813117	\N	\N
1758	\N	1	\N	1	2025-11-04 03:11:53.865676	\N	\N
1759	\N	1	\N	1	2025-11-04 03:11:54.918541	\N	\N
1760	\N	1	\N	1	2025-11-04 03:11:55.940103	\N	\N
1761	\N	1	\N	1	2025-11-04 03:11:56.981389	\N	\N
1762	\N	1	\N	1	2025-11-04 03:11:57.988777	\N	\N
1763	\N	1	\N	1	2025-11-04 03:11:59.012302	\N	\N
1764	\N	1	\N	2	2025-11-06 15:22:50.765582	\N	\N
1765	\N	1	\N	2	2025-11-06 15:22:51.792464	\N	\N
1766	\N	1	\N	2	2025-11-06 15:22:52.890652	\N	\N
1767	\N	1	\N	2	2025-11-06 15:22:53.892024	\N	\N
1768	\N	1	\N	2	2025-11-06 15:22:54.939048	\N	\N
1769	\N	1	\N	2	2025-11-06 15:22:55.986375	\N	\N
1770	\N	1	\N	2	2025-11-06 15:22:57.233951	\N	\N
1771	\N	1	\N	2	2025-11-06 15:22:58.493296	\N	\N
1772	\N	1	\N	2	2025-11-06 15:22:59.560258	\N	\N
1773	\N	1	\N	2	2025-11-06 15:23:00.602395	\N	\N
1774	\N	1	\N	2	2025-11-13 08:11:25.19385	\N	\N
1775	\N	1	\N	2	2025-11-13 08:11:26.242156	\N	\N
1776	\N	1	\N	2	2025-11-13 08:11:27.308162	\N	\N
1777	\N	1	\N	2	2025-11-13 08:11:28.338208	\N	\N
1778	\N	1	\N	2	2025-11-13 08:11:29.396462	\N	\N
1779	\N	1	\N	2	2025-11-13 08:11:30.406561	\N	\N
1780	\N	1	\N	1	2025-11-13 08:11:31.432464	\N	\N
1781	\N	1	\N	1	2025-11-13 08:11:32.4822	\N	\N
1782	\N	1	\N	1	2025-11-13 08:11:33.481445	\N	\N
1783	\N	1	\N	1	2025-11-13 08:11:34.526642	\N	\N
1784	\N	1	\N	1	2025-11-13 08:11:35.570609	\N	\N
1785	\N	1	\N	1	2025-11-13 08:11:36.579294	\N	\N
\.


--
-- TOC entry 3821 (class 0 OID 16683)
-- Dependencies: 236
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.payment_methods (id, code, name) FROM stdin;
1	momo	MoMo Pay
2	zalopay	ZaloPay
3	atm_qr	ATM/Napas QR
\.


--
-- TOC entry 3823 (class 0 OID 16692)
-- Dependencies: 238
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.payments (id, booking_id, method_id, amount, currency, provider_txn_id, status, qr_url, qr_payload, provider_meta, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3844 (class 0 OID 33387)
-- Dependencies: 262
-- Data for Name: qr_checkins; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.qr_checkins (id, booking_id, user_id, qr_code_id, status, check_in_at, check_out_at, notes, rating, device_info, location, actual_seat, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3843 (class 0 OID 33366)
-- Dependencies: 261
-- Data for Name: qrcodes; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.qrcodes (id, booking_id, qr_string, secret_key, qr_data, expires_at, usage_count, max_usage, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3825 (class 0 OID 16717)
-- Dependencies: 240
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.refunds (id, payment_id, amount, reason, status, provider_refund_id, created_at) FROM stdin;
\.


--
-- TOC entry 3817 (class 0 OID 16619)
-- Dependencies: 232
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.rooms (id, zone_id, room_code, capacity, status, pos_x, pos_y, display_name, attributes) FROM stdin;
4	5	N1	28	occupied	\N	\N	\N	\N
5	5	N2	32	available	\N	\N	\N	\N
6	5	N3	60	available	\N	\N	\N	\N
511	3	M1	14	occupied	\N	\N	\N	\N
512	3	M2	13	disabled	\N	\N	\N	\N
513	3	M3	11	disabled	\N	\N	\N	\N
514	3	M4	13	available	\N	\N	\N	\N
515	4	P1	43	available	\N	\N	\N	\N
\.


--
-- TOC entry 3815 (class 0 OID 16604)
-- Dependencies: 230
-- Data for Name: seats; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.seats (id, zone_id, seat_code, status, pos_x, pos_y) FROM stdin;
21	1	FD-21	available	\N	\N
19	1	FD-19	available	\N	\N
18	1	FD-18	available	\N	\N
17	1	FD-17	available	\N	\N
5	1	FD-5	available	\N	\N
16	1	FD-16	available	\N	\N
15	1	FD-15	available	\N	\N
14	1	FD-14	available	\N	\N
13	1	FD-13	available	\N	\N
12	1	FD-12	available	\N	\N
11	1	FD-11	available	\N	\N
10	1	FD-10	available	\N	\N
3	1	FD-3	available	\N	\N
9	1	FD-9	available	\N	\N
7	1	FD-7	available	\N	\N
6	1	FD-6	available	\N	\N
4	1	FD-4	available	\N	\N
1	1	FD-1	disabled	\N	\N
20	1	FD-20	available	\N	\N
2	1	FD-2	occupied	\N	\N
8	1	FD-8	occupied	\N	\N
\.


--
-- TOC entry 3803 (class 0 OID 16507)
-- Dependencies: 218
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.service_categories (id, code, name) FROM stdin;
1	freelance	Freelance
2	team	Team
\.


--
-- TOC entry 3829 (class 0 OID 16741)
-- Dependencies: 244
-- Data for Name: service_floor_rules; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.service_floor_rules (id, service_id, floor_id) FROM stdin;
1	2	1
2	1	1
3	4	2
4	3	2
5	5	3
\.


--
-- TOC entry 3813 (class 0 OID 16577)
-- Dependencies: 228
-- Data for Name: service_packages; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.service_packages (id, service_id, name, description, price, unit_id, access_days, features, thumbnail_url, badge, max_capacity, status, created_by, created_at, updated_at, bundle_hours, is_custom, price_per_unit, discount_pct) FROM stdin;
97	2	345	435	435	5	365	["435"]	\N	\N	\N	active	\N	2025-11-11 07:05:47.498861	2025-11-11 07:05:47.498861	\N	f	\N	0
100	1	32	32	0	5	365	["32"]	\N	\N	\N	active	\N	2025-11-11 07:08:15.040897	2025-11-11 07:08:15.040897	\N	f	\N	0
89	1	ẻ	ể	3423	2	1	["ẻ", "34543", "345345", "43543"]	\N	\N	\N	active	\N	2025-11-10 17:59:15.647288	2025-11-11 07:17:03.562203	\N	f	\N	0
86	1	2ew	\N	60000	4	30	["Phòng họp mang lại lợi ích về tăng tính chuyên nghiệp", "thúc đẩy hợp tác và sáng tạo. Nó cung cấp một môi trường riêng tư,"]	\N	\N	\N	active	\N	2025-11-10 14:07:47.096923	2025-11-11 15:14:38.103456	\N	f	\N	0
101	1	ẻ	ew	232	4	30	["333"]	\N	\N	\N	active	\N	2025-11-11 07:34:44.339817	2025-11-11 07:34:44.339817	\N	f	\N	0
99	1	324	33	3000	3	7	\N	\N	\N	\N	active	\N	2025-11-11 07:08:10.248172	2025-11-11 15:24:00.972742	\N	f	\N	5
105	3	234	343	343000	4	90	["343434"]	\N	\N	\N	active	\N	2025-11-11 14:24:55.248945	2025-11-11 15:24:55.945191	\N	f	\N	4
107	3	34334	33	333333	4	90	["33"]	\N	\N	\N	active	\N	2025-11-12 04:46:27.998331	2025-11-12 04:46:27.998331	\N	f	\N	0
109	4	33	3	33	1	\N	["33"]	\N	\N	\N	active	\N	2025-11-12 05:40:00.715622	2025-11-12 05:40:00.715622	1	f	\N	0
110	3	2	22	2	4	90	["2"]	\N	\N	\N	active	\N	2025-11-12 05:40:12.723389	2025-11-12 05:40:12.723389	\N	f	\N	0
76	2	123	123	14020000	4	30	["123"]	\N	\N	\N	active	\N	2025-10-31 04:28:07.950123	2025-11-10 08:45:08.392721	\N	\N	\N	0
81	3	3434`	3333	33333	5	365	["000000", "0000"]	\N	\N	\N	active	\N	2025-10-31 07:34:29.343472	2025-11-10 08:45:08.392721	\N	\N	\N	0
82	3	huh	dfe	8386	4	180	["fdf", "ef"]	\N	\N	\N	active	\N	2025-11-02 02:48:09.091167	2025-11-10 08:45:08.392721	\N	\N	\N	0
88	2	đây 	hihi	56000	2	1	["dff", "dfdf", "dgfgf"]	\N	\N	\N	active	\N	2025-11-10 17:11:50.873014	2025-11-10 17:11:50.873014	\N	f	\N	18
104	4	5 hours package	234	324234	1	\N	["23423"]	\N	\N	\N	active	\N	2025-11-11 10:13:21.099339	2025-11-11 10:40:58.494001	5	f	\N	0
95	5	ưe	34	34	1	\N	\N	\N	\N	\N	active	\N	2025-11-11 07:01:17.965778	2025-11-11 14:52:45.201386	3	f	\N	5
106	5	3423	3243	3333	2	1	["324324"]	\N	\N	\N	active	\N	2025-11-11 14:52:04.318636	2025-11-11 14:53:06.79945	\N	f	\N	34
72	2	123	qư	0	3	7	["ưqe", "4545"]	\N	\N	\N	active	\N	2025-10-28 03:56:13.069602	2025-11-11 14:57:17.089495	\N	\N	\N	0
102	4		3233	33333	1	\N	["232", "3434", "3434"]	\N	\N	\N	active	\N	2025-11-11 10:12:29.599146	2025-11-11 15:14:25.873824	1	f	\N	0
\.


--
-- TOC entry 3805 (class 0 OID 16516)
-- Dependencies: 220
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.services (id, category_id, code, name, description, image_url, features, min_advance_days, capacity_min, capacity_max, is_active) FROM stdin;
1	1	hot_desk	Hot Desk	\N	\N	\N	1	\N	\N	t
2	1	fixed_desk	Fixed Desk	\N	\N	\N	1	\N	\N	t
3	2	private_office	Private Office	\N	\N	\N	1	\N	\N	t
4	2	meeting_room	Meeting Room	\N	\N	\N	1	\N	\N	t
5	2	networking	Networking Space	\N	\N	\N	1	\N	\N	t
\.


--
-- TOC entry 3801 (class 0 OID 16498)
-- Dependencies: 216
-- Data for Name: time_units; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.time_units (id, code, days_equivalent) FROM stdin;
1	hour	0
2	day	1
3	week	7
4	month	30
5	year	365
\.


--
-- TOC entry 3842 (class 0 OID 33346)
-- Dependencies: 260
-- Data for Name: user_payment_methods; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.user_payment_methods (id, user_id, code, display_name, data, is_default, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3811 (class 0 OID 16563)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.users (id, email, phone, password_hash, full_name, role, status, avatar_url, created_at, updated_at, reset_password_token_hash, reset_password_expires_at, username, last_login) FROM stdin;
16	wingspet2025@gmail.com	\N	$2a$10$tnloqAvMaMpxhulhLZbrdel2QrD2IEYW6NoEHURM4PpO5QDLLg48O	khoa khoa	user	active	\N	2025-11-14 03:54:38.328932	2025-11-14 03:54:38.328932	\N	\N	khoakhoa	\N
14	dinhngochan31052004@gmail.com	\N	$2a$10$4PgDolNF9vSk3K.oZqqUduYp2cmbC58U.OnOullDcLF.DT7QipGd6	han han	user	active	\N	2025-11-11 10:37:32.084258	2025-11-12 03:50:28.670198	\N	\N	hanne	2025-11-12 03:50:28.670198
1	admin@swspace.vn	0900000000	$2y$10$hashdemo	Admin	admin	active	\N	2025-10-25 11:46:00.481205	2025-11-10 07:26:46.263678	\N	\N	admin	\N
3	admin@swspace.local	\N	$2b$10$ug0rzYcbJzlI1nWsA.joQetRdQeXvuwDyPYURibs.AICFtifXV2IW	System Admin	admin	active	\N	2025-10-29 14:10:06.510648	2025-11-10 07:26:46.263678	\N	\N	admin_2	\N
7	thuong	\N	$2a$10$P6IDmrCczaslTGXV1qH53eJC1b/U3E5qYZfCZRUcboFWVDLDQOdF6	\N	user	active	\N	2025-10-30 17:59:44.46629	2025-11-10 07:26:46.263678	\N	\N	thuong	\N
2	user@swspace.vn	0900000001	$2y$10$hashdemo	Demo User	user	active	\N	2025-10-25 11:46:00.481205	2025-11-10 07:26:46.263678	\N	\N	user	\N
4	user@example.com	\N	$2a$10$4UeaGPYpX/vSctuYG6M1geAOc7YWaxrgJP9mnw7/SrogpyROo4Pku	\N	user	active	\N	2025-10-30 13:23:39.57932	2025-11-10 07:26:46.263678	\N	\N	user_2	\N
9	vkhoa	\N	$2a$10$Co7qM8jpAT3gMYt6q.1McuJoOgwlohNek8GYokVsGaf9wu/SZz16u	\N	user	active	\N	2025-10-31 04:01:12.096586	2025-11-10 07:26:46.263678	\N	\N	vkhoa	\N
6	vokhoa	\N	$2a$10$zNYYhHGOc9ZgWOWwMHyfmuJpJn4W8AoCkV1ppaqj6pasH02M40T6C	\N	user	active	\N	2025-10-30 17:55:31.047464	2025-11-12 17:35:52.873206	\N	\N	vokhoa	2025-11-12 17:35:52.873206
8	vovananhkhoa_5015	\N	$2a$10$PXLbTFqS/UJxOCLoDECGgeayTWEeCPGA6SNRiU7p5mFimaOjQE6G.	\N	user	active	\N	2025-10-30 18:07:05.465657	2025-11-10 07:26:46.263678	\N	\N	vovananhkhoa_5015	\N
11	win_cli_1762779465882@example.com	0909	$2a$10$8PJm93rOcDM6FVvWaLOMiesIrcnl09GKHQwrA/wf44P2vrHoIOImu	Win CLI	user	active	\N	2025-11-10 12:57:46.276121	2025-11-10 12:57:46.276121	\N	\N	win_cli_2098	\N
12	win_cli_1762779637543@example.com	0909	$2a$10$N5LeZVz5GRWmlQiN/Oc3TO0tzwQK2Nhv1lEmD7MUNYbWNyopEamoe	Win CLI	user	active	\N	2025-11-10 13:00:37.941625	2025-11-10 13:00:38.173346	\N	\N	win_cli_6213	2025-11-10 13:00:38.173346
13	vovananhkhoa2505@gmail.com	\N	$2a$10$ohRB1JPI737aGt5FPI/P1Oxqatv59ATnWt1C4e4trcjquMYRtIt3O	win vo	user	active	\N	2025-11-10 13:09:15.998779	2025-11-10 13:09:15.998779	\N	\N	win vo	\N
15	vovananhkhoa205@gmail.com	\N	$2a$10$xmRbGi3M8AGV.Oj9wklhHeSh7deibKD.A13Txftoydyt2KLX5s2nu	khoa khoa	user	active	\N	2025-11-13 08:14:34.88571	2025-11-13 08:14:34.88571	\N	\N	khoavip	\N
5	admin@example.com	\N	$2a$10$yXgpit/8COmnJL0vMdBtdexudbSG.WnE907bbYTW/UQZchVIS2Nb2	Admin	admin	active	\N	2025-10-30 13:35:36.309094	2025-11-13 14:55:42.936081	\N	\N	admin_3	2025-11-13 14:55:42.936081
10	nui	\N	$2a$10$wdqOIWIGINkRDqFIZkaB..BJydeLSVK25pviJ5hyIXTfJUVKsYv5S	\N	user	active	\N	2025-10-31 07:43:36.885883	2025-11-14 03:53:16.465644	\N	\N	nui	2025-11-14 03:53:16.465644
\.


--
-- TOC entry 3809 (class 0 OID 16541)
-- Dependencies: 224
-- Data for Name: zones; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.zones (id, floor_id, service_id, name, capacity, layout_image_url, created_at) FROM stdin;
1	1	2	FD-Strip A	30	/img/floor1.png	2025-10-25 11:46:00.474643
2	1	1	HD-Main	40	/img/floor1.png	2025-10-25 11:46:00.474643
3	2	4	MR-Zone	4	/img/floor2.png	2025-10-25 11:46:00.474643
4	2	3	PO-Zone	10	/img/floor2.png	2025-10-25 11:46:00.474643
5	3	5	NW-Hall	80	/img/floor3.png	2025-10-25 11:46:00.474643
\.


--
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 254
-- Name: auth_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.auth_sessions_id_seq', 146, true);


--
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 252
-- Name: automation_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.automation_actions_id_seq', 1, false);


--
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 233
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.bookings_id_seq', 6, true);


--
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 241
-- Name: cancellation_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.cancellation_policies_id_seq', 1, true);


--
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 246
-- Name: checkins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.checkins_id_seq', 1, false);


--
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 221
-- Name: floors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.floors_id_seq', 3, true);


--
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 248
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 250
-- Name: occupancy_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.occupancy_events_id_seq', 1785, true);


--
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 235
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 3, true);


--
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 237
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 239
-- Name: refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.refunds_id_seq', 1, false);


--
-- TOC entry 3883 (class 0 OID 0)
-- Dependencies: 231
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.rooms_id_seq', 4662, true);


--
-- TOC entry 3884 (class 0 OID 0)
-- Dependencies: 229
-- Name: seats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.seats_id_seq', 68, true);


--
-- TOC entry 3885 (class 0 OID 0)
-- Dependencies: 217
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 2, true);


--
-- TOC entry 3886 (class 0 OID 0)
-- Dependencies: 243
-- Name: service_floor_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.service_floor_rules_id_seq', 5, true);


--
-- TOC entry 3887 (class 0 OID 0)
-- Dependencies: 227
-- Name: service_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.service_packages_id_seq', 110, true);


--
-- TOC entry 3888 (class 0 OID 0)
-- Dependencies: 219
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.services_id_seq', 5, true);


--
-- TOC entry 3889 (class 0 OID 0)
-- Dependencies: 215
-- Name: time_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.time_units_id_seq', 5, true);


--
-- TOC entry 3890 (class 0 OID 0)
-- Dependencies: 259
-- Name: user_payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.user_payment_methods_id_seq', 1, false);


--
-- TOC entry 3891 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.users_id_seq', 16, true);


--
-- TOC entry 3892 (class 0 OID 0)
-- Dependencies: 223
-- Name: zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.zones_id_seq', 5, true);


--
-- TOC entry 3601 (class 2606 OID 16844)
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3599 (class 2606 OID 16834)
-- Name: automation_actions automation_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.automation_actions
    ADD CONSTRAINT automation_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 3562 (class 2606 OID 16646)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 3591 (class 2606 OID 16763)
-- Name: cameras cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_pkey PRIMARY KEY (id);


--
-- TOC entry 3585 (class 2606 OID 16739)
-- Name: cancellation_policies cancellation_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cancellation_policies
    ADD CONSTRAINT cancellation_policies_pkey PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 16783)
-- Name: checkins checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_pkey PRIMARY KEY (id);


--
-- TOC entry 3529 (class 2606 OID 16539)
-- Name: floors floors_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_code_key UNIQUE (code);


--
-- TOC entry 3531 (class 2606 OID 16537)
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 16804)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3597 (class 2606 OID 16824)
-- Name: occupancy_events occupancy_events_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.occupancy_events
    ADD CONSTRAINT occupancy_events_pkey PRIMARY KEY (id);


--
-- TOC entry 3574 (class 2606 OID 16690)
-- Name: payment_methods payment_methods_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_code_key UNIQUE (code);


--
-- TOC entry 3576 (class 2606 OID 16688)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3579 (class 2606 OID 16705)
-- Name: payments payments_booking_id_method_id_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_method_id_key UNIQUE (booking_id, method_id);


--
-- TOC entry 3581 (class 2606 OID 16703)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3614 (class 2606 OID 33400)
-- Name: qr_checkins qr_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_pkey PRIMARY KEY (id);


--
-- TOC entry 3608 (class 2606 OID 33378)
-- Name: qrcodes qrcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_pkey PRIMARY KEY (id);


--
-- TOC entry 3610 (class 2606 OID 33380)
-- Name: qrcodes qrcodes_qr_string_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_qr_string_key UNIQUE (qr_string);


--
-- TOC entry 3583 (class 2606 OID 16725)
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- TOC entry 3557 (class 2606 OID 16625)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 3559 (class 2606 OID 16627)
-- Name: rooms rooms_zone_id_room_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_zone_id_room_code_key UNIQUE (zone_id, room_code);


--
-- TOC entry 3551 (class 2606 OID 16610)
-- Name: seats seats_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_pkey PRIMARY KEY (id);


--
-- TOC entry 3553 (class 2606 OID 16612)
-- Name: seats seats_zone_id_seat_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_zone_id_seat_code_key UNIQUE (zone_id, seat_code);


--
-- TOC entry 3520 (class 2606 OID 16514)
-- Name: service_categories service_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_code_key UNIQUE (code);


--
-- TOC entry 3522 (class 2606 OID 16512)
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 16746)
-- Name: service_floor_rules service_floor_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 3589 (class 2606 OID 16748)
-- Name: service_floor_rules service_floor_rules_service_id_floor_id_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_service_id_floor_id_key UNIQUE (service_id, floor_id);


--
-- TOC entry 3548 (class 2606 OID 16587)
-- Name: service_packages service_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 3525 (class 2606 OID 16525)
-- Name: services services_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_code_key UNIQUE (code);


--
-- TOC entry 3527 (class 2606 OID 16523)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 3516 (class 2606 OID 16505)
-- Name: time_units time_units_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.time_units
    ADD CONSTRAINT time_units_code_key UNIQUE (code);


--
-- TOC entry 3518 (class 2606 OID 16503)
-- Name: time_units time_units_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.time_units
    ADD CONSTRAINT time_units_pkey PRIMARY KEY (id);


--
-- TOC entry 3604 (class 2606 OID 33358)
-- Name: user_payment_methods user_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3540 (class 2606 OID 16575)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3542 (class 2606 OID 25075)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3544 (class 2606 OID 16573)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3535 (class 2606 OID 16551)
-- Name: zones zones_floor_id_service_id_name_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_floor_id_service_id_name_key UNIQUE (floor_id, service_id, name);


--
-- TOC entry 3537 (class 2606 OID 16549)
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- TOC entry 3560 (class 1259 OID 33268)
-- Name: bookings_booking_reference_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX bookings_booking_reference_idx ON public.bookings USING btree (booking_reference);


--
-- TOC entry 3563 (class 1259 OID 33270)
-- Name: bookings_seat_interval_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX bookings_seat_interval_idx ON public.bookings USING btree (seat_code, start_time, end_time);


--
-- TOC entry 3564 (class 1259 OID 33271)
-- Name: bookings_status_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX bookings_status_idx ON public.bookings USING btree (status);


--
-- TOC entry 3565 (class 1259 OID 33269)
-- Name: bookings_user_time_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX bookings_user_time_idx ON public.bookings USING btree (user_id, start_time);


--
-- TOC entry 3566 (class 1259 OID 33290)
-- Name: idx_bookings_active_seat_overlap; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_active_seat_overlap ON public.bookings USING btree (seat_code, start_time, end_time) WHERE (status <> ALL (ARRAY['canceled'::public.booking_status_enum, 'refunded'::public.booking_status_enum]));


--
-- TOC entry 3567 (class 1259 OID 33287)
-- Name: idx_bookings_booking_reference_unique; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX idx_bookings_booking_reference_unique ON public.bookings USING btree (booking_reference);


--
-- TOC entry 3568 (class 1259 OID 33288)
-- Name: idx_bookings_seat_interval; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_seat_interval ON public.bookings USING btree (seat_code, start_time, end_time);


--
-- TOC entry 3569 (class 1259 OID 16857)
-- Name: idx_bookings_start_time; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_start_time ON public.bookings USING btree (start_time);


--
-- TOC entry 3570 (class 1259 OID 16856)
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- TOC entry 3571 (class 1259 OID 16855)
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- TOC entry 3572 (class 1259 OID 33289)
-- Name: idx_bookings_user_time; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_user_time ON public.bookings USING btree (user_id, start_time, end_time);


--
-- TOC entry 3577 (class 1259 OID 16858)
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- TOC entry 3611 (class 1259 OID 33416)
-- Name: idx_qr_checkins_booking_user_active; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_qr_checkins_booking_user_active ON public.qr_checkins USING btree (booking_id, user_id, status);


--
-- TOC entry 3612 (class 1259 OID 33417)
-- Name: idx_qr_checkins_user_created; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_qr_checkins_user_created ON public.qr_checkins USING btree (user_id, created_at DESC);


--
-- TOC entry 3606 (class 1259 OID 33386)
-- Name: idx_qrcodes_booking_active_valid; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_qrcodes_booking_active_valid ON public.qrcodes USING btree (booking_id, expires_at) WHERE is_active;


--
-- TOC entry 3554 (class 1259 OID 33281)
-- Name: idx_rooms_zone_code; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_rooms_zone_code ON public.rooms USING btree (zone_id, room_code);


--
-- TOC entry 3555 (class 1259 OID 16860)
-- Name: idx_rooms_zone_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_rooms_zone_id ON public.rooms USING btree (zone_id);


--
-- TOC entry 3549 (class 1259 OID 16859)
-- Name: idx_seats_zone_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_seats_zone_id ON public.seats USING btree (zone_id);


--
-- TOC entry 3546 (class 1259 OID 33280)
-- Name: idx_service_packages_service_status; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_service_packages_service_status ON public.service_packages USING btree (service_id, status);


--
-- TOC entry 3523 (class 1259 OID 33279)
-- Name: idx_services_active_code; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_services_active_code ON public.services USING btree (is_active, code);


--
-- TOC entry 3602 (class 1259 OID 33365)
-- Name: idx_user_payment_methods_user_default; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_user_payment_methods_user_default ON public.user_payment_methods USING btree (user_id, is_default) WHERE is_active;


--
-- TOC entry 3538 (class 1259 OID 25076)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3532 (class 1259 OID 16861)
-- Name: idx_zones_floor_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_zones_floor_id ON public.zones USING btree (floor_id);


--
-- TOC entry 3533 (class 1259 OID 16862)
-- Name: idx_zones_service_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_zones_service_id ON public.zones USING btree (service_id);


--
-- TOC entry 3545 (class 1259 OID 33266)
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX users_username_idx ON public.users USING btree (username);


--
-- TOC entry 3605 (class 1259 OID 33364)
-- Name: ux_user_payment_methods_user_code_active; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX ux_user_payment_methods_user_code_active ON public.user_payment_methods USING btree (user_id, code) WHERE is_active;


--
-- TOC entry 3653 (class 2620 OID 33421)
-- Name: qr_checkins trg_qr_checkins_updated; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER trg_qr_checkins_updated BEFORE UPDATE ON public.qr_checkins FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- TOC entry 3652 (class 2620 OID 33420)
-- Name: qrcodes trg_qrcodes_updated; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER trg_qrcodes_updated BEFORE UPDATE ON public.qrcodes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- TOC entry 3651 (class 2620 OID 33419)
-- Name: user_payment_methods trg_user_payment_methods_updated; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER trg_user_payment_methods_updated BEFORE UPDATE ON public.user_payment_methods FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- TOC entry 3649 (class 2620 OID 16853)
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3650 (class 2620 OID 16854)
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3648 (class 2620 OID 16852)
-- Name: service_packages update_service_packages_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3647 (class 2620 OID 16851)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3641 (class 2606 OID 16845)
-- Name: auth_sessions auth_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3623 (class 2606 OID 16652)
-- Name: bookings bookings_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- TOC entry 3624 (class 2606 OID 16662)
-- Name: bookings bookings_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.service_packages(id);


--
-- TOC entry 3625 (class 2606 OID 16677)
-- Name: bookings bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- TOC entry 3626 (class 2606 OID 16672)
-- Name: bookings bookings_seat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_seat_id_fkey FOREIGN KEY (seat_id) REFERENCES public.seats(id);


--
-- TOC entry 3627 (class 2606 OID 16657)
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 3628 (class 2606 OID 16647)
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3629 (class 2606 OID 16667)
-- Name: bookings bookings_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3635 (class 2606 OID 16764)
-- Name: cameras cameras_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id);


--
-- TOC entry 3636 (class 2606 OID 16769)
-- Name: cameras cameras_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3637 (class 2606 OID 16784)
-- Name: checkins checkins_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3638 (class 2606 OID 16789)
-- Name: checkins checkins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3639 (class 2606 OID 16810)
-- Name: notifications notifications_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3640 (class 2606 OID 16805)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3630 (class 2606 OID 16706)
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3631 (class 2606 OID 16711)
-- Name: payments payments_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_method_id_fkey FOREIGN KEY (method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 3644 (class 2606 OID 33401)
-- Name: qr_checkins qr_checkins_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 3645 (class 2606 OID 33411)
-- Name: qr_checkins qr_checkins_qr_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_qr_code_id_fkey FOREIGN KEY (qr_code_id) REFERENCES public.qrcodes(id) ON DELETE SET NULL;


--
-- TOC entry 3646 (class 2606 OID 33406)
-- Name: qr_checkins qr_checkins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3643 (class 2606 OID 33381)
-- Name: qrcodes qrcodes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 3632 (class 2606 OID 16726)
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- TOC entry 3622 (class 2606 OID 16628)
-- Name: rooms rooms_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3621 (class 2606 OID 16613)
-- Name: seats seats_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3633 (class 2606 OID 16754)
-- Name: service_floor_rules service_floor_rules_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id);


--
-- TOC entry 3634 (class 2606 OID 16749)
-- Name: service_floor_rules service_floor_rules_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 3618 (class 2606 OID 16598)
-- Name: service_packages service_packages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3619 (class 2606 OID 16588)
-- Name: service_packages service_packages_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 3620 (class 2606 OID 16593)
-- Name: service_packages service_packages_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.time_units(id);


--
-- TOC entry 3615 (class 2606 OID 16526)
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- TOC entry 3642 (class 2606 OID 33359)
-- Name: user_payment_methods user_payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3616 (class 2606 OID 16552)
-- Name: zones zones_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id);


--
-- TOC entry 3617 (class 2606 OID 16557)
-- Name: zones zones_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


-- Completed on 2025-11-14 10:57:15

--
-- PostgreSQL database dump complete
--

\unrestrict EbVnZTUDcBF0vLykWV5StQWiY7VybJugeYZFmNpsiNmaBvqmTb9KYdIyVjDdpzZ

