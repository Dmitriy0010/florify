--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.4

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: analytics_cost_facts; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.analytics_cost_facts (
    id uuid NOT NULL,
    cost_type character varying(20) NOT NULL,
    source_ref_id uuid NOT NULL,
    store_id uuid NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    recorded_at timestamp with time zone NOT NULL,
    amount numeric(19,2),
    quantity numeric(19,2),
    reason character varying(50),
    supplier_id uuid,
    supplier_name character varying(255),
    item_count integer,
    employee_id uuid,
    employee_name character varying(255),
    employee_role character varying(255),
    period_start date,
    period_end date,
    product_id uuid,
    product_name character varying(255),
    category_id uuid,
    category_name character varying(255),
    CONSTRAINT chk_analytics_cost_type CHECK (((cost_type)::text = ANY ((ARRAY['PURCHASE'::character varying, 'SALARY'::character varying, 'WRITEOFF'::character varying])::text[])))
);


ALTER TABLE public.analytics_cost_facts OWNER TO florify_user;

--
-- Name: analytics_order_facts; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.analytics_order_facts (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    customer_id uuid,
    store_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    total_amount numeric(19,2) DEFAULT 0 NOT NULL,
    cogs_amount numeric(19,2) DEFAULT 0 NOT NULL,
    gross_profit numeric(19,2) DEFAULT 0 NOT NULL,
    assigned_employee_id uuid,
    order_source character varying(20),
    item_count integer DEFAULT 0,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    cancellation_reason character varying(255),
    recorded_at timestamp with time zone NOT NULL
);


ALTER TABLE public.analytics_order_facts OWNER TO florify_user;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    phone character varying(255),
    email character varying(255),
    first_name character varying(255) NOT NULL,
    last_name character varying(255),
    birth_date date,
    gender character varying(255) DEFAULT 'UNSPECIFIED'::character varying NOT NULL,
    source character varying(255) DEFAULT 'WEB'::character varying NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    user_id uuid,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO florify_user;

--
-- Name: delivery_slots; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.delivery_slots (
    id uuid NOT NULL,
    date date NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    max_capacity integer NOT NULL,
    current_load integer DEFAULT 0 NOT NULL,
    CONSTRAINT chk_delivery_slot_capacity CHECK ((max_capacity > 0)),
    CONSTRAINT chk_delivery_slot_load CHECK ((current_load >= 0)),
    CONSTRAINT chk_delivery_slot_load_max CHECK ((current_load <= max_capacity)),
    CONSTRAINT chk_delivery_slot_time CHECK ((start_time < end_time))
);


ALTER TABLE public.delivery_slots OWNER TO florify_user;

--
-- Name: delivery_tasks; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.delivery_tasks (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    slot_id uuid,
    zone_id uuid,
    courier_id uuid,
    delivery_address text NOT NULL,
    latitude double precision,
    longitude double precision,
    status character varying(50) NOT NULL,
    estimated_arrival timestamp with time zone,
    actual_delivered_at timestamp with time zone,
    failure_reason text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone,
    CONSTRAINT chk_delivery_task_status CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'ASSIGNED'::character varying, 'PICKED_UP'::character varying, 'DELIVERED'::character varying, 'FAILED'::character varying])::text[])))
);


ALTER TABLE public.delivery_tasks OWNER TO florify_user;

--
-- Name: delivery_zones; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.delivery_zones (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    polygon text,
    delivery_fee numeric(10,2) NOT NULL,
    min_order_amount numeric(10,2) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT chk_delivery_zone_fee CHECK ((delivery_fee >= (0)::numeric)),
    CONSTRAINT chk_delivery_zone_min_amount CHECK ((min_order_amount >= (0)::numeric))
);


ALTER TABLE public.delivery_zones OWNER TO florify_user;

--
-- Name: employee_salary_configs; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.employee_salary_configs (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    type character varying(255) NOT NULL,
    base_amount numeric(38,2) DEFAULT 0 NOT NULL,
    sales_percent numeric(38,2) DEFAULT 0 NOT NULL,
    bonus_per_order numeric(38,2) DEFAULT 0 NOT NULL,
    valid_from date NOT NULL
);


ALTER TABLE public.employee_salary_configs OWNER TO florify_user;

--
-- Name: employee_salary_statements; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.employee_salary_statements (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    period character varying(255) NOT NULL,
    store_id uuid NOT NULL,
    base_salary numeric(38,2) DEFAULT 0 NOT NULL,
    sales_bonus numeric(38,2) DEFAULT 0 NOT NULL,
    order_bonus numeric(38,2) DEFAULT 0 NOT NULL,
    manual_bonus numeric(38,2) DEFAULT 0 NOT NULL,
    deductions numeric(38,2) DEFAULT 0 NOT NULL,
    total_payout numeric(38,2) DEFAULT 0 NOT NULL,
    status character varying(255) NOT NULL,
    approved_by uuid,
    paid_at timestamp with time zone
);


ALTER TABLE public.employee_salary_statements OWNER TO florify_user;

--
-- Name: employee_timesheet; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.employee_timesheet (
    id uuid NOT NULL,
    employee_id uuid NOT NULL,
    date date NOT NULL,
    checkin_at timestamp with time zone NOT NULL,
    checkout_at timestamp with time zone,
    hours_worked numeric(38,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.employee_timesheet OWNER TO florify_user;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.employees (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    phone character varying(255),
    role character varying(255) NOT NULL,
    hire_date date NOT NULL,
    dismiss_date date,
    active boolean DEFAULT true NOT NULL,
    avatar_url character varying(255),
    store_id uuid NOT NULL
);


ALTER TABLE public.employees OWNER TO florify_user;

--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.financial_transactions (
    id uuid NOT NULL,
    type character varying(30) NOT NULL,
    amount numeric(19,2) NOT NULL,
    reference_id uuid NOT NULL,
    description text,
    performed_by uuid,
    occurred_at timestamp with time zone NOT NULL
);


ALTER TABLE public.financial_transactions OWNER TO florify_user;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO florify_user;

--
-- Name: loyalty_accounts; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.loyalty_accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    customer_id uuid NOT NULL,
    tier character varying(255) DEFAULT 'BRONZE'::character varying NOT NULL,
    points_balance integer DEFAULT 0 NOT NULL,
    reserved_points integer DEFAULT 0 NOT NULL,
    total_spent numeric(38,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT loyalty_accounts_points_balance_check CHECK ((points_balance >= 0)),
    CONSTRAINT loyalty_accounts_reserved_points_check CHECK ((reserved_points >= 0))
);


ALTER TABLE public.loyalty_accounts OWNER TO florify_user;

--
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.loyalty_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    loyalty_account_id uuid NOT NULL,
    order_id uuid,
    type character varying(255) NOT NULL,
    points integer NOT NULL,
    description character varying(255),
    occurred_at timestamp with time zone NOT NULL
);


ALTER TABLE public.loyalty_transactions OWNER TO florify_user;

--
-- Name: media_files; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.media_files (
    id uuid NOT NULL,
    original_filename character varying(500) NOT NULL,
    mime_type character varying(100) NOT NULL,
    bucket character varying(100) NOT NULL,
    base_path character varying(500) NOT NULL,
    status character varying(50) NOT NULL,
    uploaded_by uuid NOT NULL,
    uploaded_at timestamp with time zone NOT NULL
);


ALTER TABLE public.media_files OWNER TO florify_user;

--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.notification_logs (
    id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    recipient_contact character varying(500) NOT NULL,
    channel character varying(30) NOT NULL,
    template_code character varying(200) NOT NULL,
    status character varying(30) NOT NULL,
    sent_at timestamp with time zone,
    error_message text
);


ALTER TABLE public.notification_logs OWNER TO florify_user;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.notification_templates (
    id uuid NOT NULL,
    code character varying(200) NOT NULL,
    channel character varying(30) NOT NULL,
    subject character varying(500),
    body_template text NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.notification_templates OWNER TO florify_user;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name character varying(255),
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    line_total numeric(10,2) NOT NULL
);


ALTER TABLE public.order_items OWNER TO florify_user;

--
-- Name: order_number_seq; Type: SEQUENCE; Schema: public; Owner: florify_user
--

CREATE SEQUENCE public.order_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_number_seq OWNER TO florify_user;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    order_number character varying(20) NOT NULL,
    idempotency_key character varying(64),
    customer_id uuid,
    guest_phone character varying(20),
    guest_name character varying(100),
    status character varying(30) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    bonus_points_used numeric(10,2) DEFAULT 0 NOT NULL,
    final_amount numeric(10,2) NOT NULL,
    type character varying(20) NOT NULL,
    source character varying(20) NOT NULL,
    payment_method character varying(20) NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    florist_id uuid,
    store_id uuid NOT NULL,
    delivery_address text,
    delivery_slot_id uuid,
    delivery_zone_id uuid,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    total_cogs numeric(10,2),
    current_payment_id uuid
);


ALTER TABLE public.orders OWNER TO florify_user;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.payments (
    id uuid NOT NULL,
    external_id character varying(255),
    order_id uuid NOT NULL,
    amount numeric(38,2) NOT NULL,
    status character varying(255) NOT NULL,
    confirmation_url character varying(255),
    qr_code_data text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO florify_user;

--
-- Name: product_categories; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.product_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_categories OWNER TO florify_user;

--
-- Name: products; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sku character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category_id uuid,
    unit character varying(255) NOT NULL,
    current_price numeric(38,2) DEFAULT 0 NOT NULL,
    image_url character varying(2048),
    default_shelf_life_days integer DEFAULT 7 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_synced_at timestamp with time zone
);


ALTER TABLE public.products OWNER TO florify_user;

--
-- Name: purchase_invoice_items; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.purchase_invoice_items (
    id uuid NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name character varying(255) NOT NULL,
    ordered_quantity numeric(38,2) NOT NULL,
    received_quantity numeric(38,2) DEFAULT 0 NOT NULL,
    unit_price numeric(38,2) NOT NULL,
    expires_at date
);


ALTER TABLE public.purchase_invoice_items OWNER TO florify_user;

--
-- Name: purchase_invoices; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.purchase_invoices (
    id uuid NOT NULL,
    invoice_number character varying(255) NOT NULL,
    supplier_id uuid NOT NULL,
    supplier_name character varying(255) NOT NULL,
    store_id uuid NOT NULL,
    status character varying(255) NOT NULL,
    total_amount numeric(38,2) NOT NULL,
    planned_delivery_at timestamp with time zone,
    received_at timestamp with time zone,
    comment character varying(255),
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.purchase_invoices OWNER TO florify_user;

--
-- Name: recipe_items; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.recipe_items (
    id uuid NOT NULL,
    recipe_id uuid NOT NULL,
    ingredient_id uuid NOT NULL,
    quantity numeric(19,3) NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.recipe_items OWNER TO florify_user;

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.recipes (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.recipes OWNER TO florify_user;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(255) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    device_info character varying(255)
);


ALTER TABLE public.refresh_tokens OWNER TO florify_user;

--
-- Name: shedlock; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.shedlock (
    name character varying(64) NOT NULL,
    lock_until timestamp without time zone NOT NULL,
    locked_at timestamp without time zone NOT NULL,
    locked_by character varying(255) NOT NULL
);


ALTER TABLE public.shedlock OWNER TO florify_user;

--
-- Name: stock_balances; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.stock_balances (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    store_id uuid NOT NULL,
    quantity_in_stock numeric(10,2) DEFAULT 0 NOT NULL,
    average_cost numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.stock_balances OWNER TO florify_user;

--
-- Name: stock_batches; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.stock_batches (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    store_id uuid NOT NULL,
    quantity_received numeric(38,2) NOT NULL,
    quantity_remaining numeric(38,2) NOT NULL,
    unit_cost numeric(38,2) NOT NULL,
    received_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone,
    status character varying(20) NOT NULL,
    source_document_id character varying(100) NOT NULL,
    supplier_id uuid
);


ALTER TABLE public.stock_batches OWNER TO florify_user;

--
-- Name: stock_transactions; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.stock_transactions (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    store_id uuid NOT NULL,
    type character varying(255) NOT NULL,
    quantity numeric(38,2) NOT NULL,
    cost_basis numeric(38,2) NOT NULL,
    total_value numeric(38,2) NOT NULL,
    write_off_reason character varying(255),
    comment character varying(255),
    source_document_id character varying(255) NOT NULL,
    performer_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_transactions OWNER TO florify_user;

--
-- Name: stores; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.stores (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    address character varying(255) NOT NULL,
    phone character varying(20),
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.stores OWNER TO florify_user;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.suppliers (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    contact_person character varying(255),
    phone character varying(50),
    email character varying(255),
    address text,
    tax_id character varying(50),
    payment_terms character varying(255) NOT NULL,
    rating integer,
    notes character varying(255),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    CONSTRAINT suppliers_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.suppliers OWNER TO florify_user;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role character varying(255) NOT NULL
);


ALTER TABLE public.user_roles OWNER TO florify_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: florify_user
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255),
    first_name character varying(255),
    last_name character varying(255),
    password_hash character varying(255) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO florify_user;

--
-- Data for Name: analytics_cost_facts; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.analytics_cost_facts (id, cost_type, source_ref_id, store_id, occurred_at, recorded_at, amount, quantity, reason, supplier_id, supplier_name, item_count, employee_id, employee_name, employee_role, period_start, period_end, product_id, product_name, category_id, category_name) FROM stdin;
337a91bc-250e-485c-b12b-8706df068c82	WRITEOFF	f26c55fb-46bf-4c12-943e-e10b160b7b49	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-22 17:18:49.723196+00	2026-04-22 17:18:49.771873+00	\N	50.00	SPOILAGE	\N	\N	\N	\N	\N	\N	\N	\N	92def0e0-8407-40ba-8929-e6a6078e95d5	Unknown Product	\N	Unknown Category
1c318fe4-4d82-4ee2-a3b5-8e7fe0612fbd	WRITEOFF	c93366bc-f10a-4f8f-8df2-8d208986ed32	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-22 17:37:18.282796+00	2026-04-22 17:37:18.302714+00	\N	225.00	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	92def0e0-8407-40ba-8929-e6a6078e95d5	Unknown Product	\N	Unknown Category
d55ae674-c909-4d39-aec0-2d400fe6ad7b	WRITEOFF	c6ea1242-8b4a-4e2c-bbb1-5765945326f7	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 09:20:10.353608+00	2026-04-23 09:20:10.398084+00	\N	225.00	SPOILAGE	\N	\N	\N	\N	\N	\N	\N	\N	92def0e0-8407-40ba-8929-e6a6078e95d5	Unknown Product	\N	Unknown Category
c6043249-99ce-4d35-b072-23dfc8a04d48	PURCHASE	77287c23-93e9-4287-80de-29f58a185b68	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 09:53:35.593806+00	2026-04-23 09:53:35.644293+00	1500.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
dd0867ef-26ba-4b14-9b42-71c6b2b94def	PURCHASE	a80fb2e1-4dc5-443c-87b0-7007c6731910	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 10:13:31.122231+00	2026-04-23 10:13:31.163565+00	500.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
693b32b2-3ca1-4745-be79-f901a5c30d0d	PURCHASE	26548e72-40f5-402a-861e-3c051314c190	00000000-0000-0000-0000-000000000001	2026-04-23 11:02:13.373019+00	2026-04-23 11:02:13.414353+00	1236.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
534d8623-db00-4beb-a116-13f665adafc5	PURCHASE	9f09bac8-8110-4190-8edd-e564d70cadb4	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 11:08:03.686792+00	2026-04-23 11:08:03.73643+00	414.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
deeaba83-8f3b-4c38-8fdc-f7620dc6f0b6	PURCHASE	d964aed4-a7fd-456a-8c74-34277b697b9b	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 11:08:11.790664+00	2026-04-23 11:08:11.811195+00	120.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
e3988184-4709-4fc6-be89-a88a3cfe5a72	WRITEOFF	05d78829-1070-4908-94c5-0391b82e3eaa	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 11:09:40.159346+00	2026-04-23 11:09:40.171555+00	\N	56.22	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
72cffe40-077a-45b5-9345-09485185d4a9	PURCHASE	6fd5d807-4193-4a18-8223-95338cb80ec4	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 11:10:05.189008+00	2026-04-23 11:10:05.213652+00	800.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
6e4f6f69-f0d9-403a-8e4c-0292ba502c85	PURCHASE	90813d10-ab3c-4f9a-9f0c-0b7fc1bd208f	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 15:29:07.068959+00	2026-04-23 15:29:07.125498+00	120.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
360241d2-ca6b-4ac3-aeab-5ba772ada649	PURCHASE	538e8973-4e87-48ac-9f68-e4f15ed20f52	00000000-0000-0000-0000-000000000001	2026-04-23 15:33:03.017086+00	2026-04-23 15:33:03.040206+00	2870.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
f9f0c5fd-463b-4f45-bc3c-a15794138e79	WRITEOFF	37bb9465-2f1f-4dbc-b994-f70505846b22	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-23 15:36:37.540343+00	2026-04-23 15:36:37.554481+00	\N	134.52	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
f5a00cee-bafb-40f7-9ada-0576c041a1cc	PURCHASE	f6dcddd5-3817-4f08-b5d5-c546cdcdb989	00000000-0000-0000-0000-000000000001	2026-04-25 10:55:26.40712+00	2026-04-25 10:55:26.479084+00	16500.00	\N	\N	ae1175a2-d6d3-43b2-8234-e5340300b4f7	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
222dbc41-b26c-4c02-866f-0b4f8a6c1e8f	PURCHASE	59e5cf04-b280-48c9-b379-d7a771843121	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 11:48:32.511764+00	2026-04-25 11:48:32.901071+00	26420.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
f27d1218-f9ca-4ef3-941e-47effefce7af	WRITEOFF	f0efe149-99c6-4322-800e-f35a5cacb5e1	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 11:51:25.146395+00	2026-04-25 11:51:25.191239+00	\N	117.06	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	3873a853-97f9-46ca-8861-78f061c9b18c	Unknown Product	\N	Unknown Category
c8a67d4e-5642-4506-889a-9329efbf5c1c	WRITEOFF	fc2c649b-d07c-40a1-b04a-f28e2587fe29	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 11:51:25.094408+00	2026-04-25 11:51:25.171461+00	\N	111.92	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Unknown Product	\N	Unknown Category
b72c64a1-5c53-49cc-a48c-fc95e6fa2b7c	WRITEOFF	fd23a44a-3c23-4612-a85a-74d31c1914dc	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 11:51:25.090728+00	2026-04-25 11:51:25.155043+00	\N	167.22	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
3ee7f817-a6c8-4bec-9e38-201a05afb519	WRITEOFF	00c3448c-21b2-4d47-8733-818e20446760	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 11:55:15.007417+00	2026-04-25 11:55:15.03962+00	\N	1254.15	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
baa254fa-81a5-4abf-9825-cdd6d8bd28a1	WRITEOFF	37073a17-9299-4235-864e-5a2bd6847ee3	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 11:55:15.007936+00	2026-04-25 11:55:15.063265+00	\N	3200.00	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	a4b37e14-314b-4d9c-a411-73c71067ebb1	Unknown Product	\N	Unknown Category
7b90a7c5-69a8-458e-a0db-a92158893900	WRITEOFF	e66d3e63-8d61-47cc-a907-e0b3a3a78ed2	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 14:11:42.108488+00	2026-04-25 14:11:42.151404+00	\N	234.12	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	3873a853-97f9-46ca-8861-78f061c9b18c	Unknown Product	\N	Unknown Category
ce113d76-bc71-4e05-8e2f-3d8cd476130c	WRITEOFF	da45284f-1512-46b2-be95-466b353eaf07	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 14:11:42.106817+00	2026-04-25 14:11:42.161806+00	\N	83.61	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
8276b18f-c5c8-4d8b-9a97-abfacf432b9c	WRITEOFF	bfa3c16b-b601-49fb-a454-dea5d5648dd4	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 15:01:35.966692+00	2026-04-25 15:01:36.049126+00	\N	400.00	SALE	\N	\N	\N	\N	\N	\N	\N	\N	a4b37e14-314b-4d9c-a411-73c71067ebb1	Unknown Product	\N	Unknown Category
106ea007-56d5-4e6f-b0bc-e439c9176bf1	PURCHASE	6a38a01f-7f75-4ce1-bda7-e667d3e39393	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 17:38:39.588207+00	2026-04-25 17:38:39.654006+00	992.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
aaa587c1-3be3-45f4-9e66-6194131ac96f	WRITEOFF	f6c81838-98be-4b97-9fcf-2792b7d1940a	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 17:39:04.305031+00	2026-04-25 17:39:04.317465+00	\N	411.46	SPOILAGE	\N	\N	\N	\N	\N	\N	\N	\N	3873a853-97f9-46ca-8861-78f061c9b18c	Unknown Product	\N	Unknown Category
6b9f985d-3463-456b-a970-043c07b6b4b0	WRITEOFF	1b6858e7-6bfd-4e52-ac8e-a84dde7a684d	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:37:36.629304+00	2026-04-25 18:37:36.698937+00	\N	1200.00	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	a4b37e14-314b-4d9c-a411-73c71067ebb1	Unknown Product	\N	Unknown Category
14456a71-6d01-4ee4-89fb-1e8ef6586d3d	WRITEOFF	675b02f2-8351-4f4b-9133-2d0b03839715	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:37:36.628289+00	2026-04-25 18:37:36.70062+00	\N	418.05	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
3c3340d5-3ff1-4943-ae47-2d06c7cc2bab	WRITEOFF	61724be8-54b2-4b0a-a658-4e498330a7b7	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:37:36.629304+00	2026-04-25 18:37:36.70062+00	\N	55.96	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Unknown Product	\N	Unknown Category
aac0b896-aa7b-4d9c-b89e-1d8730bffc76	WRITEOFF	4c28cbe9-8383-4d39-ba11-ffe530f25149	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:37:36.628289+00	2026-04-25 18:37:36.698937+00	\N	117.56	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	3873a853-97f9-46ca-8861-78f061c9b18c	Unknown Product	\N	Unknown Category
e33f3c43-1e2c-4ec7-ae5a-4540f752c180	WRITEOFF	e9471b09-2518-48d3-8859-4e80954ae2ef	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:40:22.550779+00	2026-04-25 18:40:22.560464+00	\N	2591.91	SALE	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
ecc09be8-37c6-422c-90c8-4ef203e181fa	WRITEOFF	b79caafc-af8a-4843-b536-5a0758c0f7e2	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:42:42.624355+00	2026-04-25 18:42:42.639093+00	\N	1755.81	SALE	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
90f9ae4a-72be-403c-a536-75ac9234bccb	WRITEOFF	56f060c6-3318-4a29-9621-3759c5a3670d	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:43:08.549271+00	2026-04-25 18:43:08.555604+00	\N	615.56	SALE	\N	\N	\N	\N	\N	\N	\N	\N	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Unknown Product	\N	Unknown Category
00958f7f-35a2-4b8d-86aa-409b0d065567	WRITEOFF	5015a981-209c-4d58-92fb-710057247ab2	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 18:45:16.489846+00	2026-04-25 18:45:16.49659+00	\N	2000.00	SALE	\N	\N	\N	\N	\N	\N	\N	\N	a4b37e14-314b-4d9c-a411-73c71067ebb1	Unknown Product	\N	Unknown Category
03838b71-8ed7-4b8d-a560-71b8fcfe5058	WRITEOFF	27bc491a-4cec-4d24-9ab6-1c645f5f0c56	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-25 19:44:32.130591+00	2026-04-25 19:44:32.175284+00	\N	4000.00	SALE	\N	\N	\N	\N	\N	\N	\N	\N	a4b37e14-314b-4d9c-a411-73c71067ebb1	Unknown Product	\N	Unknown Category
c1088e8d-9712-44e0-93c1-0683c022d0a5	WRITEOFF	a59da89f-a81c-43cc-a51c-7dcd2519bea8	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-26 18:26:22.207781+00	2026-04-26 18:26:22.260682+00	\N	615.56	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Unknown Product	\N	Unknown Category
622fd8c9-edfc-4957-8b3c-9d17c266891f	WRITEOFF	dfeaed5d-27fe-493d-bfc7-af6a483a9ef3	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-26 18:26:22.207781+00	2026-04-26 18:26:22.260682+00	\N	411.46	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	3873a853-97f9-46ca-8861-78f061c9b18c	Unknown Product	\N	Unknown Category
422c8cfd-47d3-47da-9ded-393ab77e4fb0	WRITEOFF	5922084c-9162-4e34-9bbb-473e28631e33	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-26 18:26:22.207781+00	2026-04-26 18:26:22.264644+00	\N	836.10	INVENTORY_LOSS	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
e1246475-e9f4-4a61-9305-6fd7326bb4a8	WRITEOFF	5ec81507-7403-4ecc-b456-ee3e0a6185e3	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-28 04:13:05.979043+00	2026-04-28 04:13:06.02352+00	\N	167.22	SALE	\N	\N	\N	\N	\N	\N	\N	\N	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Unknown Product	\N	Unknown Category
e63f023f-9b4f-4964-ad91-2a1dd82c50e2	PURCHASE	b5c1535a-2c3d-42d7-8b37-18cfaf448fea	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-28 04:14:50.669693+00	2026-04-28 04:14:50.723931+00	32210.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
70605517-06c9-447d-9c04-652c74292221	PURCHASE	1dbb358d-3161-47ca-a473-11353bc6e0cd	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-28 04:15:21.591082+00	2026-04-28 04:15:21.607903+00	1600.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
551b9f29-b0af-494d-a197-b89c36b7ddff	PURCHASE	21e7a8ea-096f-4d79-9282-d668ee4bfbc7	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-28 04:16:26.255563+00	2026-04-28 04:16:26.348123+00	390.00	\N	\N	6557499d-ca05-49aa-8409-99cb8d385268	Unknown Supplier	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
cc5f1602-db55-4f53-8537-03908ff87782	WRITEOFF	f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	5376136f-141d-4d4a-8a98-089ed5376333	2026-04-28 04:28:02.657592+00	2026-04-28 04:28:02.672194+00	\N	4400.00	SALE	\N	\N	\N	\N	\N	\N	\N	\N	a4b37e14-314b-4d9c-a411-73c71067ebb1	Unknown Product	\N	Unknown Category
\.


--
-- Data for Name: analytics_order_facts; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.analytics_order_facts (id, order_id, customer_id, store_id, status, total_amount, cogs_amount, gross_profit, assigned_employee_id, order_source, item_count, completed_at, cancelled_at, cancellation_reason, recorded_at) FROM stdin;
b875ec52-00f3-4875-998b-b1cb72e8c14a	7a9fba4f-2611-473f-9338-79a0d68a72b2	916d084d-efbb-4008-8f0e-671d83ab4e10	234e549b-9f71-4335-92e3-4a0d5e69dbbd	COMPLETED	330.00	0.00	330.00	\N	WEB	0	2026-04-22 16:40:53.965895+00	\N	\N	2026-04-22 16:40:54.036577+00
87167b5b-1b0f-4d62-b53a-8424c7ff3eea	3ec085dd-baee-45b7-83f6-b03e81bbc113	916d084d-efbb-4008-8f0e-671d83ab4e10	234e549b-9f71-4335-92e3-4a0d5e69dbbd	COMPLETED	220.00	0.00	220.00	\N	WEB	0	2026-04-22 16:41:26.627364+00	\N	\N	2026-04-22 16:41:26.661239+00
8514242a-b19e-4c4d-97f0-694384e0b42c	72898377-00c2-4fda-9ac0-ea983fca36f0	916d084d-efbb-4008-8f0e-671d83ab4e10	234e549b-9f71-4335-92e3-4a0d5e69dbbd	COMPLETED	220.00	0.00	220.00	\N	WEB	0	2026-04-22 16:42:39.174561+00	\N	\N	2026-04-22 16:42:39.202719+00
0335e177-b59a-48b4-a683-4680ea6ed69e	9158d010-a1bb-46ca-a564-dc3ee2e5285e	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	330.00	0.00	330.00	\N	WEB	0	2026-04-22 17:20:32.308148+00	\N	\N	2026-04-22 17:20:32.399608+00
2a1dc9a5-e9e1-4042-9c32-03c7bd7b7468	530dd621-10c8-4511-a976-dc81882bffee	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	220.00	0.00	220.00	\N	WEB	0	2026-04-22 17:20:58.361247+00	\N	\N	2026-04-22 17:20:58.419632+00
fb49379e-c4aa-44a0-b1ef-a6bb2763ad8f	e81ed21b-fb47-475a-a1b7-21df52e80de5	916d084d-efbb-4008-8f0e-671d83ab4e10	234e549b-9f71-4335-92e3-4a0d5e69dbbd	COMPLETED	220.00	0.00	220.00	\N	WEB	0	2026-04-22 17:34:02.923251+00	\N	\N	2026-04-22 17:34:02.99378+00
234580e9-869f-466f-8dd8-dcd9f8406ddc	9d09ed7b-be3f-4071-bf49-b934b7122976	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	300.00	0.00	300.00	\N	WEB	0	2026-04-24 13:21:07.269915+00	\N	\N	2026-04-24 13:21:07.59767+00
5ac2348b-131f-4d15-8e00-f0393640520b	51dc9887-6b5c-4e50-b362-0dc852a0074b	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	300.00	0.00	300.00	\N	WEB	0	2026-04-24 13:21:25.275961+00	\N	\N	2026-04-24 13:21:25.338613+00
bb5d9102-ac6b-49f8-9f8e-23a30bd4709a	b858ac3b-8fe3-4390-9f14-f7f10fb29932	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	300.00	0.00	300.00	\N	WEB	0	2026-04-24 14:02:16.747311+00	\N	\N	2026-04-24 14:02:16.957548+00
4436cd3a-b23b-433c-ba47-d50fe0b79773	4e48d35e-6856-427e-b5f2-254a9bb8202a	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	150.00	0.00	150.00	\N	WEB	0	2026-04-24 19:57:17.933946+00	\N	\N	2026-04-24 19:57:18.141726+00
766ff98f-efc0-4d36-b821-c93760f4cb5b	3c894522-bc38-4c36-a844-30dfd0b5e5d2	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	300.00	0.00	300.00	\N	WEB	0	2026-04-24 20:03:57.002232+00	\N	\N	2026-04-24 20:03:57.118143+00
18f30015-5a92-4b52-98a7-2e6b763f42e7	3c726e10-263c-4c12-ab2e-a065a2d17bc7	eb9a9813-e867-4172-91cf-7ef6647b11bc	125af3cf-1458-4889-8778-ed612587a7d2	COMPLETED	6947.00	0.00	6947.00	\N	WEB	0	2026-04-25 10:51:57.458678+00	\N	\N	2026-04-25 10:51:57.78416+00
2a62d5b5-5621-4065-8402-7fdd1b46ec91	f68e5e2c-2322-48fe-b472-923a3d28c35f	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	775.00	0.00	775.00	\N	WEB	0	2026-04-25 14:23:33.905898+00	\N	\N	2026-04-25 14:23:34.065867+00
4ce37b45-6a41-40ae-9abd-45276b405473	c2b7ace7-ade3-494a-ac76-9a0bef78f574	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	465.00	0.00	465.00	\N	WEB	0	2026-04-25 14:48:28.821865+00	\N	\N	2026-04-25 14:48:28.931793+00
cb3ab770-292f-463a-946b-0e0b09936af9	bfa3c16b-b601-49fb-a454-dea5d5648dd4	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	570.00	0.00	570.00	\N	WEB	0	2026-04-25 15:01:35.365767+00	\N	\N	2026-04-25 15:01:35.716406+00
24009c35-14cc-4ad7-a321-800b48ce857e	4f85f110-a6e6-4afc-8bb9-98d6f8b0ea6c	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	570.00	0.00	570.00	\N	WEB	0	2026-04-25 17:06:27.211719+00	\N	\N	2026-04-25 17:06:27.681332+00
db40e032-a1a7-4380-914d-62c0beb47826	e9471b09-2518-48d3-8859-4e80954ae2ef	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	4991.00	0.00	4991.00	\N	WEB	0	2026-04-25 18:40:22.501165+00	\N	\N	2026-04-25 18:40:22.54363+00
b8a80f7c-ab8f-483d-8a72-e8210f7e7efe	b79caafc-af8a-4843-b536-5a0758c0f7e2	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	3381.00	0.00	3381.00	\N	WEB	0	2026-04-25 18:42:42.532257+00	\N	\N	2026-04-25 18:42:42.613031+00
d3d93005-ce71-44eb-a6cb-2d4e6c7e7181	56f060c6-3318-4a29-9621-3759c5a3670d	d9ace30d-8c29-4bb1-8ab4-d77335f317b6	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	1705.00	0.00	1705.00	\N	WEB	0	2026-04-25 18:43:08.500632+00	\N	\N	2026-04-25 18:43:08.537971+00
6cb7625d-fb9d-45c1-bbaa-f486ced51189	016aa69d-69e5-4f7f-8973-8b7a6a3f5d93	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	9690.00	0.00	9690.00	\N	WEB	0	2026-04-25 18:44:48.630437+00	\N	\N	2026-04-25 18:44:48.67504+00
61c213c7-4393-440f-9121-e00066553232	5015a981-209c-4d58-92fb-710057247ab2	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	2850.00	0.00	2850.00	\N	WEB	0	2026-04-25 18:45:16.449231+00	\N	\N	2026-04-25 18:45:16.473514+00
b4bb98ec-d4b6-426d-bc72-615887b50857	a94c2da8-835d-4432-ac52-13c9e7e87857	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	12540.00	0.00	12540.00	\N	WEB	0	2026-04-25 18:46:12.904641+00	\N	\N	2026-04-25 18:46:12.929629+00
16e2825c-d96c-4035-b306-0d73cda27c53	27bc491a-4cec-4d24-9ab6-1c645f5f0c56	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	5700.00	0.00	5700.00	\N	WEB	0	2026-04-25 19:44:31.916255+00	\N	\N	2026-04-25 19:44:32.010891+00
f0baff95-9292-4f59-aca6-82a12782f0ad	5ec81507-7403-4ecc-b456-ee3e0a6185e3	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	COMPLETED	2688.00	0.00	2688.00	\N	WEB	0	2026-04-28 04:13:05.753375+00	\N	\N	2026-04-28 04:13:05.872307+00
bb0b69bc-0b5c-4a02-839e-e44f126572a5	f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	NEW	6270.00	0.00	6270.00	\N	POS	11	2026-04-28 04:28:01.908173+00	\N	\N	2026-04-28 04:28:02.280679+00
27512262-c1a0-442e-a512-99cc28cbd098	bb91389f-54d6-4bc1-8d87-25e006d8b0ab	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	5376136f-141d-4d4a-8a98-089ed5376333	NEW	644.00	0.00	644.00	\N	POS	4	2026-04-28 05:42:51.419846+00	\N	\N	2026-04-28 05:42:51.527746+00
57555831-29de-4272-9b81-53198e7c2f5a	c3ccdb8e-951f-4a6a-b18c-1204b3db2820	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	5376136f-141d-4d4a-8a98-089ed5376333	NEW	483.00	0.00	483.00	\N	POS	3	2026-04-28 05:43:04.682802+00	\N	\N	2026-04-28 05:43:04.698383+00
318ecdcb-26e3-49a2-9754-467423772c66	9ceaa8dc-cafa-423e-8832-e58e423df5ae	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	5376136f-141d-4d4a-8a98-089ed5376333	NEW	805.00	0.00	805.00	\N	POS	5	2026-04-28 06:01:51.169215+00	\N	\N	2026-04-28 06:01:51.499098+00
5cb859e3-a516-4a6b-8898-0117ac383c9d	b4a80272-275b-41a5-af90-6529b8206680	d9ace30d-8c29-4bb1-8ab4-d77335f317b6	5376136f-141d-4d4a-8a98-089ed5376333	NEW	2093.00	0.00	2093.00	\N	POS	13	2026-04-28 06:10:31.449497+00	\N	\N	2026-04-28 06:10:31.512484+00
e0a82aaa-a542-4862-8efc-e92d581be19e	61bbe86c-1e39-4d4c-b6d3-14be76427309	6fc8b99d-19d5-409d-a9c4-56b312c883f7	5376136f-141d-4d4a-8a98-089ed5376333	NEW	6740.00	0.00	6740.00	\N	WEB	40	2026-05-01 06:24:23.341704+00	\N	\N	2026-05-01 06:24:24.015992+00
9f2118c5-4648-471e-a9ac-a83f5194ff34	13eef0b8-478e-41bb-b59f-8abc9e3017b5	\N	5376136f-141d-4d4a-8a98-089ed5376333	NEW	322.00	0.00	322.00	\N	WEB	2	2026-05-01 06:39:08.149369+00	\N	\N	2026-05-01 06:39:08.348035+00
79af123d-d28d-4659-8d65-cfbb80225c44	7d0d4e32-6130-402a-bfa5-76008b542e62	\N	5376136f-141d-4d4a-8a98-089ed5376333	NEW	489.00	0.00	489.00	\N	WEB	3	2026-05-01 06:42:12.963138+00	\N	\N	2026-05-01 06:42:13.051631+00
23e24019-2a4c-411c-86af-836178166995	dd5f220b-80e8-4af3-b926-e3769cf95535	6fc8b99d-19d5-409d-a9c4-56b312c883f7	5376136f-141d-4d4a-8a98-089ed5376333	NEW	161.00	0.00	161.00	\N	WEB	1	2026-05-01 06:45:34.185435+00	\N	\N	2026-05-01 06:45:34.215211+00
bbec141f-b82e-4cd3-aeca-c9d0329a758b	f40b2c3b-d5c3-4798-b60f-b15364418e05	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	5376136f-141d-4d4a-8a98-089ed5376333	NEW	966.00	0.00	966.00	\N	POS	6	2026-05-01 09:48:58.062109+00	\N	\N	2026-05-01 09:48:58.106181+00
b4e9abbc-e321-4495-a81f-cff20f84b1b0	b34962e4-4cbe-4eeb-8a23-28f8963e9619	916d084d-efbb-4008-8f0e-671d83ab4e10	5376136f-141d-4d4a-8a98-089ed5376333	NEW	3315.00	0.00	3315.00	\N	POS	8	2026-05-01 10:09:32.102194+00	\N	\N	2026-05-01 10:09:32.133063+00
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.customers (id, phone, email, first_name, last_name, birth_date, gender, source, tags, user_id, active, created_at, updated_at) FROM stdin;
d9ace30d-8c29-4bb1-8ab4-d77335f317b6	+79282214930	dda20040609@gmail.com	Семен	Дранник	2004-04-23	UNSPECIFIED	POS	{}	\N	t	2026-04-23 16:35:04.855479+00	2026-04-25 17:42:13.185393+00
eb9a9813-e867-4172-91cf-7ef6647b11bc	89221231212	ddemedrol@gmail.com	ибрагим	Петров	2002-02-20	UNSPECIFIED	POS	{}	\N	t	2026-04-23 17:27:18.616756+00	2026-04-26 18:33:57.757735+00
b1000000-0000-0000-0000-000000000001	+79100000001	client1@mail.ru	Ольга	Новикова	1990-03-15	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000001	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000002	+79100000002	client2@mail.ru	Татьяна	Романова	1985-07-22	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000002	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000003	+79100000003	client3@mail.ru	Екатерина	Белова	1992-11-05	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000003	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000004	+79100000004	client4@mail.ru	Наталья	Лебедева	1988-01-30	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000004	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000005	+79100000005	client5@mail.ru	Ирина	Смирнова	1995-06-18	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000005	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000006	+79100000006	client6@mail.ru	Андрей	Попов	1983-09-12	MALE	WEB	{}	a3000000-0000-0000-0000-000000000006	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000007	+79100000007	client7@mail.ru	Сергей	Соколов	1978-04-25	MALE	WEB	{}	a3000000-0000-0000-0000-000000000007	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000008	+79100000008	client8@mail.ru	Максим	Волков	1991-12-08	MALE	WEB	{}	a3000000-0000-0000-0000-000000000008	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000009	+79100000009	client9@mail.ru	Виктория	Захарова	1994-02-14	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000009	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000010	+79100000010	client10@mail.ru	Александра	Медведева	1987-08-03	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000010	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000011	+79100000011	client11@mail.ru	Людмила	Федорова	1975-05-20	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000011	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000012	+79100000012	client12@mail.ru	Вера	Орлова	1996-10-17	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000012	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000013	+79100000013	client13@mail.ru	Юлия	Соловьева	1993-03-29	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000013	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000014	+79100000014	client14@mail.ru	Галина	Тихонова	1980-07-11	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000014	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
b1000000-0000-0000-0000-000000000015	+79100000015	client15@mail.ru	Надежда	Кузьмина	1989-01-06	FEMALE	WEB	{}	a3000000-0000-0000-0000-000000000015	t	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
\.


--
-- Data for Name: delivery_slots; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.delivery_slots (id, date, start_time, end_time, max_capacity, current_load) FROM stdin;
cdc97aac-4443-4eec-948f-556e58f4284e	2026-04-28	10:00:00	20:00:00	5	0
abf2cf99-5510-4c17-a51b-eed27e23a5cb	2026-05-05	09:00:00	11:00:00	10	0
d7400559-fb95-40c7-836b-d3121bd46789	2026-05-06	09:00:00	11:00:00	10	0
a11b07f1-3d70-458b-9832-e9f71d463771	2026-05-07	09:00:00	11:00:00	10	0
65326019-c66b-4b82-b2f9-d4d0cbb7ba37	2026-05-08	09:00:00	11:00:00	10	0
99e994e0-3edb-47cc-9356-0cd1c363f68b	2026-05-09	09:00:00	11:00:00	10	0
cee4c5b1-c4f6-44df-b922-d9d14fcf60db	2026-05-10	09:00:00	11:00:00	10	0
830de607-6d1d-49e2-8a03-84298d38f9bb	2026-05-11	09:00:00	11:00:00	10	0
17d0e7db-46d5-4947-9a0a-3f952496c143	2026-05-05	11:00:00	13:00:00	10	0
309424a6-3951-4045-add7-4ad624e72fae	2026-05-06	11:00:00	13:00:00	10	0
a02c018d-7dd0-4dbd-b1f2-1ea2210ba9ca	2026-05-07	11:00:00	13:00:00	10	0
aec2399c-0a16-416b-b97f-9ca0942dbb9b	2026-05-08	11:00:00	13:00:00	10	0
655cb98b-eb7d-481b-9c46-5fb99646c14c	2026-05-09	11:00:00	13:00:00	10	0
74033407-9e0a-4852-9f22-724b9ea21f01	2026-05-10	11:00:00	13:00:00	10	0
84375441-a09e-4e50-9372-e1e9f4616038	2026-05-11	11:00:00	13:00:00	10	0
de22ec6e-dba6-4646-b5fd-fa6bc0d55880	2026-05-05	13:00:00	15:00:00	10	0
2386bc81-c614-4f5e-8b04-fb9c60e0d162	2026-05-06	13:00:00	15:00:00	10	0
b076b629-2cf6-411e-8b8e-aa8aa41815e0	2026-05-07	13:00:00	15:00:00	10	0
a8bd9b9b-60cc-429e-8329-1cefb0fdb06d	2026-05-08	13:00:00	15:00:00	10	0
fdea8061-ff74-4fa8-9177-da20c528c69a	2026-05-09	13:00:00	15:00:00	10	0
2f046f7b-0ca2-43c9-a6a4-3a540bc49f82	2026-05-10	13:00:00	15:00:00	10	0
b3c7f223-4eaa-405d-98b7-ab4e5abab438	2026-05-11	13:00:00	15:00:00	10	0
4c73a3d0-8d2a-45e0-af94-a1385abb6ef8	2026-05-05	15:00:00	17:00:00	10	0
a4befd74-31e7-4a21-89b4-cd10449488f4	2026-05-06	15:00:00	17:00:00	10	0
e9bfdc18-5506-42d3-a24b-2ad5cc1a6e81	2026-05-07	15:00:00	17:00:00	10	0
17b672d3-d93b-4715-87b1-712140f9ce9a	2026-05-08	15:00:00	17:00:00	10	0
1f6dd72a-db79-4433-b806-3fbe63323069	2026-05-09	15:00:00	17:00:00	10	0
cab6c1a9-b520-4764-9c73-8b054ec80157	2026-05-10	15:00:00	17:00:00	10	0
f7f8ed9b-57d5-482d-8841-513b7740176e	2026-05-11	15:00:00	17:00:00	10	0
050a4089-7b35-452a-bc1b-d41bff9681a4	2026-05-05	17:00:00	19:00:00	10	0
da969bb7-f3c8-457d-9bd1-227d74374fed	2026-05-06	17:00:00	19:00:00	10	0
fdcea58c-c68a-47f2-84db-b1583fc03a5d	2026-05-07	17:00:00	19:00:00	10	0
49004cfa-1dfa-46b5-bb76-b57d2b1567d7	2026-05-08	17:00:00	19:00:00	10	0
382509b0-999a-4aa7-ae1f-820ce6251740	2026-05-09	17:00:00	19:00:00	10	0
fa447708-2bcf-4f44-9770-43af79b124ea	2026-05-10	17:00:00	19:00:00	10	0
bf1487fe-a4d6-4567-8726-cb528a8991d4	2026-05-11	17:00:00	19:00:00	10	0
\.


--
-- Data for Name: delivery_tasks; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.delivery_tasks (id, order_id, slot_id, zone_id, courier_id, delivery_address, latitude, longitude, status, estimated_arrival, actual_delivered_at, failure_reason, created_at, updated_at) FROM stdin;
acd40cde-a993-4aec-8860-42c7fbc5d7a9	3ec085dd-baee-45b7-83f6-b03e81bbc113	\N	\N	\N	Address not provided	\N	\N	CREATED	\N	\N	\N	2026-04-22 16:41:25.472669+00	2026-04-22 16:41:25.472669+00
\.


--
-- Data for Name: delivery_zones; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.delivery_zones (id, name, polygon, delivery_fee, min_order_amount, active, created_at) FROM stdin;
f1000000-0000-0000-0000-000000000001	Центр города	\N	200.00	500.00	t	2026-05-05 14:36:30.488996+00
f1000000-0000-0000-0000-000000000002	Ближний район	\N	350.00	800.00	t	2026-05-05 14:36:30.488996+00
f1000000-0000-0000-0000-000000000003	Дальний район	\N	500.00	1200.00	t	2026-05-05 14:36:30.488996+00
\.


--
-- Data for Name: employee_salary_configs; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.employee_salary_configs (id, employee_id, type, base_amount, sales_percent, bonus_per_order, valid_from) FROM stdin;
8ae70f0b-57b9-455f-9e8d-52999fbd02fc	b84537ab-47e0-4a18-aa8d-0ea32fa07930	FIXED	0.00	0.00	0.00	2026-04-24
cf2ce3de-8fb4-4894-895c-a0027ee19a83	cec1ee15-9809-4373-87fc-60e90c134cee	FIXED	45505.00	5.00	100.00	2026-04-24
\.


--
-- Data for Name: employee_salary_statements; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.employee_salary_statements (id, employee_id, period, store_id, base_salary, sales_bonus, order_bonus, manual_bonus, deductions, total_payout, status, approved_by, paid_at) FROM stdin;
45e616b7-9c54-4ffe-bde9-a9be9278e276	cec1ee15-9809-4373-87fc-60e90c134cee	2026-04	5376136f-141d-4d4a-8a98-089ed5376333	45505.00	0.00	0.00	0.00	0.00	45505.00	DRAFT	\N	\N
dfb02dd6-1f8a-4124-abae-865fb70f53f9	b84537ab-47e0-4a18-aa8d-0ea32fa07930	2026-04	5376136f-141d-4d4a-8a98-089ed5376333	0.00	0.00	0.00	0.00	0.00	0.00	DRAFT	\N	\N
\.


--
-- Data for Name: employee_timesheet; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.employee_timesheet (id, employee_id, date, checkin_at, checkout_at, hours_worked) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.employees (id, user_id, first_name, last_name, phone, role, hire_date, dismiss_date, active, avatar_url, store_id) FROM stdin;
994833c5-4f41-4501-b35f-95f1d95c9002	88b48703-4baa-40c4-b792-0737a78d8372	Kissam	Liano	89282212211	FLORIST	2026-04-24	\N	t	\N	5376136f-141d-4d4a-8a98-089ed5376333
cec1ee15-9809-4373-87fc-60e90c134cee	d5c3cdc7-0129-4e0c-854e-eb597858d01e	Arkadiy	Testoviy	+79001112233	FLORIST	2026-04-24	\N	t	\N	5376136f-141d-4d4a-8a98-089ed5376333
b84537ab-47e0-4a18-aa8d-0ea32fa07930	385b516f-fdcd-4dd4-b6d6-3a2fa003f600	Ксения	Testova	+72282282288	FLORIST	2026-04-23	\N	f	\N	5376136f-141d-4d4a-8a98-089ed5376333
18858429-568a-4056-9156-be0b043e632e	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	Sail	BRAIN	+78888828888	FLORIST	2026-04-27	\N	t	\N	5376136f-141d-4d4a-8a98-089ed5376333
d4bb6e79-09e5-42e0-b5c7-e54966ce5890	cc036b02-69c5-42f9-a265-110c75c7658f	cur	curier	891231231212	COURIER	2026-04-28	\N	t	\N	5376136f-141d-4d4a-8a98-089ed5376333
ac51a2bc-d5b9-447b-b573-4d2949067518	a1000000-0000-0000-0000-000000000001	Анна	Петрова	+79001110001	FLORIST	2024-01-15	\N	t	\N	00000000-0000-0000-0000-000000000001
b0373e59-cf92-41c0-92c3-82ba2009bee6	a1000000-0000-0000-0000-000000000002	Мария	Иванова	+79001110002	FLORIST	2024-03-01	\N	t	\N	00000000-0000-0000-0000-000000000001
1c53ec66-ac05-45d6-8e8c-41776abea15d	a1000000-0000-0000-0000-000000000003	Светлана	Сидорова	+79001110003	FLORIST	2024-06-10	\N	t	\N	00000000-0000-0000-0000-000000000001
b3f2382c-f235-4307-8d82-15833af561fb	a2000000-0000-0000-0000-000000000001	Дмитрий	Козлов	+79002220001	COURIER	2024-02-01	\N	t	\N	00000000-0000-0000-0000-000000000001
b6929185-9588-4d49-95ca-2f119ad168f0	a2000000-0000-0000-0000-000000000002	Алексей	Морозов	+79002220002	COURIER	2024-05-15	\N	t	\N	00000000-0000-0000-0000-000000000001
\.


--
-- Data for Name: financial_transactions; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.financial_transactions (id, type, amount, reference_id, description, performed_by, occurred_at) FROM stdin;
142a5362-130c-4125-bcf7-166a387d5155	REVENUE_SALE	330.00	7a9fba4f-2611-473f-9338-79a0d68a72b2	Revenue from order #7a9fba4f-2611-473f-9338-79a0d68a72b2	\N	2026-04-22 16:40:53.965895+00
8241aef5-1180-4ed4-ab0b-5d1cf90deedd	REVENUE_SALE	220.00	3ec085dd-baee-45b7-83f6-b03e81bbc113	Revenue from order #3ec085dd-baee-45b7-83f6-b03e81bbc113	\N	2026-04-22 16:41:26.627364+00
8ac7ce7a-dcbc-468d-9d6c-e9d3bb6291d6	REVENUE_SALE	220.00	72898377-00c2-4fda-9ac0-ea983fca36f0	Revenue from order #72898377-00c2-4fda-9ac0-ea983fca36f0	\N	2026-04-22 16:42:39.174561+00
52b43bb9-5a1f-4317-b596-f96d337b5112	WRITE_OFF_EXPENSE	-50.00	f26c55fb-46bf-4c12-943e-e10b160b7b49	Inventory loss: SPOILAGE	\N	2026-04-22 17:18:49.723196+00
a86ae46e-6199-4a3f-9b6e-4ae477f477d3	REVENUE_SALE	330.00	9158d010-a1bb-46ca-a564-dc3ee2e5285e	Revenue from order #9158d010-a1bb-46ca-a564-dc3ee2e5285e	\N	2026-04-22 17:20:32.308148+00
6b69a7f7-e587-4b1f-94d1-a229e8030a57	REVENUE_SALE	220.00	530dd621-10c8-4511-a976-dc81882bffee	Revenue from order #530dd621-10c8-4511-a976-dc81882bffee	\N	2026-04-22 17:20:58.361247+00
e7015c67-ce80-465b-85c1-ae8da979677e	REVENUE_SALE	220.00	e81ed21b-fb47-475a-a1b7-21df52e80de5	Revenue from order #e81ed21b-fb47-475a-a1b7-21df52e80de5	\N	2026-04-22 17:34:02.923251+00
7aa12dc9-5d28-48f8-bf3e-b19108492591	WRITE_OFF_EXPENSE	-225.00	c93366bc-f10a-4f8f-8df2-8d208986ed32	Inventory loss: INVENTORY_LOSS	\N	2026-04-22 17:37:18.282796+00
2ab865f1-2909-4bc8-9414-e521c29ad19f	WRITE_OFF_EXPENSE	-225.00	c6ea1242-8b4a-4e2c-bbb1-5765945326f7	Inventory loss: SPOILAGE	\N	2026-04-23 09:20:10.353608+00
92e46793-2172-4363-b7f2-2ba3e6f23848	PURCHASE_EXPENSE	-1500.00	1e393118-16c0-459d-b9d2-4322f208b240	Purchase from supplier	\N	2026-04-23 09:36:06.413871+00
a8443663-b044-40f4-b29d-fbbad6acfc54	PURCHASE_EXPENSE	-1500.00	77287c23-93e9-4287-80de-29f58a185b68	Purchase from supplier	\N	2026-04-23 09:53:35.593806+00
af13e964-2d8d-497a-a2d2-c9fb0780dd2e	PURCHASE_EXPENSE	-500.00	a80fb2e1-4dc5-443c-87b0-7007c6731910	Purchase from supplier	\N	2026-04-23 10:13:31.122231+00
9e866ba7-e5cb-48ec-bb02-367c492a02d5	PURCHASE_EXPENSE	-1236.00	26548e72-40f5-402a-861e-3c051314c190	Purchase from supplier	\N	2026-04-23 11:02:13.373019+00
76ab8e57-ae0a-46b2-9228-869d1ea927fd	PURCHASE_EXPENSE	-414.00	9f09bac8-8110-4190-8edd-e564d70cadb4	Purchase from supplier	\N	2026-04-23 11:08:03.686792+00
ffa40271-1556-48fd-a284-eb35223d08fd	PURCHASE_EXPENSE	-120.00	d964aed4-a7fd-456a-8c74-34277b697b9b	Purchase from supplier	\N	2026-04-23 11:08:11.790664+00
3380e910-209a-4474-befd-4bb656589143	PURCHASE_EXPENSE	-800.00	6fd5d807-4193-4a18-8223-95338cb80ec4	Purchase from supplier	\N	2026-04-23 11:10:05.189008+00
35f10638-160c-4280-945b-b52064dddef7	PURCHASE_EXPENSE	-120.00	90813d10-ab3c-4f9a-9f0c-0b7fc1bd208f	Purchase from supplier	\N	2026-04-23 15:29:07.068959+00
91336223-9a6b-466c-8928-97f7cc3cd086	PURCHASE_EXPENSE	-2870.00	538e8973-4e87-48ac-9f68-e4f15ed20f52	Purchase from supplier	\N	2026-04-23 15:33:03.017086+00
db227a02-fbaa-452a-9d89-01673343cf51	INVENTORY_GAIN	40.00	65e5e3a5-967a-4a52-a73c-db0961d573f6	Inventory adjustment: INV-AUDIT-1776958597475	\N	2026-04-23 15:36:37.49999+00
90090b57-9d53-4938-982a-d6c4a903a06a	INVENTORY_LOSS	-134.52	7283da4a-2080-40a2-8b86-028580ca5a71	Inventory adjustment: INV-LOG-1776958597474	\N	2026-04-23 15:36:37.541405+00
78286b55-640a-40db-8c9a-e2321513192e	REVENUE_SALE	300.00	9d09ed7b-be3f-4071-bf49-b934b7122976	Revenue from order #9d09ed7b-be3f-4071-bf49-b934b7122976	\N	2026-04-24 13:21:07.269915+00
8205e5fa-b159-46a0-9fd5-030fa7dedc13	REVENUE_SALE	300.00	51dc9887-6b5c-4e50-b362-0dc852a0074b	Revenue from order #51dc9887-6b5c-4e50-b362-0dc852a0074b	\N	2026-04-24 13:21:25.275961+00
b2694391-4c16-409e-9a8f-3e8eabed2f77	REVENUE_SALE	300.00	b858ac3b-8fe3-4390-9f14-f7f10fb29932	Revenue from order #b858ac3b-8fe3-4390-9f14-f7f10fb29932	\N	2026-04-24 14:02:16.747311+00
e5bc7993-dc1f-469a-9878-53efd747147a	WRITE_OFF_EXPENSE	-40.00	b858ac3b-8fe3-4390-9f14-f7f10fb29932	Inventory loss: SALE	\N	2026-04-24 14:02:16.92103+00
088b81c4-ff0b-428a-ab97-71d791a1ee4d	WRITE_OFF_EXPENSE	-20.00	4e48d35e-6856-427e-b5f2-254a9bb8202a	Inventory loss: SALE	\N	2026-04-24 19:57:18.106949+00
eede51bc-80be-449a-82ec-5c2fafc6deb0	REVENUE_SALE	150.00	4e48d35e-6856-427e-b5f2-254a9bb8202a	Revenue from order #4e48d35e-6856-427e-b5f2-254a9bb8202a	\N	2026-04-24 19:57:17.933946+00
eb253d7b-817a-4754-9d9b-9fbf75538367	WRITE_OFF_EXPENSE	-40.00	3c894522-bc38-4c36-a844-30dfd0b5e5d2	Inventory loss: SALE	\N	2026-04-24 20:03:57.102708+00
54478638-2d14-452d-b8ad-db18549ec3df	REVENUE_SALE	300.00	3c894522-bc38-4c36-a844-30dfd0b5e5d2	Revenue from order #3c894522-bc38-4c36-a844-30dfd0b5e5d2	\N	2026-04-24 20:03:57.002232+00
8af22d5d-267d-4141-8e19-6760512003c2	REVENUE_SALE	6947.00	3c726e10-263c-4c12-ab2e-a065a2d17bc7	Revenue from order #3c726e10-263c-4c12-ab2e-a065a2d17bc7	\N	2026-04-25 10:51:57.458678+00
c7931e8f-f56f-48e3-990a-799a861c1485	PURCHASE_EXPENSE	-16500.00	f6dcddd5-3817-4f08-b5d5-c546cdcdb989	Purchase from supplier	\N	2026-04-25 10:55:26.40712+00
94811c32-767e-4695-9ae0-8335db2992f6	PURCHASE_EXPENSE	-26420.00	59e5cf04-b280-48c9-b379-d7a771843121	Purchase from supplier	\N	2026-04-25 11:48:32.511764+00
ca19ed83-fd3a-49c5-a78c-3f58bdbaf93b	INVENTORY_LOSS	-111.92	47ab3992-34ca-4608-a9a1-c75a537b8d2f	Inventory adjustment: INV-LOG-1777117884604	\N	2026-04-25 11:51:25.094408+00
5390f108-0b87-4f35-896b-726457908b2c	INVENTORY_GAIN	1200.00	96945c42-a64f-4836-aec6-1ecc3f7ddccc	Inventory adjustment: INV-AUDIT-1777117884604	\N	2026-04-25 11:51:25.01606+00
15d8146c-a861-45f2-8417-a6b158b80e20	INVENTORY_LOSS	-117.06	5ea60744-7b2b-4e67-a640-8aba5e348989	Inventory adjustment: INV-LOG-1777117884604	\N	2026-04-25 11:51:25.146914+00
1c6fe55b-e1e2-4087-b618-0f26c5266fd9	INVENTORY_LOSS	-167.22	2c013796-3c7a-49f3-bed7-5c93cf8cbed6	Inventory adjustment: INV-LOG-1777117884603	\N	2026-04-25 11:51:25.094408+00
3d93a53c-1272-49c5-a110-470a389917c3	INVENTORY_LOSS	-3200.00	97338930-f906-495e-a8e1-2eef750c9aab	Inventory adjustment: INV-LOG-1777118114643	\N	2026-04-25 11:55:15.015974+00
7c58f964-8424-4fc7-9415-d5cfb8007132	INVENTORY_LOSS	-1254.15	b0f992fc-6b13-4aeb-b5d0-69b657b4a5b0	Inventory adjustment: INV-LOG-1777118114643	\N	2026-04-25 11:55:15.007936+00
67062359-c8fb-448a-9b6b-4b039a04d8c2	INVENTORY_LOSS	-83.61	56c2020c-2df9-4813-a2f9-a5cd1689b82e	Inventory adjustment: INV-LOG-1777126301657	\N	2026-04-25 14:11:42.107837+00
950047f7-ee0d-4928-ad59-1cb5e6f65a6b	INVENTORY_LOSS	-234.12	85976080-01a7-463c-99c0-fcec0fc2b144	Inventory adjustment: INV-LOG-1777126301657	\N	2026-04-25 14:11:42.109502+00
602cb399-6137-4595-8bc1-8ed29fa9b8d2	INVENTORY_GAIN	167.88	711feb51-3ef0-4220-a579-b149169ce54a	Inventory adjustment: INV-AUDIT-1777126301658	\N	2026-04-25 14:11:42.095612+00
3094a718-cce0-403b-b073-a1a17a3f2998	INVENTORY_GAIN	4000.00	d1dcf00f-177c-4569-8f89-b32fce222d8b	Inventory adjustment: INV-AUDIT-1777126301658	\N	2026-04-25 14:11:42.082081+00
4233225b-b765-4094-8dc6-3f539422154e	REVENUE_SALE	775.00	f68e5e2c-2322-48fe-b472-923a3d28c35f	Revenue from order #f68e5e2c-2322-48fe-b472-923a3d28c35f	\N	2026-04-25 14:23:33.905898+00
502f9c01-64a3-4c67-b6a9-4956d597c885	WRITE_OFF_EXPENSE	-279.80	f68e5e2c-2322-48fe-b472-923a3d28c35f	Inventory loss: SALE	\N	2026-04-25 14:23:34.100642+00
9971d9d7-bde4-4a66-a885-498d71237649	REVENUE_SALE	465.00	c2b7ace7-ade3-494a-ac76-9a0bef78f574	Revenue from order #c2b7ace7-ade3-494a-ac76-9a0bef78f574	\N	2026-04-25 14:48:28.821865+00
417eb00e-7b64-450e-a9dd-ba2209ff0765	WRITE_OFF_EXPENSE	-167.88	c2b7ace7-ade3-494a-ac76-9a0bef78f574	Inventory loss: SALE	\N	2026-04-25 14:48:29.014749+00
8ed827f7-5ff1-4dae-8d73-c71822b75dce	REVENUE_SALE	570.00	bfa3c16b-b601-49fb-a454-dea5d5648dd4	Revenue from order #bfa3c16b-b601-49fb-a454-dea5d5648dd4	\N	2026-04-25 15:01:35.365767+00
07b9e285-f7de-415c-a8a9-6a09aa4158c4	WRITE_OFF_EXPENSE	-400.00	bfa3c16b-b601-49fb-a454-dea5d5648dd4	Inventory loss: SALE	\N	2026-04-25 15:01:35.966692+00
82fc2ef1-6f11-47d3-9c63-e4cc4d722fa1	REVENUE_SALE	570.00	4f85f110-a6e6-4afc-8bb9-98d6f8b0ea6c	Revenue from order #4f85f110-a6e6-4afc-8bb9-98d6f8b0ea6c	\N	2026-04-25 17:06:27.211719+00
7368428e-5d4f-4333-b7ca-4d3d30f6d412	PURCHASE_EXPENSE	-992.00	6a38a01f-7f75-4ce1-bda7-e667d3e39393	Purchase from supplier	\N	2026-04-25 17:38:39.588207+00
123c0cb9-c757-4fa0-859d-69107988252e	WRITE_OFF_EXPENSE	-411.46	f6c81838-98be-4b97-9fcf-2792b7d1940a	Inventory loss: SPOILAGE	\N	2026-04-25 17:39:04.305031+00
250716c0-f870-43a1-9203-511a74732730	INVENTORY_LOSS	-1200.00	4ca09d44-6918-430e-8633-9495069ece65	Inventory adjustment: INV-LOG-1777142255482	\N	2026-04-25 18:37:36.662943+00
b362d61d-51dc-4b99-ad0f-1b2674cc9c27	INVENTORY_LOSS	-117.56	26ba05aa-d3a2-461c-b4e6-73e4a108a192	Inventory adjustment: INV-LOG-1777142255481	\N	2026-04-25 18:37:36.658406+00
79b7f324-f4c4-4dd1-8f48-fe10afd38e14	INVENTORY_LOSS	-418.05	ffac693a-57ec-461f-980d-338e99a2bf57	Inventory adjustment: INV-LOG-1777142255481	\N	2026-04-25 18:37:36.659923+00
f28030d7-524a-4f45-a583-82f12f0f57b3	INVENTORY_LOSS	-55.96	54078c31-676a-4ca2-b159-6285ee5b95ca	Inventory adjustment: INV-LOG-1777142255481	\N	2026-04-25 18:37:36.658406+00
8bb1afa3-28a2-43a8-8207-75099f181b33	REVENUE_SALE	4991.00	e9471b09-2518-48d3-8859-4e80954ae2ef	Revenue from order #e9471b09-2518-48d3-8859-4e80954ae2ef	\N	2026-04-25 18:40:22.501165+00
58a0a055-1951-41ed-bbdc-c70f19105215	WRITE_OFF_EXPENSE	-2591.91	e9471b09-2518-48d3-8859-4e80954ae2ef	Inventory loss: SALE	\N	2026-04-25 18:40:22.550779+00
c8875ab2-a2e5-4e4a-bd61-23011c73246e	REVENUE_SALE	3381.00	b79caafc-af8a-4843-b536-5a0758c0f7e2	Revenue from order #b79caafc-af8a-4843-b536-5a0758c0f7e2	\N	2026-04-25 18:42:42.532257+00
b378f162-4efb-4e96-aabe-15fc7dbce293	WRITE_OFF_EXPENSE	-1755.81	b79caafc-af8a-4843-b536-5a0758c0f7e2	Inventory loss: SALE	\N	2026-04-25 18:42:42.624355+00
34dc480e-47fe-40b0-bd6c-c44f3c74f364	REVENUE_SALE	1705.00	56f060c6-3318-4a29-9621-3759c5a3670d	Revenue from order #56f060c6-3318-4a29-9621-3759c5a3670d	\N	2026-04-25 18:43:08.500632+00
f5d35946-5305-4c3a-a4cd-48885ccb11d5	WRITE_OFF_EXPENSE	-615.56	56f060c6-3318-4a29-9621-3759c5a3670d	Inventory loss: SALE	\N	2026-04-25 18:43:08.549271+00
52d0af7b-92e8-433e-b531-a6eb080993a1	REVENUE_SALE	9690.00	016aa69d-69e5-4f7f-8973-8b7a6a3f5d93	Revenue from order #016aa69d-69e5-4f7f-8973-8b7a6a3f5d93	\N	2026-04-25 18:44:48.630437+00
7a673f18-fdaa-4245-a7b1-8f013bfe0f6a	REVENUE_SALE	2850.00	5015a981-209c-4d58-92fb-710057247ab2	Revenue from order #5015a981-209c-4d58-92fb-710057247ab2	\N	2026-04-25 18:45:16.449231+00
106af4d9-b95f-46c2-9f9f-f1fba6b45bab	REVENUE_SALE	12540.00	a94c2da8-835d-4432-ac52-13c9e7e87857	Revenue from order #a94c2da8-835d-4432-ac52-13c9e7e87857	\N	2026-04-25 18:46:12.904641+00
496a12fa-81b8-4b80-b93d-163d280b17e7	WRITE_OFF_EXPENSE	-2000.00	5015a981-209c-4d58-92fb-710057247ab2	Inventory loss: SALE	\N	2026-04-25 18:45:16.489846+00
268a7467-d52b-4282-a81c-9616d469ee65	REVENUE_SALE	5700.00	27bc491a-4cec-4d24-9ab6-1c645f5f0c56	Revenue from order #27bc491a-4cec-4d24-9ab6-1c645f5f0c56	\N	2026-04-25 19:44:31.916255+00
df3abad3-85f5-4146-9336-36fcb8948e30	WRITE_OFF_EXPENSE	-4000.00	27bc491a-4cec-4d24-9ab6-1c645f5f0c56	Inventory loss: SALE	\N	2026-04-25 19:44:32.130591+00
aedfd7ca-248d-48cf-865c-d82d464dfb9f	INVENTORY_LOSS	-836.10	3977107d-e5cc-45c6-8364-4fc13b602677	Inventory adjustment: INV-LOG-1777227981417	\N	2026-04-26 18:26:22.225911+00
4a43dfa8-c8a8-4f89-9258-f358ede957bd	INVENTORY_LOSS	-615.56	d3e8980f-2437-418f-b282-ac1361ccd06a	Inventory adjustment: INV-LOG-1777227981417	\N	2026-04-26 18:26:22.225911+00
994500c2-df46-4dcc-89a6-eeaf7f440987	INVENTORY_GAIN	7600.00	902441ca-e869-46bf-9254-75a6c58ca020	Inventory adjustment: INV-AUDIT-1777227981417	\N	2026-04-26 18:26:21.879306+00
4f11846a-fe57-431e-b0cb-f999c3a8bbd6	INVENTORY_LOSS	-411.46	e07ebe94-228b-4080-b3c1-74ce02d0eaba	Inventory adjustment: INV-LOG-1777227981417	\N	2026-04-26 18:26:22.225911+00
26b98742-7498-4e2f-8ca5-e122875f9d76	REVENUE_SALE	2688.00	5ec81507-7403-4ecc-b456-ee3e0a6185e3	Revenue from order #5ec81507-7403-4ecc-b456-ee3e0a6185e3	\N	2026-04-28 04:13:05.753375+00
888f00c4-b1cf-461b-9940-1f88b9454b0b	WRITE_OFF_EXPENSE	-167.22	5ec81507-7403-4ecc-b456-ee3e0a6185e3	Inventory loss: SALE	\N	2026-04-28 04:13:05.979043+00
688c390b-820c-46af-ae2a-9992ad9f718d	WRITE_OFF_EXPENSE	-117.56	5ec81507-7403-4ecc-b456-ee3e0a6185e3	Inventory loss: SALE	\N	2026-04-28 04:13:06.067112+00
60898ded-d917-46fb-84ab-1b5af9a7bc37	WRITE_OFF_EXPENSE	-111.92	5ec81507-7403-4ecc-b456-ee3e0a6185e3	Inventory loss: SALE	\N	2026-04-28 04:13:06.120815+00
9fd2def4-221a-4837-8635-aa9a09e51a9d	WRITE_OFF_EXPENSE	-1200.00	5ec81507-7403-4ecc-b456-ee3e0a6185e3	Inventory loss: SALE	\N	2026-04-28 04:13:06.195448+00
67d421b0-0740-4103-b754-e40585336b76	PURCHASE_EXPENSE	-32210.00	b5c1535a-2c3d-42d7-8b37-18cfaf448fea	Purchase from supplier	\N	2026-04-28 04:14:50.669693+00
43815d90-1081-4d27-b339-d6e2e738f457	PURCHASE_EXPENSE	-1600.00	1dbb358d-3161-47ca-a473-11353bc6e0cd	Purchase from supplier	\N	2026-04-28 04:15:21.591082+00
7d16651c-9989-4ba3-8aa4-a40fdd019363	PURCHASE_EXPENSE	-390.00	21e7a8ea-096f-4d79-9282-d668ee4bfbc7	Purchase from supplier	\N	2026-04-28 04:16:26.255563+00
3204db21-a4ea-400d-9d04-6ad8fe8edad3	REVENUE_SALE	6270.00	f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	Revenue from order #f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	\N	2026-04-28 04:28:02.473294+00
ccc3fb62-8fee-4aaa-a919-db2346e7b3eb	WRITE_OFF_EXPENSE	-4400.00	f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	Inventory loss: SALE	\N	2026-04-28 04:28:02.657592+00
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	0001	infrastructure and catalog	SQL	V0001__infrastructure_and_catalog.sql	699162894	florify_user	2026-04-22 16:21:49.070749	165	t
2	0002	customers loyalty orders	SQL	V0002__customers_loyalty_orders.sql	1925331951	florify_user	2026-04-22 16:21:49.392384	106	t
3	0003	inventory and suppliers	SQL	V0003__inventory_and_suppliers.sql	330306107	florify_user	2026-04-22 16:21:49.550733	108	t
4	0004	employees and delivery	SQL	V0004__employees_and_delivery.sql	-2080764507	florify_user	2026-04-22 16:21:49.699678	92	t
5	0005	finance and analytics	SQL	V0005__finance_and_analytics.sql	619894045	florify_user	2026-04-22 16:21:49.829764	52	t
6	0006	media notifications and extras	SQL	V0006__media_notifications_and_extras.sql	635062976	florify_user	2026-04-22 16:21:49.910946	86	t
7	0007	fix admin roles and categories	SQL	V0007__fix_admin_roles_and_categories.sql	-2050116158	florify_user	2026-04-22 16:39:47.174047	177	t
8	0008	recipes schema	SQL	V0008__recipes_schema.sql	1381071559	florify_user	2026-04-22 17:14:17.296057	88	t
9	0009	allow null performer in stock transactions	SQL	V0009__allow_null_performer_in_stock_transactions.sql	-960563837	florify_user	2026-04-23 11:04:44.541793	29	t
10	0010	fix inventory bugs	SQL	V0010__fix_inventory_bugs.sql	31262209	florify_user	2026-04-23 15:51:26.713495	61	t
11	0011	make product name nullable in order items	SQL	V0011__make_product_name_nullable_in_order_items.sql	-1388326746	florify_user	2026-04-24 13:50:57.937383	36	t
12	0012	migrate orphaned stock	SQL	V0012__migrate_orphaned_stock.sql	1732841706	florify_user	2026-04-25 11:40:11.141183	99	t
13	0013	add payments table	SQL	V0013__add_payments_table.sql	2046429446	florify_user	2026-04-25 14:43:03.535717	114	t
14	0014	add supplier id to stock batches	SQL	V0014__add_supplier_id_to_stock_batches.sql	1122068137	florify_user	2026-04-25 18:31:15.311145	81	t
\.


--
-- Data for Name: loyalty_accounts; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.loyalty_accounts (id, customer_id, tier, points_balance, reserved_points, total_spent, created_at, updated_at) FROM stdin;
c3dec822-a871-4b34-a7df-ef6166a6e9b8	eb9a9813-e867-4172-91cf-7ef6647b11bc	BRONZE	0	0	0.00	2026-04-23 17:27:18.616756+00	2026-04-23 17:27:18.616756+00
7e3d7872-ff8e-4b4a-a42b-26ddc1bc4d68	d9ace30d-8c29-4bb1-8ab4-d77335f317b6	BRONZE	1100	0	0.00	2026-04-23 16:35:04.855479+00	2026-04-25 18:41:43.590351+00
c1000000-0000-0000-0000-000000000001	b1000000-0000-0000-0000-000000000001	GOLD	12500	0	85000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000002	b1000000-0000-0000-0000-000000000002	SILVER	4200	0	32000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000003	b1000000-0000-0000-0000-000000000003	PLATINUM	35000	0	250000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000004	b1000000-0000-0000-0000-000000000004	BRONZE	850	0	5500.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000005	b1000000-0000-0000-0000-000000000005	SILVER	3100	0	28000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000006	b1000000-0000-0000-0000-000000000006	BRONZE	200	0	1800.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000007	b1000000-0000-0000-0000-000000000007	GOLD	9800	0	72000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000008	b1000000-0000-0000-0000-000000000008	BRONZE	50	0	450.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000009	b1000000-0000-0000-0000-000000000009	SILVER	5600	0	41000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000010	b1000000-0000-0000-0000-000000000010	GOLD	11200	0	79000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000011	b1000000-0000-0000-0000-000000000011	SILVER	2300	0	19000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000012	b1000000-0000-0000-0000-000000000012	BRONZE	700	0	4200.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000013	b1000000-0000-0000-0000-000000000013	PLATINUM	22000	0	180000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000014	b1000000-0000-0000-0000-000000000014	GOLD	8500	0	63000.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
c1000000-0000-0000-0000-000000000015	b1000000-0000-0000-0000-000000000015	BRONZE	150	0	1100.00	2026-05-05 14:36:30.306816+00	2026-05-05 14:36:30.306816+00
\.


--
-- Data for Name: loyalty_transactions; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.loyalty_transactions (id, loyalty_account_id, order_id, type, points, description, occurred_at) FROM stdin;
87cd8a9d-5f71-4b5f-9a6a-28cd3cb6c7ac	7e3d7872-ff8e-4b4a-a42b-26ddc1bc4d68	\N	EARN	100		2026-04-23 16:36:17.699697+00
cec5d3ce-4e30-4f23-9ae8-a59548077cd5	7e3d7872-ff8e-4b4a-a42b-26ddc1bc4d68	\N	EARN	1000	за активность	2026-04-25 18:41:43.590351+00
\.


--
-- Data for Name: media_files; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.media_files (id, original_filename, mime_type, bucket, base_path, status, uploaded_by, uploaded_at) FROM stdin;
c7d9b340-4100-43bc-b0b5-6921db5ca811	Снимок экрана 2025-05-14 222032.png	image/png	florify-media	media/c7d9b340-4100-43bc-b0b5-6921db5ca811	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 16:28:52.440925+00
4251eccd-9990-4533-a3a5-7e70086624a0	Снимок экрана 2025-04-15 122421.png	image/png	florify-media	media/4251eccd-9990-4533-a3a5-7e70086624a0	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 16:30:16.747773+00
fb6bb6c5-7694-4ecd-9441-76c4b5d6221f	Снимок экрана 2025-05-14 222032.png	image/png	florify-media	media/fb6bb6c5-7694-4ecd-9441-76c4b5d6221f	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 09:20:38.001029+00
804fd44b-1ee3-41fc-a29c-6e36d8952f54	Снимок экрана 2025-04-10 161930.png	image/png	florify-media	media/804fd44b-1ee3-41fc-a29c-6e36d8952f54	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 15:29:36.446737+00
577356e2-3879-4b01-a261-e9402e58cd2f	Снимок экрана 2025-04-16 103238.png	image/png	florify-media	media/577356e2-3879-4b01-a261-e9402e58cd2f	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 15:30:03.849224+00
6e4408f2-d9f6-42c4-8d71-a650238a1073	Снимок экрана 2025-12-18 211018.png	image/png	florify-media	media/6e4408f2-d9f6-42c4-8d71-a650238a1073	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 18:59:40.278036+00
4866c49b-f2a9-4b9d-bf65-8202045fb945	Снимок экрана 2026-04-08 153822.png	image/png	florify-media	media/4866c49b-f2a9-4b9d-bf65-8202045fb945	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 10:11:58.448605+00
cf857eeb-1709-4234-b902-f0588ea62f3b	Снимок экрана 2026-04-08 153806.png	image/png	florify-media	media/cf857eeb-1709-4234-b902-f0588ea62f3b	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 10:13:24.607441+00
9ab95457-d8a3-4cb2-bf04-c231a5247cb6	Снимок экрана 2025-04-10 161917.png	image/png	florify-media	media/9ab95457-d8a3-4cb2-bf04-c231a5247cb6	READY	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-26 19:06:16.986845+00
\.


--
-- Data for Name: notification_logs; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.notification_logs (id, recipient_id, recipient_contact, channel, template_code, status, sent_at, error_message) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.notification_templates (id, code, channel, subject, body_template, is_active) FROM stdin;
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.order_items (id, order_id, product_id, product_name, quantity, unit_price, line_total) FROM stdin;
873f647f-967e-4c60-98cc-aaa8d0ce797f	b858ac3b-8fe3-4390-9f14-f7f10fb29932	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	2.00	150.00	300.00
5a5ff48f-eab8-4f9c-9ce2-4f2f7b33752f	4e48d35e-6856-427e-b5f2-254a9bb8202a	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	1.00	150.00	150.00
898535d9-fb99-410b-ba10-09d7341d6c59	3c894522-bc38-4c36-a844-30dfd0b5e5d2	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	2.00	150.00	300.00
5a9034ab-8671-4b88-a50f-40c6dd30324d	f68e5e2c-2322-48fe-b472-923a3d28c35f	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	5.00	155.00	775.00
eed81cb7-eeee-46da-b9ee-3e32da96ce94	c2b7ace7-ade3-494a-ac76-9a0bef78f574	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	3.00	155.00	465.00
ca03cda0-c039-482a-ba15-f3db00c1eef3	bfa3c16b-b601-49fb-a454-dea5d5648dd4	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	1.00	570.00	570.00
ab174ba1-9579-41dc-983c-78687ceebc78	e9471b09-2518-48d3-8859-4e80954ae2ef	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	31.00	161.00	4991.00
2b3c77bd-1784-4e7b-8d87-a7b31252c584	b79caafc-af8a-4843-b536-5a0758c0f7e2	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	21.00	161.00	3381.00
b15afbe5-2289-48a9-b973-2aab89314487	56f060c6-3318-4a29-9621-3759c5a3670d	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	11.00	155.00	1705.00
e06f45f3-7e47-41a6-bf8e-c0e5820b75c1	016aa69d-69e5-4f7f-8973-8b7a6a3f5d93	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	17.00	570.00	9690.00
5f4f4f5c-8b13-4d8f-96fa-501268df1f85	5015a981-209c-4d58-92fb-710057247ab2	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	5.00	570.00	2850.00
a5216014-f8a3-4c33-ae1e-b9557d657e5d	a94c2da8-835d-4432-ac52-13c9e7e87857	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	22.00	570.00	12540.00
83035dad-50be-41a7-af23-c89fd4b522ef	3c726e10-263c-4c12-ab2e-a065a2d17bc7	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	5.00	570.00	2850.00
a9f8ed78-4c21-4b9e-8c06-1f54ce741d23	3c726e10-263c-4c12-ab2e-a065a2d17bc7	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	7.00	161.00	1127.00
f5954051-2516-410e-a6b7-7ae7a2ab0591	3c726e10-263c-4c12-ab2e-a065a2d17bc7	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	10.00	173.00	1730.00
8992bf2a-afcd-45e2-a2b2-3c422aef1c5a	3c726e10-263c-4c12-ab2e-a065a2d17bc7	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	8.00	155.00	1240.00
4e15b8e1-a917-4392-b79c-093b65c03475	27bc491a-4cec-4d24-9ab6-1c645f5f0c56	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	10.00	570.00	5700.00
1ef7302a-7901-46ed-ab5c-dbbef9a1a428	5ec81507-7403-4ecc-b456-ee3e0a6185e3	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	2.00	161.00	322.00
0fe06bc2-d8c1-4197-869a-e15841531388	5ec81507-7403-4ecc-b456-ee3e0a6185e3	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	2.00	173.00	346.00
b48ceac8-efe9-4f69-bb9c-268333f09fa3	5ec81507-7403-4ecc-b456-ee3e0a6185e3	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	2.00	155.00	310.00
18bc3532-a102-4077-a76a-e24ec227cc61	5ec81507-7403-4ecc-b456-ee3e0a6185e3	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	3.00	570.00	1710.00
a2f6a429-53f9-4daa-a305-375e9d1a1f74	f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	11.00	570.00	6270.00
4217111a-2c95-4b58-94d1-d2d61eb3a018	9ceaa8dc-cafa-423e-8832-e58e423df5ae	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	5.00	161.00	805.00
d27e83f4-4dfd-4c0c-8998-8e2859d4386d	b4a80272-275b-41a5-af90-6529b8206680	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	13.00	161.00	2093.00
039dbbcd-aed1-4a58-b85e-7707f2b3b09f	61bbe86c-1e39-4d4c-b6d3-14be76427309	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	25.00	173.00	4325.00
b514bf62-9bbe-45b5-9b75-3a1b0c7ddb05	61bbe86c-1e39-4d4c-b6d3-14be76427309	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	15.00	161.00	2415.00
6a9008eb-2d03-4716-a2e7-e13238b6f5e8	13eef0b8-478e-41bb-b59f-8abc9e3017b5	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	2.00	161.00	322.00
c2ab6713-cdb9-4a48-8398-bfbed6c0eb4e	7d0d4e32-6130-402a-bfa5-76008b542e62	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	1.00	161.00	161.00
035f2aa1-a3e5-45ac-bafe-fbcb1ecfd3cd	7d0d4e32-6130-402a-bfa5-76008b542e62	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	1.00	173.00	173.00
ee9b0b3d-f22e-47f5-be20-de9ccec24640	7d0d4e32-6130-402a-bfa5-76008b542e62	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	1.00	155.00	155.00
c148afe1-9fe6-4012-bb43-ef7c30dc5867	dd5f220b-80e8-4af3-b926-e3769cf95535	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	1.00	161.00	161.00
6feadc67-2e33-451b-b3ae-0403afa47ad6	c3ccdb8e-951f-4a6a-b18c-1204b3db2820	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	3.00	161.00	483.00
23682c42-408e-4fa6-a4d4-5e8cfe350cdb	f40b2c3b-d5c3-4798-b60f-b15364418e05	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	4.00	155.00	620.00
2f3c4e41-94bd-40b4-a245-7f8d997dd2bd	f40b2c3b-d5c3-4798-b60f-b15364418e05	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	2.00	173.00	346.00
831cb30c-8722-4805-9bba-ad734d3cccb2	bb91389f-54d6-4bc1-8d87-25e006d8b0ab	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	4.00	161.00	644.00
b3e8b5a4-9e2a-4a82-b358-674da1169f07	b34962e4-4cbe-4eeb-8a23-28f8963e9619	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	5.00	570.00	2850.00
64968533-e0fd-4363-8de2-f47b6b7d9431	b34962e4-4cbe-4eeb-8a23-28f8963e9619	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	3.00	155.00	465.00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.orders (id, order_number, idempotency_key, customer_id, guest_phone, guest_name, status, total_amount, discount_amount, bonus_points_used, final_amount, type, source, payment_method, is_paid, florist_id, store_id, delivery_address, delivery_slot_id, delivery_zone_id, created_at, updated_at, total_cogs, current_payment_id) FROM stdin;
7a9fba4f-2611-473f-9338-79a0d68a72b2	ORD-001001	493f7590-ad71-4a40-a28d-0aa822d962e2	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	330.00	0.00	0.00	330.00	PICKUP	POS	CASH	f	\N	234e549b-9f71-4335-92e3-4a0d5e69dbbd	\N	\N	\N	2026-04-22 16:40:53.220733+00	2026-04-22 16:40:53.965895+00	\N	\N
3ec085dd-baee-45b7-83f6-b03e81bbc113	ORD-001000	31d378ea-e29a-46f1-aa04-ba91ca1e03dd	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	220.00	0.00	0.00	220.00	PICKUP	POS	CASH	f	\N	234e549b-9f71-4335-92e3-4a0d5e69dbbd	\N	\N	\N	2026-04-22 16:32:34.9157+00	2026-04-22 16:41:26.627364+00	\N	\N
72898377-00c2-4fda-9ac0-ea983fca36f0	ORD-001002	59de1e9e-b597-4ec7-b1be-68c8b234452f	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	220.00	0.00	0.00	220.00	PICKUP	POS	CASH	f	\N	234e549b-9f71-4335-92e3-4a0d5e69dbbd	\N	\N	\N	2026-04-22 16:42:38.565293+00	2026-04-22 16:42:39.174561+00	\N	\N
9158d010-a1bb-46ca-a564-dc3ee2e5285e	ORD-001003	bbaf5e1d-8d13-4aed-a8cf-5e0ed324ff41	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	330.00	0.00	0.00	330.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-22 17:20:32.143674+00	2026-04-22 17:20:32.308148+00	\N	\N
530dd621-10c8-4511-a976-dc81882bffee	ORD-001004	3ad5c40a-904d-4180-8b99-7b3d1a842a0b	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	220.00	0.00	0.00	220.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-22 17:20:58.214391+00	2026-04-22 17:20:58.361247+00	\N	\N
e81ed21b-fb47-475a-a1b7-21df52e80de5	ORD-001005	86dac46b-1c0d-472c-874f-fe0fe1c05438	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	220.00	0.00	0.00	220.00	PICKUP	POS	CASH	f	\N	234e549b-9f71-4335-92e3-4a0d5e69dbbd	\N	\N	\N	2026-04-22 17:34:02.518953+00	2026-04-22 17:34:02.923251+00	\N	\N
9d09ed7b-be3f-4071-bf49-b934b7122976	ORD-001006	ad007859-66e2-48f5-a3bf-b76ca8b15116	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	300.00	0.00	0.00	300.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-24 13:21:05.752436+00	2026-04-24 13:21:07.269915+00	\N	\N
51dc9887-6b5c-4e50-b362-0dc852a0074b	ORD-001007	91f752a7-bef0-4286-9205-315a2184550a	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	300.00	0.00	0.00	300.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-24 13:21:25.056212+00	2026-04-24 13:21:25.275961+00	\N	\N
b858ac3b-8fe3-4390-9f14-f7f10fb29932	ORD-001012	544f2834-e6d9-4643-a34d-82977a5ba332	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	300.00	0.00	0.00	300.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-24 14:02:15.966106+00	2026-04-24 14:02:16.747311+00	\N	\N
4e48d35e-6856-427e-b5f2-254a9bb8202a	ORD-001013	22c9700d-f9d6-4682-8820-7d4493d74a20	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	150.00	0.00	0.00	150.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-24 19:57:17.383847+00	2026-04-24 19:57:17.933946+00	\N	\N
3c894522-bc38-4c36-a844-30dfd0b5e5d2	ORD-001014	fc1bbc23-ddad-413e-937b-a4278c1559a6	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	300.00	0.00	0.00	300.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-24 20:03:56.59624+00	2026-04-24 20:03:57.002232+00	\N	\N
f68e5e2c-2322-48fe-b472-923a3d28c35f	ORD-001016	96e40453-6623-4b00-a8e1-af928c831391	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	775.00	0.00	0.00	775.00	PICKUP	POS	CARD	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:23:33.322626+00	2026-04-25 14:23:33.905898+00	\N	\N
c2b7ace7-ade3-494a-ac76-9a0bef78f574	ORD-001017	695fb202-908f-4e82-beda-9ac706717eb2	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	465.00	0.00	0.00	465.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:48:28.092057+00	2026-04-25 14:48:28.821865+00	\N	\N
61cbb805-1166-442f-8c9a-428485f54fb6	ORD-001026	5e07665d-aeb2-4c73-9890-ed4cab62c6a7	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	1610.00	0.00	0.00	1610.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 15:16:18.693844+00	2026-04-25 15:16:22.39634+00	\N	379df146-8005-45c7-9082-76b934f391c1
c1769a0c-4518-4be1-a3c0-e4894ded32c2	ORD-001018	7816b0c7-91f4-455a-9c91-fb353af23f9b	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	310.00	0.00	0.00	310.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:48:36.934186+00	2026-04-25 14:48:45.269679+00	\N	6e1af166-cd76-489b-afe1-6799711f9582
08e1e882-27d8-4b0d-a49f-c5df94e13316	ORD-001019	f1f9baf6-5f99-4ef7-b7af-50eb74c224b7	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	465.00	0.00	0.00	465.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:52:57.025578+00	2026-04-25 14:53:02.517778+00	\N	7a717efe-07a6-4cf6-b6bb-a3a77dc58ddc
0492d5c8-43d4-47e8-b081-e07a712e8c82	ORD-001020	707ccff2-3e84-47d4-9101-c1262d4793b4	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	310.00	0.00	0.00	310.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:55:03.130874+00	2026-04-25 14:55:05.559271+00	\N	5e26821b-bdae-421d-8b3c-a5c25b4cac31
9d252f35-0a56-4d9f-9218-8667fd41c75c	ORD-001021	24bdc482-357b-4caa-bc35-58ea19bab242	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	310.00	0.00	0.00	310.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:58:04.539214+00	2026-04-25 14:58:07.909698+00	\N	c249f571-deb1-4ab3-899d-96bb7a556bd5
2c9747dc-958c-446c-9bbc-08bba6f078bf	ORD-001022	16980b68-5d11-4833-9d52-8d552dc2a000	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	570.00	0.00	0.00	570.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 14:58:43.125877+00	2026-04-25 14:59:00.228928+00	\N	5dbfa9b4-3d3a-4cc7-9ce6-3627599a03e1
bfa3c16b-b601-49fb-a454-dea5d5648dd4	ORD-001023	556efa0e-d10a-465f-b205-9c5201ae6c8e	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	570.00	0.00	0.00	570.00	PICKUP	POS	CARD	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 15:01:34.947525+00	2026-04-25 15:01:35.365767+00	\N	\N
e7f0dedd-4dc2-4f57-a9b3-1467b584efba	ORD-001025	aee40e59-8043-4c21-9a78-1aae4226ff06	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	930.00	0.00	0.00	930.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 15:10:21.780231+00	2026-04-25 15:10:25.792476+00	\N	e36cd8e3-31f7-4756-a8c5-7fee89d40053
4f85f110-a6e6-4afc-8bb9-98d6f8b0ea6c	ORD-001024	6d33df87-9a6e-45b3-9614-d7597631e849	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	570.00	0.00	0.00	570.00	PICKUP	POS	ONLINE	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 15:02:14.258214+00	2026-04-25 17:06:27.211719+00	\N	7da9df1e-e76f-4c15-b391-1347d5958a22
e9471b09-2518-48d3-8859-4e80954ae2ef	ORD-001027	7b79ee55-8e39-45e5-963e-557f418ad684	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	4991.00	0.00	0.00	4991.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:40:22.333102+00	2026-04-25 18:40:22.501165+00	\N	\N
56f060c6-3318-4a29-9621-3759c5a3670d	ORD-001031	7cdfbdae-a2f1-45e7-bce3-01b7cc1f4889	d9ace30d-8c29-4bb1-8ab4-d77335f317b6	\N	\N	COMPLETED	1705.00	0.00	0.00	1705.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:43:08.23589+00	2026-04-25 18:43:08.500632+00	\N	\N
099fab14-bb4c-4523-936b-1c967b41c1d0	ORD-001028	68c4c499-3bd6-4a01-8391-74c29d36b14b	eb9a9813-e867-4172-91cf-7ef6647b11bc	\N	\N	COMPLETED	8550.00	0.00	0.00	8550.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:41:05.454289+00	2026-04-25 18:41:07.339092+00	\N	a152065a-7f0e-4ef2-ac3c-5fa4dd3db3f5
b79caafc-af8a-4843-b536-5a0758c0f7e2	ORD-001029	4d4539e5-47dc-4613-a979-2469bb725985	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	3381.00	0.00	0.00	3381.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:42:42.271514+00	2026-04-25 18:42:42.532257+00	\N	\N
016aa69d-69e5-4f7f-8973-8b7a6a3f5d93	ORD-001032	d500d786-4ee2-43d4-a7a0-f22b5cb1d626	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	9690.00	0.00	0.00	9690.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:44:48.369801+00	2026-04-25 18:44:48.630437+00	\N	\N
5015a981-209c-4d58-92fb-710057247ab2	ORD-001033	e385b764-5bc3-4efe-81c7-80da1056eedd	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	2850.00	0.00	0.00	2850.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:45:16.101408+00	2026-04-25 18:45:16.449231+00	\N	\N
27bc491a-4cec-4d24-9ab6-1c645f5f0c56	ORD-001036	806dad5b-8a9d-407f-ad73-b8f4635d613f	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	5700.00	0.00	0.00	5700.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 19:44:31.695592+00	2026-04-25 19:44:31.916255+00	\N	\N
1eb913ce-fcfb-471a-af31-61da71f2bc0f	ORD-001034	29490799-9c91-4e6f-bc2d-cd5501113e62	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	7410.00	0.00	0.00	7410.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:45:36.752406+00	2026-04-25 18:45:42.354505+00	\N	411658a6-a42b-4993-8a5d-fd62133fe99f
a94c2da8-835d-4432-ac52-13c9e7e87857	ORD-001035	6b4a3753-deab-476a-a680-967d321e2487	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	12540.00	0.00	0.00	12540.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:46:12.556339+00	2026-04-25 18:46:12.904641+00	\N	\N
3c726e10-263c-4c12-ab2e-a065a2d17bc7	ORD-001015	6c2397bc-2adf-497e-b0f3-cf266f6a10e6	eb9a9813-e867-4172-91cf-7ef6647b11bc	\N	\N	READY	6947.00	0.00	0.00	6947.00	PICKUP	POS	CASH	f	\N	125af3cf-1458-4889-8778-ed612587a7d2	\N	\N	\N	2026-04-25 10:51:57.190128+00	2026-04-25 19:28:09.834573+00	\N	\N
2b9566a4-21f0-4bcb-99e3-37e08fb7d7e1	ORD-001037	e2f17886-fa13-47d8-913b-c1d0d3b19f6f	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	6923.00	0.00	0.00	6923.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 19:44:50.800458+00	2026-04-25 19:44:52.93886+00	\N	46b4155d-92de-4b92-a684-ba73d3b262dd
dc1e525b-8f10-4da6-aa5c-830a8d019382	ORD-001038	a3406d39-4312-4907-a39e-b0812792480e	eb9a9813-e867-4172-91cf-7ef6647b11bc	\N	\N	COMPLETED	2861.00	0.00	0.00	2861.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-26 19:15:04.984804+00	2026-04-26 19:15:12.883596+00	\N	cd3e68b6-204d-4620-a92b-7f85527d1f1c
3500f21a-71a5-4dd5-8343-db3ba818a40b	ORD-001039	665991e7-6022-4fdc-8d56-b7ee3448d095	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	1140.00	0.00	0.00	1140.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-27 08:37:43.887067+00	2026-04-27 08:37:46.629625+00	\N	bd83467f-6705-4b2d-a7d7-83eee8872dd3
7c0f8ada-3aa5-4799-ba2d-261d15e89049	ORD-001030	7a4b3b07-9992-46cf-807c-cacf19d09e1c	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	IN_PROGRESS	1705.00	0.00	0.00	1705.00	PICKUP	POS	ONLINE	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-25 18:42:49.683001+00	2026-04-27 15:12:30.687162+00	\N	b515c2ad-1be7-43e4-8f09-7ff18e97a744
baa4327a-7739-4c4a-9803-231f320e7a84	ORD-001040	b5798f10-1947-4a80-8ec7-b8c7077031bf	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	334.00	0.00	0.00	334.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-27 08:43:56.544957+00	2026-04-27 08:44:07.247777+00	\N	e8e47036-e100-4545-b942-64a6be26339c
5ec81507-7403-4ecc-b456-ee3e0a6185e3	ORD-001041	0e5879ce-30f1-4fd6-a58e-897de307620e	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	2688.00	0.00	0.00	2688.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-28 04:13:04.757021+00	2026-04-28 04:13:05.753375+00	\N	\N
f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2	ORD-001042	0de0efde-6b74-4947-9a6d-223014f823af	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	6270.00	0.00	0.00	6270.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-28 04:28:01.908173+00	2026-04-28 04:28:02.473294+00	\N	\N
9ceaa8dc-cafa-423e-8832-e58e423df5ae	ORD-001045	7b4eb644-a7e2-43de-ada9-6310a28122d9	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	\N	\N	COMPLETED	805.00	0.00	0.00	805.00	PICKUP	POS	CASH	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-28 06:01:51.169215+00	2026-04-28 06:01:51.169215+00	\N	\N
b4a80272-275b-41a5-af90-6529b8206680	ORD-001046	3312c72e-a0f8-4ae0-ad3c-886aa8e8244b	d9ace30d-8c29-4bb1-8ab4-d77335f317b6	\N	\N	COMPLETED	2093.00	0.00	0.00	2093.00	PICKUP	POS	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-28 06:10:31.449497+00	2026-04-28 06:10:31.670881+00	\N	0be8e1b0-de81-459e-a7b1-6eadb75b7c8f
61bbe86c-1e39-4d4c-b6d3-14be76427309	ORD-001047	d4f1b100-0c2a-4acc-83a4-b0647baef640	6fc8b99d-19d5-409d-a9c4-56b312c883f7	+79011231212	Sail	PENDING_STOCK	6740.00	0.00	0.00	6740.00	DELIVERY	WEB	ONLINE	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	Пролетарская 2	\N	\N	2026-05-01 06:24:23.341704+00	2026-05-01 06:24:24.254262+00	\N	48ba543d-c268-4216-8f8f-5f6b4191b86e
13eef0b8-478e-41bb-b59f-8abc9e3017b5	ORD-001048	65c01d2e-7f46-4af6-9d1b-b5c41af7448a	\N	+7 (999) 000-00-00	Ivan	PENDING_STOCK	322.00	0.00	0.00	322.00	DELIVERY	WEB	ONLINE	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	Red Square 1	\N	\N	2026-05-01 06:39:08.149369+00	2026-05-01 06:39:08.149369+00	\N	\N
7d0d4e32-6130-402a-bfa5-76008b542e62	ORD-001049	82ebf6a4-0fb9-44df-9f96-32cde6157530	\N	79990000000	Ivan	PENDING_STOCK	489.00	0.00	0.00	489.00	DELIVERY	WEB	ONLINE	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	Moscow Central 1	\N	\N	2026-05-01 06:42:12.963138+00	2026-05-01 06:42:12.963138+00	\N	\N
dd5f220b-80e8-4af3-b926-e3769cf95535	ORD-001050	e88c7b33-37bc-42de-a75a-4655ce3631ae	6fc8b99d-19d5-409d-a9c4-56b312c883f7	+79011231212	Sail	PENDING_STOCK	161.00	0.00	0.00	161.00	DELIVERY	WEB	ONLINE	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	Lenina 10, apt 5	\N	\N	2026-05-01 06:45:34.185435+00	2026-05-01 06:45:50.114389+00	\N	12a8f60c-db24-413f-9f77-ae7c619388b8
c3ccdb8e-951f-4a6a-b18c-1204b3db2820	ORD-001044	0ae66721-1054-49ce-9e65-604ba8e521fa	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	\N	\N	READY	483.00	0.00	0.00	483.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-28 05:43:04.682802+00	2026-05-01 09:36:14.576364+00	\N	\N
f40b2c3b-d5c3-4798-b60f-b15364418e05	ORD-001051	26e1b0e7-e197-49a0-836c-5415d434d4c3	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	\N	\N	COMPLETED	966.00	0.00	0.00	966.00	PICKUP	POS	CASH	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-05-01 09:48:58.062109+00	2026-05-01 09:48:58.062109+00	\N	\N
bb91389f-54d6-4bc1-8d87-25e006d8b0ab	ORD-001043	fa0478ad-9fe1-42ab-936f-810e0f6f89fa	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	\N	\N	READY	644.00	0.00	0.00	644.00	PICKUP	POS	CASH	f	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-04-28 05:42:51.419846+00	2026-05-01 09:58:39.299624+00	\N	\N
b34962e4-4cbe-4eeb-8a23-28f8963e9619	ORD-001052	63536f83-fb75-40eb-92ce-073807a5a33c	916d084d-efbb-4008-8f0e-671d83ab4e10	\N	\N	COMPLETED	3315.00	0.00	0.00	3315.00	PICKUP	POS	CARD	t	\N	5376136f-141d-4d4a-8a98-089ed5376333	\N	\N	\N	2026-05-01 10:09:32.102194+00	2026-05-01 10:09:32.102194+00	\N	\N
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.payments (id, external_id, order_id, amount, status, confirmation_url, qr_code_data, created_at, updated_at) FROM stdin;
6e1af166-cd76-489b-afe1-6799711f9582	yo-f23c3230	c1769a0c-4518-4be1-a3c0-e4894ded32c2	310.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-f23c3230	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=31000&cur=RUB&crc=ABCD	2026-04-25 14:48:37.291277+00	2026-04-25 14:48:37.291277+00
7a717efe-07a6-4cf6-b6bb-a3a77dc58ddc	yo-163a7c2d	08e1e882-27d8-4b0d-a49f-c5df94e13316	465.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-163a7c2d	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=46500&cur=RUB&crc=ABCD	2026-04-25 14:52:57.927922+00	2026-04-25 14:52:57.927922+00
5e26821b-bdae-421d-8b3c-a5c25b4cac31	yo-7fc0094a	0492d5c8-43d4-47e8-b081-e07a712e8c82	310.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-7fc0094a	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=31000&cur=RUB&crc=ABCD	2026-04-25 14:55:03.397041+00	2026-04-25 14:55:03.397041+00
c249f571-deb1-4ab3-899d-96bb7a556bd5	yo-f2750372	9d252f35-0a56-4d9f-9218-8667fd41c75c	310.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-f2750372	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=31000&cur=RUB&crc=ABCD	2026-04-25 14:58:05.272625+00	2026-04-25 14:58:05.272625+00
5dbfa9b4-3d3a-4cc7-9ce6-3627599a03e1	yo-b1310182	2c9747dc-958c-446c-9bbc-08bba6f078bf	570.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-b1310182	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=57000&cur=RUB&crc=ABCD	2026-04-25 14:58:43.395962+00	2026-04-25 14:58:43.395962+00
7da9df1e-e76f-4c15-b391-1347d5958a22	yo-577bc1a3	4f85f110-a6e6-4afc-8bb9-98d6f8b0ea6c	570.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-577bc1a3	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=57000&cur=RUB&crc=ABCD	2026-04-25 15:02:14.500929+00	2026-04-25 15:02:14.500929+00
e36cd8e3-31f7-4756-a8c5-7fee89d40053	yo-9aa25120	e7f0dedd-4dc2-4f57-a9b3-1467b584efba	930.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-9aa25120	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=93000&cur=RUB&crc=ABCD	2026-04-25 15:10:22.814469+00	2026-04-25 15:10:22.814469+00
379df146-8005-45c7-9082-76b934f391c1	yo-e86ed5f2	61cbb805-1166-442f-8c9a-428485f54fb6	1610.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-e86ed5f2	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=161000&cur=RUB&crc=ABCD	2026-04-25 15:16:20.341398+00	2026-04-25 15:16:20.341398+00
a152065a-7f0e-4ef2-ac3c-5fa4dd3db3f5	yo-8ac84155	099fab14-bb4c-4523-936b-1c967b41c1d0	8550.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-8ac84155	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=855000&cur=RUB&crc=ABCD	2026-04-25 18:41:05.721274+00	2026-04-25 18:41:05.721274+00
b515c2ad-1be7-43e4-8f09-7ff18e97a744	yo-e374997b	7c0f8ada-3aa5-4799-ba2d-261d15e89049	1705.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-e374997b	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=170500&cur=RUB&crc=ABCD	2026-04-25 18:42:50.167052+00	2026-04-25 18:42:50.167052+00
411658a6-a42b-4993-8a5d-fd62133fe99f	yo-445c5be0	1eb913ce-fcfb-471a-af31-61da71f2bc0f	7410.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-445c5be0	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=741000&cur=RUB&crc=ABCD	2026-04-25 18:45:37.004691+00	2026-04-25 18:45:37.004691+00
46b4155d-92de-4b92-a684-ba73d3b262dd	yo-41cadfaa	2b9566a4-21f0-4bcb-99e3-37e08fb7d7e1	6923.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-41cadfaa	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=692300&cur=RUB&crc=ABCD	2026-04-25 19:44:51.052365+00	2026-04-25 19:44:51.052365+00
cd3e68b6-204d-4620-a92b-7f85527d1f1c	yo-a78baf24	dc1e525b-8f10-4da6-aa5c-830a8d019382	2861.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-a78baf24	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=286100&cur=RUB&crc=ABCD	2026-04-26 19:15:05.144999+00	2026-04-26 19:15:05.144999+00
bd83467f-6705-4b2d-a7d7-83eee8872dd3	yo-4ad33d8f	3500f21a-71a5-4dd5-8343-db3ba818a40b	1140.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-4ad33d8f	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=114000&cur=RUB&crc=ABCD	2026-04-27 08:37:45.221343+00	2026-04-27 08:37:45.221343+00
e8e47036-e100-4545-b942-64a6be26339c	yo-bdf41b1e	baa4327a-7739-4c4a-9803-231f320e7a84	334.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-bdf41b1e	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=33400&cur=RUB&crc=ABCD	2026-04-27 08:43:56.789938+00	2026-04-27 08:43:56.789938+00
0be8e1b0-de81-459e-a7b1-6eadb75b7c8f	yo-d793361f	b4a80272-275b-41a5-af90-6529b8206680	2093.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-d793361f	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=209300&cur=RUB&crc=ABCD	2026-04-28 06:10:31.660527+00	2026-04-28 06:10:31.660527+00
48ba543d-c268-4216-8f8f-5f6b4191b86e	yo-2e43dc76	61bbe86c-1e39-4d4c-b6d3-14be76427309	6740.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-2e43dc76	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=674000&cur=RUB&crc=ABCD	2026-05-01 06:24:24.245409+00	2026-05-01 06:24:24.245409+00
12a8f60c-db24-413f-9f77-ae7c619388b8	yo-5e69b884	dd5f220b-80e8-4af3-b926-e3769cf95535	161.00	PENDING	https://yoomoney.ru/checkout/payments/v2/contract?orderId=yo-5e69b884	https://qr.nspk.ru/AD100020V5924K9S9O0159C7NR9P4J2F?type=02&bank=100000000007&sum=16100&cur=RUB&crc=ABCD	2026-05-01 06:45:34.397737+00	2026-05-01 06:45:34.397737+00
\.


--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.product_categories (id, name, description, active, created_at, updated_at) FROM stdin;
e18dfdaa-1dbc-4e27-8d52-16ad405ea976	Розы	Срезанные розы всех сортов	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
69a9e7b1-8ba7-43b8-a957-68df21d87371	Тюльпаны	Срезанные тюльпаны	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
bb65a4bd-ed14-474d-9d41-a08e428e2dff	Хризантемы	Срезанные хризантемы	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
99b2df64-9651-49de-8369-ffec7c5aa6cf	Лилии	Срезанные лилии	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
26f34d1d-ef3c-4bad-98fd-a15161e8da23	Букеты	Готовые букеты и композиции	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
799f5eca-47a0-430d-950a-75b2d0239416	Горшечные растения	Комнатные растения в горшках	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
8257c642-61c3-434a-999e-c941bd8036a3	Аксессуары	Упаковка, ленты, вазы	t	2026-04-22 16:21:49.189513+00	2026-04-22 16:21:49.189513+00
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.products (id, sku, name, description, category_id, unit, current_price, image_url, default_shelf_life_days, active, created_at, updated_at, last_synced_at) FROM stdin;
6d4c8472-74af-436a-ba6b-6eb151da33bf	SKU-ED3C75F1	ромашка		26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	1000.00	c7d9b340-4100-43bc-b0b5-6921db5ca811	5	f	2026-04-22 16:29:13.110982+00	2026-04-22 16:30:10.121802+00	\N
92def0e0-8407-40ba-8929-e6a6078e95d5	SKU-7BC6CE69	роза		e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	110.00	4251eccd-9990-4533-a3a5-7e70086624a0	5	f	2026-04-22 16:30:26.448881+00	2026-04-23 12:28:53.94957+00	\N
c45f3a14-c3b6-4dab-a37e-f29cf57f114c	SKU-A7FA4939	Роза красная		e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	161.00	577356e2-3879-4b01-a261-e9402e58cd2f	5	t	2026-04-23 09:21:01.50278+00	2026-04-25 10:33:18.478166+00	\N
3873a853-97f9-46ca-8861-78f061c9b18c	SKU-4617C6B0	Тюльпаны весенние		69a9e7b1-8ba7-43b8-a957-68df21d87371	PIECE	173.00	804fd44b-1ee3-41fc-a29c-6e36d8952f54	5	t	2026-04-23 15:29:52.236561+00	2026-04-25 10:33:26.00942+00	\N
b0b886a5-aba9-46b8-805d-f7801f1b73f5	SKU-87CC1A49	Хризантема		bb65a4bd-ed14-474d-9d41-a08e428e2dff	PIECE	155.00	6e4408f2-d9f6-42c4-8d71-a650238a1073	5	t	2026-04-23 18:59:50.269943+00	2026-04-25 10:33:41.023523+00	\N
a4b37e14-314b-4d9c-a411-73c71067ebb1	SKU-2CBE5D4F	Гладиолус двуцветный	самый лучший	799f5eca-47a0-430d-950a-75b2d0239416	PIECE	570.00	9ab95457-d8a3-4cb2-bf04-c231a5247cb6	5	t	2026-04-25 10:13:50.668049+00	2026-04-26 19:06:19.461698+00	\N
d1000000-0000-0000-0000-000000000001	ROSE-RED-001	Роза красная Ред Наоми	Голландская красная роза 60 см	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	180.00	http://localhost:9000/florify/products/rose-red.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000002	ROSE-PINK-001	Роза розовая Аква	Нежно-розовая роза 50 см	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	150.00	http://localhost:9000/florify/products/rose-pink.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000003	ROSE-WHITE-001	Роза белая Аваланш	Белая роза премиум 60 см	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	170.00	http://localhost:9000/florify/products/rose-white.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000004	ROSE-CORAL-001	Роза коралловая Фри Спирит	Коралловая роза 50 см	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	160.00	http://localhost:9000/florify/products/rose-coral.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000005	ROSE-YELLOW-001	Роза жёлтая Пич Авалонч	Кремово-жёлтая роза 60 см	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	155.00	http://localhost:9000/florify/products/rose-yellow.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000006	ROSE-SPRAY-001	Кустовая роза розовая	Кустовая роза 50 см, 5-7 бутонов	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	120.00	http://localhost:9000/florify/products/rose-spray.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000007	ROSE-LILAC-001	Роза сиреневая Индиго	Редкая сиреневая роза 60 см	e18dfdaa-1dbc-4e27-8d52-16ad405ea976	PIECE	220.00	http://localhost:9000/florify/products/rose-lilac.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000008	TULP-RED-001	Тюльпан красный	Классический красный тюльпан	69a9e7b1-8ba7-43b8-a957-68df21d87371	PIECE	80.00	http://localhost:9000/florify/products/tulip-red.jpg	5	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000009	TULP-PINK-001	Тюльпан розовый	Нежно-розовый тюльпан	69a9e7b1-8ba7-43b8-a957-68df21d87371	PIECE	75.00	http://localhost:9000/florify/products/tulip-pink.jpg	5	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000010	TULP-WHITE-001	Тюльпан белый	Белый тюльпан Пурисима	69a9e7b1-8ba7-43b8-a957-68df21d87371	PIECE	85.00	http://localhost:9000/florify/products/tulip-white.jpg	5	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000011	TULP-PURPLE-001	Тюльпан фиолетовый	Фиолетовый тюльпан Ночь	69a9e7b1-8ba7-43b8-a957-68df21d87371	PIECE	90.00	http://localhost:9000/florify/products/tulip-purple.jpg	5	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000012	TULP-PARROT-001	Тюльпан попугай	Декоративный тюльпан с бахромой	69a9e7b1-8ba7-43b8-a957-68df21d87371	PIECE	110.00	http://localhost:9000/florify/products/tulip-parrot.jpg	5	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000013	CHRY-WHITE-001	Хризантема белая кустовая	Пышная белая хризантема	bb65a4bd-ed14-474d-9d41-a08e428e2dff	PIECE	130.00	http://localhost:9000/florify/products/chry-white.jpg	14	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000014	CHRY-PINK-001	Хризантема розовая	Розовая хризантема 60 см	bb65a4bd-ed14-474d-9d41-a08e428e2dff	PIECE	120.00	http://localhost:9000/florify/products/chry-pink.jpg	14	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000015	CHRY-YELLOW-001	Хризантема жёлтая	Солнечная жёлтая хризантема	bb65a4bd-ed14-474d-9d41-a08e428e2dff	PIECE	115.00	http://localhost:9000/florify/products/chry-yellow.jpg	14	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000016	LILY-WHITE-001	Лилия белая Oriental	Белая ориентальная лилия	99b2df64-9651-49de-8369-ffec7c5aa6cf	PIECE	200.00	http://localhost:9000/florify/products/lily-white.jpg	10	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000017	LILY-PINK-001	Лилия розовая Casablanca	Розовая лилия Касабланка	99b2df64-9651-49de-8369-ffec7c5aa6cf	PIECE	210.00	http://localhost:9000/florify/products/lily-pink.jpg	10	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000018	LILY-ORANGE-001	Лилия оранжевая Aztek	Азиатская лилия оранжевая	99b2df64-9651-49de-8369-ffec7c5aa6cf	PIECE	180.00	http://localhost:9000/florify/products/lily-orange.jpg	10	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000019	BOQT-SPRING-001	Букет «Весенний»	25 тюльпанов микс	26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	2500.00	http://localhost:9000/florify/products/bouquet-spring.jpg	5	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000020	BOQT-BRIDE-001	Букет «Невесты»	Белые розы и эустома	26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	5500.00	http://localhost:9000/florify/products/bouquet-bride.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000021	BOQT-LOVE-001	Букет «С любовью»	51 красная роза	26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	9500.00	http://localhost:9000/florify/products/bouquet-love.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000022	BOQT-MONO-001	Монобукет из хризантем	15 кустовых хризантем	26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	2200.00	http://localhost:9000/florify/products/bouquet-mono.jpg	14	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000023	BOQT-GARDEN-001	Букет «Садовый»	Полевые цветы в крафт-бумаге	26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	1800.00	http://localhost:9000/florify/products/bouquet-garden.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000024	BOQT-VIP-001	Букет «VIP»	101 роза в шляпной коробке	26f34d1d-ef3c-4bad-98fd-a15161e8da23	PIECE	18500.00	http://localhost:9000/florify/products/bouquet-vip.jpg	7	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000025	PLNT-ORCHID-001	Орхидея фаленопсис белая	Орхидея в горшке, 2 стебля	799f5eca-47a0-430d-950a-75b2d0239416	PIECE	1800.00	http://localhost:9000/florify/products/plant-orchid.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000026	PLNT-SPAT-001	Спатифиллум	Женское счастье в горшке 15 см	799f5eca-47a0-430d-950a-75b2d0239416	PIECE	850.00	http://localhost:9000/florify/products/plant-spati.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000027	PLNT-SUCC-001	Суккулент микс	Суккулент в горшке 7 см	799f5eca-47a0-430d-950a-75b2d0239416	PIECE	350.00	http://localhost:9000/florify/products/plant-succ.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000028	PLNT-CACTUS-001	Кактус декоративный	Кактус в горшке 10 см	799f5eca-47a0-430d-950a-75b2d0239416	PIECE	450.00	http://localhost:9000/florify/products/plant-cactus.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000029	PLNT-EUCAL-001	Эвкалипт срезанный	Ветки эвкалипта 60 см	799f5eca-47a0-430d-950a-75b2d0239416	PIECE	200.00	http://localhost:9000/florify/products/plant-eucal.jpg	14	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000030	ACCS-WRAP-001	Крафт-бумага упаковочная	Рулон 60 см, 10 м	8257c642-61c3-434a-999e-c941bd8036a3	PIECE	250.00	http://localhost:9000/florify/products/wrap-kraft.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000031	ACCS-RIBBON-001	Лента атласная	Лента 4 см х 25 м, белая	8257c642-61c3-434a-999e-c941bd8036a3	PIECE	180.00	http://localhost:9000/florify/products/ribbon-white.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
d1000000-0000-0000-0000-000000000032	ACCS-VASE-001	Ваза цилиндр стеклянная	Ваза 30 см, прозрачная	8257c642-61c3-434a-999e-c941bd8036a3	PIECE	650.00	http://localhost:9000/florify/products/vase-glass.jpg	365	t	2026-05-05 14:36:45.795464+00	2026-05-05 14:36:45.795464+00	\N
\.


--
-- Data for Name: purchase_invoice_items; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.purchase_invoice_items (id, invoice_id, product_id, product_name, ordered_quantity, received_quantity, unit_price, expires_at) FROM stdin;
1a6c115d-3f49-41c0-a973-cd603f19887b	1e393118-16c0-459d-b9d2-4322f208b240	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	15.00	15.00	100.00	\N
6b8b171e-faa4-4b73-b971-04c6a4e6e077	77287c23-93e9-4287-80de-29f58a185b68	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	10.00	10.00	150.00	\N
bd19eee4-f08b-4d8d-8c77-dc6848f3b71e	a80fb2e1-4dc5-443c-87b0-7007c6731910	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	5.00	5.00	100.00	\N
2dd45b04-0e64-4f9e-91d7-a55bcfaba5c9	26548e72-40f5-402a-861e-3c051314c190	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	4.00	4.00	309.00	\N
76a4baab-1fa6-45ca-b2c3-723ceca0af03	9f09bac8-8110-4190-8edd-e564d70cadb4	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	18.00	18.00	23.00	\N
64eca428-6f90-4fe3-80b4-d88d04467e0b	d964aed4-a7fd-456a-8c74-34277b697b9b	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	1.00	1.00	120.00	\N
4749eae0-a503-4b48-8044-ca68fb873fad	6fd5d807-4193-4a18-8223-95338cb80ec4	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	3.00	2.00	400.00	\N
583397b7-4272-4bb7-aff8-e0583321d040	90813d10-ab3c-4f9a-9f0c-0b7fc1bd208f	92def0e0-8407-40ba-8929-e6a6078e95d5	роза	2.00	4.00	30.00	\N
b5cb55a5-d8bd-4e1a-a47a-fd2b682c8841	538e8973-4e87-48ac-9f68-e4f15ed20f52	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	35.00	35.00	82.00	\N
27ff898d-4e53-435b-8df4-ed315c0047c4	f6dcddd5-3817-4f08-b5d5-c546cdcdb989	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	100.00	100.00	50.00	\N
983e4a7a-dcca-472a-8fff-685dec1209ba	f6dcddd5-3817-4f08-b5d5-c546cdcdb989	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	100.00	100.00	70.00	\N
e1f612fe-a536-416f-8603-13b1aa3c236f	f6dcddd5-3817-4f08-b5d5-c546cdcdb989	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	100.00	100.00	45.00	\N
39dc7d77-0fe8-481b-83f5-6c6b7dda387a	59e5cf04-b280-48c9-b379-d7a771843121	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	15.00	15.00	400.00	\N
f8fc0865-55e5-4b63-a9df-cf8219bda47a	59e5cf04-b280-48c9-b379-d7a771843121	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	100.00	100.00	120.00	\N
27a67261-18e9-48e8-8186-fbb21418887d	59e5cf04-b280-48c9-b379-d7a771843121	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	70.00	70.00	70.00	\N
bc68c41b-c422-4602-b25d-7cf85fc91d21	59e5cf04-b280-48c9-b379-d7a771843121	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	88.00	88.00	40.00	\N
c137751e-f34a-4b96-8563-65f005d19715	6a38a01f-7f75-4ce1-bda7-e667d3e39393	3873a853-97f9-46ca-8861-78f061c9b18c	Тюльпаны весенние	16.00	16.00	62.00	\N
f9325827-6405-40ef-8edb-43b546fde64e	b5c1535a-2c3d-42d7-8b37-18cfaf448fea	a4b37e14-314b-4d9c-a411-73c71067ebb1	Гладиолус двуцветный	77.00	77.00	400.00	\N
16726ad9-388d-402a-90b8-d52a5b547d66	b5c1535a-2c3d-42d7-8b37-18cfaf448fea	b0b886a5-aba9-46b8-805d-f7801f1b73f5	Хризантема	15.00	15.00	94.00	\N
7fa234f8-90ba-4015-bc43-e3ec5ba36845	1dbb358d-3161-47ca-a473-11353bc6e0cd	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	30.00	16.00	100.00	\N
1a4ad2cf-3435-4df4-8307-112128e9b103	1dbb358d-3161-47ca-a473-11353bc6e0cd	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	1.00	7.00	0.00	\N
9e4650bd-7248-4241-b416-99add51cace8	21e7a8ea-096f-4d79-9282-d668ee4bfbc7	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	Роза красная	5.00	5.00	78.00	\N
\.


--
-- Data for Name: purchase_invoices; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.purchase_invoices (id, invoice_number, supplier_id, supplier_name, store_id, status, total_amount, planned_delivery_at, received_at, comment, created_by, created_at) FROM stdin;
1e393118-16c0-459d-b9d2-4322f208b240	3	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	1500.00	2026-04-23 00:00:00+00	2026-04-23 09:36:06.413871+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 09:34:52.766496+00
77287c23-93e9-4287-80de-29f58a185b68	4	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	1500.00	2026-04-22 00:00:00+00	2026-04-23 09:53:35.593806+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 09:50:04.551177+00
a80fb2e1-4dc5-443c-87b0-7007c6731910	5	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	500.00	2026-04-20 00:00:00+00	2026-04-23 10:13:31.122231+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 10:11:59.411949+00
b5c1535a-2c3d-42d7-8b37-18cfaf448fea	PUR-202604-4212	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	32210.00	2026-04-26 00:00:00+00	2026-04-28 04:14:50.669693+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-26 19:17:47.757584+00
26548e72-40f5-402a-861e-3c051314c190	PUR-202604-4370	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	00000000-0000-0000-0000-000000000001	RECEIVED	1236.00	2026-04-23 00:00:00+00	2026-04-23 11:02:13.373019+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 10:58:56.800266+00
9f09bac8-8110-4190-8edd-e564d70cadb4	8	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	414.00	2026-04-24 00:00:00+00	2026-04-23 11:08:03.686792+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 10:48:48.389314+00
d964aed4-a7fd-456a-8c74-34277b697b9b	7	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	120.00	2026-04-23 00:00:00+00	2026-04-23 11:08:11.790664+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 10:39:34.403405+00
6fd5d807-4193-4a18-8223-95338cb80ec4	6	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	PARTIALLY_RECEIVED	800.00	2026-04-24 00:00:00+00	2026-04-23 11:10:05.189008+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 10:28:01.51014+00
90813d10-ab3c-4f9a-9f0c-0b7fc1bd208f	1	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	120.00	2026-04-22 00:00:00+00	2026-04-23 15:29:07.068959+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 09:01:54.647751+00
538e8973-4e87-48ac-9f68-e4f15ed20f52	PUR-202604-2681	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	00000000-0000-0000-0000-000000000001	RECEIVED	2870.00	2026-04-23 00:00:00+00	2026-04-23 15:33:03.017086+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 15:32:48.448708+00
f6dcddd5-3817-4f08-b5d5-c546cdcdb989	PUR-202604-6017	ae1175a2-d6d3-43b2-8234-e5340300b4f7	петя	00000000-0000-0000-0000-000000000001	RECEIVED	16500.00	2026-04-25 00:00:00+00	2026-04-25 10:55:26.40712+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 10:06:43.414316+00
59e5cf04-b280-48c9-b379-d7a771843121	PUR-202604-6097	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	26420.00	2026-04-26 00:00:00+00	2026-04-25 11:48:32.511764+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:02:18.718843+00
6a38a01f-7f75-4ce1-bda7-e667d3e39393	PUR-202604-6478	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	125af3cf-1458-4889-8778-ed612587a7d2	RECEIVED	992.00	2026-04-26 00:00:00+00	2026-04-25 17:38:39.588207+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 17:38:22.42538+00
1dbb358d-3161-47ca-a473-11353bc6e0cd	2	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	PARTIALLY_RECEIVED	1600.00	2026-04-23 00:00:00+00	2026-04-28 04:15:21.591082+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 09:21:43.7537+00
21e7a8ea-096f-4d79-9282-d668ee4bfbc7	PUR-202604-2692	6557499d-ca05-49aa-8409-99cb8d385268	тест мой	5376136f-141d-4d4a-8a98-089ed5376333	RECEIVED	390.00	2026-04-22 00:00:00+00	2026-04-28 04:16:26.255563+00	\N	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-28 04:16:16.177298+00
\.


--
-- Data for Name: recipe_items; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.recipe_items (id, recipe_id, ingredient_id, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.recipes (id, product_id, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at, device_info) FROM stdin;
66b0e5b5-04db-4275-b333-9384c5ad7740	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$3M8T5/S6k02mFJFjpRTwYO035YOGzbQUS2aePYVSJFa05DHjDR5V.	2026-05-22 16:23:56.317073+00	f	2026-04-22 16:23:56.317073+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
3a8dcfdd-5cfc-46c8-ace8-cd5366b656bb	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$XdIYtLw54Dm9AbulTKCsSuBA.zgFUhxW/4AN70hAr7XDrPCmksONe	2026-05-22 16:40:46.185471+00	f	2026-04-22 16:40:46.185471+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
aa776832-6650-49c5-b82f-39281185ca01	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$eVr6TNMuM0xOx9bu5EiBW.//XUAI3FT6CDp.mCUqQIffx9Ca53Eue	2026-05-22 17:15:07.000317+00	f	2026-04-22 17:15:07.000317+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
556dc03d-6c19-453e-a98b-82a32ce46e14	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$cEhgnlhBqNKDXBXisWm8wufvS7U3Xx5pd4y.xFsz9v2mxq3W3Ljfy	2026-05-22 17:33:15.344235+00	f	2026-04-22 17:33:15.344235+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
784cd685-8ff0-4522-848f-9e74f4e24396	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$R5QVf6oRkkhNjFYUsrA5wOySKT67lO859i6uIIx1WdJokYPJFTIAK	2026-05-22 17:35:41.619571+00	f	2026-04-22 17:35:41.619571+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
7a487135-393f-4754-a000-c9e73b98f641	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$tLXd7Y77f5gkVRXSL3gek.jHTrcruI/lhxTi0ns.Jf5IbbNr9eyfu	2026-05-23 08:58:36.119993+00	f	2026-04-23 08:58:36.119993+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
827a35bf-2fcd-4fb2-a6a6-87a977f527e6	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$UWo9aw1DkBd56BmK0VuegerSLx2erDJBR6/Qa5Z53TQu995D4FOYe	2026-05-23 09:00:59.935406+00	f	2026-04-23 09:00:59.935406+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
84df5c03-1af1-42ee-981b-2f1af7ed017b	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$fETFXcK3EyTDeRxHJVcvdu77IOicAYevV3ISxxiB732SHS0mHwc4e	2026-05-23 09:07:29.572226+00	f	2026-04-23 09:07:29.572226+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
f0c94de9-6d6f-4b75-8fb7-8abc04090100	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$yyzjlgCGWoe/pqg9/z24YOeJIPjQViUZ4Ig7geBWz2N0haT5pmSk6	2026-05-23 09:13:19.532455+00	f	2026-04-23 09:13:19.532455+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
50f3c902-ca13-4075-97f1-46d579eb57d4	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$21ouPmb8WLFy5d40QW6h.unyptQ5uzJIwt1qajCG/CEbWHxcYJa2i	2026-05-23 09:14:05.712645+00	f	2026-04-23 09:14:05.712645+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
2ce068b4-07aa-4bf7-aac5-5b6983e0fa4a	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$4zJ62u4r9Bq6p9qRc2RFC.1OpJY9aCz0d7S123ubAqa4xDUc4cSfq	2026-05-23 09:19:39.762314+00	f	2026-04-23 09:19:39.762314+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
1f1e2f65-b0e0-4cac-bf49-b7f896b01aa4	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$eB7hR7xbsmpSmrMHdy4omOuhEDSL2EpCJtpK8mqILRvyVfSJtrun2	2026-05-23 09:31:58.654521+00	f	2026-04-23 09:31:58.654521+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
c93726d1-220d-4114-bbb2-1a6598ea1596	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$DGgMuFsZ8DJqJsnCsvoNRuk1Hji3o4fr0x96kUCCJBCdu4jr4x4AW	2026-05-23 09:36:22.577824+00	f	2026-04-23 09:36:22.577824+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
72c1bcc6-8bbe-4f58-8fde-3d0d0d9058af	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$tgPz6V0M3Q8jQEE/JRPK7.tyzhSJhrwl8LjqhJII8XR8c0V0ylW5a	2026-05-23 09:49:32.930114+00	f	2026-04-23 09:49:32.930114+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
e374b846-430b-49c6-9cec-b2512031b168	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$.9kc6beUU51h.PdPaTTPMuekqajDroDIGHevAyVieVrpSId/Pl1wC	2026-05-23 09:53:46.708581+00	f	2026-04-23 09:53:46.708581+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6841070e-e6ce-410f-87ba-a23da6ec2fb5	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$czIB/HuBGaGKFJtMQt7ix.55lXrF5KrdP5x7Au2NeKiETQRDVs7Sa	2026-05-23 10:09:57.482112+00	f	2026-04-23 10:09:57.482112+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
05318802-26fd-4649-8a5f-739efadf3e27	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$NPz9Z.fEOFiUFiEBI002wuMk7.Pm626WvSledlAbg2bPePkIeYyC2	2026-05-23 10:12:07.314804+00	f	2026-04-23 10:12:07.314804+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
24efc3e3-0729-4111-84e2-eb80547e0e9b	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$UuFYYiuqlV17byLWljYMy.ywttSYmvdqAyFF4ug8JELRBxOt25wNa	2026-05-23 10:27:12.946316+00	f	2026-04-23 10:27:12.946316+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
a3cacb94-e011-4b06-92b0-f72bafe7872e	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$DmzMm/aVKQAYvq4xqAN3sOY60vlHjU5ZRWPz5P4dZL2KoCpkcf97W	2026-05-23 10:47:50.904282+00	f	2026-04-23 10:47:50.904282+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6f8afa9d-b4cd-4b6d-a623-f9ac5277fcfa	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$DafXbxf1bfpPiYAUptKer.VB5A/j/W3Z762LN3OW/QttlMadchT6.	2026-05-23 11:07:13.304463+00	f	2026-04-23 11:07:13.304463+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
395760e7-2f1c-4942-9eb6-4437326b73fb	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$wkd4KwJN7c8dAX6M14eLJOmygXQ5TRH1JQ.SqJT/5jD9JO5aRode2	2026-05-23 11:27:48.300792+00	f	2026-04-23 11:27:48.300792+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
3667bb8b-b3ed-4774-ad0d-1e9d60ce7ebc	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$SiL7gMhbE4nLt0SgCZ3qdOEtQEAHB2Y/hxCew3JczIyY2QxZ6qEd6	2026-05-23 11:43:40.490048+00	f	2026-04-23 11:43:40.490048+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
427293ff-ed6c-4519-b983-0d9d3903421d	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$bgZj0bACdYP6xkuNvPPOVexTwBUzhTJMKv8N96aFNaP/PldeRVddG	2026-05-23 11:59:42.028547+00	f	2026-04-23 11:59:42.028547+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
70c8d337-560a-4b11-9a72-383ba188669f	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$TpZN0hwcCWtCCTFin.x6Zu.E.Et3H8YVjA4rO5ezU/KdVn1lBN3hi	2026-05-23 12:02:55.68366+00	f	2026-04-23 12:02:55.68366+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
f2c0e988-5550-4a63-9877-eaee9a1f7393	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$WY2FHa9AqfCTpBzyPGfdquirpPCv0WIFUVxCLs3ZzyCBdIAi.8146	2026-05-23 12:28:42.049153+00	f	2026-04-23 12:28:42.049153+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
1db83694-0983-400c-b9f1-de082732c9ed	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$d8RgNrXF9T0tEUX7CnTFfuzk6khBaXAkdPtQgHkz6s8FbvyBLOo4e	2026-05-23 15:28:25.877892+00	f	2026-04-23 15:28:25.877892+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
1932a313-a8f7-42a7-8597-3b945e188918	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$LXBj2aBjAbS3jd.89W9.bOH8vfKlOwIPpcDEuvBOqA/5btt3mE75K	2026-05-23 15:47:11.212847+00	f	2026-04-23 15:47:11.212847+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
33a48155-04fd-4578-8569-c5cca33d6000	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$w/rsuSpZnDAcJyO2fmmwYuI.jOratRwoBzQ.Dhg.e8z4m0oudm.Vq	2026-05-23 16:33:57.34634+00	f	2026-04-23 16:33:57.34634+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
ff958337-7db4-4dd2-a3e4-5bcb106d49fd	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$8X21SuC.leRbbwWAodSCpO4r7nwOkiKhpw0AT3bL7fGt32lBZBJsW	2026-05-23 17:25:25.137641+00	f	2026-04-23 17:25:25.137641+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
a53566c1-63ca-4e19-9651-cd906513f84b	385b516f-fdcd-4dd4-b6d6-3a2fa003f600	$2a$10$7tOIRp1DGp3R7mSYEwEsbeGR.TE8zZwPv07OEVM3I7LJwgu2ytwja	2026-05-23 17:30:56.117402+00	f	2026-04-23 17:30:56.117402+00	unknown
1a9d3c5a-ce0f-401e-b775-2ce092669f0d	c191bedd-423e-46a0-a58a-80c46f7330ed	$2a$10$bJuxx0SGQeWmm0JydSvT3.owAkxzZKuktJx2AWt1Aytd1fbz5FtxG	2026-05-23 17:51:06.497092+00	f	2026-04-23 17:51:06.497092+00	unknown
2c149fd8-98c6-473b-8000-c5cc78312ef9	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$KPx0xX0/nqve7uoAFynJSOYbxvhYXeL0KtZkDwPHZgy6wjcMKSDyW	2026-05-23 17:51:09.142913+00	f	2026-04-23 17:51:09.142913+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
7d7afafd-bcdb-476d-a8d6-c76ceb167cd0	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$sUdaqj1kDvYxr52Xv9AZje8rgclRvYk/S3irJrDd15yZehIoMpVYK	2026-05-23 18:22:34.59889+00	f	2026-04-23 18:22:34.59889+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6281c020-e60e-4efa-a901-18b6de6a558d	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$HGlmdLayltfhPvBM4E.pRuCHq.nBVypNpbs1vcMCTnh.5opqxzC/m	2026-05-23 18:56:04.662273+00	f	2026-04-23 18:56:04.662273+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
406d472a-f11e-4e2c-bff7-4f832e98aa6c	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$noctoM2Q/59U.dLQd5MCbepm1tCDw3KJee3b2E5VMH9VUhF9VCfAa	2026-05-24 12:56:43.961799+00	f	2026-04-24 12:56:43.961799+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
85963f53-6276-494a-8124-37c0d9d70dfc	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$S.5jfsxiyyscbJs.9hK75.YIdpEFzQMy2E5A0gmZP4IyN5EjDBN7i	2026-05-24 13:14:20.917541+00	f	2026-04-24 13:14:20.917541+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
b9e92968-4387-4cd5-a3a6-6a7bf09fa133	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$K3lGjofQpEAmwDxyuARni.AqStqT76CCfITSl3ozC1Q0VNNgpE6p.	2026-05-24 13:14:27.822517+00	f	2026-04-24 13:14:27.822517+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
766babd7-19a1-4157-bf22-98e1773cc392	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$3Q5.VHYjgNf4zXNei9GZfO7R5mKShbkE4.Sxf6Gtu5Bn6sBJNiIsm	2026-05-24 13:15:48.408806+00	f	2026-04-24 13:15:48.408806+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
0f017464-d5e7-4867-9c46-2b864083bc01	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$tRawPRQ.oUjbowk47OXWqOLEyrEuGnNPOOuWxzOxLy6qnuNzhAiVm	2026-05-24 13:40:21.098115+00	f	2026-04-24 13:40:21.098115+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
d6ca314c-db3d-4ce4-9d80-323656eb4cbc	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$wseVFt4p2Vbq4Yn1Wl2IBeMjSGVbRQXloOzVrzk9hFH55Fev5RdOy	2026-05-24 14:01:59.169098+00	f	2026-04-24 14:01:59.169098+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
ad82b7dd-994f-4744-b95c-4ae46436e872	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$hJ5KEIZoqvSFsUFous9QcO4Mlym5KmOdlpGI3szlRV284Ktdl7k.a	2026-05-24 14:04:56.043166+00	f	2026-04-24 14:04:56.043166+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
3dfa668a-dd1b-475a-bf6c-c1647cea82ce	88b48703-4baa-40c4-b792-0737a78d8372	$2a$10$J3RfwQ4yHzGcn9jFrm0Yc./wuFcYlWBpoclYiU0mKrWvXkSidiiw.	2026-05-24 14:05:42.045217+00	f	2026-04-24 14:05:42.045217+00	unknown
5da94483-fe21-44d6-b3f3-ca8df9d8340c	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$OGnWIVogvNrOrg87Fvg2ueDfgmNH7t/zozOMUSXZSNWhGF5IwMkiS	2026-05-24 15:04:48.862596+00	f	2026-04-24 15:04:48.862596+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
19971c56-7331-45d2-92b0-9fe619be78e7	d5c3cdc7-0129-4e0c-854e-eb597858d01e	$2a$10$FSXqGf8uuU5mDgE4Cclp8.3xi0n.kXfYTFlxBaMct4n09JTuxEbaC	2026-05-24 15:18:39.427538+00	f	2026-04-24 15:18:39.427538+00	unknown
52aa1430-88f0-4dbe-a59d-b334513a2d4d	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$46hF4Rl1iZGX6W.Do9NmxezazITBniQHrHzUX4uxneuQ6BC.Hbcly	2026-05-24 15:29:39.380741+00	f	2026-04-24 15:29:39.380741+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
4b122901-23d3-472b-8b5a-f24f712d3fb1	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$1F8uH5kqH9t7IVzhZRxazOnU8Mri1XPKWhXwzfu2nAjZ1U4JHgpFe	2026-05-24 15:37:17.987602+00	f	2026-04-24 15:37:17.987602+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
46a16b3e-7c6c-4d06-a603-1fe7723725a3	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$pSdGNCNoFg99xrse5EYQhOmUo..Q2Y1zDJOkCLb9zRvFrixYkB6fy	2026-05-24 17:55:28.954045+00	f	2026-04-24 17:55:28.954045+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
b1e3ee5b-0c62-4571-815b-5dad2854675c	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$4rxUNCEhf2sYjyH2BPhS4uX0aBo.iTtPPHCsUtnf2n3Zg1IMOzfRq	2026-05-24 19:00:09.096158+00	f	2026-04-24 19:00:09.096158+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
083e9b20-f693-4ba9-8316-c3ddc1e4694f	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$0xCBBblpkX/VLKab6nFMO.9JIkoj0IPv0nE0R56K4wR0IKUBzQZMO	2026-05-24 19:18:07.923205+00	f	2026-04-24 19:18:07.923205+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6dc35363-1deb-476c-b1cd-9e7059f792a4	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$zgFTYTUHX.rbTsqkTthntuof.VkAaWv4CiAQ.CB3ljb6NqzkMnS1a	2026-05-24 19:36:27.231778+00	f	2026-04-24 19:36:27.231778+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
713f86a8-4a4a-47af-b1aa-a429ad782d9b	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$wDBbXyJ8W3efUniIs.O0MupZRmIx3X.GhZllPu1gjEs2EL/CGQ6qq	2026-05-24 19:52:37.871387+00	f	2026-04-24 19:52:37.871387+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
95aa7e27-c79d-4f90-87d0-8ebe92594ac0	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$L92EqL3ym.A8Jd1761QiJuk7JuAUPGLiwpVRnowR6BErmYmEucROe	2026-05-24 20:07:46.207082+00	f	2026-04-24 20:07:46.207082+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
468dc5ac-4607-4632-aa8b-8aff90147654	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$XbRIS/Aq4i2Gvcuef4zDluL4iEn7X0ipiwF0OSlzcNbuUcg01NCQu	2026-05-25 06:38:20.2365+00	f	2026-04-25 06:38:20.2365+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6bb0c896-930d-42e8-91d7-68d9c33f2be1	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$OvqdEmALu353ZGRJ793VzOqh.h.9/VK0uSz83gPfAo9U/VuFTsTFy	2026-05-25 07:26:42.222229+00	f	2026-04-25 07:26:42.222229+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
1adc70bb-c16a-4d78-8ba1-5041271bab70	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$2qNA/k.L4wNCED61ruBpGeiqUWrlovJHVYceAEft5KiHXbc7QVNwq	2026-05-25 08:55:19.428258+00	f	2026-04-25 08:55:19.428258+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
49c3b5a5-e8e8-4574-a30f-e65b2a8e69de	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$PK4Qautjxd5uoFXk4yUsOOcOAY6j6.YEhpAwMEhWumCjfXndY4Cim	2026-05-25 09:57:43.472937+00	f	2026-04-25 09:57:43.472937+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6a91706c-e6f6-4476-ad91-0ea42204b5ca	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$jmrcAGLAm7DzsdrZlwo.h.DfsmcsUl3wO43jpV10hrKukcqHEQmWa	2026-05-25 10:13:04.922368+00	f	2026-04-25 10:13:04.922368+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
4d1db921-6e0c-41f2-b109-86ad6d6862a8	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$oO.Ng.qwcidKA.TNjnrDyOMDfHaZlTw65VSaRMTT7H4uX7RhrEjB6	2026-05-25 10:32:49.03375+00	f	2026-04-25 10:32:49.03375+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
c37dcf9c-ecc5-4b30-923c-565697520acf	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$iadGnFPKQZcXZGnhkH8uheIIkUm12hcGJPSoAlRVKfnNgn6RXY2ji	2026-05-25 10:50:58.487399+00	f	2026-04-25 10:50:58.487399+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
db725e9f-0caa-49dc-b037-cba6fbdd9f6c	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$Bw9rupcg5U1OfVnXSjim1ONG2OE0CZgOyacT2ISfbdD2xUv7Ar.p6	2026-05-25 11:07:27.880656+00	f	2026-04-25 11:07:27.880656+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
1d017443-63ce-4358-8956-bd5d1094bade	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$LcJD9lbrjbMW7RLQnvpsAeUIbvtBD0gFrzuKR9bbET.MR60FZB7sa	2026-05-25 11:42:13.808455+00	f	2026-04-25 11:42:13.808455+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
b237e0d9-8d88-40d3-ad97-43e0b389818e	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$dqo5YG3PP7HcAfSG5/4zseNprWdKOT5jB/eZN5mtc5LZOH/f2eIGq	2026-05-25 14:10:50.233448+00	f	2026-04-25 14:10:50.233448+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
e9160aab-e753-4ee0-870f-22543b64e735	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$HFJ5Dg4f5hvRyeQK/jbBJe6u.jOzfTb6hmCGlx/Vn423WBzbp8rKm	2026-05-25 14:47:40.122211+00	f	2026-04-25 14:47:40.122211+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
015c3ea9-621b-4a6d-9421-99865fdcc9b4	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$p4fg.b4FMEUPVXZ1XsGkIuUwJwBX.g1h7mfcCaZephO75IvF3aJpi	2026-05-25 15:10:11.280012+00	f	2026-04-25 15:10:11.280012+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
b74c370e-8139-4b0d-9fde-453835fac2e2	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$c65cKQlp5.bE8ossogWz0OfWWKrIkkbgwltFMruFz0kCMnOggLs4K	2026-05-25 15:26:54.646195+00	f	2026-04-25 15:26:54.646195+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
96e9978f-2055-48b5-80b5-b840bd14ae18	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$8Myb8ajYduQXup2zqV5sZOw2gYB0riKtx7xnPAeJfnoMjq9AL.52e	2026-05-25 16:47:22.772664+00	f	2026-04-25 16:47:22.772664+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
dee340ee-4d24-4eea-9e5b-7a1619735eab	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$sBnxZ2TMnGVtDpEErgx7hOM/F8xeu21JT/6PxQBGk0av31hj3ceRm	2026-05-25 17:06:19.527281+00	f	2026-04-25 17:06:19.527281+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
e2425aec-4396-48ac-9c0a-570a727b927f	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$..pmcadBJTaoLwL1X3LeRecv.d4guDktTmbLNNmh2BC0rBoEjGpeq	2026-05-25 17:21:35.307783+00	f	2026-04-25 17:21:35.307783+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
8b272b8c-795e-4ab7-87c7-dbcdab09e7d4	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$J2TSISPVCQvJ0SvHJcrA9eH4SzffBnhUgKIwT8r1MGbanLB53PKVa	2026-05-25 17:37:06.117976+00	f	2026-04-25 17:37:06.117976+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
54ce3df0-58e0-4599-9c82-8a7641a18e71	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$XHhFYP3Ji4QyVZPkn.un8OyGjKePKrCVAmoeqtn62Y8B81zRRViee	2026-05-25 18:31:57.395989+00	f	2026-04-25 18:31:57.395989+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
44045dad-5912-430a-905b-98accf7e8b5f	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$Vp4s2rLs51j.sto21mmQgugV8LPkq/2veKoT.LiC9ksj56/Y9TDgK	2026-05-25 18:31:59.593271+00	f	2026-04-25 18:31:59.593271+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
ff696ec8-7e45-4615-8ee2-810e03293450	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$HLSxhP1eXaCCdAPG30HeB.lQHLxioI4ndrhyVv/AVUzkJHZSN2P2G	2026-05-25 19:32:03.704222+00	f	2026-04-25 19:32:03.704222+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
e1defb37-a561-484a-91e0-49d1622acf17	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$lu9AVGOlD4NGb8evb7dZrufV4TSceQvOPqhbcRgZ6A/n4r4tKq/7O	2026-05-25 19:35:05.25132+00	f	2026-04-25 19:35:05.25132+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
5b60ac26-644a-4bdb-b309-f45af597529c	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$/9zYUKmsW05fFIde84GjT.qUnGk9SuxaUxjb9lrKchBGpG7ry6iLu	2026-05-26 18:24:09.642368+00	f	2026-04-26 18:24:09.642368+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
a9a562e8-d351-4e00-b2db-aeaf9cafb46e	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$eZopYwqbfPbrBqA4c5Ylk.EasndWWBcQerAD2pBGvYmrZiUz9WJua	2026-05-27 08:36:48.552188+00	f	2026-04-27 08:36:48.552188+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
f3f6bd47-9968-46dc-a112-870bfa3d93ff	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$UMdQj/mKdAUYISAfGx.q.udx3upA/Uz5UYG3ByycPJ37l9UxEdrIC	2026-05-27 13:52:19.286746+00	f	2026-04-27 13:52:19.286746+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
0e8dd5ef-6f33-438d-aa9a-c0f4353b73c4	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$gOIgEYxFhGoS/jSa4mHO0.6VC6jKFoyIb39deUWbJwnblvjy4mrsC	2026-05-27 13:53:38.570734+00	f	2026-04-27 13:53:38.570734+00	unknown
97da1a73-de7f-4d7b-93ea-cdcfd80f4a4f	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$4olJ2FRUPChQRrouIi2MI.bm4GlRIt650eua8bqHOSBmkdTK3v4mG	2026-05-27 13:54:09.68805+00	f	2026-04-27 13:54:09.68805+00	unknown
2e1fbb3d-afae-4c47-922c-f6cb74051a19	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$TNAF3Qqov2mfKKWD3wUWPe7ufNyTvgrJCTIzAExRRXGqyyepE//py	2026-05-27 13:59:54.862267+00	f	2026-04-27 13:59:54.862267+00	unknown
fe6b35fc-f29d-4cb4-9b3d-aba62c5e5d6b	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$ZgnTP5GhqraALNN9EilG1O0xsLoFhfyeKeWRfoUcHJ/6./w9KMDMO	2026-05-27 14:00:04.013798+00	f	2026-04-27 14:00:04.013798+00	unknown
fd2662d7-535f-47b6-9c14-96e8f5dad788	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$8Gg8tlnXsgtMQ0FJfq9ltuMW0RFazquUIjq8QsqsorCUlbeN2k95O	2026-05-27 14:00:05.668597+00	f	2026-04-27 14:00:05.668597+00	unknown
6e64825a-c36f-4bb6-930a-058fe06aa912	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$tPUiPnrr7KLCY4sa8xhkI.Fp7cM6mNdmKmxjoLisZ8HGdvM3LSZOK	2026-05-27 14:02:31.538327+00	f	2026-04-27 14:02:31.538327+00	unknown
72a6edf3-e3c3-482a-b6a2-4b813ddd75dc	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$CX.2IYE/3aqQROPLRXSFheqWf8Z.LAM7yM7XYUxRrwm/WpJrwiNTe	2026-05-27 14:03:05.529173+00	f	2026-04-27 14:03:05.529173+00	unknown
4a33ae56-1c8d-4756-bb08-e27d51a21b1e	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$KFz97porqqnpvgDqwkJgou6.plr8hRIzm20tW9dJqSJuePhyfl19i	2026-05-27 14:04:53.406871+00	f	2026-04-27 14:04:53.406871+00	unknown
0f34e3f9-f77a-4ae5-9c3c-f9ecc75a50a6	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$k6n9KzMGIs2ayYKKgBP4oe6XPC4ZBzRXz/y8HUCIL5c96fSPI0dvG	2026-05-27 14:06:29.571513+00	f	2026-04-27 14:06:29.571513+00	unknown
fcf73d09-9a09-4079-b789-b2dd802fe421	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$YL1cGTHfcZ36jQX5Xip.begdx..8TkskzJSRzHa2XYO.hgrMlJv22	2026-05-27 14:06:43.318469+00	f	2026-04-27 14:06:43.318469+00	unknown
8dd8b542-6848-4b8b-873f-3dd1ca5f66df	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$wdrHMobUCAaeMomlJ8f3qu27ybnR9Ru/s9GFQYDWD5BkhUytXSzZq	2026-05-27 14:09:05.528091+00	f	2026-04-27 14:09:05.528091+00	unknown
656c33ec-bb60-4d16-a8a8-d2ef0af60673	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$.ma1eaYb0SWk2H88tGO2GO5pKGhRo7szeAtHutvJLbiAx6N656ZQe	2026-05-27 14:50:37.101774+00	f	2026-04-27 14:50:37.101774+00	unknown
b7c13a67-f4cd-4e81-9508-6c3fc3ccd31b	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$.cfiRfv3pnBgdvlpFysrROqfNs2GeVs42ZH4YgLLTeJNsdHS8y13u	2026-05-27 15:11:28.41457+00	f	2026-04-27 15:11:28.41457+00	unknown
d432ab38-4489-4041-ac60-20ef7d4ce790	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$UH05lgLIHdfI2X7ScpqQleTfFWvSRPsVyj7FYDvIMepPkrPlDs4N.	2026-05-27 15:53:49.359139+00	f	2026-04-27 15:53:49.359139+00	unknown
eb88fe67-3d34-46cd-96bc-0dfbf4fe02b7	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$oWd2FUbeUmhl0hWRHS0DHuFruu4a9Y9TjB3Xy2GwEXwVjHjYp9CY2	2026-05-27 16:06:06.099087+00	f	2026-04-27 16:06:06.099087+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
7d50a7ba-8205-4053-8615-2acf4585cdc2	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$Ir6s8SinDuwWuMIa27zP.uvNEu2BYuCdO/uSvVPBKWDKXNn351qSy	2026-05-27 16:07:21.464021+00	f	2026-04-27 16:07:21.464021+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
7fabaf84-4d97-47a6-b064-8921941d4144	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$HFOAP/NETOr9lup6NCrTE.Thpb62fEh5la82x75TM4zyK75YwI4Z6	2026-05-27 16:07:32.249341+00	f	2026-04-27 16:07:32.249341+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
a54c1b38-7efb-41b5-acd1-95acff904c2d	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$hgnAsHzSZptivFRzjobuG.t.qnMAQxK/ji1EHY8OnuH6gG.qtd8Ie	2026-05-27 16:11:15.162276+00	f	2026-04-27 16:11:15.162276+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
ccea82c9-e2b0-4a32-8144-e9624a72abf4	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$lu.D08uTImDOL60Wl5LjWuptSeh1FH4LUhL3zNpXvOSRUZazZcZga	2026-05-27 16:11:29.633472+00	f	2026-04-27 16:11:29.633472+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
fced8f20-f920-45df-8ca5-3f9b177c256e	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$9gPePW9k5zGnbQz8sgay.OTb2Zih6qYtJfEolVDYR1pHRyOVa14t.	2026-05-27 16:15:20.316757+00	f	2026-04-27 16:15:20.316757+00	unknown
b95da0c9-06aa-4348-be0a-8389d595d7b7	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$J9MsEQ61ANAyLQLoA7GxvO7iXXvw8pPcWzdqYJjqiWErADcpCEE96	2026-05-27 16:19:53.03708+00	f	2026-04-27 16:19:53.03708+00	unknown
2ac87a6e-96f5-44c4-b508-c1cb7875e846	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$pDO0Bcxl1dUJ34ZtfnBUVuVbs3vzDbMx1EK/Xhea1noeHOMSdAlgu	2026-05-27 16:28:19.447369+00	f	2026-04-27 16:28:19.447369+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
d07d0f61-7b36-404b-84c4-c8308bc52add	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$ny5jeEYu0RI9x82F9oKy/.4puxMittR.Gvpm2EbBiHNduQQj1arqm	2026-05-27 17:00:36.813535+00	f	2026-04-27 17:00:36.813535+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
971ef0a1-b2bb-4d7b-b85a-db3a818cb5a6	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$a.4/DwUFhmm88pxM7T2AwuIKMUFGWjJPRBD9tuo6c1x.AbW80DC4W	2026-05-28 04:10:37.35899+00	f	2026-04-28 04:10:37.35899+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
c6df1c5b-a815-43a3-9564-80dc0baf0377	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$1oUVMBLlnl3a0nJWDlgoEOVfUkwg3lGoG0sTfsgIjAGGRP.SjzjTC	2026-05-28 05:35:18.69694+00	f	2026-04-28 05:35:18.69694+00	unknown
7ca67fea-cfae-495c-8df6-5f4aede1321f	cc036b02-69c5-42f9-a265-110c75c7658f	$2a$10$0CbcI9AO9Si5oCuYuZJy2esa4YRBFT28.dSQrrBsuR8YHnHNaLPHq	2026-05-28 05:39:11.681684+00	f	2026-04-28 05:39:11.681684+00	unknown
9267bd94-eb61-46ec-b0f0-245148e261ea	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$Ou5QbwPBJUJ.lX4bApBG2O4z9DYwXquINd20TP03BNGwW9X36pYA2	2026-05-28 05:40:18.464379+00	f	2026-04-28 05:40:18.464379+00	unknown
d32a2247-ab03-4254-a3e2-adeed9f3783b	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$/il/FQ.bv/XTb1/jq2ncp.WQWbYIt2d.teD4hSaaUY2y0fhBGI.2S	2026-05-29 06:41:02.966493+00	f	2026-04-29 06:41:02.966493+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
26f9f076-c0b1-4688-a6b5-a77b19d80be4	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$bB/YmOs4ci1VSqBnQS3tMeYB52UdrnpJCrHi3yS75hjJaTywmKzZq	2026-05-29 08:24:57.776153+00	f	2026-04-29 08:24:57.776153+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
6aa7b784-e37d-4c59-8ddb-b601b50d8bb6	6fc8b99d-19d5-409d-a9c4-56b312c883f7	$2a$10$QBFD36n8Mq8FlKK7.wtz7eilNNNjloTOYr.Nh479gN0mC0DWCvpyy	2026-05-30 09:13:24.649313+00	f	2026-04-30 09:13:24.649313+00	web-browser
83fea703-df62-4867-873a-27b6f8c35d7f	6fc8b99d-19d5-409d-a9c4-56b312c883f7	$2a$10$qmkPNfCYkphQRQu3d02zEufK3HkftwB8.EDP6ofxTzr.FMNSfnZEe	2026-05-31 05:54:17.538972+00	f	2026-05-01 05:54:17.538972+00	web-browser
31b65132-8b9d-43a8-906c-3bee010a1dde	6fc8b99d-19d5-409d-a9c4-56b312c883f7	$2a$10$0naiAo93dqSohMMsDWBUmOVHy6wmzz.I2kVeqhZCD0G8eIL8hEnGG	2026-05-31 06:44:35.995475+00	f	2026-05-01 06:44:35.995475+00	web-browser
63c96666-bbcd-4e46-9be9-bbbc26211f28	63efbbc9-ec11-4727-ad33-de6fa2e5b19d	$2a$10$HrqL.0GoQMxjGu7R8Xg0SOawG2mIo/119KGh//n1SLD.J0I1MsBKO	2026-05-31 06:47:07.490692+00	f	2026-05-01 06:47:07.490692+00	unknown
ea6d718f-f0f6-4696-beee-e2b340aaad11	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$Hx1.g0XOY1Rge.twUqmuxOntIN0YB1jMn/bcPpojO59/TIFab21ei	2026-05-31 06:47:57.977092+00	f	2026-05-01 06:47:57.977092+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
80b0f5db-95da-4e8a-8862-b2662cc5a5f1	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$ahf7eXvnCx9.kpY5zHWrXu1yyi.QFVeT7Mwneq/SNe2fhCR4qh0Ue	2026-05-31 09:57:03.852163+00	f	2026-05-01 09:57:03.852163+00	unknown
cc1741ea-6b56-429b-a8eb-170031c357d8	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$Bv02hP/VwTKrSI6vdHQj9e7uPSKh5aVBXT8F9oq8WHmlv8VlotJ/S	2026-05-31 10:10:22.867065+00	f	2026-05-01 10:10:22.867065+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
58fa248e-59ed-4fa1-baaa-b9282ce6ed47	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$8rB4WVVLwIQPkOElZAUSaO0v1PMsL9KU6d9L3kVEjhGqdY3cGNoSu	2026-06-04 14:01:30.61559+00	f	2026-05-05 14:01:30.61559+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
0de796a9-cb1c-4006-b335-0754d3da7f1a	916d084d-efbb-4008-8f0e-671d83ab4e10	$2a$10$brP5LWyss969ZH55966BCekKmFHiYXImkG3SbmcwA2NKdckE71VvO	2026-06-04 14:09:36.482979+00	f	2026-05-05 14:09:36.482979+00	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36
\.


--
-- Data for Name: shedlock; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.shedlock (name, lock_until, locked_at, locked_by) FROM stdin;
\.


--
-- Data for Name: stock_balances; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.stock_balances (id, product_id, store_id, quantity_in_stock, average_cost) FROM stdin;
88571107-2876-407d-8dfe-ccd518817bc4	92def0e0-8407-40ba-8929-e6a6078e95d5	234e549b-9f71-4335-92e3-4a0d5e69dbbd	10.00	50.00
a2786364-a70a-49e5-8004-25dc1c87b276	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	0.00	37.50
eeda5715-c0e7-4da1-af92-31694251c121	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	130.00	83.61
bf845479-eb2a-4052-b1dd-2546f19a1a75	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	204.00	58.78
e49b0123-006a-47c7-88e0-5d9f9f4f1c64	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	156.00	55.96
3d6c8051-c5a1-43a6-95ce-0fde90325fc7	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	6.00	400.00
63f507b9-b944-413d-b705-b9011157843c	d1000000-0000-0000-0000-000000000001	00000000-0000-0000-0000-000000000001	150.00	81.00
4180cdfc-2497-450a-b8eb-9b556428d6b9	d1000000-0000-0000-0000-000000000002	00000000-0000-0000-0000-000000000001	150.00	67.50
4fcc4f11-2960-4c8f-a7cb-f21238eed38b	d1000000-0000-0000-0000-000000000003	00000000-0000-0000-0000-000000000001	150.00	76.50
6d467df8-143c-4f4d-98eb-acc0221b403f	d1000000-0000-0000-0000-000000000004	00000000-0000-0000-0000-000000000001	150.00	72.00
b0b75a84-ce5d-49c3-af88-43414bc2dcfe	d1000000-0000-0000-0000-000000000005	00000000-0000-0000-0000-000000000001	150.00	69.75
4610a2e9-8af7-474b-9dcd-aa720e4c6a2c	d1000000-0000-0000-0000-000000000006	00000000-0000-0000-0000-000000000001	150.00	54.00
7f719d0e-197b-40e5-bb92-c1d7a6819e69	d1000000-0000-0000-0000-000000000007	00000000-0000-0000-0000-000000000001	50.00	99.00
5b42f038-d7b2-4dec-b6e7-f0d649067225	d1000000-0000-0000-0000-000000000008	00000000-0000-0000-0000-000000000001	150.00	36.00
b4410a6a-9c5b-4cab-9a2b-ea12129de297	d1000000-0000-0000-0000-000000000009	00000000-0000-0000-0000-000000000001	150.00	33.75
d6ec494f-9e65-4b18-8e73-ec405901c79c	d1000000-0000-0000-0000-000000000010	00000000-0000-0000-0000-000000000001	150.00	38.25
d2f1aebe-7442-4879-9ea0-8a15cd31a927	d1000000-0000-0000-0000-000000000011	00000000-0000-0000-0000-000000000001	150.00	40.50
8a13fa5d-a00d-4564-a2f0-12261da2f20e	d1000000-0000-0000-0000-000000000012	00000000-0000-0000-0000-000000000001	150.00	49.50
15b0230c-3bca-40b1-b51d-7993abe1d303	d1000000-0000-0000-0000-000000000013	00000000-0000-0000-0000-000000000001	150.00	58.50
b9e6124e-6784-48fc-9580-cea1c608b233	d1000000-0000-0000-0000-000000000014	00000000-0000-0000-0000-000000000001	150.00	54.00
c62e0c09-35e3-4fb6-971a-8d60599c02a5	d1000000-0000-0000-0000-000000000015	00000000-0000-0000-0000-000000000001	150.00	51.75
5a5be9b1-92cf-4ca0-933f-b233cc34c33e	d1000000-0000-0000-0000-000000000016	00000000-0000-0000-0000-000000000001	50.00	90.00
bfc074e5-7f47-47fd-94b1-ccd4b4cf4efa	d1000000-0000-0000-0000-000000000017	00000000-0000-0000-0000-000000000001	50.00	94.50
9fe43bf8-597c-4567-b7ea-0548a0d31a3a	d1000000-0000-0000-0000-000000000018	00000000-0000-0000-0000-000000000001	150.00	81.00
d1bb0699-6f53-414f-8588-143b4731dc8a	d1000000-0000-0000-0000-000000000019	00000000-0000-0000-0000-000000000001	20.00	1125.00
27854347-d789-4e90-ba8e-31effec4eed6	d1000000-0000-0000-0000-000000000020	00000000-0000-0000-0000-000000000001	20.00	2475.00
cdcd34b8-18ca-44d1-98b0-de63f833b5d2	d1000000-0000-0000-0000-000000000021	00000000-0000-0000-0000-000000000001	20.00	4275.00
c381b3c7-de1b-4036-8414-27432bf2b31f	d1000000-0000-0000-0000-000000000022	00000000-0000-0000-0000-000000000001	20.00	990.00
aa258201-a5b1-4355-855f-fb977235f4e3	d1000000-0000-0000-0000-000000000023	00000000-0000-0000-0000-000000000001	20.00	810.00
0bce2c2c-83f6-4fa0-a0a9-05a2fa1f391a	d1000000-0000-0000-0000-000000000024	00000000-0000-0000-0000-000000000001	20.00	8325.00
2e42ab73-1c0e-4d8d-89f3-d1ac119d0af0	d1000000-0000-0000-0000-000000000025	00000000-0000-0000-0000-000000000001	20.00	810.00
2bb2c16f-1b7d-48e1-8066-811ba895602b	d1000000-0000-0000-0000-000000000026	00000000-0000-0000-0000-000000000001	50.00	382.50
42c1e690-09bb-4c54-a6ef-03b119c7ec88	d1000000-0000-0000-0000-000000000027	00000000-0000-0000-0000-000000000001	50.00	157.50
a084f242-e280-457a-b819-367e590e0fd8	d1000000-0000-0000-0000-000000000028	00000000-0000-0000-0000-000000000001	50.00	202.50
d605a667-70f2-4f52-91d5-5ea1a4d0039d	d1000000-0000-0000-0000-000000000029	00000000-0000-0000-0000-000000000001	50.00	90.00
533be1e8-e0d5-46d4-9002-e27c791650c8	d1000000-0000-0000-0000-000000000030	00000000-0000-0000-0000-000000000001	50.00	112.50
3b31103e-bb77-416b-b509-608a43acf5fb	d1000000-0000-0000-0000-000000000031	00000000-0000-0000-0000-000000000001	150.00	81.00
a064a120-21d1-40e4-9aae-294d1efdfe07	d1000000-0000-0000-0000-000000000032	00000000-0000-0000-0000-000000000001	50.00	292.50
fb8af1ef-547e-47b3-835c-0d9dd1d371e3	6d4c8472-74af-436a-ba6b-6eb151da33bf	00000000-0000-0000-0000-000000000001	20.00	450.00
7a774848-7d78-4b0b-ad11-465fdf299ed2	92def0e0-8407-40ba-8929-e6a6078e95d5	00000000-0000-0000-0000-000000000001	150.00	49.50
1beb80fe-a864-4c9c-9e92-dd0ff039623a	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	00000000-0000-0000-0000-000000000001	150.00	72.45
8a29dacd-44a9-429f-9e03-5cd128d4efb3	3873a853-97f9-46ca-8861-78f061c9b18c	00000000-0000-0000-0000-000000000001	150.00	77.85
52b35e8f-f3db-41d5-9330-0537d01952e4	b0b886a5-aba9-46b8-805d-f7801f1b73f5	00000000-0000-0000-0000-000000000001	150.00	69.75
a07f514e-53bb-4b93-95ed-0d534af2547c	a4b37e14-314b-4d9c-a411-73c71067ebb1	00000000-0000-0000-0000-000000000001	50.00	256.50
\.


--
-- Data for Name: stock_batches; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.stock_batches (id, product_id, store_id, quantity_received, quantity_remaining, unit_cost, received_at, expires_at, status, source_document_id, supplier_id) FROM stdin;
49d4472d-fe43-4805-8f0e-ea719e452ce9	92def0e0-8407-40ba-8929-e6a6078e95d5	234e549b-9f71-4335-92e3-4a0d5e69dbbd	10.00	10.00	50.00	2026-04-22 16:31:46.372245+00	\N	AVAILABLE	накладная 12	\N
4d5d3a3a-4186-4604-b6b6-b842a79f5ebc	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	3.00	0.00	400.00	2026-04-25 11:51:25.01606+00	\N	DEPLETED	INV-AUDIT-1777117884604	\N
bf24998e-d90e-44d1-ba45-52891d3af6b1	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	10.00	0.00	50.00	2026-04-22 17:18:35.156654+00	\N	DEPLETED	123	\N
a58bb90a-dfc7-47e4-b5e4-f81f468f78b5	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	3.00	0.00	0.00	2026-04-22 17:36:33.654523+00	\N	DEPLETED	INV-1776879393612	\N
c120880f-2259-413e-9a0b-aa26c2cf6192	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	2.00	2.00	20.00	2026-04-23 15:36:37.49999+00	\N	AVAILABLE	INV-AUDIT-1776958597475	\N
2c472d32-e229-491c-9c4d-a7dc423afc5b	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	10.00	5.00	20.00	2026-04-23 15:35:01.143759+00	\N	AVAILABLE	REC-20260423-1535-0f79	\N
21814806-7370-4757-a841-a72b96a9fe74	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	100.00	100.00	45.00	2026-04-25 10:55:26.627711+00	\N	AVAILABLE	INV-f6dcddd5	\N
3ec04c8c-f46c-4a0c-8724-d36ef7c52ff0	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	100.00	100.00	120.00	2026-04-25 11:48:33.216306+00	\N	AVAILABLE	INV-59e5cf04	\N
a5366478-0e79-4a8c-bc6f-ce7a8c7c7d49	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	70.00	70.00	70.00	2026-04-25 11:48:33.263354+00	\N	AVAILABLE	INV-59e5cf04	\N
243afb62-6b62-4f41-9e65-cfabc9c6c65e	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	88.00	88.00	40.00	2026-04-25 11:48:33.308507+00	\N	AVAILABLE	INV-59e5cf04	\N
0c2e6ece-da83-4e85-9e42-a872bb8a1bb1	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	100.00	30.00	50.00	2026-04-25 10:55:26.477484+00	\N	AVAILABLE	INV-f6dcddd5	\N
0f41b225-906c-491c-99d8-4127344bdf8f	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	35.00	11.00	82.00	2026-04-23 15:33:03.055347+00	\N	AVAILABLE	INV-538e8973	\N
1ff4a15c-7939-4c71-9f80-8b7c586c8ec2	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	18.00	0.00	23.00	2026-04-23 11:08:03.803394+00	\N	DEPLETED	INV-9f09bac8	\N
a25d443a-5d70-4159-bcb8-deec68cdbd0f	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	1.00	0.00	120.00	2026-04-23 11:08:11.819447+00	\N	DEPLETED	INV-d964aed4	\N
ccc39ebc-27c3-4ce7-b231-9d0c8b3cf651	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	100.00	65.00	70.00	2026-04-25 10:55:26.575853+00	\N	AVAILABLE	INV-f6dcddd5	\N
b3097574-5109-4b12-a9d7-347819da9d64	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	2.00	0.00	400.00	2026-04-23 11:10:05.218354+00	\N	DEPLETED	INV-6fd5d807	\N
77a39d70-80f2-491c-af83-6a89dcb59a7b	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	10.00	0.00	400.00	2026-04-25 14:11:42.082081+00	\N	DEPLETED	INV-AUDIT-1777126301658	\N
ce544c4a-f783-464d-879d-072351c47881	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	3.00	3.00	55.96	2026-04-25 14:11:42.095612+00	\N	AVAILABLE	INV-AUDIT-1777126301658	\N
bc711519-c63b-4501-a1a8-809c0ab0e890	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	19.00	6.00	400.00	2026-04-26 18:26:21.879306+00	\N	AVAILABLE	INV-AUDIT-1777227981417	\N
c9a044d7-aa96-4336-abe8-5b1ef454c42e	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	16.00	16.00	62.00	2026-04-25 17:38:39.713129+00	\N	AVAILABLE	INV-6a38a01f	\N
05c54979-57a9-45fb-b0a1-d3a6fdd3aa8c	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	15.00	0.00	400.00	2026-04-25 11:48:32.993667+00	\N	DEPLETED	INV-59e5cf04	\N
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.stock_transactions (id, product_id, store_id, type, quantity, cost_basis, total_value, write_off_reason, comment, source_document_id, performer_id, created_at) FROM stdin;
7b29d84d-46ba-4c7c-be0f-4a76d8611c80	92def0e0-8407-40ba-8929-e6a6078e95d5	234e549b-9f71-4335-92e3-4a0d5e69dbbd	INBOUND	10.00	50.00	500.00	\N	Stock receipt	накладная 12	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 16:31:46.372245+00
209f4132-ed5d-4f0c-a64a-465f00f02145	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	10.00	50.00	500.00	\N	Stock receipt	123	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 17:18:35.156654+00
f26c55fb-46bf-4c12-943e-e10b160b7b49	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	1.00	50.00	50.00	SPOILAGE	брак	1	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 17:18:49.709909+00
46a7f653-7202-461a-84c6-c32427ab9056	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	3.00	0.00	0.00	\N	Stock receipt	INV-1776879393612	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 17:36:33.654523+00
c93366bc-f10a-4f8f-8df2-8d208986ed32	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	6.00	37.50	225.00	INVENTORY_LOSS	Инвентаризация (авто): -6	INV-LOG-1776879437922	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-22 17:37:18.271574+00
c6ea1242-8b4a-4e2c-bbb1-5765945326f7	92def0e0-8407-40ba-8929-e6a6078e95d5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	6.00	37.50	225.00	SPOILAGE		WO-20260423-0920-1bff	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 09:20:10.077502+00
e5869225-c91e-414d-acc5-595bd503b5b8	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	18.00	23.00	414.00	\N	Stock receipt	INV-9f09bac8	\N	2026-04-23 11:08:03.803394+00
d4eb0a45-ab12-4e94-8e81-c99253aec2e9	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	1.00	120.00	120.00	\N	Stock receipt	INV-d964aed4	\N	2026-04-23 11:08:11.819447+00
05d78829-1070-4908-94c5-0391b82e3eaa	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	28.11	56.22	INVENTORY_LOSS		WO-20260423-1109-ee27	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 11:09:40.149559+00
0ddf300a-cb3a-4000-86b8-6c0a0d3351c1	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	2.00	400.00	800.00	\N	Stock receipt	INV-6fd5d807	\N	2026-04-23 11:10:05.218354+00
802c731e-8a44-4894-8bac-5382303c8afa	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	10.00	20.00	200.00	\N	Stock receipt	REC-20260423-1535-0f79	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 15:35:01.143759+00
0707dc5d-4719-4a9e-a44a-9a578dc4428a	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	2.00	20.00	40.00	\N	Stock receipt	INV-AUDIT-1776958597475	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 15:36:37.49999+00
37bb9465-2f1f-4dbc-b994-f70505846b22	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	67.26	134.52	INVENTORY_LOSS	Инвентаризация (авто): -2	INV-LOG-1776958597474	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-23 15:36:37.526385+00
d5f94883-9cb1-46e4-9f95-d8ff7c1eda91	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	20.00	40.00	SALE	Автоматическое списание при продаже (заказ b858ac3b-8fe3-4390-9f14-f7f10fb29932)	order:b858ac3b-8fe3-4390-9f14-f7f10fb29932:3873a853-97f9-46ca-8861-78f061c9b18c	\N	2026-04-24 14:02:16.885188+00
11a6a2a6-adf9-4092-98a5-e5fb70e8319c	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	1.00	20.00	20.00	SALE	Автоматическое списание при продаже (заказ 4e48d35e-6856-427e-b5f2-254a9bb8202a)	order:4e48d35e-6856-427e-b5f2-254a9bb8202a:3873a853-97f9-46ca-8861-78f061c9b18c	\N	2026-04-24 19:57:18.070903+00
e9909221-83df-4454-adc7-8b498617e9ec	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	20.00	40.00	SALE	Автоматическое списание при продаже (заказ 3c894522-bc38-4c36-a844-30dfd0b5e5d2)	order:3c894522-bc38-4c36-a844-30dfd0b5e5d2:3873a853-97f9-46ca-8861-78f061c9b18c	\N	2026-04-24 20:03:57.082562+00
a75b7a78-8491-4250-8762-407174b919e8	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	35.00	82.00	2870.00	\N	Stock receipt	INV-538e8973	\N	2026-04-23 15:33:03.055347+00
0c6ffa0e-4146-4ec4-ba63-d60a3c9acfe6	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	100.00	50.00	5000.00	\N	Stock receipt	INV-f6dcddd5	\N	2026-04-25 10:55:26.477484+00
41ffd304-b580-456c-8735-fced9222d737	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	100.00	70.00	7000.00	\N	Stock receipt	INV-f6dcddd5	\N	2026-04-25 10:55:26.575853+00
1dd6b234-2301-481c-a344-cd4f382a361c	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	100.00	45.00	4500.00	\N	Stock receipt	INV-f6dcddd5	\N	2026-04-25 10:55:26.627711+00
345d5596-536c-4371-bb42-462000d030c8	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	15.00	400.00	6000.00	\N	Stock receipt	INV-59e5cf04	\N	2026-04-25 11:48:32.993667+00
3f98c71d-3cf2-44e9-97e3-f0defa39f1ab	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	100.00	120.00	12000.00	\N	Stock receipt	INV-59e5cf04	\N	2026-04-25 11:48:33.216306+00
2b51edc4-a00f-4ace-bcad-2378efb9bb51	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	70.00	70.00	4900.00	\N	Stock receipt	INV-59e5cf04	\N	2026-04-25 11:48:33.263354+00
e9b3969a-1e6f-4973-aa0f-71efcf1cc866	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	88.00	40.00	3520.00	\N	Stock receipt	INV-59e5cf04	\N	2026-04-25 11:48:33.308507+00
fd23a44a-3c23-4612-a85a-74d31c1914dc	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	83.61	167.22	INVENTORY_LOSS	Инвентаризация (авто): -2	INV-LOG-1777117884603	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:51:25.048842+00
fc2c649b-d07c-40a1-b04a-f28e2587fe29	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	55.96	111.92	INVENTORY_LOSS	Инвентаризация (авто): -2	INV-LOG-1777117884604	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:51:25.06073+00
f0efe149-99c6-4322-800e-f35a5cacb5e1	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	58.53	117.06	INVENTORY_LOSS	Инвентаризация (авто): -2	INV-LOG-1777117884604	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:51:25.09999+00
89f82b29-bd48-46d2-9504-6c9bef6d2187	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	3.00	400.00	1200.00	\N	Stock receipt	INV-AUDIT-1777117884604	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:51:25.01606+00
00c3448c-21b2-4d47-8733-818e20446760	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	15.00	83.61	1254.15	INVENTORY_LOSS	Инвентаризация (авто): -15	INV-LOG-1777118114643	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:55:15.000276+00
37073a17-9299-4235-864e-5a2bd6847ee3	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	8.00	400.00	3200.00	INVENTORY_LOSS	Инвентаризация (авто): -8	INV-LOG-1777118114643	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 11:55:14.998748+00
da45284f-1512-46b2-be95-466b353eaf07	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	1.00	83.61	83.61	INVENTORY_LOSS	Инвентаризация (авто): -1	INV-LOG-1777126301657	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 14:11:42.088075+00
e66d3e63-8d61-47cc-a907-e0b3a3a78ed2	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	4.00	58.53	234.12	INVENTORY_LOSS	Инвентаризация (авто): -4	INV-LOG-1777126301657	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 14:11:42.095074+00
fa12018a-74f9-4dd4-8750-48d0ad7eddd3	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	3.00	55.96	167.88	\N	Stock receipt	INV-AUDIT-1777126301658	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 14:11:42.095612+00
11b72aef-6866-439b-bc2a-659ca2fe7a40	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	10.00	400.00	4000.00	\N	Stock receipt	INV-AUDIT-1777126301658	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 14:11:42.082081+00
3991d9b0-ff10-47a1-970f-c4e9f9faff30	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	5.00	55.96	279.80	SALE	Автоматическое списание при продаже (заказ f68e5e2c-2322-48fe-b472-923a3d28c35f)	order:f68e5e2c-2322-48fe-b472-923a3d28c35f:b0b886a5-aba9-46b8-805d-f7801f1b73f5	\N	2026-04-25 14:23:34.090346+00
1fb84097-0300-499c-a8c1-b65e016f31f7	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	3.00	55.96	167.88	SALE	Автоматическое списание при продаже (заказ c2b7ace7-ade3-494a-ac76-9a0bef78f574)	order:c2b7ace7-ade3-494a-ac76-9a0bef78f574:b0b886a5-aba9-46b8-805d-f7801f1b73f5	\N	2026-04-25 14:48:28.963888+00
4a1e5ca8-47a5-4157-88d2-79981f590ac2	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	1.00	400.00	400.00	SALE	Автоматическое списание при продаже (заказ bfa3c16b-b601-49fb-a454-dea5d5648dd4)	order:bfa3c16b-b601-49fb-a454-dea5d5648dd4:a4b37e14-314b-4d9c-a411-73c71067ebb1	\N	2026-04-25 15:01:35.888156+00
7ee76376-97e8-49b5-803f-ea31490f7e48	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	16.00	62.00	992.00	\N	Stock receipt	INV-6a38a01f	\N	2026-04-25 17:38:39.713129+00
f6c81838-98be-4b97-9fcf-2792b7d1940a	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	7.00	58.78	411.46	SPOILAGE		WO-20260425-1739-eb69	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 17:39:04.291353+00
61724be8-54b2-4b0a-a658-4e498330a7b7	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	1.00	55.96	55.96	INVENTORY_LOSS	Инвентаризация (авто): -1	INV-LOG-1777142255481	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 18:37:36.297059+00
675b02f2-8351-4f4b-9133-2d0b03839715	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	5.00	83.61	418.05	INVENTORY_LOSS	Инвентаризация (авто): -5	INV-LOG-1777142255481	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 18:37:36.296541+00
4c28cbe9-8383-4d39-ba11-ffe530f25149	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	58.78	117.56	INVENTORY_LOSS	Инвентаризация (авто): -2	INV-LOG-1777142255481	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 18:37:36.296541+00
1b6858e7-6bfd-4e52-ac8e-a84dde7a684d	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	3.00	400.00	1200.00	INVENTORY_LOSS	Инвентаризация (авто): -3	INV-LOG-1777142255482	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-25 18:37:36.296541+00
d23799ea-6e4b-4bc7-ae7b-8dead2e3a780	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	31.00	83.61	2591.91	SALE	Автоматическое списание при продаже (заказ e9471b09-2518-48d3-8859-4e80954ae2ef)	order:e9471b09-2518-48d3-8859-4e80954ae2ef:c45f3a14-c3b6-4dab-a37e-f29cf57f114c	\N	2026-04-25 18:40:22.546187+00
284074d6-1e98-4a16-847f-64f44d9bd4c8	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	21.00	83.61	1755.81	SALE	Автоматическое списание при продаже (заказ b79caafc-af8a-4843-b536-5a0758c0f7e2)	order:b79caafc-af8a-4843-b536-5a0758c0f7e2:c45f3a14-c3b6-4dab-a37e-f29cf57f114c	\N	2026-04-25 18:42:42.619154+00
ee2770e5-fc69-469f-a802-f79dcfe59e91	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	11.00	55.96	615.56	SALE	Автоматическое списание при продаже (заказ 56f060c6-3318-4a29-9621-3759c5a3670d)	order:56f060c6-3318-4a29-9621-3759c5a3670d:b0b886a5-aba9-46b8-805d-f7801f1b73f5	\N	2026-04-25 18:43:08.544049+00
f93600e6-3983-42c1-a75c-fe46faa63216	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	5.00	400.00	2000.00	SALE	Автоматическое списание при продаже (заказ 5015a981-209c-4d58-92fb-710057247ab2)	order:5015a981-209c-4d58-92fb-710057247ab2:a4b37e14-314b-4d9c-a411-73c71067ebb1	\N	2026-04-25 18:45:16.48463+00
f2e2c9d6-3c69-4256-b0ab-7d926d2b7bfc	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	10.00	400.00	4000.00	SALE	Автоматическое списание при продаже (заказ 27bc491a-4cec-4d24-9ab6-1c645f5f0c56)	order:27bc491a-4cec-4d24-9ab6-1c645f5f0c56:a4b37e14-314b-4d9c-a411-73c71067ebb1	\N	2026-04-25 19:44:32.056561+00
5922084c-9162-4e34-9bbb-473e28631e33	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	10.00	83.61	836.10	INVENTORY_LOSS	Инвентаризация (авто): -10	INV-LOG-1777227981417	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-26 18:26:21.895337+00
a59da89f-a81c-43cc-a51c-7dcd2519bea8	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	11.00	55.96	615.56	INVENTORY_LOSS	Инвентаризация (авто): -11	INV-LOG-1777227981417	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-26 18:26:21.895337+00
dfeaed5d-27fe-493d-bfc7-af6a483a9ef3	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	7.00	58.78	411.46	INVENTORY_LOSS	Инвентаризация (авто): -7	INV-LOG-1777227981417	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-26 18:26:21.895337+00
ac6bc691-c0e6-4310-adb9-33ae8f268cd6	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	INBOUND	19.00	400.00	7600.00	\N	Stock receipt	INV-AUDIT-1777227981417	916d084d-efbb-4008-8f0e-671d83ab4e10	2026-04-26 18:26:21.879306+00
2c250ab9-00e2-4938-aab1-cbcba60cc96c	c45f3a14-c3b6-4dab-a37e-f29cf57f114c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	83.61	167.22	SALE	Автоматическое списание при продаже (заказ 5ec81507-7403-4ecc-b456-ee3e0a6185e3)	order:5ec81507-7403-4ecc-b456-ee3e0a6185e3:c45f3a14-c3b6-4dab-a37e-f29cf57f114c	\N	2026-04-28 04:13:05.913015+00
6bc446e5-29d2-435b-9f31-db58673d0c77	3873a853-97f9-46ca-8861-78f061c9b18c	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	58.78	117.56	SALE	Автоматическое списание при продаже (заказ 5ec81507-7403-4ecc-b456-ee3e0a6185e3)	order:5ec81507-7403-4ecc-b456-ee3e0a6185e3:3873a853-97f9-46ca-8861-78f061c9b18c	\N	2026-04-28 04:13:06.058671+00
75d1f971-407a-411d-be12-66cc85b53f86	b0b886a5-aba9-46b8-805d-f7801f1b73f5	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	2.00	55.96	111.92	SALE	Автоматическое списание при продаже (заказ 5ec81507-7403-4ecc-b456-ee3e0a6185e3)	order:5ec81507-7403-4ecc-b456-ee3e0a6185e3:b0b886a5-aba9-46b8-805d-f7801f1b73f5	\N	2026-04-28 04:13:06.115876+00
68cda78e-c7a2-4eaf-a486-493598c59668	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	3.00	400.00	1200.00	SALE	Автоматическое списание при продаже (заказ 5ec81507-7403-4ecc-b456-ee3e0a6185e3)	order:5ec81507-7403-4ecc-b456-ee3e0a6185e3:a4b37e14-314b-4d9c-a411-73c71067ebb1	\N	2026-04-28 04:13:06.189575+00
d2553142-6571-433b-aaf0-3147fb82ad78	a4b37e14-314b-4d9c-a411-73c71067ebb1	5376136f-141d-4d4a-8a98-089ed5376333	WRITE_OFF	11.00	400.00	4400.00	SALE	Автоматическое списание при продаже (заказ f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2)	order:f5c7b253-c1f2-4ef9-9d07-4d6786e1e4b2:a4b37e14-314b-4d9c-a411-73c71067ebb1	\N	2026-04-28 04:28:02.616479+00
\.


--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.stores (id, name, address, phone, active) FROM stdin;
234e549b-9f71-4335-92e3-4a0d5e69dbbd	нагибина 32	нагбина 31	89993332323	f
00000000-0000-0000-0000-000000000001	Главный филиал (Центральный)	ул. Цветочная, д. 2	+7 (900) 123-45-67	f
5376136f-141d-4d4a-8a98-089ed5376333	Ленина 33	ленина 31	89383316041	t
22b2a104-102a-4fa4-9ae5-c3f0666943b2	Test CRM POS	Test Address 123	+79991234567	f
125af3cf-1458-4889-8778-ed612587a7d2	Archive Test	Test Address 456	+70000000000	t
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.suppliers (id, name, contact_person, phone, email, address, tax_id, payment_terms, rating, notes, active, created_at) FROM stdin;
ae1175a2-d6d3-43b2-8234-e5340300b4f7	петя	петя	99999283232	gena@gmail.com	поселок	222222222211	NET_7	4	тюлип!	t	2026-04-22 16:26:17.836822+00
6557499d-ca05-49aa-8409-99cb8d385268	тест мой	нейро	89991231212	neurocraft.dev@gmail.com	москва	89898882981	NET_14	\N	тест поставщик\n	t	2026-04-23 09:33:34.25558+00
e1000000-0000-0000-0000-000000000001	ОптФлора Москва	Игорь Семёнов	+74951234567	opt@optflora.ru	г. Москва, Рижский рынок, пав. 12	7701234567	NET_30	5	Основной поставщик голландских роз	t	2026-05-05 14:36:30.482495+00
e1000000-0000-0000-0000-000000000002	ЦветОк Оптовый	Наталья Крюкова	+78007654321	order@cvetok-opt.ru	г. Москва, Цветочная база, стр. 3	7709876543	NET_14	4	Тюльпаны и хризантемы, быстрая доставка	t	2026-05-05 14:36:30.482495+00
e1000000-0000-0000-0000-000000000003	ЭквадорРозы	Карлос Рамирес	+74957778899	carlos@ecroses.com	г. Москва, Хлебный переулок, 5	7712345670	NET_7	5	Эквадорские розы, импорт напрямую	t	2026-05-05 14:36:30.482495+00
e1000000-0000-0000-0000-000000000004	ГринСад Растения	Ольга Быкова	+74951112233	info@greensad.ru	г. Москва, ул. Садовая, 100	7798765432	NET_30	4	Горшечные растения и зелень	t	2026-05-05 14:36:30.482495+00
e1000000-0000-0000-0000-000000000005	УпаковкаПро	Виктор Лазарев	+74959998877	v.lazarev@upakpro.ru	г. Москва, ул. Промышленная, 15	7787654321	NET_30	3	Упаковочные материалы и аксессуары	t	2026-05-05 14:36:30.482495+00
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.user_roles (user_id, role) FROM stdin;
916d084d-efbb-4008-8f0e-671d83ab4e10	OWNER
916d084d-efbb-4008-8f0e-671d83ab4e10	ADMIN
385b516f-fdcd-4dd4-b6d6-3a2fa003f600	CUSTOMER
c191bedd-423e-46a0-a58a-80c46f7330ed	FLORIST
88b48703-4baa-40c4-b792-0737a78d8372	FLORIST
d5c3cdc7-0129-4e0c-854e-eb597858d01e	FLORIST
63efbbc9-ec11-4727-ad33-de6fa2e5b19d	FLORIST
cc036b02-69c5-42f9-a265-110c75c7658f	COURIER
6fc8b99d-19d5-409d-a9c4-56b312c883f7	CUSTOMER
a1000000-0000-0000-0000-000000000001	FLORIST
a1000000-0000-0000-0000-000000000002	FLORIST
a1000000-0000-0000-0000-000000000003	FLORIST
a2000000-0000-0000-0000-000000000001	COURIER
a2000000-0000-0000-0000-000000000002	COURIER
a3000000-0000-0000-0000-000000000001	CUSTOMER
a3000000-0000-0000-0000-000000000002	CUSTOMER
a3000000-0000-0000-0000-000000000003	CUSTOMER
a3000000-0000-0000-0000-000000000004	CUSTOMER
a3000000-0000-0000-0000-000000000005	CUSTOMER
a3000000-0000-0000-0000-000000000006	CUSTOMER
a3000000-0000-0000-0000-000000000007	CUSTOMER
a3000000-0000-0000-0000-000000000008	CUSTOMER
a3000000-0000-0000-0000-000000000009	CUSTOMER
a3000000-0000-0000-0000-000000000010	CUSTOMER
a3000000-0000-0000-0000-000000000011	CUSTOMER
a3000000-0000-0000-0000-000000000012	CUSTOMER
a3000000-0000-0000-0000-000000000013	CUSTOMER
a3000000-0000-0000-0000-000000000014	CUSTOMER
a3000000-0000-0000-0000-000000000015	CUSTOMER
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: florify_user
--

COPY public.users (id, email, phone, first_name, last_name, password_hash, active, created_at) FROM stdin;
916d084d-efbb-4008-8f0e-671d83ab4e10	admin@florify.ru	\N	Дмитрий	Админ	$2a$10$uBM0EfNeroyLEaUzUHteJ..IeD9RFVmzr7f.t7EKilhcNf/c724UO	t	2026-04-22 16:22:17.491139+00
385b516f-fdcd-4dd4-b6d6-3a2fa003f600	flora@gmail.com	+72282282288	Ксения	Гребенюк	$2a$10$SUaT2HjTUfATlETJCbF7zOOUNrii81/r.7G7N5p9JxU.sCPxM8aWC	t	2026-04-23 17:30:56.117402+00
c191bedd-423e-46a0-a58a-80c46f7330ed	floras@gmail.com	89282282288	REACT	REER	$2a$10$MhuGCiicmibxLlWzBrMtGOYa7psSVgd0LbDoMqI6kkOKZDlVl4QUe	t	2026-04-23 17:51:06.497092+00
88b48703-4baa-40c4-b792-0737a78d8372	kissamliano387@gmail.com	89282212211	Kissam	Liano	$2a$10$DgEmRhIAnd/7SBbQIiRxGO0y3I9NomguSZ96hXJQtmwPW34bjA0LO	t	2026-04-24 14:05:42.045217+00
d5c3cdc7-0129-4e0c-854e-eb597858d01e	test_employee@florify.ru	+79001112233	Arkadiy	Testoviy	$2a$10$fKl5BX9W4XOZkgls4xe0pO4GjIdtMLvvpwY3vJMJ5aiJ344ZsXujO	t	2026-04-24 15:18:39.427538+00
63efbbc9-ec11-4727-ad33-de6fa2e5b19d	flor@mail.ru	+78888828888	Sail	BRAIN	$2a$10$JmevV1KcqthORq8SPmjP5.ZTO8iU54XbENtLmgev70vPxGhiZol4C	t	2026-04-27 13:53:38.570734+00
cc036b02-69c5-42f9-a265-110c75c7658f	cur@mail.ru	891231231212	cur	curier	$2a$10$cP0mJQrX3Va1Xyba2VR7.ukHDdTTVUHAmFmnVYd6zt.I3sSxSL1rW	t	2026-04-28 05:39:11.681684+00
6fc8b99d-19d5-409d-a9c4-56b312c883f7	cust@mail.ru	+79011231212	Sail	BRAIN	$2a$10$NdgTEdYuswyBckBWxasbm.ApiKCc1kEv0ZGwLBPg9HRun5jTmnWcu	t	2026-04-30 09:13:24.649313+00
a1000000-0000-0000-0000-000000000001	florist1@florify.ru	+79001110001	Анна	Петрова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a1000000-0000-0000-0000-000000000002	florist2@florify.ru	+79001110002	Мария	Иванова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a1000000-0000-0000-0000-000000000003	florist3@florify.ru	+79001110003	Светлана	Сидорова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a2000000-0000-0000-0000-000000000001	courier1@florify.ru	+79002220001	Дмитрий	Козлов	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a2000000-0000-0000-0000-000000000002	courier2@florify.ru	+79002220002	Алексей	Морозов	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000001	client1@mail.ru	+79100000001	Ольга	Новикова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000002	client2@mail.ru	+79100000002	Татьяна	Романова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000003	client3@mail.ru	+79100000003	Екатерина	Белова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000004	client4@mail.ru	+79100000004	Наталья	Лебедева	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000005	client5@mail.ru	+79100000005	Ирина	Смирнова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000006	client6@mail.ru	+79100000006	Андрей	Попов	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000007	client7@mail.ru	+79100000007	Сергей	Соколов	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000008	client8@mail.ru	+79100000008	Максим	Волков	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000009	client9@mail.ru	+79100000009	Виктория	Захарова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000010	client10@mail.ru	+79100000010	Александра	Медведева	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000011	client11@mail.ru	+79100000011	Людмила	Федорова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000012	client12@mail.ru	+79100000012	Вера	Орлова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000013	client13@mail.ru	+79100000013	Юлия	Соловьева	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000014	client14@mail.ru	+79100000014	Галина	Тихонова	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
a3000000-0000-0000-0000-000000000015	client15@mail.ru	+79100000015	Надежда	Кузьмина	$2b$10$Y9HH7nDwtrop5SUyAR9rYOzKOTijYYK3GyWlBrsbjP81Hfjz8C9SS	t	2026-05-05 14:36:30.306816+00
\.


--
-- Name: order_number_seq; Type: SEQUENCE SET; Schema: public; Owner: florify_user
--

SELECT pg_catalog.setval('public.order_number_seq', 1052, true);


--
-- Name: analytics_cost_facts analytics_cost_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.analytics_cost_facts
    ADD CONSTRAINT analytics_cost_facts_pkey PRIMARY KEY (id);


--
-- Name: analytics_order_facts analytics_order_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.analytics_order_facts
    ADD CONSTRAINT analytics_order_facts_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: delivery_slots delivery_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_slots
    ADD CONSTRAINT delivery_slots_pkey PRIMARY KEY (id);


--
-- Name: delivery_tasks delivery_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_tasks
    ADD CONSTRAINT delivery_tasks_pkey PRIMARY KEY (id);


--
-- Name: delivery_zones delivery_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT delivery_zones_pkey PRIMARY KEY (id);


--
-- Name: employee_salary_configs employee_salary_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_configs
    ADD CONSTRAINT employee_salary_configs_pkey PRIMARY KEY (id);


--
-- Name: employee_salary_statements employee_salary_statements_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_statements
    ADD CONSTRAINT employee_salary_statements_pkey PRIMARY KEY (id);


--
-- Name: employee_timesheet employee_timesheet_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_timesheet
    ADD CONSTRAINT employee_timesheet_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employees employees_user_id_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_key UNIQUE (user_id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: delivery_tasks idx_delivery_task_order_id; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_tasks
    ADD CONSTRAINT idx_delivery_task_order_id UNIQUE (order_id);


--
-- Name: loyalty_accounts loyalty_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.loyalty_accounts
    ADD CONSTRAINT loyalty_accounts_pkey PRIMARY KEY (id);


--
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- Name: media_files media_files_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.media_files
    ADD CONSTRAINT media_files_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: product_categories product_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_name_key UNIQUE (name);


--
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: purchase_invoice_items purchase_invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.purchase_invoice_items
    ADD CONSTRAINT purchase_invoice_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_invoices purchase_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT purchase_invoices_pkey PRIMARY KEY (id);


--
-- Name: recipe_items recipe_items_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT recipe_items_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_product_id_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_product_id_key UNIQUE (product_id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: shedlock shedlock_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.shedlock
    ADD CONSTRAINT shedlock_pkey PRIMARY KEY (name);


--
-- Name: stock_balances stock_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_pkey PRIMARY KEY (id);


--
-- Name: stock_balances stock_balances_product_store_unique; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_product_store_unique UNIQUE (product_id, store_id);


--
-- Name: stock_batches stock_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_pkey PRIMARY KEY (id);


--
-- Name: stock_transactions stock_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_pkey PRIMARY KEY (id);


--
-- Name: stores stores_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stores
    ADD CONSTRAINT stores_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_tax_id_key UNIQUE (tax_id);


--
-- Name: notification_templates uk_notification_templates_code_channel; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT uk_notification_templates_code_channel UNIQUE (code, channel);


--
-- Name: delivery_slots uq_delivery_slot_date_time; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_slots
    ADD CONSTRAINT uq_delivery_slot_date_time UNIQUE (date, start_time, end_time);


--
-- Name: delivery_tasks uq_delivery_task_order_id; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_tasks
    ADD CONSTRAINT uq_delivery_task_order_id UNIQUE (order_id);


--
-- Name: delivery_zones uq_delivery_zone_name; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_zones
    ADD CONSTRAINT uq_delivery_zone_name UNIQUE (name);


--
-- Name: employee_salary_configs uq_employee_salary_configs_employee_valid_from; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_configs
    ADD CONSTRAINT uq_employee_salary_configs_employee_valid_from UNIQUE (employee_id, valid_from);


--
-- Name: employee_salary_statements uq_employee_salary_statements_employee_period; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_statements
    ADD CONSTRAINT uq_employee_salary_statements_employee_period UNIQUE (employee_id, period);


--
-- Name: employee_timesheet uq_employee_timesheet_employee_date; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_timesheet
    ADD CONSTRAINT uq_employee_timesheet_employee_date UNIQUE (employee_id, date);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_acf_store_type_occurred_at; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_acf_store_type_occurred_at ON public.analytics_cost_facts USING btree (store_id, cost_type, occurred_at DESC);


--
-- Name: idx_acf_type_occurred_at; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_acf_type_occurred_at ON public.analytics_cost_facts USING btree (cost_type, occurred_at DESC);


--
-- Name: idx_analytics_order_facts_store_dates; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_analytics_order_facts_store_dates ON public.analytics_order_facts USING btree (store_id, completed_at);


--
-- Name: idx_aof_completed_at; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_aof_completed_at ON public.analytics_order_facts USING btree (completed_at DESC);


--
-- Name: idx_aof_customer_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_aof_customer_id ON public.analytics_order_facts USING btree (customer_id);


--
-- Name: idx_aof_order_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX idx_aof_order_id ON public.analytics_order_facts USING btree (order_id);


--
-- Name: idx_batches_product_received; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_batches_product_received ON public.stock_batches USING btree (product_id, received_at);


--
-- Name: idx_batches_status; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_batches_status ON public.stock_batches USING btree (status) WHERE ((status)::text = 'AVAILABLE'::text);


--
-- Name: idx_batches_store; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_batches_store ON public.stock_batches USING btree (store_id);


--
-- Name: idx_customers_birth_month_day; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_customers_birth_month_day ON public.customers USING btree (EXTRACT(month FROM birth_date), EXTRACT(day FROM birth_date)) WHERE (birth_date IS NOT NULL);


--
-- Name: idx_customers_email; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_customers_email ON public.customers USING btree (email);


--
-- Name: idx_customers_phone; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX idx_customers_phone ON public.customers USING btree (phone) WHERE (active = true);


--
-- Name: idx_customers_tags; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_customers_tags ON public.customers USING gin (tags);


--
-- Name: idx_customers_user_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);


--
-- Name: idx_delivery_slot_date; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_delivery_slot_date ON public.delivery_slots USING btree (date);


--
-- Name: idx_delivery_task_courier_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_delivery_task_courier_id ON public.delivery_tasks USING btree (courier_id);


--
-- Name: idx_delivery_task_slot_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_delivery_task_slot_id ON public.delivery_tasks USING btree (slot_id);


--
-- Name: idx_delivery_task_status; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_delivery_task_status ON public.delivery_tasks USING btree (status);


--
-- Name: idx_delivery_zone_active; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_delivery_zone_active ON public.delivery_zones USING btree (active);


--
-- Name: idx_ess_store; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_ess_store ON public.employee_salary_statements USING btree (store_id);


--
-- Name: idx_finance_occurred_at; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_finance_occurred_at ON public.financial_transactions USING btree (occurred_at);


--
-- Name: idx_finance_ref_type; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_finance_ref_type ON public.financial_transactions USING btree (reference_id, type);


--
-- Name: idx_finance_type; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_finance_type ON public.financial_transactions USING btree (type);


--
-- Name: idx_loyalty_accounts_customer; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX idx_loyalty_accounts_customer ON public.loyalty_accounts USING btree (customer_id);


--
-- Name: idx_loyalty_tx_account; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_loyalty_tx_account ON public.loyalty_transactions USING btree (loyalty_account_id);


--
-- Name: idx_loyalty_tx_occurred; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_loyalty_tx_occurred ON public.loyalty_transactions USING btree (occurred_at);


--
-- Name: idx_loyalty_tx_order; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_loyalty_tx_order ON public.loyalty_transactions USING btree (order_id) WHERE (order_id IS NOT NULL);


--
-- Name: idx_media_files_status; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_media_files_status ON public.media_files USING btree (status);


--
-- Name: idx_media_files_uploaded_by; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_media_files_uploaded_by ON public.media_files USING btree (uploaded_by);


--
-- Name: idx_notification_logs_recipient_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_logs_recipient_id ON public.notification_logs USING btree (recipient_id);


--
-- Name: idx_notification_logs_sent_at; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs USING btree (sent_at DESC);


--
-- Name: idx_notification_logs_status; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_logs_status ON public.notification_logs USING btree (status);


--
-- Name: idx_notification_logs_template_code; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_logs_template_code ON public.notification_logs USING btree (template_code);


--
-- Name: idx_notification_templates_active; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_templates_active ON public.notification_templates USING btree (is_active);


--
-- Name: idx_notification_templates_channel; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_templates_channel ON public.notification_templates USING btree (channel);


--
-- Name: idx_notification_templates_code; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_notification_templates_code ON public.notification_templates USING btree (code);


--
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Name: idx_orders_customer; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_orders_customer ON public.orders USING btree (customer_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: idx_orders_store; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_orders_store ON public.orders USING btree (store_id);


--
-- Name: idx_payments_external_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_payments_external_id ON public.payments USING btree (external_id);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_pi_store; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_pi_store ON public.purchase_invoices USING btree (store_id);


--
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Name: idx_products_sku; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX idx_products_sku ON public.products USING btree (sku);


--
-- Name: idx_purchase_invoice_items_invoice_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_purchase_invoice_items_invoice_id ON public.purchase_invoice_items USING btree (invoice_id);


--
-- Name: idx_purchase_invoices_created_at; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_purchase_invoices_created_at ON public.purchase_invoices USING btree (created_at DESC);


--
-- Name: idx_purchase_invoices_status; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_purchase_invoices_status ON public.purchase_invoices USING btree (status);


--
-- Name: idx_purchase_invoices_supplier_number; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX idx_purchase_invoices_supplier_number ON public.purchase_invoices USING btree (supplier_id, invoice_number);


--
-- Name: idx_recipe_items_recipe_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_recipe_items_recipe_id ON public.recipe_items USING btree (recipe_id);


--
-- Name: idx_recipes_product_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_recipes_product_id ON public.recipes USING btree (product_id);


--
-- Name: idx_refresh_tokens_expires; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_refresh_tokens_expires ON public.refresh_tokens USING btree (expires_at);


--
-- Name: idx_refresh_tokens_user; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: idx_st_product_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_st_product_id ON public.stock_transactions USING btree (product_id);


--
-- Name: idx_st_source_doc; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_st_source_doc ON public.stock_transactions USING btree (source_document_id);


--
-- Name: idx_st_store_product; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_st_store_product ON public.stock_transactions USING btree (store_id, product_id);


--
-- Name: idx_stock_balances_product_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_stock_balances_product_id ON public.stock_balances USING btree (product_id);


--
-- Name: idx_stock_balances_store_id; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_stock_balances_store_id ON public.stock_balances USING btree (store_id);


--
-- Name: idx_suppliers_active; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_suppliers_active ON public.suppliers USING btree (active);


--
-- Name: idx_suppliers_name; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_suppliers_name ON public.suppliers USING btree (name);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone) WHERE (phone IS NOT NULL);


--
-- Name: uq_acf_type_source_ref; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX uq_acf_type_source_ref ON public.analytics_cost_facts USING btree (cost_type, source_ref_id);


--
-- Name: uq_order_idempotency_key; Type: INDEX; Schema: public; Owner: florify_user
--

CREATE UNIQUE INDEX uq_order_idempotency_key ON public.orders USING btree (idempotency_key) WHERE (idempotency_key IS NOT NULL);


--
-- Name: analytics_order_facts analytics_order_facts_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.analytics_order_facts
    ADD CONSTRAINT analytics_order_facts_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: delivery_tasks delivery_tasks_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_tasks
    ADD CONSTRAINT delivery_tasks_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.delivery_slots(id) ON DELETE SET NULL;


--
-- Name: delivery_tasks delivery_tasks_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.delivery_tasks
    ADD CONSTRAINT delivery_tasks_zone_id_fkey FOREIGN KEY (zone_id) REFERENCES public.delivery_zones(id) ON DELETE SET NULL;


--
-- Name: employee_salary_configs employee_salary_configs_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_configs
    ADD CONSTRAINT employee_salary_configs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_salary_statements employee_salary_statements_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_statements
    ADD CONSTRAINT employee_salary_statements_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employee_salary_statements employee_salary_statements_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_salary_statements
    ADD CONSTRAINT employee_salary_statements_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: employee_timesheet employee_timesheet_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employee_timesheet
    ADD CONSTRAINT employee_timesheet_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: employees employees_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: orders fk_orders_current_payment; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_orders_current_payment FOREIGN KEY (current_payment_id) REFERENCES public.payments(id);


--
-- Name: loyalty_accounts loyalty_accounts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.loyalty_accounts
    ADD CONSTRAINT loyalty_accounts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: loyalty_transactions loyalty_transactions_loyalty_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_loyalty_account_id_fkey FOREIGN KEY (loyalty_account_id) REFERENCES public.loyalty_accounts(id);


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id);


--
-- Name: purchase_invoice_items purchase_invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.purchase_invoice_items
    ADD CONSTRAINT purchase_invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.purchase_invoices(id) ON DELETE CASCADE;


--
-- Name: purchase_invoices purchase_invoices_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT purchase_invoices_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: purchase_invoices purchase_invoices_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.purchase_invoices
    ADD CONSTRAINT purchase_invoices_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: recipe_items recipe_items_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT recipe_items_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: stock_balances stock_balances_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: stock_balances stock_balances_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_balances
    ADD CONSTRAINT stock_balances_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: stock_batches stock_batches_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_batches stock_batches_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: stock_transactions stock_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_transactions stock_transactions_store_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_store_id_fkey FOREIGN KEY (store_id) REFERENCES public.stores(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: florify_user
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

