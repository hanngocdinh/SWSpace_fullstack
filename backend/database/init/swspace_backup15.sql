--
-- PostgreSQL database dump
--

\restrict sNVxjxSTIS9zxbDXRiPUo17lafbyo7hCKZZpOlyuDrX1jCVvrw2akUR9RJY6pjm

-- Dumped from database version 15.14
-- Dumped by pg_dump version 18.0

-- Started on 2025-12-05 13:42:48

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
-- TOC entry 3851 (class 0 OID 0)
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
-- TOC entry 3852 (class 0 OID 0)
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
-- TOC entry 3853 (class 0 OID 0)
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
-- TOC entry 3854 (class 0 OID 0)
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
-- TOC entry 3855 (class 0 OID 0)
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
-- TOC entry 3856 (class 0 OID 0)
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
-- TOC entry 3857 (class 0 OID 0)
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
-- TOC entry 3858 (class 0 OID 0)
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
-- TOC entry 3859 (class 0 OID 0)
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
-- TOC entry 3860 (class 0 OID 0)
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
-- TOC entry 3861 (class 0 OID 0)
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
-- TOC entry 3862 (class 0 OID 0)
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
-- TOC entry 3863 (class 0 OID 0)
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
    pos_y numeric(5,2),
    capacity integer DEFAULT 1 NOT NULL
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
-- TOC entry 3864 (class 0 OID 0)
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
-- TOC entry 3865 (class 0 OID 0)
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
-- TOC entry 3866 (class 0 OID 0)
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
-- TOC entry 3867 (class 0 OID 0)
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
-- TOC entry 3868 (class 0 OID 0)
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
-- TOC entry 3869 (class 0 OID 0)
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
-- TOC entry 3870 (class 0 OID 0)
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
-- TOC entry 3871 (class 0 OID 0)
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
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 223
-- Name: zones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: swspace_user
--

ALTER SEQUENCE public.zones_id_seq OWNED BY public.zones.id;


--
-- TOC entry 3493 (class 2604 OID 16839)
-- Name: auth_sessions id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.auth_sessions ALTER COLUMN id SET DEFAULT nextval('public.auth_sessions_id_seq'::regclass);


--
-- TOC entry 3491 (class 2604 OID 16829)
-- Name: automation_actions id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.automation_actions ALTER COLUMN id SET DEFAULT nextval('public.automation_actions_id_seq'::regclass);


--
-- TOC entry 3465 (class 2604 OID 16637)
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- TOC entry 3480 (class 2604 OID 16735)
-- Name: cancellation_policies id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cancellation_policies ALTER COLUMN id SET DEFAULT nextval('public.cancellation_policies_id_seq'::regclass);


--
-- TOC entry 3484 (class 2604 OID 16778)
-- Name: checkins id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins ALTER COLUMN id SET DEFAULT nextval('public.checkins_id_seq'::regclass);


--
-- TOC entry 3445 (class 2604 OID 16535)
-- Name: floors id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.floors ALTER COLUMN id SET DEFAULT nextval('public.floors_id_seq'::regclass);


--
-- TOC entry 3486 (class 2604 OID 16798)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3489 (class 2604 OID 16819)
-- Name: occupancy_events id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.occupancy_events ALTER COLUMN id SET DEFAULT nextval('public.occupancy_events_id_seq'::regclass);


--
-- TOC entry 3472 (class 2604 OID 16686)
-- Name: payment_methods id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payment_methods ALTER COLUMN id SET DEFAULT nextval('public.payment_methods_id_seq'::regclass);


--
-- TOC entry 3473 (class 2604 OID 16695)
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- TOC entry 3478 (class 2604 OID 16720)
-- Name: refunds id; Type: DEFAULT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.refunds ALTER COLUMN id SET DEFAULT nextval('public.refunds_id_seq'::regclass);


--
-- TOC entry 3463 (class 2604 OID 16622)
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
-- TOC entry 3483 (class 2604 OID 16744)
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
-- TOC entry 3495 (class 2604 OID 33349)
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
-- TOC entry 3841 (class 0 OID 16836)
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
-- TOC entry 3839 (class 0 OID 16826)
-- Dependencies: 253
-- Data for Name: automation_actions; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.automation_actions (id, floor_id, zone_id, action, reason, triggered_by, executed_at, extra) FROM stdin;
\.


--
-- TOC entry 3820 (class 0 OID 16634)
-- Dependencies: 234
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.bookings (id, user_id, category_id, service_id, package_id, zone_id, seat_id, room_id, start_time, end_time, quantity, price_total, status, notes, created_at, updated_at, service_type, package_duration, seat_code, seat_name, floor_no, base_price, discount_pct, final_price, payment_status, payment_method, transaction_id, booking_reference, cancelled_at, cancellation_reason) FROM stdin;
3	13	1	1	\N	\N	\N	\N	2025-12-05 13:00:00	2025-12-06 12:59:00	1	38400	paid	Booking from frontend	2025-12-05 05:30:13.08375	2025-12-05 05:30:27.474457	hot-desk	89	HOTDESK-MISFEFV5	Hot Desk Flex Access	1	40000	4.00	38400	success	\N	\N	SWS-MISFEFVE-HQEE6	\N	\N
1	13	2	3	\N	\N	\N	\N	2025-12-12 06:00:00	2026-03-12 05:59:00	1	1840000	canceled	\N	2025-12-04 19:00:25.548004	2025-12-05 06:02:44.015688	private_office	month	P1	P1	2	2000000	8.00	1840000	refunded	\N	\N	SWS-MIRSWITI-3Z3C3	2025-12-05 06:02:44.015688	Cancelled via Floor 2 admin panel
\.


--
-- TOC entry 3831 (class 0 OID 16759)
-- Dependencies: 245
-- Data for Name: cameras; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.cameras (id, floor_id, zone_id, name) FROM stdin;
\.


--
-- TOC entry 3828 (class 0 OID 16732)
-- Dependencies: 242
-- Data for Name: cancellation_policies; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.cancellation_policies (id, name, full_refund_before_hours) FROM stdin;
1	default_24h	24
\.


--
-- TOC entry 3833 (class 0 OID 16775)
-- Dependencies: 247
-- Data for Name: checkins; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.checkins (id, booking_id, user_id, method, direction, detected_at, camera_id, extra) FROM stdin;
\.


--
-- TOC entry 3808 (class 0 OID 16532)
-- Dependencies: 222
-- Data for Name: floors; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.floors (id, code, name) FROM stdin;
1	F1	Floor 1 – Main Workspace
2	F2	Floor 2 – Meeting & Private Office
3	F3	Floor 3 – Networking & Workshop
\.


--
-- TOC entry 3835 (class 0 OID 16795)
-- Dependencies: 249
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.notifications (id, user_id, booking_id, type, title, content, channel, status, created_at, read_at) FROM stdin;
\.


--
-- TOC entry 3837 (class 0 OID 16816)
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
1786	\N	2	\N	0	2025-11-14 05:24:09.722518	\N	\N
1787	\N	2	\N	1	2025-11-14 05:24:10.83911	\N	\N
1788	\N	2	\N	1	2025-11-14 05:24:11.770124	\N	\N
1789	\N	2	\N	0	2025-11-14 05:24:12.813553	\N	\N
1790	\N	2	\N	0	2025-11-14 05:24:13.894761	\N	\N
1791	\N	2	\N	1	2025-11-14 05:24:14.950894	\N	\N
1792	\N	2	\N	1	2025-11-14 05:24:16.032647	\N	\N
1793	\N	2	\N	1	2025-11-14 05:24:17.158364	\N	\N
1794	\N	2	\N	1	2025-11-14 05:24:18.198422	\N	\N
1795	\N	2	\N	1	2025-11-14 05:24:19.260476	\N	\N
1796	\N	2	\N	0	2025-11-14 05:24:20.287673	\N	\N
1797	\N	2	\N	0	2025-11-14 05:24:21.355539	\N	\N
1798	\N	2	\N	0	2025-11-14 05:24:22.432143	\N	\N
1799	\N	2	\N	0	2025-11-14 05:24:23.452758	\N	\N
1800	\N	2	\N	0	2025-11-14 05:24:24.525719	\N	\N
1801	\N	2	\N	1	2025-11-14 05:24:25.637157	\N	\N
1802	\N	2	\N	1	2025-11-14 05:24:26.673056	\N	\N
1803	\N	3	\N	0	2025-11-14 05:24:38.745005	\N	\N
1804	\N	3	\N	0	2025-11-14 05:24:39.823968	\N	\N
1805	\N	3	\N	0	2025-11-14 05:24:40.881608	\N	\N
1806	\N	3	\N	0	2025-11-14 05:24:41.900731	\N	\N
1807	\N	3	\N	1	2025-11-14 05:24:42.967025	\N	\N
1808	\N	3	\N	1	2025-11-14 05:24:43.982994	\N	\N
1809	\N	3	\N	0	2025-11-14 05:24:45.01851	\N	\N
1810	\N	3	\N	0	2025-11-14 05:24:46.038221	\N	\N
1811	\N	3	\N	0	2025-11-14 05:24:47.07871	\N	\N
1812	\N	3	\N	0	2025-11-14 05:24:48.080973	\N	\N
1813	\N	3	\N	0	2025-11-14 05:24:49.145935	\N	\N
1814	\N	3	\N	0	2025-11-14 05:24:50.203636	\N	\N
1815	\N	3	\N	0	2025-11-14 05:24:51.251169	\N	\N
1816	\N	3	\N	0	2025-11-14 05:24:52.278804	\N	\N
1817	\N	3	\N	0	2025-11-14 05:24:53.296885	\N	\N
1818	\N	3	\N	0	2025-11-14 05:24:54.357967	\N	\N
1819	\N	3	\N	0	2025-11-14 05:24:55.515052	\N	\N
1820	\N	3	\N	0	2025-11-14 05:24:56.748434	\N	\N
1821	\N	3	\N	0	2025-11-14 05:24:57.743473	\N	\N
1822	\N	3	\N	0	2025-11-14 05:24:58.811349	\N	\N
1823	\N	3	\N	0	2025-11-14 05:24:59.865008	\N	\N
1824	\N	3	\N	0	2025-11-14 05:25:00.894891	\N	\N
1825	\N	3	\N	0	2025-11-14 05:25:02.045817	\N	\N
1826	\N	3	\N	0	2025-11-14 05:25:03.100978	\N	\N
1827	\N	3	\N	0	2025-11-14 05:25:04.176789	\N	\N
1828	\N	3	\N	0	2025-11-14 05:25:05.190902	\N	\N
1829	\N	3	\N	0	2025-11-14 05:25:06.218043	\N	\N
1830	\N	3	\N	0	2025-11-14 05:25:07.256201	\N	\N
1831	\N	3	\N	0	2025-11-14 05:25:08.300882	\N	\N
1832	\N	3	\N	0	2025-11-14 05:25:09.375731	\N	\N
1833	\N	3	\N	0	2025-11-14 05:25:10.392783	\N	\N
1834	\N	3	\N	0	2025-11-14 05:25:11.427986	\N	\N
1835	\N	3	\N	0	2025-11-14 05:25:12.462683	\N	\N
1836	\N	3	\N	0	2025-11-14 05:25:13.480132	\N	\N
1837	\N	3	\N	0	2025-11-14 05:25:14.532142	\N	\N
1838	\N	3	\N	0	2025-11-14 05:25:15.581999	\N	\N
1839	\N	3	\N	0	2025-11-14 05:25:16.614386	\N	\N
1840	\N	3	\N	0	2025-11-14 05:25:17.628182	\N	\N
1841	\N	3	\N	0	2025-11-14 05:25:18.697812	\N	\N
1842	\N	3	\N	0	2025-11-14 05:25:19.704121	\N	\N
1843	\N	3	\N	0	2025-11-14 05:25:20.731639	\N	\N
1844	\N	3	\N	0	2025-11-14 05:25:21.742597	\N	\N
1845	\N	3	\N	0	2025-11-14 05:25:22.78157	\N	\N
1846	\N	3	\N	0	2025-11-14 05:25:23.830707	\N	\N
1847	\N	3	\N	0	2025-11-14 05:25:24.865386	\N	\N
1848	\N	3	\N	0	2025-11-14 05:25:25.899957	\N	\N
1849	\N	3	\N	0	2025-11-14 05:25:26.921878	\N	\N
1850	\N	3	\N	0	2025-11-14 05:25:27.944193	\N	\N
1851	\N	3	\N	0	2025-11-14 05:25:28.978469	\N	\N
1852	\N	3	\N	0	2025-11-14 05:25:30.022045	\N	\N
1853	\N	3	\N	0	2025-11-14 05:25:31.068004	\N	\N
1854	\N	3	\N	0	2025-11-14 05:25:32.077624	\N	\N
1855	\N	3	\N	0	2025-11-14 05:25:33.142823	\N	\N
1856	\N	3	\N	0	2025-11-14 05:25:34.176461	\N	\N
1857	\N	3	\N	0	2025-11-14 05:25:35.228718	\N	\N
1858	\N	3	\N	0	2025-11-14 05:25:36.237647	\N	\N
1859	\N	3	\N	0	2025-11-14 05:25:37.314857	\N	\N
1860	\N	3	\N	0	2025-11-14 05:25:38.356071	\N	\N
1861	\N	3	\N	0	2025-11-14 05:25:39.3723	\N	\N
1862	\N	3	\N	0	2025-11-14 05:25:40.403349	\N	\N
1863	\N	3	\N	0	2025-11-14 05:25:41.406297	\N	\N
1864	\N	3	\N	0	2025-11-14 05:25:42.439632	\N	\N
1865	\N	3	\N	0	2025-11-14 05:25:43.449867	\N	\N
1866	\N	3	\N	0	2025-11-14 05:25:44.496828	\N	\N
1867	\N	3	\N	0	2025-11-14 05:25:45.524459	\N	\N
1868	\N	3	\N	0	2025-11-14 05:25:46.524893	\N	\N
1869	\N	3	\N	0	2025-11-14 05:25:47.569963	\N	\N
1870	\N	3	\N	0	2025-11-14 05:25:48.609587	\N	\N
1871	\N	3	\N	0	2025-11-14 05:25:49.635435	\N	\N
1872	\N	3	\N	0	2025-11-14 05:25:50.711759	\N	\N
1873	\N	3	\N	0	2025-11-14 05:25:51.758252	\N	\N
1874	\N	3	\N	0	2025-11-14 05:25:52.797484	\N	\N
1875	\N	3	\N	0	2025-11-14 05:25:53.800524	\N	\N
1876	\N	3	\N	0	2025-11-14 05:25:54.923884	\N	\N
1877	\N	3	\N	0	2025-11-14 05:25:56.199329	\N	\N
1878	\N	3	\N	0	2025-11-14 05:25:57.297259	\N	\N
1879	\N	3	\N	0	2025-11-14 05:25:58.404674	\N	\N
1880	\N	3	\N	0	2025-11-14 05:25:59.436479	\N	\N
1881	\N	3	\N	0	2025-11-14 05:26:00.578163	\N	\N
1882	\N	3	\N	0	2025-11-14 05:26:01.641217	\N	\N
1883	\N	3	\N	0	2025-11-14 05:26:02.693562	\N	\N
1884	\N	3	\N	0	2025-11-14 05:26:03.742956	\N	\N
1885	\N	3	\N	0	2025-11-14 05:26:04.771641	\N	\N
1886	\N	3	\N	0	2025-11-14 05:26:05.829772	\N	\N
1887	\N	3	\N	0	2025-11-14 05:26:06.902897	\N	\N
1888	\N	3	\N	0	2025-11-14 05:26:07.915007	\N	\N
1889	\N	3	\N	0	2025-11-14 05:26:08.935688	\N	\N
1890	\N	3	\N	0	2025-11-14 05:26:10.00347	\N	\N
1891	\N	3	\N	0	2025-11-14 05:26:11.024772	\N	\N
1892	\N	3	\N	0	2025-11-14 05:26:12.05697	\N	\N
1893	\N	3	\N	0	2025-11-14 05:26:13.096377	\N	\N
1894	\N	3	\N	0	2025-11-14 05:26:14.157311	\N	\N
1895	\N	3	\N	0	2025-11-14 05:26:15.170266	\N	\N
1896	\N	3	\N	0	2025-11-14 05:26:16.195656	\N	\N
1897	\N	3	\N	0	2025-11-14 05:26:17.266557	\N	\N
1898	\N	3	\N	0	2025-11-14 05:26:18.305892	\N	\N
1899	\N	3	\N	0	2025-11-14 05:26:19.349611	\N	\N
1900	\N	3	\N	0	2025-11-14 05:26:20.341994	\N	\N
1901	\N	3	\N	0	2025-11-14 05:26:21.366954	\N	\N
1902	\N	3	\N	0	2025-11-14 05:26:22.426006	\N	\N
1903	\N	3	\N	0	2025-11-14 05:26:23.441678	\N	\N
1904	\N	3	\N	0	2025-11-14 05:26:24.46815	\N	\N
1905	\N	3	\N	0	2025-11-14 05:26:25.492949	\N	\N
1906	\N	3	\N	0	2025-11-14 05:26:26.505925	\N	\N
1907	\N	3	\N	0	2025-11-14 05:26:27.532286	\N	\N
1908	\N	3	\N	0	2025-11-14 05:26:28.576062	\N	\N
1909	\N	3	\N	0	2025-11-14 05:26:29.601985	\N	\N
1910	\N	3	\N	0	2025-11-14 05:26:30.665781	\N	\N
1911	\N	3	\N	0	2025-11-14 05:26:31.716583	\N	\N
1912	\N	3	\N	0	2025-11-14 05:26:32.734381	\N	\N
1913	\N	3	\N	0	2025-11-14 05:26:33.742463	\N	\N
1914	\N	3	\N	0	2025-11-14 05:26:34.757712	\N	\N
1915	\N	3	\N	0	2025-11-14 05:26:35.784571	\N	\N
1916	\N	3	\N	0	2025-11-14 05:26:36.807296	\N	\N
1917	\N	3	\N	0	2025-11-14 05:26:37.861636	\N	\N
1918	\N	3	\N	0	2025-11-14 05:26:38.914238	\N	\N
1919	\N	3	\N	0	2025-11-14 05:26:39.925698	\N	\N
1920	\N	3	\N	0	2025-11-14 05:26:40.952871	\N	\N
1921	\N	3	\N	0	2025-11-14 05:26:41.959747	\N	\N
1922	\N	3	\N	0	2025-11-14 05:26:42.991525	\N	\N
1923	\N	3	\N	0	2025-11-14 05:26:44.04519	\N	\N
1924	\N	3	\N	0	2025-11-14 05:26:45.069075	\N	\N
1925	\N	3	\N	0	2025-11-14 05:26:46.094425	\N	\N
1926	\N	3	\N	0	2025-11-14 05:26:47.117287	\N	\N
1927	\N	3	\N	0	2025-11-14 05:26:48.146365	\N	\N
1928	\N	3	\N	0	2025-11-14 05:26:49.182378	\N	\N
1929	\N	3	\N	0	2025-11-14 05:26:50.201145	\N	\N
1930	\N	3	\N	0	2025-11-14 05:26:51.218929	\N	\N
1931	\N	3	\N	0	2025-11-14 05:26:52.228326	\N	\N
1932	\N	3	\N	0	2025-11-14 05:26:53.339025	\N	\N
1933	\N	3	\N	0	2025-11-14 05:26:54.415388	\N	\N
1934	\N	3	\N	0	2025-11-14 05:26:55.419944	\N	\N
1935	\N	3	\N	0	2025-11-14 05:26:56.439746	\N	\N
1936	\N	3	\N	0	2025-11-14 05:26:57.564623	\N	\N
1937	\N	3	\N	0	2025-11-14 05:26:58.582544	\N	\N
1938	\N	3	\N	0	2025-11-14 05:26:59.610502	\N	\N
1939	\N	3	\N	0	2025-11-14 05:27:00.673336	\N	\N
1940	\N	3	\N	0	2025-11-14 05:27:01.692371	\N	\N
1941	\N	3	\N	0	2025-11-14 05:27:02.761987	\N	\N
1942	\N	3	\N	0	2025-11-14 05:27:03.8409	\N	\N
1943	\N	3	\N	0	2025-11-14 05:27:04.92866	\N	\N
1944	\N	3	\N	0	2025-11-14 05:27:05.980086	\N	\N
1945	\N	3	\N	0	2025-11-14 05:27:07.061996	\N	\N
1946	\N	3	\N	0	2025-11-14 05:27:08.071069	\N	\N
1947	\N	3	\N	0	2025-11-14 05:27:09.094445	\N	\N
1948	\N	3	\N	0	2025-11-14 05:27:10.208086	\N	\N
1949	\N	3	\N	0	2025-11-14 05:27:11.284417	\N	\N
1950	\N	3	\N	0	2025-11-14 05:27:12.318482	\N	\N
1951	\N	3	\N	0	2025-11-14 05:27:13.430941	\N	\N
1952	\N	3	\N	0	2025-11-14 05:27:14.436559	\N	\N
1953	\N	3	\N	0	2025-11-14 05:27:15.468351	\N	\N
1954	\N	3	\N	0	2025-11-14 05:27:16.501069	\N	\N
1955	\N	3	\N	0	2025-11-14 05:27:17.602627	\N	\N
1956	\N	3	\N	0	2025-11-14 05:27:18.672435	\N	\N
1957	\N	3	\N	0	2025-11-14 05:27:19.708246	\N	\N
1958	\N	3	\N	0	2025-11-14 05:27:20.730984	\N	\N
1959	\N	3	\N	0	2025-11-14 05:27:21.787594	\N	\N
1960	\N	3	\N	0	2025-11-14 05:27:22.803544	\N	\N
1961	\N	3	\N	0	2025-11-14 05:27:23.863188	\N	\N
1962	\N	3	\N	0	2025-11-14 05:27:24.939554	\N	\N
1963	\N	3	\N	0	2025-11-14 05:27:25.999921	\N	\N
1964	\N	3	\N	0	2025-11-14 05:27:27.074172	\N	\N
1965	\N	3	\N	0	2025-11-14 05:27:28.142665	\N	\N
1966	\N	3	\N	0	2025-11-14 05:27:29.157015	\N	\N
1967	\N	3	\N	0	2025-11-14 05:27:30.181115	\N	\N
1968	\N	3	\N	0	2025-11-14 05:27:31.187934	\N	\N
1969	\N	3	\N	0	2025-11-14 05:27:32.212512	\N	\N
1970	\N	3	\N	0	2025-11-14 05:27:33.290769	\N	\N
1971	\N	3	\N	0	2025-11-14 05:27:34.310324	\N	\N
1972	\N	3	\N	0	2025-11-14 05:27:35.33442	\N	\N
1973	\N	3	\N	0	2025-11-14 05:27:36.365614	\N	\N
1974	\N	3	\N	0	2025-11-14 05:27:37.428476	\N	\N
1975	\N	3	\N	0	2025-11-14 05:27:38.500853	\N	\N
1976	\N	3	\N	0	2025-11-14 05:27:39.512157	\N	\N
1977	\N	3	\N	0	2025-11-14 05:27:40.516629	\N	\N
1978	\N	3	\N	0	2025-11-14 05:27:41.579312	\N	\N
1979	\N	3	\N	0	2025-11-14 05:27:42.598616	\N	\N
1980	\N	3	\N	0	2025-11-14 05:27:43.673327	\N	\N
1981	\N	3	\N	0	2025-11-14 05:27:44.709734	\N	\N
1982	\N	3	\N	0	2025-11-14 05:27:45.735016	\N	\N
1983	\N	3	\N	0	2025-11-14 05:27:46.750254	\N	\N
1984	\N	3	\N	0	2025-11-14 05:27:47.816781	\N	\N
1985	\N	3	\N	0	2025-11-14 05:27:48.835266	\N	\N
1986	\N	3	\N	0	2025-11-14 05:27:49.866609	\N	\N
1987	\N	3	\N	0	2025-11-14 05:27:50.873974	\N	\N
1988	\N	3	\N	0	2025-11-14 05:27:51.940082	\N	\N
1989	\N	3	\N	0	2025-11-14 05:27:52.948535	\N	\N
1990	\N	3	\N	0	2025-11-14 05:27:54.025443	\N	\N
1991	\N	3	\N	0	2025-11-14 05:27:55.112532	\N	\N
1992	\N	3	\N	0	2025-11-14 05:27:56.151709	\N	\N
1993	\N	3	\N	0	2025-11-14 05:27:57.244687	\N	\N
1994	\N	3	\N	0	2025-11-14 05:27:58.31116	\N	\N
1995	\N	3	\N	0	2025-11-14 05:27:59.39399	\N	\N
1996	\N	3	\N	0	2025-11-14 05:28:00.626914	\N	\N
1997	\N	3	\N	0	2025-11-14 05:28:01.681593	\N	\N
1998	\N	3	\N	0	2025-11-14 05:28:02.701896	\N	\N
1999	\N	3	\N	0	2025-11-14 05:28:03.773246	\N	\N
2000	\N	3	\N	0	2025-11-14 05:28:04.795006	\N	\N
2001	\N	3	\N	0	2025-11-14 05:28:05.82425	\N	\N
2002	\N	3	\N	0	2025-11-14 05:28:06.869005	\N	\N
2003	\N	3	\N	0	2025-11-14 05:28:07.928796	\N	\N
2004	\N	3	\N	1	2025-11-14 05:28:08.975854	\N	\N
2005	\N	3	\N	1	2025-11-14 05:28:10.011941	\N	\N
2006	\N	3	\N	1	2025-11-14 05:28:11.082475	\N	\N
2007	\N	3	\N	1	2025-11-14 05:28:12.104518	\N	\N
2008	\N	1	\N	2	2025-11-15 14:18:29.200745	\N	\N
2009	\N	1	\N	2	2025-11-15 14:18:30.214876	\N	\N
2010	\N	1	\N	2	2025-11-15 14:18:31.280634	\N	\N
2011	\N	1	\N	2	2025-11-15 14:18:32.273139	\N	\N
2012	\N	1	\N	2	2025-11-15 14:18:33.328087	\N	\N
2013	\N	1	\N	2	2025-11-15 14:18:34.362503	\N	\N
2014	\N	1	\N	1	2025-11-15 14:18:35.408816	\N	\N
2015	\N	1	\N	1	2025-11-15 14:18:36.442181	\N	\N
2016	\N	1	\N	1	2025-11-15 14:18:37.505538	\N	\N
2017	\N	1	\N	1	2025-11-15 14:18:38.513619	\N	\N
2018	\N	1	\N	1	2025-11-15 14:18:39.555208	\N	\N
2019	\N	1	\N	1	2025-11-15 14:18:40.608028	\N	\N
2020	\N	1	\N	2	2025-11-16 07:44:55.885897	\N	\N
2021	\N	1	\N	2	2025-11-16 07:44:56.922961	\N	\N
2022	\N	1	\N	2	2025-11-16 07:44:58.041057	\N	\N
2023	\N	1	\N	2	2025-11-16 07:44:59.120543	\N	\N
2024	\N	1	\N	2	2025-11-16 07:45:00.164457	\N	\N
2025	\N	1	\N	2	2025-11-16 07:45:01.172658	\N	\N
2026	\N	1	\N	2	2025-11-16 07:45:02.184168	\N	\N
2027	\N	1	\N	2	2025-11-16 07:45:03.216504	\N	\N
2028	\N	1	\N	2	2025-11-16 07:45:04.282687	\N	\N
2029	\N	1	\N	2	2025-11-16 07:45:05.348218	\N	\N
2030	\N	1	\N	1	2025-11-16 07:45:06.377423	\N	\N
2031	\N	1	\N	1	2025-11-16 07:45:07.419787	\N	\N
2032	\N	1	\N	1	2025-11-16 07:45:08.484451	\N	\N
2033	\N	1	\N	1	2025-11-16 07:45:09.53574	\N	\N
2034	\N	1	\N	1	2025-11-16 07:45:10.585838	\N	\N
2035	\N	1	\N	1	2025-11-16 07:45:11.682177	\N	\N
2036	\N	1	\N	1	2025-11-16 07:45:12.68341	\N	\N
2037	\N	1	\N	1	2025-11-16 07:45:13.700011	\N	\N
2038	\N	1	\N	1	2025-11-16 07:45:14.796037	\N	\N
2039	\N	1	\N	1	2025-11-16 07:45:15.826159	\N	\N
2040	\N	1	\N	1	2025-11-16 07:45:16.854949	\N	\N
2041	\N	2	\N	1	2025-11-17 06:39:57.821497	\N	\N
2042	\N	2	\N	1	2025-11-17 06:39:58.877298	\N	\N
2043	\N	2	\N	1	2025-11-17 06:39:59.933823	\N	\N
2044	\N	2	\N	1	2025-11-17 06:40:00.975668	\N	\N
2045	\N	2	\N	1	2025-11-17 06:40:01.994208	\N	\N
2046	\N	2	\N	1	2025-11-17 06:40:03.045168	\N	\N
2050	\N	2	\N	0	2025-11-17 06:40:08.632885	\N	\N
2051	\N	2	\N	0	2025-11-17 06:40:09.668589	\N	\N
2052	\N	2	\N	0	2025-11-17 06:40:10.677109	\N	\N
2053	\N	2	\N	1	2025-11-17 06:40:11.718929	\N	\N
2054	\N	2	\N	1	2025-11-17 06:40:12.719757	\N	\N
2060	\N	2	\N	0	2025-11-17 06:40:18.884729	\N	\N
2061	\N	2	\N	0	2025-11-17 06:40:19.971859	\N	\N
2062	\N	2	\N	0	2025-11-17 06:40:21.065036	\N	\N
2063	\N	2	\N	0	2025-11-17 06:40:22.101251	\N	\N
2064	\N	2	\N	1	2025-11-17 06:40:23.114105	\N	\N
2070	\N	2	\N	1	2025-11-17 06:40:29.225973	\N	\N
2071	\N	2	\N	1	2025-11-17 06:40:30.234693	\N	\N
2072	\N	2	\N	0	2025-11-17 06:40:31.299349	\N	\N
2073	\N	2	\N	0	2025-11-17 06:40:32.375419	\N	\N
2079	\N	2	\N	0	2025-11-17 06:40:38.668956	\N	\N
2080	\N	2	\N	0	2025-11-17 06:40:39.757103	\N	\N
2081	\N	2	\N	0	2025-11-17 06:40:40.812699	\N	\N
2082	\N	2	\N	0	2025-11-17 06:40:41.847172	\N	\N
2083	\N	2	\N	0	2025-11-17 06:40:42.877757	\N	\N
3883	\N	2	\N	0	2025-11-23 05:37:43.760459	\N	\N
3884	\N	2	\N	1	2025-11-23 05:37:44.89754	\N	\N
3885	\N	2	\N	1	2025-11-23 05:37:45.896355	\N	\N
3886	\N	2	\N	1	2025-11-23 05:37:47.009359	\N	\N
3887	\N	2	\N	0	2025-11-23 05:37:48.068812	\N	\N
3888	\N	2	\N	0	2025-11-23 05:37:50.953675	\N	\N
3889	\N	2	\N	0	2025-11-23 05:38:03.94856	\N	\N
3890	\N	2	\N	0	2025-11-23 05:38:05.267993	\N	\N
3956	\N	2	\N	1	2025-11-23 06:25:12.929716	\N	\N
3957	\N	2	\N	1	2025-11-23 06:25:13.9368	\N	\N
3958	\N	2	\N	1	2025-11-23 06:25:15.01088	\N	\N
3959	\N	2	\N	1	2025-11-23 06:25:16.055578	\N	\N
3960	\N	2	\N	1	2025-11-23 06:25:17.119195	\N	\N
3966	\N	2	\N	1	2025-11-23 06:25:23.514581	\N	\N
3967	\N	2	\N	1	2025-11-23 06:25:24.55533	\N	\N
3968	\N	2	\N	1	2025-11-23 06:25:25.687234	\N	\N
3969	\N	2	\N	1	2025-11-23 06:25:26.693441	\N	\N
3973	\N	2	\N	1	2025-11-23 06:25:30.898033	\N	\N
4030	\N	2	\N	1	2025-11-23 06:40:52.335059	\N	\N
4031	\N	2	\N	1	2025-11-23 06:40:53.405152	\N	\N
4032	\N	2	\N	1	2025-11-23 06:40:54.450082	\N	\N
4033	\N	2	\N	1	2025-11-23 06:40:55.524692	\N	\N
4039	\N	2	\N	0	2025-11-23 06:41:01.863177	\N	\N
4040	\N	2	\N	0	2025-11-23 06:41:02.92077	\N	\N
4041	\N	2	\N	0	2025-11-23 06:41:03.925007	\N	\N
4042	\N	2	\N	1	2025-11-23 06:41:04.995554	\N	\N
4043	\N	2	\N	1	2025-11-23 06:41:06.041747	\N	\N
4048	\N	2	\N	1	2025-11-23 06:41:11.527976	\N	\N
4049	\N	2	\N	1	2025-11-23 06:41:12.576998	\N	\N
4050	\N	2	\N	1	2025-11-23 06:41:13.598335	\N	\N
4051	\N	2	\N	1	2025-11-23 06:41:14.639374	\N	\N
4052	\N	2	\N	1	2025-11-23 06:41:15.688514	\N	\N
4058	\N	2	\N	1	2025-11-23 06:41:21.851214	\N	\N
4059	\N	2	\N	1	2025-11-23 06:41:22.9156	\N	\N
4060	\N	2	\N	1	2025-11-23 06:41:23.930018	\N	\N
4061	\N	2	\N	0	2025-11-23 06:41:25.139945	\N	\N
4062	\N	2	\N	0	2025-11-23 06:41:26.253295	\N	\N
4067	\N	2	\N	0	2025-11-23 06:41:31.950082	\N	\N
4068	\N	2	\N	0	2025-11-23 06:41:32.976233	\N	\N
4069	\N	2	\N	0	2025-11-23 06:41:34.065458	\N	\N
4070	\N	2	\N	0	2025-11-23 06:41:35.179803	\N	\N
4074	\N	2	\N	0	2025-11-23 06:41:52.39486	\N	\N
4075	\N	2	\N	0	2025-11-23 06:41:53.46947	\N	\N
4076	\N	2	\N	0	2025-11-23 06:41:54.530838	\N	\N
4077	\N	2	\N	0	2025-11-23 06:41:55.588707	\N	\N
4083	\N	2	\N	0	2025-11-23 06:42:02.261712	\N	\N
4084	\N	2	\N	0	2025-11-23 06:42:03.388315	\N	\N
4085	\N	2	\N	0	2025-11-23 06:42:04.508321	\N	\N
4086	\N	2	\N	0	2025-11-23 06:42:05.538856	\N	\N
4092	\N	2	\N	0	2025-11-23 06:42:11.973313	\N	\N
4093	\N	2	\N	0	2025-11-23 06:42:13.053258	\N	\N
4098	\N	2	\N	0	2025-11-23 06:43:31.609207	\N	\N
4099	\N	2	\N	1	2025-11-23 06:43:32.627175	\N	\N
4100	\N	2	\N	0	2025-11-23 06:43:33.731525	\N	\N
4101	\N	2	\N	0	2025-11-23 06:43:34.73472	\N	\N
4102	\N	2	\N	2	2025-11-23 06:43:35.825085	\N	\N
4108	\N	2	\N	0	2025-11-23 06:43:42.408468	\N	\N
4109	\N	2	\N	0	2025-11-23 06:43:43.452737	\N	\N
4110	\N	2	\N	0	2025-11-23 06:43:44.467073	\N	\N
4111	\N	2	\N	1	2025-11-23 06:43:45.491367	\N	\N
4225	\N	2	\N	0	2025-11-23 07:20:14.835285	\N	\N
4226	\N	2	\N	0	2025-11-23 07:20:15.979269	\N	\N
4227	\N	2	\N	0	2025-11-23 07:20:17.106299	\N	\N
4228	\N	2	\N	1	2025-11-23 07:20:18.178385	\N	\N
4229	\N	2	\N	1	2025-11-23 07:20:19.387572	\N	\N
4234	\N	2	\N	0	2025-11-23 07:20:24.836049	\N	\N
4235	\N	2	\N	0	2025-11-23 07:20:25.888398	\N	\N
4236	\N	2	\N	0	2025-11-23 07:20:27.031377	\N	\N
4237	\N	2	\N	1	2025-11-23 07:20:28.196194	\N	\N
4238	\N	2	\N	1	2025-11-23 07:20:29.221402	\N	\N
4243	\N	2	\N	0	2025-11-23 07:20:34.587394	\N	\N
4244	\N	2	\N	0	2025-11-23 07:20:35.687197	\N	\N
4245	\N	2	\N	0	2025-11-23 07:20:36.85024	\N	\N
4246	\N	2	\N	1	2025-11-23 07:20:38.129397	\N	\N
4247	\N	2	\N	1	2025-11-23 07:20:39.191055	\N	\N
4252	\N	2	\N	1	2025-11-23 07:20:44.825405	\N	\N
4253	\N	2	\N	2	2025-11-23 07:20:45.923764	\N	\N
4254	\N	2	\N	1	2025-11-23 07:20:47.056967	\N	\N
4255	\N	2	\N	1	2025-11-23 07:20:48.157062	\N	\N
4256	\N	2	\N	2	2025-11-23 07:20:49.223505	\N	\N
4261	\N	2	\N	2	2025-11-23 07:20:55.092667	\N	\N
4262	\N	2	\N	1	2025-11-23 07:20:56.207987	\N	\N
4263	\N	2	\N	1	2025-11-23 07:20:57.319696	\N	\N
4264	\N	2	\N	0	2025-11-23 07:20:58.424285	\N	\N
4265	\N	2	\N	1	2025-11-23 07:20:59.465144	\N	\N
4270	\N	2	\N	1	2025-11-23 07:21:04.867817	\N	\N
4271	\N	2	\N	1	2025-11-23 07:21:05.95546	\N	\N
4272	\N	2	\N	2	2025-11-23 07:21:07.119183	\N	\N
4273	\N	2	\N	1	2025-11-23 07:21:08.250779	\N	\N
4274	\N	2	\N	1	2025-11-23 07:21:09.388425	\N	\N
4275	\N	2	\N	1	2025-11-23 07:21:10.4324	\N	\N
4276	\N	2	\N	1	2025-11-23 07:21:11.514338	\N	\N
4277	\N	2	\N	1	2025-11-23 07:21:12.589678	\N	\N
4278	\N	2	\N	1	2025-11-23 07:21:13.598135	\N	\N
4284	\N	2	\N	1	2025-11-23 07:21:19.92307	\N	\N
4285	\N	2	\N	1	2025-11-23 07:21:21.024968	\N	\N
4286	\N	2	\N	1	2025-11-23 07:21:22.075577	\N	\N
4287	\N	2	\N	1	2025-11-23 07:21:23.118525	\N	\N
4288	\N	2	\N	1	2025-11-23 07:21:24.183718	\N	\N
4298	\N	2	\N	0	2025-11-23 07:21:35.590156	\N	\N
4299	\N	2	\N	0	2025-11-23 07:21:36.703583	\N	\N
4300	\N	2	\N	0	2025-11-23 07:21:37.726875	\N	\N
4301	\N	2	\N	0	2025-11-23 07:21:38.824722	\N	\N
4307	\N	2	\N	1	2025-11-23 07:21:45.502043	\N	\N
4308	\N	2	\N	0	2025-11-23 07:21:46.765478	\N	\N
4309	\N	2	\N	1	2025-11-23 07:21:47.967924	\N	\N
4310	\N	2	\N	1	2025-11-23 07:21:49.03364	\N	\N
4319	\N	2	\N	1	2025-11-23 07:21:59.282214	\N	\N
4325	\N	2	\N	0	2025-11-23 07:22:05.759581	\N	\N
4326	\N	2	\N	1	2025-11-23 07:22:06.863422	\N	\N
4327	\N	2	\N	1	2025-11-23 07:22:08.041558	\N	\N
4328	\N	2	\N	1	2025-11-23 07:22:09.048027	\N	\N
4334	\N	2	\N	1	2025-11-23 07:22:15.644474	\N	\N
4335	\N	2	\N	1	2025-11-23 07:22:16.689096	\N	\N
4336	\N	2	\N	1	2025-11-23 07:22:17.811307	\N	\N
4337	\N	2	\N	1	2025-11-23 07:22:18.85432	\N	\N
4342	\N	2	\N	1	2025-11-23 07:22:24.612134	\N	\N
4343	\N	2	\N	1	2025-11-23 07:22:25.80488	\N	\N
4345	\N	2	\N	1	2025-11-23 07:28:32.004761	\N	\N
4346	\N	2	\N	1	2025-11-23 07:28:33.275885	\N	\N
4347	\N	2	\N	1	2025-11-23 07:28:34.548274	\N	\N
4348	\N	2	\N	1	2025-11-23 07:28:35.686789	\N	\N
4349	\N	2	\N	1	2025-11-23 07:28:36.703341	\N	\N
4354	\N	2	\N	1	2025-11-23 07:28:42.71529	\N	\N
4355	\N	2	\N	0	2025-11-23 07:28:43.76808	\N	\N
4356	\N	2	\N	1	2025-11-23 07:28:44.807515	\N	\N
4357	\N	2	\N	1	2025-11-23 07:28:45.872767	\N	\N
4363	\N	2	\N	2	2025-11-23 07:28:53.125928	\N	\N
4364	\N	2	\N	2	2025-11-23 07:28:54.425763	\N	\N
4365	\N	2	\N	1	2025-11-23 07:28:55.668613	\N	\N
4385	\N	2	\N	1	2025-11-23 07:34:06.244715	\N	\N
4386	\N	2	\N	1	2025-11-23 07:34:07.485211	\N	\N
4387	\N	2	\N	1	2025-11-23 07:34:08.675604	\N	\N
2047	\N	2	\N	1	2025-11-17 06:40:05.497948	\N	\N
2048	\N	2	\N	0	2025-11-17 06:40:06.511041	\N	\N
2049	\N	2	\N	0	2025-11-17 06:40:07.562877	\N	\N
2055	\N	2	\N	1	2025-11-17 06:40:13.72625	\N	\N
2056	\N	2	\N	1	2025-11-17 06:40:14.744748	\N	\N
2057	\N	2	\N	1	2025-11-17 06:40:15.821778	\N	\N
2058	\N	2	\N	0	2025-11-17 06:40:16.844719	\N	\N
2059	\N	2	\N	0	2025-11-17 06:40:17.871749	\N	\N
2065	\N	2	\N	0	2025-11-17 06:40:24.137349	\N	\N
2066	\N	2	\N	1	2025-11-17 06:40:25.194438	\N	\N
2067	\N	2	\N	0	2025-11-17 06:40:26.198397	\N	\N
2068	\N	2	\N	0	2025-11-17 06:40:27.211095	\N	\N
2069	\N	2	\N	0	2025-11-17 06:40:28.22166	\N	\N
2074	\N	2	\N	0	2025-11-17 06:40:33.387827	\N	\N
2075	\N	2	\N	0	2025-11-17 06:40:34.419574	\N	\N
2076	\N	2	\N	0	2025-11-17 06:40:35.503088	\N	\N
2077	\N	2	\N	0	2025-11-17 06:40:36.579388	\N	\N
2078	\N	2	\N	0	2025-11-17 06:40:37.604923	\N	\N
2084	\N	2	\N	0	2025-11-17 06:40:43.877772	\N	\N
2085	\N	2	\N	0	2025-11-17 06:40:44.961536	\N	\N
2086	\N	2	\N	1	2025-11-17 06:40:46.03742	\N	\N
2087	\N	2	\N	1	2025-11-17 06:40:47.050363	\N	\N
2088	\N	2	\N	1	2025-11-17 06:40:48.086834	\N	\N
2089	\N	1	\N	2	2025-11-17 09:51:18.548898	\N	\N
2090	\N	1	\N	2	2025-11-17 09:51:19.615589	\N	\N
2091	\N	1	\N	2	2025-11-17 09:51:20.630839	\N	\N
2092	\N	1	\N	2	2025-11-17 09:51:21.63979	\N	\N
2093	\N	1	\N	2	2025-11-17 09:51:22.701833	\N	\N
2094	\N	1	\N	2	2025-11-17 09:51:23.754362	\N	\N
2095	\N	1	\N	1	2025-11-17 09:51:24.769029	\N	\N
2096	\N	1	\N	1	2025-11-17 09:51:25.82015	\N	\N
2097	\N	1	\N	1	2025-11-17 09:51:26.866663	\N	\N
2098	\N	1	\N	1	2025-11-17 09:51:27.899356	\N	\N
2099	\N	1	\N	1	2025-11-17 09:51:28.947762	\N	\N
2100	\N	1	\N	2	2025-11-22 11:46:21.79739	\N	\N
2101	\N	1	\N	2	2025-11-22 11:46:22.790724	\N	\N
2102	\N	1	\N	2	2025-11-22 11:46:23.79658	\N	\N
2103	\N	1	\N	2	2025-11-22 11:46:24.852182	\N	\N
2104	\N	1	\N	2	2025-11-22 11:46:25.925104	\N	\N
2105	\N	1	\N	2	2025-11-22 11:46:26.969778	\N	\N
2106	\N	1	\N	2	2025-11-22 11:46:28.002431	\N	\N
2107	\N	1	\N	2	2025-11-22 11:46:29.065054	\N	\N
2108	\N	1	\N	2	2025-11-22 11:46:30.08406	\N	\N
2109	\N	1	\N	2	2025-11-22 11:46:31.143682	\N	\N
2110	\N	1	\N	2	2025-11-22 11:46:32.243766	\N	\N
2111	\N	1	\N	2	2025-11-22 11:46:33.326022	\N	\N
2112	\N	1	\N	2	2025-11-22 11:46:34.402345	\N	\N
2113	\N	1	\N	1	2025-11-22 11:46:35.512796	\N	\N
2114	\N	1	\N	1	2025-11-22 11:46:37.099883	\N	\N
2115	\N	1	\N	1	2025-11-22 11:46:38.240954	\N	\N
2116	\N	1	\N	1	2025-11-22 11:46:39.315417	\N	\N
2117	\N	1	\N	1	2025-11-22 11:46:40.602386	\N	\N
2118	\N	1	\N	1	2025-11-22 11:46:41.6442	\N	\N
2119	\N	1	\N	1	2025-11-22 11:46:42.723002	\N	\N
2120	\N	1	\N	1	2025-11-22 11:46:43.905952	\N	\N
2121	\N	1	\N	1	2025-11-22 11:46:45.174514	\N	\N
2122	\N	1	\N	1	2025-11-22 11:46:46.314436	\N	\N
2123	\N	1	\N	1	2025-11-22 11:46:47.531559	\N	\N
2124	\N	1	\N	2	2025-11-22 12:07:02.765802	\N	\N
2125	\N	1	\N	2	2025-11-22 12:07:03.839631	\N	\N
2126	\N	1	\N	2	2025-11-22 12:07:04.864185	\N	\N
2127	\N	1	\N	2	2025-11-22 12:07:05.995155	\N	\N
2128	\N	1	\N	2	2025-11-22 12:07:07.037827	\N	\N
2129	\N	1	\N	2	2025-11-22 12:07:08.27316	\N	\N
2130	\N	1	\N	2	2025-11-22 12:07:09.376124	\N	\N
2131	\N	1	\N	2	2025-11-22 12:07:10.376978	\N	\N
2132	\N	1	\N	2	2025-11-22 12:07:11.448068	\N	\N
2133	\N	1	\N	2	2025-11-22 12:07:12.626494	\N	\N
2134	\N	1	\N	2	2025-11-22 12:07:13.851427	\N	\N
2135	\N	1	\N	2	2025-11-22 12:07:14.879629	\N	\N
2136	\N	1	\N	2	2025-11-22 12:07:16.168648	\N	\N
2137	\N	1	\N	2	2025-11-22 12:07:17.33158	\N	\N
2138	\N	1	\N	2	2025-11-22 12:07:18.406894	\N	\N
2139	\N	1	\N	2	2025-11-22 12:07:19.428395	\N	\N
2140	\N	1	\N	2	2025-11-22 12:07:20.632276	\N	\N
2141	\N	1	\N	2	2025-11-22 12:07:21.650297	\N	\N
2142	\N	1	\N	2	2025-11-22 12:07:22.832325	\N	\N
2143	\N	1	\N	2	2025-11-22 12:07:23.847755	\N	\N
2144	\N	1	\N	1	2025-11-22 12:07:25.043464	\N	\N
2145	\N	1	\N	1	2025-11-22 12:07:26.341893	\N	\N
2146	\N	1	\N	1	2025-11-22 12:07:27.57737	\N	\N
2147	\N	1	\N	1	2025-11-22 12:07:28.612254	\N	\N
2148	\N	1	\N	1	2025-11-22 12:07:29.816092	\N	\N
2149	\N	1	\N	1	2025-11-22 12:07:31.017403	\N	\N
2150	\N	1	\N	1	2025-11-22 12:07:32.291367	\N	\N
2151	\N	1	\N	1	2025-11-22 12:07:33.435415	\N	\N
2152	\N	1	\N	1	2025-11-22 12:07:34.508093	\N	\N
2153	\N	1	\N	1	2025-11-22 12:07:35.607127	\N	\N
2154	\N	1	\N	1	2025-11-22 12:07:36.75908	\N	\N
2155	\N	1	\N	1	2025-11-22 12:07:37.818515	\N	\N
2156	\N	1	\N	1	2025-11-22 12:07:38.878247	\N	\N
2157	\N	1	\N	1	2025-11-22 12:07:40.23386	\N	\N
2158	\N	1	\N	1	2025-11-22 12:07:41.393176	\N	\N
2159	\N	1	\N	1	2025-11-22 12:07:42.450452	\N	\N
2160	\N	1	\N	1	2025-11-22 12:07:43.569111	\N	\N
2161	\N	1	\N	1	2025-11-22 12:07:44.591684	\N	\N
2162	\N	1	\N	1	2025-11-22 12:07:45.700648	\N	\N
2163	\N	1	\N	1	2025-11-22 12:07:46.714407	\N	\N
2164	\N	1	\N	1	2025-11-22 12:07:47.891709	\N	\N
2165	\N	1	\N	1	2025-11-22 12:07:48.892797	\N	\N
2166	\N	2	\N	0	2025-11-23 03:59:06.906152	\N	\N
2167	\N	2	\N	1	2025-11-23 03:59:08.010342	\N	\N
2168	\N	2	\N	1	2025-11-23 03:59:09.275487	\N	\N
2169	\N	2	\N	0	2025-11-23 03:59:10.329595	\N	\N
2170	\N	2	\N	0	2025-11-23 03:59:11.554543	\N	\N
2171	\N	2	\N	0	2025-11-23 03:59:12.725677	\N	\N
2172	\N	2	\N	0	2025-11-23 03:59:13.763098	\N	\N
2173	\N	2	\N	1	2025-11-23 03:59:14.871009	\N	\N
2174	\N	2	\N	1	2025-11-23 03:59:15.977536	\N	\N
2175	\N	2	\N	1	2025-11-23 04:06:43.050597	\N	\N
2176	\N	2	\N	0	2025-11-23 04:06:44.062822	\N	\N
2177	\N	2	\N	0	2025-11-23 04:06:45.171985	\N	\N
2178	\N	2	\N	1	2025-11-23 04:06:46.276835	\N	\N
2179	\N	2	\N	1	2025-11-23 04:06:47.301205	\N	\N
2180	\N	2	\N	0	2025-11-23 04:06:48.431792	\N	\N
2181	\N	2	\N	0	2025-11-23 04:06:49.442753	\N	\N
2182	\N	2	\N	1	2025-11-23 04:06:50.537394	\N	\N
2183	\N	2	\N	0	2025-11-23 04:06:51.661683	\N	\N
2184	\N	2	\N	0	2025-11-23 04:06:52.735844	\N	\N
2185	\N	2	\N	0	2025-11-23 04:06:53.771999	\N	\N
2186	\N	2	\N	1	2025-11-23 04:06:54.858946	\N	\N
2187	\N	2	\N	0	2025-11-23 04:06:55.894134	\N	\N
2188	\N	2	\N	0	2025-11-23 04:06:57.051073	\N	\N
2189	\N	2	\N	0	2025-11-23 04:06:58.223005	\N	\N
2190	\N	2	\N	0	2025-11-23 04:06:59.31311	\N	\N
2191	\N	2	\N	1	2025-11-23 04:07:00.352939	\N	\N
2192	\N	2	\N	0	2025-11-23 04:07:01.415493	\N	\N
2193	\N	2	\N	0	2025-11-23 04:07:02.468218	\N	\N
2194	\N	2	\N	0	2025-11-23 04:07:03.553756	\N	\N
2195	\N	2	\N	1	2025-11-23 04:07:04.694837	\N	\N
2196	\N	2	\N	1	2025-11-23 04:07:05.734541	\N	\N
2197	\N	2	\N	0	2025-11-23 04:07:06.765236	\N	\N
2198	\N	2	\N	0	2025-11-23 04:07:07.789229	\N	\N
2199	\N	2	\N	1	2025-11-23 04:07:08.907123	\N	\N
2200	\N	2	\N	0	2025-11-23 04:07:09.910815	\N	\N
2201	\N	2	\N	1	2025-11-23 04:07:10.944865	\N	\N
2202	\N	2	\N	0	2025-11-23 04:07:12.068071	\N	\N
2203	\N	2	\N	0	2025-11-23 04:07:13.091659	\N	\N
2204	\N	2	\N	0	2025-11-23 04:07:14.17047	\N	\N
2205	\N	2	\N	1	2025-11-23 04:07:15.265102	\N	\N
2206	\N	2	\N	1	2025-11-23 04:07:16.401845	\N	\N
2207	\N	2	\N	0	2025-11-23 04:07:17.548195	\N	\N
2208	\N	2	\N	1	2025-11-23 04:07:18.585798	\N	\N
2209	\N	2	\N	0	2025-11-23 04:07:19.666249	\N	\N
2210	\N	2	\N	0	2025-11-23 04:07:20.797552	\N	\N
2211	\N	2	\N	0	2025-11-23 04:07:21.871391	\N	\N
2212	\N	2	\N	0	2025-11-23 04:07:23.013885	\N	\N
2213	\N	2	\N	0	2025-11-23 04:07:24.045473	\N	\N
2214	\N	2	\N	1	2025-11-23 04:07:25.142356	\N	\N
2215	\N	2	\N	0	2025-11-23 04:07:26.253007	\N	\N
2216	\N	2	\N	0	2025-11-23 04:07:27.36043	\N	\N
2217	\N	2	\N	0	2025-11-23 04:07:28.446879	\N	\N
2218	\N	2	\N	1	2025-11-23 04:07:29.52863	\N	\N
2219	\N	2	\N	1	2025-11-23 04:07:30.533205	\N	\N
2220	\N	2	\N	1	2025-11-23 04:08:43.033943	\N	\N
2221	\N	2	\N	0	2025-11-23 04:08:44.068648	\N	\N
2222	\N	2	\N	0	2025-11-23 04:08:45.181233	\N	\N
2223	\N	2	\N	0	2025-11-23 04:08:46.274841	\N	\N
2229	\N	2	\N	1	2025-11-23 04:08:52.670108	\N	\N
3891	\N	2	\N	1	2025-11-23 05:44:08.952444	\N	\N
3892	\N	2	\N	1	2025-11-23 05:44:09.997096	\N	\N
3898	\N	2	\N	1	2025-11-23 05:44:16.466119	\N	\N
3899	\N	2	\N	1	2025-11-23 05:44:17.578211	\N	\N
3900	\N	2	\N	1	2025-11-23 05:44:18.648253	\N	\N
3901	\N	2	\N	1	2025-11-23 05:44:19.706643	\N	\N
3902	\N	2	\N	0	2025-11-23 05:44:20.86695	\N	\N
3907	\N	2	\N	2	2025-11-23 05:44:26.492452	\N	\N
3908	\N	2	\N	1	2025-11-23 05:44:27.607246	\N	\N
3909	\N	2	\N	1	2025-11-23 05:44:28.716799	\N	\N
3910	\N	2	\N	1	2025-11-23 05:44:29.794573	\N	\N
3921	\N	2	\N	1	2025-11-23 05:44:41.868871	\N	\N
3922	\N	2	\N	0	2025-11-23 05:44:42.96163	\N	\N
3923	\N	2	\N	1	2025-11-23 05:44:44.004673	\N	\N
3924	\N	2	\N	1	2025-11-23 05:44:45.011875	\N	\N
3930	\N	2	\N	1	2025-11-23 05:44:51.731099	\N	\N
3931	\N	2	\N	1	2025-11-23 05:44:52.876488	\N	\N
3976	\N	2	\N	0	2025-11-23 06:39:52.995963	\N	\N
3977	\N	2	\N	0	2025-11-23 06:39:53.986841	\N	\N
3978	\N	2	\N	0	2025-11-23 06:39:55.135398	\N	\N
3979	\N	2	\N	0	2025-11-23 06:39:56.15538	\N	\N
3984	\N	2	\N	0	2025-11-23 06:40:01.675866	\N	\N
3985	\N	2	\N	0	2025-11-23 06:40:02.757671	\N	\N
3986	\N	2	\N	0	2025-11-23 06:40:03.906421	\N	\N
3987	\N	2	\N	0	2025-11-23 06:40:04.914176	\N	\N
3988	\N	2	\N	0	2025-11-23 06:40:06.085449	\N	\N
3993	\N	2	\N	0	2025-11-23 06:40:11.731518	\N	\N
3994	\N	2	\N	0	2025-11-23 06:40:12.788042	\N	\N
3995	\N	2	\N	0	2025-11-23 06:40:13.932694	\N	\N
3996	\N	2	\N	0	2025-11-23 06:40:14.9347	\N	\N
3997	\N	2	\N	0	2025-11-23 06:40:16.124578	\N	\N
4002	\N	2	\N	0	2025-11-23 06:40:21.70404	\N	\N
4003	\N	2	\N	0	2025-11-23 06:40:22.842559	\N	\N
4004	\N	2	\N	0	2025-11-23 06:40:24.006272	\N	\N
4005	\N	2	\N	0	2025-11-23 06:40:25.170327	\N	\N
4011	\N	2	\N	1	2025-11-23 06:40:31.686183	\N	\N
4012	\N	2	\N	1	2025-11-23 06:40:32.770276	\N	\N
4013	\N	2	\N	1	2025-11-23 06:40:33.820439	\N	\N
4014	\N	2	\N	1	2025-11-23 06:40:34.88002	\N	\N
4015	\N	2	\N	1	2025-11-23 06:40:35.923497	\N	\N
4020	\N	2	\N	0	2025-11-23 06:40:41.40779	\N	\N
4021	\N	2	\N	0	2025-11-23 06:40:42.616726	\N	\N
4022	\N	2	\N	0	2025-11-23 06:40:43.74266	\N	\N
4023	\N	2	\N	1	2025-11-23 06:40:44.848031	\N	\N
4024	\N	2	\N	1	2025-11-23 06:40:45.880781	\N	\N
4116	\N	2	\N	1	2025-11-23 06:49:49.663775	\N	\N
4117	\N	2	\N	1	2025-11-23 06:49:50.659735	\N	\N
4118	\N	2	\N	1	2025-11-23 06:49:51.802726	\N	\N
4119	\N	2	\N	1	2025-11-23 06:49:52.976112	\N	\N
4120	\N	2	\N	1	2025-11-23 06:49:54.027191	\N	\N
4121	\N	2	\N	1	2025-11-23 06:49:55.069978	\N	\N
4122	\N	2	\N	1	2025-11-23 06:49:56.212846	\N	\N
4128	\N	2	\N	1	2025-11-23 06:50:02.679038	\N	\N
4129	\N	2	\N	1	2025-11-23 06:50:03.767168	\N	\N
4130	\N	2	\N	1	2025-11-23 06:50:04.832406	\N	\N
4131	\N	2	\N	2	2025-11-23 06:50:05.870781	\N	\N
4132	\N	2	\N	1	2025-11-23 06:50:06.947081	\N	\N
4137	\N	2	\N	1	2025-11-23 06:50:12.328291	\N	\N
4138	\N	2	\N	1	2025-11-23 06:50:13.35922	\N	\N
4139	\N	2	\N	0	2025-11-23 06:50:14.554002	\N	\N
4140	\N	2	\N	0	2025-11-23 06:50:15.776093	\N	\N
4141	\N	2	\N	0	2025-11-23 06:50:17.001277	\N	\N
4146	\N	2	\N	1	2025-11-23 06:50:22.737539	\N	\N
4147	\N	2	\N	1	2025-11-23 06:50:23.907564	\N	\N
4148	\N	2	\N	0	2025-11-23 06:50:24.911191	\N	\N
4149	\N	2	\N	0	2025-11-23 06:50:25.94064	\N	\N
4150	\N	2	\N	1	2025-11-23 06:50:26.957499	\N	\N
4155	\N	2	\N	1	2025-11-23 06:50:32.122788	\N	\N
4156	\N	2	\N	1	2025-11-23 06:50:33.146723	\N	\N
4157	\N	2	\N	1	2025-11-23 06:50:34.241153	\N	\N
4158	\N	2	\N	1	2025-11-23 06:50:35.350952	\N	\N
4159	\N	2	\N	1	2025-11-23 06:50:36.474755	\N	\N
4165	\N	2	\N	0	2025-11-23 06:50:43.178696	\N	\N
4166	\N	2	\N	0	2025-11-23 06:50:44.490314	\N	\N
4167	\N	2	\N	0	2025-11-23 06:50:45.800858	\N	\N
4168	\N	2	\N	1	2025-11-23 06:50:46.958277	\N	\N
4173	\N	2	\N	1	2025-11-23 06:50:52.681974	\N	\N
4174	\N	2	\N	1	2025-11-23 06:50:53.683415	\N	\N
4175	\N	2	\N	1	2025-11-23 06:50:54.759175	\N	\N
4176	\N	2	\N	1	2025-11-23 06:50:55.769072	\N	\N
4177	\N	2	\N	1	2025-11-23 06:50:56.859934	\N	\N
4182	\N	2	\N	1	2025-11-23 06:51:02.300113	\N	\N
4183	\N	2	\N	1	2025-11-23 06:51:03.322546	\N	\N
4184	\N	2	\N	1	2025-11-23 06:51:04.424927	\N	\N
4185	\N	2	\N	1	2025-11-23 06:51:05.456084	\N	\N
4186	\N	2	\N	1	2025-11-23 06:51:06.563757	\N	\N
4192	\N	2	\N	1	2025-11-23 06:51:13.040143	\N	\N
4193	\N	2	\N	1	2025-11-23 06:51:14.081397	\N	\N
4194	\N	2	\N	1	2025-11-23 06:51:15.170563	\N	\N
4195	\N	2	\N	1	2025-11-23 06:51:16.214471	\N	\N
4201	\N	2	\N	1	2025-11-23 06:51:22.922936	\N	\N
4202	\N	2	\N	1	2025-11-23 06:51:24.020207	\N	\N
4203	\N	2	\N	1	2025-11-23 06:51:25.114768	\N	\N
4204	\N	2	\N	1	2025-11-23 06:51:26.140095	\N	\N
4205	\N	2	\N	1	2025-11-23 06:51:27.235303	\N	\N
4206	\N	2	\N	1	2025-11-23 06:51:28.312905	\N	\N
4207	\N	2	\N	1	2025-11-23 06:51:29.401437	\N	\N
4208	\N	2	\N	1	2025-11-23 06:51:30.432318	\N	\N
4209	\N	2	\N	1	2025-11-23 06:51:31.454429	\N	\N
4215	\N	2	\N	0	2025-11-23 06:51:37.908429	\N	\N
4216	\N	2	\N	0	2025-11-23 06:51:38.965283	\N	\N
4217	\N	2	\N	1	2025-11-23 06:51:39.996688	\N	\N
4218	\N	2	\N	1	2025-11-23 06:51:41.128002	\N	\N
4268	\N	2	\N	2	2025-11-23 07:21:02.795355	\N	\N
4269	\N	2	\N	2	2025-11-23 07:21:03.843512	\N	\N
4279	\N	2	\N	1	2025-11-23 07:21:14.642215	\N	\N
4280	\N	2	\N	1	2025-11-23 07:21:15.705508	\N	\N
4281	\N	2	\N	1	2025-11-23 07:21:16.731241	\N	\N
4282	\N	2	\N	1	2025-11-23 07:21:17.756762	\N	\N
4283	\N	2	\N	1	2025-11-23 07:21:18.808289	\N	\N
4289	\N	2	\N	1	2025-11-23 07:21:25.225585	\N	\N
4290	\N	2	\N	1	2025-11-23 07:21:26.32338	\N	\N
4291	\N	2	\N	1	2025-11-23 07:21:27.475544	\N	\N
4292	\N	2	\N	1	2025-11-23 07:21:28.521655	\N	\N
4293	\N	2	\N	1	2025-11-23 07:21:29.700044	\N	\N
4294	\N	2	\N	0	2025-11-23 07:21:30.771275	\N	\N
4295	\N	2	\N	0	2025-11-23 07:21:31.807595	\N	\N
4296	\N	2	\N	1	2025-11-23 07:21:32.966042	\N	\N
4297	\N	2	\N	0	2025-11-23 07:21:34.266153	\N	\N
4302	\N	2	\N	2	2025-11-23 07:21:39.835469	\N	\N
4303	\N	2	\N	0	2025-11-23 07:21:41.219582	\N	\N
4304	\N	2	\N	1	2025-11-23 07:21:42.203126	\N	\N
4305	\N	2	\N	1	2025-11-23 07:21:43.290698	\N	\N
4306	\N	2	\N	1	2025-11-23 07:21:44.345874	\N	\N
4311	\N	2	\N	1	2025-11-23 07:21:50.055176	\N	\N
4312	\N	2	\N	1	2025-11-23 07:21:51.077927	\N	\N
4313	\N	2	\N	1	2025-11-23 07:21:52.140881	\N	\N
4314	\N	2	\N	1	2025-11-23 07:21:53.180489	\N	\N
4315	\N	2	\N	1	2025-11-23 07:21:54.391714	\N	\N
4316	\N	2	\N	1	2025-11-23 07:21:55.747972	\N	\N
4317	\N	2	\N	1	2025-11-23 07:21:56.884455	\N	\N
4318	\N	2	\N	1	2025-11-23 07:21:58.024316	\N	\N
4320	\N	2	\N	1	2025-11-23 07:22:00.28828	\N	\N
4321	\N	2	\N	0	2025-11-23 07:22:01.317277	\N	\N
4322	\N	2	\N	1	2025-11-23 07:22:02.419553	\N	\N
4323	\N	2	\N	1	2025-11-23 07:22:03.421876	\N	\N
4324	\N	2	\N	0	2025-11-23 07:22:04.645894	\N	\N
4329	\N	2	\N	1	2025-11-23 07:22:10.163318	\N	\N
4330	\N	2	\N	1	2025-11-23 07:22:11.337239	\N	\N
4331	\N	2	\N	1	2025-11-23 07:22:12.344748	\N	\N
4332	\N	2	\N	1	2025-11-23 07:22:13.457657	\N	\N
4333	\N	2	\N	1	2025-11-23 07:22:14.495037	\N	\N
4338	\N	2	\N	0	2025-11-23 07:22:20.042034	\N	\N
4339	\N	2	\N	0	2025-11-23 07:22:21.323001	\N	\N
4340	\N	2	\N	1	2025-11-23 07:22:22.362832	\N	\N
4341	\N	2	\N	1	2025-11-23 07:22:23.513914	\N	\N
4367	\N	2	\N	2	2025-11-23 07:28:57.984491	\N	\N
4368	\N	2	\N	2	2025-11-23 07:28:59.24673	\N	\N
4369	\N	2	\N	1	2025-11-23 07:29:00.249794	\N	\N
4370	\N	2	\N	2	2025-11-23 07:29:01.645228	\N	\N
4371	\N	2	\N	2	2025-11-23 07:29:02.64704	\N	\N
4372	\N	2	\N	2	2025-11-23 07:29:03.677225	\N	\N
4373	\N	2	\N	2	2025-11-23 07:29:05.080199	\N	\N
4374	\N	2	\N	1	2025-11-23 07:29:06.248083	\N	\N
4379	\N	2	\N	1	2025-11-23 07:29:12.039414	\N	\N
2224	\N	2	\N	0	2025-11-23 04:08:47.354265	\N	\N
2225	\N	2	\N	1	2025-11-23 04:08:48.412266	\N	\N
2226	\N	2	\N	0	2025-11-23 04:08:49.458074	\N	\N
2227	\N	2	\N	0	2025-11-23 04:08:50.526635	\N	\N
2228	\N	2	\N	0	2025-11-23 04:08:51.577582	\N	\N
2230	\N	2	\N	0	2025-11-23 04:16:28.217417	\N	\N
2231	\N	2	\N	0	2025-11-23 04:16:29.343462	\N	\N
2232	\N	2	\N	0	2025-11-23 04:16:30.512639	\N	\N
2233	\N	2	\N	0	2025-11-23 04:16:31.57047	\N	\N
2234	\N	2	\N	1	2025-11-23 04:16:32.579421	\N	\N
2235	\N	2	\N	1	2025-11-23 04:16:33.664968	\N	\N
2236	\N	2	\N	1	2025-11-23 04:16:34.691683	\N	\N
2237	\N	2	\N	1	2025-11-23 04:16:35.774207	\N	\N
2238	\N	2	\N	1	2025-11-23 04:16:36.778945	\N	\N
2239	\N	2	\N	1	2025-11-23 04:16:37.804693	\N	\N
2240	\N	2	\N	1	2025-11-23 04:16:38.900858	\N	\N
2241	\N	2	\N	0	2025-11-23 04:16:39.987371	\N	\N
2242	\N	2	\N	0	2025-11-23 04:16:41.013899	\N	\N
2243	\N	2	\N	0	2025-11-23 04:16:42.140663	\N	\N
2244	\N	2	\N	1	2025-11-23 04:16:43.225024	\N	\N
2245	\N	2	\N	1	2025-11-23 04:16:44.297966	\N	\N
2246	\N	2	\N	1	2025-11-23 04:16:45.427946	\N	\N
2247	\N	2	\N	1	2025-11-23 04:16:46.449546	\N	\N
2248	\N	2	\N	1	2025-11-23 04:16:47.48322	\N	\N
2249	\N	2	\N	1	2025-11-23 04:16:48.527879	\N	\N
2250	\N	2	\N	0	2025-11-23 05:07:59.200453	\N	\N
2251	\N	2	\N	0	2025-11-23 05:08:00.255691	\N	\N
2252	\N	2	\N	0	2025-11-23 05:08:01.338674	\N	\N
2253	\N	2	\N	0	2025-11-23 05:08:02.393019	\N	\N
2254	\N	2	\N	0	2025-11-23 05:08:03.690577	\N	\N
2255	\N	2	\N	1	2025-11-23 05:08:04.736263	\N	\N
2256	\N	2	\N	1	2025-11-23 05:08:05.757823	\N	\N
2257	\N	2	\N	1	2025-11-23 05:08:06.82084	\N	\N
2258	\N	2	\N	1	2025-11-23 05:08:07.996392	\N	\N
2259	\N	2	\N	1	2025-11-23 05:08:09.063865	\N	\N
2260	\N	2	\N	1	2025-11-23 05:08:10.164179	\N	\N
2261	\N	2	\N	1	2025-11-23 05:08:11.25581	\N	\N
2262	\N	2	\N	1	2025-11-23 05:08:12.476197	\N	\N
2263	\N	2	\N	0	2025-11-23 05:08:13.647399	\N	\N
2264	\N	2	\N	0	2025-11-23 05:08:14.737644	\N	\N
2265	\N	2	\N	1	2025-11-23 05:08:15.835128	\N	\N
2266	\N	2	\N	1	2025-11-23 05:08:16.933385	\N	\N
2267	\N	2	\N	0	2025-11-23 05:08:18.038275	\N	\N
2268	\N	2	\N	0	2025-11-23 05:08:19.086636	\N	\N
2269	\N	2	\N	1	2025-11-23 05:08:20.179316	\N	\N
2270	\N	2	\N	1	2025-11-23 05:08:21.250791	\N	\N
2271	\N	2	\N	1	2025-11-23 05:08:22.319851	\N	\N
2272	\N	2	\N	2	2025-11-23 05:08:23.450652	\N	\N
2273	\N	2	\N	1	2025-11-23 05:08:24.554506	\N	\N
2274	\N	2	\N	2	2025-11-23 05:08:25.611035	\N	\N
2275	\N	2	\N	1	2025-11-23 05:08:26.756212	\N	\N
2276	\N	2	\N	0	2025-11-23 05:08:27.921635	\N	\N
2277	\N	2	\N	0	2025-11-23 05:08:28.929758	\N	\N
2278	\N	2	\N	0	2025-11-23 05:08:29.980119	\N	\N
2279	\N	2	\N	1	2025-11-23 05:08:31.01371	\N	\N
2280	\N	2	\N	0	2025-11-23 05:08:32.086024	\N	\N
2281	\N	2	\N	0	2025-11-23 05:08:33.206622	\N	\N
2282	\N	2	\N	1	2025-11-23 05:08:34.278054	\N	\N
2283	\N	2	\N	1	2025-11-23 05:08:35.404844	\N	\N
2284	\N	2	\N	1	2025-11-23 05:08:36.452698	\N	\N
2285	\N	2	\N	1	2025-11-23 05:08:37.543873	\N	\N
2286	\N	2	\N	1	2025-11-23 05:08:38.575115	\N	\N
2287	\N	2	\N	1	2025-11-23 05:08:39.643484	\N	\N
2288	\N	2	\N	1	2025-11-23 05:08:40.721954	\N	\N
2289	\N	2	\N	1	2025-11-23 05:08:41.851413	\N	\N
2290	\N	2	\N	2	2025-11-23 05:08:42.884156	\N	\N
2291	\N	2	\N	2	2025-11-23 05:08:43.96922	\N	\N
2292	\N	2	\N	2	2025-11-23 05:08:45.136481	\N	\N
2293	\N	2	\N	1	2025-11-23 05:08:46.314463	\N	\N
2294	\N	2	\N	1	2025-11-23 05:08:47.395628	\N	\N
2295	\N	2	\N	1	2025-11-23 05:08:48.49313	\N	\N
2296	\N	2	\N	1	2025-11-23 05:08:49.643938	\N	\N
2297	\N	2	\N	1	2025-11-23 05:08:50.654174	\N	\N
2298	\N	2	\N	1	2025-11-23 05:08:51.761739	\N	\N
2299	\N	2	\N	1	2025-11-23 05:08:52.904142	\N	\N
2300	\N	2	\N	1	2025-11-23 05:08:53.911536	\N	\N
2301	\N	2	\N	1	2025-11-23 05:08:55.002888	\N	\N
2302	\N	2	\N	1	2025-11-23 05:08:56.198384	\N	\N
2303	\N	2	\N	1	2025-11-23 05:08:57.185187	\N	\N
2304	\N	2	\N	1	2025-11-23 05:08:58.227228	\N	\N
2305	\N	2	\N	1	2025-11-23 05:08:59.319475	\N	\N
2306	\N	2	\N	1	2025-11-23 05:09:00.430345	\N	\N
2307	\N	2	\N	1	2025-11-23 05:09:01.626564	\N	\N
2308	\N	2	\N	1	2025-11-23 05:09:02.930529	\N	\N
2309	\N	2	\N	1	2025-11-23 05:09:04.202437	\N	\N
2310	\N	2	\N	1	2025-11-23 05:09:05.225398	\N	\N
2311	\N	2	\N	1	2025-11-23 05:09:06.259146	\N	\N
2312	\N	2	\N	1	2025-11-23 05:09:07.30792	\N	\N
2313	\N	2	\N	1	2025-11-23 05:09:08.355322	\N	\N
2314	\N	2	\N	1	2025-11-23 05:09:09.466182	\N	\N
2315	\N	2	\N	1	2025-11-23 05:09:10.496401	\N	\N
2316	\N	2	\N	1	2025-11-23 05:09:11.524147	\N	\N
2317	\N	2	\N	1	2025-11-23 05:09:12.540507	\N	\N
2318	\N	2	\N	1	2025-11-23 05:09:13.706789	\N	\N
2319	\N	2	\N	1	2025-11-23 05:09:14.784987	\N	\N
2320	\N	2	\N	1	2025-11-23 05:09:15.799678	\N	\N
2321	\N	2	\N	1	2025-11-23 05:09:16.827637	\N	\N
2322	\N	2	\N	1	2025-11-23 05:09:17.861078	\N	\N
2323	\N	2	\N	0	2025-11-23 05:09:18.966336	\N	\N
2324	\N	2	\N	0	2025-11-23 05:09:20.077499	\N	\N
2325	\N	2	\N	0	2025-11-23 05:09:21.12063	\N	\N
2326	\N	2	\N	0	2025-11-23 05:09:22.183723	\N	\N
2327	\N	2	\N	0	2025-11-23 05:09:23.256221	\N	\N
2328	\N	2	\N	0	2025-11-23 05:09:24.273641	\N	\N
2329	\N	2	\N	0	2025-11-23 05:09:25.344815	\N	\N
2330	\N	2	\N	0	2025-11-23 05:09:26.383523	\N	\N
2331	\N	2	\N	0	2025-11-23 05:09:27.436155	\N	\N
2332	\N	2	\N	0	2025-11-23 05:09:28.517599	\N	\N
2333	\N	2	\N	0	2025-11-23 05:09:29.615605	\N	\N
2334	\N	2	\N	0	2025-11-23 05:09:30.685084	\N	\N
2335	\N	2	\N	1	2025-11-23 05:09:31.872693	\N	\N
2336	\N	2	\N	1	2025-11-23 05:09:32.911301	\N	\N
2337	\N	2	\N	1	2025-11-23 05:09:33.949117	\N	\N
2338	\N	2	\N	1	2025-11-23 05:09:35.022203	\N	\N
2339	\N	2	\N	1	2025-11-23 05:09:36.080589	\N	\N
2340	\N	2	\N	1	2025-11-23 05:09:37.086758	\N	\N
2341	\N	2	\N	1	2025-11-23 05:09:38.275696	\N	\N
2342	\N	2	\N	1	2025-11-23 05:09:39.408558	\N	\N
2343	\N	2	\N	1	2025-11-23 05:09:40.566816	\N	\N
2344	\N	2	\N	1	2025-11-23 05:09:41.726249	\N	\N
2345	\N	2	\N	1	2025-11-23 05:09:42.848013	\N	\N
2346	\N	2	\N	1	2025-11-23 05:09:44.011725	\N	\N
2347	\N	2	\N	1	2025-11-23 05:09:45.190522	\N	\N
2348	\N	2	\N	1	2025-11-23 05:09:46.338607	\N	\N
2349	\N	2	\N	1	2025-11-23 05:09:47.474332	\N	\N
2350	\N	2	\N	1	2025-11-23 05:09:48.521736	\N	\N
2351	\N	2	\N	1	2025-11-23 05:09:49.599136	\N	\N
2352	\N	2	\N	1	2025-11-23 05:09:50.645054	\N	\N
2353	\N	2	\N	1	2025-11-23 05:09:51.697486	\N	\N
2354	\N	2	\N	1	2025-11-23 05:09:52.851092	\N	\N
2355	\N	2	\N	1	2025-11-23 05:09:53.856438	\N	\N
2356	\N	2	\N	1	2025-11-23 05:09:54.979766	\N	\N
2357	\N	2	\N	1	2025-11-23 05:09:56.111973	\N	\N
2358	\N	2	\N	1	2025-11-23 05:09:57.12361	\N	\N
2359	\N	2	\N	1	2025-11-23 05:09:58.234808	\N	\N
2360	\N	2	\N	1	2025-11-23 05:09:59.33124	\N	\N
2361	\N	2	\N	1	2025-11-23 05:10:00.455215	\N	\N
2362	\N	2	\N	1	2025-11-23 05:10:01.600509	\N	\N
2363	\N	2	\N	0	2025-11-23 05:10:02.620208	\N	\N
2364	\N	2	\N	0	2025-11-23 05:10:03.753198	\N	\N
2365	\N	2	\N	1	2025-11-23 05:10:04.761394	\N	\N
2366	\N	2	\N	1	2025-11-23 05:10:05.782259	\N	\N
2367	\N	2	\N	1	2025-11-23 05:10:06.924268	\N	\N
2368	\N	2	\N	1	2025-11-23 05:10:08.021378	\N	\N
2369	\N	2	\N	1	2025-11-23 05:10:09.136802	\N	\N
2370	\N	2	\N	1	2025-11-23 05:10:10.246023	\N	\N
2371	\N	2	\N	1	2025-11-23 05:10:11.288698	\N	\N
2372	\N	2	\N	1	2025-11-23 05:10:12.390682	\N	\N
2373	\N	2	\N	1	2025-11-23 05:10:13.502751	\N	\N
2374	\N	2	\N	1	2025-11-23 05:10:14.504021	\N	\N
2375	\N	2	\N	1	2025-11-23 05:10:15.676858	\N	\N
2376	\N	2	\N	1	2025-11-23 05:10:16.820457	\N	\N
2377	\N	2	\N	1	2025-11-23 05:10:17.964029	\N	\N
2378	\N	2	\N	1	2025-11-23 05:10:19.078736	\N	\N
2379	\N	2	\N	1	2025-11-23 05:10:20.194203	\N	\N
2380	\N	2	\N	1	2025-11-23 05:10:21.315999	\N	\N
2381	\N	2	\N	1	2025-11-23 05:10:22.442984	\N	\N
2382	\N	2	\N	1	2025-11-23 05:10:23.607465	\N	\N
2383	\N	2	\N	0	2025-11-23 05:10:24.675	\N	\N
2384	\N	2	\N	1	2025-11-23 05:10:25.717504	\N	\N
2385	\N	2	\N	0	2025-11-23 05:10:26.836394	\N	\N
2390	\N	2	\N	1	2025-11-23 05:10:32.217254	\N	\N
2391	\N	2	\N	1	2025-11-23 05:10:33.298902	\N	\N
2392	\N	2	\N	1	2025-11-23 05:10:34.444035	\N	\N
2393	\N	2	\N	1	2025-11-23 05:10:35.446709	\N	\N
2394	\N	2	\N	0	2025-11-23 05:10:36.580794	\N	\N
2399	\N	2	\N	0	2025-11-23 05:10:42.00921	\N	\N
2400	\N	2	\N	0	2025-11-23 05:10:43.020377	\N	\N
2401	\N	2	\N	0	2025-11-23 05:10:44.173653	\N	\N
2402	\N	2	\N	0	2025-11-23 05:10:45.310422	\N	\N
2403	\N	2	\N	0	2025-11-23 05:10:46.439134	\N	\N
2408	\N	2	\N	0	2025-11-23 05:10:51.930303	\N	\N
2409	\N	2	\N	1	2025-11-23 05:10:52.957934	\N	\N
2410	\N	2	\N	2	2025-11-23 05:10:54.172077	\N	\N
2411	\N	2	\N	1	2025-11-23 05:10:55.268094	\N	\N
2412	\N	2	\N	1	2025-11-23 05:10:56.290806	\N	\N
2418	\N	2	\N	1	2025-11-23 05:11:03.16589	\N	\N
2419	\N	2	\N	1	2025-11-23 05:11:04.322398	\N	\N
2420	\N	2	\N	1	2025-11-23 05:11:05.553069	\N	\N
2421	\N	2	\N	1	2025-11-23 05:11:06.640316	\N	\N
2426	\N	2	\N	1	2025-11-23 05:11:12.318827	\N	\N
2427	\N	2	\N	1	2025-11-23 05:11:13.360197	\N	\N
2428	\N	2	\N	1	2025-11-23 05:11:14.615571	\N	\N
2429	\N	2	\N	1	2025-11-23 05:11:15.89444	\N	\N
2430	\N	2	\N	1	2025-11-23 05:11:16.949572	\N	\N
2431	\N	2	\N	1	2025-11-23 05:11:17.983595	\N	\N
2432	\N	2	\N	1	2025-11-23 05:11:18.996012	\N	\N
2433	\N	2	\N	1	2025-11-23 05:11:20.122985	\N	\N
2434	\N	2	\N	1	2025-11-23 05:11:21.239742	\N	\N
2435	\N	2	\N	1	2025-11-23 05:11:22.330294	\N	\N
3893	\N	2	\N	1	2025-11-23 05:44:11.106238	\N	\N
3894	\N	2	\N	1	2025-11-23 05:44:12.178182	\N	\N
3895	\N	2	\N	1	2025-11-23 05:44:13.260423	\N	\N
3896	\N	2	\N	1	2025-11-23 05:44:14.331121	\N	\N
3897	\N	2	\N	1	2025-11-23 05:44:15.377025	\N	\N
3903	\N	2	\N	0	2025-11-23 05:44:22.128953	\N	\N
3904	\N	2	\N	0	2025-11-23 05:44:23.15374	\N	\N
3905	\N	2	\N	0	2025-11-23 05:44:24.292231	\N	\N
3906	\N	2	\N	1	2025-11-23 05:44:25.378604	\N	\N
3911	\N	2	\N	1	2025-11-23 05:44:31.096719	\N	\N
3912	\N	2	\N	2	2025-11-23 05:44:32.144353	\N	\N
3913	\N	2	\N	1	2025-11-23 05:44:33.26053	\N	\N
3914	\N	2	\N	1	2025-11-23 05:44:34.339778	\N	\N
3915	\N	2	\N	1	2025-11-23 05:44:35.354301	\N	\N
3916	\N	2	\N	2	2025-11-23 05:44:36.427877	\N	\N
3917	\N	2	\N	2	2025-11-23 05:44:37.56983	\N	\N
3918	\N	2	\N	2	2025-11-23 05:44:38.57923	\N	\N
3919	\N	2	\N	2	2025-11-23 05:44:39.615363	\N	\N
3920	\N	2	\N	2	2025-11-23 05:44:40.723668	\N	\N
3925	\N	2	\N	1	2025-11-23 05:44:46.146621	\N	\N
3926	\N	2	\N	1	2025-11-23 05:44:47.303696	\N	\N
3927	\N	2	\N	1	2025-11-23 05:44:48.479565	\N	\N
3928	\N	2	\N	1	2025-11-23 05:44:49.530223	\N	\N
3929	\N	2	\N	1	2025-11-23 05:44:50.601586	\N	\N
3980	\N	2	\N	0	2025-11-23 06:39:57.202122	\N	\N
3981	\N	2	\N	0	2025-11-23 06:39:58.25831	\N	\N
3982	\N	2	\N	0	2025-11-23 06:39:59.298724	\N	\N
3983	\N	2	\N	0	2025-11-23 06:40:00.497481	\N	\N
3989	\N	2	\N	0	2025-11-23 06:40:07.265822	\N	\N
3990	\N	2	\N	1	2025-11-23 06:40:08.393557	\N	\N
3991	\N	2	\N	0	2025-11-23 06:40:09.452494	\N	\N
3992	\N	2	\N	2	2025-11-23 06:40:10.611634	\N	\N
3998	\N	2	\N	0	2025-11-23 06:40:17.259203	\N	\N
3999	\N	2	\N	0	2025-11-23 06:40:18.451432	\N	\N
4000	\N	2	\N	1	2025-11-23 06:40:19.488955	\N	\N
4001	\N	2	\N	1	2025-11-23 06:40:20.628448	\N	\N
4006	\N	2	\N	0	2025-11-23 06:40:26.343341	\N	\N
4007	\N	2	\N	0	2025-11-23 06:40:27.488072	\N	\N
4008	\N	2	\N	0	2025-11-23 06:40:28.59176	\N	\N
4009	\N	2	\N	0	2025-11-23 06:40:29.667889	\N	\N
4010	\N	2	\N	0	2025-11-23 06:40:30.686081	\N	\N
4016	\N	2	\N	1	2025-11-23 06:40:36.95932	\N	\N
4017	\N	2	\N	0	2025-11-23 06:40:38.000702	\N	\N
4018	\N	2	\N	0	2025-11-23 06:40:39.133944	\N	\N
4019	\N	2	\N	0	2025-11-23 06:40:40.268249	\N	\N
4025	\N	2	\N	1	2025-11-23 06:40:46.913828	\N	\N
4123	\N	2	\N	1	2025-11-23 06:49:57.222197	\N	\N
4124	\N	2	\N	1	2025-11-23 06:49:58.352772	\N	\N
4125	\N	2	\N	1	2025-11-23 06:49:59.478525	\N	\N
4126	\N	2	\N	1	2025-11-23 06:50:00.49726	\N	\N
4127	\N	2	\N	1	2025-11-23 06:50:01.552291	\N	\N
4133	\N	2	\N	2	2025-11-23 06:50:08.001352	\N	\N
4134	\N	2	\N	2	2025-11-23 06:50:09.148985	\N	\N
4135	\N	2	\N	2	2025-11-23 06:50:10.222207	\N	\N
4136	\N	2	\N	1	2025-11-23 06:50:11.307581	\N	\N
4142	\N	2	\N	0	2025-11-23 06:50:18.223264	\N	\N
4143	\N	2	\N	1	2025-11-23 06:50:19.408122	\N	\N
4144	\N	2	\N	0	2025-11-23 06:50:20.449943	\N	\N
4145	\N	2	\N	1	2025-11-23 06:50:21.57503	\N	\N
4151	\N	2	\N	0	2025-11-23 06:50:27.965443	\N	\N
4152	\N	2	\N	0	2025-11-23 06:50:29.010805	\N	\N
4153	\N	2	\N	0	2025-11-23 06:50:30.060013	\N	\N
4154	\N	2	\N	1	2025-11-23 06:50:31.063366	\N	\N
4160	\N	2	\N	1	2025-11-23 06:50:37.460185	\N	\N
4161	\N	2	\N	1	2025-11-23 06:50:38.545152	\N	\N
4162	\N	2	\N	1	2025-11-23 06:50:39.632811	\N	\N
4163	\N	2	\N	1	2025-11-23 06:50:40.697104	\N	\N
4164	\N	2	\N	1	2025-11-23 06:50:41.780336	\N	\N
4169	\N	2	\N	0	2025-11-23 06:50:48.047709	\N	\N
4170	\N	2	\N	0	2025-11-23 06:50:49.345126	\N	\N
4171	\N	2	\N	0	2025-11-23 06:50:50.399909	\N	\N
4172	\N	2	\N	0	2025-11-23 06:50:51.560726	\N	\N
4178	\N	2	\N	1	2025-11-23 06:50:57.947521	\N	\N
4179	\N	2	\N	1	2025-11-23 06:50:59.028389	\N	\N
4180	\N	2	\N	1	2025-11-23 06:51:00.109017	\N	\N
4181	\N	2	\N	1	2025-11-23 06:51:01.182421	\N	\N
4187	\N	2	\N	1	2025-11-23 06:51:07.664515	\N	\N
4188	\N	2	\N	0	2025-11-23 06:51:08.751664	\N	\N
4189	\N	2	\N	1	2025-11-23 06:51:09.853055	\N	\N
4190	\N	2	\N	1	2025-11-23 06:51:10.942377	\N	\N
4191	\N	2	\N	1	2025-11-23 06:51:12.026854	\N	\N
4196	\N	2	\N	1	2025-11-23 06:51:17.593874	\N	\N
4197	\N	2	\N	0	2025-11-23 06:51:18.818765	\N	\N
4198	\N	2	\N	1	2025-11-23 06:51:19.823428	\N	\N
4199	\N	2	\N	1	2025-11-23 06:51:20.827706	\N	\N
4200	\N	2	\N	1	2025-11-23 06:51:21.848403	\N	\N
4210	\N	2	\N	1	2025-11-23 06:51:32.516167	\N	\N
4211	\N	2	\N	1	2025-11-23 06:51:33.535873	\N	\N
4212	\N	2	\N	1	2025-11-23 06:51:34.633867	\N	\N
4213	\N	2	\N	1	2025-11-23 06:51:35.751902	\N	\N
4214	\N	2	\N	0	2025-11-23 06:51:36.826725	\N	\N
4219	\N	2	\N	1	2025-11-23 06:51:42.233623	\N	\N
4220	\N	2	\N	0	2025-11-23 06:51:43.39088	\N	\N
4221	\N	2	\N	0	2025-11-23 06:51:44.548389	\N	\N
4222	\N	2	\N	1	2025-11-23 06:51:45.559585	\N	\N
4344	\N	2	\N	1	2025-11-23 07:28:30.953901	\N	\N
4350	\N	2	\N	1	2025-11-23 07:28:37.88917	\N	\N
4351	\N	2	\N	1	2025-11-23 07:28:39.11916	\N	\N
4352	\N	2	\N	1	2025-11-23 07:28:40.325683	\N	\N
4353	\N	2	\N	1	2025-11-23 07:28:41.482881	\N	\N
4358	\N	2	\N	1	2025-11-23 07:28:47.131142	\N	\N
4359	\N	2	\N	1	2025-11-23 07:28:48.261704	\N	\N
4360	\N	2	\N	2	2025-11-23 07:28:49.475201	\N	\N
4361	\N	2	\N	1	2025-11-23 07:28:50.642379	\N	\N
4362	\N	2	\N	1	2025-11-23 07:28:51.889801	\N	\N
4366	\N	2	\N	2	2025-11-23 07:28:56.975962	\N	\N
4375	\N	2	\N	1	2025-11-23 07:29:07.386283	\N	\N
4376	\N	2	\N	1	2025-11-23 07:29:08.702513	\N	\N
4377	\N	2	\N	1	2025-11-23 07:29:09.735759	\N	\N
4378	\N	2	\N	1	2025-11-23 07:29:10.762327	\N	\N
4380	\N	2	\N	1	2025-11-23 07:29:13.402785	\N	\N
4381	\N	2	\N	1	2025-11-23 07:29:14.531837	\N	\N
4382	\N	2	\N	1	2025-11-23 07:29:15.550819	\N	\N
4383	\N	2	\N	1	2025-11-23 07:29:16.940522	\N	\N
4384	\N	2	\N	1	2025-11-23 07:29:18.230893	\N	\N
4388	\N	2	\N	1	2025-11-23 07:34:09.87259	\N	\N
4389	\N	2	\N	1	2025-11-23 07:34:11.059406	\N	\N
4390	\N	2	\N	1	2025-11-23 07:34:12.215404	\N	\N
4391	\N	2	\N	1	2025-11-23 07:34:13.323524	\N	\N
4392	\N	2	\N	1	2025-11-23 07:34:14.435402	\N	\N
4393	\N	2	\N	1	2025-11-23 07:34:15.547892	\N	\N
4394	\N	2	\N	1	2025-11-23 07:34:16.559603	\N	\N
4395	\N	2	\N	1	2025-11-23 07:34:17.767365	\N	\N
4396	\N	2	\N	1	2025-11-23 07:34:19.08642	\N	\N
2386	\N	2	\N	0	2025-11-23 05:10:27.894475	\N	\N
2387	\N	2	\N	1	2025-11-23 05:10:29.013188	\N	\N
2388	\N	2	\N	1	2025-11-23 05:10:30.068264	\N	\N
2389	\N	2	\N	1	2025-11-23 05:10:31.108588	\N	\N
2395	\N	2	\N	0	2025-11-23 05:10:37.613336	\N	\N
2396	\N	2	\N	0	2025-11-23 05:10:38.708038	\N	\N
2397	\N	2	\N	0	2025-11-23 05:10:39.803201	\N	\N
2398	\N	2	\N	0	2025-11-23 05:10:40.891643	\N	\N
2404	\N	2	\N	0	2025-11-23 05:10:47.457204	\N	\N
2405	\N	2	\N	0	2025-11-23 05:10:48.564128	\N	\N
2406	\N	2	\N	1	2025-11-23 05:10:49.708849	\N	\N
2407	\N	2	\N	1	2025-11-23 05:10:50.77838	\N	\N
2413	\N	2	\N	1	2025-11-23 05:10:57.455291	\N	\N
2414	\N	2	\N	1	2025-11-23 05:10:58.50515	\N	\N
2415	\N	2	\N	1	2025-11-23 05:10:59.60527	\N	\N
2416	\N	2	\N	1	2025-11-23 05:11:00.678088	\N	\N
2417	\N	2	\N	1	2025-11-23 05:11:01.833089	\N	\N
2422	\N	2	\N	1	2025-11-23 05:11:07.769353	\N	\N
2423	\N	2	\N	1	2025-11-23 05:11:08.881167	\N	\N
2424	\N	2	\N	1	2025-11-23 05:11:10.055931	\N	\N
2425	\N	2	\N	1	2025-11-23 05:11:11.211863	\N	\N
2436	\N	2	\N	1	2025-11-23 05:11:23.404368	\N	\N
2437	\N	2	\N	1	2025-11-23 05:11:24.507114	\N	\N
2438	\N	2	\N	1	2025-11-23 05:11:25.600175	\N	\N
2439	\N	2	\N	1	2025-11-23 05:11:26.706653	\N	\N
2440	\N	2	\N	1	2025-11-23 05:11:27.854944	\N	\N
2441	\N	2	\N	1	2025-11-23 05:11:28.912198	\N	\N
2442	\N	2	\N	1	2025-11-23 05:11:29.960446	\N	\N
2443	\N	2	\N	1	2025-11-23 05:11:31.073013	\N	\N
2444	\N	2	\N	1	2025-11-23 05:11:32.185717	\N	\N
2445	\N	2	\N	1	2025-11-23 05:11:33.351255	\N	\N
2446	\N	2	\N	1	2025-11-23 05:11:34.468045	\N	\N
2447	\N	2	\N	1	2025-11-23 05:11:35.632232	\N	\N
2448	\N	2	\N	1	2025-11-23 05:11:36.74983	\N	\N
2449	\N	2	\N	1	2025-11-23 05:11:37.877676	\N	\N
2450	\N	2	\N	1	2025-11-23 05:11:38.942797	\N	\N
2451	\N	2	\N	1	2025-11-23 05:11:40.021273	\N	\N
2452	\N	2	\N	1	2025-11-23 05:11:41.065989	\N	\N
2453	\N	2	\N	1	2025-11-23 05:11:42.146388	\N	\N
2454	\N	2	\N	1	2025-11-23 05:11:43.222041	\N	\N
2455	\N	2	\N	1	2025-11-23 05:11:44.284774	\N	\N
2456	\N	2	\N	1	2025-11-23 05:11:45.332059	\N	\N
2457	\N	2	\N	1	2025-11-23 05:11:46.336586	\N	\N
2458	\N	2	\N	1	2025-11-23 05:11:47.35195	\N	\N
2459	\N	2	\N	1	2025-11-23 05:11:48.376978	\N	\N
2460	\N	2	\N	1	2025-11-23 05:11:49.39293	\N	\N
2461	\N	2	\N	1	2025-11-23 05:11:50.415488	\N	\N
2462	\N	2	\N	1	2025-11-23 05:11:51.460884	\N	\N
2463	\N	2	\N	1	2025-11-23 05:11:52.55179	\N	\N
2464	\N	2	\N	1	2025-11-23 05:11:53.682805	\N	\N
2465	\N	2	\N	0	2025-11-23 05:11:54.80336	\N	\N
2466	\N	2	\N	0	2025-11-23 05:11:55.803808	\N	\N
2467	\N	2	\N	1	2025-11-23 05:11:57.011369	\N	\N
2468	\N	2	\N	1	2025-11-23 05:11:58.125828	\N	\N
2469	\N	2	\N	0	2025-11-23 05:11:59.208934	\N	\N
2470	\N	2	\N	0	2025-11-23 05:12:00.208387	\N	\N
2471	\N	2	\N	0	2025-11-23 05:12:01.236222	\N	\N
2472	\N	2	\N	0	2025-11-23 05:12:02.273858	\N	\N
2473	\N	2	\N	0	2025-11-23 05:12:03.369293	\N	\N
2474	\N	2	\N	0	2025-11-23 05:12:04.453105	\N	\N
2475	\N	2	\N	1	2025-11-23 05:12:05.550951	\N	\N
2476	\N	2	\N	1	2025-11-23 05:12:06.578343	\N	\N
2477	\N	2	\N	1	2025-11-23 05:12:07.622272	\N	\N
2478	\N	2	\N	1	2025-11-23 05:12:08.790643	\N	\N
2479	\N	2	\N	1	2025-11-23 05:12:09.870063	\N	\N
2480	\N	2	\N	1	2025-11-23 05:12:11.009525	\N	\N
2481	\N	2	\N	1	2025-11-23 05:12:12.046484	\N	\N
2482	\N	2	\N	1	2025-11-23 05:12:13.12399	\N	\N
2483	\N	2	\N	1	2025-11-23 05:12:14.228018	\N	\N
2484	\N	2	\N	1	2025-11-23 05:12:15.242338	\N	\N
2485	\N	2	\N	1	2025-11-23 05:12:16.355009	\N	\N
2486	\N	2	\N	1	2025-11-23 05:12:17.400079	\N	\N
2487	\N	2	\N	1	2025-11-23 05:12:18.46343	\N	\N
2488	\N	2	\N	1	2025-11-23 05:12:19.803903	\N	\N
2489	\N	2	\N	0	2025-11-23 05:12:20.962201	\N	\N
2490	\N	2	\N	1	2025-11-23 05:12:22.498865	\N	\N
2491	\N	2	\N	0	2025-11-23 05:12:23.629601	\N	\N
2492	\N	2	\N	1	2025-11-23 05:12:24.866932	\N	\N
2493	\N	2	\N	1	2025-11-23 05:12:26.02023	\N	\N
2494	\N	2	\N	1	2025-11-23 05:12:27.08699	\N	\N
2495	\N	2	\N	1	2025-11-23 05:12:28.134644	\N	\N
2496	\N	2	\N	1	2025-11-23 05:12:29.291584	\N	\N
2497	\N	2	\N	1	2025-11-23 05:12:30.446185	\N	\N
2498	\N	2	\N	1	2025-11-23 05:12:31.603533	\N	\N
2499	\N	2	\N	1	2025-11-23 05:12:32.667593	\N	\N
2500	\N	2	\N	1	2025-11-23 05:12:33.747651	\N	\N
2501	\N	2	\N	1	2025-11-23 05:12:34.859534	\N	\N
2502	\N	2	\N	1	2025-11-23 05:12:35.9897	\N	\N
2503	\N	2	\N	1	2025-11-23 05:12:37.046967	\N	\N
2504	\N	2	\N	1	2025-11-23 05:12:38.14304	\N	\N
2505	\N	2	\N	1	2025-11-23 05:12:39.166957	\N	\N
2506	\N	2	\N	1	2025-11-23 05:12:40.169634	\N	\N
2507	\N	2	\N	1	2025-11-23 05:12:41.218591	\N	\N
2508	\N	2	\N	1	2025-11-23 05:12:42.388876	\N	\N
2509	\N	2	\N	1	2025-11-23 05:12:43.477582	\N	\N
2510	\N	2	\N	1	2025-11-23 05:12:44.509706	\N	\N
2511	\N	2	\N	1	2025-11-23 05:12:45.601267	\N	\N
2512	\N	2	\N	1	2025-11-23 05:12:47.058893	\N	\N
2513	\N	2	\N	1	2025-11-23 05:12:48.152379	\N	\N
2514	\N	2	\N	1	2025-11-23 05:12:49.269159	\N	\N
2515	\N	2	\N	1	2025-11-23 05:12:50.398253	\N	\N
2516	\N	2	\N	1	2025-11-23 05:12:51.525676	\N	\N
2517	\N	2	\N	1	2025-11-23 05:12:52.64075	\N	\N
2518	\N	2	\N	1	2025-11-23 05:12:53.672414	\N	\N
2519	\N	2	\N	1	2025-11-23 05:12:54.850373	\N	\N
2520	\N	2	\N	1	2025-11-23 05:12:55.946313	\N	\N
2521	\N	2	\N	1	2025-11-23 05:12:57.248659	\N	\N
2522	\N	2	\N	1	2025-11-23 05:12:58.432898	\N	\N
2523	\N	2	\N	1	2025-11-23 05:12:59.43521	\N	\N
2524	\N	2	\N	1	2025-11-23 05:13:00.661187	\N	\N
2525	\N	2	\N	1	2025-11-23 05:13:01.969668	\N	\N
2526	\N	2	\N	1	2025-11-23 05:13:03.356859	\N	\N
2527	\N	2	\N	1	2025-11-23 05:13:04.510878	\N	\N
2528	\N	2	\N	1	2025-11-23 05:13:05.929456	\N	\N
2529	\N	2	\N	1	2025-11-23 05:13:06.993762	\N	\N
2530	\N	2	\N	1	2025-11-23 05:13:08.033997	\N	\N
2531	\N	2	\N	1	2025-11-23 05:13:09.165676	\N	\N
2532	\N	2	\N	1	2025-11-23 05:13:10.232219	\N	\N
2533	\N	2	\N	1	2025-11-23 05:13:11.446116	\N	\N
2534	\N	2	\N	1	2025-11-23 05:13:12.507751	\N	\N
2535	\N	2	\N	0	2025-11-23 05:13:13.612002	\N	\N
2536	\N	2	\N	1	2025-11-23 05:13:14.63353	\N	\N
2537	\N	2	\N	1	2025-11-23 05:13:15.657471	\N	\N
2538	\N	2	\N	1	2025-11-23 05:13:16.657897	\N	\N
2539	\N	2	\N	1	2025-11-23 05:13:17.931302	\N	\N
2540	\N	2	\N	1	2025-11-23 05:13:19.137513	\N	\N
2541	\N	2	\N	0	2025-11-23 05:13:20.242299	\N	\N
2542	\N	2	\N	1	2025-11-23 05:13:21.251929	\N	\N
2543	\N	2	\N	1	2025-11-23 05:13:22.478512	\N	\N
2544	\N	2	\N	1	2025-11-23 05:13:23.651401	\N	\N
2545	\N	2	\N	0	2025-11-23 05:13:24.753363	\N	\N
2546	\N	2	\N	1	2025-11-23 05:13:25.90501	\N	\N
2547	\N	2	\N	1	2025-11-23 05:13:26.935007	\N	\N
2548	\N	2	\N	1	2025-11-23 05:13:28.064442	\N	\N
2549	\N	2	\N	1	2025-11-23 05:13:29.187553	\N	\N
2550	\N	2	\N	1	2025-11-23 05:13:30.196215	\N	\N
2551	\N	2	\N	1	2025-11-23 05:13:31.293373	\N	\N
2552	\N	2	\N	1	2025-11-23 05:13:32.334231	\N	\N
2553	\N	2	\N	1	2025-11-23 05:13:33.399131	\N	\N
2554	\N	2	\N	1	2025-11-23 05:13:34.568504	\N	\N
2555	\N	2	\N	1	2025-11-23 05:13:35.719354	\N	\N
2556	\N	2	\N	1	2025-11-23 05:13:36.969402	\N	\N
2557	\N	2	\N	0	2025-11-23 05:13:37.980751	\N	\N
2558	\N	2	\N	1	2025-11-23 05:13:39.065085	\N	\N
2559	\N	2	\N	1	2025-11-23 05:13:40.147301	\N	\N
2560	\N	2	\N	1	2025-11-23 05:13:41.196711	\N	\N
2561	\N	2	\N	1	2025-11-23 05:13:42.315264	\N	\N
2562	\N	2	\N	1	2025-11-23 05:13:43.456972	\N	\N
2563	\N	2	\N	1	2025-11-23 05:13:44.800071	\N	\N
2564	\N	2	\N	1	2025-11-23 05:13:45.827035	\N	\N
2565	\N	2	\N	1	2025-11-23 05:13:47.015521	\N	\N
2566	\N	2	\N	1	2025-11-23 05:13:48.138951	\N	\N
2567	\N	2	\N	1	2025-11-23 05:13:49.213363	\N	\N
2568	\N	2	\N	1	2025-11-23 05:13:50.219997	\N	\N
2569	\N	2	\N	1	2025-11-23 05:13:51.402924	\N	\N
2570	\N	2	\N	0	2025-11-23 05:13:52.438355	\N	\N
2571	\N	2	\N	1	2025-11-23 05:13:53.561745	\N	\N
2572	\N	2	\N	0	2025-11-23 05:13:54.653506	\N	\N
2573	\N	2	\N	0	2025-11-23 05:13:55.67901	\N	\N
2574	\N	2	\N	0	2025-11-23 05:13:56.69081	\N	\N
2575	\N	2	\N	0	2025-11-23 05:13:57.69135	\N	\N
2576	\N	2	\N	0	2025-11-23 05:13:58.73085	\N	\N
2577	\N	2	\N	1	2025-11-23 05:13:59.892287	\N	\N
2578	\N	2	\N	1	2025-11-23 05:14:00.91963	\N	\N
2579	\N	2	\N	1	2025-11-23 05:14:02.342682	\N	\N
2580	\N	2	\N	0	2025-11-23 05:14:03.369716	\N	\N
2581	\N	2	\N	0	2025-11-23 05:14:04.434487	\N	\N
2582	\N	2	\N	0	2025-11-23 05:14:05.556222	\N	\N
2583	\N	2	\N	1	2025-11-23 05:14:06.59816	\N	\N
2584	\N	2	\N	1	2025-11-23 05:14:07.649098	\N	\N
2585	\N	2	\N	0	2025-11-23 05:14:08.67584	\N	\N
2586	\N	2	\N	0	2025-11-23 05:14:09.713253	\N	\N
2587	\N	2	\N	0	2025-11-23 05:14:10.739377	\N	\N
2588	\N	2	\N	0	2025-11-23 05:14:11.782512	\N	\N
2589	\N	2	\N	0	2025-11-23 05:14:12.942863	\N	\N
2590	\N	2	\N	0	2025-11-23 05:14:14.030235	\N	\N
2591	\N	2	\N	0	2025-11-23 05:14:15.110092	\N	\N
2592	\N	2	\N	0	2025-11-23 05:14:16.114631	\N	\N
2593	\N	2	\N	0	2025-11-23 05:14:17.203343	\N	\N
2594	\N	2	\N	0	2025-11-23 05:14:18.282102	\N	\N
2595	\N	2	\N	0	2025-11-23 05:14:19.400621	\N	\N
2596	\N	2	\N	0	2025-11-23 05:14:20.443517	\N	\N
2597	\N	2	\N	0	2025-11-23 05:14:21.441953	\N	\N
2598	\N	2	\N	0	2025-11-23 05:14:22.48072	\N	\N
2599	\N	2	\N	0	2025-11-23 05:14:23.564707	\N	\N
2600	\N	2	\N	0	2025-11-23 05:14:24.57577	\N	\N
2601	\N	2	\N	0	2025-11-23 05:14:25.63636	\N	\N
2602	\N	2	\N	0	2025-11-23 05:14:26.693532	\N	\N
2603	\N	2	\N	0	2025-11-23 05:14:27.810187	\N	\N
2604	\N	2	\N	0	2025-11-23 05:14:28.851188	\N	\N
2605	\N	2	\N	0	2025-11-23 05:14:29.91221	\N	\N
2606	\N	2	\N	0	2025-11-23 05:14:31.002782	\N	\N
2607	\N	2	\N	0	2025-11-23 05:14:32.096351	\N	\N
2608	\N	2	\N	0	2025-11-23 05:14:33.172332	\N	\N
2609	\N	2	\N	0	2025-11-23 05:14:34.183734	\N	\N
2610	\N	2	\N	0	2025-11-23 05:14:35.562397	\N	\N
2611	\N	2	\N	0	2025-11-23 05:14:36.685848	\N	\N
2612	\N	2	\N	0	2025-11-23 05:14:37.803785	\N	\N
2613	\N	2	\N	0	2025-11-23 05:14:38.873898	\N	\N
2614	\N	2	\N	0	2025-11-23 05:14:39.886053	\N	\N
2615	\N	2	\N	0	2025-11-23 05:14:40.97486	\N	\N
2616	\N	2	\N	0	2025-11-23 05:14:42.083467	\N	\N
2617	\N	2	\N	0	2025-11-23 05:14:43.129323	\N	\N
2618	\N	2	\N	0	2025-11-23 05:14:44.212741	\N	\N
2619	\N	2	\N	0	2025-11-23 05:14:45.224036	\N	\N
2620	\N	2	\N	0	2025-11-23 05:14:46.22558	\N	\N
2621	\N	2	\N	0	2025-11-23 05:14:47.25048	\N	\N
2622	\N	2	\N	0	2025-11-23 05:14:48.290896	\N	\N
2623	\N	2	\N	0	2025-11-23 05:14:49.376747	\N	\N
2624	\N	2	\N	0	2025-11-23 05:14:50.476696	\N	\N
2625	\N	2	\N	0	2025-11-23 05:14:51.584093	\N	\N
2626	\N	2	\N	0	2025-11-23 05:14:52.60149	\N	\N
2627	\N	2	\N	0	2025-11-23 05:14:53.654259	\N	\N
2628	\N	2	\N	0	2025-11-23 05:14:54.676442	\N	\N
2629	\N	2	\N	0	2025-11-23 05:14:55.772236	\N	\N
2630	\N	2	\N	0	2025-11-23 05:14:56.822554	\N	\N
2631	\N	2	\N	0	2025-11-23 05:14:57.85154	\N	\N
2632	\N	2	\N	0	2025-11-23 05:14:58.867181	\N	\N
2633	\N	2	\N	0	2025-11-23 05:14:59.886101	\N	\N
2634	\N	2	\N	0	2025-11-23 05:15:00.932615	\N	\N
2635	\N	2	\N	0	2025-11-23 05:15:01.960619	\N	\N
2636	\N	2	\N	0	2025-11-23 05:15:03.006041	\N	\N
2637	\N	2	\N	0	2025-11-23 05:15:04.078422	\N	\N
2638	\N	2	\N	0	2025-11-23 05:15:05.13036	\N	\N
2639	\N	2	\N	0	2025-11-23 05:15:06.134193	\N	\N
2640	\N	2	\N	0	2025-11-23 05:15:07.22998	\N	\N
2641	\N	2	\N	0	2025-11-23 05:15:08.324323	\N	\N
2642	\N	2	\N	0	2025-11-23 05:15:09.409909	\N	\N
2643	\N	2	\N	0	2025-11-23 05:15:10.484593	\N	\N
2644	\N	2	\N	0	2025-11-23 05:15:11.497022	\N	\N
2645	\N	2	\N	0	2025-11-23 05:15:12.554481	\N	\N
2646	\N	2	\N	0	2025-11-23 05:15:13.65603	\N	\N
2647	\N	2	\N	0	2025-11-23 05:15:14.701004	\N	\N
2648	\N	2	\N	0	2025-11-23 05:15:15.707199	\N	\N
2649	\N	2	\N	0	2025-11-23 05:15:16.72073	\N	\N
2650	\N	2	\N	0	2025-11-23 05:15:17.748069	\N	\N
2651	\N	2	\N	0	2025-11-23 05:15:18.756554	\N	\N
2652	\N	2	\N	0	2025-11-23 05:15:19.771768	\N	\N
2653	\N	2	\N	0	2025-11-23 05:15:20.782188	\N	\N
2654	\N	2	\N	0	2025-11-23 05:15:21.835674	\N	\N
2655	\N	2	\N	0	2025-11-23 05:15:22.868643	\N	\N
2656	\N	2	\N	0	2025-11-23 05:15:23.934272	\N	\N
2657	\N	2	\N	0	2025-11-23 05:15:24.945926	\N	\N
2658	\N	2	\N	0	2025-11-23 05:15:25.977495	\N	\N
2659	\N	2	\N	0	2025-11-23 05:15:27.051073	\N	\N
2660	\N	2	\N	0	2025-11-23 05:15:28.132843	\N	\N
2661	\N	2	\N	0	2025-11-23 05:15:29.20146	\N	\N
2662	\N	2	\N	0	2025-11-23 05:15:30.30917	\N	\N
2663	\N	2	\N	0	2025-11-23 05:15:31.312941	\N	\N
2664	\N	2	\N	0	2025-11-23 05:15:32.335481	\N	\N
2665	\N	2	\N	0	2025-11-23 05:15:33.407592	\N	\N
2666	\N	2	\N	0	2025-11-23 05:15:34.518751	\N	\N
2667	\N	2	\N	0	2025-11-23 05:15:35.514615	\N	\N
2668	\N	2	\N	0	2025-11-23 05:15:36.540203	\N	\N
2669	\N	2	\N	0	2025-11-23 05:15:37.600359	\N	\N
2670	\N	2	\N	0	2025-11-23 05:15:38.643291	\N	\N
2671	\N	2	\N	0	2025-11-23 05:15:39.682397	\N	\N
2672	\N	2	\N	0	2025-11-23 05:15:40.795104	\N	\N
2673	\N	2	\N	0	2025-11-23 05:15:41.796726	\N	\N
2674	\N	2	\N	0	2025-11-23 05:15:42.886481	\N	\N
2675	\N	2	\N	0	2025-11-23 05:15:43.894366	\N	\N
2676	\N	2	\N	0	2025-11-23 05:15:44.910037	\N	\N
2677	\N	2	\N	0	2025-11-23 05:15:45.989404	\N	\N
2678	\N	2	\N	0	2025-11-23 05:15:47.029055	\N	\N
2679	\N	2	\N	0	2025-11-23 05:15:48.138617	\N	\N
2680	\N	2	\N	0	2025-11-23 05:15:49.118757	\N	\N
2681	\N	2	\N	0	2025-11-23 05:15:50.205728	\N	\N
2682	\N	2	\N	0	2025-11-23 05:15:51.246172	\N	\N
2683	\N	2	\N	0	2025-11-23 05:15:52.355982	\N	\N
2684	\N	2	\N	0	2025-11-23 05:15:53.445969	\N	\N
2685	\N	2	\N	0	2025-11-23 05:15:54.475936	\N	\N
2686	\N	2	\N	0	2025-11-23 05:15:55.471656	\N	\N
2687	\N	2	\N	0	2025-11-23 05:15:56.472982	\N	\N
2688	\N	2	\N	0	2025-11-23 05:15:57.500577	\N	\N
2689	\N	2	\N	0	2025-11-23 05:15:58.527895	\N	\N
2690	\N	2	\N	0	2025-11-23 05:15:59.553351	\N	\N
2691	\N	2	\N	0	2025-11-23 05:16:00.564289	\N	\N
2692	\N	2	\N	0	2025-11-23 05:16:01.654796	\N	\N
2693	\N	2	\N	0	2025-11-23 05:16:02.738765	\N	\N
2694	\N	2	\N	0	2025-11-23 05:16:04.025139	\N	\N
2695	\N	2	\N	0	2025-11-23 05:16:05.130287	\N	\N
2696	\N	2	\N	0	2025-11-23 05:16:06.203095	\N	\N
2697	\N	2	\N	0	2025-11-23 05:16:07.233077	\N	\N
2698	\N	2	\N	0	2025-11-23 05:16:08.282652	\N	\N
2699	\N	2	\N	0	2025-11-23 05:16:09.3034	\N	\N
2700	\N	2	\N	0	2025-11-23 05:16:10.339788	\N	\N
2701	\N	2	\N	0	2025-11-23 05:16:11.367756	\N	\N
2702	\N	2	\N	0	2025-11-23 05:16:12.462742	\N	\N
2703	\N	2	\N	0	2025-11-23 05:16:13.52939	\N	\N
2704	\N	2	\N	0	2025-11-23 05:16:14.60407	\N	\N
2705	\N	2	\N	0	2025-11-23 05:16:15.677152	\N	\N
2706	\N	2	\N	0	2025-11-23 05:16:16.680473	\N	\N
2707	\N	2	\N	0	2025-11-23 05:16:17.741869	\N	\N
2708	\N	2	\N	0	2025-11-23 05:16:18.76938	\N	\N
2709	\N	2	\N	0	2025-11-23 05:16:19.776861	\N	\N
2710	\N	2	\N	0	2025-11-23 05:16:20.78014	\N	\N
2711	\N	2	\N	0	2025-11-23 05:16:21.836242	\N	\N
2712	\N	2	\N	0	2025-11-23 05:16:22.918488	\N	\N
2713	\N	2	\N	0	2025-11-23 05:16:23.91829	\N	\N
2714	\N	2	\N	0	2025-11-23 05:16:25.047694	\N	\N
2715	\N	2	\N	0	2025-11-23 05:16:26.125281	\N	\N
2716	\N	2	\N	0	2025-11-23 05:16:27.154743	\N	\N
2717	\N	2	\N	0	2025-11-23 05:16:28.172142	\N	\N
2718	\N	2	\N	0	2025-11-23 05:16:29.248088	\N	\N
2719	\N	2	\N	0	2025-11-23 05:16:30.278328	\N	\N
2720	\N	2	\N	0	2025-11-23 05:16:31.295272	\N	\N
2721	\N	2	\N	0	2025-11-23 05:16:32.346333	\N	\N
2722	\N	2	\N	0	2025-11-23 05:16:33.448474	\N	\N
2723	\N	2	\N	0	2025-11-23 05:16:34.491738	\N	\N
2724	\N	2	\N	0	2025-11-23 05:16:35.533271	\N	\N
2725	\N	2	\N	0	2025-11-23 05:16:36.64476	\N	\N
2726	\N	2	\N	0	2025-11-23 05:16:37.715265	\N	\N
2727	\N	2	\N	0	2025-11-23 05:16:38.792305	\N	\N
2728	\N	2	\N	0	2025-11-23 05:16:39.810165	\N	\N
2729	\N	2	\N	0	2025-11-23 05:16:40.885385	\N	\N
2730	\N	2	\N	0	2025-11-23 05:16:41.922039	\N	\N
2731	\N	2	\N	0	2025-11-23 05:16:42.933083	\N	\N
2732	\N	2	\N	0	2025-11-23 05:16:43.950823	\N	\N
2733	\N	2	\N	0	2025-11-23 05:16:45.03393	\N	\N
2734	\N	2	\N	0	2025-11-23 05:16:46.127894	\N	\N
2735	\N	2	\N	0	2025-11-23 05:16:47.228896	\N	\N
2736	\N	2	\N	0	2025-11-23 05:16:48.227909	\N	\N
2737	\N	2	\N	0	2025-11-23 05:16:49.257285	\N	\N
2738	\N	2	\N	0	2025-11-23 05:16:50.329362	\N	\N
2739	\N	2	\N	0	2025-11-23 05:16:51.335863	\N	\N
2740	\N	2	\N	0	2025-11-23 05:16:52.374529	\N	\N
2741	\N	2	\N	0	2025-11-23 05:16:53.450766	\N	\N
2742	\N	2	\N	0	2025-11-23 05:16:54.542126	\N	\N
2743	\N	2	\N	0	2025-11-23 05:16:55.585626	\N	\N
2744	\N	2	\N	0	2025-11-23 05:16:56.664084	\N	\N
2745	\N	2	\N	0	2025-11-23 05:16:57.746556	\N	\N
2746	\N	2	\N	0	2025-11-23 05:16:58.821957	\N	\N
2747	\N	2	\N	0	2025-11-23 05:16:59.919973	\N	\N
2748	\N	2	\N	0	2025-11-23 05:17:00.999255	\N	\N
2749	\N	2	\N	0	2025-11-23 05:17:02.048292	\N	\N
2750	\N	2	\N	0	2025-11-23 05:17:03.246043	\N	\N
2751	\N	2	\N	0	2025-11-23 05:17:04.262387	\N	\N
2752	\N	2	\N	0	2025-11-23 05:17:05.357563	\N	\N
2753	\N	2	\N	0	2025-11-23 05:17:06.391574	\N	\N
2754	\N	2	\N	0	2025-11-23 05:17:07.407042	\N	\N
2755	\N	2	\N	1	2025-11-23 05:17:08.558087	\N	\N
2756	\N	2	\N	1	2025-11-23 05:17:09.72318	\N	\N
2757	\N	2	\N	1	2025-11-23 05:17:10.811671	\N	\N
2758	\N	2	\N	1	2025-11-23 05:17:11.91617	\N	\N
2759	\N	2	\N	1	2025-11-23 05:17:13.093327	\N	\N
2760	\N	2	\N	1	2025-11-23 05:17:14.172584	\N	\N
2761	\N	2	\N	1	2025-11-23 05:17:15.202998	\N	\N
2762	\N	2	\N	1	2025-11-23 05:17:16.239681	\N	\N
2763	\N	2	\N	1	2025-11-23 05:17:17.264253	\N	\N
2764	\N	2	\N	1	2025-11-23 05:17:18.400707	\N	\N
2765	\N	2	\N	1	2025-11-23 05:17:19.511723	\N	\N
2766	\N	2	\N	1	2025-11-23 05:17:20.642057	\N	\N
2767	\N	2	\N	1	2025-11-23 05:17:21.756859	\N	\N
2768	\N	2	\N	1	2025-11-23 05:17:22.764313	\N	\N
2769	\N	2	\N	0	2025-11-23 05:17:23.766311	\N	\N
2770	\N	2	\N	1	2025-11-23 05:17:24.850105	\N	\N
2771	\N	2	\N	1	2025-11-23 05:17:25.962785	\N	\N
2772	\N	2	\N	1	2025-11-23 05:17:26.989616	\N	\N
2773	\N	2	\N	1	2025-11-23 05:17:28.078433	\N	\N
2774	\N	2	\N	1	2025-11-23 05:17:29.198182	\N	\N
2775	\N	2	\N	1	2025-11-23 05:17:30.297337	\N	\N
2776	\N	2	\N	1	2025-11-23 05:17:31.391759	\N	\N
2777	\N	2	\N	1	2025-11-23 05:17:32.54514	\N	\N
2778	\N	2	\N	1	2025-11-23 05:17:33.646839	\N	\N
2779	\N	2	\N	1	2025-11-23 05:17:34.738338	\N	\N
2780	\N	2	\N	1	2025-11-23 05:17:35.852191	\N	\N
2781	\N	2	\N	1	2025-11-23 05:17:36.996278	\N	\N
2782	\N	2	\N	1	2025-11-23 05:17:38.042996	\N	\N
2783	\N	2	\N	1	2025-11-23 05:17:39.164851	\N	\N
2784	\N	2	\N	1	2025-11-23 05:17:40.300877	\N	\N
2785	\N	2	\N	0	2025-11-23 05:17:41.446665	\N	\N
2786	\N	2	\N	1	2025-11-23 05:17:42.470357	\N	\N
2787	\N	2	\N	1	2025-11-23 05:17:43.558856	\N	\N
2788	\N	2	\N	1	2025-11-23 05:17:44.594309	\N	\N
2789	\N	2	\N	1	2025-11-23 05:17:45.631292	\N	\N
2790	\N	2	\N	1	2025-11-23 05:17:46.752335	\N	\N
2791	\N	2	\N	1	2025-11-23 05:17:48.107706	\N	\N
2792	\N	2	\N	1	2025-11-23 05:17:49.334036	\N	\N
2793	\N	2	\N	1	2025-11-23 05:17:50.611987	\N	\N
2794	\N	2	\N	1	2025-11-23 05:17:51.699213	\N	\N
2795	\N	2	\N	1	2025-11-23 05:17:53.353282	\N	\N
2796	\N	2	\N	0	2025-11-23 05:17:54.411556	\N	\N
2797	\N	2	\N	1	2025-11-23 05:17:55.590194	\N	\N
2798	\N	2	\N	1	2025-11-23 05:17:56.830871	\N	\N
2799	\N	2	\N	1	2025-11-23 05:17:57.895039	\N	\N
2800	\N	2	\N	1	2025-11-23 05:17:58.974682	\N	\N
2801	\N	2	\N	1	2025-11-23 05:18:00.143255	\N	\N
2802	\N	2	\N	1	2025-11-23 05:18:01.252445	\N	\N
2803	\N	2	\N	1	2025-11-23 05:18:02.256907	\N	\N
2804	\N	2	\N	1	2025-11-23 05:18:03.26077	\N	\N
2805	\N	2	\N	1	2025-11-23 05:18:04.550553	\N	\N
2806	\N	2	\N	1	2025-11-23 05:18:05.632103	\N	\N
2807	\N	2	\N	1	2025-11-23 05:18:06.733268	\N	\N
2808	\N	2	\N	1	2025-11-23 05:18:07.887289	\N	\N
2809	\N	2	\N	1	2025-11-23 05:18:08.889601	\N	\N
2810	\N	2	\N	1	2025-11-23 05:18:09.920975	\N	\N
2811	\N	2	\N	1	2025-11-23 05:18:10.959433	\N	\N
2812	\N	2	\N	1	2025-11-23 05:18:12.010338	\N	\N
2813	\N	2	\N	1	2025-11-23 05:18:13.229222	\N	\N
2814	\N	2	\N	1	2025-11-23 05:18:14.227913	\N	\N
2815	\N	2	\N	1	2025-11-23 05:18:15.388583	\N	\N
2816	\N	2	\N	1	2025-11-23 05:18:16.536954	\N	\N
2817	\N	2	\N	1	2025-11-23 05:18:17.668334	\N	\N
2818	\N	2	\N	1	2025-11-23 05:18:18.797709	\N	\N
2819	\N	2	\N	1	2025-11-23 05:18:19.955727	\N	\N
2820	\N	2	\N	1	2025-11-23 05:18:21.138984	\N	\N
2821	\N	2	\N	1	2025-11-23 05:18:22.173088	\N	\N
2822	\N	2	\N	1	2025-11-23 05:18:23.199266	\N	\N
2823	\N	2	\N	1	2025-11-23 05:18:24.352499	\N	\N
2824	\N	2	\N	1	2025-11-23 05:18:25.507721	\N	\N
2825	\N	2	\N	1	2025-11-23 05:18:26.610107	\N	\N
2826	\N	2	\N	1	2025-11-23 05:18:27.786116	\N	\N
2827	\N	2	\N	1	2025-11-23 05:18:28.923918	\N	\N
2828	\N	2	\N	1	2025-11-23 05:18:30.047183	\N	\N
2829	\N	2	\N	1	2025-11-23 05:18:31.138512	\N	\N
2830	\N	2	\N	1	2025-11-23 05:18:32.264966	\N	\N
2831	\N	2	\N	1	2025-11-23 05:18:33.339106	\N	\N
2832	\N	2	\N	1	2025-11-23 05:18:34.394918	\N	\N
2833	\N	2	\N	1	2025-11-23 05:18:35.529058	\N	\N
2834	\N	2	\N	1	2025-11-23 05:18:36.625516	\N	\N
2835	\N	2	\N	1	2025-11-23 05:18:37.677576	\N	\N
2836	\N	2	\N	1	2025-11-23 05:18:38.815166	\N	\N
2837	\N	2	\N	1	2025-11-23 05:18:39.82299	\N	\N
2838	\N	2	\N	0	2025-11-23 05:18:40.963267	\N	\N
2839	\N	2	\N	0	2025-11-23 05:18:42.128718	\N	\N
2840	\N	2	\N	0	2025-11-23 05:18:43.232306	\N	\N
2841	\N	2	\N	0	2025-11-23 05:18:44.245573	\N	\N
2842	\N	2	\N	1	2025-11-23 05:18:45.361741	\N	\N
2843	\N	2	\N	1	2025-11-23 05:18:46.444444	\N	\N
2844	\N	2	\N	1	2025-11-23 05:18:47.570444	\N	\N
2845	\N	2	\N	1	2025-11-23 05:18:48.649542	\N	\N
2846	\N	2	\N	0	2025-11-23 05:18:49.790434	\N	\N
2847	\N	2	\N	0	2025-11-23 05:18:50.828283	\N	\N
2848	\N	2	\N	0	2025-11-23 05:18:51.923675	\N	\N
2849	\N	2	\N	1	2025-11-23 05:18:53.230899	\N	\N
2850	\N	2	\N	1	2025-11-23 05:18:54.272472	\N	\N
2851	\N	2	\N	1	2025-11-23 05:18:55.332986	\N	\N
2852	\N	2	\N	1	2025-11-23 05:18:56.35403	\N	\N
2853	\N	2	\N	1	2025-11-23 05:18:57.474347	\N	\N
2854	\N	2	\N	1	2025-11-23 05:18:58.528229	\N	\N
2855	\N	2	\N	1	2025-11-23 05:18:59.580657	\N	\N
2856	\N	2	\N	1	2025-11-23 05:19:00.672733	\N	\N
2857	\N	2	\N	1	2025-11-23 05:19:01.705416	\N	\N
2858	\N	2	\N	1	2025-11-23 05:19:02.83589	\N	\N
2859	\N	2	\N	1	2025-11-23 05:19:03.869169	\N	\N
2860	\N	2	\N	1	2025-11-23 05:19:04.921543	\N	\N
2861	\N	2	\N	1	2025-11-23 05:19:06.014929	\N	\N
2862	\N	2	\N	1	2025-11-23 05:19:07.028213	\N	\N
2863	\N	2	\N	1	2025-11-23 05:19:08.115612	\N	\N
2864	\N	2	\N	1	2025-11-23 05:19:09.115053	\N	\N
2865	\N	2	\N	1	2025-11-23 05:19:10.232419	\N	\N
2866	\N	2	\N	1	2025-11-23 05:19:11.251538	\N	\N
2867	\N	2	\N	0	2025-11-23 05:19:12.302366	\N	\N
2868	\N	2	\N	0	2025-11-23 05:19:13.560669	\N	\N
2869	\N	2	\N	1	2025-11-23 05:19:14.618817	\N	\N
2870	\N	2	\N	1	2025-11-23 05:19:15.700347	\N	\N
2871	\N	2	\N	1	2025-11-23 05:19:16.787298	\N	\N
2872	\N	2	\N	1	2025-11-23 05:19:17.900311	\N	\N
2873	\N	2	\N	1	2025-11-23 05:19:18.94629	\N	\N
2874	\N	2	\N	1	2025-11-23 05:19:19.994213	\N	\N
2875	\N	2	\N	1	2025-11-23 05:19:21.021109	\N	\N
2876	\N	2	\N	1	2025-11-23 05:19:22.108299	\N	\N
2877	\N	2	\N	1	2025-11-23 05:19:23.217354	\N	\N
2878	\N	2	\N	1	2025-11-23 05:19:24.343099	\N	\N
2879	\N	2	\N	1	2025-11-23 05:19:25.343555	\N	\N
2880	\N	2	\N	1	2025-11-23 05:19:26.479335	\N	\N
2881	\N	2	\N	1	2025-11-23 05:19:27.571343	\N	\N
2882	\N	2	\N	1	2025-11-23 05:19:28.63672	\N	\N
2883	\N	2	\N	1	2025-11-23 05:19:29.687695	\N	\N
2884	\N	2	\N	1	2025-11-23 05:19:30.781631	\N	\N
2885	\N	2	\N	1	2025-11-23 05:19:31.899586	\N	\N
2886	\N	2	\N	1	2025-11-23 05:19:33.072688	\N	\N
2887	\N	2	\N	1	2025-11-23 05:19:34.128096	\N	\N
2888	\N	2	\N	1	2025-11-23 05:19:35.141519	\N	\N
2889	\N	2	\N	1	2025-11-23 05:19:36.291514	\N	\N
2890	\N	2	\N	1	2025-11-23 05:19:37.403999	\N	\N
2891	\N	2	\N	1	2025-11-23 05:19:38.395272	\N	\N
2892	\N	2	\N	1	2025-11-23 05:19:39.517531	\N	\N
2893	\N	2	\N	1	2025-11-23 05:19:40.628417	\N	\N
2894	\N	2	\N	1	2025-11-23 05:19:41.761123	\N	\N
2895	\N	2	\N	0	2025-11-23 05:19:42.844752	\N	\N
2896	\N	2	\N	1	2025-11-23 05:19:43.887322	\N	\N
2897	\N	2	\N	1	2025-11-23 05:19:45.026263	\N	\N
2898	\N	2	\N	1	2025-11-23 05:19:46.10554	\N	\N
2899	\N	2	\N	1	2025-11-23 05:19:47.116742	\N	\N
2900	\N	2	\N	1	2025-11-23 05:19:48.118308	\N	\N
2901	\N	2	\N	1	2025-11-23 05:19:49.289419	\N	\N
2902	\N	2	\N	1	2025-11-23 05:19:50.468146	\N	\N
2903	\N	2	\N	1	2025-11-23 05:19:51.527245	\N	\N
2904	\N	2	\N	1	2025-11-23 05:19:52.546421	\N	\N
2905	\N	2	\N	0	2025-11-23 05:19:53.612722	\N	\N
2906	\N	2	\N	1	2025-11-23 05:19:54.626371	\N	\N
2907	\N	2	\N	1	2025-11-23 05:19:55.70411	\N	\N
2908	\N	2	\N	1	2025-11-23 05:19:56.778592	\N	\N
2909	\N	2	\N	0	2025-11-23 05:19:57.856252	\N	\N
2910	\N	2	\N	1	2025-11-23 05:19:58.860106	\N	\N
2911	\N	2	\N	1	2025-11-23 05:19:59.966673	\N	\N
2912	\N	2	\N	1	2025-11-23 05:20:01.090587	\N	\N
2913	\N	2	\N	1	2025-11-23 05:20:02.305731	\N	\N
2914	\N	2	\N	1	2025-11-23 05:20:03.359799	\N	\N
2915	\N	2	\N	1	2025-11-23 05:20:04.454312	\N	\N
2916	\N	2	\N	1	2025-11-23 05:20:05.471297	\N	\N
2917	\N	2	\N	1	2025-11-23 05:20:06.536692	\N	\N
2918	\N	2	\N	1	2025-11-23 05:20:07.65216	\N	\N
2919	\N	2	\N	1	2025-11-23 05:20:08.668244	\N	\N
2920	\N	2	\N	1	2025-11-23 05:20:09.732894	\N	\N
2921	\N	2	\N	1	2025-11-23 05:20:10.888672	\N	\N
2922	\N	2	\N	1	2025-11-23 05:20:11.97381	\N	\N
2923	\N	2	\N	1	2025-11-23 05:20:13.062805	\N	\N
2924	\N	2	\N	1	2025-11-23 05:20:14.061928	\N	\N
2925	\N	2	\N	1	2025-11-23 05:20:15.214652	\N	\N
2926	\N	2	\N	1	2025-11-23 05:20:16.346535	\N	\N
2927	\N	2	\N	1	2025-11-23 05:20:17.457265	\N	\N
2928	\N	2	\N	1	2025-11-23 05:20:18.553259	\N	\N
2929	\N	2	\N	1	2025-11-23 05:20:19.704147	\N	\N
2930	\N	2	\N	1	2025-11-23 05:20:20.729662	\N	\N
2931	\N	2	\N	1	2025-11-23 05:20:21.737717	\N	\N
2932	\N	2	\N	1	2025-11-23 05:20:22.795596	\N	\N
2933	\N	2	\N	1	2025-11-23 05:20:23.844386	\N	\N
2934	\N	2	\N	1	2025-11-23 05:20:24.96694	\N	\N
2935	\N	2	\N	1	2025-11-23 05:20:26.097514	\N	\N
2936	\N	2	\N	1	2025-11-23 05:20:27.157064	\N	\N
2937	\N	2	\N	1	2025-11-23 05:20:28.170658	\N	\N
2938	\N	2	\N	1	2025-11-23 05:20:29.234849	\N	\N
2939	\N	2	\N	1	2025-11-23 05:20:30.310889	\N	\N
2940	\N	2	\N	1	2025-11-23 05:20:31.439986	\N	\N
2941	\N	2	\N	1	2025-11-23 05:20:32.449772	\N	\N
2942	\N	2	\N	1	2025-11-23 05:20:33.510767	\N	\N
2943	\N	2	\N	1	2025-11-23 05:20:34.645451	\N	\N
2944	\N	2	\N	1	2025-11-23 05:20:35.69935	\N	\N
2945	\N	2	\N	1	2025-11-23 05:20:36.715092	\N	\N
2946	\N	2	\N	1	2025-11-23 05:20:37.735617	\N	\N
2947	\N	2	\N	1	2025-11-23 05:20:38.898738	\N	\N
2948	\N	2	\N	1	2025-11-23 05:20:40.050929	\N	\N
2949	\N	2	\N	1	2025-11-23 05:20:41.185548	\N	\N
2950	\N	2	\N	1	2025-11-23 05:20:42.267992	\N	\N
2951	\N	2	\N	1	2025-11-23 05:20:43.298292	\N	\N
2952	\N	2	\N	1	2025-11-23 05:20:44.429351	\N	\N
2953	\N	2	\N	1	2025-11-23 05:20:45.540933	\N	\N
2954	\N	2	\N	1	2025-11-23 05:20:46.651015	\N	\N
2955	\N	2	\N	1	2025-11-23 05:20:47.655509	\N	\N
2956	\N	2	\N	1	2025-11-23 05:20:48.775647	\N	\N
2957	\N	2	\N	1	2025-11-23 05:20:49.899075	\N	\N
2958	\N	2	\N	1	2025-11-23 05:20:50.983843	\N	\N
2959	\N	2	\N	1	2025-11-23 05:20:52.122127	\N	\N
2960	\N	2	\N	1	2025-11-23 05:20:53.208276	\N	\N
2961	\N	2	\N	1	2025-11-23 05:20:54.285467	\N	\N
2962	\N	2	\N	1	2025-11-23 05:20:55.312168	\N	\N
2963	\N	2	\N	1	2025-11-23 05:20:56.316119	\N	\N
2964	\N	2	\N	1	2025-11-23 05:20:57.343735	\N	\N
2965	\N	2	\N	1	2025-11-23 05:20:58.400726	\N	\N
2966	\N	2	\N	1	2025-11-23 05:20:59.490117	\N	\N
2967	\N	2	\N	1	2025-11-23 05:21:00.573692	\N	\N
2968	\N	2	\N	1	2025-11-23 05:21:01.718979	\N	\N
2969	\N	2	\N	1	2025-11-23 05:21:02.716372	\N	\N
2970	\N	2	\N	1	2025-11-23 05:21:03.889858	\N	\N
2971	\N	2	\N	1	2025-11-23 05:21:04.984265	\N	\N
2972	\N	2	\N	1	2025-11-23 05:21:06.060694	\N	\N
2973	\N	2	\N	1	2025-11-23 05:21:07.182626	\N	\N
2974	\N	2	\N	1	2025-11-23 05:21:08.335693	\N	\N
2975	\N	2	\N	1	2025-11-23 05:21:09.618434	\N	\N
2976	\N	2	\N	1	2025-11-23 05:21:10.802933	\N	\N
2977	\N	2	\N	1	2025-11-23 05:21:11.865933	\N	\N
2978	\N	2	\N	1	2025-11-23 05:21:12.904804	\N	\N
2979	\N	2	\N	1	2025-11-23 05:21:13.980576	\N	\N
2980	\N	2	\N	1	2025-11-23 05:21:15.102603	\N	\N
2981	\N	2	\N	1	2025-11-23 05:21:16.106533	\N	\N
2982	\N	2	\N	1	2025-11-23 05:21:17.126775	\N	\N
2983	\N	2	\N	1	2025-11-23 05:21:18.188109	\N	\N
2984	\N	2	\N	1	2025-11-23 05:21:19.220216	\N	\N
2985	\N	2	\N	1	2025-11-23 05:21:20.415632	\N	\N
2986	\N	2	\N	1	2025-11-23 05:21:21.469507	\N	\N
2987	\N	2	\N	1	2025-11-23 05:21:22.62329	\N	\N
2988	\N	2	\N	1	2025-11-23 05:21:23.672224	\N	\N
2989	\N	2	\N	1	2025-11-23 05:21:24.802393	\N	\N
2990	\N	2	\N	1	2025-11-23 05:21:25.949668	\N	\N
2991	\N	2	\N	1	2025-11-23 05:21:27.00351	\N	\N
2992	\N	2	\N	1	2025-11-23 05:21:28.148613	\N	\N
2993	\N	2	\N	1	2025-11-23 05:21:29.196862	\N	\N
2994	\N	2	\N	1	2025-11-23 05:21:30.33197	\N	\N
2995	\N	2	\N	1	2025-11-23 05:21:31.357779	\N	\N
2996	\N	2	\N	1	2025-11-23 05:21:32.466833	\N	\N
2997	\N	2	\N	1	2025-11-23 05:21:33.586032	\N	\N
2998	\N	2	\N	1	2025-11-23 05:21:34.712649	\N	\N
2999	\N	2	\N	1	2025-11-23 05:21:35.861029	\N	\N
3000	\N	2	\N	1	2025-11-23 05:21:36.991528	\N	\N
3001	\N	2	\N	1	2025-11-23 05:21:38.077943	\N	\N
3002	\N	2	\N	1	2025-11-23 05:21:39.170746	\N	\N
3003	\N	2	\N	1	2025-11-23 05:21:40.28367	\N	\N
3004	\N	2	\N	1	2025-11-23 05:21:41.405746	\N	\N
3005	\N	2	\N	1	2025-11-23 05:21:42.552152	\N	\N
3006	\N	2	\N	0	2025-11-23 05:21:43.583486	\N	\N
3007	\N	2	\N	0	2025-11-23 05:21:44.620213	\N	\N
3008	\N	2	\N	1	2025-11-23 05:21:45.760244	\N	\N
3009	\N	2	\N	1	2025-11-23 05:21:46.842651	\N	\N
3010	\N	2	\N	1	2025-11-23 05:21:47.959415	\N	\N
3011	\N	2	\N	1	2025-11-23 05:21:49.079254	\N	\N
3012	\N	2	\N	1	2025-11-23 05:21:50.192475	\N	\N
3013	\N	2	\N	1	2025-11-23 05:21:51.296203	\N	\N
3014	\N	2	\N	1	2025-11-23 05:21:52.340935	\N	\N
3015	\N	2	\N	1	2025-11-23 05:21:53.385025	\N	\N
3016	\N	2	\N	1	2025-11-23 05:21:54.392154	\N	\N
3017	\N	2	\N	1	2025-11-23 05:21:55.401392	\N	\N
3018	\N	2	\N	0	2025-11-23 05:21:56.551447	\N	\N
3019	\N	2	\N	0	2025-11-23 05:21:57.628484	\N	\N
3020	\N	2	\N	0	2025-11-23 05:21:58.645701	\N	\N
3021	\N	2	\N	0	2025-11-23 05:21:59.718845	\N	\N
3022	\N	2	\N	1	2025-11-23 05:22:00.865577	\N	\N
3023	\N	2	\N	1	2025-11-23 05:22:01.897898	\N	\N
3024	\N	2	\N	1	2025-11-23 05:22:03.050814	\N	\N
3025	\N	2	\N	1	2025-11-23 05:22:04.247936	\N	\N
3026	\N	2	\N	1	2025-11-23 05:22:05.593857	\N	\N
3027	\N	2	\N	1	2025-11-23 05:22:06.657639	\N	\N
3028	\N	2	\N	1	2025-11-23 05:22:07.670563	\N	\N
3029	\N	2	\N	1	2025-11-23 05:22:08.922891	\N	\N
3030	\N	2	\N	1	2025-11-23 05:22:10.05349	\N	\N
3031	\N	2	\N	1	2025-11-23 05:22:11.210268	\N	\N
3032	\N	2	\N	1	2025-11-23 05:22:12.318385	\N	\N
3033	\N	2	\N	1	2025-11-23 05:22:13.350741	\N	\N
3034	\N	2	\N	1	2025-11-23 05:22:14.388964	\N	\N
3035	\N	2	\N	1	2025-11-23 05:22:15.436953	\N	\N
3036	\N	2	\N	1	2025-11-23 05:22:16.540118	\N	\N
3037	\N	2	\N	1	2025-11-23 05:22:17.60705	\N	\N
3038	\N	2	\N	1	2025-11-23 05:22:18.688572	\N	\N
3039	\N	2	\N	0	2025-11-23 05:22:19.940112	\N	\N
3040	\N	2	\N	0	2025-11-23 05:22:20.992975	\N	\N
3041	\N	2	\N	0	2025-11-23 05:22:22.180372	\N	\N
3042	\N	2	\N	0	2025-11-23 05:22:23.26146	\N	\N
3043	\N	2	\N	1	2025-11-23 05:22:24.415154	\N	\N
3044	\N	2	\N	1	2025-11-23 05:22:25.452664	\N	\N
3045	\N	2	\N	1	2025-11-23 05:22:26.528574	\N	\N
3046	\N	2	\N	1	2025-11-23 05:22:27.611273	\N	\N
3047	\N	2	\N	1	2025-11-23 05:22:28.653077	\N	\N
3052	\N	2	\N	1	2025-11-23 05:22:34.077627	\N	\N
3053	\N	2	\N	1	2025-11-23 05:22:35.083747	\N	\N
3054	\N	2	\N	1	2025-11-23 05:22:36.090146	\N	\N
3055	\N	2	\N	1	2025-11-23 05:22:37.131421	\N	\N
3056	\N	2	\N	1	2025-11-23 05:22:38.193701	\N	\N
3062	\N	2	\N	1	2025-11-23 05:22:44.763082	\N	\N
3063	\N	2	\N	1	2025-11-23 05:22:45.861096	\N	\N
3064	\N	2	\N	1	2025-11-23 05:22:46.984074	\N	\N
3065	\N	2	\N	1	2025-11-23 05:22:48.06336	\N	\N
3071	\N	2	\N	1	2025-11-23 05:22:54.747882	\N	\N
3072	\N	2	\N	1	2025-11-23 05:22:55.898678	\N	\N
3073	\N	2	\N	1	2025-11-23 05:22:57.045475	\N	\N
3074	\N	2	\N	1	2025-11-23 05:22:58.171177	\N	\N
3080	\N	2	\N	1	2025-11-23 05:23:04.806204	\N	\N
3081	\N	2	\N	1	2025-11-23 05:23:05.876438	\N	\N
3082	\N	2	\N	1	2025-11-23 05:23:07.043319	\N	\N
3083	\N	2	\N	1	2025-11-23 05:23:08.222376	\N	\N
3089	\N	2	\N	1	2025-11-23 05:23:14.764582	\N	\N
3090	\N	2	\N	1	2025-11-23 05:23:15.898995	\N	\N
3091	\N	2	\N	1	2025-11-23 05:23:17.002041	\N	\N
3092	\N	2	\N	1	2025-11-23 05:23:18.140067	\N	\N
3093	\N	2	\N	1	2025-11-23 05:23:19.26459	\N	\N
3094	\N	2	\N	1	2025-11-23 05:23:20.418797	\N	\N
3095	\N	2	\N	1	2025-11-23 05:23:21.500671	\N	\N
3096	\N	2	\N	1	2025-11-23 05:23:22.557798	\N	\N
3097	\N	2	\N	1	2025-11-23 05:23:23.730381	\N	\N
3098	\N	2	\N	1	2025-11-23 05:23:24.897699	\N	\N
3099	\N	2	\N	1	2025-11-23 05:23:25.942544	\N	\N
3100	\N	2	\N	1	2025-11-23 05:23:26.951606	\N	\N
3101	\N	2	\N	1	2025-11-23 05:23:27.970259	\N	\N
3102	\N	2	\N	1	2025-11-23 05:23:29.048874	\N	\N
3103	\N	2	\N	1	2025-11-23 05:23:30.06422	\N	\N
3104	\N	2	\N	1	2025-11-23 05:23:31.113612	\N	\N
3105	\N	2	\N	1	2025-11-23 05:23:32.20488	\N	\N
3106	\N	2	\N	1	2025-11-23 05:23:33.286559	\N	\N
3107	\N	2	\N	1	2025-11-23 05:23:34.422429	\N	\N
3108	\N	2	\N	1	2025-11-23 05:23:35.467167	\N	\N
3109	\N	2	\N	1	2025-11-23 05:23:36.609173	\N	\N
3110	\N	2	\N	1	2025-11-23 05:23:37.760116	\N	\N
3111	\N	2	\N	1	2025-11-23 05:23:38.861194	\N	\N
3112	\N	2	\N	1	2025-11-23 05:23:39.981575	\N	\N
3113	\N	2	\N	1	2025-11-23 05:23:41.151295	\N	\N
3114	\N	2	\N	1	2025-11-23 05:23:42.154912	\N	\N
3115	\N	2	\N	1	2025-11-23 05:23:43.213814	\N	\N
3116	\N	2	\N	1	2025-11-23 05:23:44.299569	\N	\N
3117	\N	2	\N	1	2025-11-23 05:23:45.317802	\N	\N
3118	\N	2	\N	1	2025-11-23 05:23:46.333779	\N	\N
3119	\N	2	\N	1	2025-11-23 05:23:47.45631	\N	\N
3120	\N	2	\N	1	2025-11-23 05:23:48.574838	\N	\N
3121	\N	2	\N	1	2025-11-23 05:23:49.706465	\N	\N
3122	\N	2	\N	1	2025-11-23 05:23:50.804128	\N	\N
3123	\N	2	\N	0	2025-11-23 05:23:51.867901	\N	\N
3124	\N	2	\N	1	2025-11-23 05:23:52.894763	\N	\N
3125	\N	2	\N	1	2025-11-23 05:23:54.034042	\N	\N
3126	\N	2	\N	1	2025-11-23 05:23:55.057691	\N	\N
3127	\N	2	\N	1	2025-11-23 05:23:56.139401	\N	\N
3128	\N	2	\N	1	2025-11-23 05:23:57.182449	\N	\N
3129	\N	2	\N	1	2025-11-23 05:23:58.226811	\N	\N
3130	\N	2	\N	1	2025-11-23 05:23:59.332309	\N	\N
3131	\N	2	\N	1	2025-11-23 05:24:00.350421	\N	\N
3132	\N	2	\N	1	2025-11-23 05:24:01.368409	\N	\N
3133	\N	2	\N	1	2025-11-23 05:24:02.42038	\N	\N
3134	\N	2	\N	1	2025-11-23 05:24:03.584631	\N	\N
3135	\N	2	\N	1	2025-11-23 05:24:04.586966	\N	\N
3136	\N	2	\N	1	2025-11-23 05:24:05.737951	\N	\N
3137	\N	2	\N	1	2025-11-23 05:24:06.763454	\N	\N
3138	\N	2	\N	1	2025-11-23 05:24:07.813952	\N	\N
3139	\N	2	\N	0	2025-11-23 05:24:08.834734	\N	\N
3140	\N	2	\N	0	2025-11-23 05:24:09.850336	\N	\N
3932	\N	2	\N	0	2025-11-23 06:24:47.843563	\N	\N
3933	\N	2	\N	1	2025-11-23 06:24:48.930863	\N	\N
3934	\N	2	\N	1	2025-11-23 06:24:49.945275	\N	\N
3935	\N	2	\N	1	2025-11-23 06:24:50.999107	\N	\N
3936	\N	2	\N	1	2025-11-23 06:24:52.077146	\N	\N
3961	\N	2	\N	1	2025-11-23 06:25:18.110574	\N	\N
3962	\N	2	\N	1	2025-11-23 06:25:19.263143	\N	\N
3963	\N	2	\N	1	2025-11-23 06:25:20.399963	\N	\N
3964	\N	2	\N	1	2025-11-23 06:25:21.452553	\N	\N
3965	\N	2	\N	1	2025-11-23 06:25:22.463354	\N	\N
3970	\N	2	\N	1	2025-11-23 06:25:27.740405	\N	\N
3971	\N	2	\N	1	2025-11-23 06:25:28.794785	\N	\N
3972	\N	2	\N	1	2025-11-23 06:25:29.835355	\N	\N
3974	\N	2	\N	1	2025-11-23 06:25:31.964957	\N	\N
3975	\N	2	\N	1	2025-11-23 06:25:33.023816	\N	\N
4026	\N	2	\N	0	2025-11-23 06:40:47.937782	\N	\N
4027	\N	2	\N	0	2025-11-23 06:40:49.064246	\N	\N
4028	\N	2	\N	0	2025-11-23 06:40:50.108603	\N	\N
4029	\N	2	\N	1	2025-11-23 06:40:51.170641	\N	\N
4034	\N	2	\N	1	2025-11-23 06:40:56.56328	\N	\N
4035	\N	2	\N	1	2025-11-23 06:40:57.601334	\N	\N
4036	\N	2	\N	0	2025-11-23 06:40:58.61898	\N	\N
4037	\N	2	\N	0	2025-11-23 06:40:59.717651	\N	\N
4038	\N	2	\N	0	2025-11-23 06:41:00.80009	\N	\N
4044	\N	2	\N	0	2025-11-23 06:41:07.244742	\N	\N
4045	\N	2	\N	0	2025-11-23 06:41:08.350664	\N	\N
4046	\N	2	\N	0	2025-11-23 06:41:09.461011	\N	\N
4047	\N	2	\N	1	2025-11-23 06:41:10.488532	\N	\N
4053	\N	2	\N	1	2025-11-23 06:41:16.719745	\N	\N
4054	\N	2	\N	1	2025-11-23 06:41:17.747067	\N	\N
4055	\N	2	\N	1	2025-11-23 06:41:18.779036	\N	\N
4056	\N	2	\N	1	2025-11-23 06:41:19.801465	\N	\N
4057	\N	2	\N	1	2025-11-23 06:41:20.825044	\N	\N
4063	\N	2	\N	1	2025-11-23 06:41:27.441514	\N	\N
4064	\N	2	\N	0	2025-11-23 06:41:28.609145	\N	\N
4065	\N	2	\N	0	2025-11-23 06:41:29.732301	\N	\N
4066	\N	2	\N	0	2025-11-23 06:41:30.898627	\N	\N
4071	\N	2	\N	0	2025-11-23 06:41:36.316343	\N	\N
4072	\N	2	\N	0	2025-11-23 06:41:37.488747	\N	\N
4073	\N	2	\N	0	2025-11-23 06:41:50.807824	\N	\N
4078	\N	2	\N	0	2025-11-23 06:41:56.599262	\N	\N
4079	\N	2	\N	0	2025-11-23 06:41:57.756133	\N	\N
4080	\N	2	\N	0	2025-11-23 06:41:58.89529	\N	\N
4081	\N	2	\N	0	2025-11-23 06:41:59.971603	\N	\N
4082	\N	2	\N	0	2025-11-23 06:42:01.064037	\N	\N
4087	\N	2	\N	0	2025-11-23 06:42:06.545419	\N	\N
4088	\N	2	\N	0	2025-11-23 06:42:07.674029	\N	\N
4089	\N	2	\N	0	2025-11-23 06:42:08.836687	\N	\N
4090	\N	2	\N	0	2025-11-23 06:42:09.927778	\N	\N
4091	\N	2	\N	0	2025-11-23 06:42:10.968432	\N	\N
4094	\N	2	\N	0	2025-11-23 06:43:27.317713	\N	\N
4095	\N	2	\N	1	2025-11-23 06:43:28.445674	\N	\N
4096	\N	2	\N	2	2025-11-23 06:43:29.48899	\N	\N
4097	\N	2	\N	1	2025-11-23 06:43:30.509852	\N	\N
4103	\N	2	\N	2	2025-11-23 06:43:36.988398	\N	\N
4104	\N	2	\N	2	2025-11-23 06:43:38.031906	\N	\N
4105	\N	2	\N	2	2025-11-23 06:43:39.109796	\N	\N
4106	\N	2	\N	0	2025-11-23 06:43:40.201742	\N	\N
4107	\N	2	\N	0	2025-11-23 06:43:41.224232	\N	\N
4112	\N	2	\N	1	2025-11-23 06:43:46.62726	\N	\N
4113	\N	2	\N	0	2025-11-23 06:43:47.629663	\N	\N
4114	\N	2	\N	0	2025-11-23 06:43:48.763315	\N	\N
4115	\N	2	\N	0	2025-11-23 06:43:49.910347	\N	\N
4223	\N	2	\N	0	2025-11-23 07:20:12.633042	\N	\N
4224	\N	2	\N	0	2025-11-23 07:20:13.821262	\N	\N
4230	\N	2	\N	0	2025-11-23 07:20:20.46899	\N	\N
4231	\N	2	\N	0	2025-11-23 07:20:21.603206	\N	\N
4232	\N	2	\N	0	2025-11-23 07:20:22.714713	\N	\N
4233	\N	2	\N	0	2025-11-23 07:20:23.749446	\N	\N
4239	\N	2	\N	1	2025-11-23 07:20:30.399623	\N	\N
4240	\N	2	\N	1	2025-11-23 07:20:31.399888	\N	\N
4241	\N	2	\N	0	2025-11-23 07:20:32.507643	\N	\N
4242	\N	2	\N	0	2025-11-23 07:20:33.553311	\N	\N
4248	\N	2	\N	1	2025-11-23 07:20:40.341027	\N	\N
4249	\N	2	\N	1	2025-11-23 07:20:41.389558	\N	\N
4250	\N	2	\N	1	2025-11-23 07:20:42.556015	\N	\N
4251	\N	2	\N	1	2025-11-23 07:20:43.66184	\N	\N
4257	\N	2	\N	2	2025-11-23 07:20:50.317159	\N	\N
4258	\N	2	\N	2	2025-11-23 07:20:51.413208	\N	\N
4259	\N	2	\N	2	2025-11-23 07:20:52.750773	\N	\N
4260	\N	2	\N	1	2025-11-23 07:20:53.750152	\N	\N
4266	\N	2	\N	1	2025-11-23 07:21:00.545103	\N	\N
4267	\N	2	\N	1	2025-11-23 07:21:01.70919	\N	\N
3048	\N	2	\N	1	2025-11-23 05:22:29.79963	\N	\N
3049	\N	2	\N	1	2025-11-23 05:22:30.836993	\N	\N
3050	\N	2	\N	1	2025-11-23 05:22:31.968033	\N	\N
3051	\N	2	\N	1	2025-11-23 05:22:32.983235	\N	\N
3057	\N	2	\N	1	2025-11-23 05:22:39.205827	\N	\N
3058	\N	2	\N	1	2025-11-23 05:22:40.31933	\N	\N
3059	\N	2	\N	1	2025-11-23 05:22:41.42443	\N	\N
3060	\N	2	\N	1	2025-11-23 05:22:42.550702	\N	\N
3061	\N	2	\N	1	2025-11-23 05:22:43.652738	\N	\N
3066	\N	2	\N	1	2025-11-23 05:22:49.194677	\N	\N
3067	\N	2	\N	1	2025-11-23 05:22:50.320136	\N	\N
3068	\N	2	\N	1	2025-11-23 05:22:51.454487	\N	\N
3069	\N	2	\N	1	2025-11-23 05:22:52.599773	\N	\N
3070	\N	2	\N	1	2025-11-23 05:22:53.635683	\N	\N
3075	\N	2	\N	1	2025-11-23 05:22:59.195356	\N	\N
3076	\N	2	\N	1	2025-11-23 05:23:00.308745	\N	\N
3077	\N	2	\N	1	2025-11-23 05:23:01.363584	\N	\N
3078	\N	2	\N	1	2025-11-23 05:23:02.4971	\N	\N
3079	\N	2	\N	1	2025-11-23 05:23:03.63639	\N	\N
3084	\N	2	\N	1	2025-11-23 05:23:09.357225	\N	\N
3085	\N	2	\N	1	2025-11-23 05:23:10.356683	\N	\N
3086	\N	2	\N	1	2025-11-23 05:23:11.414703	\N	\N
3087	\N	2	\N	1	2025-11-23 05:23:12.512694	\N	\N
3088	\N	2	\N	1	2025-11-23 05:23:13.648508	\N	\N
3141	\N	2	\N	0	2025-11-23 05:24:10.993607	\N	\N
3142	\N	2	\N	0	2025-11-23 05:24:12.097534	\N	\N
3143	\N	2	\N	0	2025-11-23 05:24:13.119779	\N	\N
3144	\N	2	\N	0	2025-11-23 05:24:14.207057	\N	\N
3145	\N	2	\N	1	2025-11-23 05:24:15.455918	\N	\N
3146	\N	2	\N	0	2025-11-23 05:24:16.479524	\N	\N
3147	\N	2	\N	0	2025-11-23 05:24:17.560339	\N	\N
3148	\N	2	\N	0	2025-11-23 05:24:18.563483	\N	\N
3149	\N	2	\N	0	2025-11-23 05:24:19.632488	\N	\N
3150	\N	2	\N	0	2025-11-23 05:24:20.700525	\N	\N
3151	\N	2	\N	0	2025-11-23 05:24:21.825311	\N	\N
3152	\N	2	\N	0	2025-11-23 05:24:22.849341	\N	\N
3153	\N	2	\N	0	2025-11-23 05:24:23.965257	\N	\N
3154	\N	2	\N	1	2025-11-23 05:24:24.969744	\N	\N
3155	\N	2	\N	1	2025-11-23 05:24:26.014684	\N	\N
3156	\N	2	\N	1	2025-11-23 05:24:27.165742	\N	\N
3157	\N	2	\N	1	2025-11-23 05:24:28.341905	\N	\N
3158	\N	2	\N	1	2025-11-23 05:24:29.439034	\N	\N
3159	\N	2	\N	1	2025-11-23 05:24:30.488447	\N	\N
3160	\N	2	\N	0	2025-11-23 05:24:31.591625	\N	\N
3161	\N	2	\N	0	2025-11-23 05:24:32.750903	\N	\N
3162	\N	2	\N	0	2025-11-23 05:24:33.851875	\N	\N
3163	\N	2	\N	0	2025-11-23 05:24:34.896768	\N	\N
3164	\N	2	\N	0	2025-11-23 05:24:35.965016	\N	\N
3165	\N	2	\N	0	2025-11-23 05:24:37.125576	\N	\N
3166	\N	2	\N	0	2025-11-23 05:24:38.183655	\N	\N
3167	\N	2	\N	0	2025-11-23 05:24:39.214193	\N	\N
3168	\N	2	\N	0	2025-11-23 05:24:40.256485	\N	\N
3169	\N	2	\N	0	2025-11-23 05:24:41.379698	\N	\N
3170	\N	2	\N	0	2025-11-23 05:24:42.50645	\N	\N
3171	\N	2	\N	1	2025-11-23 05:24:43.634125	\N	\N
3172	\N	2	\N	1	2025-11-23 05:24:44.77538	\N	\N
3173	\N	2	\N	1	2025-11-23 05:24:45.780834	\N	\N
3174	\N	2	\N	0	2025-11-23 05:24:46.816466	\N	\N
3175	\N	2	\N	0	2025-11-23 05:24:47.820631	\N	\N
3176	\N	2	\N	1	2025-11-23 05:24:48.837248	\N	\N
3177	\N	2	\N	0	2025-11-23 05:24:49.87085	\N	\N
3178	\N	2	\N	0	2025-11-23 05:24:50.991881	\N	\N
3179	\N	2	\N	0	2025-11-23 05:24:52.075459	\N	\N
3180	\N	2	\N	0	2025-11-23 05:24:53.19854	\N	\N
3181	\N	2	\N	0	2025-11-23 05:24:54.316894	\N	\N
3182	\N	2	\N	0	2025-11-23 05:24:55.456253	\N	\N
3183	\N	2	\N	0	2025-11-23 05:24:56.535335	\N	\N
3184	\N	2	\N	0	2025-11-23 05:24:57.624696	\N	\N
3185	\N	2	\N	0	2025-11-23 05:24:58.717826	\N	\N
3186	\N	2	\N	0	2025-11-23 05:24:59.748591	\N	\N
3187	\N	2	\N	0	2025-11-23 05:25:00.821776	\N	\N
3188	\N	2	\N	0	2025-11-23 05:25:01.933598	\N	\N
3189	\N	2	\N	0	2025-11-23 05:25:02.948924	\N	\N
3190	\N	2	\N	0	2025-11-23 05:25:04.138961	\N	\N
3191	\N	2	\N	0	2025-11-23 05:25:05.22551	\N	\N
3192	\N	2	\N	1	2025-11-23 05:25:06.366445	\N	\N
3193	\N	2	\N	0	2025-11-23 05:25:07.520043	\N	\N
3194	\N	2	\N	1	2025-11-23 05:25:08.587305	\N	\N
3195	\N	2	\N	0	2025-11-23 05:25:09.691682	\N	\N
3196	\N	2	\N	0	2025-11-23 05:25:10.96414	\N	\N
3197	\N	2	\N	0	2025-11-23 05:25:11.966095	\N	\N
3198	\N	2	\N	0	2025-11-23 05:25:13.016162	\N	\N
3199	\N	2	\N	0	2025-11-23 05:25:14.106753	\N	\N
3200	\N	2	\N	0	2025-11-23 05:25:15.210433	\N	\N
3201	\N	2	\N	0	2025-11-23 05:25:16.307703	\N	\N
3202	\N	2	\N	0	2025-11-23 05:25:17.356826	\N	\N
3203	\N	2	\N	1	2025-11-23 05:25:18.524241	\N	\N
3204	\N	2	\N	1	2025-11-23 05:25:19.551757	\N	\N
3205	\N	2	\N	1	2025-11-23 05:25:20.641942	\N	\N
3206	\N	2	\N	1	2025-11-23 05:25:21.683331	\N	\N
3207	\N	2	\N	1	2025-11-23 05:25:22.815935	\N	\N
3208	\N	2	\N	1	2025-11-23 05:25:23.848168	\N	\N
3209	\N	2	\N	1	2025-11-23 05:25:24.920061	\N	\N
3210	\N	2	\N	1	2025-11-23 05:25:25.982662	\N	\N
3211	\N	2	\N	1	2025-11-23 05:25:27.072643	\N	\N
3212	\N	2	\N	1	2025-11-23 05:25:28.096151	\N	\N
3213	\N	2	\N	1	2025-11-23 05:25:29.154168	\N	\N
3214	\N	2	\N	1	2025-11-23 05:25:30.198847	\N	\N
3215	\N	2	\N	1	2025-11-23 05:25:31.207694	\N	\N
3216	\N	2	\N	1	2025-11-23 05:25:32.230315	\N	\N
3217	\N	2	\N	1	2025-11-23 05:25:33.306957	\N	\N
3218	\N	2	\N	1	2025-11-23 05:25:34.40904	\N	\N
3219	\N	2	\N	1	2025-11-23 05:25:35.422497	\N	\N
3220	\N	2	\N	0	2025-11-23 05:25:36.447531	\N	\N
3221	\N	2	\N	1	2025-11-23 05:25:37.547808	\N	\N
3222	\N	2	\N	0	2025-11-23 05:25:38.710942	\N	\N
3223	\N	2	\N	0	2025-11-23 05:25:39.730702	\N	\N
3224	\N	2	\N	0	2025-11-23 05:25:40.731891	\N	\N
3225	\N	2	\N	1	2025-11-23 05:25:41.732194	\N	\N
3226	\N	2	\N	1	2025-11-23 05:25:42.803904	\N	\N
3227	\N	2	\N	0	2025-11-23 05:25:43.946012	\N	\N
3228	\N	2	\N	0	2025-11-23 05:25:45.026606	\N	\N
3229	\N	2	\N	0	2025-11-23 05:25:46.162978	\N	\N
3230	\N	2	\N	0	2025-11-23 05:25:47.250492	\N	\N
3231	\N	2	\N	0	2025-11-23 05:25:48.256332	\N	\N
3232	\N	2	\N	0	2025-11-23 05:25:49.415421	\N	\N
3233	\N	2	\N	0	2025-11-23 05:25:50.431017	\N	\N
3234	\N	2	\N	0	2025-11-23 05:25:51.556288	\N	\N
3235	\N	2	\N	1	2025-11-23 05:25:52.674367	\N	\N
3236	\N	2	\N	1	2025-11-23 05:25:53.773055	\N	\N
3237	\N	2	\N	1	2025-11-23 05:25:54.813395	\N	\N
3238	\N	2	\N	1	2025-11-23 05:25:55.910047	\N	\N
3239	\N	2	\N	1	2025-11-23 05:25:56.916426	\N	\N
3240	\N	2	\N	1	2025-11-23 05:25:57.92543	\N	\N
3241	\N	2	\N	1	2025-11-23 05:25:59.167385	\N	\N
3242	\N	2	\N	1	2025-11-23 05:26:00.17507	\N	\N
3243	\N	2	\N	1	2025-11-23 05:26:01.29706	\N	\N
3244	\N	2	\N	1	2025-11-23 05:26:02.401954	\N	\N
3245	\N	2	\N	1	2025-11-23 05:26:03.476578	\N	\N
3246	\N	2	\N	1	2025-11-23 05:26:04.616089	\N	\N
3247	\N	2	\N	1	2025-11-23 05:26:05.702912	\N	\N
3248	\N	2	\N	1	2025-11-23 05:26:06.905699	\N	\N
3249	\N	2	\N	1	2025-11-23 05:26:08.017567	\N	\N
3250	\N	2	\N	1	2025-11-23 05:26:09.150824	\N	\N
3251	\N	2	\N	1	2025-11-23 05:26:10.261106	\N	\N
3252	\N	2	\N	1	2025-11-23 05:26:11.355802	\N	\N
3253	\N	2	\N	1	2025-11-23 05:26:12.355791	\N	\N
3254	\N	2	\N	1	2025-11-23 05:26:13.528998	\N	\N
3255	\N	2	\N	1	2025-11-23 05:26:14.546636	\N	\N
3256	\N	2	\N	1	2025-11-23 05:26:15.559019	\N	\N
3257	\N	2	\N	1	2025-11-23 05:26:16.700347	\N	\N
3258	\N	2	\N	1	2025-11-23 05:26:17.834216	\N	\N
3259	\N	2	\N	1	2025-11-23 05:26:18.977967	\N	\N
3260	\N	2	\N	1	2025-11-23 05:26:20.060327	\N	\N
3261	\N	2	\N	1	2025-11-23 05:26:21.149255	\N	\N
3262	\N	2	\N	1	2025-11-23 05:26:22.267101	\N	\N
3263	\N	2	\N	1	2025-11-23 05:26:23.304983	\N	\N
3264	\N	2	\N	1	2025-11-23 05:26:24.325221	\N	\N
3265	\N	2	\N	1	2025-11-23 05:26:25.441108	\N	\N
3266	\N	2	\N	1	2025-11-23 05:26:26.563697	\N	\N
3267	\N	2	\N	1	2025-11-23 05:26:27.707474	\N	\N
3268	\N	2	\N	1	2025-11-23 05:26:28.858325	\N	\N
3269	\N	2	\N	1	2025-11-23 05:26:29.97998	\N	\N
3270	\N	2	\N	1	2025-11-23 05:26:30.988082	\N	\N
3271	\N	2	\N	1	2025-11-23 05:26:32.001866	\N	\N
3272	\N	2	\N	1	2025-11-23 05:26:33.129209	\N	\N
3273	\N	2	\N	1	2025-11-23 05:26:34.243088	\N	\N
3274	\N	2	\N	1	2025-11-23 05:26:35.381986	\N	\N
3275	\N	2	\N	1	2025-11-23 05:26:36.4306	\N	\N
3276	\N	2	\N	1	2025-11-23 05:26:37.57464	\N	\N
3277	\N	2	\N	1	2025-11-23 05:26:38.711206	\N	\N
3278	\N	2	\N	1	2025-11-23 05:26:39.873817	\N	\N
3279	\N	2	\N	1	2025-11-23 05:26:41.038802	\N	\N
3280	\N	2	\N	1	2025-11-23 05:26:42.055667	\N	\N
3281	\N	2	\N	1	2025-11-23 05:26:43.133312	\N	\N
3282	\N	2	\N	1	2025-11-23 05:26:44.222561	\N	\N
3283	\N	2	\N	1	2025-11-23 05:26:45.285408	\N	\N
3284	\N	2	\N	1	2025-11-23 05:26:46.344686	\N	\N
3285	\N	2	\N	1	2025-11-23 05:26:47.479532	\N	\N
3286	\N	2	\N	1	2025-11-23 05:26:48.49353	\N	\N
3287	\N	2	\N	1	2025-11-23 05:26:49.497831	\N	\N
3288	\N	2	\N	1	2025-11-23 05:26:50.538925	\N	\N
3289	\N	2	\N	1	2025-11-23 05:26:51.551958	\N	\N
3290	\N	2	\N	1	2025-11-23 05:26:52.648422	\N	\N
3291	\N	2	\N	0	2025-11-23 05:26:53.804337	\N	\N
3292	\N	2	\N	0	2025-11-23 05:26:54.83845	\N	\N
3293	\N	2	\N	1	2025-11-23 05:26:56.022963	\N	\N
3294	\N	2	\N	1	2025-11-23 05:26:57.06268	\N	\N
3295	\N	2	\N	1	2025-11-23 05:26:58.102249	\N	\N
3296	\N	2	\N	1	2025-11-23 05:26:59.35076	\N	\N
3297	\N	2	\N	1	2025-11-23 05:27:00.498525	\N	\N
3298	\N	2	\N	1	2025-11-23 05:27:01.642037	\N	\N
3299	\N	2	\N	1	2025-11-23 05:27:02.680471	\N	\N
3300	\N	2	\N	1	2025-11-23 05:27:03.878404	\N	\N
3301	\N	2	\N	1	2025-11-23 05:27:04.895386	\N	\N
3302	\N	2	\N	1	2025-11-23 05:27:06.036678	\N	\N
3303	\N	2	\N	1	2025-11-23 05:27:07.091852	\N	\N
3304	\N	2	\N	1	2025-11-23 05:27:08.156711	\N	\N
3305	\N	2	\N	1	2025-11-23 05:27:09.308997	\N	\N
3306	\N	2	\N	1	2025-11-23 05:27:10.443146	\N	\N
3307	\N	2	\N	1	2025-11-23 05:27:11.58576	\N	\N
3308	\N	2	\N	1	2025-11-23 05:27:12.730621	\N	\N
3309	\N	2	\N	1	2025-11-23 05:27:13.848926	\N	\N
3310	\N	2	\N	1	2025-11-23 05:27:14.955972	\N	\N
3311	\N	2	\N	1	2025-11-23 05:27:15.969902	\N	\N
3312	\N	2	\N	1	2025-11-23 05:27:17.118382	\N	\N
3313	\N	2	\N	1	2025-11-23 05:27:18.267463	\N	\N
3314	\N	2	\N	1	2025-11-23 05:27:19.300337	\N	\N
3315	\N	2	\N	1	2025-11-23 05:27:20.336682	\N	\N
3316	\N	2	\N	1	2025-11-23 05:27:21.447458	\N	\N
3317	\N	2	\N	1	2025-11-23 05:27:22.581096	\N	\N
3318	\N	2	\N	1	2025-11-23 05:27:23.664128	\N	\N
3319	\N	2	\N	1	2025-11-23 05:27:24.798718	\N	\N
3320	\N	2	\N	1	2025-11-23 05:27:25.894806	\N	\N
3321	\N	2	\N	1	2025-11-23 05:27:26.931202	\N	\N
3322	\N	2	\N	1	2025-11-23 05:27:27.967576	\N	\N
3323	\N	2	\N	1	2025-11-23 05:27:29.101243	\N	\N
3324	\N	2	\N	1	2025-11-23 05:27:30.204733	\N	\N
3325	\N	2	\N	1	2025-11-23 05:27:31.222264	\N	\N
3326	\N	2	\N	1	2025-11-23 05:27:32.350007	\N	\N
3327	\N	2	\N	1	2025-11-23 05:27:33.362766	\N	\N
3328	\N	2	\N	1	2025-11-23 05:27:34.455394	\N	\N
3329	\N	2	\N	1	2025-11-23 05:27:35.46495	\N	\N
3330	\N	2	\N	0	2025-11-23 05:27:36.492927	\N	\N
3331	\N	2	\N	0	2025-11-23 05:27:37.627188	\N	\N
3332	\N	2	\N	1	2025-11-23 05:27:38.673093	\N	\N
3333	\N	2	\N	0	2025-11-23 05:27:39.708679	\N	\N
3334	\N	2	\N	0	2025-11-23 05:27:40.725452	\N	\N
3335	\N	2	\N	0	2025-11-23 05:27:41.880091	\N	\N
3336	\N	2	\N	1	2025-11-23 05:27:42.966126	\N	\N
3337	\N	2	\N	0	2025-11-23 05:27:44.00917	\N	\N
3338	\N	2	\N	0	2025-11-23 05:27:45.033062	\N	\N
3339	\N	2	\N	0	2025-11-23 05:27:46.08877	\N	\N
3340	\N	2	\N	0	2025-11-23 05:27:47.113386	\N	\N
3341	\N	2	\N	0	2025-11-23 05:27:48.136936	\N	\N
3342	\N	2	\N	0	2025-11-23 05:27:49.147084	\N	\N
3343	\N	2	\N	1	2025-11-23 05:27:50.218684	\N	\N
3344	\N	2	\N	1	2025-11-23 05:27:51.28205	\N	\N
3345	\N	2	\N	1	2025-11-23 05:27:52.417446	\N	\N
3346	\N	2	\N	1	2025-11-23 05:27:53.435661	\N	\N
3347	\N	2	\N	0	2025-11-23 05:27:54.47427	\N	\N
3348	\N	2	\N	0	2025-11-23 05:27:55.629488	\N	\N
3349	\N	2	\N	1	2025-11-23 05:27:56.669537	\N	\N
3350	\N	2	\N	1	2025-11-23 05:27:57.708605	\N	\N
3351	\N	2	\N	1	2025-11-23 05:27:58.758752	\N	\N
3352	\N	2	\N	1	2025-11-23 05:27:59.944605	\N	\N
3353	\N	2	\N	1	2025-11-23 05:28:01.075914	\N	\N
3354	\N	2	\N	1	2025-11-23 05:28:02.186066	\N	\N
3355	\N	2	\N	1	2025-11-23 05:28:03.297678	\N	\N
3356	\N	2	\N	0	2025-11-23 05:28:04.333105	\N	\N
3357	\N	2	\N	1	2025-11-23 05:28:05.334984	\N	\N
3358	\N	2	\N	0	2025-11-23 05:28:06.420705	\N	\N
3359	\N	2	\N	1	2025-11-23 05:28:07.66528	\N	\N
3360	\N	2	\N	1	2025-11-23 05:28:08.825621	\N	\N
3361	\N	2	\N	1	2025-11-23 05:28:09.907978	\N	\N
3362	\N	2	\N	1	2025-11-23 05:28:11.004508	\N	\N
3363	\N	2	\N	1	2025-11-23 05:28:12.248053	\N	\N
3364	\N	2	\N	1	2025-11-23 05:28:13.301932	\N	\N
3365	\N	2	\N	1	2025-11-23 05:28:14.403184	\N	\N
3366	\N	2	\N	1	2025-11-23 05:28:15.526645	\N	\N
3367	\N	2	\N	1	2025-11-23 05:28:16.67067	\N	\N
3368	\N	2	\N	1	2025-11-23 05:28:17.811383	\N	\N
3369	\N	2	\N	1	2025-11-23 05:28:18.97199	\N	\N
3370	\N	2	\N	1	2025-11-23 05:28:20.058088	\N	\N
3371	\N	2	\N	1	2025-11-23 05:28:21.061239	\N	\N
3372	\N	2	\N	1	2025-11-23 05:28:22.184997	\N	\N
3373	\N	2	\N	1	2025-11-23 05:28:23.324225	\N	\N
3374	\N	2	\N	1	2025-11-23 05:28:24.495491	\N	\N
3375	\N	2	\N	1	2025-11-23 05:28:25.571504	\N	\N
3376	\N	2	\N	1	2025-11-23 05:28:26.71513	\N	\N
3377	\N	2	\N	1	2025-11-23 05:28:27.859942	\N	\N
3378	\N	2	\N	1	2025-11-23 05:28:28.99311	\N	\N
3379	\N	2	\N	1	2025-11-23 05:28:30.030722	\N	\N
3380	\N	2	\N	1	2025-11-23 05:28:31.109533	\N	\N
3381	\N	2	\N	1	2025-11-23 05:28:32.227081	\N	\N
3382	\N	2	\N	1	2025-11-23 05:28:33.247215	\N	\N
3383	\N	2	\N	1	2025-11-23 05:28:34.271591	\N	\N
3384	\N	2	\N	1	2025-11-23 05:28:35.387379	\N	\N
3385	\N	2	\N	1	2025-11-23 05:28:36.56275	\N	\N
3386	\N	2	\N	1	2025-11-23 05:28:37.709991	\N	\N
3387	\N	2	\N	1	2025-11-23 05:28:38.833345	\N	\N
3388	\N	2	\N	1	2025-11-23 05:28:39.92735	\N	\N
3389	\N	2	\N	1	2025-11-23 05:28:40.950471	\N	\N
3390	\N	2	\N	1	2025-11-23 05:28:42.10397	\N	\N
3391	\N	2	\N	1	2025-11-23 05:28:43.158439	\N	\N
3392	\N	2	\N	1	2025-11-23 05:28:44.248419	\N	\N
3393	\N	2	\N	1	2025-11-23 05:28:45.304177	\N	\N
3394	\N	2	\N	1	2025-11-23 05:28:46.316367	\N	\N
3395	\N	2	\N	1	2025-11-23 05:28:47.431061	\N	\N
3396	\N	2	\N	1	2025-11-23 05:28:48.493152	\N	\N
3397	\N	2	\N	1	2025-11-23 05:28:49.627876	\N	\N
3398	\N	2	\N	1	2025-11-23 05:28:50.632464	\N	\N
3399	\N	2	\N	1	2025-11-23 05:28:51.76842	\N	\N
3400	\N	2	\N	1	2025-11-23 05:28:52.89949	\N	\N
3401	\N	2	\N	1	2025-11-23 05:28:53.960123	\N	\N
3402	\N	2	\N	1	2025-11-23 05:28:55.144574	\N	\N
3403	\N	2	\N	1	2025-11-23 05:28:56.395654	\N	\N
3404	\N	2	\N	1	2025-11-23 05:28:57.648309	\N	\N
3405	\N	2	\N	1	2025-11-23 05:28:58.691955	\N	\N
3406	\N	2	\N	1	2025-11-23 05:28:59.800911	\N	\N
3407	\N	2	\N	0	2025-11-23 05:29:00.81878	\N	\N
3408	\N	2	\N	1	2025-11-23 05:29:01.9619	\N	\N
3409	\N	2	\N	1	2025-11-23 05:29:03.124616	\N	\N
3410	\N	2	\N	1	2025-11-23 05:29:04.228841	\N	\N
3411	\N	2	\N	1	2025-11-23 05:29:05.38938	\N	\N
3412	\N	2	\N	1	2025-11-23 05:29:06.423855	\N	\N
3413	\N	2	\N	1	2025-11-23 05:29:07.449993	\N	\N
3414	\N	2	\N	0	2025-11-23 05:29:08.521317	\N	\N
3415	\N	2	\N	0	2025-11-23 05:29:09.693426	\N	\N
3416	\N	2	\N	0	2025-11-23 05:29:10.706625	\N	\N
3417	\N	2	\N	1	2025-11-23 05:29:11.763903	\N	\N
3418	\N	2	\N	0	2025-11-23 05:29:12.828423	\N	\N
3419	\N	2	\N	1	2025-11-23 05:29:13.994678	\N	\N
3420	\N	2	\N	1	2025-11-23 05:29:15.050866	\N	\N
3421	\N	2	\N	1	2025-11-23 05:29:16.12176	\N	\N
3422	\N	2	\N	1	2025-11-23 05:29:17.258506	\N	\N
3423	\N	2	\N	1	2025-11-23 05:29:18.278668	\N	\N
3424	\N	2	\N	1	2025-11-23 05:29:19.40707	\N	\N
3425	\N	2	\N	1	2025-11-23 05:29:20.552383	\N	\N
3426	\N	2	\N	1	2025-11-23 05:29:21.654704	\N	\N
3427	\N	2	\N	1	2025-11-23 05:29:22.79683	\N	\N
3428	\N	2	\N	1	2025-11-23 05:29:23.895548	\N	\N
3429	\N	2	\N	1	2025-11-23 05:29:25.010576	\N	\N
3430	\N	2	\N	1	2025-11-23 05:29:26.030773	\N	\N
3431	\N	2	\N	1	2025-11-23 05:29:27.13765	\N	\N
3432	\N	2	\N	1	2025-11-23 05:29:28.260035	\N	\N
3433	\N	2	\N	1	2025-11-23 05:29:29.276718	\N	\N
3434	\N	2	\N	1	2025-11-23 05:29:30.426154	\N	\N
3435	\N	2	\N	1	2025-11-23 05:29:31.568272	\N	\N
3436	\N	2	\N	1	2025-11-23 05:29:32.716505	\N	\N
3437	\N	2	\N	1	2025-11-23 05:29:33.802886	\N	\N
3438	\N	2	\N	1	2025-11-23 05:29:34.9499	\N	\N
3439	\N	2	\N	1	2025-11-23 05:29:36.016882	\N	\N
3440	\N	2	\N	1	2025-11-23 05:29:37.060757	\N	\N
3441	\N	2	\N	1	2025-11-23 05:29:38.217066	\N	\N
3442	\N	2	\N	1	2025-11-23 05:29:39.306274	\N	\N
3443	\N	2	\N	1	2025-11-23 05:29:40.449717	\N	\N
3444	\N	2	\N	1	2025-11-23 05:29:41.57723	\N	\N
3445	\N	2	\N	1	2025-11-23 05:29:42.676445	\N	\N
3446	\N	2	\N	1	2025-11-23 05:29:43.718948	\N	\N
3447	\N	2	\N	1	2025-11-23 05:29:44.74731	\N	\N
3448	\N	2	\N	1	2025-11-23 05:29:45.782904	\N	\N
3449	\N	2	\N	1	2025-11-23 05:29:46.805679	\N	\N
3450	\N	2	\N	1	2025-11-23 05:29:47.941876	\N	\N
3451	\N	2	\N	1	2025-11-23 05:29:48.955609	\N	\N
3452	\N	2	\N	1	2025-11-23 05:29:50.01034	\N	\N
3453	\N	2	\N	1	2025-11-23 05:29:51.224628	\N	\N
3454	\N	2	\N	1	2025-11-23 05:29:52.281696	\N	\N
3455	\N	2	\N	1	2025-11-23 05:29:53.374247	\N	\N
3456	\N	2	\N	1	2025-11-23 05:29:54.626453	\N	\N
3457	\N	2	\N	1	2025-11-23 05:29:56.065036	\N	\N
3458	\N	2	\N	1	2025-11-23 05:29:57.316625	\N	\N
3459	\N	2	\N	1	2025-11-23 05:29:58.461501	\N	\N
3460	\N	2	\N	1	2025-11-23 05:29:59.540828	\N	\N
3461	\N	2	\N	1	2025-11-23 05:30:00.669445	\N	\N
3462	\N	2	\N	1	2025-11-23 05:30:01.773458	\N	\N
3463	\N	2	\N	1	2025-11-23 05:30:02.77704	\N	\N
3464	\N	2	\N	1	2025-11-23 05:30:03.845371	\N	\N
3465	\N	2	\N	1	2025-11-23 05:30:05.078551	\N	\N
3466	\N	2	\N	1	2025-11-23 05:30:06.163897	\N	\N
3467	\N	2	\N	1	2025-11-23 05:30:07.212285	\N	\N
3468	\N	2	\N	1	2025-11-23 05:30:08.561815	\N	\N
3469	\N	2	\N	1	2025-11-23 05:30:09.561506	\N	\N
3470	\N	2	\N	1	2025-11-23 05:30:10.605926	\N	\N
3471	\N	2	\N	1	2025-11-23 05:30:11.671267	\N	\N
3472	\N	2	\N	1	2025-11-23 05:30:12.823997	\N	\N
3473	\N	2	\N	1	2025-11-23 05:30:13.958038	\N	\N
3474	\N	2	\N	1	2025-11-23 05:30:15.026511	\N	\N
3475	\N	2	\N	1	2025-11-23 05:30:16.205906	\N	\N
3476	\N	2	\N	1	2025-11-23 05:30:17.393724	\N	\N
3477	\N	2	\N	1	2025-11-23 05:30:18.487322	\N	\N
3478	\N	2	\N	1	2025-11-23 05:30:19.495442	\N	\N
3479	\N	2	\N	1	2025-11-23 05:30:20.507735	\N	\N
3480	\N	2	\N	1	2025-11-23 05:30:21.536468	\N	\N
3481	\N	2	\N	1	2025-11-23 05:30:22.556159	\N	\N
3482	\N	2	\N	1	2025-11-23 05:30:23.57999	\N	\N
3483	\N	2	\N	0	2025-11-23 05:30:24.600023	\N	\N
3484	\N	2	\N	1	2025-11-23 05:30:25.653772	\N	\N
3485	\N	2	\N	0	2025-11-23 05:30:26.696099	\N	\N
3486	\N	2	\N	1	2025-11-23 05:30:27.793637	\N	\N
3487	\N	2	\N	1	2025-11-23 05:30:28.91229	\N	\N
3488	\N	2	\N	1	2025-11-23 05:30:30.046726	\N	\N
3489	\N	2	\N	1	2025-11-23 05:30:31.062723	\N	\N
3490	\N	2	\N	1	2025-11-23 05:30:32.097044	\N	\N
3491	\N	2	\N	1	2025-11-23 05:30:33.106014	\N	\N
3492	\N	2	\N	1	2025-11-23 05:30:34.138596	\N	\N
3493	\N	2	\N	1	2025-11-23 05:30:35.141048	\N	\N
3494	\N	2	\N	1	2025-11-23 05:30:36.184533	\N	\N
3495	\N	2	\N	1	2025-11-23 05:30:37.23159	\N	\N
3496	\N	2	\N	1	2025-11-23 05:30:38.254842	\N	\N
3497	\N	2	\N	1	2025-11-23 05:30:39.388822	\N	\N
3498	\N	2	\N	1	2025-11-23 05:30:40.494214	\N	\N
3499	\N	2	\N	1	2025-11-23 05:30:41.640579	\N	\N
3500	\N	2	\N	1	2025-11-23 05:30:42.653046	\N	\N
3501	\N	2	\N	0	2025-11-23 05:30:43.754068	\N	\N
3502	\N	2	\N	1	2025-11-23 05:30:44.825506	\N	\N
3503	\N	2	\N	1	2025-11-23 05:30:45.906797	\N	\N
3504	\N	2	\N	0	2025-11-23 05:30:46.935124	\N	\N
3505	\N	2	\N	0	2025-11-23 05:30:48.012837	\N	\N
3506	\N	2	\N	0	2025-11-23 05:30:49.083864	\N	\N
3507	\N	2	\N	0	2025-11-23 05:30:50.126966	\N	\N
3508	\N	2	\N	0	2025-11-23 05:30:51.22075	\N	\N
3509	\N	2	\N	0	2025-11-23 05:30:52.236247	\N	\N
3510	\N	2	\N	0	2025-11-23 05:30:53.241413	\N	\N
3511	\N	2	\N	0	2025-11-23 05:30:54.278359	\N	\N
3512	\N	2	\N	0	2025-11-23 05:30:55.316623	\N	\N
3513	\N	2	\N	0	2025-11-23 05:30:56.342635	\N	\N
3514	\N	2	\N	0	2025-11-23 05:30:57.359487	\N	\N
3515	\N	2	\N	0	2025-11-23 05:30:58.38179	\N	\N
3516	\N	2	\N	0	2025-11-23 05:30:59.394509	\N	\N
3517	\N	2	\N	0	2025-11-23 05:31:00.642	\N	\N
3518	\N	2	\N	1	2025-11-23 05:31:01.769039	\N	\N
3519	\N	2	\N	1	2025-11-23 05:31:02.885612	\N	\N
3520	\N	2	\N	1	2025-11-23 05:31:04.002337	\N	\N
3521	\N	2	\N	1	2025-11-23 05:31:05.038768	\N	\N
3522	\N	2	\N	1	2025-11-23 05:31:06.095258	\N	\N
3523	\N	2	\N	1	2025-11-23 05:31:07.350813	\N	\N
3524	\N	2	\N	1	2025-11-23 05:31:08.443953	\N	\N
3525	\N	2	\N	0	2025-11-23 05:31:09.530661	\N	\N
3526	\N	2	\N	0	2025-11-23 05:31:10.604019	\N	\N
3527	\N	2	\N	0	2025-11-23 05:31:11.664637	\N	\N
3528	\N	2	\N	0	2025-11-23 05:31:12.758233	\N	\N
3529	\N	2	\N	0	2025-11-23 05:31:13.804349	\N	\N
3530	\N	2	\N	0	2025-11-23 05:31:14.925315	\N	\N
3531	\N	2	\N	0	2025-11-23 05:31:16.084253	\N	\N
3532	\N	2	\N	0	2025-11-23 05:31:17.123969	\N	\N
3533	\N	2	\N	0	2025-11-23 05:31:18.163507	\N	\N
3534	\N	2	\N	0	2025-11-23 05:31:19.226322	\N	\N
3535	\N	2	\N	0	2025-11-23 05:31:20.39907	\N	\N
3536	\N	2	\N	0	2025-11-23 05:31:21.428955	\N	\N
3537	\N	2	\N	0	2025-11-23 05:31:22.485062	\N	\N
3538	\N	2	\N	0	2025-11-23 05:31:23.584228	\N	\N
3539	\N	2	\N	0	2025-11-23 05:31:24.677544	\N	\N
3540	\N	2	\N	0	2025-11-23 05:31:25.794876	\N	\N
3541	\N	2	\N	0	2025-11-23 05:31:26.847131	\N	\N
3542	\N	2	\N	0	2025-11-23 05:31:27.869472	\N	\N
3543	\N	2	\N	0	2025-11-23 05:31:28.881943	\N	\N
3544	\N	2	\N	0	2025-11-23 05:31:29.988668	\N	\N
3545	\N	2	\N	0	2025-11-23 05:31:31.102277	\N	\N
3546	\N	2	\N	0	2025-11-23 05:31:32.141145	\N	\N
3547	\N	2	\N	0	2025-11-23 05:31:33.201892	\N	\N
3548	\N	2	\N	0	2025-11-23 05:31:34.185656	\N	\N
3549	\N	2	\N	0	2025-11-23 05:31:35.23559	\N	\N
3550	\N	2	\N	0	2025-11-23 05:31:36.301128	\N	\N
3551	\N	2	\N	0	2025-11-23 05:31:37.32821	\N	\N
3552	\N	2	\N	0	2025-11-23 05:31:38.406186	\N	\N
3553	\N	2	\N	0	2025-11-23 05:31:39.460319	\N	\N
3554	\N	2	\N	0	2025-11-23 05:31:40.556222	\N	\N
3555	\N	2	\N	0	2025-11-23 05:31:41.659654	\N	\N
3556	\N	2	\N	0	2025-11-23 05:31:42.740144	\N	\N
3557	\N	2	\N	0	2025-11-23 05:31:43.8003	\N	\N
3558	\N	2	\N	0	2025-11-23 05:31:44.905732	\N	\N
3559	\N	2	\N	0	2025-11-23 05:31:45.987537	\N	\N
3560	\N	2	\N	0	2025-11-23 05:31:47.0781	\N	\N
3561	\N	2	\N	0	2025-11-23 05:31:48.216133	\N	\N
3562	\N	2	\N	0	2025-11-23 05:31:49.311792	\N	\N
3563	\N	2	\N	0	2025-11-23 05:31:50.314953	\N	\N
3564	\N	2	\N	0	2025-11-23 05:31:51.407812	\N	\N
3565	\N	2	\N	0	2025-11-23 05:31:52.446416	\N	\N
3566	\N	2	\N	1	2025-11-23 05:31:53.571465	\N	\N
3567	\N	2	\N	0	2025-11-23 05:31:54.670983	\N	\N
3568	\N	2	\N	0	2025-11-23 05:31:55.759846	\N	\N
3569	\N	2	\N	0	2025-11-23 05:31:56.811528	\N	\N
3570	\N	2	\N	0	2025-11-23 05:31:57.812859	\N	\N
3571	\N	2	\N	0	2025-11-23 05:31:58.869782	\N	\N
3572	\N	2	\N	0	2025-11-23 05:32:00.090476	\N	\N
3573	\N	2	\N	0	2025-11-23 05:32:01.174409	\N	\N
3574	\N	2	\N	0	2025-11-23 05:32:02.257038	\N	\N
3575	\N	2	\N	0	2025-11-23 05:32:03.357583	\N	\N
3576	\N	2	\N	1	2025-11-23 05:32:04.54533	\N	\N
3577	\N	2	\N	1	2025-11-23 05:32:05.559809	\N	\N
3578	\N	2	\N	0	2025-11-23 05:32:06.569898	\N	\N
3579	\N	2	\N	1	2025-11-23 05:32:08.046576	\N	\N
3580	\N	2	\N	1	2025-11-23 05:32:09.535199	\N	\N
3581	\N	2	\N	1	2025-11-23 05:32:10.58776	\N	\N
3582	\N	2	\N	1	2025-11-23 05:32:11.690138	\N	\N
3583	\N	2	\N	1	2025-11-23 05:32:12.813313	\N	\N
3584	\N	2	\N	0	2025-11-23 05:32:13.988787	\N	\N
3585	\N	2	\N	1	2025-11-23 05:32:15.061891	\N	\N
3586	\N	2	\N	0	2025-11-23 05:32:16.257749	\N	\N
3587	\N	2	\N	0	2025-11-23 05:32:17.27969	\N	\N
3588	\N	2	\N	1	2025-11-23 05:32:18.390154	\N	\N
3589	\N	2	\N	0	2025-11-23 05:32:19.394695	\N	\N
3590	\N	2	\N	0	2025-11-23 05:32:20.438468	\N	\N
3591	\N	2	\N	0	2025-11-23 05:32:21.468705	\N	\N
3592	\N	2	\N	1	2025-11-23 05:32:22.542508	\N	\N
3593	\N	2	\N	0	2025-11-23 05:32:23.719492	\N	\N
3594	\N	2	\N	0	2025-11-23 05:32:24.843191	\N	\N
3595	\N	2	\N	0	2025-11-23 05:32:26.032186	\N	\N
3596	\N	2	\N	0	2025-11-23 05:32:27.129182	\N	\N
3597	\N	2	\N	1	2025-11-23 05:32:28.219736	\N	\N
3598	\N	2	\N	0	2025-11-23 05:32:29.329414	\N	\N
3599	\N	2	\N	0	2025-11-23 05:32:30.456012	\N	\N
3600	\N	2	\N	0	2025-11-23 05:32:31.468548	\N	\N
3601	\N	2	\N	1	2025-11-23 05:32:32.586729	\N	\N
3602	\N	2	\N	0	2025-11-23 05:32:33.923036	\N	\N
3603	\N	2	\N	1	2025-11-23 05:32:35.08127	\N	\N
3604	\N	2	\N	1	2025-11-23 05:32:36.162698	\N	\N
3605	\N	2	\N	1	2025-11-23 05:32:37.215842	\N	\N
3606	\N	2	\N	1	2025-11-23 05:32:38.34081	\N	\N
3607	\N	2	\N	2	2025-11-23 05:32:39.454284	\N	\N
3608	\N	2	\N	2	2025-11-23 05:32:40.585345	\N	\N
3609	\N	2	\N	1	2025-11-23 05:32:41.667761	\N	\N
3610	\N	2	\N	1	2025-11-23 05:32:42.803469	\N	\N
3611	\N	2	\N	2	2025-11-23 05:32:44.014396	\N	\N
3612	\N	2	\N	1	2025-11-23 05:32:45.167336	\N	\N
3613	\N	2	\N	1	2025-11-23 05:32:46.208197	\N	\N
3614	\N	2	\N	1	2025-11-23 05:32:47.35078	\N	\N
3615	\N	2	\N	1	2025-11-23 05:32:48.39504	\N	\N
3616	\N	2	\N	1	2025-11-23 05:32:49.432873	\N	\N
3617	\N	2	\N	1	2025-11-23 05:32:50.550544	\N	\N
3618	\N	2	\N	1	2025-11-23 05:32:51.714983	\N	\N
3619	\N	2	\N	1	2025-11-23 05:32:52.814108	\N	\N
3620	\N	2	\N	1	2025-11-23 05:32:53.860084	\N	\N
3621	\N	2	\N	1	2025-11-23 05:32:54.913444	\N	\N
3622	\N	2	\N	1	2025-11-23 05:32:55.918113	\N	\N
3623	\N	2	\N	1	2025-11-23 05:32:57.112301	\N	\N
3624	\N	2	\N	1	2025-11-23 05:32:58.341376	\N	\N
3625	\N	2	\N	1	2025-11-23 05:32:59.348708	\N	\N
3626	\N	2	\N	0	2025-11-23 05:33:00.513642	\N	\N
3627	\N	2	\N	1	2025-11-23 05:33:01.569171	\N	\N
3628	\N	2	\N	1	2025-11-23 05:33:02.779592	\N	\N
3629	\N	2	\N	1	2025-11-23 05:33:03.97716	\N	\N
3630	\N	2	\N	1	2025-11-23 05:33:05.230708	\N	\N
3631	\N	2	\N	1	2025-11-23 05:33:06.28849	\N	\N
3632	\N	2	\N	1	2025-11-23 05:33:07.545815	\N	\N
3633	\N	2	\N	1	2025-11-23 05:33:08.743523	\N	\N
3634	\N	2	\N	1	2025-11-23 05:33:09.874035	\N	\N
3635	\N	2	\N	1	2025-11-23 05:33:10.966578	\N	\N
3636	\N	2	\N	1	2025-11-23 05:33:11.978846	\N	\N
3637	\N	2	\N	1	2025-11-23 05:33:13.105365	\N	\N
3638	\N	2	\N	0	2025-11-23 05:33:14.220736	\N	\N
3639	\N	2	\N	2	2025-11-23 05:33:15.307597	\N	\N
3640	\N	2	\N	1	2025-11-23 05:33:16.478602	\N	\N
3641	\N	2	\N	1	2025-11-23 05:33:17.536446	\N	\N
3642	\N	2	\N	1	2025-11-23 05:33:18.550638	\N	\N
3643	\N	2	\N	1	2025-11-23 05:33:19.630391	\N	\N
3644	\N	2	\N	0	2025-11-23 05:33:20.718587	\N	\N
3645	\N	2	\N	0	2025-11-23 05:33:21.788158	\N	\N
3646	\N	2	\N	1	2025-11-23 05:33:22.821152	\N	\N
3647	\N	2	\N	1	2025-11-23 05:33:23.960419	\N	\N
3648	\N	2	\N	1	2025-11-23 05:33:25.051049	\N	\N
3649	\N	2	\N	1	2025-11-23 05:33:26.15418	\N	\N
3650	\N	2	\N	1	2025-11-23 05:33:27.180447	\N	\N
3651	\N	2	\N	1	2025-11-23 05:33:28.361821	\N	\N
3652	\N	2	\N	0	2025-11-23 05:33:29.494575	\N	\N
3653	\N	2	\N	1	2025-11-23 05:33:30.64408	\N	\N
3654	\N	2	\N	0	2025-11-23 05:33:31.656067	\N	\N
3655	\N	2	\N	0	2025-11-23 05:33:32.769143	\N	\N
3656	\N	2	\N	0	2025-11-23 05:33:33.986968	\N	\N
3657	\N	2	\N	0	2025-11-23 05:33:34.983289	\N	\N
3658	\N	2	\N	0	2025-11-23 05:33:36.149379	\N	\N
3659	\N	2	\N	0	2025-11-23 05:33:37.239596	\N	\N
3660	\N	2	\N	0	2025-11-23 05:33:38.473884	\N	\N
3661	\N	2	\N	0	2025-11-23 05:33:39.597775	\N	\N
3662	\N	2	\N	0	2025-11-23 05:33:40.693336	\N	\N
3663	\N	2	\N	0	2025-11-23 05:33:41.78307	\N	\N
3664	\N	2	\N	0	2025-11-23 05:33:42.826562	\N	\N
3665	\N	2	\N	0	2025-11-23 05:33:43.865462	\N	\N
3666	\N	2	\N	0	2025-11-23 05:33:45.035968	\N	\N
3667	\N	2	\N	0	2025-11-23 05:33:46.149054	\N	\N
3668	\N	2	\N	0	2025-11-23 05:33:47.199502	\N	\N
3669	\N	2	\N	0	2025-11-23 05:33:48.327872	\N	\N
3670	\N	2	\N	0	2025-11-23 05:33:49.32776	\N	\N
3671	\N	2	\N	0	2025-11-23 05:33:50.345375	\N	\N
3672	\N	2	\N	0	2025-11-23 05:33:51.449882	\N	\N
3673	\N	2	\N	0	2025-11-23 05:33:52.47322	\N	\N
3674	\N	2	\N	0	2025-11-23 05:33:53.506814	\N	\N
3675	\N	2	\N	0	2025-11-23 05:33:54.619634	\N	\N
3676	\N	2	\N	0	2025-11-23 05:33:55.661236	\N	\N
3677	\N	2	\N	0	2025-11-23 05:33:56.737257	\N	\N
3678	\N	2	\N	0	2025-11-23 05:33:57.861526	\N	\N
3679	\N	2	\N	0	2025-11-23 05:33:58.998529	\N	\N
3680	\N	2	\N	0	2025-11-23 05:34:00.129207	\N	\N
3681	\N	2	\N	0	2025-11-23 05:34:01.136981	\N	\N
3682	\N	2	\N	0	2025-11-23 05:34:02.196066	\N	\N
3683	\N	2	\N	0	2025-11-23 05:34:03.205647	\N	\N
3684	\N	2	\N	0	2025-11-23 05:34:04.219188	\N	\N
3685	\N	2	\N	0	2025-11-23 05:34:05.293985	\N	\N
3686	\N	2	\N	0	2025-11-23 05:34:06.30468	\N	\N
3687	\N	2	\N	0	2025-11-23 05:34:07.309059	\N	\N
3688	\N	2	\N	0	2025-11-23 05:34:08.514101	\N	\N
3689	\N	2	\N	0	2025-11-23 05:34:09.686261	\N	\N
3690	\N	2	\N	0	2025-11-23 05:34:10.70694	\N	\N
3691	\N	2	\N	0	2025-11-23 05:34:11.966596	\N	\N
3692	\N	2	\N	0	2025-11-23 05:34:12.969571	\N	\N
3693	\N	2	\N	0	2025-11-23 05:34:14.071519	\N	\N
3694	\N	2	\N	0	2025-11-23 05:34:15.331291	\N	\N
3695	\N	2	\N	0	2025-11-23 05:34:16.463966	\N	\N
3696	\N	2	\N	0	2025-11-23 05:34:17.507046	\N	\N
3697	\N	2	\N	0	2025-11-23 05:34:18.593474	\N	\N
3698	\N	2	\N	0	2025-11-23 05:34:19.809828	\N	\N
3699	\N	2	\N	0	2025-11-23 05:34:20.913012	\N	\N
3700	\N	2	\N	0	2025-11-23 05:34:21.969295	\N	\N
3701	\N	2	\N	0	2025-11-23 05:34:23.082671	\N	\N
3702	\N	2	\N	0	2025-11-23 05:34:24.101032	\N	\N
3703	\N	2	\N	0	2025-11-23 05:34:25.247889	\N	\N
3704	\N	2	\N	0	2025-11-23 05:34:26.370993	\N	\N
3705	\N	2	\N	0	2025-11-23 05:34:27.41921	\N	\N
3706	\N	2	\N	0	2025-11-23 05:34:28.554812	\N	\N
3707	\N	2	\N	0	2025-11-23 05:34:29.645286	\N	\N
3708	\N	2	\N	0	2025-11-23 05:34:30.777386	\N	\N
3709	\N	2	\N	0	2025-11-23 05:34:31.891617	\N	\N
3710	\N	2	\N	0	2025-11-23 05:34:32.984516	\N	\N
3711	\N	2	\N	0	2025-11-23 05:34:34.126829	\N	\N
3712	\N	2	\N	0	2025-11-23 05:34:35.201638	\N	\N
3713	\N	2	\N	0	2025-11-23 05:34:36.301003	\N	\N
3714	\N	2	\N	0	2025-11-23 05:34:37.391186	\N	\N
3715	\N	2	\N	0	2025-11-23 05:34:38.490436	\N	\N
3716	\N	2	\N	0	2025-11-23 05:34:39.565491	\N	\N
3717	\N	2	\N	0	2025-11-23 05:34:40.649589	\N	\N
3718	\N	2	\N	0	2025-11-23 05:34:41.682111	\N	\N
3719	\N	2	\N	0	2025-11-23 05:34:42.780663	\N	\N
3720	\N	2	\N	0	2025-11-23 05:34:43.786662	\N	\N
3721	\N	2	\N	0	2025-11-23 05:34:44.916779	\N	\N
3722	\N	2	\N	0	2025-11-23 05:34:45.951588	\N	\N
3723	\N	2	\N	0	2025-11-23 05:34:46.998874	\N	\N
3724	\N	2	\N	0	2025-11-23 05:34:48.046985	\N	\N
3725	\N	2	\N	0	2025-11-23 05:34:49.168493	\N	\N
3726	\N	2	\N	0	2025-11-23 05:34:50.269381	\N	\N
3727	\N	2	\N	0	2025-11-23 05:34:51.387689	\N	\N
3728	\N	2	\N	0	2025-11-23 05:34:52.448875	\N	\N
3729	\N	2	\N	0	2025-11-23 05:34:53.498636	\N	\N
3730	\N	2	\N	0	2025-11-23 05:34:54.638728	\N	\N
3731	\N	2	\N	0	2025-11-23 05:34:55.67376	\N	\N
3732	\N	2	\N	0	2025-11-23 05:34:56.758686	\N	\N
3733	\N	2	\N	0	2025-11-23 05:34:57.874905	\N	\N
3734	\N	2	\N	0	2025-11-23 05:34:58.952737	\N	\N
3735	\N	2	\N	0	2025-11-23 05:35:00.046207	\N	\N
3736	\N	2	\N	0	2025-11-23 05:35:01.071211	\N	\N
3737	\N	2	\N	0	2025-11-23 05:35:02.148614	\N	\N
3738	\N	2	\N	0	2025-11-23 05:35:03.265414	\N	\N
3739	\N	2	\N	0	2025-11-23 05:35:04.378474	\N	\N
3740	\N	2	\N	0	2025-11-23 05:35:05.415079	\N	\N
3741	\N	2	\N	1	2025-11-23 05:35:06.53727	\N	\N
3742	\N	2	\N	1	2025-11-23 05:35:07.563091	\N	\N
3743	\N	2	\N	1	2025-11-23 05:35:08.579745	\N	\N
3744	\N	2	\N	1	2025-11-23 05:35:09.604906	\N	\N
3745	\N	2	\N	1	2025-11-23 05:35:10.621652	\N	\N
3746	\N	2	\N	1	2025-11-23 05:35:11.703086	\N	\N
3747	\N	2	\N	1	2025-11-23 05:35:12.775614	\N	\N
3748	\N	2	\N	1	2025-11-23 05:35:13.87554	\N	\N
3749	\N	2	\N	1	2025-11-23 05:35:15.004689	\N	\N
3750	\N	2	\N	1	2025-11-23 05:35:16.095102	\N	\N
3751	\N	2	\N	1	2025-11-23 05:35:17.113812	\N	\N
3752	\N	2	\N	1	2025-11-23 05:35:18.12554	\N	\N
3753	\N	2	\N	1	2025-11-23 05:35:19.142769	\N	\N
3754	\N	2	\N	0	2025-11-23 05:35:20.370584	\N	\N
3755	\N	2	\N	0	2025-11-23 05:35:21.41915	\N	\N
3756	\N	2	\N	1	2025-11-23 05:35:22.465099	\N	\N
3757	\N	2	\N	1	2025-11-23 05:35:23.581857	\N	\N
3758	\N	2	\N	1	2025-11-23 05:35:24.626866	\N	\N
3759	\N	2	\N	1	2025-11-23 05:35:25.635273	\N	\N
3760	\N	2	\N	0	2025-11-23 05:35:26.687559	\N	\N
3761	\N	2	\N	0	2025-11-23 05:35:27.780648	\N	\N
3762	\N	2	\N	0	2025-11-23 05:35:28.863537	\N	\N
3763	\N	2	\N	1	2025-11-23 05:35:29.869699	\N	\N
3764	\N	2	\N	1	2025-11-23 05:35:30.98538	\N	\N
3765	\N	2	\N	0	2025-11-23 05:35:31.995228	\N	\N
3766	\N	2	\N	0	2025-11-23 05:35:33.09172	\N	\N
3767	\N	2	\N	0	2025-11-23 05:35:34.143947	\N	\N
3768	\N	2	\N	0	2025-11-23 05:35:35.182602	\N	\N
3769	\N	2	\N	1	2025-11-23 05:35:36.226937	\N	\N
3770	\N	2	\N	1	2025-11-23 05:35:37.277596	\N	\N
3771	\N	2	\N	0	2025-11-23 05:35:38.281804	\N	\N
3772	\N	2	\N	1	2025-11-23 05:35:39.383626	\N	\N
3773	\N	2	\N	1	2025-11-23 05:35:40.491653	\N	\N
3774	\N	2	\N	1	2025-11-23 05:35:41.620431	\N	\N
3775	\N	2	\N	1	2025-11-23 05:35:42.685011	\N	\N
3776	\N	2	\N	1	2025-11-23 05:35:43.719259	\N	\N
3777	\N	2	\N	1	2025-11-23 05:35:44.832412	\N	\N
3778	\N	2	\N	0	2025-11-23 05:35:45.874583	\N	\N
3779	\N	2	\N	1	2025-11-23 05:35:46.932262	\N	\N
3780	\N	2	\N	1	2025-11-23 05:35:48.061274	\N	\N
3781	\N	2	\N	0	2025-11-23 05:35:49.151689	\N	\N
3782	\N	2	\N	0	2025-11-23 05:35:50.165845	\N	\N
3783	\N	2	\N	0	2025-11-23 05:35:51.231149	\N	\N
3784	\N	2	\N	0	2025-11-23 05:35:52.321124	\N	\N
3785	\N	2	\N	0	2025-11-23 05:35:53.412626	\N	\N
3786	\N	2	\N	0	2025-11-23 05:35:54.433089	\N	\N
3787	\N	2	\N	1	2025-11-23 05:35:55.487843	\N	\N
3788	\N	2	\N	1	2025-11-23 05:35:56.613832	\N	\N
3789	\N	2	\N	0	2025-11-23 05:35:57.640519	\N	\N
3790	\N	2	\N	0	2025-11-23 05:35:58.653183	\N	\N
3791	\N	2	\N	0	2025-11-23 05:35:59.751632	\N	\N
3792	\N	2	\N	0	2025-11-23 05:36:00.745827	\N	\N
3793	\N	2	\N	0	2025-11-23 05:36:01.766405	\N	\N
3794	\N	2	\N	0	2025-11-23 05:36:02.786184	\N	\N
3795	\N	2	\N	1	2025-11-23 05:36:03.806471	\N	\N
3796	\N	2	\N	0	2025-11-23 05:36:04.92275	\N	\N
3797	\N	2	\N	0	2025-11-23 05:36:05.937069	\N	\N
3798	\N	2	\N	1	2025-11-23 05:36:06.95953	\N	\N
3799	\N	2	\N	1	2025-11-23 05:36:08.034728	\N	\N
3800	\N	2	\N	0	2025-11-23 05:36:09.083077	\N	\N
3801	\N	2	\N	0	2025-11-23 05:36:10.077297	\N	\N
3802	\N	2	\N	0	2025-11-23 05:36:11.12764	\N	\N
3803	\N	2	\N	0	2025-11-23 05:36:12.188871	\N	\N
3804	\N	2	\N	0	2025-11-23 05:36:13.294344	\N	\N
3805	\N	2	\N	0	2025-11-23 05:36:14.362684	\N	\N
3806	\N	2	\N	0	2025-11-23 05:36:15.367633	\N	\N
3807	\N	2	\N	0	2025-11-23 05:36:16.371592	\N	\N
3808	\N	2	\N	0	2025-11-23 05:36:17.393127	\N	\N
3809	\N	2	\N	0	2025-11-23 05:36:18.459355	\N	\N
3810	\N	2	\N	0	2025-11-23 05:36:19.564797	\N	\N
3811	\N	2	\N	0	2025-11-23 05:36:20.802952	\N	\N
3812	\N	2	\N	0	2025-11-23 05:36:21.8418	\N	\N
3813	\N	2	\N	1	2025-11-23 05:36:22.879724	\N	\N
3814	\N	2	\N	0	2025-11-23 05:36:24.011856	\N	\N
3815	\N	2	\N	1	2025-11-23 05:36:25.058975	\N	\N
3816	\N	2	\N	1	2025-11-23 05:36:26.110119	\N	\N
3817	\N	2	\N	1	2025-11-23 05:36:27.174811	\N	\N
3818	\N	2	\N	0	2025-11-23 05:36:28.194865	\N	\N
3819	\N	2	\N	0	2025-11-23 05:36:29.239609	\N	\N
3820	\N	2	\N	1	2025-11-23 05:36:30.347258	\N	\N
3821	\N	2	\N	1	2025-11-23 05:36:31.43331	\N	\N
3822	\N	2	\N	1	2025-11-23 05:36:32.502259	\N	\N
3823	\N	2	\N	1	2025-11-23 05:36:33.645278	\N	\N
3824	\N	2	\N	1	2025-11-23 05:36:34.698989	\N	\N
3825	\N	2	\N	1	2025-11-23 05:36:35.845614	\N	\N
3826	\N	2	\N	1	2025-11-23 05:36:37.079579	\N	\N
3827	\N	2	\N	1	2025-11-23 05:36:38.262021	\N	\N
3828	\N	2	\N	1	2025-11-23 05:36:40.305638	\N	\N
3829	\N	2	\N	1	2025-11-23 05:36:41.355768	\N	\N
3830	\N	2	\N	1	2025-11-23 05:36:42.53653	\N	\N
3831	\N	2	\N	1	2025-11-23 05:36:43.944979	\N	\N
3832	\N	2	\N	1	2025-11-23 05:36:45.402153	\N	\N
3833	\N	2	\N	1	2025-11-23 05:36:47.07063	\N	\N
3834	\N	2	\N	1	2025-11-23 05:36:48.117659	\N	\N
3835	\N	2	\N	1	2025-11-23 05:36:49.175772	\N	\N
3836	\N	2	\N	1	2025-11-23 05:36:50.181562	\N	\N
3837	\N	2	\N	1	2025-11-23 05:36:51.444165	\N	\N
3838	\N	2	\N	1	2025-11-23 05:36:52.495001	\N	\N
3839	\N	2	\N	0	2025-11-23 05:36:53.877963	\N	\N
3840	\N	2	\N	1	2025-11-23 05:36:55.312358	\N	\N
3841	\N	2	\N	1	2025-11-23 05:36:56.754356	\N	\N
3842	\N	2	\N	1	2025-11-23 05:36:57.944391	\N	\N
3843	\N	2	\N	1	2025-11-23 05:36:59.06505	\N	\N
3844	\N	2	\N	1	2025-11-23 05:37:00.28088	\N	\N
3845	\N	2	\N	1	2025-11-23 05:37:01.371909	\N	\N
3846	\N	2	\N	1	2025-11-23 05:37:02.483948	\N	\N
3847	\N	2	\N	0	2025-11-23 05:37:03.703606	\N	\N
3848	\N	2	\N	1	2025-11-23 05:37:04.838546	\N	\N
3849	\N	2	\N	1	2025-11-23 05:37:05.913778	\N	\N
3850	\N	2	\N	1	2025-11-23 05:37:07.079395	\N	\N
3851	\N	2	\N	0	2025-11-23 05:37:08.223891	\N	\N
3852	\N	2	\N	1	2025-11-23 05:37:09.28841	\N	\N
3853	\N	2	\N	0	2025-11-23 05:37:10.340419	\N	\N
3854	\N	2	\N	0	2025-11-23 05:37:11.385441	\N	\N
3855	\N	2	\N	1	2025-11-23 05:37:12.439477	\N	\N
3856	\N	2	\N	1	2025-11-23 05:37:13.501862	\N	\N
3857	\N	2	\N	0	2025-11-23 05:37:14.582216	\N	\N
3858	\N	2	\N	0	2025-11-23 05:37:15.633723	\N	\N
3859	\N	2	\N	0	2025-11-23 05:37:16.696971	\N	\N
3860	\N	2	\N	0	2025-11-23 05:37:17.752467	\N	\N
3861	\N	2	\N	0	2025-11-23 05:37:18.802924	\N	\N
3862	\N	2	\N	0	2025-11-23 05:37:19.941034	\N	\N
3863	\N	2	\N	0	2025-11-23 05:37:21.119118	\N	\N
3864	\N	2	\N	0	2025-11-23 05:37:22.120714	\N	\N
3865	\N	2	\N	0	2025-11-23 05:37:23.258859	\N	\N
3866	\N	2	\N	0	2025-11-23 05:37:24.270216	\N	\N
3867	\N	2	\N	1	2025-11-23 05:37:25.365176	\N	\N
3868	\N	2	\N	1	2025-11-23 05:37:26.395738	\N	\N
3869	\N	2	\N	1	2025-11-23 05:37:27.514971	\N	\N
3870	\N	2	\N	1	2025-11-23 05:37:28.613705	\N	\N
3871	\N	2	\N	1	2025-11-23 05:37:29.699222	\N	\N
3872	\N	2	\N	1	2025-11-23 05:37:31.058572	\N	\N
3873	\N	2	\N	1	2025-11-23 05:37:32.243504	\N	\N
3874	\N	2	\N	1	2025-11-23 05:37:33.379183	\N	\N
3875	\N	2	\N	1	2025-11-23 05:37:34.624776	\N	\N
3876	\N	2	\N	1	2025-11-23 05:37:35.69553	\N	\N
3877	\N	2	\N	1	2025-11-23 05:37:36.899978	\N	\N
3878	\N	2	\N	1	2025-11-23 05:37:37.996918	\N	\N
3879	\N	2	\N	1	2025-11-23 05:37:39.180706	\N	\N
3880	\N	2	\N	1	2025-11-23 05:37:40.178509	\N	\N
3881	\N	2	\N	1	2025-11-23 05:37:41.425938	\N	\N
3882	\N	2	\N	1	2025-11-23 05:37:42.462019	\N	\N
3937	\N	2	\N	1	2025-11-23 06:24:53.093517	\N	\N
3938	\N	2	\N	1	2025-11-23 06:24:54.100705	\N	\N
3939	\N	2	\N	1	2025-11-23 06:24:55.140828	\N	\N
3940	\N	2	\N	1	2025-11-23 06:24:56.193711	\N	\N
3941	\N	2	\N	1	2025-11-23 06:24:57.283973	\N	\N
3942	\N	2	\N	1	2025-11-23 06:24:58.339378	\N	\N
3943	\N	2	\N	1	2025-11-23 06:24:59.364942	\N	\N
3944	\N	2	\N	1	2025-11-23 06:25:00.371929	\N	\N
3945	\N	2	\N	1	2025-11-23 06:25:01.457182	\N	\N
3946	\N	2	\N	1	2025-11-23 06:25:02.464306	\N	\N
3947	\N	2	\N	1	2025-11-23 06:25:03.563747	\N	\N
3948	\N	2	\N	1	2025-11-23 06:25:04.5822	\N	\N
3949	\N	2	\N	1	2025-11-23 06:25:05.675834	\N	\N
3950	\N	2	\N	1	2025-11-23 06:25:06.703342	\N	\N
3951	\N	2	\N	1	2025-11-23 06:25:07.72063	\N	\N
3952	\N	2	\N	1	2025-11-23 06:25:08.776602	\N	\N
3953	\N	2	\N	1	2025-11-23 06:25:09.842129	\N	\N
3954	\N	2	\N	1	2025-11-23 06:25:10.896184	\N	\N
3955	\N	2	\N	1	2025-11-23 06:25:11.91606	\N	\N
4397	\N	2	\N	1	2025-11-23 07:34:20.126445	\N	\N
4398	\N	2	\N	1	2025-11-23 07:34:21.404706	\N	\N
4399	\N	2	\N	1	2025-11-23 07:34:22.452548	\N	\N
4400	\N	2	\N	1	2025-11-23 07:34:23.573316	\N	\N
4401	\N	2	\N	1	2025-11-23 07:34:24.690892	\N	\N
4402	\N	2	\N	1	2025-11-23 07:34:25.897827	\N	\N
4403	\N	2	\N	1	2025-11-23 07:34:26.932927	\N	\N
4404	\N	2	\N	1	2025-11-23 07:34:28.185259	\N	\N
4405	\N	2	\N	1	2025-11-23 07:34:29.464309	\N	\N
4410	\N	2	\N	1	2025-11-23 07:34:35.36136	\N	\N
4411	\N	2	\N	2	2025-11-23 07:34:36.513035	\N	\N
4412	\N	2	\N	2	2025-11-23 07:34:37.705418	\N	\N
4413	\N	2	\N	2	2025-11-23 07:34:38.908939	\N	\N
4418	\N	2	\N	2	2025-11-23 07:34:45.13594	\N	\N
4419	\N	2	\N	1	2025-11-23 07:34:46.471299	\N	\N
4420	\N	2	\N	1	2025-11-23 07:34:47.528235	\N	\N
4421	\N	2	\N	0	2025-11-23 07:34:48.69496	\N	\N
4406	\N	2	\N	2	2025-11-23 07:34:30.558713	\N	\N
4407	\N	2	\N	1	2025-11-23 07:34:31.721172	\N	\N
4408	\N	2	\N	1	2025-11-23 07:34:32.934288	\N	\N
4409	\N	2	\N	1	2025-11-23 07:34:34.284259	\N	\N
4414	\N	2	\N	2	2025-11-23 07:34:40.099543	\N	\N
4415	\N	2	\N	2	2025-11-23 07:34:41.264292	\N	\N
4416	\N	2	\N	2	2025-11-23 07:34:42.426474	\N	\N
4417	\N	2	\N	1	2025-11-23 07:34:43.697	\N	\N
4422	\N	2	\N	1	2025-11-23 07:34:49.789919	\N	\N
4423	\N	2	\N	1	2025-11-23 07:34:51.139166	\N	\N
4424	\N	2	\N	1	2025-11-23 07:34:52.423053	\N	\N
4425	\N	2	\N	1	2025-11-23 07:34:53.608914	\N	\N
4426	\N	2	\N	1	2025-11-23 07:34:54.690408	\N	\N
4427	\N	2	\N	1	2025-11-23 07:34:55.96351	\N	\N
4428	\N	2	\N	1	2025-11-23 07:34:56.967342	\N	\N
4429	\N	2	\N	1	2025-11-23 07:34:58.072339	\N	\N
4430	\N	2	\N	1	2025-11-23 07:34:59.09098	\N	\N
4431	\N	2	\N	1	2025-11-23 07:35:00.535725	\N	\N
4432	\N	2	\N	1	2025-11-23 07:35:01.908099	\N	\N
4433	\N	2	\N	1	2025-11-23 07:35:03.330413	\N	\N
4434	\N	2	\N	1	2025-11-23 07:35:04.632852	\N	\N
4435	\N	2	\N	1	2025-11-23 07:35:05.85863	\N	\N
4436	\N	2	\N	1	2025-11-23 07:35:07.150402	\N	\N
4437	\N	2	\N	1	2025-11-23 07:35:08.261524	\N	\N
4438	\N	2	\N	1	2025-11-23 07:35:09.438317	\N	\N
4439	\N	2	\N	1	2025-11-23 07:35:10.591707	\N	\N
4440	\N	2	\N	1	2025-11-23 07:35:11.690804	\N	\N
4441	\N	2	\N	1	2025-11-23 07:35:12.782246	\N	\N
4442	\N	2	\N	1	2025-11-23 07:35:13.92277	\N	\N
4443	\N	2	\N	1	2025-11-23 07:35:15.160957	\N	\N
4444	\N	2	\N	1	2025-11-23 07:35:16.428644	\N	\N
4445	\N	2	\N	1	2025-11-23 07:35:17.553058	\N	\N
4446	\N	2	\N	1	2025-11-23 07:35:18.878086	\N	\N
4447	\N	2	\N	1	2025-11-23 07:35:20.019287	\N	\N
4448	\N	2	\N	1	2025-11-23 07:35:21.147541	\N	\N
4449	\N	2	\N	1	2025-11-23 07:35:22.299352	\N	\N
4450	\N	2	\N	1	2025-11-23 07:35:23.44154	\N	\N
4451	\N	2	\N	1	2025-11-23 07:35:24.666589	\N	\N
4452	\N	2	\N	1	2025-11-23 07:35:25.862662	\N	\N
4453	\N	2	\N	1	2025-11-23 07:35:27.068741	\N	\N
4454	\N	2	\N	1	2025-11-23 07:35:28.218746	\N	\N
4455	\N	2	\N	1	2025-11-23 07:35:29.4389	\N	\N
4456	\N	2	\N	1	2025-11-23 07:35:30.627706	\N	\N
4457	\N	2	\N	1	2025-11-23 07:35:31.794285	\N	\N
4458	\N	2	\N	1	2025-11-23 07:35:32.984163	\N	\N
4459	\N	2	\N	1	2025-11-23 07:35:34.242693	\N	\N
4460	\N	2	\N	1	2025-11-23 07:35:35.523502	\N	\N
4461	\N	2	\N	1	2025-11-23 07:35:36.800742	\N	\N
4462	\N	2	\N	1	2025-11-23 07:35:37.990306	\N	\N
4463	\N	2	\N	1	2025-11-23 07:35:39.224756	\N	\N
4464	\N	2	\N	1	2025-11-23 07:35:40.45391	\N	\N
4465	\N	2	\N	1	2025-11-23 07:35:41.604841	\N	\N
4466	\N	2	\N	1	2025-11-23 07:35:42.750464	\N	\N
4467	\N	2	\N	1	2025-11-23 07:35:43.973002	\N	\N
4468	\N	2	\N	1	2025-11-23 07:35:45.185529	\N	\N
4469	\N	2	\N	1	2025-11-23 07:35:46.439437	\N	\N
4470	\N	2	\N	1	2025-11-23 07:35:47.652679	\N	\N
4471	\N	2	\N	1	2025-11-23 07:35:48.927604	\N	\N
4472	\N	2	\N	1	2025-11-23 07:35:50.166345	\N	\N
4473	\N	2	\N	1	2025-11-23 07:35:51.326721	\N	\N
4474	\N	2	\N	1	2025-11-23 07:35:52.544243	\N	\N
4475	\N	2	\N	1	2025-11-23 07:35:53.767279	\N	\N
4476	\N	2	\N	1	2025-11-23 07:35:55.143671	\N	\N
4477	\N	2	\N	1	2025-11-23 07:35:56.427659	\N	\N
4478	\N	2	\N	1	2025-11-23 07:35:57.579505	\N	\N
4479	\N	2	\N	1	2025-11-23 07:35:58.867102	\N	\N
4480	\N	2	\N	1	2025-11-23 07:36:00.210334	\N	\N
4481	\N	2	\N	1	2025-11-23 07:36:01.349545	\N	\N
4482	\N	2	\N	1	2025-11-23 07:36:02.349984	\N	\N
4483	\N	2	\N	1	2025-11-23 07:36:03.713671	\N	\N
4484	\N	2	\N	1	2025-11-23 07:36:04.993738	\N	\N
4485	\N	2	\N	1	2025-11-23 07:36:06.167962	\N	\N
4486	\N	2	\N	1	2025-11-23 07:36:07.522076	\N	\N
4487	\N	2	\N	1	2025-11-23 07:36:08.909752	\N	\N
4488	\N	2	\N	1	2025-11-23 07:36:10.331464	\N	\N
4489	\N	2	\N	1	2025-11-23 07:36:11.663639	\N	\N
4490	\N	2	\N	1	2025-11-23 07:36:13.021463	\N	\N
4491	\N	2	\N	1	2025-11-23 07:36:14.382157	\N	\N
4492	\N	2	\N	1	2025-11-23 07:36:15.782521	\N	\N
4493	\N	2	\N	1	2025-11-23 07:36:17.353189	\N	\N
4494	\N	2	\N	1	2025-11-23 07:36:18.631945	\N	\N
4495	\N	2	\N	1	2025-11-23 07:36:19.787423	\N	\N
4496	\N	2	\N	1	2025-11-23 07:36:21.219079	\N	\N
4497	\N	2	\N	1	2025-11-23 07:36:22.31026	\N	\N
4498	\N	2	\N	1	2025-11-23 07:36:23.355061	\N	\N
4499	\N	2	\N	1	2025-11-23 07:36:24.451198	\N	\N
4500	\N	2	\N	1	2025-11-23 07:36:25.535077	\N	\N
4501	\N	2	\N	1	2025-11-23 07:36:26.748894	\N	\N
4502	\N	2	\N	1	2025-11-23 07:36:27.908764	\N	\N
4503	\N	2	\N	1	2025-11-23 07:36:29.103906	\N	\N
4504	\N	2	\N	1	2025-11-23 07:36:30.121153	\N	\N
4505	\N	2	\N	1	2025-11-23 07:36:31.380008	\N	\N
4506	\N	2	\N	1	2025-11-23 07:36:32.531433	\N	\N
4507	\N	2	\N	1	2025-11-23 07:36:33.737386	\N	\N
4508	\N	2	\N	1	2025-11-23 07:36:34.987102	\N	\N
4509	\N	2	\N	1	2025-11-23 07:36:36.188329	\N	\N
4510	\N	2	\N	1	2025-11-23 07:36:37.448425	\N	\N
4511	\N	2	\N	1	2025-11-23 07:36:38.69756	\N	\N
4512	\N	2	\N	1	2025-11-23 07:36:39.929092	\N	\N
4513	\N	2	\N	1	2025-11-23 07:36:41.105406	\N	\N
4514	\N	2	\N	1	2025-11-23 07:36:42.262412	\N	\N
4515	\N	2	\N	1	2025-11-23 07:36:43.441833	\N	\N
4516	\N	2	\N	1	2025-11-23 07:36:44.631468	\N	\N
4517	\N	2	\N	1	2025-11-23 07:36:45.85919	\N	\N
4518	\N	2	\N	1	2025-11-23 07:36:47.137254	\N	\N
4519	\N	2	\N	1	2025-11-23 07:36:48.357099	\N	\N
4520	\N	2	\N	1	2025-11-23 07:36:49.644931	\N	\N
4521	\N	2	\N	1	2025-11-23 07:36:50.917946	\N	\N
4522	\N	2	\N	1	2025-11-23 07:36:52.218228	\N	\N
4523	\N	2	\N	1	2025-11-23 07:36:53.749855	\N	\N
4524	\N	2	\N	1	2025-11-23 07:36:54.998539	\N	\N
4525	\N	2	\N	1	2025-11-23 07:36:56.429291	\N	\N
4526	\N	2	\N	1	2025-11-23 07:36:57.711052	\N	\N
4527	\N	2	\N	1	2025-11-23 07:36:58.699107	\N	\N
4528	\N	2	\N	1	2025-11-23 07:37:00.2206	\N	\N
4529	\N	2	\N	1	2025-11-23 07:37:01.641405	\N	\N
4530	\N	2	\N	1	2025-11-23 07:37:02.916068	\N	\N
4531	\N	2	\N	1	2025-11-23 07:37:04.019087	\N	\N
4532	\N	2	\N	1	2025-11-23 07:37:05.18873	\N	\N
4533	\N	2	\N	1	2025-11-23 07:37:06.38589	\N	\N
4534	\N	2	\N	1	2025-11-23 07:37:07.812406	\N	\N
4535	\N	2	\N	1	2025-11-23 07:37:09.196743	\N	\N
4536	\N	2	\N	1	2025-11-23 07:37:10.266021	\N	\N
4537	\N	2	\N	1	2025-11-23 07:37:11.372188	\N	\N
4538	\N	2	\N	1	2025-11-23 07:56:17.596509	\N	\N
4539	\N	2	\N	1	2025-11-23 07:56:18.594847	\N	\N
4540	\N	2	\N	1	2025-11-23 07:56:20.03883	\N	\N
4541	\N	2	\N	1	2025-11-23 07:56:21.160656	\N	\N
4542	\N	2	\N	1	2025-11-23 07:56:22.734634	\N	\N
4543	\N	2	\N	2	2025-11-23 07:56:23.826649	\N	\N
4544	\N	2	\N	2	2025-11-23 07:56:25.299756	\N	\N
4545	\N	2	\N	2	2025-11-23 07:56:26.419579	\N	\N
4546	\N	2	\N	2	2025-11-23 07:56:27.555331	\N	\N
4547	\N	2	\N	2	2025-11-23 07:56:28.608592	\N	\N
4548	\N	2	\N	2	2025-11-23 07:56:29.69384	\N	\N
4549	\N	2	\N	1	2025-11-23 07:56:30.910709	\N	\N
4550	\N	2	\N	2	2025-11-23 07:56:32.120191	\N	\N
4551	\N	2	\N	2	2025-11-23 07:56:33.352239	\N	\N
4552	\N	2	\N	1	2025-11-23 07:56:34.425569	\N	\N
4553	\N	2	\N	2	2025-11-23 07:56:35.664184	\N	\N
4554	\N	2	\N	1	2025-11-23 07:56:36.860581	\N	\N
4555	\N	2	\N	1	2025-11-23 07:56:37.999029	\N	\N
4556	\N	2	\N	1	2025-11-23 07:56:39.117342	\N	\N
4557	\N	2	\N	1	2025-11-23 07:56:40.242026	\N	\N
4558	\N	2	\N	1	2025-11-23 07:56:41.321278	\N	\N
4559	\N	2	\N	1	2025-11-23 07:56:42.402055	\N	\N
4560	\N	2	\N	1	2025-11-23 07:56:43.877482	\N	\N
4561	\N	2	\N	2	2025-11-23 07:56:45.418982	\N	\N
4562	\N	2	\N	2	2025-11-23 07:56:46.582721	\N	\N
4563	\N	2	\N	1	2025-11-23 07:56:48.059336	\N	\N
4564	\N	2	\N	1	2025-11-23 07:56:49.106636	\N	\N
4565	\N	2	\N	1	2025-11-23 07:56:50.565291	\N	\N
4566	\N	2	\N	1	2025-11-23 07:56:51.970584	\N	\N
4567	\N	2	\N	1	2025-11-23 07:56:53.423313	\N	\N
4568	\N	2	\N	1	2025-11-23 07:56:54.940238	\N	\N
4569	\N	2	\N	1	2025-11-23 07:56:56.239417	\N	\N
4570	\N	2	\N	1	2025-11-23 07:56:57.602648	\N	\N
4571	\N	2	\N	1	2025-11-23 07:56:58.757726	\N	\N
4572	\N	2	\N	1	2025-11-23 07:57:00.027994	\N	\N
4573	\N	2	\N	1	2025-11-23 07:57:01.268156	\N	\N
4574	\N	2	\N	1	2025-11-23 07:57:02.525466	\N	\N
4575	\N	2	\N	0	2025-11-23 08:01:04.82335	\N	\N
4576	\N	2	\N	0	2025-11-23 08:01:06.120238	\N	\N
4577	\N	2	\N	0	2025-11-23 08:01:07.345836	\N	\N
4578	\N	2	\N	0	2025-11-23 08:01:08.599025	\N	\N
4579	\N	2	\N	0	2025-11-23 08:01:09.871558	\N	\N
4580	\N	2	\N	0	2025-11-23 08:01:10.958609	\N	\N
4581	\N	2	\N	0	2025-11-23 08:01:12.507452	\N	\N
4582	\N	2	\N	0	2025-11-23 08:01:13.539719	\N	\N
4583	\N	2	\N	0	2025-11-23 08:01:15.005247	\N	\N
4584	\N	2	\N	0	2025-11-23 08:01:16.403993	\N	\N
4585	\N	2	\N	0	2025-11-23 08:01:17.449059	\N	\N
4586	\N	2	\N	0	2025-11-23 08:01:18.452885	\N	\N
4587	\N	2	\N	0	2025-11-23 08:01:19.918368	\N	\N
4588	\N	2	\N	0	2025-11-23 08:01:21.225682	\N	\N
4589	\N	2	\N	0	2025-11-23 08:01:22.504024	\N	\N
4590	\N	2	\N	0	2025-11-23 08:01:23.988657	\N	\N
4591	\N	2	\N	0	2025-11-23 08:01:25.16418	\N	\N
4592	\N	2	\N	0	2025-11-23 08:01:26.92657	\N	\N
4593	\N	2	\N	0	2025-11-23 08:01:28.511015	\N	\N
4594	\N	2	\N	0	2025-11-23 08:01:30.069913	\N	\N
4595	\N	2	\N	0	2025-11-23 08:01:31.530867	\N	\N
4596	\N	2	\N	0	2025-11-23 08:01:32.89923	\N	\N
4597	\N	2	\N	0	2025-11-23 08:01:34.134789	\N	\N
4598	\N	2	\N	0	2025-11-23 08:01:35.49148	\N	\N
4599	\N	2	\N	0	2025-11-23 08:01:36.543269	\N	\N
4600	\N	2	\N	0	2025-11-23 08:01:37.68946	\N	\N
4601	\N	2	\N	0	2025-11-23 08:01:38.886629	\N	\N
4602	\N	2	\N	0	2025-11-23 08:01:40.173738	\N	\N
4603	\N	2	\N	0	2025-11-23 08:01:41.39927	\N	\N
4604	\N	2	\N	0	2025-11-23 08:01:42.598336	\N	\N
4605	\N	2	\N	0	2025-11-23 08:01:43.697753	\N	\N
4606	\N	2	\N	0	2025-11-23 08:01:44.917033	\N	\N
4607	\N	2	\N	0	2025-11-23 08:01:46.019189	\N	\N
4608	\N	2	\N	0	2025-11-23 08:01:47.045322	\N	\N
4609	\N	2	\N	0	2025-11-23 08:01:48.241927	\N	\N
4610	\N	2	\N	0	2025-11-23 08:01:49.50494	\N	\N
4611	\N	2	\N	0	2025-11-23 08:01:50.897718	\N	\N
4612	\N	2	\N	1	2025-11-23 08:09:02.018273	\N	\N
4613	\N	2	\N	1	2025-11-23 08:09:03.344261	\N	\N
4614	\N	2	\N	1	2025-11-23 08:09:04.538071	\N	\N
4615	\N	2	\N	1	2025-11-23 08:09:05.716293	\N	\N
4616	\N	2	\N	1	2025-11-23 08:09:06.858545	\N	\N
4617	\N	2	\N	1	2025-11-23 08:09:07.990318	\N	\N
4618	\N	2	\N	1	2025-11-23 08:09:09.449927	\N	\N
4619	\N	2	\N	1	2025-11-23 08:09:10.753525	\N	\N
4620	\N	2	\N	1	2025-11-23 08:09:12.037445	\N	\N
4621	\N	2	\N	1	2025-11-23 08:09:13.359503	\N	\N
4622	\N	2	\N	1	2025-11-23 08:09:14.602455	\N	\N
4623	\N	2	\N	1	2025-11-23 08:09:15.942175	\N	\N
4624	\N	2	\N	2	2025-11-23 08:09:17.370523	\N	\N
4625	\N	2	\N	2	2025-11-23 08:09:18.700213	\N	\N
4626	\N	2	\N	2	2025-11-23 08:09:19.860964	\N	\N
4627	\N	2	\N	2	2025-11-23 08:09:21.02642	\N	\N
4628	\N	2	\N	2	2025-11-23 08:09:22.085434	\N	\N
4629	\N	2	\N	2	2025-11-23 08:09:23.124309	\N	\N
4630	\N	2	\N	2	2025-11-23 08:09:24.266018	\N	\N
4631	\N	2	\N	1	2025-11-23 08:09:25.521441	\N	\N
4632	\N	2	\N	1	2025-11-23 08:09:27.01782	\N	\N
4633	\N	2	\N	1	2025-11-23 08:09:29.097707	\N	\N
4634	\N	2	\N	1	2025-11-23 08:09:30.66227	\N	\N
4635	\N	2	\N	1	2025-11-23 08:09:32.147533	\N	\N
4636	\N	2	\N	1	2025-11-23 08:09:33.439582	\N	\N
4637	\N	2	\N	0	2025-11-23 08:09:50.399507	\N	\N
4638	\N	2	\N	1	2025-11-23 08:09:51.616729	\N	\N
4639	\N	2	\N	1	2025-11-23 08:09:52.893156	\N	\N
4640	\N	2	\N	1	2025-11-23 08:09:54.117833	\N	\N
4641	\N	2	\N	1	2025-11-23 08:09:55.34867	\N	\N
4642	\N	2	\N	1	2025-11-23 08:09:56.755694	\N	\N
4643	\N	2	\N	1	2025-11-23 08:09:58.016871	\N	\N
4644	\N	2	\N	1	2025-11-23 08:09:59.187851	\N	\N
4645	\N	2	\N	1	2025-11-23 08:10:00.457559	\N	\N
4646	\N	2	\N	1	2025-11-23 08:10:01.956727	\N	\N
4647	\N	2	\N	2	2025-11-23 08:10:03.059089	\N	\N
4648	\N	2	\N	1	2025-11-23 08:10:04.176998	\N	\N
4649	\N	2	\N	1	2025-11-23 08:10:05.317244	\N	\N
4650	\N	2	\N	1	2025-11-23 08:10:06.711129	\N	\N
4651	\N	2	\N	1	2025-11-23 08:10:08.036783	\N	\N
4652	\N	2	\N	1	2025-11-23 08:10:09.362569	\N	\N
4653	\N	2	\N	1	2025-11-23 08:10:10.733379	\N	\N
4654	\N	2	\N	1	2025-11-23 08:10:12.272969	\N	\N
4655	\N	2	\N	1	2025-11-23 08:10:13.397006	\N	\N
4656	\N	2	\N	0	2025-11-23 08:10:14.489878	\N	\N
4657	\N	2	\N	0	2025-11-23 08:10:15.520817	\N	\N
4658	\N	2	\N	1	2025-11-23 08:10:16.784675	\N	\N
4659	\N	2	\N	1	2025-11-23 08:10:18.117012	\N	\N
4660	\N	2	\N	1	2025-11-23 08:10:19.145303	\N	\N
4661	\N	2	\N	1	2025-11-23 08:10:20.471412	\N	\N
4662	\N	2	\N	1	2025-11-23 08:14:36.688026	\N	\N
4663	\N	2	\N	1	2025-11-23 08:14:38.030399	\N	\N
4664	\N	2	\N	1	2025-11-23 08:14:39.221752	\N	\N
4665	\N	2	\N	1	2025-11-23 08:14:40.517439	\N	\N
4666	\N	2	\N	1	2025-11-23 08:14:41.735367	\N	\N
4667	\N	2	\N	1	2025-11-23 08:14:42.914487	\N	\N
4668	\N	2	\N	2	2025-11-23 08:14:44.162668	\N	\N
4669	\N	2	\N	2	2025-11-23 08:14:45.173673	\N	\N
4670	\N	2	\N	2	2025-11-23 08:14:46.209133	\N	\N
4671	\N	2	\N	2	2025-11-23 08:14:47.311174	\N	\N
4672	\N	2	\N	2	2025-11-23 08:14:48.429415	\N	\N
4673	\N	2	\N	2	2025-11-23 08:14:49.815208	\N	\N
4674	\N	2	\N	1	2025-11-23 08:14:51.039415	\N	\N
4675	\N	2	\N	1	2025-11-23 08:14:52.180201	\N	\N
4676	\N	2	\N	1	2025-11-23 08:14:53.504412	\N	\N
4677	\N	2	\N	1	2025-11-23 08:14:54.941653	\N	\N
4678	\N	2	\N	1	2025-11-23 08:14:56.237712	\N	\N
4679	\N	2	\N	1	2025-11-23 08:14:57.35073	\N	\N
4680	\N	2	\N	1	2025-11-23 08:17:21.234845	\N	\N
4681	\N	2	\N	1	2025-11-23 08:17:22.467964	\N	\N
4682	\N	2	\N	1	2025-11-23 08:17:23.822432	\N	\N
4683	\N	2	\N	2	2025-11-23 08:17:25.213879	\N	\N
4684	\N	2	\N	1	2025-11-23 08:17:26.703	\N	\N
4685	\N	2	\N	2	2025-11-23 08:17:28.109189	\N	\N
4686	\N	2	\N	1	2025-11-23 08:17:29.366935	\N	\N
4687	\N	2	\N	1	2025-11-23 08:17:31.000761	\N	\N
4688	\N	2	\N	1	2025-11-23 08:17:32.289746	\N	\N
4689	\N	2	\N	1	2025-11-23 08:17:33.301771	\N	\N
4690	\N	2	\N	1	2025-11-23 08:17:34.592731	\N	\N
4691	\N	2	\N	0	2025-11-23 08:21:16.328421	\N	\N
4692	\N	2	\N	0	2025-11-23 08:21:17.582763	\N	\N
4693	\N	2	\N	0	2025-11-23 08:21:18.82283	\N	\N
4694	\N	2	\N	0	2025-11-23 08:21:20.008969	\N	\N
4695	\N	2	\N	0	2025-11-23 08:21:21.172924	\N	\N
4696	\N	2	\N	0	2025-11-23 08:21:22.303277	\N	\N
4697	\N	2	\N	0	2025-11-23 08:21:23.460134	\N	\N
4698	\N	2	\N	0	2025-11-23 08:21:24.55398	\N	\N
4699	\N	2	\N	0	2025-11-23 08:21:25.684992	\N	\N
4700	\N	2	\N	0	2025-11-23 08:21:26.955485	\N	\N
4701	\N	2	\N	0	2025-11-23 08:21:28.498594	\N	\N
4702	\N	2	\N	0	2025-11-23 08:21:29.554831	\N	\N
4703	\N	2	\N	0	2025-11-23 08:21:31.675306	\N	\N
4704	\N	2	\N	0	2025-11-23 08:21:32.676465	\N	\N
4705	\N	2	\N	0	2025-11-23 08:21:33.84353	\N	\N
4706	\N	2	\N	1	2025-11-23 08:27:00.83397	\N	\N
4707	\N	2	\N	1	2025-11-23 08:27:02.064803	\N	\N
4708	\N	2	\N	1	2025-11-23 08:27:03.204419	\N	\N
4709	\N	2	\N	1	2025-11-23 08:27:04.248924	\N	\N
4710	\N	2	\N	1	2025-11-23 08:27:05.564055	\N	\N
4711	\N	2	\N	1	2025-11-23 08:27:07.214073	\N	\N
4712	\N	2	\N	1	2025-11-23 08:27:08.519094	\N	\N
4713	\N	2	\N	1	2025-11-23 08:27:09.572051	\N	\N
4714	\N	2	\N	1	2025-11-23 08:27:10.899189	\N	\N
4715	\N	2	\N	1	2025-11-23 08:27:12.221842	\N	\N
4716	\N	2	\N	1	2025-11-23 08:27:13.434111	\N	\N
4717	\N	2	\N	1	2025-11-23 08:27:14.691588	\N	\N
4718	\N	2	\N	2	2025-11-23 08:27:16.636596	\N	\N
4719	\N	2	\N	2	2025-11-23 08:27:18.093876	\N	\N
4720	\N	2	\N	2	2025-11-23 08:27:19.178801	\N	\N
4721	\N	2	\N	1	2025-11-23 08:27:20.258844	\N	\N
4722	\N	2	\N	1	2025-11-23 08:27:21.680426	\N	\N
4723	\N	2	\N	1	2025-11-23 08:27:23.084231	\N	\N
4724	\N	2	\N	0	2025-11-23 08:32:25.629855	\N	\N
4725	\N	2	\N	0	2025-11-23 08:32:26.732057	\N	\N
4726	\N	2	\N	0	2025-11-23 08:32:27.891478	\N	\N
4727	\N	2	\N	0	2025-11-23 08:32:29.118111	\N	\N
4728	\N	2	\N	0	2025-11-23 08:32:30.288697	\N	\N
4729	\N	2	\N	0	2025-11-23 08:32:31.492389	\N	\N
4730	\N	2	\N	0	2025-11-23 08:32:32.603784	\N	\N
4731	\N	2	\N	0	2025-11-23 08:32:33.723726	\N	\N
4732	\N	2	\N	0	2025-11-23 08:32:34.894941	\N	\N
4757	\N	2	\N	0	2025-11-23 13:08:44.449021	\N	\N
4758	\N	2	\N	0	2025-11-23 13:08:45.407213	\N	\N
4759	\N	2	\N	0	2025-11-23 13:08:46.244197	\N	\N
4760	\N	2	\N	0	2025-11-23 13:08:47.123982	\N	\N
4761	\N	2	\N	0	2025-11-23 13:08:48.106793	\N	\N
4762	\N	2	\N	0	2025-11-23 13:08:49.302477	\N	\N
4763	\N	2	\N	0	2025-11-23 13:08:50.503719	\N	\N
4764	\N	2	\N	0	2025-11-23 13:08:51.997889	\N	\N
4765	\N	2	\N	0	2025-11-23 13:08:53.250106	\N	\N
4766	\N	2	\N	0	2025-11-23 13:08:54.166033	\N	\N
4767	\N	2	\N	0	2025-11-23 13:08:55.141114	\N	\N
4768	\N	2	\N	0	2025-11-23 13:08:56.28495	\N	\N
4769	\N	2	\N	0	2025-11-23 13:08:57.328892	\N	\N
4770	\N	2	\N	0	2025-11-23 13:08:59.19982	\N	\N
4771	\N	2	\N	0	2025-11-23 13:40:34.606294	\N	\N
4772	\N	2	\N	0	2025-11-23 13:40:35.673796	\N	\N
4773	\N	2	\N	0	2025-11-23 13:40:36.543871	\N	\N
4774	\N	2	\N	0	2025-11-23 13:40:37.424082	\N	\N
4775	\N	2	\N	0	2025-11-23 13:40:38.310478	\N	\N
4776	\N	2	\N	0	2025-11-23 13:40:39.260267	\N	\N
4777	\N	2	\N	0	2025-11-23 13:40:40.159682	\N	\N
4778	\N	2	\N	0	2025-11-23 13:40:41.049991	\N	\N
4779	\N	2	\N	0	2025-11-23 13:40:41.962523	\N	\N
4780	\N	2	\N	0	2025-11-23 13:40:42.849505	\N	\N
4781	\N	2	\N	0	2025-11-23 13:40:43.812775	\N	\N
4782	\N	2	\N	0	2025-11-23 13:40:44.742695	\N	\N
4783	\N	2	\N	0	2025-11-23 13:40:45.693354	\N	\N
4784	\N	2	\N	0	2025-11-23 13:40:46.643115	\N	\N
4785	\N	2	\N	0	2025-11-23 13:40:47.652625	\N	\N
4786	\N	2	\N	0	2025-11-23 13:40:48.861783	\N	\N
4787	\N	2	\N	0	2025-11-23 13:40:49.836487	\N	\N
4788	\N	2	\N	0	2025-11-23 13:40:50.758099	\N	\N
4789	\N	2	\N	0	2025-11-23 13:40:51.76872	\N	\N
4790	\N	2	\N	0	2025-11-23 13:40:52.994073	\N	\N
4791	\N	2	\N	0	2025-11-23 13:40:53.941541	\N	\N
4792	\N	2	\N	0	2025-11-23 13:40:55.009268	\N	\N
4793	\N	2	\N	0	2025-11-23 13:40:56.040337	\N	\N
4794	\N	2	\N	0	2025-11-23 13:40:57.269688	\N	\N
4795	\N	2	\N	0	2025-11-23 13:40:58.325521	\N	\N
4796	\N	2	\N	0	2025-11-23 13:40:59.592284	\N	\N
4797	\N	2	\N	0	2025-11-23 13:41:00.556277	\N	\N
4798	\N	2	\N	0	2025-11-23 13:41:01.659779	\N	\N
4799	\N	2	\N	0	2025-11-23 13:41:02.735446	\N	\N
4800	\N	2	\N	0	2025-11-23 13:55:56.956125	\N	\N
4801	\N	2	\N	0	2025-11-23 13:55:58.140248	\N	\N
4802	\N	2	\N	0	2025-11-23 13:55:59.013026	\N	\N
4803	\N	2	\N	0	2025-11-23 13:56:00.560728	\N	\N
4804	\N	2	\N	0	2025-11-23 13:56:01.713718	\N	\N
4805	\N	2	\N	0	2025-11-23 13:56:02.911504	\N	\N
4806	\N	2	\N	0	2025-11-23 13:56:04.11662	\N	\N
4807	\N	2	\N	0	2025-11-23 13:56:05.529792	\N	\N
4808	\N	2	\N	0	2025-11-23 13:56:07.033044	\N	\N
4809	\N	2	\N	0	2025-11-23 13:56:08.362618	\N	\N
4810	\N	2	\N	0	2025-11-23 13:56:09.847898	\N	\N
4811	\N	2	\N	0	2025-11-23 13:56:11.116936	\N	\N
4812	\N	2	\N	0	2025-11-23 13:56:12.725804	\N	\N
4813	\N	2	\N	0	2025-11-23 14:02:08.613188	\N	\N
4814	\N	2	\N	0	2025-11-23 14:02:09.572654	\N	\N
4815	\N	2	\N	0	2025-11-23 14:02:10.527177	\N	\N
4816	\N	2	\N	0	2025-11-23 14:02:11.515652	\N	\N
4817	\N	2	\N	0	2025-11-23 14:02:12.522466	\N	\N
4818	\N	2	\N	0	2025-11-23 14:02:13.790252	\N	\N
4819	\N	2	\N	0	2025-11-23 14:02:15.124504	\N	\N
4820	\N	2	\N	0	2025-11-23 14:02:16.422703	\N	\N
4821	\N	2	\N	0	2025-11-23 14:02:17.696849	\N	\N
4822	\N	2	\N	0	2025-11-23 14:02:18.772452	\N	\N
4823	\N	2	\N	0	2025-11-23 14:02:20.200136	\N	\N
4824	\N	2	\N	0	2025-11-23 14:24:56.710149	\N	\N
4825	\N	2	\N	0	2025-11-23 14:24:57.784737	\N	\N
4826	\N	2	\N	0	2025-11-23 14:24:58.836712	\N	\N
4827	\N	2	\N	0	2025-11-23 14:24:59.846567	\N	\N
4828	\N	2	\N	0	2025-11-23 14:25:00.930311	\N	\N
4829	\N	2	\N	0	2025-11-23 14:25:02.013585	\N	\N
4830	\N	2	\N	0	2025-11-23 14:25:03.051832	\N	\N
4831	\N	2	\N	0	2025-11-23 14:25:04.080043	\N	\N
4832	\N	2	\N	0	2025-11-23 14:25:05.117248	\N	\N
4833	\N	2	\N	0	2025-11-23 14:25:06.543712	\N	\N
4834	\N	2	\N	0	2025-11-23 14:25:07.685529	\N	\N
4835	\N	2	\N	0	2025-11-23 14:25:08.90197	\N	\N
4836	\N	2	\N	0	2025-11-23 14:25:10.030673	\N	\N
4837	\N	2	\N	0	2025-11-23 14:25:11.262488	\N	\N
4838	\N	2	\N	0	2025-11-23 14:25:12.501683	\N	\N
4839	\N	2	\N	0	2025-11-23 14:25:13.963854	\N	\N
4840	\N	2	\N	0	2025-11-23 14:25:15.654062	\N	\N
4841	\N	2	\N	0	2025-11-23 14:29:43.295439	\N	\N
4842	\N	2	\N	0	2025-11-23 14:29:44.329405	\N	\N
4843	\N	2	\N	0	2025-11-23 14:29:45.337062	\N	\N
4844	\N	2	\N	0	2025-11-23 14:29:46.375974	\N	\N
4845	\N	2	\N	0	2025-11-23 14:29:47.451966	\N	\N
4846	\N	2	\N	0	2025-11-23 14:29:48.887318	\N	\N
4847	\N	2	\N	0	2025-11-23 14:29:50.370773	\N	\N
4848	\N	2	\N	0	2025-11-23 14:29:51.596791	\N	\N
4849	\N	2	\N	0	2025-11-23 14:29:52.794554	\N	\N
4850	\N	2	\N	0	2025-11-23 14:29:54.097982	\N	\N
4851	\N	2	\N	0	2025-11-23 14:29:55.317753	\N	\N
4852	\N	2	\N	0	2025-11-23 14:29:56.740909	\N	\N
4853	\N	2	\N	0	2025-11-23 14:29:58.26083	\N	\N
4854	\N	3	\N	0	2025-11-23 14:30:17.932816	\N	\N
4855	\N	3	\N	0	2025-11-23 14:30:18.994532	\N	\N
4856	\N	3	\N	0	2025-11-23 14:30:20.019348	\N	\N
4857	\N	3	\N	0	2025-11-23 14:30:21.059712	\N	\N
4858	\N	3	\N	0	2025-11-23 14:30:22.096	\N	\N
4859	\N	3	\N	0	2025-11-23 14:30:23.142083	\N	\N
4860	\N	3	\N	0	2025-11-23 14:30:24.190081	\N	\N
4861	\N	3	\N	0	2025-11-23 14:30:25.287166	\N	\N
4862	\N	3	\N	0	2025-11-23 14:30:26.316537	\N	\N
4863	\N	3	\N	0	2025-11-23 14:30:27.480159	\N	\N
4864	\N	3	\N	0	2025-11-23 14:30:28.682661	\N	\N
4865	\N	3	\N	0	2025-11-23 14:30:29.787069	\N	\N
4866	\N	3	\N	0	2025-11-23 14:30:30.651554	\N	\N
4867	\N	3	\N	0	2025-11-23 14:30:31.69032	\N	\N
4868	\N	3	\N	0	2025-11-23 14:30:32.697961	\N	\N
4869	\N	3	\N	0	2025-11-23 14:30:34.129866	\N	\N
4870	\N	3	\N	0	2025-11-23 14:30:35.125256	\N	\N
4871	\N	3	\N	0	2025-11-23 14:30:36.276508	\N	\N
4872	\N	3	\N	0	2025-11-23 14:30:37.281996	\N	\N
4873	\N	3	\N	0	2025-11-23 14:30:38.253126	\N	\N
4874	\N	3	\N	0	2025-11-23 14:30:39.147784	\N	\N
4875	\N	3	\N	0	2025-11-23 14:30:40.363113	\N	\N
4876	\N	3	\N	0	2025-11-23 14:30:41.35538	\N	\N
4877	\N	3	\N	0	2025-11-23 14:30:42.438512	\N	\N
4878	\N	3	\N	0	2025-11-23 14:30:43.650628	\N	\N
4879	\N	3	\N	0	2025-11-23 14:30:44.68267	\N	\N
4880	\N	3	\N	0	2025-11-23 14:30:46.02097	\N	\N
4881	\N	3	\N	1	2025-11-23 14:30:47.430232	\N	\N
4882	\N	3	\N	0	2025-11-23 14:30:48.925177	\N	\N
4883	\N	3	\N	0	2025-11-23 14:30:49.814573	\N	\N
4884	\N	3	\N	0	2025-11-23 14:30:50.649637	\N	\N
4885	\N	3	\N	0	2025-11-23 14:30:51.560235	\N	\N
4886	\N	3	\N	0	2025-11-23 14:30:52.456003	\N	\N
4887	\N	3	\N	0	2025-11-23 14:30:53.315261	\N	\N
4888	\N	3	\N	0	2025-11-23 14:30:54.197559	\N	\N
4889	\N	3	\N	0	2025-11-23 14:30:55.358375	\N	\N
4890	\N	3	\N	0	2025-11-23 14:30:56.610777	\N	\N
4891	\N	3	\N	0	2025-11-23 14:30:57.893231	\N	\N
4892	\N	3	\N	0	2025-11-23 14:30:59.224561	\N	\N
4893	\N	3	\N	0	2025-11-23 14:31:00.581323	\N	\N
4894	\N	3	\N	0	2025-11-23 14:31:01.484453	\N	\N
4895	\N	3	\N	0	2025-11-23 14:31:02.370325	\N	\N
4896	\N	3	\N	0	2025-11-23 14:31:03.634224	\N	\N
4897	\N	3	\N	0	2025-11-23 14:31:04.828545	\N	\N
4898	\N	3	\N	0	2025-11-23 14:31:06.16577	\N	\N
4899	\N	3	\N	0	2025-11-23 14:31:08.036073	\N	\N
4900	\N	3	\N	0	2025-11-23 14:31:09.020233	\N	\N
4901	\N	3	\N	0	2025-11-23 14:31:10.07927	\N	\N
4902	\N	3	\N	0	2025-11-23 14:31:11.170961	\N	\N
4903	\N	3	\N	0	2025-11-23 14:31:12.337202	\N	\N
4904	\N	3	\N	0	2025-11-23 14:31:13.613026	\N	\N
4905	\N	3	\N	0	2025-11-23 14:31:14.599135	\N	\N
4906	\N	3	\N	0	2025-11-23 14:31:15.645935	\N	\N
4907	\N	3	\N	0	2025-11-23 14:31:16.572125	\N	\N
4908	\N	3	\N	0	2025-11-23 14:31:17.653542	\N	\N
4909	\N	3	\N	0	2025-11-23 14:31:18.877422	\N	\N
4910	\N	3	\N	0	2025-11-23 14:31:19.933243	\N	\N
4911	\N	3	\N	0	2025-11-23 14:31:21.029161	\N	\N
4912	\N	3	\N	0	2025-11-23 14:31:22.163864	\N	\N
4913	\N	2	\N	0	2025-11-23 14:36:53.116538	\N	\N
4914	\N	2	\N	0	2025-11-23 14:36:54.067253	\N	\N
4915	\N	2	\N	0	2025-11-23 14:36:55.046161	\N	\N
4916	\N	2	\N	0	2025-11-23 14:36:56.066704	\N	\N
4917	\N	2	\N	0	2025-11-23 14:36:57.244682	\N	\N
4918	\N	2	\N	0	2025-11-23 14:36:58.220844	\N	\N
4919	\N	2	\N	0	2025-11-23 14:36:59.204902	\N	\N
4920	\N	2	\N	0	2025-11-23 14:37:00.094115	\N	\N
4921	\N	2	\N	0	2025-11-23 14:37:00.947714	\N	\N
4922	\N	2	\N	0	2025-11-23 14:37:02.121055	\N	\N
4923	\N	2	\N	0	2025-11-23 14:37:03.305671	\N	\N
4924	\N	2	\N	0	2025-11-23 14:37:04.737728	\N	\N
4925	\N	2	\N	0	2025-11-23 14:37:05.901597	\N	\N
4926	\N	2	\N	0	2025-11-23 14:37:06.87515	\N	\N
4927	\N	2	\N	0	2025-11-23 14:37:07.971054	\N	\N
4928	\N	2	\N	0	2025-11-23 14:37:09.279806	\N	\N
4929	\N	2	\N	0	2025-11-23 14:37:10.480711	\N	\N
4930	\N	2	\N	0	2025-11-23 14:37:11.57535	\N	\N
4931	\N	2	\N	0	2025-11-23 14:37:12.990655	\N	\N
4932	\N	2	\N	0	2025-11-23 14:37:14.721004	\N	\N
4933	\N	2	\N	0	2025-11-23 14:37:15.669933	\N	\N
4934	\N	2	\N	0	2025-11-23 14:37:17.522721	\N	\N
4935	\N	2	\N	0	2025-11-23 14:37:18.590788	\N	\N
4936	\N	2	\N	0	2025-11-23 14:37:19.543551	\N	\N
4937	\N	2	\N	0	2025-11-23 14:37:20.528492	\N	\N
4938	\N	2	\N	0	2025-11-23 14:37:21.793185	\N	\N
4939	\N	2	\N	0	2025-11-23 14:37:23.095821	\N	\N
4940	\N	2	\N	0	2025-11-23 14:37:24.507689	\N	\N
4941	\N	2	\N	0	2025-11-23 14:37:25.360658	\N	\N
4942	\N	2	\N	0	2025-11-23 14:37:26.239773	\N	\N
4943	\N	2	\N	0	2025-11-23 14:37:27.088574	\N	\N
4944	\N	2	\N	0	2025-11-23 14:37:28.199504	\N	\N
4945	\N	2	\N	0	2025-11-23 14:37:29.06675	\N	\N
4946	\N	2	\N	0	2025-11-23 14:37:29.995065	\N	\N
4947	\N	2	\N	0	2025-11-23 14:37:31.047824	\N	\N
4948	\N	2	\N	0	2025-11-23 14:37:32.090244	\N	\N
4949	\N	2	\N	0	2025-11-23 14:37:33.096756	\N	\N
4950	\N	2	\N	0	2025-11-23 14:37:34.304675	\N	\N
4951	\N	2	\N	0	2025-11-23 14:37:35.244205	\N	\N
4952	\N	2	\N	0	2025-11-23 14:37:36.138411	\N	\N
4953	\N	2	\N	0	2025-11-23 14:37:37.047356	\N	\N
4954	\N	2	\N	1	2025-11-23 14:37:38.711583	\N	\N
4955	\N	2	\N	1	2025-11-23 14:37:39.808394	\N	\N
4956	\N	2	\N	1	2025-11-23 14:37:41.171654	\N	\N
4957	\N	2	\N	0	2025-11-23 14:37:42.194877	\N	\N
4958	\N	2	\N	1	2025-11-23 14:37:43.350938	\N	\N
4959	\N	2	\N	1	2025-11-23 14:37:44.51756	\N	\N
4960	\N	2	\N	0	2025-11-23 14:37:45.396988	\N	\N
4961	\N	2	\N	0	2025-11-23 14:37:46.277568	\N	\N
4962	\N	2	\N	0	2025-11-23 14:37:47.36269	\N	\N
4963	\N	2	\N	0	2025-11-23 14:37:48.637115	\N	\N
4964	\N	2	\N	0	2025-11-23 14:37:49.516992	\N	\N
4965	\N	2	\N	0	2025-11-23 14:37:50.448788	\N	\N
4966	\N	2	\N	0	2025-11-23 14:37:51.357467	\N	\N
4967	\N	2	\N	0	2025-11-23 14:37:52.300434	\N	\N
4968	\N	2	\N	1	2025-11-23 14:37:53.551312	\N	\N
4969	\N	2	\N	1	2025-11-23 14:37:54.470899	\N	\N
4970	\N	2	\N	0	2025-11-23 14:37:55.362194	\N	\N
4971	\N	2	\N	0	2025-11-23 14:37:56.277602	\N	\N
4972	\N	2	\N	0	2025-11-23 14:37:57.181712	\N	\N
4973	\N	2	\N	0	2025-11-23 14:37:58.187794	\N	\N
4974	\N	2	\N	0	2025-11-23 14:37:59.169205	\N	\N
4975	\N	2	\N	0	2025-11-23 14:38:00.482635	\N	\N
4976	\N	2	\N	0	2025-11-23 14:38:01.487079	\N	\N
4977	\N	2	\N	0	2025-11-23 14:38:02.358949	\N	\N
4978	\N	2	\N	0	2025-11-23 14:38:03.448487	\N	\N
4979	\N	2	\N	0	2025-11-23 14:38:04.587615	\N	\N
4980	\N	2	\N	0	2025-11-23 14:38:05.776998	\N	\N
4981	\N	2	\N	0	2025-11-23 14:38:07.016701	\N	\N
4982	\N	2	\N	0	2025-11-23 14:38:07.995105	\N	\N
4983	\N	2	\N	0	2025-11-23 14:38:09.140534	\N	\N
4984	\N	2	\N	0	2025-11-23 14:38:10.235355	\N	\N
4985	\N	2	\N	0	2025-11-23 14:38:11.089753	\N	\N
4986	\N	2	\N	0	2025-11-23 14:38:11.944558	\N	\N
4987	\N	2	\N	0	2025-11-23 14:38:13.023877	\N	\N
4988	\N	2	\N	0	2025-11-23 14:38:14.132703	\N	\N
4989	\N	2	\N	0	2025-11-23 14:38:15.000648	\N	\N
4990	\N	2	\N	0	2025-11-23 14:38:15.884358	\N	\N
4991	\N	2	\N	0	2025-11-23 14:38:16.819903	\N	\N
4992	\N	2	\N	0	2025-11-23 14:38:17.681893	\N	\N
4993	\N	2	\N	0	2025-11-23 14:38:18.573993	\N	\N
4994	\N	2	\N	1	2025-11-23 14:54:15.091656	\N	\N
4995	\N	2	\N	1	2025-11-23 14:54:16.007519	\N	\N
4996	\N	2	\N	1	2025-11-23 14:54:16.943976	\N	\N
4997	\N	2	\N	1	2025-11-23 14:54:17.856203	\N	\N
4998	\N	2	\N	1	2025-11-23 14:54:18.7829	\N	\N
4999	\N	2	\N	1	2025-11-23 14:54:19.721071	\N	\N
5000	\N	2	\N	1	2025-11-23 14:54:20.596273	\N	\N
5001	\N	2	\N	1	2025-11-23 14:54:21.440796	\N	\N
5002	\N	2	\N	1	2025-11-23 14:54:22.394495	\N	\N
5003	\N	2	\N	2	2025-11-23 14:54:23.232564	\N	\N
5004	\N	2	\N	1	2025-11-23 14:54:24.069923	\N	\N
5005	\N	2	\N	1	2025-11-23 14:54:25.018376	\N	\N
5006	\N	2	\N	1	2025-11-23 14:54:25.871193	\N	\N
5007	\N	2	\N	2	2025-11-23 14:54:26.718729	\N	\N
5008	\N	2	\N	1	2025-11-23 14:54:27.605153	\N	\N
5009	\N	2	\N	1	2025-11-23 14:54:28.509147	\N	\N
5010	\N	2	\N	1	2025-11-23 14:54:29.370352	\N	\N
5011	\N	2	\N	1	2025-11-23 14:54:30.286089	\N	\N
5012	\N	2	\N	1	2025-11-23 14:54:31.323913	\N	\N
5013	\N	2	\N	1	2025-11-23 14:54:32.175059	\N	\N
5014	\N	2	\N	1	2025-11-23 14:54:33.030378	\N	\N
5015	\N	2	\N	2	2025-11-23 14:54:34.029709	\N	\N
5016	\N	2	\N	2	2025-11-23 14:54:35.040492	\N	\N
5017	\N	2	\N	2	2025-11-23 14:54:35.991597	\N	\N
5018	\N	2	\N	2	2025-11-23 14:54:36.9365	\N	\N
5019	\N	2	\N	2	2025-11-23 14:54:37.80995	\N	\N
5020	\N	2	\N	2	2025-11-23 14:54:38.643589	\N	\N
5021	\N	2	\N	2	2025-11-23 14:54:39.482096	\N	\N
5022	\N	2	\N	2	2025-11-23 14:54:40.312027	\N	\N
5023	\N	2	\N	2	2025-11-23 14:54:41.148089	\N	\N
5024	\N	2	\N	2	2025-11-23 14:54:42.128917	\N	\N
5025	\N	2	\N	2	2025-11-23 14:54:43.04968	\N	\N
5026	\N	2	\N	2	2025-11-23 14:54:43.889112	\N	\N
5027	\N	2	\N	2	2025-11-23 14:54:44.788045	\N	\N
5028	\N	2	\N	2	2025-11-23 14:54:45.637713	\N	\N
5029	\N	2	\N	2	2025-11-23 14:54:46.590073	\N	\N
5030	\N	2	\N	2	2025-11-23 14:54:47.449804	\N	\N
5031	\N	2	\N	1	2025-11-23 14:54:48.336611	\N	\N
5032	\N	2	\N	1	2025-11-23 14:54:49.251888	\N	\N
5033	\N	2	\N	2	2025-11-23 14:54:50.147975	\N	\N
5034	\N	2	\N	2	2025-11-23 14:54:51.072659	\N	\N
5035	\N	2	\N	2	2025-11-23 14:54:51.93687	\N	\N
5036	\N	2	\N	2	2025-11-23 14:54:52.788374	\N	\N
5037	\N	2	\N	2	2025-11-23 14:54:53.702422	\N	\N
5038	\N	2	\N	2	2025-11-23 14:54:54.645477	\N	\N
5039	\N	2	\N	2	2025-11-23 14:54:55.591029	\N	\N
5040	\N	2	\N	2	2025-11-23 14:54:56.460941	\N	\N
5041	\N	2	\N	2	2025-11-23 14:54:57.297298	\N	\N
5042	\N	2	\N	2	2025-11-23 14:54:58.267347	\N	\N
5043	\N	2	\N	2	2025-11-23 14:54:59.291179	\N	\N
5044	\N	2	\N	1	2025-11-23 14:55:00.14512	\N	\N
5045	\N	2	\N	1	2025-11-23 14:55:01.034064	\N	\N
5046	\N	2	\N	1	2025-11-23 14:55:01.968675	\N	\N
5047	\N	2	\N	1	2025-11-23 14:55:02.8408	\N	\N
5048	\N	2	\N	1	2025-11-23 14:55:03.721956	\N	\N
5049	\N	2	\N	1	2025-11-23 14:55:04.601413	\N	\N
5050	\N	2	\N	1	2025-11-23 14:55:05.537935	\N	\N
5051	\N	2	\N	1	2025-11-23 14:55:06.467119	\N	\N
5052	\N	2	\N	1	2025-11-23 14:55:07.432095	\N	\N
5053	\N	2	\N	1	2025-11-23 14:55:08.456303	\N	\N
5054	\N	2	\N	1	2025-11-23 14:55:09.760581	\N	\N
5055	\N	2	\N	1	2025-11-23 14:55:10.654024	\N	\N
5056	\N	2	\N	1	2025-11-23 14:55:11.815496	\N	\N
5057	\N	2	\N	1	2025-11-23 14:55:12.739824	\N	\N
5058	\N	2	\N	1	2025-11-23 14:55:13.701458	\N	\N
5059	\N	2	\N	1	2025-11-23 14:55:14.559517	\N	\N
5060	\N	2	\N	1	2025-11-23 14:55:15.825316	\N	\N
5061	\N	2	\N	1	2025-11-23 14:55:16.661798	\N	\N
5062	\N	2	\N	1	2025-11-23 14:55:17.633679	\N	\N
5063	\N	2	\N	1	2025-11-23 14:55:18.563187	\N	\N
5064	\N	2	\N	1	2025-11-23 14:55:19.415116	\N	\N
5065	\N	2	\N	1	2025-11-23 14:55:20.284103	\N	\N
5066	\N	2	\N	1	2025-11-23 14:55:21.134338	\N	\N
5067	\N	2	\N	1	2025-11-23 14:55:22.058841	\N	\N
5068	\N	2	\N	1	2025-11-23 14:55:22.931499	\N	\N
5069	\N	2	\N	1	2025-11-23 14:55:23.78957	\N	\N
5070	\N	2	\N	1	2025-11-23 14:55:24.645237	\N	\N
5071	\N	2	\N	1	2025-11-23 14:55:25.513982	\N	\N
5072	\N	2	\N	1	2025-11-23 14:55:26.367222	\N	\N
5078	\N	2	\N	1	2025-11-23 14:55:31.732281	\N	\N
5079	\N	2	\N	1	2025-11-23 14:55:32.644793	\N	\N
5080	\N	2	\N	1	2025-11-23 14:55:33.504036	\N	\N
5081	\N	2	\N	1	2025-11-23 14:55:34.438706	\N	\N
5082	\N	2	\N	1	2025-11-23 14:55:35.346212	\N	\N
5083	\N	2	\N	1	2025-11-23 14:55:36.233692	\N	\N
5090	\N	2	\N	1	2025-11-23 14:55:42.259626	\N	\N
5091	\N	2	\N	1	2025-11-23 14:55:43.092161	\N	\N
5092	\N	2	\N	0	2025-11-23 14:55:44.010822	\N	\N
5093	\N	2	\N	1	2025-11-23 14:55:44.957799	\N	\N
5094	\N	2	\N	2	2025-11-23 14:55:45.795416	\N	\N
5101	\N	2	\N	1	2025-11-23 14:55:52.084431	\N	\N
5102	\N	2	\N	1	2025-11-23 14:55:52.930482	\N	\N
5103	\N	2	\N	1	2025-11-23 14:55:53.813696	\N	\N
5104	\N	2	\N	1	2025-11-23 14:55:54.676821	\N	\N
5105	\N	2	\N	1	2025-11-23 14:55:55.606118	\N	\N
5107	\N	2	\N	1	2025-11-23 14:55:57.378111	\N	\N
5108	\N	2	\N	1	2025-11-23 14:55:58.249004	\N	\N
5109	\N	2	\N	1	2025-11-23 14:55:59.083833	\N	\N
5110	\N	2	\N	1	2025-11-23 14:55:59.951796	\N	\N
5111	\N	2	\N	1	2025-11-23 14:56:00.798576	\N	\N
5118	\N	2	\N	1	2025-11-23 14:56:06.811498	\N	\N
5119	\N	2	\N	1	2025-11-23 14:56:07.710699	\N	\N
5120	\N	2	\N	1	2025-11-23 14:56:08.639152	\N	\N
5121	\N	2	\N	1	2025-11-23 14:56:09.481639	\N	\N
5122	\N	2	\N	1	2025-11-23 14:56:10.352368	\N	\N
5123	\N	2	\N	1	2025-11-23 14:56:11.22926	\N	\N
5135	\N	2	\N	0	2025-11-23 14:56:21.639304	\N	\N
5136	\N	2	\N	0	2025-11-23 14:56:22.556137	\N	\N
5137	\N	2	\N	0	2025-11-23 14:56:23.480031	\N	\N
5138	\N	2	\N	1	2025-11-23 14:56:24.350953	\N	\N
5139	\N	2	\N	1	2025-11-23 14:56:25.250185	\N	\N
5140	\N	2	\N	2	2025-11-23 14:56:26.098028	\N	\N
5147	\N	2	\N	2	2025-11-23 14:56:32.119651	\N	\N
5148	\N	2	\N	2	2025-11-23 14:56:33.051619	\N	\N
5149	\N	2	\N	2	2025-11-23 14:56:33.940283	\N	\N
5150	\N	2	\N	2	2025-11-23 14:56:34.837093	\N	\N
5151	\N	2	\N	1	2025-11-23 14:56:35.711523	\N	\N
5158	\N	2	\N	1	2025-11-23 14:56:41.975909	\N	\N
5159	\N	2	\N	1	2025-11-23 14:56:42.905201	\N	\N
5160	\N	2	\N	1	2025-11-23 14:56:43.758087	\N	\N
5161	\N	2	\N	1	2025-11-23 14:56:44.609423	\N	\N
5162	\N	2	\N	2	2025-11-23 14:56:45.463745	\N	\N
5163	\N	2	\N	2	2025-11-23 14:56:46.319358	\N	\N
5169	\N	2	\N	1	2025-11-23 14:56:51.68151	\N	\N
5170	\N	2	\N	2	2025-11-23 14:56:52.541542	\N	\N
5171	\N	2	\N	2	2025-11-23 14:56:53.374024	\N	\N
5172	\N	2	\N	2	2025-11-23 14:56:54.287102	\N	\N
5173	\N	2	\N	2	2025-11-23 14:56:55.170757	\N	\N
5174	\N	2	\N	2	2025-11-23 14:56:56.047569	\N	\N
5186	\N	2	\N	1	2025-11-23 14:57:06.793964	\N	\N
5187	\N	2	\N	1	2025-11-23 14:57:07.725713	\N	\N
5188	\N	2	\N	1	2025-11-23 14:57:08.645946	\N	\N
5189	\N	2	\N	1	2025-11-23 14:57:09.503497	\N	\N
5190	\N	2	\N	1	2025-11-23 14:57:10.367939	\N	\N
5191	\N	2	\N	2	2025-11-23 14:57:11.218483	\N	\N
5197	\N	2	\N	2	2025-11-23 14:57:16.50519	\N	\N
5203	\N	2	\N	1	2025-11-23 14:57:21.632056	\N	\N
5204	\N	2	\N	2	2025-11-23 14:57:22.5046	\N	\N
5205	\N	2	\N	1	2025-11-23 14:57:23.427255	\N	\N
5206	\N	2	\N	1	2025-11-23 14:57:24.297503	\N	\N
5207	\N	2	\N	1	2025-11-23 14:57:25.185788	\N	\N
5208	\N	2	\N	1	2025-11-23 14:57:26.039544	\N	\N
5215	\N	2	\N	1	2025-11-23 14:57:32.326877	\N	\N
5216	\N	2	\N	1	2025-11-23 14:57:33.205778	\N	\N
5217	\N	2	\N	1	2025-11-23 14:57:34.109294	\N	\N
5218	\N	2	\N	1	2025-11-23 14:57:35.043041	\N	\N
5219	\N	2	\N	1	2025-11-23 14:57:35.946804	\N	\N
5225	\N	2	\N	2	2025-11-23 14:58:32.136127	\N	\N
5226	\N	2	\N	1	2025-11-23 14:58:32.973325	\N	\N
5227	\N	2	\N	1	2025-11-23 14:58:33.870253	\N	\N
5228	\N	2	\N	1	2025-11-23 14:58:34.746254	\N	\N
5229	\N	2	\N	1	2025-11-23 14:58:35.609032	\N	\N
5230	\N	2	\N	2	2025-11-23 14:58:36.460937	\N	\N
5236	\N	2	\N	1	2025-11-23 14:58:41.721213	\N	\N
5237	\N	2	\N	1	2025-11-23 14:58:42.643432	\N	\N
5238	\N	2	\N	1	2025-11-23 14:58:43.583225	\N	\N
5239	\N	2	\N	1	2025-11-23 14:58:44.51117	\N	\N
5240	\N	2	\N	1	2025-11-23 14:58:45.367103	\N	\N
5241	\N	2	\N	1	2025-11-23 14:58:46.210771	\N	\N
5247	\N	2	\N	1	2025-11-23 14:58:51.541752	\N	\N
5248	\N	2	\N	1	2025-11-23 14:58:52.378431	\N	\N
5249	\N	2	\N	1	2025-11-23 14:58:53.291397	\N	\N
5250	\N	2	\N	1	2025-11-23 14:58:54.140757	\N	\N
5251	\N	2	\N	1	2025-11-23 14:58:55.077568	\N	\N
5252	\N	2	\N	1	2025-11-23 14:58:56.027329	\N	\N
5259	\N	2	\N	1	2025-11-23 14:59:02.162805	\N	\N
5260	\N	2	\N	1	2025-11-23 14:59:03.044869	\N	\N
5261	\N	2	\N	1	2025-11-23 14:59:03.903338	\N	\N
5262	\N	2	\N	1	2025-11-23 14:59:04.778879	\N	\N
5263	\N	2	\N	1	2025-11-23 14:59:05.679345	\N	\N
5270	\N	2	\N	1	2025-11-23 14:59:12.087186	\N	\N
5271	\N	2	\N	1	2025-11-23 14:59:12.991455	\N	\N
5272	\N	2	\N	1	2025-11-23 14:59:13.901481	\N	\N
5273	\N	2	\N	2	2025-11-23 14:59:14.81529	\N	\N
5274	\N	2	\N	1	2025-11-23 14:59:15.6685	\N	\N
5281	\N	2	\N	2	2025-11-23 14:59:22.034474	\N	\N
5282	\N	2	\N	2	2025-11-23 14:59:22.970827	\N	\N
5283	\N	2	\N	2	2025-11-23 14:59:23.803726	\N	\N
5284	\N	2	\N	2	2025-11-23 14:59:24.681399	\N	\N
5285	\N	2	\N	2	2025-11-23 14:59:25.564807	\N	\N
5292	\N	2	\N	1	2025-11-23 14:59:31.85527	\N	\N
5293	\N	2	\N	1	2025-11-23 14:59:32.745106	\N	\N
5294	\N	2	\N	1	2025-11-23 14:59:33.670222	\N	\N
5295	\N	2	\N	1	2025-11-23 14:59:34.589167	\N	\N
5296	\N	2	\N	1	2025-11-23 14:59:35.446965	\N	\N
5297	\N	2	\N	1	2025-11-23 14:59:36.30413	\N	\N
5303	\N	2	\N	1	2025-11-23 14:59:41.60617	\N	\N
5304	\N	2	\N	1	2025-11-23 14:59:42.439895	\N	\N
5305	\N	2	\N	1	2025-11-23 14:59:43.301691	\N	\N
5306	\N	2	\N	1	2025-11-23 14:59:44.220723	\N	\N
5307	\N	2	\N	1	2025-11-23 14:59:45.065028	\N	\N
5308	\N	2	\N	1	2025-11-23 14:59:45.926556	\N	\N
5073	\N	2	\N	1	2025-11-23 14:55:27.277862	\N	\N
5074	\N	2	\N	1	2025-11-23 14:55:28.16098	\N	\N
5075	\N	2	\N	1	2025-11-23 14:55:29.030726	\N	\N
5076	\N	2	\N	1	2025-11-23 14:55:29.897643	\N	\N
5077	\N	2	\N	1	2025-11-23 14:55:30.84235	\N	\N
5084	\N	2	\N	1	2025-11-23 14:55:37.064851	\N	\N
5085	\N	2	\N	1	2025-11-23 14:55:37.917958	\N	\N
5086	\N	2	\N	1	2025-11-23 14:55:38.763453	\N	\N
5087	\N	2	\N	1	2025-11-23 14:55:39.639455	\N	\N
5088	\N	2	\N	1	2025-11-23 14:55:40.479648	\N	\N
5089	\N	2	\N	1	2025-11-23 14:55:41.348152	\N	\N
5095	\N	2	\N	2	2025-11-23 14:55:46.719125	\N	\N
5096	\N	2	\N	1	2025-11-23 14:55:47.636497	\N	\N
5097	\N	2	\N	1	2025-11-23 14:55:48.528127	\N	\N
5098	\N	2	\N	1	2025-11-23 14:55:49.433564	\N	\N
5099	\N	2	\N	1	2025-11-23 14:55:50.309218	\N	\N
5100	\N	2	\N	1	2025-11-23 14:55:51.195886	\N	\N
5106	\N	2	\N	1	2025-11-23 14:55:56.503979	\N	\N
5112	\N	2	\N	1	2025-11-23 14:56:01.673611	\N	\N
5113	\N	2	\N	1	2025-11-23 14:56:02.510976	\N	\N
5114	\N	2	\N	1	2025-11-23 14:56:03.356529	\N	\N
5115	\N	2	\N	1	2025-11-23 14:56:04.207195	\N	\N
5116	\N	2	\N	1	2025-11-23 14:56:05.069756	\N	\N
5117	\N	2	\N	1	2025-11-23 14:56:05.942329	\N	\N
5124	\N	2	\N	1	2025-11-23 14:56:12.101559	\N	\N
5125	\N	2	\N	1	2025-11-23 14:56:13.035466	\N	\N
5126	\N	2	\N	1	2025-11-23 14:56:13.8925	\N	\N
5127	\N	2	\N	1	2025-11-23 14:56:14.745721	\N	\N
5128	\N	2	\N	1	2025-11-23 14:56:15.656119	\N	\N
5129	\N	2	\N	0	2025-11-23 14:56:16.512256	\N	\N
5130	\N	2	\N	0	2025-11-23 14:56:17.405216	\N	\N
5131	\N	2	\N	1	2025-11-23 14:56:18.247202	\N	\N
5132	\N	2	\N	1	2025-11-23 14:56:19.098278	\N	\N
5133	\N	2	\N	0	2025-11-23 14:56:19.964651	\N	\N
5134	\N	2	\N	1	2025-11-23 14:56:20.799897	\N	\N
5141	\N	2	\N	1	2025-11-23 14:56:26.993397	\N	\N
5142	\N	2	\N	2	2025-11-23 14:56:27.848489	\N	\N
5143	\N	2	\N	2	2025-11-23 14:56:28.715729	\N	\N
5144	\N	2	\N	2	2025-11-23 14:56:29.572457	\N	\N
5145	\N	2	\N	2	2025-11-23 14:56:30.409323	\N	\N
5146	\N	2	\N	1	2025-11-23 14:56:31.254298	\N	\N
5152	\N	2	\N	1	2025-11-23 14:56:36.598326	\N	\N
5153	\N	2	\N	1	2025-11-23 14:56:37.506598	\N	\N
5154	\N	2	\N	1	2025-11-23 14:56:38.370458	\N	\N
5155	\N	2	\N	1	2025-11-23 14:56:39.257976	\N	\N
5156	\N	2	\N	1	2025-11-23 14:56:40.170304	\N	\N
5157	\N	2	\N	1	2025-11-23 14:56:41.104889	\N	\N
5164	\N	2	\N	2	2025-11-23 14:56:47.229768	\N	\N
5165	\N	2	\N	1	2025-11-23 14:56:48.090974	\N	\N
5166	\N	2	\N	1	2025-11-23 14:56:48.955083	\N	\N
5167	\N	2	\N	1	2025-11-23 14:56:49.864966	\N	\N
5168	\N	2	\N	1	2025-11-23 14:56:50.748591	\N	\N
5175	\N	2	\N	2	2025-11-23 14:56:56.985569	\N	\N
5176	\N	2	\N	2	2025-11-23 14:56:57.87777	\N	\N
5177	\N	2	\N	2	2025-11-23 14:56:58.779306	\N	\N
5178	\N	2	\N	2	2025-11-23 14:56:59.724866	\N	\N
5179	\N	2	\N	2	2025-11-23 14:57:00.640264	\N	\N
5180	\N	2	\N	3	2025-11-23 14:57:01.473837	\N	\N
5181	\N	2	\N	1	2025-11-23 14:57:02.330659	\N	\N
5182	\N	2	\N	2	2025-11-23 14:57:03.185737	\N	\N
5183	\N	2	\N	2	2025-11-23 14:57:04.105711	\N	\N
5184	\N	2	\N	1	2025-11-23 14:57:05.041937	\N	\N
5185	\N	2	\N	2	2025-11-23 14:57:05.938987	\N	\N
5192	\N	2	\N	2	2025-11-23 14:57:12.083589	\N	\N
5193	\N	2	\N	2	2025-11-23 14:57:13.004189	\N	\N
5194	\N	2	\N	2	2025-11-23 14:57:13.891274	\N	\N
5195	\N	2	\N	2	2025-11-23 14:57:14.749146	\N	\N
5196	\N	2	\N	2	2025-11-23 14:57:15.651421	\N	\N
5198	\N	2	\N	2	2025-11-23 14:57:17.389886	\N	\N
5199	\N	2	\N	1	2025-11-23 14:57:18.252164	\N	\N
5200	\N	2	\N	1	2025-11-23 14:57:19.112999	\N	\N
5201	\N	2	\N	1	2025-11-23 14:57:19.950671	\N	\N
5202	\N	2	\N	1	2025-11-23 14:57:20.784982	\N	\N
5209	\N	2	\N	1	2025-11-23 14:57:26.924069	\N	\N
5210	\N	2	\N	1	2025-11-23 14:57:27.840649	\N	\N
5211	\N	2	\N	2	2025-11-23 14:57:28.740055	\N	\N
5212	\N	2	\N	1	2025-11-23 14:57:29.589612	\N	\N
5213	\N	2	\N	1	2025-11-23 14:57:30.512686	\N	\N
5214	\N	2	\N	1	2025-11-23 14:57:31.455734	\N	\N
5220	\N	2	\N	1	2025-11-23 14:57:36.881173	\N	\N
5221	\N	2	\N	1	2025-11-23 14:57:37.761492	\N	\N
5222	\N	2	\N	1	2025-11-23 14:57:38.623456	\N	\N
5223	\N	2	\N	1	2025-11-23 14:57:39.526698	\N	\N
5224	\N	2	\N	1	2025-11-23 14:58:31.291202	\N	\N
5231	\N	2	\N	1	2025-11-23 14:58:37.345949	\N	\N
5232	\N	2	\N	2	2025-11-23 14:58:38.193304	\N	\N
5233	\N	2	\N	1	2025-11-23 14:58:39.122518	\N	\N
5234	\N	2	\N	1	2025-11-23 14:58:39.961321	\N	\N
5235	\N	2	\N	1	2025-11-23 14:58:40.879001	\N	\N
5242	\N	2	\N	1	2025-11-23 14:58:47.103938	\N	\N
5243	\N	2	\N	0	2025-11-23 14:58:48.022272	\N	\N
5244	\N	2	\N	1	2025-11-23 14:58:48.95146	\N	\N
5245	\N	2	\N	1	2025-11-23 14:58:49.876818	\N	\N
5246	\N	2	\N	1	2025-11-23 14:58:50.7082	\N	\N
5253	\N	2	\N	1	2025-11-23 14:58:56.910711	\N	\N
5254	\N	2	\N	1	2025-11-23 14:58:57.764456	\N	\N
5255	\N	2	\N	1	2025-11-23 14:58:58.617675	\N	\N
5256	\N	2	\N	1	2025-11-23 14:58:59.459748	\N	\N
5257	\N	2	\N	1	2025-11-23 14:59:00.367866	\N	\N
5258	\N	2	\N	1	2025-11-23 14:59:01.330078	\N	\N
5264	\N	2	\N	1	2025-11-23 14:59:06.617612	\N	\N
5265	\N	2	\N	1	2025-11-23 14:59:07.547962	\N	\N
5266	\N	2	\N	1	2025-11-23 14:59:08.468756	\N	\N
5267	\N	2	\N	0	2025-11-23 14:59:09.386682	\N	\N
5268	\N	2	\N	1	2025-11-23 14:59:10.334089	\N	\N
5269	\N	2	\N	1	2025-11-23 14:59:11.175917	\N	\N
5275	\N	2	\N	1	2025-11-23 14:59:16.597138	\N	\N
5276	\N	2	\N	1	2025-11-23 14:59:17.456247	\N	\N
5277	\N	2	\N	1	2025-11-23 14:59:18.387322	\N	\N
5278	\N	2	\N	1	2025-11-23 14:59:19.291814	\N	\N
5279	\N	2	\N	2	2025-11-23 14:59:20.226184	\N	\N
5280	\N	2	\N	2	2025-11-23 14:59:21.110041	\N	\N
5286	\N	2	\N	1	2025-11-23 14:59:26.482777	\N	\N
5287	\N	2	\N	1	2025-11-23 14:59:27.406793	\N	\N
5288	\N	2	\N	1	2025-11-23 14:59:28.339243	\N	\N
5289	\N	2	\N	1	2025-11-23 14:59:29.21878	\N	\N
5290	\N	2	\N	1	2025-11-23 14:59:30.062778	\N	\N
5291	\N	2	\N	1	2025-11-23 14:59:30.971297	\N	\N
5298	\N	2	\N	1	2025-11-23 14:59:37.177162	\N	\N
5299	\N	2	\N	1	2025-11-23 14:59:38.102302	\N	\N
5300	\N	2	\N	1	2025-11-23 14:59:39.011217	\N	\N
5301	\N	2	\N	1	2025-11-23 14:59:39.846517	\N	\N
5302	\N	2	\N	1	2025-11-23 14:59:40.770378	\N	\N
5309	\N	2	\N	1	2025-11-23 14:59:46.761228	\N	\N
5310	\N	2	\N	1	2025-11-23 14:59:47.623958	\N	\N
5311	\N	2	\N	1	2025-11-23 14:59:48.545127	\N	\N
5312	\N	2	\N	1	2025-11-23 14:59:49.386414	\N	\N
5313	\N	2	\N	1	2025-11-23 14:59:50.310792	\N	\N
5314	\N	2	\N	1	2025-11-23 14:59:51.223627	\N	\N
5315	\N	2	\N	2	2025-11-23 14:59:52.149166	\N	\N
5316	\N	2	\N	2	2025-11-23 14:59:53.056374	\N	\N
5317	\N	2	\N	3	2025-11-23 14:59:53.902514	\N	\N
5318	\N	2	\N	2	2025-11-23 14:59:54.738656	\N	\N
5319	\N	2	\N	2	2025-11-23 14:59:55.603931	\N	\N
5320	\N	2	\N	2	2025-11-23 14:59:56.435692	\N	\N
5321	\N	2	\N	2	2025-11-23 14:59:57.329121	\N	\N
5322	\N	2	\N	2	2025-11-23 14:59:58.180131	\N	\N
5323	\N	2	\N	1	2025-11-23 14:59:59.103352	\N	\N
5324	\N	2	\N	2	2025-11-23 15:00:00.038844	\N	\N
5325	\N	2	\N	1	2025-11-23 15:00:00.891217	\N	\N
5326	\N	2	\N	2	2025-11-23 15:00:01.731825	\N	\N
5327	\N	2	\N	2	2025-11-23 15:00:02.653794	\N	\N
5328	\N	2	\N	2	2025-11-23 15:00:03.578245	\N	\N
5329	\N	2	\N	2	2025-11-23 15:00:04.501038	\N	\N
5330	\N	2	\N	1	2025-11-23 15:00:05.336733	\N	\N
5331	\N	2	\N	1	2025-11-23 15:00:06.167014	\N	\N
5332	\N	2	\N	1	2025-11-23 15:00:07.036927	\N	\N
5333	\N	2	\N	1	2025-11-23 15:00:08.068173	\N	\N
5334	\N	2	\N	1	2025-11-23 15:00:08.980584	\N	\N
5335	\N	2	\N	1	2025-11-23 15:00:09.866974	\N	\N
5336	\N	2	\N	1	2025-11-23 15:00:10.800969	\N	\N
5337	\N	2	\N	1	2025-11-23 15:00:11.648303	\N	\N
5338	\N	2	\N	1	2025-11-23 15:00:12.587946	\N	\N
5339	\N	3	\N	1	2025-11-23 15:00:27.285221	\N	\N
5340	\N	3	\N	1	2025-11-23 15:00:28.119227	\N	\N
5341	\N	3	\N	1	2025-11-23 15:00:28.993466	\N	\N
5342	\N	3	\N	1	2025-11-23 15:00:29.816647	\N	\N
5343	\N	3	\N	1	2025-11-23 15:00:30.747094	\N	\N
5344	\N	3	\N	1	2025-11-23 15:00:31.594957	\N	\N
5345	\N	3	\N	1	2025-11-23 15:00:32.44088	\N	\N
5346	\N	3	\N	1	2025-11-23 15:00:33.358536	\N	\N
5347	\N	3	\N	2	2025-11-23 15:00:34.264816	\N	\N
5348	\N	3	\N	2	2025-11-23 15:00:35.097086	\N	\N
5349	\N	3	\N	1	2025-11-23 15:00:35.97762	\N	\N
5350	\N	3	\N	1	2025-11-23 15:00:36.905403	\N	\N
5351	\N	3	\N	1	2025-11-23 15:00:37.819013	\N	\N
5352	\N	3	\N	1	2025-11-23 15:00:38.676177	\N	\N
5353	\N	3	\N	2	2025-11-23 15:00:39.575863	\N	\N
5354	\N	3	\N	2	2025-11-23 15:00:40.41179	\N	\N
5355	\N	3	\N	2	2025-11-23 15:00:41.324426	\N	\N
5356	\N	3	\N	2	2025-11-23 15:00:42.257475	\N	\N
5357	\N	3	\N	1	2025-11-23 15:00:43.147755	\N	\N
5358	\N	3	\N	0	2025-11-23 15:00:43.979783	\N	\N
5359	\N	3	\N	1	2025-11-23 15:00:44.903058	\N	\N
5360	\N	3	\N	1	2025-11-23 15:00:45.759742	\N	\N
5361	\N	3	\N	0	2025-11-23 15:00:46.695085	\N	\N
5362	\N	3	\N	0	2025-11-23 15:00:47.55694	\N	\N
5363	\N	3	\N	1	2025-11-23 15:00:48.469766	\N	\N
5364	\N	3	\N	1	2025-11-23 15:00:49.382431	\N	\N
5365	\N	3	\N	1	2025-11-23 15:00:50.30852	\N	\N
5366	\N	3	\N	1	2025-11-23 15:00:51.240643	\N	\N
5367	\N	3	\N	2	2025-11-23 15:00:52.074805	\N	\N
5368	\N	3	\N	1	2025-11-23 15:00:52.962057	\N	\N
5369	\N	3	\N	1	2025-11-23 15:00:53.801158	\N	\N
5370	\N	3	\N	1	2025-11-23 15:00:54.65758	\N	\N
5371	\N	3	\N	1	2025-11-23 15:00:55.515115	\N	\N
5372	\N	3	\N	1	2025-11-23 15:00:56.370568	\N	\N
5373	\N	3	\N	1	2025-11-23 15:00:57.266517	\N	\N
5374	\N	3	\N	1	2025-11-23 15:00:58.117278	\N	\N
5375	\N	3	\N	1	2025-11-23 15:00:58.944003	\N	\N
5376	\N	3	\N	1	2025-11-23 15:00:59.841595	\N	\N
5377	\N	2	\N	1	2025-11-23 15:32:29.708505	\N	\N
5378	\N	2	\N	1	2025-11-23 15:32:30.527069	\N	\N
5379	\N	2	\N	1	2025-11-23 15:32:31.424962	\N	\N
5380	\N	2	\N	1	2025-11-23 15:32:32.265793	\N	\N
5381	\N	2	\N	1	2025-11-23 15:32:33.182653	\N	\N
5382	\N	2	\N	1	2025-11-23 15:32:34.034758	\N	\N
5383	\N	2	\N	1	2025-11-23 15:32:34.930467	\N	\N
5384	\N	2	\N	1	2025-11-23 15:32:35.875427	\N	\N
5385	\N	2	\N	1	2025-11-23 15:32:36.784276	\N	\N
5386	\N	2	\N	1	2025-11-23 15:32:37.683356	\N	\N
5387	\N	2	\N	1	2025-11-23 15:32:38.615015	\N	\N
5388	\N	2	\N	1	2025-11-23 15:32:39.487005	\N	\N
5389	\N	2	\N	1	2025-11-23 15:32:40.371804	\N	\N
5390	\N	2	\N	1	2025-11-23 15:32:41.278603	\N	\N
5391	\N	2	\N	1	2025-11-23 15:32:42.162467	\N	\N
5392	\N	2	\N	1	2025-11-23 15:32:43.062111	\N	\N
5393	\N	2	\N	1	2025-11-23 15:32:43.919192	\N	\N
5394	\N	2	\N	1	2025-11-23 15:32:44.826671	\N	\N
5395	\N	2	\N	1	2025-11-23 15:32:45.707692	\N	\N
5396	\N	2	\N	1	2025-11-23 15:32:46.633968	\N	\N
5397	\N	2	\N	1	2025-11-23 15:32:47.537743	\N	\N
5398	\N	2	\N	1	2025-11-23 15:32:48.373143	\N	\N
5399	\N	2	\N	2	2025-11-23 15:32:49.239479	\N	\N
5400	\N	2	\N	1	2025-11-23 15:32:50.07005	\N	\N
5401	\N	2	\N	1	2025-11-23 15:32:50.988852	\N	\N
5402	\N	2	\N	1	2025-11-23 15:32:51.834772	\N	\N
5403	\N	2	\N	1	2025-11-23 15:32:52.723609	\N	\N
5404	\N	2	\N	1	2025-11-23 15:32:53.609468	\N	\N
5405	\N	2	\N	1	2025-11-23 15:32:54.51117	\N	\N
5406	\N	2	\N	1	2025-11-23 15:32:55.344	\N	\N
5407	\N	2	\N	1	2025-11-23 15:32:56.184758	\N	\N
5408	\N	2	\N	1	2025-11-23 15:32:57.046857	\N	\N
5409	\N	2	\N	2	2025-11-23 15:32:57.948294	\N	\N
5410	\N	2	\N	2	2025-11-23 15:32:58.831907	\N	\N
5411	\N	2	\N	2	2025-11-23 15:32:59.666392	\N	\N
5412	\N	2	\N	2	2025-11-23 15:33:00.510517	\N	\N
5413	\N	2	\N	2	2025-11-23 15:33:01.348188	\N	\N
5414	\N	2	\N	2	2025-11-23 15:33:02.281327	\N	\N
5415	\N	2	\N	2	2025-11-23 15:33:03.124497	\N	\N
5416	\N	2	\N	1	2025-11-23 15:33:04.020056	\N	\N
5417	\N	2	\N	2	2025-11-23 15:33:04.836746	\N	\N
5418	\N	2	\N	2	2025-11-23 15:33:05.737406	\N	\N
5419	\N	2	\N	2	2025-11-23 15:33:06.573036	\N	\N
5420	\N	2	\N	1	2025-11-23 15:33:07.488377	\N	\N
5421	\N	2	\N	1	2025-11-23 15:33:08.372023	\N	\N
5422	\N	2	\N	1	2025-11-23 15:33:09.298907	\N	\N
5423	\N	2	\N	1	2025-11-23 15:33:10.20762	\N	\N
5424	\N	2	\N	1	2025-11-23 15:33:11.136367	\N	\N
5425	\N	2	\N	1	2025-11-23 15:33:11.986217	\N	\N
5426	\N	2	\N	1	2025-11-23 15:33:12.923846	\N	\N
5427	\N	2	\N	1	2025-11-23 15:33:13.781777	\N	\N
5428	\N	2	\N	1	2025-11-23 15:33:14.627467	\N	\N
5429	\N	3	\N	1	2025-11-23 15:33:59.552526	\N	\N
5430	\N	3	\N	1	2025-11-23 15:34:00.410921	\N	\N
5431	\N	3	\N	1	2025-11-23 15:34:01.407297	\N	\N
5432	\N	3	\N	1	2025-11-23 15:34:02.305345	\N	\N
5433	\N	3	\N	1	2025-11-23 15:34:03.32397	\N	\N
5434	\N	3	\N	1	2025-11-23 15:34:04.515827	\N	\N
5435	\N	3	\N	1	2025-11-23 15:34:05.483349	\N	\N
5436	\N	3	\N	1	2025-11-23 15:34:06.360061	\N	\N
5437	\N	3	\N	1	2025-11-23 15:34:07.194442	\N	\N
5438	\N	2	\N	1	2025-11-23 15:34:18.38152	\N	\N
5439	\N	2	\N	1	2025-11-23 15:34:19.300526	\N	\N
5440	\N	2	\N	1	2025-11-23 15:34:20.148672	\N	\N
5441	\N	2	\N	1	2025-11-23 15:34:21.002718	\N	\N
5442	\N	2	\N	1	2025-11-23 15:34:21.870534	\N	\N
5443	\N	1	\N	2	2025-11-24 10:30:32.288853	\N	\N
5444	\N	1	\N	2	2025-11-24 10:30:33.118168	\N	\N
5445	\N	1	\N	2	2025-11-24 10:30:34.016799	\N	\N
5446	\N	1	\N	2	2025-11-24 10:30:34.866644	\N	\N
5447	\N	1	\N	2	2025-11-24 10:30:35.731668	\N	\N
5448	\N	1	\N	2	2025-11-24 10:30:36.596232	\N	\N
5449	\N	1	\N	2	2025-11-24 10:30:37.456034	\N	\N
5450	\N	1	\N	2	2025-11-24 10:30:38.358056	\N	\N
5451	\N	1	\N	2	2025-11-24 10:30:39.188061	\N	\N
5452	\N	1	\N	2	2025-11-24 10:30:40.1037	\N	\N
5453	\N	1	\N	1	2025-11-24 10:30:41.010213	\N	\N
5454	\N	1	\N	1	2025-11-24 10:30:41.919444	\N	\N
5455	\N	1	\N	1	2025-11-24 10:30:42.819624	\N	\N
5456	\N	1	\N	1	2025-11-24 10:30:43.713684	\N	\N
5457	\N	1	\N	1	2025-11-24 10:30:44.619078	\N	\N
5458	\N	1	\N	1	2025-11-24 10:30:45.493887	\N	\N
5459	\N	1	\N	1	2025-11-24 10:30:46.327244	\N	\N
5460	\N	1	\N	1	2025-11-24 10:30:47.239087	\N	\N
5461	\N	1	\N	1	2025-11-24 10:30:48.173987	\N	\N
5462	\N	1	\N	1	2025-11-24 10:30:49.022557	\N	\N
5463	\N	1	\N	1	2025-11-24 10:30:49.929511	\N	\N
5464	\N	1	\N	2	2025-11-24 10:46:55.461154	\N	\N
5465	\N	1	\N	2	2025-11-24 10:46:56.308919	\N	\N
5466	\N	1	\N	2	2025-11-24 10:46:57.150022	\N	\N
5467	\N	1	\N	2	2025-11-24 10:46:57.98629	\N	\N
5468	\N	1	\N	2	2025-11-24 10:46:58.877979	\N	\N
5469	\N	1	\N	2	2025-11-24 10:46:59.723955	\N	\N
5470	\N	1	\N	2	2025-11-24 10:47:00.572872	\N	\N
5471	\N	1	\N	2	2025-11-24 10:47:01.409144	\N	\N
5472	\N	1	\N	2	2025-11-24 10:47:02.302223	\N	\N
5473	\N	1	\N	2	2025-11-24 10:47:03.184634	\N	\N
5474	\N	1	\N	1	2025-11-24 10:47:04.090664	\N	\N
5475	\N	1	\N	1	2025-11-24 10:47:04.922726	\N	\N
5476	\N	1	\N	1	2025-11-24 10:47:05.771817	\N	\N
5477	\N	1	\N	1	2025-11-24 10:47:06.674171	\N	\N
5478	\N	1	\N	1	2025-11-24 10:47:07.548046	\N	\N
5479	\N	1	\N	1	2025-11-24 10:47:08.456115	\N	\N
5480	\N	1	\N	1	2025-11-24 10:47:09.314045	\N	\N
5481	\N	1	\N	1	2025-11-24 10:47:10.222523	\N	\N
5482	\N	1	\N	1	2025-11-24 10:47:11.139681	\N	\N
5483	\N	1	\N	1	2025-11-24 10:47:12.050603	\N	\N
5484	\N	1	\N	1	2025-11-24 10:47:12.949747	\N	\N
5485	\N	1	\N	1	2025-11-24 10:47:13.847803	\N	\N
5486	\N	1	\N	2	2025-11-24 11:40:32.687964	\N	\N
5487	\N	1	\N	2	2025-11-24 11:40:33.578313	\N	\N
5488	\N	1	\N	2	2025-11-24 11:40:34.477549	\N	\N
5489	\N	1	\N	2	2025-11-24 11:40:35.37763	\N	\N
5490	\N	1	\N	2	2025-11-24 11:40:36.217287	\N	\N
5491	\N	1	\N	2	2025-11-24 11:40:37.05647	\N	\N
5492	\N	1	\N	2	2025-11-24 11:40:37.965373	\N	\N
5493	\N	1	\N	2	2025-11-24 11:40:38.829606	\N	\N
5494	\N	1	\N	2	2025-11-24 11:40:39.742386	\N	\N
5495	\N	1	\N	1	2025-11-24 11:40:40.602214	\N	\N
5496	\N	1	\N	1	2025-11-24 11:40:41.492631	\N	\N
5497	\N	1	\N	1	2025-11-24 11:40:42.381329	\N	\N
5498	\N	1	\N	1	2025-11-24 11:40:43.222255	\N	\N
5499	\N	1	\N	1	2025-11-24 11:40:44.08197	\N	\N
5500	\N	1	\N	1	2025-11-24 11:40:44.917518	\N	\N
5501	\N	1	\N	1	2025-11-24 11:40:45.79113	\N	\N
5502	\N	1	\N	1	2025-11-24 11:40:46.625262	\N	\N
5503	\N	1	\N	1	2025-11-24 11:40:47.582616	\N	\N
5504	\N	1	\N	1	2025-11-24 11:40:48.363228	\N	\N
5505	\N	1	\N	1	2025-11-24 11:40:49.210953	\N	\N
5506	\N	1	\N	1	2025-11-24 11:40:50.087304	\N	\N
5507	\N	1	\N	1	2025-11-24 11:40:50.990401	\N	\N
5508	\N	1	\N	2	2025-11-24 11:49:38.649827	\N	\N
5509	\N	1	\N	2	2025-11-24 11:49:39.514924	\N	\N
5510	\N	1	\N	2	2025-11-24 11:49:40.449038	\N	\N
5511	\N	1	\N	2	2025-11-24 11:49:41.27626	\N	\N
5512	\N	1	\N	2	2025-11-24 11:49:42.182676	\N	\N
5513	\N	1	\N	2	2025-11-24 11:49:43.031761	\N	\N
5514	\N	1	\N	2	2025-11-24 11:49:43.947416	\N	\N
5515	\N	1	\N	2	2025-11-24 11:49:44.840133	\N	\N
5516	\N	1	\N	2	2025-11-24 11:49:45.759565	\N	\N
5517	\N	1	\N	1	2025-11-24 11:49:46.650133	\N	\N
5518	\N	1	\N	1	2025-11-24 11:49:47.562448	\N	\N
5519	\N	1	\N	1	2025-11-24 11:49:48.500762	\N	\N
5520	\N	1	\N	1	2025-11-24 11:49:49.404759	\N	\N
5521	\N	1	\N	1	2025-11-24 11:49:50.254886	\N	\N
5522	\N	1	\N	1	2025-11-24 11:49:51.089346	\N	\N
5523	\N	1	\N	1	2025-11-24 11:49:51.933876	\N	\N
5524	\N	1	\N	1	2025-11-24 11:49:52.818986	\N	\N
5525	\N	1	\N	1	2025-11-24 11:49:53.659654	\N	\N
5526	\N	1	\N	1	2025-11-24 11:49:54.518027	\N	\N
5527	\N	1	\N	1	2025-11-24 11:49:55.384317	\N	\N
5528	\N	1	\N	2	2025-11-24 12:15:42.725418	\N	\N
5529	\N	1	\N	2	2025-11-24 13:48:34.273981	\N	\N
5530	\N	1	\N	2	2025-11-24 13:48:35.128359	\N	\N
5531	\N	1	\N	2	2025-11-24 13:48:36.006506	\N	\N
5532	\N	1	\N	2	2025-11-24 13:48:36.897554	\N	\N
5533	\N	1	\N	2	2025-11-24 13:48:37.736818	\N	\N
5534	\N	1	\N	2	2025-11-24 13:48:38.606142	\N	\N
5535	\N	1	\N	2	2025-11-24 13:48:39.440699	\N	\N
5536	\N	1	\N	2	2025-11-24 13:48:40.358774	\N	\N
5537	\N	1	\N	2	2025-11-24 13:48:41.251555	\N	\N
5538	\N	1	\N	1	2025-11-24 13:48:42.16615	\N	\N
5539	\N	1	\N	1	2025-11-24 13:48:43.042444	\N	\N
5540	\N	1	\N	1	2025-11-24 13:48:43.886771	\N	\N
5541	\N	1	\N	1	2025-11-24 13:48:44.754228	\N	\N
5542	\N	1	\N	1	2025-11-24 13:48:45.606624	\N	\N
5543	\N	1	\N	1	2025-11-24 13:48:46.561861	\N	\N
5544	\N	1	\N	1	2025-11-24 13:48:47.417236	\N	\N
5545	\N	1	\N	1	2025-11-24 13:48:48.337425	\N	\N
5546	\N	1	\N	1	2025-11-24 13:48:49.173261	\N	\N
5547	\N	1	\N	1	2025-11-24 13:48:50.049648	\N	\N
5548	\N	1	\N	1	2025-11-24 13:48:50.917932	\N	\N
5549	\N	1	\N	1	2025-11-24 13:48:51.839822	\N	\N
5550	\N	1	\N	1	2025-11-24 13:48:52.719305	\N	\N
5551	\N	1	\N	1	2025-11-24 13:48:53.577727	\N	\N
5552	\N	1	\N	1	2025-11-24 13:48:54.447329	\N	\N
5553	\N	1	\N	2	2025-11-25 05:58:06.357549	\N	\N
5554	\N	1	\N	2	2025-11-25 05:58:07.187415	\N	\N
5555	\N	1	\N	2	2025-11-25 05:58:08.08578	\N	\N
5556	\N	1	\N	2	2025-11-25 05:58:08.977943	\N	\N
5557	\N	1	\N	2	2025-11-25 05:58:09.876789	\N	\N
5558	\N	1	\N	2	2025-11-25 05:58:10.78539	\N	\N
5559	\N	1	\N	2	2025-11-25 05:58:11.715	\N	\N
5560	\N	1	\N	2	2025-11-25 05:58:12.585554	\N	\N
5561	\N	1	\N	2	2025-11-25 05:58:13.480458	\N	\N
5562	\N	1	\N	2	2025-11-25 05:58:14.397842	\N	\N
5563	\N	1	\N	2	2025-11-25 05:58:15.270454	\N	\N
5564	\N	1	\N	2	2025-11-25 05:58:16.133196	\N	\N
5565	\N	1	\N	2	2025-11-25 05:58:17.098719	\N	\N
5566	\N	1	\N	2	2025-11-25 05:58:18.061112	\N	\N
5567	\N	1	\N	2	2025-11-25 06:00:46.997304	\N	\N
5568	\N	1	\N	2	2025-11-25 06:00:47.860101	\N	\N
5569	\N	1	\N	2	2025-11-25 06:00:48.722201	\N	\N
5570	\N	1	\N	2	2025-11-25 06:00:49.652005	\N	\N
5571	\N	1	\N	2	2025-11-25 06:00:50.555763	\N	\N
5572	\N	1	\N	2	2025-11-25 06:00:51.48377	\N	\N
5573	\N	1	\N	2	2025-11-25 06:00:52.357852	\N	\N
5574	\N	1	\N	2	2025-11-25 06:00:53.221574	\N	\N
5575	\N	1	\N	2	2025-11-25 06:00:54.11563	\N	\N
5576	\N	1	\N	2	2025-11-25 06:00:54.968746	\N	\N
5577	\N	1	\N	2	2025-11-25 06:00:55.876145	\N	\N
5578	\N	1	\N	2	2025-11-25 06:00:56.740077	\N	\N
5579	\N	1	\N	2	2025-11-25 06:00:57.708163	\N	\N
5580	\N	1	\N	1	2025-11-25 06:00:58.642981	\N	\N
5581	\N	1	\N	1	2025-11-25 06:00:59.523958	\N	\N
5582	\N	1	\N	1	2025-11-25 06:01:00.459438	\N	\N
5583	\N	1	\N	1	2025-11-25 06:01:01.367721	\N	\N
5584	\N	1	\N	1	2025-11-25 06:01:02.23645	\N	\N
5585	\N	1	\N	2	2025-11-25 07:03:28.810079	\N	\N
5586	\N	1	\N	2	2025-11-25 07:03:29.636703	\N	\N
5587	\N	1	\N	2	2025-11-25 07:03:30.642308	\N	\N
5588	\N	1	\N	2	2025-11-25 07:03:31.553396	\N	\N
5589	\N	1	\N	2	2025-11-25 07:03:32.459116	\N	\N
5590	\N	1	\N	2	2025-11-25 07:03:33.352702	\N	\N
5591	\N	1	\N	2	2025-11-25 07:03:34.192488	\N	\N
5592	\N	1	\N	2	2025-11-25 07:03:35.058576	\N	\N
5593	\N	1	\N	2	2025-11-25 07:03:35.889591	\N	\N
5594	\N	1	\N	2	2025-11-25 07:03:36.846917	\N	\N
5595	\N	1	\N	2	2025-11-25 07:03:37.741854	\N	\N
5596	\N	1	\N	1	2025-11-25 07:03:38.663151	\N	\N
5597	\N	1	\N	1	2025-11-25 07:03:39.614994	\N	\N
5598	\N	1	\N	1	2025-11-25 07:03:40.49705	\N	\N
5599	\N	1	\N	1	2025-11-25 07:03:41.364064	\N	\N
5600	\N	1	\N	1	2025-11-25 07:03:42.312846	\N	\N
5601	\N	1	\N	2	2025-11-25 07:52:12.35705	\N	\N
5602	\N	1	\N	2	2025-11-25 07:52:13.242187	\N	\N
5603	\N	1	\N	2	2025-11-25 07:52:14.092829	\N	\N
5604	\N	1	\N	2	2025-11-25 07:52:14.976555	\N	\N
5605	\N	1	\N	2	2025-11-25 07:52:15.890585	\N	\N
5606	\N	1	\N	2	2025-11-25 07:52:16.826357	\N	\N
5607	\N	1	\N	2	2025-11-25 07:52:17.806323	\N	\N
5608	\N	1	\N	2	2025-11-25 07:52:18.698859	\N	\N
5609	\N	1	\N	2	2025-11-25 07:52:19.599931	\N	\N
5610	\N	1	\N	2	2025-11-25 07:52:20.518107	\N	\N
5611	\N	1	\N	2	2025-11-25 07:52:21.466323	\N	\N
5612	\N	1	\N	2	2025-11-25 07:52:22.553445	\N	\N
5613	\N	1	\N	2	2025-11-25 07:52:23.515062	\N	\N
5614	\N	1	\N	2	2025-11-25 07:52:24.402343	\N	\N
5615	\N	1	\N	2	2025-11-25 07:52:25.350162	\N	\N
5616	\N	1	\N	2	2025-11-25 07:52:26.322417	\N	\N
5617	\N	1	\N	2	2025-11-25 07:52:27.264314	\N	\N
5618	\N	1	\N	1	2025-11-25 07:52:28.375002	\N	\N
5619	\N	1	\N	1	2025-11-25 07:52:29.364447	\N	\N
5620	\N	1	\N	1	2025-11-25 07:52:30.55582	\N	\N
5621	\N	1	\N	1	2025-11-25 07:52:31.856727	\N	\N
5622	\N	1	\N	1	2025-11-25 07:52:33.086542	\N	\N
5623	\N	1	\N	1	2025-11-25 07:52:34.07244	\N	\N
5624	\N	1	\N	1	2025-11-25 07:52:34.99896	\N	\N
5625	\N	1	\N	1	2025-11-25 07:52:35.908814	\N	\N
5626	\N	1	\N	1	2025-11-25 07:52:36.735614	\N	\N
5627	\N	1	\N	1	2025-11-25 07:52:37.591898	\N	\N
5628	\N	1	\N	1	2025-11-25 07:52:38.601748	\N	\N
5629	\N	1	\N	1	2025-11-25 07:52:39.554272	\N	\N
5630	\N	1	\N	1	2025-11-25 07:52:40.591102	\N	\N
5631	\N	1	\N	1	2025-11-25 07:52:41.865861	\N	\N
5632	\N	1	\N	2	2025-11-25 07:53:06.828331	\N	\N
5633	\N	1	\N	2	2025-11-25 07:53:07.731915	\N	\N
5634	\N	1	\N	2	2025-11-25 07:53:08.866869	\N	\N
5635	\N	1	\N	2	2025-11-25 07:53:09.795219	\N	\N
5636	\N	1	\N	2	2025-11-25 07:53:10.732598	\N	\N
5637	\N	1	\N	2	2025-11-25 07:53:11.824833	\N	\N
5638	\N	1	\N	2	2025-11-25 07:53:12.854501	\N	\N
5639	\N	1	\N	2	2025-11-25 07:53:13.811234	\N	\N
5640	\N	1	\N	2	2025-11-25 07:53:14.660378	\N	\N
5641	\N	1	\N	2	2025-11-25 07:53:15.679993	\N	\N
5642	\N	1	\N	2	2025-11-25 07:53:16.640278	\N	\N
5643	\N	1	\N	2	2025-11-25 07:53:17.511695	\N	\N
5644	\N	1	\N	2	2025-11-25 07:53:18.485329	\N	\N
5645	\N	1	\N	2	2025-11-25 07:53:19.420915	\N	\N
5646	\N	1	\N	2	2025-11-25 07:53:20.292636	\N	\N
5647	\N	1	\N	2	2025-11-25 07:53:21.275105	\N	\N
5648	\N	1	\N	2	2025-11-25 07:53:22.306744	\N	\N
5649	\N	1	\N	2	2025-11-25 07:53:23.162446	\N	\N
5650	\N	1	\N	2	2025-11-25 07:53:24.075187	\N	\N
5651	\N	1	\N	1	2025-11-25 07:53:25.151242	\N	\N
5652	\N	1	\N	1	2025-11-25 07:53:26.118557	\N	\N
5653	\N	1	\N	1	2025-11-25 07:53:27.141132	\N	\N
5654	\N	1	\N	1	2025-11-25 07:53:28.150901	\N	\N
5655	\N	1	\N	1	2025-11-25 07:53:29.063352	\N	\N
5656	\N	1	\N	1	2025-11-25 07:53:29.912265	\N	\N
5657	\N	1	\N	1	2025-11-25 07:53:30.793319	\N	\N
5658	\N	1	\N	2	2025-11-25 08:08:05.917823	\N	\N
5659	\N	1	\N	2	2025-11-25 08:08:06.440887	\N	\N
5660	\N	1	\N	2	2025-11-25 08:08:07.300655	\N	\N
5661	\N	1	\N	2	2025-11-25 08:08:08.206521	\N	\N
5662	\N	1	\N	2	2025-11-25 08:08:09.130058	\N	\N
5663	\N	1	\N	2	2025-11-25 08:08:09.963633	\N	\N
5664	\N	1	\N	2	2025-11-25 08:08:10.889427	\N	\N
5665	\N	1	\N	2	2025-11-25 08:08:11.789067	\N	\N
5666	\N	1	\N	2	2025-11-25 08:08:12.665895	\N	\N
5667	\N	1	\N	2	2025-11-25 08:08:13.507098	\N	\N
5668	\N	1	\N	2	2025-11-25 08:08:14.394534	\N	\N
5669	\N	1	\N	1	2025-11-25 08:08:15.2989	\N	\N
5670	\N	1	\N	1	2025-11-25 08:08:16.206415	\N	\N
5671	\N	1	\N	1	2025-11-25 08:08:17.107449	\N	\N
5672	\N	1	\N	1	2025-11-25 08:08:17.940617	\N	\N
5673	\N	1	\N	4	2025-11-25 08:08:36.443347	\N	\N
5674	\N	1	\N	4	2025-11-25 08:08:37.294993	\N	\N
5675	\N	1	\N	4	2025-11-25 08:08:38.185173	\N	\N
5676	\N	1	\N	4	2025-11-25 08:08:39.075969	\N	\N
5677	\N	1	\N	4	2025-11-25 08:08:39.993042	\N	\N
5678	\N	1	\N	3	2025-11-25 08:08:40.913259	\N	\N
5679	\N	1	\N	3	2025-11-25 08:08:41.828773	\N	\N
5680	\N	1	\N	2	2025-11-25 08:08:42.672626	\N	\N
5681	\N	1	\N	2	2025-11-25 08:08:43.642009	\N	\N
5682	\N	1	\N	3	2025-11-25 08:08:44.536719	\N	\N
5683	\N	1	\N	3	2025-11-25 08:08:45.447412	\N	\N
5684	\N	1	\N	2	2025-11-25 08:08:46.302144	\N	\N
5685	\N	1	\N	3	2025-11-25 08:08:47.245372	\N	\N
5686	\N	1	\N	3	2025-11-25 08:08:48.098446	\N	\N
5687	\N	1	\N	3	2025-11-25 08:08:48.981766	\N	\N
5688	\N	1	\N	3	2025-11-25 08:08:49.864458	\N	\N
5689	\N	1	\N	3	2025-11-25 08:08:50.819217	\N	\N
5690	\N	1	\N	2	2025-11-25 08:08:51.639926	\N	\N
5691	\N	1	\N	3	2025-11-25 08:08:52.497265	\N	\N
5692	\N	1	\N	2	2025-11-25 08:08:53.320715	\N	\N
5693	\N	1	\N	2	2025-11-25 08:08:54.169698	\N	\N
5694	\N	1	\N	2	2025-11-25 08:08:55.009236	\N	\N
5695	\N	1	\N	2	2025-11-25 08:08:55.876482	\N	\N
5696	\N	1	\N	2	2025-11-25 08:08:56.714332	\N	\N
5697	\N	1	\N	2	2025-11-25 08:08:57.584419	\N	\N
5698	\N	1	\N	2	2025-11-25 08:08:58.440528	\N	\N
5699	\N	1	\N	1	2025-11-25 08:08:59.349649	\N	\N
5700	\N	1	\N	1	2025-11-25 08:09:00.207511	\N	\N
5701	\N	1	\N	4	2025-11-25 08:13:39.765769	\N	\N
5702	\N	1	\N	4	2025-11-25 08:13:40.639177	\N	\N
5703	\N	1	\N	4	2025-11-25 08:13:41.522563	\N	\N
5704	\N	1	\N	4	2025-11-25 08:13:42.424636	\N	\N
5705	\N	1	\N	4	2025-11-25 08:13:43.287467	\N	\N
5706	\N	1	\N	3	2025-11-25 08:13:44.167673	\N	\N
5707	\N	1	\N	3	2025-11-25 08:13:45.059532	\N	\N
5708	\N	1	\N	2	2025-11-25 08:13:45.915806	\N	\N
5709	\N	1	\N	3	2025-11-25 08:13:46.759213	\N	\N
5710	\N	1	\N	2	2025-11-25 08:13:47.593052	\N	\N
5711	\N	1	\N	3	2025-11-25 08:13:48.44723	\N	\N
5712	\N	1	\N	3	2025-11-25 08:13:49.290549	\N	\N
5713	\N	1	\N	3	2025-11-25 08:13:50.143835	\N	\N
5714	\N	1	\N	3	2025-11-25 08:13:51.006612	\N	\N
5715	\N	1	\N	2	2025-11-25 08:13:51.854253	\N	\N
5716	\N	1	\N	2	2025-11-25 08:13:52.749839	\N	\N
5717	\N	1	\N	2	2025-11-25 08:13:53.606164	\N	\N
5718	\N	1	\N	2	2025-11-25 08:13:54.456487	\N	\N
5719	\N	1	\N	2	2025-11-25 08:13:55.356834	\N	\N
5720	\N	1	\N	2	2025-11-25 08:13:56.258423	\N	\N
5721	\N	1	\N	2	2025-11-25 08:13:57.105256	\N	\N
5722	\N	1	\N	1	2025-11-25 08:13:57.986727	\N	\N
5723	\N	1	\N	4	2025-11-25 08:14:09.402129	\N	\N
5724	\N	1	\N	4	2025-11-25 08:14:10.264449	\N	\N
5725	\N	1	\N	4	2025-11-25 08:14:11.109373	\N	\N
5726	\N	1	\N	4	2025-11-25 08:14:11.988996	\N	\N
5727	\N	1	\N	4	2025-11-25 08:14:12.890086	\N	\N
5728	\N	1	\N	3	2025-11-25 08:14:13.786691	\N	\N
5729	\N	1	\N	2	2025-11-25 08:14:14.634328	\N	\N
5730	\N	1	\N	3	2025-11-25 08:14:15.557417	\N	\N
5731	\N	1	\N	3	2025-11-25 08:14:16.434105	\N	\N
5732	\N	1	\N	3	2025-11-25 08:14:17.301696	\N	\N
5733	\N	1	\N	3	2025-11-25 08:14:18.172061	\N	\N
5734	\N	1	\N	3	2025-11-25 08:14:19.022196	\N	\N
5735	\N	1	\N	3	2025-11-25 08:14:19.863308	\N	\N
5736	\N	1	\N	3	2025-11-25 08:14:20.720588	\N	\N
5737	\N	1	\N	2	2025-11-25 08:14:21.596476	\N	\N
5738	\N	1	\N	3	2025-11-25 08:14:22.499474	\N	\N
5739	\N	1	\N	2	2025-11-25 08:14:23.465116	\N	\N
5740	\N	1	\N	2	2025-11-25 08:14:24.417216	\N	\N
5741	\N	1	\N	2	2025-11-25 08:14:25.269347	\N	\N
5742	\N	1	\N	2	2025-11-25 08:14:26.152639	\N	\N
5743	\N	1	\N	2	2025-11-25 08:14:27.07368	\N	\N
5744	\N	1	\N	2	2025-11-25 08:14:28.052081	\N	\N
5745	\N	1	\N	2	2025-11-25 08:14:28.984337	\N	\N
5746	\N	1	\N	2	2025-11-25 08:14:30.05562	\N	\N
5747	\N	1	\N	2	2025-11-25 08:14:30.94408	\N	\N
5748	\N	1	\N	2	2025-11-25 08:14:31.851359	\N	\N
5749	\N	1	\N	1	2025-11-25 08:14:32.760195	\N	\N
5750	\N	1	\N	1	2025-11-25 08:14:33.676056	\N	\N
5751	\N	1	\N	4	2025-11-25 08:14:44.217764	\N	\N
5752	\N	1	\N	4	2025-11-25 08:14:45.045808	\N	\N
5753	\N	1	\N	4	2025-11-25 08:14:45.949681	\N	\N
5754	\N	1	\N	4	2025-11-25 08:14:46.833315	\N	\N
5755	\N	1	\N	4	2025-11-25 08:14:47.754247	\N	\N
5756	\N	1	\N	4	2025-11-25 08:14:48.686153	\N	\N
5757	\N	1	\N	3	2025-11-25 08:14:49.519994	\N	\N
5758	\N	1	\N	3	2025-11-25 08:14:50.443979	\N	\N
5759	\N	1	\N	2	2025-11-25 08:14:51.308239	\N	\N
5760	\N	1	\N	3	2025-11-25 08:14:52.199672	\N	\N
5761	\N	1	\N	2	2025-11-25 08:14:53.130673	\N	\N
5762	\N	1	\N	3	2025-11-25 08:14:54.011399	\N	\N
5763	\N	1	\N	3	2025-11-25 08:14:54.850604	\N	\N
5764	\N	1	\N	3	2025-11-25 08:14:55.683776	\N	\N
5765	\N	1	\N	3	2025-11-25 08:14:56.54287	\N	\N
5766	\N	1	\N	2	2025-11-25 08:14:57.400446	\N	\N
5767	\N	1	\N	2	2025-11-25 08:14:58.241828	\N	\N
5768	\N	1	\N	2	2025-11-25 08:14:59.092149	\N	\N
5769	\N	1	\N	2	2025-11-25 08:15:00.008612	\N	\N
5770	\N	1	\N	2	2025-11-25 08:15:00.842688	\N	\N
5771	\N	1	\N	2	2025-11-25 08:15:01.729824	\N	\N
5772	\N	1	\N	2	2025-11-25 08:15:02.641715	\N	\N
5773	\N	1	\N	2	2025-11-25 08:15:03.540034	\N	\N
5774	\N	1	\N	1	2025-11-25 08:15:04.381981	\N	\N
5775	\N	1	\N	4	2025-11-25 08:15:17.450957	\N	\N
5776	\N	1	\N	4	2025-11-25 08:15:18.308629	\N	\N
5777	\N	1	\N	4	2025-11-25 08:15:19.173328	\N	\N
5778	\N	1	\N	4	2025-11-25 08:15:20.091193	\N	\N
5779	\N	1	\N	4	2025-11-25 08:15:21.013894	\N	\N
5780	\N	1	\N	3	2025-11-25 08:15:21.958884	\N	\N
5781	\N	1	\N	2	2025-11-25 08:15:22.870585	\N	\N
5782	\N	1	\N	2	2025-11-25 08:15:23.745262	\N	\N
5783	\N	1	\N	3	2025-11-25 08:15:24.571219	\N	\N
5784	\N	1	\N	3	2025-11-25 08:15:25.666579	\N	\N
5785	\N	1	\N	2	2025-11-25 08:15:26.714896	\N	\N
5786	\N	1	\N	3	2025-11-25 08:15:27.665109	\N	\N
5787	\N	1	\N	3	2025-11-25 08:15:28.562295	\N	\N
5788	\N	1	\N	3	2025-11-25 08:15:29.46088	\N	\N
5789	\N	1	\N	3	2025-11-25 08:15:30.30153	\N	\N
5790	\N	1	\N	3	2025-11-25 08:15:31.266998	\N	\N
5791	\N	1	\N	3	2025-11-25 08:15:32.225005	\N	\N
5792	\N	1	\N	3	2025-11-25 08:15:33.070059	\N	\N
5793	\N	1	\N	2	2025-11-25 08:15:33.989182	\N	\N
5794	\N	1	\N	3	2025-11-25 08:15:34.886329	\N	\N
5795	\N	1	\N	2	2025-11-25 08:15:35.71839	\N	\N
5796	\N	1	\N	2	2025-11-25 08:15:36.628067	\N	\N
5797	\N	1	\N	2	2025-11-25 08:15:37.468482	\N	\N
5798	\N	1	\N	2	2025-11-25 08:15:38.299754	\N	\N
5799	\N	1	\N	2	2025-11-25 08:15:39.211344	\N	\N
5800	\N	1	\N	4	2025-11-25 08:17:32.665253	\N	\N
5801	\N	1	\N	4	2025-11-25 08:17:33.642655	\N	\N
5802	\N	1	\N	4	2025-11-25 08:17:34.493099	\N	\N
5803	\N	1	\N	4	2025-11-25 08:17:35.40087	\N	\N
5804	\N	1	\N	4	2025-11-25 08:17:36.309965	\N	\N
5805	\N	1	\N	4	2025-11-25 08:17:37.228242	\N	\N
5806	\N	1	\N	4	2025-11-25 08:17:38.090812	\N	\N
5807	\N	1	\N	2	2025-11-25 08:17:38.947746	\N	\N
5808	\N	1	\N	3	2025-11-25 08:17:39.830506	\N	\N
5809	\N	1	\N	2	2025-11-25 08:17:40.890672	\N	\N
5810	\N	1	\N	2	2025-11-25 08:17:41.754087	\N	\N
5811	\N	1	\N	3	2025-11-25 08:17:42.730665	\N	\N
5812	\N	1	\N	2	2025-11-25 08:17:43.584775	\N	\N
5813	\N	1	\N	3	2025-11-25 08:17:44.431756	\N	\N
5814	\N	1	\N	3	2025-11-25 08:17:45.31989	\N	\N
5815	\N	1	\N	3	2025-11-25 08:17:46.270268	\N	\N
5816	\N	1	\N	4	2025-11-25 08:17:52.002971	\N	\N
5817	\N	1	\N	4	2025-11-25 08:17:52.931484	\N	\N
5818	\N	1	\N	4	2025-11-25 08:17:53.796808	\N	\N
5819	\N	1	\N	4	2025-11-25 08:17:54.700409	\N	\N
5820	\N	1	\N	4	2025-11-25 08:17:55.606221	\N	\N
5821	\N	1	\N	4	2025-11-25 08:17:56.461561	\N	\N
5822	\N	1	\N	3	2025-11-25 08:17:57.386636	\N	\N
5823	\N	1	\N	3	2025-11-25 08:17:58.300262	\N	\N
5824	\N	1	\N	2	2025-11-25 08:17:59.228889	\N	\N
5825	\N	1	\N	3	2025-11-25 08:18:00.237462	\N	\N
5826	\N	1	\N	3	2025-11-25 08:18:01.084156	\N	\N
5827	\N	1	\N	2	2025-11-25 08:18:02.125583	\N	\N
5828	\N	1	\N	3	2025-11-25 08:18:03.002879	\N	\N
5829	\N	1	\N	3	2025-11-25 08:18:03.872285	\N	\N
5830	\N	1	\N	3	2025-11-25 08:18:04.71824	\N	\N
5831	\N	1	\N	3	2025-11-25 08:18:05.798812	\N	\N
5832	\N	1	\N	3	2025-11-25 08:18:06.743947	\N	\N
5833	\N	1	\N	3	2025-11-25 08:18:07.617407	\N	\N
5834	\N	1	\N	3	2025-11-25 08:18:08.563581	\N	\N
5835	\N	1	\N	3	2025-11-25 08:18:09.42166	\N	\N
5836	\N	1	\N	4	2025-11-25 08:18:10.122154	\N	\N
5837	\N	1	\N	2	2025-11-25 08:18:10.284858	\N	\N
5838	\N	1	\N	4	2025-11-25 08:18:11.044392	\N	\N
5839	\N	1	\N	2	2025-11-25 08:18:11.348038	\N	\N
5840	\N	1	\N	4	2025-11-25 08:18:11.969375	\N	\N
5841	\N	1	\N	2	2025-11-25 08:18:12.189619	\N	\N
5842	\N	1	\N	4	2025-11-25 08:18:12.851001	\N	\N
5843	\N	1	\N	2	2025-11-25 08:18:13.060001	\N	\N
5844	\N	1	\N	4	2025-11-25 08:18:13.724506	\N	\N
5845	\N	1	\N	2	2025-11-25 08:18:13.936598	\N	\N
5846	\N	1	\N	4	2025-11-25 08:18:14.742091	\N	\N
5847	\N	1	\N	2	2025-11-25 08:18:15.057471	\N	\N
5848	\N	1	\N	2	2025-11-25 08:18:15.955778	\N	\N
5849	\N	1	\N	2	2025-11-25 08:18:16.790884	\N	\N
5850	\N	1	\N	2	2025-11-25 08:18:17.825696	\N	\N
5851	\N	1	\N	2	2025-11-25 08:18:18.866984	\N	\N
5852	\N	1	\N	2	2025-11-25 08:18:19.878543	\N	\N
5853	\N	1	\N	1	2025-11-25 08:18:22.952077	\N	\N
5854	\N	1	\N	1	2025-11-25 08:18:25.705395	\N	\N
5855	\N	1	\N	1	2025-11-25 08:18:27.110518	\N	\N
5856	\N	1	\N	1	2025-11-25 08:18:27.945461	\N	\N
5857	\N	1	\N	1	2025-11-25 08:18:29.19325	\N	\N
5858	\N	1	\N	1	2025-11-25 08:18:30.14425	\N	\N
5859	\N	1	\N	4	2025-11-25 08:18:44.65992	\N	\N
5860	\N	1	\N	4	2025-11-25 08:18:45.494975	\N	\N
5861	\N	1	\N	4	2025-11-25 08:18:46.576863	\N	\N
5862	\N	1	\N	4	2025-11-25 08:18:47.451454	\N	\N
5863	\N	1	\N	4	2025-11-25 08:18:48.485196	\N	\N
5864	\N	1	\N	4	2025-11-25 08:18:49.516253	\N	\N
5865	\N	1	\N	4	2025-11-25 08:18:50.456979	\N	\N
5866	\N	1	\N	3	2025-11-25 08:18:51.305516	\N	\N
5867	\N	1	\N	2	2025-11-25 08:18:52.336836	\N	\N
5868	\N	1	\N	3	2025-11-25 08:18:53.260966	\N	\N
5869	\N	1	\N	3	2025-11-25 08:18:54.098767	\N	\N
5870	\N	1	\N	2	2025-11-25 08:18:55.016674	\N	\N
5871	\N	1	\N	2	2025-11-25 08:18:55.89287	\N	\N
5872	\N	1	\N	3	2025-11-25 08:18:56.846622	\N	\N
5873	\N	1	\N	3	2025-11-25 08:18:57.798288	\N	\N
5874	\N	1	\N	2	2025-11-25 08:18:58.729299	\N	\N
5875	\N	1	\N	3	2025-11-25 08:18:59.651752	\N	\N
5876	\N	1	\N	3	2025-11-25 08:19:00.483088	\N	\N
5877	\N	1	\N	3	2025-11-25 08:19:01.4103	\N	\N
5878	\N	1	\N	3	2025-11-25 08:19:02.435592	\N	\N
5879	\N	1	\N	3	2025-11-25 08:19:03.314615	\N	\N
5880	\N	1	\N	3	2025-11-25 08:19:04.202556	\N	\N
5881	\N	1	\N	3	2025-11-25 08:19:05.103905	\N	\N
5882	\N	1	\N	3	2025-11-25 08:19:05.969059	\N	\N
5883	\N	1	\N	2	2025-11-25 08:19:06.858956	\N	\N
5884	\N	1	\N	2	2025-11-25 08:19:07.758453	\N	\N
5885	\N	1	\N	2	2025-11-25 08:19:08.696121	\N	\N
5886	\N	1	\N	2	2025-11-25 08:19:09.638986	\N	\N
5887	\N	1	\N	2	2025-11-25 08:19:10.689896	\N	\N
5888	\N	1	\N	2	2025-11-25 08:19:11.645025	\N	\N
5889	\N	1	\N	2	2025-11-25 08:19:12.595403	\N	\N
5890	\N	1	\N	2	2025-11-25 08:19:13.48276	\N	\N
5891	\N	1	\N	2	2025-11-25 08:19:14.399699	\N	\N
5892	\N	1	\N	2	2025-11-25 08:19:15.336013	\N	\N
5893	\N	1	\N	1	2025-11-25 08:19:16.169183	\N	\N
5894	\N	1	\N	2	2025-11-25 08:30:47.470022	\N	\N
5895	\N	1	\N	2	2025-11-25 08:30:48.41782	\N	\N
5896	\N	1	\N	2	2025-11-25 08:30:49.388855	\N	\N
5897	\N	1	\N	2	2025-11-25 08:30:50.267199	\N	\N
5898	\N	1	\N	2	2025-11-25 08:30:51.181327	\N	\N
5899	\N	1	\N	2	2025-11-25 08:30:52.07393	\N	\N
5900	\N	1	\N	2	2025-11-25 08:30:53.306123	\N	\N
5901	\N	1	\N	2	2025-11-25 08:30:54.302628	\N	\N
5902	\N	1	\N	2	2025-11-25 08:30:55.293578	\N	\N
5903	\N	1	\N	2	2025-11-25 08:30:56.396267	\N	\N
5904	\N	1	\N	2	2025-11-25 08:30:57.718611	\N	\N
5905	\N	1	\N	2	2025-11-25 08:30:59.097077	\N	\N
5906	\N	1	\N	2	2025-11-25 08:31:00.050233	\N	\N
5907	\N	1	\N	2	2025-11-25 08:31:01.042106	\N	\N
5908	\N	1	\N	2	2025-11-25 08:31:01.991039	\N	\N
5909	\N	1	\N	2	2025-11-25 08:31:02.959876	\N	\N
5910	\N	1	\N	2	2025-11-25 08:31:03.822121	\N	\N
5911	\N	1	\N	2	2025-11-25 08:31:04.793036	\N	\N
5912	\N	1	\N	1	2025-11-25 08:31:06.00613	\N	\N
5913	\N	1	\N	1	2025-11-25 08:31:06.875661	\N	\N
5914	\N	1	\N	1	2025-11-25 08:31:07.859331	\N	\N
5915	\N	1	\N	1	2025-11-25 08:31:08.809067	\N	\N
5916	\N	1	\N	1	2025-11-25 08:31:09.681647	\N	\N
5917	\N	1	\N	1	2025-11-25 08:31:10.516907	\N	\N
5918	\N	1	\N	1	2025-11-25 08:31:11.486349	\N	\N
5919	\N	1	\N	1	2025-11-25 08:31:12.433056	\N	\N
5920	\N	1	\N	1	2025-11-25 08:31:13.272216	\N	\N
5921	\N	1	\N	1	2025-11-25 08:31:14.231642	\N	\N
5922	\N	1	\N	1	2025-11-25 08:31:15.073664	\N	\N
5923	\N	1	\N	1	2025-11-25 08:31:15.9601	\N	\N
5924	\N	1	\N	1	2025-11-25 08:31:16.818906	\N	\N
5925	\N	1	\N	4	2025-11-25 08:31:17.518703	\N	\N
5926	\N	1	\N	1	2025-11-25 08:31:17.764792	\N	\N
5927	\N	1	\N	4	2025-11-25 08:31:18.445382	\N	\N
5928	\N	1	\N	1	2025-11-25 08:31:18.661588	\N	\N
5929	\N	1	\N	4	2025-11-25 08:31:19.351855	\N	\N
5930	\N	1	\N	1	2025-11-25 08:31:19.552396	\N	\N
5931	\N	1	\N	4	2025-11-25 08:31:20.322242	\N	\N
5932	\N	1	\N	1	2025-11-25 08:31:20.464687	\N	\N
5933	\N	1	\N	4	2025-11-25 08:31:21.329439	\N	\N
5934	\N	1	\N	1	2025-11-25 08:31:21.383566	\N	\N
5935	\N	1	\N	4	2025-11-25 08:31:22.183203	\N	\N
5936	\N	1	\N	1	2025-11-25 08:31:22.309272	\N	\N
5937	\N	1	\N	4	2025-11-25 08:31:23.237508	\N	\N
5938	\N	1	\N	1	2025-11-25 08:31:23.353721	\N	\N
5939	\N	1	\N	4	2025-11-25 08:31:24.140229	\N	\N
5940	\N	1	\N	3	2025-11-25 08:31:24.941933	\N	\N
5941	\N	1	\N	3	2025-11-25 08:31:25.870884	\N	\N
5942	\N	1	\N	2	2025-11-25 08:31:26.748736	\N	\N
5943	\N	1	\N	3	2025-11-25 08:31:27.608963	\N	\N
5944	\N	1	\N	3	2025-11-25 08:31:28.529205	\N	\N
5945	\N	1	\N	2	2025-11-25 08:31:29.603903	\N	\N
5946	\N	1	\N	3	2025-11-25 08:31:30.500631	\N	\N
5947	\N	1	\N	3	2025-11-25 08:31:31.589421	\N	\N
5948	\N	1	\N	3	2025-11-25 08:31:32.424492	\N	\N
5949	\N	1	\N	3	2025-11-25 08:31:33.384553	\N	\N
5950	\N	1	\N	3	2025-11-25 08:31:34.264167	\N	\N
5951	\N	1	\N	3	2025-11-25 08:31:35.17572	\N	\N
5952	\N	1	\N	3	2025-11-25 08:31:36.031335	\N	\N
5953	\N	1	\N	2	2025-11-25 08:31:36.985014	\N	\N
5954	\N	1	\N	2	2025-11-25 08:31:37.837715	\N	\N
5955	\N	1	\N	2	2025-11-25 08:31:38.701128	\N	\N
5956	\N	1	\N	2	2025-11-25 08:31:39.60404	\N	\N
5957	\N	1	\N	2	2025-11-25 08:31:40.445982	\N	\N
5958	\N	1	\N	2	2025-11-25 08:31:41.319429	\N	\N
5959	\N	1	\N	2	2025-11-25 08:31:42.210994	\N	\N
5960	\N	1	\N	2	2025-11-25 08:31:43.068991	\N	\N
5961	\N	1	\N	1	2025-11-25 08:31:44.041309	\N	\N
5962	\N	1	\N	1	2025-11-25 08:31:44.91887	\N	\N
5963	\N	1	\N	1	2025-11-25 08:31:45.928027	\N	\N
5964	\N	1	\N	4	2025-11-25 08:35:00.196199	\N	\N
5965	\N	1	\N	4	2025-11-25 08:35:01.164372	\N	\N
5966	\N	1	\N	4	2025-11-25 08:35:02.017984	\N	\N
5967	\N	1	\N	4	2025-11-25 08:35:02.891758	\N	\N
5968	\N	1	\N	4	2025-11-25 08:35:03.782005	\N	\N
5969	\N	1	\N	4	2025-11-25 08:35:04.704703	\N	\N
5970	\N	1	\N	4	2025-11-25 08:35:05.917673	\N	\N
5971	\N	1	\N	2	2025-11-25 08:35:13.06009	\N	\N
5972	\N	1	\N	2	2025-11-25 08:35:13.897944	\N	\N
5973	\N	1	\N	2	2025-11-25 08:35:14.740591	\N	\N
5974	\N	1	\N	2	2025-11-25 08:35:15.728698	\N	\N
5975	\N	1	\N	2	2025-11-25 08:35:16.666744	\N	\N
5976	\N	1	\N	2	2025-11-25 08:35:17.68771	\N	\N
5977	\N	1	\N	2	2025-11-25 08:35:18.611004	\N	\N
5978	\N	1	\N	2	2025-11-25 08:35:19.532873	\N	\N
5979	\N	1	\N	2	2025-11-25 08:35:20.503989	\N	\N
5980	\N	1	\N	2	2025-11-25 08:35:22.009786	\N	\N
5981	\N	1	\N	2	2025-11-25 08:35:23.262551	\N	\N
5982	\N	1	\N	2	2025-11-25 08:35:24.236354	\N	\N
5983	\N	1	\N	2	2025-11-25 08:35:25.396325	\N	\N
5984	\N	1	\N	2	2025-11-25 08:35:26.692711	\N	\N
5985	\N	1	\N	2	2025-11-25 08:35:27.724796	\N	\N
5986	\N	1	\N	2	2025-11-25 08:35:28.560656	\N	\N
5987	\N	1	\N	2	2025-11-25 08:35:29.397033	\N	\N
5988	\N	1	\N	2	2025-11-25 08:35:31.65548	\N	\N
5989	\N	1	\N	2	2025-11-25 08:35:32.605657	\N	\N
5990	\N	1	\N	2	2025-11-25 08:35:33.514608	\N	\N
5991	\N	1	\N	2	2025-11-25 08:35:34.460377	\N	\N
5992	\N	1	\N	1	2025-11-25 08:35:35.750966	\N	\N
5993	\N	1	\N	1	2025-11-25 08:35:36.63261	\N	\N
5994	\N	1	\N	1	2025-11-25 08:35:37.80987	\N	\N
5995	\N	1	\N	4	2025-11-25 08:35:38.251372	\N	\N
5996	\N	1	\N	1	2025-11-25 08:35:38.722101	\N	\N
5997	\N	1	\N	4	2025-11-25 08:35:39.104987	\N	\N
5998	\N	1	\N	4	2025-11-25 08:35:39.949999	\N	\N
5999	\N	1	\N	1	2025-11-25 08:35:40.328783	\N	\N
6000	\N	1	\N	4	2025-11-25 08:35:41.01581	\N	\N
6001	\N	1	\N	1	2025-11-25 08:35:41.501256	\N	\N
6002	\N	1	\N	4	2025-11-25 08:35:41.865337	\N	\N
6003	\N	1	\N	1	2025-11-25 08:35:42.617445	\N	\N
6004	\N	1	\N	4	2025-11-25 08:35:42.956237	\N	\N
6005	\N	1	\N	1	2025-11-25 08:35:43.779532	\N	\N
6006	\N	1	\N	4	2025-11-25 08:35:43.950473	\N	\N
6007	\N	1	\N	1	2025-11-25 08:35:44.663091	\N	\N
6008	\N	1	\N	4	2025-11-25 08:35:45.088847	\N	\N
6009	\N	1	\N	1	2025-11-25 08:35:45.498683	\N	\N
6010	\N	1	\N	4	2025-11-25 08:35:45.998235	\N	\N
6011	\N	1	\N	1	2025-11-25 08:35:46.572085	\N	\N
6012	\N	1	\N	4	2025-11-25 08:35:46.968013	\N	\N
6013	\N	1	\N	1	2025-11-25 08:35:47.974884	\N	\N
6014	\N	1	\N	4	2025-11-25 08:35:48.431091	\N	\N
6015	\N	1	\N	1	2025-11-25 08:35:49.052061	\N	\N
6016	\N	1	\N	4	2025-11-25 08:35:49.286318	\N	\N
6017	\N	1	\N	1	2025-11-25 08:35:50.010258	\N	\N
6018	\N	1	\N	4	2025-11-25 08:35:50.155442	\N	\N
6019	\N	1	\N	1	2025-11-25 08:35:51.10604	\N	\N
6020	\N	1	\N	4	2025-11-25 08:35:51.428128	\N	\N
6021	\N	1	\N	1	2025-11-25 08:35:52.095884	\N	\N
6022	\N	1	\N	4	2025-11-25 08:35:52.257958	\N	\N
6023	\N	1	\N	1	2025-11-25 08:35:53.188849	\N	\N
6024	\N	1	\N	4	2025-11-25 08:35:53.433887	\N	\N
6025	\N	1	\N	1	2025-11-25 08:35:54.071625	\N	\N
6026	\N	1	\N	4	2025-11-25 08:35:54.438805	\N	\N
6027	\N	1	\N	1	2025-11-25 08:35:54.933646	\N	\N
6028	\N	1	\N	2	2025-11-25 08:35:55.57155	\N	\N
6029	\N	1	\N	1	2025-11-25 08:35:55.866198	\N	\N
6030	\N	1	\N	3	2025-11-25 08:35:56.681515	\N	\N
6031	\N	1	\N	1	2025-11-25 08:35:56.792229	\N	\N
6032	\N	1	\N	3	2025-11-25 08:35:57.721614	\N	\N
6033	\N	1	\N	1	2025-11-25 08:35:57.821506	\N	\N
6034	\N	1	\N	1	2025-11-25 08:35:58.775984	\N	\N
6035	\N	1	\N	1	2025-11-25 08:35:59.608039	\N	\N
6036	\N	1	\N	3	2025-11-25 08:36:00.309321	\N	\N
6037	\N	1	\N	1	2025-11-25 08:36:00.473088	\N	\N
6038	\N	1	\N	3	2025-11-25 08:36:00.686841	\N	\N
6039	\N	1	\N	1	2025-11-25 08:36:01.44025	\N	\N
6040	\N	1	\N	2	2025-11-25 08:36:01.661394	\N	\N
6041	\N	1	\N	1	2025-11-25 08:36:02.304304	\N	\N
6042	\N	1	\N	3	2025-11-25 08:36:02.570024	\N	\N
6043	\N	1	\N	1	2025-11-25 08:36:03.233149	\N	\N
6044	\N	1	\N	3	2025-11-25 08:36:03.527615	\N	\N
6045	\N	1	\N	1	2025-11-25 08:36:04.220653	\N	\N
6046	\N	1	\N	3	2025-11-25 08:36:04.387242	\N	\N
6047	\N	1	\N	1	2025-11-25 08:36:05.197154	\N	\N
6048	\N	1	\N	2	2025-11-25 08:36:05.318391	\N	\N
6049	\N	1	\N	1	2025-11-25 08:36:06.014975	\N	\N
6050	\N	1	\N	3	2025-11-25 08:36:06.196344	\N	\N
6051	\N	1	\N	1	2025-11-25 08:36:06.949009	\N	\N
6052	\N	1	\N	3	2025-11-25 08:36:07.128778	\N	\N
6053	\N	1	\N	3	2025-11-25 08:36:08.000802	\N	\N
6054	\N	1	\N	3	2025-11-25 08:36:08.839878	\N	\N
6055	\N	1	\N	3	2025-11-25 08:36:09.678371	\N	\N
6056	\N	1	\N	2	2025-11-25 08:36:10.5663	\N	\N
6057	\N	1	\N	2	2025-11-25 08:36:11.445757	\N	\N
6058	\N	1	\N	2	2025-11-25 08:36:12.308834	\N	\N
6059	\N	1	\N	4	2025-11-25 08:43:14.989673	\N	\N
6060	\N	1	\N	4	2025-11-25 08:43:15.854398	\N	\N
6061	\N	1	\N	4	2025-11-25 08:43:16.70543	\N	\N
6062	\N	1	\N	4	2025-11-25 08:43:17.574254	\N	\N
6063	\N	1	\N	4	2025-11-25 08:43:18.446797	\N	\N
6064	\N	1	\N	4	2025-11-25 08:43:19.3056	\N	\N
6065	\N	1	\N	3	2025-11-25 08:43:20.193504	\N	\N
6066	\N	1	\N	3	2025-11-25 08:43:21.084652	\N	\N
6067	\N	1	\N	2	2025-11-25 08:43:21.959872	\N	\N
6068	\N	1	\N	3	2025-11-25 08:43:22.899407	\N	\N
6069	\N	1	\N	3	2025-11-25 08:43:23.745991	\N	\N
6070	\N	1	\N	2	2025-11-25 08:43:24.620459	\N	\N
6071	\N	1	\N	3	2025-11-25 08:43:25.535924	\N	\N
6072	\N	1	\N	3	2025-11-25 08:43:26.341949	\N	\N
6073	\N	1	\N	4	2025-11-25 09:09:50.170557	\N	\N
6074	\N	1	\N	4	2025-11-25 09:09:51.153482	\N	\N
6075	\N	1	\N	4	2025-11-25 09:09:52.415865	\N	\N
6076	\N	1	\N	4	2025-11-25 09:09:53.499161	\N	\N
6077	\N	1	\N	4	2025-11-25 09:09:54.818442	\N	\N
6078	\N	1	\N	4	2025-11-25 09:09:55.798891	\N	\N
6079	\N	1	\N	4	2025-11-25 09:09:56.606768	\N	\N
6080	\N	1	\N	4	2025-11-25 09:09:58.718233	\N	\N
6081	\N	1	\N	4	2025-11-25 09:10:01.05298	\N	\N
6082	\N	1	\N	4	2025-11-25 09:10:02.041359	\N	\N
6083	\N	1	\N	4	2025-11-25 09:10:02.795244	\N	\N
6084	\N	1	\N	0	2025-11-25 09:10:14.053588	\N	\N
6085	\N	1	\N	0	2025-11-25 09:10:14.905156	\N	\N
6086	\N	1	\N	0	2025-11-25 09:10:15.835095	\N	\N
6087	\N	1	\N	0	2025-11-25 09:10:16.686821	\N	\N
6088	\N	1	\N	0	2025-11-25 09:10:17.565803	\N	\N
6089	\N	1	\N	0	2025-11-25 09:10:18.528775	\N	\N
6090	\N	1	\N	0	2025-11-25 09:10:19.448423	\N	\N
6091	\N	1	\N	0	2025-11-25 09:10:20.387244	\N	\N
6092	\N	1	\N	0	2025-11-25 09:10:21.251415	\N	\N
6093	\N	1	\N	0	2025-11-25 09:10:22.157815	\N	\N
6094	\N	1	\N	0	2025-11-25 09:10:22.999805	\N	\N
6095	\N	1	\N	1	2025-11-25 09:10:23.913677	\N	\N
6096	\N	1	\N	1	2025-11-25 09:10:24.752861	\N	\N
6097	\N	1	\N	0	2025-11-25 09:10:25.600196	\N	\N
6098	\N	1	\N	0	2025-11-25 09:10:26.376545	\N	\N
6099	\N	1	\N	1	2025-11-25 09:10:27.306723	\N	\N
6100	\N	1	\N	1	2025-11-25 09:10:28.173385	\N	\N
6101	\N	1	\N	1	2025-11-25 09:10:29.026389	\N	\N
6102	\N	1	\N	1	2025-11-25 09:10:29.918883	\N	\N
6103	\N	1	\N	1	2025-11-25 09:10:30.794985	\N	\N
6104	\N	1	\N	2	2025-11-25 09:10:31.65292	\N	\N
6105	\N	1	\N	2	2025-11-25 09:10:32.494053	\N	\N
6106	\N	1	\N	3	2025-11-25 09:10:33.388455	\N	\N
6107	\N	1	\N	2	2025-11-25 09:10:34.284693	\N	\N
6108	\N	1	\N	2	2025-11-25 09:10:35.173439	\N	\N
6109	\N	1	\N	2	2025-11-25 09:10:36.014126	\N	\N
6110	\N	1	\N	2	2025-11-25 09:10:36.926106	\N	\N
6111	\N	1	\N	2	2025-11-25 09:10:37.845967	\N	\N
6112	\N	1	\N	3	2025-11-25 09:10:38.772958	\N	\N
6113	\N	1	\N	3	2025-11-25 09:10:39.69123	\N	\N
6114	\N	1	\N	3	2025-11-25 09:10:40.589513	\N	\N
6115	\N	1	\N	3	2025-11-25 09:10:41.425128	\N	\N
6116	\N	1	\N	2	2025-11-25 09:10:42.298254	\N	\N
6117	\N	1	\N	3	2025-11-25 09:10:43.214866	\N	\N
6118	\N	1	\N	2	2025-11-25 09:10:44.108517	\N	\N
6119	\N	1	\N	1	2025-11-25 09:10:44.952097	\N	\N
6120	\N	1	\N	1	2025-11-25 09:10:45.761704	\N	\N
6121	\N	1	\N	1	2025-11-25 09:10:46.688269	\N	\N
6122	\N	1	\N	1	2025-11-25 09:10:47.538071	\N	\N
6123	\N	1	\N	1	2025-11-25 09:10:48.447213	\N	\N
6124	\N	1	\N	1	2025-11-25 09:10:49.306251	\N	\N
6125	\N	1	\N	2	2025-11-25 09:10:50.317769	\N	\N
6126	\N	1	\N	2	2025-11-25 09:10:51.245281	\N	\N
6127	\N	1	\N	3	2025-11-25 09:10:52.622839	\N	\N
6128	\N	1	\N	2	2025-11-25 09:10:53.696417	\N	\N
6129	\N	1	\N	2	2025-11-25 09:10:54.572635	\N	\N
6130	\N	1	\N	2	2025-11-25 09:10:55.478437	\N	\N
6131	\N	1	\N	2	2025-11-25 09:10:56.429738	\N	\N
6132	\N	1	\N	3	2025-11-25 09:10:57.333544	\N	\N
6133	\N	1	\N	2	2025-11-25 09:10:58.285929	\N	\N
6134	\N	1	\N	3	2025-11-25 09:10:59.173752	\N	\N
6135	\N	1	\N	2	2025-11-25 09:11:00.025982	\N	\N
6136	\N	1	\N	3	2025-11-25 09:11:01.011053	\N	\N
6137	\N	1	\N	2	2025-11-25 09:11:01.986901	\N	\N
6138	\N	1	\N	1	2025-11-25 09:11:02.870013	\N	\N
6139	\N	1	\N	2	2025-11-25 09:11:03.818469	\N	\N
6140	\N	1	\N	1	2025-11-25 09:11:04.731799	\N	\N
6141	\N	1	\N	2	2025-11-25 09:11:05.602987	\N	\N
6142	\N	1	\N	1	2025-11-25 09:11:06.531459	\N	\N
6143	\N	1	\N	1	2025-11-25 09:11:07.426187	\N	\N
6144	\N	1	\N	1	2025-11-25 09:11:08.333913	\N	\N
6145	\N	1	\N	0	2025-11-25 09:11:09.730971	\N	\N
6146	\N	1	\N	0	2025-11-25 09:11:10.199468	\N	\N
6147	\N	1	\N	1	2025-11-25 09:11:11.11406	\N	\N
6148	\N	1	\N	1	2025-11-25 09:11:12.039202	\N	\N
6149	\N	1	\N	1	2025-11-25 09:11:13.030694	\N	\N
6150	\N	1	\N	1	2025-11-25 09:11:13.92285	\N	\N
6151	\N	1	\N	1	2025-11-25 09:11:14.887016	\N	\N
6152	\N	1	\N	1	2025-11-25 09:11:15.816019	\N	\N
6153	\N	1	\N	1	2025-11-25 09:11:16.69046	\N	\N
6154	\N	1	\N	1	2025-11-25 09:11:17.518331	\N	\N
6155	\N	1	\N	0	2025-11-25 09:11:18.45673	\N	\N
6156	\N	1	\N	1	2025-11-25 09:11:19.398492	\N	\N
6157	\N	1	\N	2	2025-11-25 09:11:20.367313	\N	\N
6158	\N	1	\N	1	2025-11-25 09:11:21.232843	\N	\N
6159	\N	1	\N	1	2025-11-25 09:11:22.112738	\N	\N
6160	\N	1	\N	1	2025-11-25 09:11:22.961631	\N	\N
6161	\N	1	\N	0	2025-11-25 09:11:23.833323	\N	\N
6162	\N	1	\N	0	2025-11-25 09:11:24.666562	\N	\N
6163	\N	1	\N	0	2025-11-25 09:11:25.630351	\N	\N
6164	\N	1	\N	0	2025-11-25 09:11:26.561675	\N	\N
6165	\N	1	\N	2	2025-11-25 09:12:09.883015	\N	\N
6166	\N	1	\N	2	2025-11-25 09:12:10.727754	\N	\N
6167	\N	1	\N	2	2025-11-25 09:12:11.635197	\N	\N
6168	\N	1	\N	2	2025-11-25 09:12:12.496365	\N	\N
6169	\N	1	\N	2	2025-11-25 09:12:13.421391	\N	\N
6170	\N	1	\N	2	2025-11-25 09:12:14.335861	\N	\N
6171	\N	1	\N	2	2025-11-25 09:12:15.250941	\N	\N
6172	\N	1	\N	2	2025-11-25 09:12:16.22137	\N	\N
6173	\N	1	\N	2	2025-11-25 09:12:17.204278	\N	\N
6174	\N	1	\N	2	2025-11-25 09:12:18.04676	\N	\N
6175	\N	1	\N	2	2025-11-25 09:12:19.000198	\N	\N
6176	\N	1	\N	2	2025-11-25 09:12:19.862901	\N	\N
6177	\N	1	\N	2	2025-11-25 09:12:20.7729	\N	\N
6178	\N	1	\N	2	2025-11-25 09:12:21.789011	\N	\N
6179	\N	1	\N	2	2025-11-25 09:12:22.949035	\N	\N
6180	\N	1	\N	1	2025-11-25 09:12:23.896787	\N	\N
6181	\N	1	\N	1	2025-11-25 09:12:25.600187	\N	\N
6182	\N	1	\N	1	2025-11-25 09:12:26.92741	\N	\N
6183	\N	1	\N	1	2025-11-25 09:12:28.091365	\N	\N
6184	\N	1	\N	1	2025-11-25 09:12:29.42128	\N	\N
6185	\N	1	\N	1	2025-11-25 09:12:30.27648	\N	\N
6186	\N	1	\N	1	2025-11-25 09:12:31.211831	\N	\N
6187	\N	1	\N	1	2025-11-25 09:12:32.080934	\N	\N
6188	\N	1	\N	1	2025-11-25 09:12:33.325074	\N	\N
6189	\N	1	\N	1	2025-11-25 09:12:34.570499	\N	\N
6190	\N	1	\N	1	2025-11-25 09:12:35.531768	\N	\N
6191	\N	1	\N	1	2025-11-25 09:12:36.355012	\N	\N
6192	\N	1	\N	1	2025-11-25 09:12:37.328093	\N	\N
6193	\N	1	\N	1	2025-11-25 09:12:38.278873	\N	\N
6194	\N	1	\N	1	2025-11-25 09:12:39.289256	\N	\N
6195	\N	1	\N	1	2025-11-25 09:12:40.331355	\N	\N
6196	\N	1	\N	1	2025-11-25 09:12:42.111754	\N	\N
6197	\N	1	\N	1	2025-11-25 09:12:42.322424	\N	\N
6198	\N	1	\N	1	2025-11-25 09:12:43.1687	\N	\N
6199	\N	1	\N	1	2025-11-25 09:12:44.162666	\N	\N
6200	\N	1	\N	1	2025-11-25 09:12:45.163666	\N	\N
6201	\N	1	\N	1	2025-11-25 09:12:46.000589	\N	\N
6202	\N	1	\N	1	2025-11-25 09:12:46.850562	\N	\N
6203	\N	1	\N	1	2025-11-25 09:12:47.943012	\N	\N
6204	\N	1	\N	1	2025-11-25 09:12:48.884556	\N	\N
6205	\N	1	\N	1	2025-11-25 09:12:49.950195	\N	\N
6206	\N	1	\N	1	2025-11-25 09:12:50.951783	\N	\N
6207	\N	1	\N	1	2025-11-25 09:12:52.009893	\N	\N
6208	\N	1	\N	1	2025-11-25 09:12:53.11485	\N	\N
6209	\N	1	\N	1	2025-11-25 09:12:53.94161	\N	\N
6210	\N	1	\N	1	2025-11-25 09:12:55.084574	\N	\N
6211	\N	1	\N	0	2025-11-25 09:15:11.532593	\N	\N
6212	\N	1	\N	0	2025-11-25 09:15:12.424977	\N	\N
6213	\N	1	\N	0	2025-11-25 09:15:13.326774	\N	\N
6214	\N	1	\N	0	2025-11-25 09:15:14.250024	\N	\N
6215	\N	1	\N	0	2025-11-25 09:15:15.161235	\N	\N
6216	\N	1	\N	0	2025-11-25 09:15:16.044886	\N	\N
6217	\N	1	\N	0	2025-11-25 09:15:16.954191	\N	\N
6218	\N	1	\N	0	2025-11-25 09:15:17.823927	\N	\N
6219	\N	1	\N	1	2025-11-25 09:15:18.68211	\N	\N
6220	\N	1	\N	1	2025-11-25 09:15:19.581031	\N	\N
6221	\N	1	\N	1	2025-11-25 09:15:20.478959	\N	\N
6222	\N	1	\N	0	2025-11-25 09:15:21.327762	\N	\N
6223	\N	1	\N	0	2025-11-25 09:15:22.233599	\N	\N
6224	\N	1	\N	1	2025-11-25 09:15:23.083224	\N	\N
6225	\N	1	\N	1	2025-11-25 09:15:23.930878	\N	\N
6226	\N	1	\N	1	2025-11-25 09:15:24.791898	\N	\N
6227	\N	1	\N	1	2025-11-25 09:15:25.723748	\N	\N
6228	\N	1	\N	1	2025-11-25 09:15:26.554113	\N	\N
6229	\N	1	\N	2	2025-11-25 09:15:27.395141	\N	\N
6230	\N	1	\N	2	2025-11-25 09:15:28.242573	\N	\N
6231	\N	1	\N	2	2025-11-25 09:15:29.093789	\N	\N
6232	\N	1	\N	2	2025-11-25 09:15:30.022265	\N	\N
6233	\N	1	\N	3	2025-11-25 09:15:31.084019	\N	\N
6234	\N	1	\N	3	2025-11-25 09:15:32.050335	\N	\N
6235	\N	1	\N	2	2025-11-25 09:15:32.954802	\N	\N
6236	\N	1	\N	2	2025-11-25 09:15:34.113576	\N	\N
6237	\N	1	\N	2	2025-11-25 09:15:34.999241	\N	\N
6238	\N	1	\N	2	2025-11-25 09:15:35.829253	\N	\N
6239	\N	1	\N	2	2025-11-25 09:15:36.838692	\N	\N
6240	\N	1	\N	2	2025-11-25 09:15:37.674466	\N	\N
6241	\N	1	\N	2	2025-11-25 09:15:38.594767	\N	\N
6242	\N	1	\N	1	2025-11-25 09:15:39.576602	\N	\N
6243	\N	1	\N	2	2025-11-25 09:15:40.510159	\N	\N
6244	\N	1	\N	3	2025-11-25 09:15:41.427292	\N	\N
6245	\N	1	\N	3	2025-11-25 09:15:42.29354	\N	\N
6246	\N	1	\N	2	2025-11-25 09:15:43.149947	\N	\N
6247	\N	1	\N	1	2025-11-25 09:26:57.61439	\N	\N
6248	\N	1	\N	1	2025-11-25 09:26:58.219127	\N	\N
6249	\N	1	\N	1	2025-11-25 09:26:58.918886	\N	\N
6250	\N	1	\N	1	2025-11-25 09:26:59.587637	\N	\N
6251	\N	1	\N	1	2025-11-25 09:27:00.236141	\N	\N
6252	\N	1	\N	1	2025-11-25 09:27:00.886366	\N	\N
6253	\N	1	\N	1	2025-11-25 09:27:01.532497	\N	\N
6254	\N	1	\N	1	2025-11-25 09:27:02.369658	\N	\N
6255	\N	1	\N	1	2025-11-25 09:27:03.025888	\N	\N
6256	\N	1	\N	2	2025-11-25 09:27:03.785611	\N	\N
6257	\N	1	\N	1	2025-11-25 09:27:04.447866	\N	\N
6258	\N	1	\N	1	2025-11-25 09:27:05.100587	\N	\N
6259	\N	1	\N	1	2025-11-25 09:27:05.769527	\N	\N
6260	\N	1	\N	1	2025-11-25 09:27:06.490367	\N	\N
6261	\N	1	\N	1	2025-11-25 09:27:07.200843	\N	\N
6262	\N	1	\N	1	2025-11-25 09:27:07.879866	\N	\N
6263	\N	1	\N	1	2025-11-25 09:27:08.586335	\N	\N
6264	\N	1	\N	1	2025-11-25 09:27:09.291865	\N	\N
6265	\N	1	\N	1	2025-11-25 09:27:09.932728	\N	\N
6266	\N	1	\N	1	2025-11-25 09:27:10.676125	\N	\N
6267	\N	1	\N	2	2025-11-25 09:27:11.306331	\N	\N
6268	\N	1	\N	1	2025-11-25 09:27:12.002861	\N	\N
6269	\N	1	\N	1	2025-11-25 09:27:12.720478	\N	\N
6270	\N	1	\N	2	2025-11-25 09:27:13.50642	\N	\N
6271	\N	1	\N	2	2025-11-25 09:27:14.122234	\N	\N
6272	\N	1	\N	2	2025-11-25 09:27:14.814754	\N	\N
6273	\N	1	\N	0	2025-11-25 09:27:15.48151	\N	\N
6274	\N	1	\N	0	2025-11-25 09:27:16.14997	\N	\N
6275	\N	1	\N	0	2025-11-25 09:27:16.879677	\N	\N
6276	\N	1	\N	1	2025-11-25 09:27:17.55164	\N	\N
6277	\N	1	\N	1	2025-11-25 09:27:18.22497	\N	\N
6278	\N	1	\N	2	2025-11-25 09:27:18.886501	\N	\N
6279	\N	1	\N	1	2025-11-25 09:27:19.560019	\N	\N
6280	\N	1	\N	2	2025-11-25 09:27:20.192459	\N	\N
6281	\N	1	\N	1	2025-11-25 09:27:20.863087	\N	\N
6282	\N	1	\N	1	2025-11-25 09:27:21.473844	\N	\N
6283	\N	1	\N	1	2025-11-25 09:27:22.163497	\N	\N
6284	\N	1	\N	1	2025-11-25 09:27:22.828333	\N	\N
6285	\N	1	\N	1	2025-11-25 09:27:23.578244	\N	\N
6286	\N	1	\N	2	2025-11-25 09:27:24.29647	\N	\N
6287	\N	1	\N	2	2025-11-25 09:27:24.977372	\N	\N
6288	\N	1	\N	2	2025-11-25 09:27:25.638409	\N	\N
6289	\N	1	\N	2	2025-11-25 09:27:26.333411	\N	\N
6290	\N	1	\N	2	2025-11-25 09:27:26.982046	\N	\N
6291	\N	1	\N	2	2025-11-25 09:27:27.612954	\N	\N
6292	\N	1	\N	1	2025-11-25 09:27:28.283681	\N	\N
6293	\N	1	\N	1	2025-11-25 09:27:28.904884	\N	\N
6294	\N	1	\N	1	2025-11-25 09:27:29.613924	\N	\N
6295	\N	1	\N	2	2025-11-25 09:27:30.247319	\N	\N
6296	\N	1	\N	1	2025-11-25 09:27:30.885507	\N	\N
6297	\N	1	\N	1	2025-11-25 09:27:31.556873	\N	\N
6298	\N	1	\N	2	2025-11-25 09:27:32.257658	\N	\N
6299	\N	1	\N	2	2025-11-25 09:27:32.908423	\N	\N
6300	\N	1	\N	2	2025-11-25 09:27:33.553113	\N	\N
6301	\N	1	\N	1	2025-11-25 09:27:34.269528	\N	\N
6302	\N	1	\N	1	2025-11-25 09:27:34.916659	\N	\N
6303	\N	1	\N	2	2025-11-25 09:27:35.530432	\N	\N
6304	\N	1	\N	2	2025-11-25 09:27:36.15389	\N	\N
6305	\N	1	\N	2	2025-11-25 09:27:36.897014	\N	\N
6306	\N	1	\N	2	2025-11-25 09:27:37.516691	\N	\N
6307	\N	1	\N	2	2025-11-25 09:27:38.253286	\N	\N
6308	\N	1	\N	2	2025-11-25 09:27:38.988746	\N	\N
6309	\N	1	\N	2	2025-11-25 09:27:39.707919	\N	\N
6310	\N	1	\N	2	2025-11-25 09:27:40.444153	\N	\N
6311	\N	1	\N	2	2025-11-25 09:27:41.04551	\N	\N
6312	\N	1	\N	2	2025-11-25 09:27:41.705026	\N	\N
6313	\N	1	\N	2	2025-11-25 09:27:42.44729	\N	\N
6314	\N	1	\N	2	2025-11-25 09:27:43.059159	\N	\N
6315	\N	1	\N	1	2025-11-25 09:27:43.764743	\N	\N
6316	\N	1	\N	1	2025-11-25 09:27:44.438429	\N	\N
6317	\N	1	\N	1	2025-11-25 09:27:45.051277	\N	\N
6318	\N	1	\N	1	2025-11-25 09:27:45.783186	\N	\N
6319	\N	1	\N	1	2025-11-25 09:27:46.503956	\N	\N
6320	\N	1	\N	1	2025-11-25 09:27:47.335271	\N	\N
6321	\N	1	\N	1	2025-11-25 09:27:47.967827	\N	\N
6322	\N	1	\N	1	2025-11-25 09:27:48.690958	\N	\N
6323	\N	1	\N	2	2025-11-25 09:27:49.336108	\N	\N
6324	\N	1	\N	2	2025-11-25 09:27:50.058481	\N	\N
6325	\N	1	\N	2	2025-11-25 09:27:50.757204	\N	\N
6326	\N	1	\N	2	2025-11-25 09:27:51.587715	\N	\N
6327	\N	1	\N	2	2025-11-25 09:27:52.558481	\N	\N
6328	\N	1	\N	2	2025-11-25 09:27:53.347211	\N	\N
6329	\N	1	\N	2	2025-11-25 09:27:54.423774	\N	\N
6330	\N	1	\N	2	2025-11-25 09:27:55.341632	\N	\N
6331	\N	1	\N	2	2025-11-25 09:27:56.109156	\N	\N
6332	\N	1	\N	2	2025-11-25 09:27:56.966077	\N	\N
6333	\N	1	\N	1	2025-11-25 09:27:57.75445	\N	\N
6334	\N	1	\N	1	2025-11-25 09:27:58.457928	\N	\N
6335	\N	1	\N	1	2025-11-25 09:27:59.078429	\N	\N
6336	\N	1	\N	2	2025-11-25 09:27:59.7212	\N	\N
6337	\N	1	\N	2	2025-11-25 09:28:00.461963	\N	\N
6338	\N	1	\N	2	2025-11-25 09:28:01.177732	\N	\N
6339	\N	1	\N	2	2025-11-25 09:28:01.84044	\N	\N
6340	\N	1	\N	1	2025-11-25 09:28:02.570982	\N	\N
6341	\N	1	\N	2	2025-11-25 09:28:03.338282	\N	\N
6342	\N	1	\N	1	2025-11-25 09:28:04.006754	\N	\N
6343	\N	1	\N	2	2025-11-25 09:28:04.783669	\N	\N
6344	\N	1	\N	2	2025-11-25 09:28:05.439742	\N	\N
6345	\N	1	\N	2	2025-11-25 09:28:06.236698	\N	\N
6346	\N	1	\N	2	2025-11-25 09:28:06.957571	\N	\N
6347	\N	1	\N	2	2025-11-25 09:28:07.65523	\N	\N
6348	\N	1	\N	2	2025-11-25 09:28:08.355626	\N	\N
6349	\N	1	\N	2	2025-11-25 09:28:09.019527	\N	\N
6350	\N	1	\N	2	2025-11-25 09:28:09.664409	\N	\N
6351	\N	1	\N	2	2025-11-25 09:28:10.298635	\N	\N
6352	\N	1	\N	2	2025-11-25 09:28:10.941664	\N	\N
6353	\N	1	\N	1	2025-11-25 09:28:11.553692	\N	\N
6354	\N	1	\N	1	2025-11-25 09:28:12.160496	\N	\N
6355	\N	1	\N	1	2025-11-25 09:28:12.892103	\N	\N
6356	\N	1	\N	1	2025-11-25 09:28:13.497691	\N	\N
6357	\N	1	\N	1	2025-11-25 09:28:14.134587	\N	\N
6358	\N	1	\N	1	2025-11-25 09:28:14.798731	\N	\N
6359	\N	1	\N	1	2025-11-25 09:28:15.51473	\N	\N
6360	\N	1	\N	1	2025-11-25 09:28:16.121999	\N	\N
6361	\N	1	\N	1	2025-11-25 09:28:16.775769	\N	\N
6362	\N	1	\N	1	2025-11-25 09:28:17.429913	\N	\N
6363	\N	1	\N	1	2025-11-25 09:28:18.177064	\N	\N
6364	\N	1	\N	1	2025-11-25 09:28:18.833056	\N	\N
6365	\N	1	\N	2	2025-11-25 09:28:19.549008	\N	\N
6366	\N	1	\N	2	2025-11-25 09:28:20.224837	\N	\N
6367	\N	1	\N	3	2025-11-25 09:28:20.94766	\N	\N
6368	\N	1	\N	2	2025-11-25 09:28:21.617987	\N	\N
6369	\N	1	\N	2	2025-11-25 09:28:22.221364	\N	\N
6370	\N	1	\N	2	2025-11-25 09:28:22.900653	\N	\N
6371	\N	1	\N	1	2025-11-25 09:28:23.647996	\N	\N
6372	\N	1	\N	2	2025-11-25 09:28:24.383322	\N	\N
6373	\N	1	\N	2	2025-11-25 09:28:25.06434	\N	\N
6374	\N	1	\N	2	2025-11-25 09:28:25.678612	\N	\N
6375	\N	1	\N	1	2025-11-25 09:28:26.330159	\N	\N
6376	\N	1	\N	1	2025-11-25 09:28:26.951483	\N	\N
6377	\N	1	\N	1	2025-11-25 09:28:27.646519	\N	\N
6378	\N	1	\N	2	2025-11-25 09:28:28.25137	\N	\N
6379	\N	1	\N	1	2025-11-25 09:28:28.986695	\N	\N
6380	\N	1	\N	1	2025-11-25 09:28:29.698516	\N	\N
6381	\N	1	\N	1	2025-11-25 09:28:30.433351	\N	\N
6382	\N	1	\N	2	2025-11-25 09:28:31.041582	\N	\N
6383	\N	1	\N	1	2025-11-25 09:28:31.657678	\N	\N
6384	\N	1	\N	1	2025-11-25 09:28:32.333283	\N	\N
6385	\N	1	\N	2	2025-11-25 09:29:05.892547	\N	\N
6386	\N	1	\N	2	2025-11-25 09:29:06.540728	\N	\N
6387	\N	1	\N	2	2025-11-25 09:29:07.269184	\N	\N
6388	\N	1	\N	2	2025-11-25 09:29:07.985889	\N	\N
6389	\N	1	\N	2	2025-11-25 09:29:08.707888	\N	\N
6390	\N	1	\N	2	2025-11-25 09:29:09.409266	\N	\N
6391	\N	1	\N	2	2025-11-25 09:29:10.098837	\N	\N
6392	\N	1	\N	2	2025-11-25 09:29:10.823242	\N	\N
6393	\N	1	\N	2	2025-11-25 09:29:11.453586	\N	\N
6394	\N	1	\N	2	2025-11-25 09:29:12.190051	\N	\N
6395	\N	1	\N	2	2025-11-25 09:29:12.862565	\N	\N
6396	\N	1	\N	2	2025-11-25 09:29:13.560728	\N	\N
6397	\N	1	\N	2	2025-11-25 09:29:14.322868	\N	\N
6398	\N	1	\N	2	2025-11-25 09:29:15.022761	\N	\N
6399	\N	1	\N	2	2025-11-25 09:29:15.780669	\N	\N
6400	\N	1	\N	2	2025-11-25 09:29:16.394321	\N	\N
6401	\N	1	\N	2	2025-11-25 09:29:17.09671	\N	\N
6402	\N	1	\N	2	2025-11-25 09:29:17.820723	\N	\N
6403	\N	1	\N	2	2025-11-25 09:29:18.51067	\N	\N
6404	\N	1	\N	2	2025-11-25 09:29:19.176433	\N	\N
6405	\N	1	\N	2	2025-11-25 09:29:19.838787	\N	\N
6406	\N	1	\N	1	2025-11-25 09:29:20.535796	\N	\N
6407	\N	1	\N	1	2025-11-25 09:29:21.213612	\N	\N
6408	\N	1	\N	1	2025-11-25 09:29:21.886062	\N	\N
6409	\N	1	\N	1	2025-11-25 09:29:22.552313	\N	\N
6410	\N	1	\N	1	2025-11-25 09:29:23.220122	\N	\N
6411	\N	1	\N	1	2025-11-25 09:29:23.958915	\N	\N
6412	\N	1	\N	1	2025-11-25 09:29:24.693441	\N	\N
6413	\N	1	\N	1	2025-11-25 09:29:25.306485	\N	\N
6414	\N	1	\N	1	2025-11-25 09:29:26.047686	\N	\N
6415	\N	1	\N	1	2025-11-25 09:29:26.673382	\N	\N
6416	\N	1	\N	1	2025-11-25 09:29:27.318084	\N	\N
6417	\N	1	\N	1	2025-11-25 09:29:28.028267	\N	\N
6418	\N	1	\N	1	2025-11-25 09:29:28.714281	\N	\N
6419	\N	1	\N	1	2025-11-25 09:29:29.420906	\N	\N
6420	\N	1	\N	1	2025-11-25 09:29:30.081248	\N	\N
6421	\N	1	\N	1	2025-11-25 09:29:30.764685	\N	\N
6422	\N	1	\N	1	2025-11-25 09:29:31.474181	\N	\N
6423	\N	1	\N	1	2025-11-25 09:29:32.117084	\N	\N
6424	\N	1	\N	1	2025-11-25 09:29:32.82569	\N	\N
6425	\N	1	\N	4	2025-11-25 09:29:39.18131	\N	\N
6426	\N	1	\N	4	2025-11-25 09:29:39.898592	\N	\N
6427	\N	1	\N	4	2025-11-25 09:29:40.639278	\N	\N
6428	\N	1	\N	4	2025-11-25 09:29:41.402358	\N	\N
6429	\N	1	\N	4	2025-11-25 09:29:42.093918	\N	\N
6430	\N	1	\N	4	2025-11-25 09:29:42.795997	\N	\N
6431	\N	1	\N	4	2025-11-25 09:29:43.514671	\N	\N
6432	\N	1	\N	4	2025-11-25 09:29:44.247557	\N	\N
6433	\N	1	\N	4	2025-11-25 09:29:44.923458	\N	\N
6434	\N	1	\N	4	2025-11-25 09:29:45.543894	\N	\N
6435	\N	1	\N	4	2025-11-25 09:29:46.150389	\N	\N
6436	\N	1	\N	4	2025-11-25 09:29:46.843155	\N	\N
6437	\N	1	\N	5	2025-11-25 09:29:47.444719	\N	\N
6438	\N	1	\N	4	2025-11-25 09:29:48.181763	\N	\N
6439	\N	1	\N	4	2025-11-25 09:29:48.833978	\N	\N
6440	\N	1	\N	4	2025-11-25 09:29:49.496435	\N	\N
6441	\N	1	\N	4	2025-11-25 09:29:50.245354	\N	\N
6442	\N	1	\N	4	2025-11-25 09:29:50.883388	\N	\N
6443	\N	1	\N	4	2025-11-25 09:29:51.653824	\N	\N
6444	\N	1	\N	4	2025-11-25 09:29:52.586107	\N	\N
6445	\N	1	\N	4	2025-11-25 09:29:53.309278	\N	\N
6446	\N	1	\N	4	2025-11-25 09:29:54.062732	\N	\N
6447	\N	1	\N	3	2025-11-25 09:29:54.832288	\N	\N
6448	\N	1	\N	3	2025-11-25 09:29:55.604176	\N	\N
6449	\N	1	\N	3	2025-11-25 09:29:56.225725	\N	\N
6450	\N	1	\N	3	2025-11-25 09:29:57.004444	\N	\N
6451	\N	1	\N	3	2025-11-25 09:29:57.692218	\N	\N
6452	\N	1	\N	3	2025-11-25 09:29:58.320415	\N	\N
6453	\N	1	\N	3	2025-11-25 09:29:59.109818	\N	\N
6454	\N	1	\N	3	2025-11-25 09:29:59.862366	\N	\N
6455	\N	1	\N	3	2025-11-25 09:30:00.468608	\N	\N
6456	\N	1	\N	4	2025-11-25 09:30:01.282132	\N	\N
6457	\N	1	\N	4	2025-11-25 09:30:01.93588	\N	\N
6458	\N	1	\N	4	2025-11-25 09:30:02.560827	\N	\N
6459	\N	1	\N	4	2025-11-25 09:30:03.373789	\N	\N
6460	\N	1	\N	4	2025-11-25 09:30:04.052966	\N	\N
6461	\N	1	\N	4	2025-11-25 09:30:04.840134	\N	\N
6462	\N	1	\N	4	2025-11-25 09:30:05.485545	\N	\N
6463	\N	1	\N	4	2025-11-25 09:30:06.10181	\N	\N
6464	\N	1	\N	3	2025-11-25 09:30:06.774776	\N	\N
6465	\N	1	\N	3	2025-11-25 09:30:07.45333	\N	\N
6466	\N	1	\N	4	2025-11-25 09:30:08.124015	\N	\N
6467	\N	1	\N	3	2025-11-25 09:30:08.785855	\N	\N
6468	\N	1	\N	3	2025-11-25 09:30:09.511769	\N	\N
6469	\N	1	\N	3	2025-11-25 09:30:10.483144	\N	\N
6470	\N	1	\N	3	2025-11-25 09:30:11.015994	\N	\N
6471	\N	1	\N	3	2025-11-25 09:30:11.642917	\N	\N
6472	\N	1	\N	3	2025-11-25 09:30:12.338959	\N	\N
6473	\N	1	\N	3	2025-11-25 09:30:13.037492	\N	\N
6474	\N	1	\N	3	2025-11-25 09:30:13.777023	\N	\N
6475	\N	1	\N	3	2025-11-25 09:30:14.510702	\N	\N
6476	\N	1	\N	3	2025-11-25 09:30:15.17993	\N	\N
6477	\N	1	\N	3	2025-11-25 09:30:15.801142	\N	\N
6478	\N	1	\N	3	2025-11-25 09:30:16.458988	\N	\N
6479	\N	1	\N	3	2025-11-25 09:30:17.140822	\N	\N
6480	\N	1	\N	3	2025-11-25 09:30:17.915099	\N	\N
6481	\N	1	\N	3	2025-11-25 09:30:18.516806	\N	\N
6482	\N	1	\N	3	2025-11-25 09:30:19.122222	\N	\N
6483	\N	1	\N	3	2025-11-25 09:30:19.913372	\N	\N
6484	\N	1	\N	3	2025-11-25 09:30:20.512252	\N	\N
6485	\N	1	\N	3	2025-11-25 09:30:21.116209	\N	\N
6496	\N	1	\N	1	2025-11-26 03:26:00.218226	\N	\N
6497	\N	1	\N	1	2025-11-26 03:26:00.849792	\N	\N
6498	\N	1	\N	1	2025-11-26 03:26:01.495995	\N	\N
6499	\N	1	\N	1	2025-11-26 03:26:02.263355	\N	\N
6500	\N	1	\N	1	2025-11-26 03:26:02.939666	\N	\N
6501	\N	1	\N	2	2025-11-26 03:26:03.573985	\N	\N
6502	\N	1	\N	1	2025-11-26 03:26:04.20777	\N	\N
6503	\N	1	\N	1	2025-11-26 03:26:04.874725	\N	\N
6504	\N	1	\N	1	2025-11-26 03:26:05.532699	\N	\N
6505	\N	1	\N	1	2025-11-26 03:26:06.172573	\N	\N
6506	\N	1	\N	1	2025-11-26 03:26:06.785177	\N	\N
6507	\N	1	\N	1	2025-11-26 03:26:07.405278	\N	\N
6508	\N	1	\N	1	2025-11-26 03:26:08.079046	\N	\N
6509	\N	1	\N	1	2025-11-26 03:26:08.733149	\N	\N
6510	\N	1	\N	1	2025-11-26 03:26:09.398006	\N	\N
6511	\N	1	\N	2	2025-11-26 03:26:10.051393	\N	\N
6512	\N	1	\N	0	2025-11-26 03:26:10.698031	\N	\N
6513	\N	1	\N	0	2025-11-26 03:26:11.390304	\N	\N
6514	\N	1	\N	1	2025-11-26 03:26:12.066142	\N	\N
6515	\N	1	\N	2	2025-11-26 03:26:12.760413	\N	\N
6516	\N	1	\N	1	2025-11-26 03:26:13.382321	\N	\N
6517	\N	1	\N	1	2025-11-26 03:26:14.065711	\N	\N
6518	\N	1	\N	1	2025-11-26 03:26:14.76007	\N	\N
6519	\N	1	\N	1	2025-11-26 03:26:15.415049	\N	\N
6520	\N	1	\N	1	2025-11-26 03:26:16.091488	\N	\N
6521	\N	1	\N	2	2025-11-26 03:26:16.757465	\N	\N
6522	\N	1	\N	2	2025-11-26 03:26:17.411044	\N	\N
6523	\N	1	\N	2	2025-11-26 03:26:18.044314	\N	\N
6524	\N	1	\N	2	2025-11-26 03:26:18.699793	\N	\N
6525	\N	1	\N	2	2025-11-26 03:26:19.355524	\N	\N
6526	\N	1	\N	1	2025-11-26 03:26:19.977764	\N	\N
6527	\N	1	\N	1	2025-11-26 03:26:20.67149	\N	\N
6528	\N	1	\N	1	2025-11-26 03:26:21.323517	\N	\N
6529	\N	1	\N	2	2025-11-26 03:26:21.979661	\N	\N
6530	\N	1	\N	2	2025-11-26 03:26:22.640613	\N	\N
6531	\N	1	\N	1	2025-11-26 03:26:23.324623	\N	\N
6532	\N	1	\N	2	2025-11-26 03:26:24.014741	\N	\N
6533	\N	1	\N	2	2025-11-26 03:26:24.628759	\N	\N
6534	\N	1	\N	2	2025-11-26 03:26:25.299563	\N	\N
6535	\N	1	\N	2	2025-11-26 03:26:25.999794	\N	\N
6536	\N	1	\N	2	2025-11-26 03:26:26.691704	\N	\N
6537	\N	1	\N	2	2025-11-26 03:26:27.293768	\N	\N
6538	\N	1	\N	2	2025-11-26 03:26:27.973315	\N	\N
6539	\N	1	\N	2	2025-11-26 03:26:28.602031	\N	\N
6540	\N	1	\N	1	2025-11-26 03:26:29.209271	\N	\N
6541	\N	1	\N	2	2025-11-26 03:26:29.81203	\N	\N
6542	\N	1	\N	1	2025-11-26 03:26:30.468207	\N	\N
6543	\N	1	\N	1	2025-11-26 03:26:31.088302	\N	\N
6544	\N	1	\N	1	2025-11-26 03:26:31.78586	\N	\N
6545	\N	1	\N	1	2025-11-26 03:26:32.448685	\N	\N
6546	\N	1	\N	2	2025-11-26 03:26:33.069984	\N	\N
6547	\N	1	\N	2	2025-11-26 03:26:33.755106	\N	\N
6548	\N	1	\N	2	2025-11-26 03:26:34.357239	\N	\N
6549	\N	1	\N	1	2025-11-26 03:26:34.989102	\N	\N
6550	\N	1	\N	1	2025-11-26 03:26:35.673398	\N	\N
6551	\N	1	\N	1	2025-11-26 03:26:36.283218	\N	\N
6552	\N	1	\N	2	2025-11-26 03:26:36.964921	\N	\N
6553	\N	1	\N	2	2025-11-26 03:26:37.64785	\N	\N
6554	\N	1	\N	2	2025-11-26 03:26:38.281362	\N	\N
6555	\N	1	\N	1	2025-11-26 03:26:38.892337	\N	\N
6556	\N	1	\N	2	2025-11-26 03:26:39.493238	\N	\N
6557	\N	1	\N	2	2025-11-26 03:26:40.179475	\N	\N
6558	\N	1	\N	2	2025-11-26 03:26:40.866767	\N	\N
6559	\N	1	\N	2	2025-11-26 03:26:41.551135	\N	\N
6560	\N	1	\N	2	2025-11-26 03:26:42.223449	\N	\N
6561	\N	1	\N	2	2025-11-26 03:26:42.904893	\N	\N
6562	\N	1	\N	1	2025-11-26 03:26:43.591233	\N	\N
6563	\N	1	\N	1	2025-11-26 03:26:44.209003	\N	\N
6564	\N	1	\N	1	2025-11-26 03:26:44.814639	\N	\N
6565	\N	1	\N	1	2025-11-26 03:26:45.503966	\N	\N
6566	\N	1	\N	1	2025-11-26 03:26:46.182026	\N	\N
6567	\N	1	\N	1	2025-11-26 03:26:46.866431	\N	\N
6568	\N	1	\N	2	2025-11-26 03:26:47.546178	\N	\N
6569	\N	1	\N	2	2025-11-26 03:26:48.241144	\N	\N
6570	\N	1	\N	2	2025-11-26 03:26:48.928384	\N	\N
6571	\N	1	\N	2	2025-11-26 03:26:49.53304	\N	\N
6572	\N	1	\N	2	2025-11-26 03:26:50.215343	\N	\N
6573	\N	1	\N	2	2025-11-26 03:26:50.889462	\N	\N
6574	\N	1	\N	2	2025-11-26 03:26:51.490971	\N	\N
6575	\N	1	\N	1	2025-11-26 03:26:52.218655	\N	\N
6576	\N	1	\N	1	2025-11-26 03:26:52.861267	\N	\N
6577	\N	1	\N	1	2025-11-26 04:14:07.243902	\N	\N
6578	\N	1	\N	1	2025-11-26 04:14:07.868175	\N	\N
6579	\N	1	\N	1	2025-11-26 04:14:29.02347	\N	\N
6580	\N	1	\N	1	2025-11-26 04:14:29.630107	\N	\N
6581	\N	1	\N	1	2025-11-26 04:14:30.286108	\N	\N
6582	\N	1	\N	1	2025-11-26 04:14:30.969172	\N	\N
6583	\N	1	\N	1	2025-11-26 04:14:31.649632	\N	\N
6584	\N	1	\N	1	2025-11-26 04:14:32.370353	\N	\N
6585	\N	1	\N	1	2025-11-26 04:14:32.993984	\N	\N
6586	\N	1	\N	1	2025-11-26 04:14:33.659023	\N	\N
6587	\N	1	\N	1	2025-11-26 04:14:34.272222	\N	\N
6588	\N	1	\N	1	2025-11-26 04:14:34.889446	\N	\N
6589	\N	1	\N	1	2025-11-26 04:14:35.598065	\N	\N
6590	\N	1	\N	1	2025-11-26 04:14:36.241611	\N	\N
6591	\N	1	\N	1	2025-11-26 04:14:36.954163	\N	\N
6592	\N	1	\N	1	2025-11-26 04:14:37.602212	\N	\N
6593	\N	1	\N	1	2025-11-26 04:14:38.268932	\N	\N
6594	\N	1	\N	1	2025-11-26 04:14:38.877223	\N	\N
6595	\N	1	\N	2	2025-11-26 04:14:39.55817	\N	\N
6596	\N	1	\N	2	2025-11-26 04:14:40.223996	\N	\N
6597	\N	1	\N	0	2025-11-26 04:14:40.916626	\N	\N
6598	\N	1	\N	0	2025-11-26 04:14:41.517702	\N	\N
6599	\N	1	\N	1	2025-11-26 04:14:42.132906	\N	\N
6600	\N	1	\N	1	2025-11-26 04:14:42.747906	\N	\N
6601	\N	1	\N	2	2025-11-26 04:14:43.410238	\N	\N
6602	\N	1	\N	2	2025-11-26 04:14:44.096113	\N	\N
6603	\N	1	\N	2	2025-11-26 04:14:44.780367	\N	\N
6604	\N	1	\N	2	2025-11-26 04:14:45.38313	\N	\N
6605	\N	1	\N	1	2025-11-26 04:14:46.01198	\N	\N
6606	\N	1	\N	1	2025-11-26 04:14:46.63654	\N	\N
6607	\N	1	\N	1	2025-11-26 04:14:47.290173	\N	\N
6608	\N	1	\N	2	2025-11-26 04:14:47.893863	\N	\N
6609	\N	1	\N	2	2025-11-26 04:14:48.499055	\N	\N
6610	\N	1	\N	2	2025-11-26 04:14:49.11983	\N	\N
6611	\N	1	\N	2	2025-11-26 04:14:49.723865	\N	\N
6612	\N	1	\N	1	2025-11-26 04:14:50.387132	\N	\N
6613	\N	1	\N	2	2025-11-26 04:14:51.079638	\N	\N
6614	\N	1	\N	1	2025-11-26 04:14:51.737967	\N	\N
6615	\N	1	\N	2	2025-11-26 04:14:52.358867	\N	\N
6616	\N	1	\N	2	2025-11-26 04:14:52.965116	\N	\N
6617	\N	1	\N	1	2025-11-26 04:14:53.681125	\N	\N
6618	\N	1	\N	2	2025-11-26 04:14:54.271652	\N	\N
6619	\N	1	\N	2	2025-11-26 04:14:54.933069	\N	\N
6620	\N	1	\N	2	2025-11-26 04:14:55.613158	\N	\N
6621	\N	1	\N	2	2025-11-26 04:14:56.280379	\N	\N
6622	\N	1	\N	2	2025-11-26 04:14:56.959386	\N	\N
6623	\N	1	\N	2	2025-11-26 04:14:57.539272	\N	\N
6624	\N	1	\N	2	2025-11-26 04:14:58.206448	\N	\N
6625	\N	1	\N	2	2025-11-26 04:14:58.87466	\N	\N
6626	\N	1	\N	2	2025-11-26 04:14:59.512271	\N	\N
6627	\N	1	\N	1	2025-11-26 04:15:00.209904	\N	\N
6628	\N	1	\N	1	2025-11-26 04:15:00.909178	\N	\N
6629	\N	1	\N	1	2025-11-26 04:15:01.582132	\N	\N
6630	\N	1	\N	1	2025-11-26 04:15:02.224643	\N	\N
6631	\N	1	\N	1	2025-11-26 04:15:02.877295	\N	\N
6632	\N	1	\N	2	2025-11-26 04:15:03.520888	\N	\N
6633	\N	1	\N	2	2025-11-26 04:15:04.155124	\N	\N
6634	\N	1	\N	2	2025-11-26 04:15:04.759187	\N	\N
6635	\N	1	\N	2	2025-11-26 04:15:05.44707	\N	\N
6636	\N	1	\N	1	2025-11-26 04:15:06.127557	\N	\N
6637	\N	1	\N	1	2025-11-26 04:15:06.806113	\N	\N
6638	\N	1	\N	2	2025-11-26 04:15:07.490554	\N	\N
6639	\N	1	\N	2	2025-11-26 04:15:08.158899	\N	\N
6640	\N	1	\N	2	2025-11-26 04:15:08.846887	\N	\N
6641	\N	1	\N	1	2025-11-26 04:15:09.523223	\N	\N
6642	\N	1	\N	2	2025-11-26 04:15:10.206375	\N	\N
6643	\N	1	\N	2	2025-11-26 04:15:10.820805	\N	\N
6644	\N	1	\N	2	2025-11-26 04:15:11.507906	\N	\N
6645	\N	1	\N	2	2025-11-26 04:15:12.136657	\N	\N
6646	\N	1	\N	2	2025-11-26 04:15:12.795764	\N	\N
6647	\N	1	\N	2	2025-11-26 04:15:13.40342	\N	\N
6648	\N	1	\N	1	2025-11-26 04:15:14.08242	\N	\N
6649	\N	1	\N	1	2025-11-26 04:15:14.763429	\N	\N
6650	\N	1	\N	1	2025-11-26 04:15:15.433024	\N	\N
6651	\N	1	\N	1	2025-11-26 04:15:16.062487	\N	\N
6652	\N	1	\N	1	2025-11-26 04:15:16.707364	\N	\N
6653	\N	1	\N	1	2025-11-26 04:15:17.376181	\N	\N
6654	\N	1	\N	2	2025-11-26 04:15:18.012549	\N	\N
6655	\N	1	\N	2	2025-11-26 04:15:18.657342	\N	\N
6656	\N	1	\N	2	2025-11-26 04:15:19.29395	\N	\N
6657	\N	1	\N	2	2025-11-26 04:15:19.943696	\N	\N
6658	\N	1	\N	1	2025-11-26 04:15:20.547519	\N	\N
6659	\N	1	\N	2	2025-11-26 04:15:21.224002	\N	\N
6660	\N	1	\N	2	2025-11-26 04:15:22.166076	\N	\N
6661	\N	1	\N	2	2025-11-26 04:15:22.505308	\N	\N
6662	\N	1	\N	1	2025-11-26 04:15:23.133412	\N	\N
6663	\N	1	\N	2	2025-11-26 04:15:23.815647	\N	\N
6664	\N	1	\N	2	2025-11-26 04:15:24.449383	\N	\N
6665	\N	1	\N	1	2025-11-26 04:15:25.153633	\N	\N
6666	\N	1	\N	1	2025-11-26 04:15:25.788038	\N	\N
6667	\N	1	\N	1	2025-11-26 04:15:26.462238	\N	\N
6668	\N	1	\N	1	2025-11-26 04:15:27.170628	\N	\N
6669	\N	1	\N	1	2025-11-26 04:16:30.292477	\N	\N
6670	\N	1	\N	1	2025-11-26 04:16:30.884414	\N	\N
6671	\N	1	\N	1	2025-11-26 04:16:31.565525	\N	\N
6672	\N	1	\N	1	2025-11-26 04:16:32.17294	\N	\N
6673	\N	1	\N	1	2025-11-26 04:16:32.808089	\N	\N
6674	\N	1	\N	1	2025-11-26 04:16:33.480046	\N	\N
6675	\N	1	\N	1	2025-11-26 04:16:34.153313	\N	\N
6676	\N	1	\N	1	2025-11-26 04:16:34.827598	\N	\N
6677	\N	1	\N	1	2025-11-26 04:16:35.486594	\N	\N
6678	\N	1	\N	1	2025-11-26 04:16:36.151303	\N	\N
6679	\N	1	\N	1	2025-11-26 04:16:36.830789	\N	\N
6680	\N	1	\N	1	2025-11-26 04:16:37.519317	\N	\N
6681	\N	1	\N	2	2025-11-26 04:16:38.242246	\N	\N
6682	\N	1	\N	1	2025-11-26 04:16:38.849459	\N	\N
6683	\N	1	\N	0	2025-11-26 04:16:39.517162	\N	\N
6684	\N	1	\N	0	2025-11-26 04:16:40.165629	\N	\N
6685	\N	1	\N	2	2025-11-26 04:16:40.851164	\N	\N
6686	\N	1	\N	2	2025-11-26 04:16:41.540848	\N	\N
6687	\N	1	\N	2	2025-11-26 04:16:42.165675	\N	\N
6688	\N	1	\N	1	2025-11-26 04:16:42.922836	\N	\N
6689	\N	1	\N	1	2025-11-26 04:16:43.567096	\N	\N
6690	\N	1	\N	1	2025-11-26 04:16:44.247642	\N	\N
6691	\N	1	\N	1	2025-11-26 04:16:44.850502	\N	\N
6692	\N	1	\N	2	2025-11-26 04:16:45.46639	\N	\N
6693	\N	1	\N	2	2025-11-26 04:16:46.15883	\N	\N
6694	\N	1	\N	1	2025-11-26 04:16:46.856435	\N	\N
6695	\N	1	\N	2	2025-11-26 04:16:47.468119	\N	\N
6696	\N	1	\N	2	2025-11-26 04:16:48.071252	\N	\N
6697	\N	1	\N	1	2025-11-26 04:16:48.757273	\N	\N
6698	\N	1	\N	1	2025-11-26 04:16:49.432513	\N	\N
6699	\N	1	\N	1	2025-11-26 04:16:50.078954	\N	\N
6700	\N	1	\N	2	2025-11-26 04:16:50.753353	\N	\N
6701	\N	1	\N	1	2025-11-26 04:16:51.471752	\N	\N
6702	\N	1	\N	1	2025-11-26 04:16:52.084824	\N	\N
6703	\N	1	\N	2	2025-11-26 04:16:52.783894	\N	\N
6704	\N	1	\N	2	2025-11-26 04:16:53.459741	\N	\N
6705	\N	1	\N	2	2025-11-26 04:16:54.131152	\N	\N
6706	\N	1	\N	2	2025-11-26 04:16:54.803843	\N	\N
6707	\N	1	\N	2	2025-11-26 04:16:55.496473	\N	\N
6708	\N	1	\N	2	2025-11-26 04:16:56.173739	\N	\N
6709	\N	1	\N	2	2025-11-26 04:16:56.790893	\N	\N
6710	\N	1	\N	1	2025-11-26 04:16:57.411515	\N	\N
6711	\N	1	\N	1	2025-11-26 04:16:58.100141	\N	\N
6712	\N	1	\N	2	2025-11-26 04:16:58.709647	\N	\N
6713	\N	1	\N	1	2025-11-26 04:16:59.325625	\N	\N
6714	\N	1	\N	1	2025-11-26 04:16:59.941058	\N	\N
6715	\N	1	\N	1	2025-11-26 04:17:00.620942	\N	\N
6716	\N	1	\N	1	2025-11-26 04:17:01.34268	\N	\N
6717	\N	1	\N	1	2025-11-26 04:17:02.022439	\N	\N
6718	\N	1	\N	1	2025-11-26 04:17:02.658918	\N	\N
6719	\N	1	\N	2	2025-11-26 04:17:03.283495	\N	\N
6720	\N	1	\N	2	2025-11-26 04:17:03.974122	\N	\N
6721	\N	1	\N	2	2025-11-26 04:17:04.64828	\N	\N
6722	\N	1	\N	2	2025-11-26 04:17:05.318722	\N	\N
6723	\N	1	\N	1	2025-11-26 04:17:05.980733	\N	\N
6724	\N	1	\N	1	2025-11-26 04:17:06.629179	\N	\N
6725	\N	1	\N	1	2025-11-26 04:17:07.310957	\N	\N
6726	\N	1	\N	2	2025-11-26 04:17:07.948382	\N	\N
6727	\N	1	\N	2	2025-11-26 04:17:08.611349	\N	\N
6728	\N	1	\N	2	2025-11-26 04:17:09.221353	\N	\N
6729	\N	1	\N	1	2025-11-26 04:17:09.830703	\N	\N
6730	\N	1	\N	2	2025-11-26 04:17:10.433955	\N	\N
6731	\N	1	\N	1	2025-11-26 04:17:11.072878	\N	\N
6732	\N	1	\N	2	2025-11-26 04:17:11.684295	\N	\N
6733	\N	1	\N	2	2025-11-26 04:17:12.314896	\N	\N
6734	\N	1	\N	2	2025-11-26 04:17:12.986678	\N	\N
6735	\N	1	\N	2	2025-11-26 04:17:13.611962	\N	\N
6736	\N	1	\N	1	2025-11-26 04:17:14.219401	\N	\N
6737	\N	1	\N	1	2025-11-26 04:17:14.879361	\N	\N
6738	\N	1	\N	1	2025-11-26 04:17:15.515794	\N	\N
6739	\N	1	\N	1	2025-11-26 04:17:16.128499	\N	\N
6740	\N	1	\N	1	2025-11-26 04:17:16.759566	\N	\N
6741	\N	1	\N	1	2025-11-26 04:17:17.486462	\N	\N
6742	\N	1	\N	1	2025-11-26 04:17:18.243475	\N	\N
6743	\N	1	\N	2	2025-11-26 04:17:18.880028	\N	\N
6744	\N	1	\N	2	2025-11-26 04:17:19.566002	\N	\N
6745	\N	1	\N	2	2025-11-26 04:17:20.223881	\N	\N
6746	\N	1	\N	2	2025-11-26 04:17:20.824552	\N	\N
6747	\N	1	\N	2	2025-11-26 04:17:21.502706	\N	\N
6748	\N	1	\N	1	2025-11-26 04:17:22.143093	\N	\N
6749	\N	1	\N	2	2025-11-26 04:17:22.756943	\N	\N
6750	\N	1	\N	2	2025-11-26 04:17:23.457541	\N	\N
6751	\N	1	\N	1	2025-11-26 04:17:24.161796	\N	\N
6752	\N	1	\N	1	2025-11-26 04:17:24.8646	\N	\N
6753	\N	1	\N	1	2025-11-26 04:17:25.66903	\N	\N
6754	\N	1	\N	1	2025-11-26 04:17:26.419017	\N	\N
6755	\N	1	\N	1	2025-11-26 04:17:27.14125	\N	\N
6756	\N	1	\N	1	2025-11-26 04:17:27.75697	\N	\N
6757	\N	1	\N	2	2025-11-26 04:17:28.424167	\N	\N
6758	\N	1	\N	1	2025-11-26 04:17:29.033524	\N	\N
6759	\N	1	\N	2	2025-11-26 04:17:42.315793	\N	\N
6760	\N	1	\N	2	2025-11-26 04:17:42.893847	\N	\N
6761	\N	1	\N	2	2025-11-26 04:17:43.627719	\N	\N
6762	\N	1	\N	2	2025-11-26 04:17:44.299544	\N	\N
6763	\N	1	\N	2	2025-11-26 04:18:03.724308	\N	\N
6764	\N	1	\N	2	2025-11-26 04:18:04.445804	\N	\N
6765	\N	1	\N	2	2025-11-26 04:18:05.092442	\N	\N
6766	\N	1	\N	2	2025-11-26 04:18:05.700901	\N	\N
6767	\N	1	\N	2	2025-11-26 04:18:06.313248	\N	\N
6768	\N	1	\N	2	2025-11-26 04:18:06.943582	\N	\N
6769	\N	1	\N	2	2025-11-26 04:18:07.559408	\N	\N
6770	\N	1	\N	2	2025-11-26 04:18:08.265925	\N	\N
6771	\N	1	\N	2	2025-11-26 04:18:08.953191	\N	\N
6772	\N	1	\N	2	2025-11-26 04:18:09.611028	\N	\N
6773	\N	1	\N	2	2025-11-26 04:18:10.281269	\N	\N
6774	\N	1	\N	2	2025-11-26 04:18:10.982591	\N	\N
6775	\N	1	\N	2	2025-11-26 04:18:11.708537	\N	\N
6776	\N	1	\N	2	2025-11-26 04:18:12.412171	\N	\N
6777	\N	1	\N	2	2025-11-26 04:18:13.156663	\N	\N
6778	\N	1	\N	2	2025-11-26 04:18:13.808251	\N	\N
6779	\N	1	\N	2	2025-11-26 04:18:14.443639	\N	\N
6780	\N	1	\N	1	2025-11-26 04:18:15.099111	\N	\N
6781	\N	1	\N	1	2025-11-26 04:18:15.757591	\N	\N
6782	\N	1	\N	1	2025-11-26 04:18:16.438565	\N	\N
6783	\N	1	\N	1	2025-11-26 04:18:17.171249	\N	\N
6784	\N	1	\N	1	2025-11-26 04:18:17.830552	\N	\N
6785	\N	1	\N	1	2025-11-26 04:18:18.500904	\N	\N
6786	\N	1	\N	1	2025-11-26 04:18:19.157437	\N	\N
6787	\N	1	\N	1	2025-11-26 04:18:19.766036	\N	\N
6788	\N	1	\N	1	2025-11-26 04:18:20.435745	\N	\N
6789	\N	1	\N	1	2025-11-26 04:18:21.133631	\N	\N
6790	\N	1	\N	1	2025-11-26 04:18:21.838871	\N	\N
6791	\N	1	\N	1	2025-11-26 04:18:22.453875	\N	\N
6792	\N	1	\N	1	2025-11-26 04:18:23.069619	\N	\N
6793	\N	1	\N	1	2025-11-26 04:18:23.726062	\N	\N
6794	\N	1	\N	1	2025-11-26 04:18:24.412528	\N	\N
6795	\N	1	\N	1	2025-11-26 04:18:25.113095	\N	\N
6796	\N	1	\N	1	2025-11-26 04:18:25.807949	\N	\N
6797	\N	1	\N	1	2025-11-26 04:18:26.43463	\N	\N
6798	\N	1	\N	1	2025-11-26 04:18:27.070711	\N	\N
6799	\N	1	\N	1	2025-11-26 04:18:27.676852	\N	\N
6800	\N	1	\N	1	2025-11-26 04:18:28.326708	\N	\N
6801	\N	1	\N	1	2025-11-26 04:18:28.951818	\N	\N
6802	\N	1	\N	1	2025-11-26 04:18:29.56258	\N	\N
6803	\N	1	\N	1	2025-11-26 04:18:30.259258	\N	\N
6804	\N	1	\N	1	2025-11-26 04:19:03.873747	\N	\N
6805	\N	1	\N	1	2025-11-26 04:19:04.53311	\N	\N
6806	\N	1	\N	1	2025-11-26 04:19:11.001488	\N	\N
6807	\N	1	\N	1	2025-11-26 04:19:11.599888	\N	\N
6808	\N	1	\N	0	2025-11-26 04:19:12.213011	\N	\N
6809	\N	1	\N	1	2025-11-26 04:19:12.875012	\N	\N
6810	\N	1	\N	1	2025-11-26 04:19:13.481407	\N	\N
6811	\N	1	\N	1	2025-11-26 04:19:14.119635	\N	\N
6812	\N	1	\N	1	2025-11-26 04:19:14.750998	\N	\N
6813	\N	1	\N	1	2025-11-26 04:19:15.374894	\N	\N
6814	\N	1	\N	1	2025-11-26 04:19:15.97825	\N	\N
6815	\N	1	\N	1	2025-11-26 04:19:16.623006	\N	\N
6816	\N	1	\N	1	2025-11-26 04:19:17.300598	\N	\N
6817	\N	1	\N	1	2025-11-26 04:19:17.959022	\N	\N
6818	\N	1	\N	1	2025-11-26 04:19:18.631439	\N	\N
6819	\N	1	\N	1	2025-11-26 04:19:19.266478	\N	\N
6820	\N	1	\N	2	2025-11-26 04:19:19.972114	\N	\N
6821	\N	1	\N	2	2025-11-26 04:19:21.132615	\N	\N
6822	\N	1	\N	1	2025-11-26 04:19:21.286259	\N	\N
6823	\N	1	\N	0	2025-11-26 04:19:21.88314	\N	\N
6824	\N	1	\N	1	2025-11-26 04:19:22.532154	\N	\N
6825	\N	1	\N	1	2025-11-26 04:19:23.133168	\N	\N
6826	\N	1	\N	2	2025-11-26 04:19:23.751184	\N	\N
6827	\N	1	\N	2	2025-11-26 04:19:24.45127	\N	\N
6828	\N	1	\N	1	2025-11-26 04:19:25.150298	\N	\N
6829	\N	1	\N	1	2025-11-26 04:19:50.675064	\N	\N
6830	\N	1	\N	1	2025-11-26 04:19:51.348654	\N	\N
6831	\N	1	\N	0	2025-11-26 04:19:51.973021	\N	\N
6832	\N	1	\N	1	2025-11-26 04:19:52.604632	\N	\N
6833	\N	1	\N	1	2025-11-26 04:19:53.220795	\N	\N
6834	\N	1	\N	1	2025-11-26 04:19:53.895405	\N	\N
6835	\N	1	\N	1	2025-11-26 04:19:54.576954	\N	\N
6836	\N	1	\N	1	2025-11-26 04:19:55.245803	\N	\N
6837	\N	1	\N	1	2025-11-26 04:19:55.928183	\N	\N
6838	\N	1	\N	2	2025-11-26 04:19:56.620502	\N	\N
6839	\N	1	\N	1	2025-11-26 04:19:57.23682	\N	\N
6840	\N	1	\N	1	2025-11-26 04:19:57.921863	\N	\N
6841	\N	1	\N	1	2025-11-26 04:19:58.525229	\N	\N
6842	\N	1	\N	2	2025-11-26 04:19:59.137139	\N	\N
6843	\N	1	\N	1	2025-11-26 04:19:59.822525	\N	\N
6844	\N	1	\N	0	2025-11-26 04:20:00.514649	\N	\N
6845	\N	1	\N	1	2025-11-26 04:20:01.128186	\N	\N
6846	\N	1	\N	2	2025-11-26 04:20:01.793706	\N	\N
6847	\N	1	\N	1	2025-11-26 04:20:02.465125	\N	\N
6848	\N	1	\N	2	2025-11-26 04:20:03.15195	\N	\N
6849	\N	1	\N	1	2025-11-26 04:20:03.828771	\N	\N
6850	\N	1	\N	2	2025-11-26 04:20:04.494329	\N	\N
6851	\N	1	\N	1	2025-11-26 04:20:05.172523	\N	\N
6852	\N	1	\N	2	2025-11-26 04:20:05.833361	\N	\N
6853	\N	1	\N	2	2025-11-26 04:20:06.520589	\N	\N
6854	\N	1	\N	2	2025-11-26 04:20:07.119149	\N	\N
6855	\N	1	\N	1	2025-11-26 04:20:07.785646	\N	\N
6856	\N	1	\N	2	2025-11-26 04:20:08.474272	\N	\N
6857	\N	1	\N	1	2025-11-26 04:20:09.146584	\N	\N
6858	\N	1	\N	2	2025-11-26 04:20:09.826039	\N	\N
6859	\N	1	\N	2	2025-11-26 04:20:10.474641	\N	\N
6860	\N	1	\N	1	2025-11-26 04:20:11.147713	\N	\N
6861	\N	1	\N	2	2025-11-26 04:20:11.797937	\N	\N
6862	\N	1	\N	2	2025-11-26 04:20:12.471583	\N	\N
6863	\N	1	\N	2	2025-11-26 04:20:13.105695	\N	\N
6864	\N	1	\N	2	2025-11-26 04:20:13.797991	\N	\N
6865	\N	1	\N	2	2025-11-26 04:20:14.457154	\N	\N
6866	\N	1	\N	2	2025-11-26 04:20:15.126592	\N	\N
6867	\N	1	\N	2	2025-11-26 04:20:15.784059	\N	\N
6868	\N	1	\N	2	2025-11-26 04:20:16.454569	\N	\N
6869	\N	1	\N	1	2025-11-26 04:20:17.126676	\N	\N
6870	\N	1	\N	1	2025-11-26 04:20:17.794127	\N	\N
6871	\N	1	\N	1	2025-11-26 04:20:18.48433	\N	\N
6872	\N	1	\N	1	2025-11-26 04:20:19.184599	\N	\N
6873	\N	1	\N	1	2025-11-26 04:20:19.78091	\N	\N
6874	\N	1	\N	2	2025-11-26 04:20:20.451338	\N	\N
6875	\N	1	\N	2	2025-11-26 04:20:21.09098	\N	\N
6876	\N	1	\N	2	2025-11-26 04:20:21.747209	\N	\N
6877	\N	1	\N	1	2025-11-26 04:20:22.358923	\N	\N
6878	\N	1	\N	1	2025-11-26 04:20:22.964569	\N	\N
6879	\N	1	\N	1	2025-11-26 04:20:23.565029	\N	\N
6880	\N	1	\N	2	2025-11-26 04:20:24.243297	\N	\N
6881	\N	1	\N	2	2025-11-26 04:20:24.928495	\N	\N
6882	\N	1	\N	2	2025-11-26 04:20:25.602449	\N	\N
6883	\N	1	\N	1	2025-11-26 04:20:26.271646	\N	\N
6884	\N	1	\N	2	2025-11-26 04:20:26.976513	\N	\N
6885	\N	1	\N	2	2025-11-26 04:20:27.577947	\N	\N
6886	\N	1	\N	2	2025-11-26 04:20:28.258062	\N	\N
6887	\N	1	\N	2	2025-11-26 04:20:28.925817	\N	\N
6888	\N	1	\N	2	2025-11-26 04:20:29.607237	\N	\N
6889	\N	1	\N	2	2025-11-26 04:20:30.271677	\N	\N
6890	\N	1	\N	1	2025-11-26 04:20:30.958808	\N	\N
6891	\N	1	\N	1	2025-11-26 04:20:31.633623	\N	\N
6892	\N	1	\N	1	2025-11-26 04:20:32.305921	\N	\N
6893	\N	1	\N	1	2025-11-26 04:20:32.914407	\N	\N
6894	\N	1	\N	1	2025-11-26 04:20:33.59808	\N	\N
6895	\N	1	\N	2	2025-11-26 04:20:34.310267	\N	\N
6896	\N	1	\N	2	2025-11-26 04:20:34.985526	\N	\N
6897	\N	1	\N	2	2025-11-26 04:20:35.674405	\N	\N
6898	\N	1	\N	2	2025-11-26 04:20:36.368646	\N	\N
6899	\N	1	\N	1	2025-11-26 04:20:37.036815	\N	\N
6900	\N	1	\N	2	2025-11-26 04:20:37.718884	\N	\N
6901	\N	1	\N	2	2025-11-26 04:20:38.400092	\N	\N
6902	\N	1	\N	1	2025-11-26 04:20:39.074219	\N	\N
6903	\N	1	\N	1	2025-11-26 04:20:39.704019	\N	\N
6904	\N	1	\N	1	2025-11-26 04:20:40.381051	\N	\N
6905	\N	1	\N	1	2025-11-26 04:20:41.026444	\N	\N
6906	\N	1	\N	2	2025-11-26 04:20:41.715278	\N	\N
6907	\N	1	\N	1	2025-11-26 04:20:42.395421	\N	\N
6908	\N	1	\N	1	2025-11-26 04:36:28.658759	\N	\N
6909	\N	1	\N	1	2025-11-26 04:36:29.307649	\N	\N
6910	\N	1	\N	1	2025-11-26 04:36:29.932529	\N	\N
6911	\N	1	\N	1	2025-11-26 04:50:09.541619	\N	\N
6912	\N	1	\N	1	2025-11-26 04:50:10.147937	\N	\N
6913	\N	1	\N	1	2025-11-26 04:50:10.830193	\N	\N
6914	\N	1	\N	1	2025-11-26 04:50:11.50264	\N	\N
6915	\N	1	\N	1	2025-11-26 05:42:42.689138	\N	\N
6916	\N	1	\N	1	2025-11-26 05:42:43.370355	\N	\N
6917	\N	1	\N	0	2025-11-26 05:42:44.01841	\N	\N
6918	\N	1	\N	1	2025-11-26 05:42:44.656319	\N	\N
6919	\N	1	\N	1	2025-11-26 05:42:45.286689	\N	\N
6920	\N	1	\N	1	2025-11-26 05:55:56.339462	\N	\N
6921	\N	1	\N	1	2025-11-26 05:55:56.923222	\N	\N
6922	\N	1	\N	1	2025-11-26 05:55:57.603454	\N	\N
6923	\N	1	\N	1	2025-11-26 05:55:58.317666	\N	\N
6924	\N	1	\N	1	2025-11-26 06:02:23.944514	\N	\N
6925	\N	1	\N	1	2025-11-26 06:02:24.685916	\N	\N
6926	\N	1	\N	1	2025-11-26 06:02:25.388878	\N	\N
6927	\N	1	\N	1	2025-11-26 06:02:26.014706	\N	\N
6928	\N	1	\N	1	2025-11-26 07:11:43.866118	\N	\N
6929	\N	1	\N	1	2025-11-26 07:11:44.555539	\N	\N
6930	\N	1	\N	1	2025-11-26 07:11:45.256555	\N	\N
6931	\N	1	\N	1	2025-11-26 07:11:45.891081	\N	\N
6932	\N	1	\N	1	2025-11-26 07:11:46.5254	\N	\N
6933	\N	1	\N	1	2025-11-26 07:11:47.144167	\N	\N
6934	\N	1	\N	1	2025-11-26 07:11:47.830126	\N	\N
6935	\N	1	\N	1	2025-11-26 07:11:48.502228	\N	\N
6936	\N	1	\N	1	2025-11-26 07:11:49.159292	\N	\N
6937	\N	1	\N	1	2025-11-26 07:11:49.784922	\N	\N
6938	\N	1	\N	1	2025-11-26 07:11:50.424484	\N	\N
6939	\N	1	\N	1	2025-11-26 07:11:51.118175	\N	\N
6940	\N	1	\N	1	2025-11-26 07:11:51.832179	\N	\N
6941	\N	1	\N	1	2025-11-26 07:11:52.50726	\N	\N
6942	\N	1	\N	1	2025-11-26 07:11:53.192057	\N	\N
6943	\N	1	\N	2	2025-11-26 07:11:53.90372	\N	\N
6944	\N	1	\N	2	2025-11-26 07:11:54.52167	\N	\N
6945	\N	1	\N	0	2025-11-26 07:11:55.186747	\N	\N
6946	\N	1	\N	0	2025-11-26 07:11:55.900044	\N	\N
6947	\N	1	\N	1	2025-11-26 07:11:56.600604	\N	\N
6948	\N	1	\N	2	2025-11-26 07:11:57.260394	\N	\N
6949	\N	1	\N	1	2025-11-26 07:11:57.899116	\N	\N
6950	\N	1	\N	2	2025-11-26 07:11:58.571484	\N	\N
6951	\N	1	\N	1	2025-11-26 08:46:39.182397	\N	\N
6952	\N	1	\N	1	2025-11-26 08:46:39.826464	\N	\N
6953	\N	1	\N	1	2025-11-26 08:46:40.468791	\N	\N
6954	\N	1	\N	1	2025-11-26 08:50:17.715176	\N	\N
6955	\N	1	\N	1	2025-11-26 08:50:18.34951	\N	\N
6956	\N	1	\N	1	2025-11-26 08:50:19.005752	\N	\N
6957	\N	1	\N	1	2025-11-26 08:50:19.622363	\N	\N
6958	\N	1	\N	1	2025-11-26 08:50:20.265907	\N	\N
6959	\N	1	\N	2	2025-11-26 08:50:20.91647	\N	\N
6960	\N	1	\N	1	2025-11-26 08:50:21.595992	\N	\N
6961	\N	1	\N	1	2025-11-26 08:55:18.149424	\N	\N
6962	\N	1	\N	1	2025-11-26 08:55:18.750264	\N	\N
6963	\N	1	\N	1	2025-11-26 09:01:45.539376	\N	\N
6964	\N	1	\N	2	2025-11-26 09:01:58.604555	\N	\N
6965	\N	1	\N	2	2025-11-26 09:01:59.273732	\N	\N
6966	\N	1	\N	2	2025-11-26 09:01:59.969233	\N	\N
6967	\N	1	\N	2	2025-11-26 09:02:00.663333	\N	\N
6968	\N	1	\N	2	2025-11-26 09:03:08.417987	\N	\N
6969	\N	1	\N	2	2025-11-26 09:03:09.082028	\N	\N
6970	\N	1	\N	2	2025-11-26 09:03:09.767104	\N	\N
6971	\N	1	\N	2	2025-11-26 09:03:10.435956	\N	\N
6972	\N	1	\N	2	2025-11-26 09:03:11.096179	\N	\N
6973	\N	1	\N	2	2025-11-26 09:03:11.754894	\N	\N
6974	\N	1	\N	2	2025-11-26 09:03:12.430077	\N	\N
6975	\N	1	\N	2	2025-11-26 09:03:13.089862	\N	\N
6976	\N	1	\N	2	2025-11-26 09:03:13.739885	\N	\N
6977	\N	1	\N	2	2025-11-26 09:03:14.391845	\N	\N
6978	\N	1	\N	2	2025-11-26 09:03:15.053769	\N	\N
6979	\N	1	\N	2	2025-11-26 09:03:15.705656	\N	\N
6980	\N	1	\N	2	2025-11-26 09:03:16.374892	\N	\N
6981	\N	1	\N	2	2025-11-26 09:03:17.03583	\N	\N
6982	\N	1	\N	1	2025-11-26 09:03:17.651712	\N	\N
6983	\N	1	\N	1	2025-11-26 09:03:18.31281	\N	\N
6984	\N	1	\N	1	2025-11-26 09:03:18.972896	\N	\N
6985	\N	1	\N	1	2025-11-26 09:03:19.629236	\N	\N
6986	\N	1	\N	1	2025-11-26 09:03:20.322223	\N	\N
6987	\N	1	\N	1	2025-11-26 09:03:20.992402	\N	\N
6988	\N	1	\N	1	2025-11-26 09:03:21.701752	\N	\N
6989	\N	1	\N	1	2025-11-26 09:03:22.382887	\N	\N
6990	\N	1	\N	1	2025-11-26 09:03:23.048275	\N	\N
6991	\N	1	\N	1	2025-11-26 09:03:23.75906	\N	\N
6992	\N	1	\N	1	2025-11-26 09:03:24.465531	\N	\N
6993	\N	1	\N	1	2025-11-26 09:03:25.129845	\N	\N
6994	\N	1	\N	1	2025-11-26 09:03:25.787566	\N	\N
6995	\N	1	\N	1	2025-11-26 09:03:26.448243	\N	\N
6996	\N	1	\N	1	2025-11-26 09:03:27.100127	\N	\N
6997	\N	1	\N	1	2025-11-26 09:03:27.704495	\N	\N
6998	\N	1	\N	1	2025-11-26 09:03:28.360979	\N	\N
6999	\N	1	\N	1	2025-11-26 09:03:29.01371	\N	\N
7000	\N	1	\N	1	2025-11-26 09:03:29.717118	\N	\N
7001	\N	1	\N	2	2025-11-26 09:03:48.018666	\N	\N
7002	\N	1	\N	2	2025-11-26 09:03:48.721865	\N	\N
7003	\N	1	\N	2	2025-11-26 09:03:49.408945	\N	\N
7004	\N	1	\N	2	2025-11-26 09:03:50.037449	\N	\N
7005	\N	1	\N	2	2025-11-26 09:03:50.657367	\N	\N
7006	\N	1	\N	2	2025-11-26 09:03:51.344799	\N	\N
7007	\N	1	\N	2	2025-11-26 09:03:52.030185	\N	\N
7008	\N	1	\N	2	2025-11-26 09:03:52.71411	\N	\N
7009	\N	1	\N	2	2025-11-26 09:03:53.376525	\N	\N
7010	\N	1	\N	2	2025-11-26 09:03:54.029203	\N	\N
7011	\N	1	\N	2	2025-11-26 09:03:54.718641	\N	\N
7012	\N	1	\N	2	2025-11-26 09:03:55.407123	\N	\N
7013	\N	1	\N	2	2025-11-26 09:03:56.085018	\N	\N
7014	\N	1	\N	2	2025-11-26 09:03:56.735375	\N	\N
7015	\N	1	\N	1	2025-11-26 09:03:57.460585	\N	\N
7016	\N	1	\N	1	2025-11-26 09:03:58.119521	\N	\N
7017	\N	1	\N	1	2025-11-26 09:03:58.790212	\N	\N
7018	\N	1	\N	1	2025-11-26 09:03:59.450303	\N	\N
7019	\N	1	\N	1	2025-11-26 09:04:00.129068	\N	\N
7020	\N	1	\N	1	2025-11-26 09:04:00.785013	\N	\N
7021	\N	1	\N	1	2025-11-26 09:04:01.44852	\N	\N
7022	\N	1	\N	1	2025-11-26 09:04:02.100195	\N	\N
7023	\N	1	\N	1	2025-11-26 09:04:02.755755	\N	\N
7024	\N	1	\N	1	2025-11-26 09:04:03.423008	\N	\N
7025	\N	1	\N	1	2025-11-26 09:04:04.085102	\N	\N
7026	\N	1	\N	1	2025-11-26 09:04:04.741343	\N	\N
7027	\N	1	\N	1	2025-11-26 09:04:05.435867	\N	\N
7028	\N	1	\N	1	2025-11-26 09:04:06.085243	\N	\N
7029	\N	1	\N	1	2025-11-26 09:04:06.754781	\N	\N
7030	\N	1	\N	1	2025-11-26 09:04:07.373675	\N	\N
7031	\N	1	\N	1	2025-11-26 09:04:08.061577	\N	\N
7032	\N	1	\N	1	2025-11-26 09:04:08.731248	\N	\N
7033	\N	1	\N	1	2025-11-26 09:04:09.397198	\N	\N
7034	\N	1	\N	2	2025-11-26 14:32:00.361512	\N	\N
7035	\N	1	\N	2	2025-11-26 14:32:01.009448	\N	\N
7036	\N	1	\N	2	2025-11-26 14:32:01.788857	\N	\N
7037	\N	1	\N	2	2025-11-26 14:32:02.483004	\N	\N
7038	\N	1	\N	2	2025-11-26 14:32:03.082613	\N	\N
7039	\N	1	\N	1	2025-11-29 11:29:44.178357	\N	\N
7040	\N	1	\N	1	2025-11-29 11:29:44.775618	\N	\N
7041	\N	1	\N	1	2025-11-29 11:29:45.454454	\N	\N
7042	\N	1	\N	1	2025-11-29 11:29:46.271944	\N	\N
7043	\N	1	\N	1	2025-11-29 11:29:46.895933	\N	\N
7044	\N	1	\N	1	2025-11-29 11:29:47.626611	\N	\N
7045	\N	1	\N	1	2025-11-29 11:29:48.285438	\N	\N
7046	\N	1	\N	1	2025-11-29 11:29:48.9129	\N	\N
7047	\N	1	\N	1	2025-11-29 11:29:49.633598	\N	\N
7048	\N	1	\N	1	2025-11-29 11:29:50.396019	\N	\N
7049	\N	1	\N	1	2025-11-29 11:29:51.182831	\N	\N
7050	\N	1	\N	1	2025-11-29 11:29:51.900636	\N	\N
7051	\N	1	\N	1	2025-11-29 11:29:52.662833	\N	\N
7052	\N	1	\N	1	2025-11-29 11:29:53.371949	\N	\N
7053	\N	1	\N	1	2025-11-29 11:29:54.141985	\N	\N
7054	\N	1	\N	1	2025-11-29 11:29:54.891053	\N	\N
7055	\N	1	\N	1	2025-11-29 11:29:55.495491	\N	\N
7056	\N	1	\N	1	2025-11-29 11:29:56.238402	\N	\N
7057	\N	1	\N	2	2025-11-29 11:29:56.969724	\N	\N
7058	\N	1	\N	1	2025-11-29 11:29:57.709149	\N	\N
7059	\N	1	\N	1	2025-11-29 11:29:58.449951	\N	\N
7060	\N	1	\N	1	2025-11-29 11:29:59.278607	\N	\N
7061	\N	1	\N	1	2025-11-29 11:30:00.071934	\N	\N
7072	\N	1	\N	2	2025-11-30 12:36:38.529877	\N	\N
7073	\N	1	\N	2	2025-11-30 12:36:39.130692	\N	\N
7074	\N	1	\N	2	2025-11-30 12:36:39.722678	\N	\N
7075	\N	1	\N	2	2025-11-30 12:36:40.500864	\N	\N
7076	\N	1	\N	2	2025-11-30 12:36:41.140797	\N	\N
7077	\N	1	\N	2	2025-11-30 12:36:41.860605	\N	\N
7078	\N	1	\N	2	2025-11-30 12:36:42.56395	\N	\N
7079	\N	1	\N	2	2025-11-30 12:36:43.270132	\N	\N
7080	\N	1	\N	2	2025-11-30 12:36:44.001108	\N	\N
7081	\N	1	\N	2	2025-11-30 12:36:44.807708	\N	\N
7082	\N	1	\N	2	2025-11-30 12:36:45.514994	\N	\N
7083	\N	1	\N	2	2025-11-30 12:36:46.43856	\N	\N
7084	\N	1	\N	2	2025-11-30 12:36:47.097412	\N	\N
7085	\N	1	\N	2	2025-11-30 12:36:47.746241	\N	\N
7086	\N	1	\N	2	2025-11-30 12:36:48.444976	\N	\N
7087	\N	1	\N	2	2025-11-30 12:36:49.169204	\N	\N
7088	\N	1	\N	2	2025-11-30 12:36:49.844634	\N	\N
7089	\N	1	\N	2	2025-11-30 12:36:50.549517	\N	\N
7090	\N	1	\N	2	2025-11-30 12:36:51.274863	\N	\N
7091	\N	1	\N	2	2025-11-30 12:36:51.944249	\N	\N
7092	\N	1	\N	2	2025-11-30 12:36:52.589603	\N	\N
7093	\N	1	\N	2	2025-11-30 12:36:53.241108	\N	\N
7094	\N	1	\N	2	2025-11-30 12:36:53.947848	\N	\N
7095	\N	1	\N	2	2025-11-30 12:36:54.568982	\N	\N
7096	\N	1	\N	2	2025-11-30 12:36:55.217858	\N	\N
7097	\N	1	\N	2	2025-11-30 12:36:55.977341	\N	\N
7098	\N	1	\N	2	2025-11-30 12:36:56.723351	\N	\N
7099	\N	1	\N	2	2025-11-30 12:36:57.463233	\N	\N
7100	\N	1	\N	2	2025-11-30 12:36:58.207169	\N	\N
7101	\N	1	\N	2	2025-11-30 12:36:58.954959	\N	\N
7102	\N	1	\N	2	2025-11-30 12:36:59.596701	\N	\N
7103	\N	1	\N	2	2025-11-30 12:37:00.247541	\N	\N
7104	\N	1	\N	2	2025-11-30 12:37:00.862789	\N	\N
7105	\N	1	\N	2	2025-11-30 12:37:01.503358	\N	\N
7106	\N	1	\N	2	2025-11-30 12:37:02.148666	\N	\N
7107	\N	1	\N	2	2025-11-30 12:37:02.773753	\N	\N
7108	\N	1	\N	2	2025-11-30 12:37:03.51525	\N	\N
7109	\N	1	\N	2	2025-11-30 12:37:04.168633	\N	\N
7110	\N	1	\N	1	2025-11-30 12:37:04.774116	\N	\N
7111	\N	1	\N	1	2025-11-30 12:37:05.403816	\N	\N
7112	\N	1	\N	1	2025-11-30 12:37:06.075696	\N	\N
7113	\N	1	\N	1	2025-11-30 12:37:06.821924	\N	\N
7114	\N	1	\N	1	2025-11-30 12:37:07.505985	\N	\N
7115	\N	1	\N	1	2025-11-30 12:37:08.240194	\N	\N
7116	\N	1	\N	1	2025-11-30 12:37:08.943477	\N	\N
7117	\N	1	\N	1	2025-11-30 12:37:09.66705	\N	\N
7118	\N	1	\N	1	2025-11-30 12:37:10.330339	\N	\N
7119	\N	1	\N	1	2025-11-30 12:37:11.001861	\N	\N
7120	\N	1	\N	2	2025-11-30 12:37:11.707766	\N	\N
7121	\N	1	\N	2	2025-11-30 12:37:12.36899	\N	\N
7122	\N	1	\N	2	2025-11-30 12:37:13.007105	\N	\N
7123	\N	1	\N	1	2025-11-30 12:37:13.772631	\N	\N
7124	\N	1	\N	2	2025-11-30 12:37:14.410447	\N	\N
7125	\N	1	\N	2	2025-11-30 12:37:15.03455	\N	\N
7126	\N	1	\N	2	2025-11-30 12:37:15.648521	\N	\N
7127	\N	1	\N	2	2025-11-30 12:37:16.404934	\N	\N
7128	\N	1	\N	2	2025-11-30 12:37:17.095381	\N	\N
7129	\N	1	\N	2	2025-11-30 12:37:17.751436	\N	\N
7130	\N	1	\N	2	2025-11-30 12:37:18.600259	\N	\N
7131	\N	1	\N	2	2025-11-30 12:37:19.343837	\N	\N
7132	\N	1	\N	2	2025-11-30 12:37:40.282052	\N	\N
7133	\N	1	\N	2	2025-11-30 12:37:40.917025	\N	\N
7134	\N	1	\N	2	2025-11-30 12:37:41.541373	\N	\N
7135	\N	1	\N	2	2025-11-30 12:37:42.1351	\N	\N
7136	\N	1	\N	2	2025-11-30 12:37:42.822127	\N	\N
7137	\N	1	\N	2	2025-11-30 12:37:43.569933	\N	\N
7138	\N	1	\N	2	2025-11-30 12:38:14.159069	\N	\N
7139	\N	1	\N	2	2025-11-30 12:38:14.862872	\N	\N
7140	\N	1	\N	2	2025-11-30 12:38:15.537037	\N	\N
7141	\N	1	\N	2	2025-11-30 12:38:16.159597	\N	\N
7142	\N	1	\N	2	2025-11-30 12:38:16.844303	\N	\N
7143	\N	1	\N	2	2025-11-30 12:38:17.579216	\N	\N
7144	\N	1	\N	2	2025-11-30 12:38:18.231849	\N	\N
7145	\N	1	\N	2	2025-11-30 12:38:18.90723	\N	\N
7146	\N	1	\N	2	2025-11-30 12:38:19.550504	\N	\N
7147	\N	1	\N	2	2025-11-30 12:38:20.156404	\N	\N
7148	\N	1	\N	2	2025-11-30 12:38:20.957053	\N	\N
7149	\N	1	\N	2	2025-11-30 12:38:21.608475	\N	\N
7150	\N	1	\N	2	2025-11-30 12:38:22.691897	\N	\N
7151	\N	1	\N	2	2025-11-30 12:38:23.476823	\N	\N
7152	\N	1	\N	2	2025-11-30 12:38:24.22711	\N	\N
7153	\N	1	\N	2	2025-11-30 12:38:24.948897	\N	\N
7154	\N	1	\N	2	2025-11-30 12:38:25.699731	\N	\N
7155	\N	1	\N	2	2025-11-30 12:38:26.462942	\N	\N
7156	\N	1	\N	2	2025-11-30 12:38:27.177413	\N	\N
7157	\N	1	\N	2	2025-11-30 12:38:27.915724	\N	\N
7158	\N	1	\N	2	2025-11-30 12:38:28.705223	\N	\N
7159	\N	1	\N	2	2025-11-30 12:38:29.374649	\N	\N
7160	\N	1	\N	2	2025-11-30 12:38:29.975615	\N	\N
7161	\N	1	\N	2	2025-11-30 12:38:30.794487	\N	\N
7162	\N	1	\N	2	2025-11-30 12:38:31.504906	\N	\N
7163	\N	1	\N	2	2025-11-30 12:38:32.189172	\N	\N
7164	\N	1	\N	2	2025-11-30 12:38:32.897422	\N	\N
7165	\N	1	\N	2	2025-11-30 12:38:33.601643	\N	\N
7166	\N	1	\N	2	2025-11-30 12:38:34.228943	\N	\N
7167	\N	1	\N	2	2025-11-30 12:38:34.87074	\N	\N
7168	\N	1	\N	2	2025-11-30 12:38:35.505841	\N	\N
7169	\N	1	\N	2	2025-11-30 12:38:36.171573	\N	\N
7170	\N	1	\N	2	2025-11-30 12:38:36.871043	\N	\N
7171	\N	1	\N	2	2025-11-30 12:38:37.626504	\N	\N
7172	\N	1	\N	2	2025-11-30 12:38:38.327422	\N	\N
7173	\N	1	\N	2	2025-11-30 12:38:39.124905	\N	\N
7174	\N	1	\N	2	2025-11-30 12:38:39.842291	\N	\N
7175	\N	1	\N	2	2025-11-30 12:38:40.580756	\N	\N
7176	\N	1	\N	2	2025-11-30 12:38:41.280522	\N	\N
7177	\N	1	\N	2	2025-11-30 12:38:41.990324	\N	\N
7178	\N	1	\N	2	2025-11-30 12:38:42.738278	\N	\N
7179	\N	1	\N	2	2025-11-30 12:38:43.412361	\N	\N
7180	\N	1	\N	2	2025-11-30 12:38:44.043601	\N	\N
7181	\N	1	\N	1	2025-11-30 12:38:44.725933	\N	\N
7182	\N	1	\N	1	2025-11-30 12:38:45.436773	\N	\N
7183	\N	1	\N	1	2025-11-30 12:38:46.111801	\N	\N
7184	\N	1	\N	1	2025-11-30 12:38:46.760338	\N	\N
7185	\N	1	\N	1	2025-11-30 12:38:47.420711	\N	\N
7186	\N	1	\N	1	2025-11-30 12:38:48.120576	\N	\N
7187	\N	1	\N	1	2025-11-30 12:38:48.771935	\N	\N
7188	\N	1	\N	1	2025-11-30 12:38:49.531784	\N	\N
7189	\N	1	\N	1	2025-11-30 12:38:50.163708	\N	\N
7190	\N	1	\N	2	2025-11-30 12:38:50.818549	\N	\N
7191	\N	1	\N	2	2025-11-30 12:38:51.48189	\N	\N
7192	\N	1	\N	2	2025-11-30 12:38:52.114092	\N	\N
7193	\N	1	\N	2	2025-11-30 12:38:52.73367	\N	\N
7194	\N	1	\N	2	2025-11-30 12:38:53.38685	\N	\N
7195	\N	1	\N	2	2025-11-30 12:38:54.061568	\N	\N
7196	\N	1	\N	2	2025-11-30 12:38:54.81001	\N	\N
7197	\N	1	\N	2	2025-11-30 12:38:55.539186	\N	\N
7198	\N	1	\N	2	2025-11-30 12:38:56.21928	\N	\N
7199	\N	1	\N	2	2025-11-30 12:38:56.992673	\N	\N
7200	\N	1	\N	2	2025-11-30 12:38:57.765789	\N	\N
7201	\N	1	\N	2	2025-11-30 12:38:58.376575	\N	\N
7202	\N	1	\N	2	2025-11-30 12:38:58.991487	\N	\N
7203	\N	1	\N	2	2025-11-30 12:38:59.69687	\N	\N
7204	\N	1	\N	2	2025-11-30 12:39:00.466378	\N	\N
7205	\N	1	\N	2	2025-11-30 12:39:01.119867	\N	\N
7206	\N	1	\N	2	2025-11-30 12:39:01.761883	\N	\N
7207	\N	1	\N	2	2025-11-30 12:39:02.430946	\N	\N
7208	\N	1	\N	2	2025-11-30 12:39:03.138009	\N	\N
7209	\N	1	\N	2	2025-11-30 12:39:03.783017	\N	\N
7210	\N	1	\N	2	2025-11-30 12:39:04.508916	\N	\N
7211	\N	1	\N	2	2025-11-30 12:39:05.369548	\N	\N
7212	\N	2	\N	1	2025-12-01 18:09:25.330865	\N	\N
7213	\N	2	\N	1	2025-12-01 18:09:25.998609	\N	\N
7214	\N	2	\N	1	2025-12-01 18:09:26.828645	\N	\N
7215	\N	2	\N	1	2025-12-01 18:09:27.613915	\N	\N
7216	\N	2	\N	1	2025-12-01 18:09:28.315807	\N	\N
7217	\N	2	\N	1	2025-12-01 18:09:28.982832	\N	\N
7218	\N	2	\N	1	2025-12-01 18:09:29.782087	\N	\N
7219	\N	2	\N	1	2025-12-01 18:09:30.578465	\N	\N
7220	\N	2	\N	1	2025-12-01 18:09:31.344608	\N	\N
7221	\N	2	\N	1	2025-12-01 18:09:32.059063	\N	\N
7222	\N	2	\N	1	2025-12-01 18:09:32.849479	\N	\N
7223	\N	2	\N	1	2025-12-01 18:09:33.636125	\N	\N
7224	\N	2	\N	1	2025-12-01 18:09:34.448145	\N	\N
7225	\N	2	\N	1	2025-12-01 18:09:35.227452	\N	\N
7226	\N	2	\N	1	2025-12-01 18:09:36.018975	\N	\N
7227	\N	2	\N	1	2025-12-01 18:09:36.818329	\N	\N
7228	\N	2	\N	1	2025-12-01 18:09:37.611674	\N	\N
7229	\N	2	\N	1	2025-12-01 18:09:38.391059	\N	\N
7230	\N	2	\N	1	2025-12-01 18:09:39.191347	\N	\N
7231	\N	2	\N	1	2025-12-01 18:09:39.84265	\N	\N
7232	\N	2	\N	1	2025-12-01 18:09:40.647829	\N	\N
7233	\N	2	\N	1	2025-12-01 18:09:41.51379	\N	\N
7234	\N	2	\N	1	2025-12-01 18:09:42.208776	\N	\N
7235	\N	2	\N	1	2025-12-01 18:09:42.983972	\N	\N
7236	\N	2	\N	1	2025-12-01 18:09:43.638168	\N	\N
7237	\N	2	\N	1	2025-12-01 18:09:44.302394	\N	\N
7238	\N	2	\N	1	2025-12-01 18:09:44.953725	\N	\N
7239	\N	2	\N	1	2025-12-01 18:09:45.751019	\N	\N
7240	\N	2	\N	1	2025-12-01 18:09:46.442589	\N	\N
\.


--
-- TOC entry 3822 (class 0 OID 16683)
-- Dependencies: 236
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.payment_methods (id, code, name) FROM stdin;
1	momo	MoMo Pay
2	zalopay	ZaloPay
3	atm_qr	ATM/Napas QR
\.


--
-- TOC entry 3824 (class 0 OID 16692)
-- Dependencies: 238
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.payments (id, booking_id, method_id, amount, currency, provider_txn_id, status, qr_url, qr_payload, provider_meta, created_at, updated_at) FROM stdin;
1	1	1	1840000	VND	TXN_1764874825573_5qihp1x	success	\N	\N	{"userId": "13", "roomCode": "P1", "username": "win vo", "userEmail": "vovananhkhoa2505@gmail.com", "customHours": null, "description": "Payment for Private Office booking (P1)", "serviceType": "private_office", "requestedEnd": "2026-03-12", "userFullName": "win vo khoa", "paymentMethod": "bank-transfer", "paymentSource": "team-booking", "requestedStart": "2025-12-12", "serviceCategory": "team", "durationPackageId": "81"}	2025-12-04 19:00:25.578392	2025-12-04 19:00:32.684358
3	3	1	38400	VND	TXN_1764912613093_gcib6tr	success	\N	\N	{"userId": "13", "username": "win vo", "userEmail": "vovananhkhoa2505@gmail.com", "description": "Pending payment for booking SWS-MISFEFVE-HQEE6", "userFullName": "win vo khoa", "paymentMethod": "bank-transfer"}	2025-12-05 05:30:13.094494	2025-12-05 05:30:27.469409
\.


--
-- TOC entry 3845 (class 0 OID 33387)
-- Dependencies: 262
-- Data for Name: qr_checkins; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.qr_checkins (id, booking_id, user_id, qr_code_id, status, check_in_at, check_out_at, notes, rating, device_info, location, actual_seat, created_at, updated_at) FROM stdin;
ed6e3999-047b-4d91-bc09-81b6b79487f1	3	13	8e4281d7-937c-43d0-9353-a9c15bc42b11	checked-in	2025-12-05 06:05:24.244627+00	\N	\N	\N	{"method": "camera", "source": "admin-portal", "ipAddress": "::1", "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0", "triggeredAt": "2025-12-05T06:05:24.193Z"}	{}	Hot Desk Flex Access	2025-12-05 06:05:24.244627+00	2025-12-05 06:05:24.244627+00
\.


--
-- TOC entry 3844 (class 0 OID 33366)
-- Dependencies: 261
-- Data for Name: qrcodes; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.qrcodes (id, booking_id, qr_string, secret_key, qr_data, expires_at, usage_count, max_usage, is_active, created_at, updated_at) FROM stdin;
e3ea21a1-a686-42dc-9624-f162d251aee1	1	SWS-1764874832705-e380220d919f7a00	2ca77e8e8add5294abb295bfec5cad819e2ea1845ba934243b0f5d3bdd2185d1	{"userId": "13", "endDate": "2026-03-11T22:59:00.000Z", "seatName": "P1", "bookingId": "1", "startDate": "2025-12-11T23:00:00.000Z", "serviceType": "private_office", "bookingReference": "SWS-MIRSWITI-3Z3C3"}	2026-03-11 23:59:00+00	0	20	t	2025-12-04 19:00:32.703937+00	2025-12-04 19:00:32.703937+00
8e4281d7-937c-43d0-9353-a9c15bc42b11	3	SWS-1764912627484-6d3f4ccd18ae7589	abcca8fbbb37c0b9c2d94cdc76afd872f5b8ae99dc45937e802c6874e2217ae4	{"userId": "13", "endDate": "2025-12-06T05:59:00.000Z", "seatName": "Hot Desk Flex Access", "bookingId": "3", "startDate": "2025-12-05T06:00:00.000Z", "serviceType": "hot-desk", "bookingReference": "SWS-MISFEFVE-HQEE6"}	2025-12-06 06:59:00+00	15	20	t	2025-12-05 05:30:27.484742+00	2025-12-05 06:37:41.302458+00
\.


--
-- TOC entry 3826 (class 0 OID 16717)
-- Dependencies: 240
-- Data for Name: refunds; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.refunds (id, payment_id, amount, reason, status, provider_refund_id, created_at) FROM stdin;
\.


--
-- TOC entry 3818 (class 0 OID 16619)
-- Dependencies: 232
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.rooms (id, zone_id, room_code, capacity, status, pos_x, pos_y, display_name, attributes) FROM stdin;
514	3	M4	13	available	\N	\N	\N	\N
17759	3	M3	11	available	\N	\N	\N	\N
17762	4	er	1	available	\N	\N	\N	\N
17760	3	M1	14	available	\N	\N	\N	\N
17758	3	M2	13	available	\N	\N	\N	\N
17391	4	m6	1	available	\N	\N	\N	\N
16926	4	P1	43	available	\N	\N	\N	\N
17761	5	N1	28	available	\N	\N	\N	\N
16986	5	N2	32	available	\N	\N	\N	\N
6	5	N3	60	available	\N	\N	\N	\N
16605	4	p2	1	available	\N	\N	\N	\N
\.


--
-- TOC entry 3816 (class 0 OID 16604)
-- Dependencies: 230
-- Data for Name: seats; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.seats (id, zone_id, seat_code, status, pos_x, pos_y, capacity) FROM stdin;
21	1	FD-21	occupied	\N	\N	1
77	1	FD-22	available	\N	\N	1
78	1	d33	available	\N	\N	1
10	1	FD-10	available	\N	\N	1
11	1	FD-11	available	\N	\N	1
5	1	FD-5	available	\N	\N	1
16	1	FD-16	available	\N	\N	1
19	1	FD-19	available	\N	\N	1
9	1	FD-9	available	\N	\N	1
7	1	FD-7	available	\N	\N	1
6	1	FD-6	available	\N	\N	1
8	1	FD-8	available	\N	\N	1
12	1	FD-12	available	\N	\N	1
13	1	FD-13	available	\N	\N	1
14	1	FD-14	available	\N	\N	1
15	1	FD-15	occupied	\N	\N	1
75	1	FD-1	available	\N	\N	1
4	1	FD-4	available	\N	\N	1
17	1	FD-17	occupied	\N	\N	1
18	1	FD-18	occupied	\N	\N	1
2	1	FD-2	available	\N	\N	1
20	1	FD-20	available	\N	\N	1
3	1	FD-3	available	\N	\N	1
\.


--
-- TOC entry 3804 (class 0 OID 16507)
-- Dependencies: 218
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.service_categories (id, code, name) FROM stdin;
1	freelance	Freelance
2	team	Team
\.


--
-- TOC entry 3830 (class 0 OID 16741)
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
-- TOC entry 3814 (class 0 OID 16577)
-- Dependencies: 228
-- Data for Name: service_packages; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.service_packages (id, service_id, name, description, price, unit_id, access_days, features, thumbnail_url, badge, max_capacity, status, created_by, created_at, updated_at, bundle_hours, is_custom, price_per_unit, discount_pct) FROM stdin;
104	4	Meeting Room – 5 Hours	A spacious and well-equipped room for half-day workshops, planning sessions, or team collaborations.	800000	1	\N	["Comfortable private room for extended use", "Stable high-speed Wi-Fi", "Projector/TV & whiteboard", "Complimentary drinks and stationery"]	\N	\N	\N	active	\N	2025-11-11 10:13:21.099339	2025-11-16 06:52:27.297956	5	f	\N	10
102	4	Meeting Room – 1 Hour	A professional meeting space for quick discussions, interviews, or client calls.	70000	1	\N	["Private room with comfortable seating", "High-speed Wi-Fi", "TV/Projector support", "Complimentary water/tea"]	\N	\N	\N	active	\N	2025-11-11 10:12:29.599146	2025-11-16 06:53:00.510903	1	f	\N	5
112	3	Private Office – 1 Year	A long-term private office plan designed for teams seeking maximum stability and premium facilities.	8000000	5	365	["Permanent private workspace", "Ultra-stable high-speed Wi-Fi", "Free drinks & printing allowance", "Priority meeting room booking"]	\N	\N	\N	active	\N	2025-11-16 06:57:28.534854	2025-11-16 06:57:33.613237	\N	f	\N	8
113	4	444	44	45645	1	\N	["44"]	\N	\N	\N	active	\N	2025-12-04 18:22:14.265533	2025-12-04 18:22:14.265533	3	f	\N	4
106	5	Networking – 1 Day	A full-day access pass designed for hosting networking events, workshops, or community activities.	900000	2	1	["Dedicated networking zone", "High-speed Internet", "Complimentary beverages", "Event support & setup assistance"]	\N	\N	\N	active	\N	2025-11-11 14:52:04.318636	2025-11-16 06:54:58.407746	\N	f	\N	0
95	5	Networking – 3 Hours	A dynamic space for short networking sessions, meetups, or quick community gatherings.	485000	1	\N	["Open social area", "High-speed Wi-Fi", "Complimentary drinks", "Basic event support"]	\N	\N	\N	active	\N	2025-11-11 07:01:17.965778	2025-11-16 06:55:01.840409	3	f	\N	0
89	1	Hot Desk – Day	Flexible workspace for a productive day with full access to shared amenities.	40000	2	1	["Open seating in shared areas", "High-speed Wi-Fi", "Free coffee & tea", "Access to common zones"]	\N	\N	\N	active	\N	2025-11-10 17:59:15.647288	2025-11-16 06:47:37.549982	\N	f	\N	4
81	3	Private Office – 3 Months	A fully equipped private office for short-term business needs with complete privacy and comfort.	2000000	4	90	["Exclusive office space", "High-speed Wi-Fi", "Free coffee & tea", "Access to meeting rooms"]	\N	\N	\N	active	\N	2025-10-31 07:34:29.343472	2025-11-16 06:56:21.308951	\N	\N	\N	8
76	2	Fixed desk-month	A dedicated monthly workspace giving you full stability, comfort, and access to all coworking amenities. Ideal for freelancers and remote workers who need a consistent environment for long-term productivity.	900000	4	30	["Permanent desk access for the entire month", "High-speed, reliable Wi-Fi", "Complimentary coffee, tea, and water", "Meeting room access with included monthly credits"]	\N	\N	\N	active	\N	2025-10-31 04:28:07.950123	2025-11-16 06:44:00.734637	\N	\N	\N	5
82	3	Private Office – 6 Months	A half-year private office solution offering stability, security, and full business amenities.	3000000	4	180	["Secure dedicated office", "Reliable high-speed Internet", "Complimentary beverages", "Meeting room credits included"]	\N	\N	\N	active	\N	2025-11-02 02:48:09.091167	2025-11-16 06:56:56.64272	\N	\N	\N	5
72	2	Fixed desk-week	A dedicated desk in a professional coworking environment, ideal for freelancers who need stability and focus. Enjoy a comfortable workspace with full amenities throughout the week.	300000	2	1	["Dedicated desk access for the entire week", "High-speed Wi-Fi", "Complimentary coffee and tea", "Meeting room access with included hours"]	\N	\N	\N	active	\N	2025-10-28 03:56:13.069602	2025-11-16 06:44:25.633858	\N	\N	\N	5
101	1	Hot Desk – Month	A monthly flexible seat option ideal for freelancers wanting mobility and convenience.	700000	4	30	["Flexible seating for 30 days", "High-speed Wi-Fi", "Free beverages", "Access to shared spaces & meeting rooms"]	\N	\N	\N	active	\N	2025-11-11 07:34:44.339817	2025-11-16 06:48:58.908122	\N	f	\N	0
88	2	Fixed desk-day	Your personal fixed workspace designed for productivity and comfort. Perfect for individuals seeking a consistent working spot with modern facilities.	50000	3	7	["Private desk available 7 days a week", "Reliable high-speed Internet", "Free printing (basic quota)", "Flexible meeting room usage"]	\N	\N	\N	active	\N	2025-11-10 17:11:50.873014	2025-11-16 06:44:39.531469	\N	f	\N	0
97	2	Fixed desk-year	An annual fixed-desk package designed for professionals seeking long-term workspace stability. Enjoy premium facilities, priority services, and the best cost-saving option for a full year.	8000000	5	365	["Dedicated desk guaranteed for 12 months", "Ultra-stable high-speed Internet", "Free beverages & printing allowance", "Priority booking for meeting rooms"]	\N	\N	\N	active	\N	2025-11-11 07:05:47.498861	2025-11-16 06:45:23.164517	\N	f	\N	0
99	1	 Hot Desk – Week	A flexible weekly pass giving you access to shared desks and essential facilities.	280000	3	7	["Unlimited hot desk access", "Fast and stable Internet", "Complimentary drinks", "Shared meeting room access"]	\N	\N	\N	active	\N	2025-11-11 07:08:10.248172	2025-11-16 06:49:14.299376	\N	f	\N	0
100	1	Hot Desk – Year	A cost-effective annual plan offering full flexibility in a dynamic coworking environment.	7000000	5	365	["Unlimited hot desk access for 12 months", "Reliable high-speed Wi-Fi", "Complimentary drinks & printing quota", "Access to all common areas and meeting rooms"]	\N	\N	\N	active	\N	2025-11-11 07:08:15.040897	2025-11-16 06:49:40.462477	\N	f	\N	5
\.


--
-- TOC entry 3806 (class 0 OID 16516)
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
-- TOC entry 3802 (class 0 OID 16498)
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
-- TOC entry 3843 (class 0 OID 33346)
-- Dependencies: 260
-- Data for Name: user_payment_methods; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.user_payment_methods (id, user_id, code, display_name, data, is_default, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3812 (class 0 OID 16563)
-- Dependencies: 226
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: swspace_user
--

COPY public.users (id, email, phone, password_hash, full_name, role, status, avatar_url, created_at, updated_at, reset_password_token_hash, reset_password_expires_at, username, last_login) FROM stdin;
14	dinhngochan31052004@gmail.com	\N	$2a$10$4PgDolNF9vSk3K.oZqqUduYp2cmbC58U.OnOullDcLF.DT7QipGd6	han han	user	active	\N	2025-11-11 10:37:32.084258	2025-11-12 03:50:28.670198	\N	\N	hanne	2025-11-12 03:50:28.670198
11	win_cli_1762779465882@example.com	0909	$2a$10$8PJm93rOcDM6FVvWaLOMiesIrcnl09GKHQwrA/wf44P2vrHoIOImu	Win CLI	user	active	\N	2025-11-10 12:57:46.276121	2025-12-01 05:51:40.458769	\N	\N	win_cli_2098	\N
6	vokhoa	\N	$2a$10$zNYYhHGOc9ZgWOWwMHyfmuJpJn4W8AoCkV1ppaqj6pasH02M40T6C	\N	user	active	\N	2025-10-30 17:55:31.047464	2025-11-27 14:26:06.402347	\N	\N	vokhoa	2025-11-27 14:26:06.402347
18	nui123@gmail.com		$2a$10$ESXNZFQcHtRrZEmJ3opcBOJ85cWnsS4ikxuusOv4tFZCsmEfHWY3q	nui nui	user	active	\N	2025-11-18 16:38:35.754433	2025-12-01 05:51:55.33002	\N	\N	nuivip	\N
1	admin@swspace.vn	0900000000	$2y$10$hashdemo	Admin	admin	active	\N	2025-10-25 11:46:00.481205	2025-11-10 07:26:46.263678	\N	\N	admin	\N
3	admin@swspace.local	\N	$2b$10$ug0rzYcbJzlI1nWsA.joQetRdQeXvuwDyPYURibs.AICFtifXV2IW	System Admin	admin	active	\N	2025-10-29 14:10:06.510648	2025-11-10 07:26:46.263678	\N	\N	admin_2	\N
7	thuong	\N	$2a$10$P6IDmrCczaslTGXV1qH53eJC1b/U3E5qYZfCZRUcboFWVDLDQOdF6	\N	user	active	\N	2025-10-30 17:59:44.46629	2025-11-10 07:26:46.263678	\N	\N	thuong	\N
2	user@swspace.vn	0900000001	$2y$10$hashdemo	Demo User	user	active	\N	2025-10-25 11:46:00.481205	2025-11-10 07:26:46.263678	\N	\N	user	\N
4	user@example.com	\N	$2a$10$4UeaGPYpX/vSctuYG6M1geAOc7YWaxrgJP9mnw7/SrogpyROo4Pku	\N	user	active	\N	2025-10-30 13:23:39.57932	2025-11-10 07:26:46.263678	\N	\N	user_2	\N
9	vkhoa	\N	$2a$10$Co7qM8jpAT3gMYt6q.1McuJoOgwlohNek8GYokVsGaf9wu/SZz16u	\N	user	active	\N	2025-10-31 04:01:12.096586	2025-11-10 07:26:46.263678	\N	\N	vkhoa	\N
8	vovananhkhoa_5015	\N	$2a$10$PXLbTFqS/UJxOCLoDECGgeayTWEeCPGA6SNRiU7p5mFimaOjQE6G.	\N	user	active	\N	2025-10-30 18:07:05.465657	2025-11-10 07:26:46.263678	\N	\N	vovananhkhoa_5015	\N
12	win_cli_1762779637543@example.com	0909	$2a$10$N5LeZVz5GRWmlQiN/Oc3TO0tzwQK2Nhv1lEmD7MUNYbWNyopEamoe	Win CLI	user	active	\N	2025-11-10 13:00:37.941625	2025-11-10 13:00:38.173346	\N	\N	win_cli_6213	2025-11-10 13:00:38.173346
24	playwright-admin@example.com	123456789	$2a$10$DkeNilzPsGYUs1ewPhTHfOxe//1QYp2oUuScO4xt0cZD8IOePJOy.	Playwright Admin	admin	active	\N	2025-12-01 12:15:05.281463	2025-12-01 12:42:13.776019	\N	\N	playwrightadmin	\N
17	vokhoa123@gmail.com	\N	$2a$10$MJTSlE6Mao1hoVJ.huS9.OKcpL/XIHKF.xOabBPJV8nOIIChUnz2y	khoavip	user	active	\N	2025-11-16 07:37:47.290536	2025-11-16 07:37:47.290536	\N	\N	vvakhoa	\N
15	vovananhkhoa205@gmail.com	\N	$2a$10$xmRbGi3M8AGV.Oj9wklhHeSh7deibKD.A13Txftoydyt2KLX5s2nu	khoa khoa	user	active	\N	2025-11-13 08:14:34.88571	2025-11-13 08:14:34.88571	\N	\N	khoavip	\N
10	nui	\N	$2a$10$wdqOIWIGINkRDqFIZkaB..BJydeLSVK25pviJ5hyIXTfJUVKsYv5S	\N	user	active	\N	2025-10-31 07:43:36.885883	2025-11-26 14:46:26.121047	\N	\N	nui	2025-11-26 14:46:26.121047
16	wingspet2025@gmail.com	\N	$2a$10$tnloqAvMaMpxhulhLZbrdel2QrD2IEYW6NoEHURM4PpO5QDLLg48O	khoa khoa	user	active	\N	2025-11-14 03:54:38.328932	2025-11-27 17:42:50.804119	\N	\N	khoakhoa	2025-11-27 17:42:50.804119
21	cli.tester@example.com	0123	$2a$10$PofIwyPgCFetNmKuhdlR8.Hrv1jkjIpsPihttB6LWpnGgc.9CLdSu	CLI Tester	user	active	\N	2025-12-01 11:17:10.754349	2025-12-01 12:23:28.582097	\N	\N	clitester	\N
26	duchauts2611@gmail.com	0931016652	$2a$10$18tK/eY7589sAFvfniBdkunPor0Ssx3buqDxEqh1MmdYW7uak3alG	ggg	user	active	\N	2025-12-01 13:05:07.625248	2025-12-01 13:05:36.486946	\N	\N	huhunh	\N
13	vovananhkhoa2505@gmail.com		$2a$10$ohRB1JPI737aGt5FPI/P1Oxqatv59ATnWt1C4e4trcjquMYRtIt3O	win vo khoa	user	active	\N	2025-11-10 13:09:15.998779	2025-12-05 05:29:16.786791	\N	\N	win vo	2025-12-05 05:29:16.786791
5	admin@example.com		$2a$10$yXgpit/8COmnJL0vMdBtdexudbSG.WnE907bbYTW/UQZchVIS2Nb2	Admin	admin	active	\N	2025-10-30 13:35:36.309094	2025-12-05 06:32:20.255046	\N	\N	admin_3	2025-12-05 06:32:20.255046
\.


--
-- TOC entry 3810 (class 0 OID 16541)
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
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 254
-- Name: auth_sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.auth_sessions_id_seq', 146, true);


--
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 252
-- Name: automation_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.automation_actions_id_seq', 1, false);


--
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 233
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.bookings_id_seq', 5, true);


--
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 241
-- Name: cancellation_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.cancellation_policies_id_seq', 1, true);


--
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 246
-- Name: checkins_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.checkins_id_seq', 1, false);


--
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 221
-- Name: floors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.floors_id_seq', 3, true);


--
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 248
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 250
-- Name: occupancy_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.occupancy_events_id_seq', 7240, true);


--
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 235
-- Name: payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.payment_methods_id_seq', 3, true);


--
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 237
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.payments_id_seq', 5, true);


--
-- TOC entry 3883 (class 0 OID 0)
-- Dependencies: 239
-- Name: refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.refunds_id_seq', 1, false);


--
-- TOC entry 3884 (class 0 OID 0)
-- Dependencies: 231
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.rooms_id_seq', 17762, true);


--
-- TOC entry 3885 (class 0 OID 0)
-- Dependencies: 229
-- Name: seats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.seats_id_seq', 78, true);


--
-- TOC entry 3886 (class 0 OID 0)
-- Dependencies: 217
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 2, true);


--
-- TOC entry 3887 (class 0 OID 0)
-- Dependencies: 243
-- Name: service_floor_rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.service_floor_rules_id_seq', 5, true);


--
-- TOC entry 3888 (class 0 OID 0)
-- Dependencies: 227
-- Name: service_packages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.service_packages_id_seq', 113, true);


--
-- TOC entry 3889 (class 0 OID 0)
-- Dependencies: 219
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.services_id_seq', 5, true);


--
-- TOC entry 3890 (class 0 OID 0)
-- Dependencies: 215
-- Name: time_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.time_units_id_seq', 5, true);


--
-- TOC entry 3891 (class 0 OID 0)
-- Dependencies: 259
-- Name: user_payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.user_payment_methods_id_seq', 1, false);


--
-- TOC entry 3892 (class 0 OID 0)
-- Dependencies: 225
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.users_id_seq', 27, true);


--
-- TOC entry 3893 (class 0 OID 0)
-- Dependencies: 223
-- Name: zones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: swspace_user
--

SELECT pg_catalog.setval('public.zones_id_seq', 5, true);


--
-- TOC entry 3602 (class 2606 OID 16844)
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 3600 (class 2606 OID 16834)
-- Name: automation_actions automation_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.automation_actions
    ADD CONSTRAINT automation_actions_pkey PRIMARY KEY (id);


--
-- TOC entry 3563 (class 2606 OID 16646)
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- TOC entry 3592 (class 2606 OID 16763)
-- Name: cameras cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_pkey PRIMARY KEY (id);


--
-- TOC entry 3586 (class 2606 OID 16739)
-- Name: cancellation_policies cancellation_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cancellation_policies
    ADD CONSTRAINT cancellation_policies_pkey PRIMARY KEY (id);


--
-- TOC entry 3594 (class 2606 OID 16783)
-- Name: checkins checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_pkey PRIMARY KEY (id);


--
-- TOC entry 3530 (class 2606 OID 16539)
-- Name: floors floors_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_code_key UNIQUE (code);


--
-- TOC entry 3532 (class 2606 OID 16537)
-- Name: floors floors_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.floors
    ADD CONSTRAINT floors_pkey PRIMARY KEY (id);


--
-- TOC entry 3596 (class 2606 OID 16804)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3598 (class 2606 OID 16824)
-- Name: occupancy_events occupancy_events_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.occupancy_events
    ADD CONSTRAINT occupancy_events_pkey PRIMARY KEY (id);


--
-- TOC entry 3575 (class 2606 OID 16690)
-- Name: payment_methods payment_methods_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_code_key UNIQUE (code);


--
-- TOC entry 3577 (class 2606 OID 16688)
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3580 (class 2606 OID 16705)
-- Name: payments payments_booking_id_method_id_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_method_id_key UNIQUE (booking_id, method_id);


--
-- TOC entry 3582 (class 2606 OID 16703)
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- TOC entry 3615 (class 2606 OID 33400)
-- Name: qr_checkins qr_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_pkey PRIMARY KEY (id);


--
-- TOC entry 3609 (class 2606 OID 33378)
-- Name: qrcodes qrcodes_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_pkey PRIMARY KEY (id);


--
-- TOC entry 3611 (class 2606 OID 33380)
-- Name: qrcodes qrcodes_qr_string_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_qr_string_key UNIQUE (qr_string);


--
-- TOC entry 3584 (class 2606 OID 16725)
-- Name: refunds refunds_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_pkey PRIMARY KEY (id);


--
-- TOC entry 3558 (class 2606 OID 16625)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 3560 (class 2606 OID 16627)
-- Name: rooms rooms_zone_id_room_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_zone_id_room_code_key UNIQUE (zone_id, room_code);


--
-- TOC entry 3552 (class 2606 OID 16610)
-- Name: seats seats_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_pkey PRIMARY KEY (id);


--
-- TOC entry 3554 (class 2606 OID 16612)
-- Name: seats seats_zone_id_seat_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_zone_id_seat_code_key UNIQUE (zone_id, seat_code);


--
-- TOC entry 3521 (class 2606 OID 16514)
-- Name: service_categories service_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_code_key UNIQUE (code);


--
-- TOC entry 3523 (class 2606 OID 16512)
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3588 (class 2606 OID 16746)
-- Name: service_floor_rules service_floor_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_pkey PRIMARY KEY (id);


--
-- TOC entry 3590 (class 2606 OID 16748)
-- Name: service_floor_rules service_floor_rules_service_id_floor_id_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_service_id_floor_id_key UNIQUE (service_id, floor_id);


--
-- TOC entry 3549 (class 2606 OID 16587)
-- Name: service_packages service_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 3526 (class 2606 OID 16525)
-- Name: services services_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_code_key UNIQUE (code);


--
-- TOC entry 3528 (class 2606 OID 16523)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 3517 (class 2606 OID 16505)
-- Name: time_units time_units_code_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.time_units
    ADD CONSTRAINT time_units_code_key UNIQUE (code);


--
-- TOC entry 3519 (class 2606 OID 16503)
-- Name: time_units time_units_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.time_units
    ADD CONSTRAINT time_units_pkey PRIMARY KEY (id);


--
-- TOC entry 3605 (class 2606 OID 33358)
-- Name: user_payment_methods user_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 3541 (class 2606 OID 16575)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3543 (class 2606 OID 25075)
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- TOC entry 3545 (class 2606 OID 16573)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3536 (class 2606 OID 16551)
-- Name: zones zones_floor_id_service_id_name_key; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_floor_id_service_id_name_key UNIQUE (floor_id, service_id, name);


--
-- TOC entry 3538 (class 2606 OID 16549)
-- Name: zones zones_pkey; Type: CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_pkey PRIMARY KEY (id);


--
-- TOC entry 3561 (class 1259 OID 33268)
-- Name: bookings_booking_reference_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX bookings_booking_reference_idx ON public.bookings USING btree (booking_reference);


--
-- TOC entry 3564 (class 1259 OID 33270)
-- Name: bookings_seat_interval_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX bookings_seat_interval_idx ON public.bookings USING btree (seat_code, start_time, end_time);


--
-- TOC entry 3565 (class 1259 OID 33271)
-- Name: bookings_status_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX bookings_status_idx ON public.bookings USING btree (status);


--
-- TOC entry 3566 (class 1259 OID 33269)
-- Name: bookings_user_time_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX bookings_user_time_idx ON public.bookings USING btree (user_id, start_time);


--
-- TOC entry 3567 (class 1259 OID 33290)
-- Name: idx_bookings_active_seat_overlap; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_active_seat_overlap ON public.bookings USING btree (seat_code, start_time, end_time) WHERE (status <> ALL (ARRAY['canceled'::public.booking_status_enum, 'refunded'::public.booking_status_enum]));


--
-- TOC entry 3568 (class 1259 OID 33287)
-- Name: idx_bookings_booking_reference_unique; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX idx_bookings_booking_reference_unique ON public.bookings USING btree (booking_reference);


--
-- TOC entry 3569 (class 1259 OID 33288)
-- Name: idx_bookings_seat_interval; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_seat_interval ON public.bookings USING btree (seat_code, start_time, end_time);


--
-- TOC entry 3570 (class 1259 OID 16857)
-- Name: idx_bookings_start_time; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_start_time ON public.bookings USING btree (start_time);


--
-- TOC entry 3571 (class 1259 OID 16856)
-- Name: idx_bookings_status; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_status ON public.bookings USING btree (status);


--
-- TOC entry 3572 (class 1259 OID 16855)
-- Name: idx_bookings_user_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id);


--
-- TOC entry 3573 (class 1259 OID 33289)
-- Name: idx_bookings_user_time; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_bookings_user_time ON public.bookings USING btree (user_id, start_time, end_time);


--
-- TOC entry 3578 (class 1259 OID 16858)
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- TOC entry 3612 (class 1259 OID 33416)
-- Name: idx_qr_checkins_booking_user_active; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_qr_checkins_booking_user_active ON public.qr_checkins USING btree (booking_id, user_id, status);


--
-- TOC entry 3613 (class 1259 OID 33417)
-- Name: idx_qr_checkins_user_created; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_qr_checkins_user_created ON public.qr_checkins USING btree (user_id, created_at DESC);


--
-- TOC entry 3607 (class 1259 OID 33386)
-- Name: idx_qrcodes_booking_active_valid; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_qrcodes_booking_active_valid ON public.qrcodes USING btree (booking_id, expires_at) WHERE is_active;


--
-- TOC entry 3555 (class 1259 OID 33281)
-- Name: idx_rooms_zone_code; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_rooms_zone_code ON public.rooms USING btree (zone_id, room_code);


--
-- TOC entry 3556 (class 1259 OID 16860)
-- Name: idx_rooms_zone_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_rooms_zone_id ON public.rooms USING btree (zone_id);


--
-- TOC entry 3550 (class 1259 OID 16859)
-- Name: idx_seats_zone_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_seats_zone_id ON public.seats USING btree (zone_id);


--
-- TOC entry 3547 (class 1259 OID 33280)
-- Name: idx_service_packages_service_status; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_service_packages_service_status ON public.service_packages USING btree (service_id, status);


--
-- TOC entry 3524 (class 1259 OID 33279)
-- Name: idx_services_active_code; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_services_active_code ON public.services USING btree (is_active, code);


--
-- TOC entry 3603 (class 1259 OID 33365)
-- Name: idx_user_payment_methods_user_default; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_user_payment_methods_user_default ON public.user_payment_methods USING btree (user_id, is_default) WHERE is_active;


--
-- TOC entry 3539 (class 1259 OID 25076)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3533 (class 1259 OID 16861)
-- Name: idx_zones_floor_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_zones_floor_id ON public.zones USING btree (floor_id);


--
-- TOC entry 3534 (class 1259 OID 16862)
-- Name: idx_zones_service_id; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE INDEX idx_zones_service_id ON public.zones USING btree (service_id);


--
-- TOC entry 3546 (class 1259 OID 33266)
-- Name: users_username_idx; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX users_username_idx ON public.users USING btree (username);


--
-- TOC entry 3606 (class 1259 OID 33364)
-- Name: ux_user_payment_methods_user_code_active; Type: INDEX; Schema: public; Owner: swspace_user
--

CREATE UNIQUE INDEX ux_user_payment_methods_user_code_active ON public.user_payment_methods USING btree (user_id, code) WHERE is_active;


--
-- TOC entry 3654 (class 2620 OID 33421)
-- Name: qr_checkins trg_qr_checkins_updated; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER trg_qr_checkins_updated BEFORE UPDATE ON public.qr_checkins FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- TOC entry 3653 (class 2620 OID 33420)
-- Name: qrcodes trg_qrcodes_updated; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER trg_qrcodes_updated BEFORE UPDATE ON public.qrcodes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- TOC entry 3652 (class 2620 OID 33419)
-- Name: user_payment_methods trg_user_payment_methods_updated; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER trg_user_payment_methods_updated BEFORE UPDATE ON public.user_payment_methods FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();


--
-- TOC entry 3650 (class 2620 OID 16853)
-- Name: bookings update_bookings_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3651 (class 2620 OID 16854)
-- Name: payments update_payments_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3649 (class 2620 OID 16852)
-- Name: service_packages update_service_packages_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_service_packages_updated_at BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3648 (class 2620 OID 16851)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: swspace_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3642 (class 2606 OID 16845)
-- Name: auth_sessions auth_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3624 (class 2606 OID 16652)
-- Name: bookings bookings_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- TOC entry 3625 (class 2606 OID 16662)
-- Name: bookings bookings_package_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.service_packages(id);


--
-- TOC entry 3626 (class 2606 OID 16677)
-- Name: bookings bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- TOC entry 3627 (class 2606 OID 16672)
-- Name: bookings bookings_seat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_seat_id_fkey FOREIGN KEY (seat_id) REFERENCES public.seats(id);


--
-- TOC entry 3628 (class 2606 OID 16657)
-- Name: bookings bookings_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 3629 (class 2606 OID 16647)
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3630 (class 2606 OID 16667)
-- Name: bookings bookings_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3636 (class 2606 OID 16764)
-- Name: cameras cameras_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id);


--
-- TOC entry 3637 (class 2606 OID 16769)
-- Name: cameras cameras_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.cameras
    ADD CONSTRAINT cameras_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3638 (class 2606 OID 16784)
-- Name: checkins checkins_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3639 (class 2606 OID 16789)
-- Name: checkins checkins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.checkins
    ADD CONSTRAINT checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3640 (class 2606 OID 16810)
-- Name: notifications notifications_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3641 (class 2606 OID 16805)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3631 (class 2606 OID 16706)
-- Name: payments payments_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id);


--
-- TOC entry 3632 (class 2606 OID 16711)
-- Name: payments payments_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_method_id_fkey FOREIGN KEY (method_id) REFERENCES public.payment_methods(id);


--
-- TOC entry 3645 (class 2606 OID 33401)
-- Name: qr_checkins qr_checkins_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 3646 (class 2606 OID 33411)
-- Name: qr_checkins qr_checkins_qr_code_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_qr_code_id_fkey FOREIGN KEY (qr_code_id) REFERENCES public.qrcodes(id) ON DELETE SET NULL;


--
-- TOC entry 3647 (class 2606 OID 33406)
-- Name: qr_checkins qr_checkins_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qr_checkins
    ADD CONSTRAINT qr_checkins_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3644 (class 2606 OID 33381)
-- Name: qrcodes qrcodes_booking_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.qrcodes
    ADD CONSTRAINT qrcodes_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE;


--
-- TOC entry 3633 (class 2606 OID 16726)
-- Name: refunds refunds_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.refunds
    ADD CONSTRAINT refunds_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id);


--
-- TOC entry 3623 (class 2606 OID 16628)
-- Name: rooms rooms_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3622 (class 2606 OID 16613)
-- Name: seats seats_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.seats
    ADD CONSTRAINT seats_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.zones(id);


--
-- TOC entry 3634 (class 2606 OID 16754)
-- Name: service_floor_rules service_floor_rules_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id);


--
-- TOC entry 3635 (class 2606 OID 16749)
-- Name: service_floor_rules service_floor_rules_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_floor_rules
    ADD CONSTRAINT service_floor_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 3619 (class 2606 OID 16598)
-- Name: service_packages service_packages_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3620 (class 2606 OID 16588)
-- Name: service_packages service_packages_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 3621 (class 2606 OID 16593)
-- Name: service_packages service_packages_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.service_packages
    ADD CONSTRAINT service_packages_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.time_units(id);


--
-- TOC entry 3616 (class 2606 OID 16526)
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- TOC entry 3643 (class 2606 OID 33359)
-- Name: user_payment_methods user_payment_methods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.user_payment_methods
    ADD CONSTRAINT user_payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3617 (class 2606 OID 16552)
-- Name: zones zones_floor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_floor_id_fkey FOREIGN KEY (floor_id) REFERENCES public.floors(id);


--
-- TOC entry 3618 (class 2606 OID 16557)
-- Name: zones zones_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: swspace_user
--

ALTER TABLE ONLY public.zones
    ADD CONSTRAINT zones_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


-- Completed on 2025-12-05 13:42:52

--
-- PostgreSQL database dump complete
--

\unrestrict sNVxjxSTIS9zxbDXRiPUo17lafbyo7hCKZZpOlyuDrX1jCVvrw2akUR9RJY6pjm

