--
-- PostgreSQL database dump
--

\restrict pGyYX8qQH6b8iwP41GEhdagLelZ7FfvkdbhLBolpNVdZmPwKilZ5l39CzKUWcvZ

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: admin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO admin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: admin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO admin;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'PAID',
    'VOIDED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO admin;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'WHATSAPP',
    'EMAIL',
    'SMS'
);


ALTER TYPE public."NotificationChannel" OWNER TO admin;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED'
);


ALTER TYPE public."NotificationStatus" OWNER TO admin;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."NotificationType" AS ENUM (
    'APPOINTMENT_REMINDER',
    'VACCINE_REMINDER'
);


ALTER TYPE public."NotificationType" OWNER TO admin;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PAID',
    'FAILED',
    'REFUNDED'
);


ALTER TYPE public."PaymentStatus" OWNER TO admin;

--
-- Name: PlanInterval; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."PlanInterval" AS ENUM (
    'MONTH',
    'YEAR'
);


ALTER TYPE public."PlanInterval" OWNER TO admin;

--
-- Name: ProductType; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."ProductType" AS ENUM (
    'PRODUCT',
    'SERVICE'
);


ALTER TYPE public."ProductType" OWNER TO admin;

--
-- Name: Sex; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."Sex" AS ENUM (
    'MALE',
    'FEMALE',
    'UNKNOWN'
);


ALTER TYPE public."Sex" OWNER TO admin;

--
-- Name: Species; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."Species" AS ENUM (
    'DOG',
    'CAT',
    'BIRD',
    'RABBIT',
    'REPTILE',
    'OTHER'
);


ALTER TYPE public."Species" OWNER TO admin;

--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'TRIAL',
    'FULL'
);


ALTER TYPE public."SubscriptionStatus" OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "petId" text NOT NULL,
    "vetId" text,
    "scheduledAt" timestamp(3) without time zone NOT NULL,
    "durationMin" integer DEFAULT 30 NOT NULL,
    status public."AppointmentStatus" DEFAULT 'SCHEDULED'::public."AppointmentStatus" NOT NULL,
    reason text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Appointment" OWNER TO admin;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    ruc text,
    website text,
    address text,
    phone text,
    email text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Company" OWNER TO admin;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "ownerId" text,
    "cashierId" text,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."InvoiceStatus" DEFAULT 'ISSUED'::public."InvoiceStatus" NOT NULL,
    currency text DEFAULT 'PEN'::text NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    notes text,
    "tipoComprobante" text,
    serie text,
    correlativo integer,
    "estadoSunat" text,
    "hashFirma" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Invoice" OWNER TO admin;

--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "invoiceId" text NOT NULL,
    "productId" text,
    description text NOT NULL,
    quantity numeric(10,3) NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    CONSTRAINT item_qty_positive CHECK ((quantity > (0)::numeric))
);


ALTER TABLE public."InvoiceItem" OWNER TO admin;

--
-- Name: MedicalRecord; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."MedicalRecord" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "petId" text NOT NULL,
    "appointmentId" text,
    "vetId" text,
    "visitDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "weightKg" numeric(6,3),
    "temperatureC" numeric(4,1),
    anamnesis text,
    diagnosis text,
    treatment text,
    prescription text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    CONSTRAINT mr_weight_kg_positive CHECK ((("weightKg" IS NULL) OR ("weightKg" > (0)::numeric)))
);


ALTER TABLE public."MedicalRecord" OWNER TO admin;

--
-- Name: Menu; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Menu" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'link'::text NOT NULL,
    "position" text DEFAULT 'top'::text NOT NULL,
    description text,
    path text NOT NULL,
    icon text,
    "order" integer DEFAULT 0 NOT NULL,
    "parentId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Menu" OWNER TO admin;

--
-- Name: NotificationLog; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."NotificationLog" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "petId" text,
    "appointmentId" text,
    channel public."NotificationChannel" DEFAULT 'WHATSAPP'::public."NotificationChannel" NOT NULL,
    type public."NotificationType" NOT NULL,
    recipient text NOT NULL,
    payload jsonb,
    status public."NotificationStatus" DEFAULT 'PENDING'::public."NotificationStatus" NOT NULL,
    "providerMsgId" text,
    error text,
    "scheduledFor" timestamp(3) without time zone,
    "sentAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NotificationLog" OWNER TO admin;

--
-- Name: Owner; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Owner" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "docType" text,
    "docNumber" text,
    phone text,
    email text,
    address text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Owner" OWNER TO admin;

--
-- Name: Pet; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Pet" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "ownerId" text NOT NULL,
    name text NOT NULL,
    species public."Species" NOT NULL,
    breed text,
    sex public."Sex" DEFAULT 'UNKNOWN'::public."Sex" NOT NULL,
    "birthDate" date,
    "weightKg" numeric(6,3),
    color text,
    microchip text,
    "photoUrl" text,
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "deceasedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text,
    CONSTRAINT pet_weight_kg_positive CHECK ((("weightKg" IS NULL) OR ("weightKg" > (0)::numeric)))
);


ALTER TABLE public."Pet" OWNER TO admin;

--
-- Name: Plan; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Plan" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(12,2) NOT NULL,
    currency text DEFAULT 'PEN'::text NOT NULL,
    "interval" public."PlanInterval" DEFAULT 'MONTH'::public."PlanInterval" NOT NULL,
    "whatsappNotifications" boolean DEFAULT false NOT NULL,
    "electronicInvoicing" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Plan" OWNER TO admin;

--
-- Name: Product; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    sku text,
    name text NOT NULL,
    description text,
    type public."ProductType" DEFAULT 'PRODUCT'::public."ProductType" NOT NULL,
    price numeric(12,2) NOT NULL,
    cost numeric(12,2),
    stock numeric(10,3) DEFAULT 0 NOT NULL,
    "trackStock" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Product" OWNER TO admin;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "canRead" boolean DEFAULT true NOT NULL,
    "canCreate" boolean DEFAULT true NOT NULL,
    "canUpdate" boolean DEFAULT true NOT NULL,
    "canDelete" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Role" OWNER TO admin;

--
-- Name: RoleMenu; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."RoleMenu" (
    id text NOT NULL,
    "roleId" text NOT NULL,
    "menuId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."RoleMenu" OWNER TO admin;

--
-- Name: Subscription; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Subscription" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "planId" text NOT NULL,
    status public."SubscriptionStatus" DEFAULT 'TRIAL'::public."SubscriptionStatus" NOT NULL,
    "trialEndsAt" timestamp(3) without time zone,
    "currentPeriodEnd" timestamp(3) without time zone NOT NULL,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "canceledAt" timestamp(3) without time zone,
    "isComplimentary" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Subscription" OWNER TO admin;

--
-- Name: SubscriptionPayment; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."SubscriptionPayment" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "subscriptionId" text NOT NULL,
    "planId" text,
    amount numeric(12,2) NOT NULL,
    currency text DEFAULT 'PEN'::text NOT NULL,
    status public."PaymentStatus" DEFAULT 'PENDING'::public."PaymentStatus" NOT NULL,
    method text,
    reference text,
    "paidAt" timestamp(3) without time zone,
    "periodStart" timestamp(3) without time zone,
    "periodEnd" timestamp(3) without time zone,
    provider text,
    "providerPaymentId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."SubscriptionPayment" OWNER TO admin;

--
-- Name: User; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "companyId" text NOT NULL,
    "roleId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."User" OWNER TO admin;

--
-- Name: Vaccine; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Vaccine" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "petId" text NOT NULL,
    "medicalRecordId" text,
    "vetId" text,
    name text NOT NULL,
    "batchNumber" text,
    "appliedAt" date NOT NULL,
    "nextDueAt" date,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "createdBy" text,
    "updatedBy" text
);


ALTER TABLE public."Vaccine" OWNER TO admin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: admin
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


ALTER TABLE public._prisma_migrations OWNER TO admin;

--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Appointment" (id, "companyId", "petId", "vetId", "scheduledAt", "durationMin", status, reason, notes, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Company" (id, name, slug, ruc, website, address, phone, email, "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
6eee932d-e0fa-49e5-b232-9434ec48b6dc	PawnVet Clínica Demo	pawnvet-demo	\N	\N	\N	\N	\N	t	2026-07-17 04:05:45.063	2026-07-17 04:05:45.063	\N	\N
83f8d4f7-54af-41e2-a933-91d59d942655	Clinica Cats	cli-cats	12312321312	\N	\N	\N	\N	t	2026-07-19 01:11:11.463	2026-07-19 03:48:14.707	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
9412d4ce-5b6c-44d4-a0a3-c1b8dbe73694	Clinica Dogs	cli-dogs	\N	\N	\N	\N	\N	t	2026-07-19 00:33:19.575	2026-07-19 04:36:20.028	\N	c27a2fc6-a357-43e3-a187-f5112ac463d4
47ff9c30-e1d6-410e-a2f7-6923746d3c32	Clinica Huellas	cli-huellas	12111131123	\N	\N	921212121	\N	t	2026-07-19 00:27:02.129	2026-07-19 06:28:23.024	\N	c27a2fc6-a357-43e3-a187-f5112ac463d4
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Invoice" (id, "companyId", "ownerId", "cashierId", "issuedAt", status, currency, subtotal, "taxAmount", discount, total, notes, "tipoComprobante", serie, correlativo, "estadoSunat", "hashFirma", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."InvoiceItem" (id, "companyId", "invoiceId", "productId", description, quantity, "unitPrice", total) FROM stdin;
\.


--
-- Data for Name: MedicalRecord; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."MedicalRecord" (id, "companyId", "petId", "appointmentId", "vetId", "visitDate", "weightKg", "temperatureC", anamnesis, diagnosis, treatment, prescription, notes, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: Menu; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Menu" (id, code, name, type, "position", description, path, icon, "order", "parentId", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
97737afe-af44-4ec5-94ff-a3579e262536	citas	Citas	link	top	\N	/citas	calendar	3	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
170ea4d4-3e41-435a-b396-bb592f1af1da	dashboard	Dashboard	link	top	\N	/dashboard	layout-dashboard	0	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
22da8cb2-746b-4ddf-975e-91c3eb3cee4f	productos	Productos	link	top	\N	/productos	package	4	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
14b5d96a-aaed-4c3c-9d2b-c4d65ed3d8c2	reportes	Reportes	link	top	\N	/reportes	bar-chart	6	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
2b3ab38b-ea78-4e37-93ba-d7296fc2cf9c	facturacion	Facturación	link	top	\N	/facturacion	receipt	5	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
e0245449-f1ed-4869-bb6c-e184f28cd9b3	pacientes	Pacientes	link	top	\N	/patients	paw-print	2	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
f8eeafb7-da10-478a-8998-3300f95ae0a3	usuarios	Usuarios	link	top	\N	/users	user-cog	7	\N	t	2026-07-17 04:05:45.18	2026-07-17 04:05:45.18	\N	\N
4147ce1d-5af5-4bb6-a617-453acf8c8294	clientes	Clientes	link	sidebar	\N	/clients	users	10	\N	t	2026-07-17 04:05:45.18	2026-07-17 06:28:41.84	\N	e633c195-707a-45fe-aa0d-868c7f5985fb
8cd6345a-3943-4279-b993-8f0149504723	organizaciones	Empresas	link	sidebar	\N	/company	building	2	\N	t	2026-07-17 04:05:45.18	2026-07-17 06:30:35.108	\N	e633c195-707a-45fe-aa0d-868c7f5985fb
cf408c75-047d-4269-af8e-1a55ebc3816c	roles	Roles	link	sidebar	\N	/roles	shield	5	\N	t	2026-07-17 04:05:45.18	2026-07-17 06:31:23.505	\N	e633c195-707a-45fe-aa0d-868c7f5985fb
226960d5-e4a4-4f82-8241-1d6b19be82d1	menus	Menús	link	sidebar	\N	/menus	menu	1	\N	t	2026-07-17 04:05:45.18	2026-07-19 03:48:45.572	\N	c27a2fc6-a357-43e3-a187-f5112ac463d4
\.


--
-- Data for Name: NotificationLog; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."NotificationLog" (id, "companyId", "petId", "appointmentId", channel, type, recipient, payload, status, "providerMsgId", error, "scheduledFor", "sentAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Owner; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Owner" (id, "companyId", "firstName", "lastName", "docType", "docNumber", phone, email, address, "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: Pet; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Pet" (id, "companyId", "ownerId", name, species, breed, sex, "birthDate", "weightKg", color, microchip, "photoUrl", notes, "isActive", "deceasedAt", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: Plan; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Plan" (id, code, name, description, price, currency, "interval", "whatsappNotifications", "electronicInvoicing", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
7da3d67f-8847-4ebd-8cfe-9639f7271264	emprendedor	Emprendedor	Plan base para clínicas y petshops empezando con pawnvet.	49.90	PEN	MONTH	f	f	t	2026-07-17 06:28:33.173	2026-07-17 06:28:33.173	\N	\N
d8b80b93-d8c6-46bf-9956-a43458fa1cba	pro	Pro	Incluye notificaciones por WhatsApp y facturación electrónica SUNAT.	99.90	PEN	MONTH	t	t	f	2026-07-17 06:28:33.173	2026-07-17 06:28:33.173	\N	\N
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Product" (id, "companyId", sku, name, description, type, price, cost, stock, "trackStock", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Role" (id, name, slug, description, "canRead", "canCreate", "canUpdate", "canDelete", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
cf4c8362-29fc-4a47-92c4-12a9a0d20809	ROOT	root	Root profile with all permissions	t	t	t	t	t	2026-07-17 04:05:45.076	2026-07-17 04:05:45.076	\N	\N
d01ba686-0519-4836-8b56-5ca75893ebad	ADMIN	admin	Administrator profile with full access	t	t	t	t	t	2026-07-17 04:05:45.076	2026-07-17 04:05:45.076	\N	\N
80305439-7851-4a36-b39e-f1acad5094f1	DOCTOR	doctor	Veterinario: registra pacientes, citas e historias clínicas	t	t	t	f	t	2026-07-17 04:05:45.076	2026-07-17 04:05:45.076	\N	\N
53c06dfb-0159-4d79-992f-f412c73c2b39	RECEPTIONIST	receptionist	Recepción/caja: agenda citas, clientes y facturación	t	t	t	f	t	2026-07-17 04:05:45.076	2026-07-17 04:05:45.076	\N	\N
\.


--
-- Data for Name: RoleMenu; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."RoleMenu" (id, "roleId", "menuId", "isActive", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
52b9f6d0-8653-4407-a8e3-a04682bddc23	d01ba686-0519-4836-8b56-5ca75893ebad	170ea4d4-3e41-435a-b396-bb592f1af1da	t	2026-07-17 04:05:45.233	2026-07-17 04:05:45.233	\N	\N
446ff5af-16f5-4818-9da8-93168476475e	d01ba686-0519-4836-8b56-5ca75893ebad	4147ce1d-5af5-4bb6-a617-453acf8c8294	t	2026-07-17 04:05:45.235	2026-07-17 04:05:45.235	\N	\N
18340c5d-b5fb-4faa-840b-cd20b89bbadf	d01ba686-0519-4836-8b56-5ca75893ebad	e0245449-f1ed-4869-bb6c-e184f28cd9b3	t	2026-07-17 04:05:45.236	2026-07-17 04:05:45.236	\N	\N
e21523bc-b9e7-4472-a435-dc90073c0250	d01ba686-0519-4836-8b56-5ca75893ebad	97737afe-af44-4ec5-94ff-a3579e262536	t	2026-07-17 04:05:45.237	2026-07-17 04:05:45.237	\N	\N
c88a258a-2f12-459e-897e-f63821822058	d01ba686-0519-4836-8b56-5ca75893ebad	22da8cb2-746b-4ddf-975e-91c3eb3cee4f	t	2026-07-17 04:05:45.238	2026-07-17 04:05:45.238	\N	\N
95edb3d4-ea97-44de-ba43-2eafa048bb3e	d01ba686-0519-4836-8b56-5ca75893ebad	2b3ab38b-ea78-4e37-93ba-d7296fc2cf9c	t	2026-07-17 04:05:45.241	2026-07-17 04:05:45.241	\N	\N
b6d5fc08-ebd5-4d39-acd0-5642bd6f92af	d01ba686-0519-4836-8b56-5ca75893ebad	14b5d96a-aaed-4c3c-9d2b-c4d65ed3d8c2	t	2026-07-17 04:05:45.243	2026-07-17 04:05:45.243	\N	\N
5c85ede8-91af-4f33-a396-09f7500f402b	d01ba686-0519-4836-8b56-5ca75893ebad	f8eeafb7-da10-478a-8998-3300f95ae0a3	t	2026-07-17 04:05:45.245	2026-07-17 04:05:45.245	\N	\N
67053e71-786a-4873-932d-5ec0dcf3d137	80305439-7851-4a36-b39e-f1acad5094f1	170ea4d4-3e41-435a-b396-bb592f1af1da	t	2026-07-17 04:05:45.246	2026-07-17 04:05:45.246	\N	\N
711b6105-899a-4f7f-83e3-d036ea33c43d	80305439-7851-4a36-b39e-f1acad5094f1	e0245449-f1ed-4869-bb6c-e184f28cd9b3	t	2026-07-17 04:05:45.248	2026-07-17 04:05:45.248	\N	\N
6c97a67c-5c63-472c-a0aa-bf48c1e68e4d	80305439-7851-4a36-b39e-f1acad5094f1	97737afe-af44-4ec5-94ff-a3579e262536	t	2026-07-17 04:05:45.249	2026-07-17 04:05:45.249	\N	\N
00da41b0-30ec-458e-b021-f1a4335f9a62	53c06dfb-0159-4d79-992f-f412c73c2b39	170ea4d4-3e41-435a-b396-bb592f1af1da	t	2026-07-17 04:05:45.252	2026-07-17 04:05:45.252	\N	\N
4427c9ce-6c9a-4c63-aecb-9110b69e4a7c	53c06dfb-0159-4d79-992f-f412c73c2b39	4147ce1d-5af5-4bb6-a617-453acf8c8294	t	2026-07-17 04:05:45.253	2026-07-17 04:05:45.253	\N	\N
14a2e025-d771-40b0-9ee7-885156fb87ae	53c06dfb-0159-4d79-992f-f412c73c2b39	e0245449-f1ed-4869-bb6c-e184f28cd9b3	t	2026-07-17 04:05:45.255	2026-07-17 04:05:45.255	\N	\N
3927fe7a-b32d-4ce1-ba99-0d9f3c3f4e54	53c06dfb-0159-4d79-992f-f412c73c2b39	97737afe-af44-4ec5-94ff-a3579e262536	t	2026-07-17 04:05:45.256	2026-07-17 04:05:45.256	\N	\N
4740d106-87ed-449a-8fd0-b5974aa40996	53c06dfb-0159-4d79-992f-f412c73c2b39	22da8cb2-746b-4ddf-975e-91c3eb3cee4f	t	2026-07-17 04:05:45.257	2026-07-17 04:05:45.257	\N	\N
c33e1fa4-81cd-4e5d-8466-19412d2c30ed	53c06dfb-0159-4d79-992f-f412c73c2b39	2b3ab38b-ea78-4e37-93ba-d7296fc2cf9c	t	2026-07-17 04:05:45.259	2026-07-17 04:05:45.259	\N	\N
556e3445-9952-45b9-9ef8-623f4b00edf0	cf4c8362-29fc-4a47-92c4-12a9a0d20809	f8eeafb7-da10-478a-8998-3300f95ae0a3	t	2026-07-21 04:55:21.996	2026-07-21 04:55:21.996	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
f7193117-21c2-45ee-9e8b-6e2c300a49a9	cf4c8362-29fc-4a47-92c4-12a9a0d20809	8cd6345a-3943-4279-b993-8f0149504723	t	2026-07-21 04:55:21.996	2026-07-21 04:55:21.996	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
74fa9b21-1b82-41ad-ab11-a064a222fa4c	cf4c8362-29fc-4a47-92c4-12a9a0d20809	cf408c75-047d-4269-af8e-1a55ebc3816c	t	2026-07-21 04:55:21.996	2026-07-21 04:55:21.996	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
f7f1ab6a-98a1-42ec-b896-d8489dbc4586	cf4c8362-29fc-4a47-92c4-12a9a0d20809	226960d5-e4a4-4f82-8241-1d6b19be82d1	t	2026-07-21 04:55:21.996	2026-07-21 04:55:21.996	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
\.


--
-- Data for Name: Subscription; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Subscription" (id, "companyId", "planId", status, "trialEndsAt", "currentPeriodEnd", "cancelAtPeriodEnd", "canceledAt", "isComplimentary", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
5c2cacce-9b9a-412b-9895-f9a82791fe14	6eee932d-e0fa-49e5-b232-9434ec48b6dc	7da3d67f-8847-4ebd-8cfe-9639f7271264	TRIAL	2026-07-31 06:28:33.178	2026-07-31 06:28:33.178	f	\N	t	2026-07-17 06:28:33.179	2026-07-19 00:27:42.861	\N	c27a2fc6-a357-43e3-a187-f5112ac463d4
89f94917-92bd-4ebd-9d0d-f0f49d1d479e	83f8d4f7-54af-41e2-a933-91d59d942655	7da3d67f-8847-4ebd-8cfe-9639f7271264	TRIAL	2026-08-03 01:11:29.845	2026-08-03 01:11:29.845	f	\N	f	2026-07-19 01:11:11.468	2026-07-19 03:48:14.715	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
03674181-bf49-478b-8d94-99b42056165b	9412d4ce-5b6c-44d4-a0a3-c1b8dbe73694	7da3d67f-8847-4ebd-8cfe-9639f7271264	FULL	2026-07-30 01:30:59.563	2026-12-30 01:30:59.563	f	\N	f	2026-07-19 00:35:03.366	2026-07-19 04:36:44.259	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
ff694fe8-37f2-41b0-a46a-9076ca980870	47ff9c30-e1d6-410e-a2f7-6923746d3c32	7da3d67f-8847-4ebd-8cfe-9639f7271264	FULL	2026-08-03 00:29:06.058	2026-09-03 00:29:06.058	f	\N	f	2026-07-19 00:29:06.06	2026-07-19 06:28:23.028	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
\.


--
-- Data for Name: SubscriptionPayment; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."SubscriptionPayment" (id, "companyId", "subscriptionId", "planId", amount, currency, status, method, reference, "paidAt", "periodStart", "periodEnd", provider, "providerPaymentId", notes, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
626c0c66-cdc8-41ab-96f2-cadea31f9b54	47ff9c30-e1d6-410e-a2f7-6923746d3c32	ff694fe8-37f2-41b0-a46a-9076ca980870	7da3d67f-8847-4ebd-8cfe-9639f7271264	50.00	PEN	PAID	Yape	\N	2026-07-19 00:31:12.119	2026-08-03 00:29:06.058	2026-09-03 00:29:06.058	\N	\N	\N	2026-07-19 00:31:12.13	2026-07-19 00:31:12.13	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
be763246-efdf-401a-9472-eafecc22d991	9412d4ce-5b6c-44d4-a0a3-c1b8dbe73694	03674181-bf49-478b-8d94-99b42056165b	7da3d67f-8847-4ebd-8cfe-9639f7271264	150.00	PEN	PAID	Efectivo	\N	2026-07-19 04:12:33.718	2026-07-30 01:30:59.563	2026-10-30 01:30:59.563	\N	\N	\N	2026-07-19 04:12:33.727	2026-07-19 04:12:33.727	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
53cb51a6-5ff0-4a82-9105-06d0f4227f69	9412d4ce-5b6c-44d4-a0a3-c1b8dbe73694	03674181-bf49-478b-8d94-99b42056165b	7da3d67f-8847-4ebd-8cfe-9639f7271264	50.00	PEN	PAID	Yape	\N	2026-07-19 04:19:28.995	2026-10-30 01:30:59.563	2026-11-30 01:30:59.563	\N	\N	\N	2026-07-19 04:19:29.005	2026-07-19 04:19:29.005	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
633355c3-28bb-47bd-bafc-6a0298c50ca7	9412d4ce-5b6c-44d4-a0a3-c1b8dbe73694	03674181-bf49-478b-8d94-99b42056165b	7da3d67f-8847-4ebd-8cfe-9639f7271264	50.00	PEN	PAID	Transferencia	\N	2026-07-19 04:36:44.256	2026-11-30 01:30:59.563	2026-12-30 01:30:59.563	\N	\N	\N	2026-07-19 04:36:44.264	2026-07-19 04:36:44.264	c27a2fc6-a357-43e3-a187-f5112ac463d4	c27a2fc6-a357-43e3-a187-f5112ac463d4
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."User" (id, email, password, "firstName", "lastName", "isActive", "companyId", "roleId", "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
e633c195-707a-45fe-aa0d-868c7f5985fb	wcv.94@hotmail.com	$2b$10$taSRfRUSZOtZ7y3GWHFNyOOum8vthBoWb12PDUqP1xI3pCHX02D9W	root	admin	t	6eee932d-e0fa-49e5-b232-9434ec48b6dc	cf4c8362-29fc-4a47-92c4-12a9a0d20809	2026-07-17 04:05:45.162	2026-07-17 04:05:45.162	\N	\N
c27a2fc6-a357-43e3-a187-f5112ac463d4	admin@pawcontrol.com	$2b$10$CqCXj8rXrHOx0Xbgnz/wuOU4/JhGE0MnDZQJK2yHZ8NFAyN5w.N5u	root	admin	t	6eee932d-e0fa-49e5-b232-9434ec48b6dc	cf4c8362-29fc-4a47-92c4-12a9a0d20809	2026-07-17 06:28:33.09	2026-07-17 06:28:33.09	\N	\N
\.


--
-- Data for Name: Vaccine; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Vaccine" (id, "companyId", "petId", "medicalRecordId", "vetId", name, "batchNumber", "appliedAt", "nextDueAt", notes, "createdAt", "updatedAt", "createdBy", "updatedBy") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
825b2f52-81d3-4d64-a1e7-6c4619870386	cac5efb768bbf74b718b66920186b7ef36b114871485fe33f04139170e082102	2026-07-17 04:05:06.514179+00	20260717040442_init_company_schema	\N	\N	2026-07-17 04:05:06.44243+00	1
562351e2-e4ce-4bd7-8765-dcc0438ce7ae	1d75b8e4b5e1dc68037455703f92321750bc83f0879720f918f88528e49b81bf	2026-07-17 06:28:17.489752+00	20260717062817_add_company_subscription_billing	\N	\N	2026-07-17 06:28:17.466559+00	1
7ac3a688-d96e-4590-9315-ffa380c3f6b2	cb43ca4a6b01aa79cbe37b8f6b1872309c21b67314fafdc2426e3689bcde4a5f	2026-07-19 04:31:07.482479+00	20260718000000_simplify_subscription_status	\N	\N	2026-07-19 04:31:07.47005+00	1
\.


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: MedicalRecord MedicalRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY (id);


--
-- Name: Menu Menu_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Menu"
    ADD CONSTRAINT "Menu_pkey" PRIMARY KEY (id);


--
-- Name: NotificationLog NotificationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_pkey" PRIMARY KEY (id);


--
-- Name: Owner Owner_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Owner"
    ADD CONSTRAINT "Owner_pkey" PRIMARY KEY (id);


--
-- Name: Pet Pet_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_pkey" PRIMARY KEY (id);


--
-- Name: Plan Plan_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Plan"
    ADD CONSTRAINT "Plan_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: RoleMenu RoleMenu_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."RoleMenu"
    ADD CONSTRAINT "RoleMenu_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: SubscriptionPayment SubscriptionPayment_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SubscriptionPayment"
    ADD CONSTRAINT "SubscriptionPayment_pkey" PRIMARY KEY (id);


--
-- Name: Subscription Subscription_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vaccine Vaccine_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Appointment_companyId_petId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Appointment_companyId_petId_idx" ON public."Appointment" USING btree ("companyId", "petId");


--
-- Name: Appointment_companyId_scheduledAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Appointment_companyId_scheduledAt_idx" ON public."Appointment" USING btree ("companyId", "scheduledAt");


--
-- Name: Appointment_companyId_status_scheduledAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Appointment_companyId_status_scheduledAt_idx" ON public."Appointment" USING btree ("companyId", status, "scheduledAt");


--
-- Name: Appointment_companyId_vetId_scheduledAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Appointment_companyId_vetId_scheduledAt_idx" ON public."Appointment" USING btree ("companyId", "vetId", "scheduledAt");


--
-- Name: Company_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Company_slug_key" ON public."Company" USING btree (slug);


--
-- Name: InvoiceItem_companyId_productId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "InvoiceItem_companyId_productId_idx" ON public."InvoiceItem" USING btree ("companyId", "productId");


--
-- Name: InvoiceItem_invoiceId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "InvoiceItem_invoiceId_idx" ON public."InvoiceItem" USING btree ("invoiceId");


--
-- Name: Invoice_companyId_issuedAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Invoice_companyId_issuedAt_idx" ON public."Invoice" USING btree ("companyId", "issuedAt" DESC);


--
-- Name: Invoice_companyId_ownerId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Invoice_companyId_ownerId_idx" ON public."Invoice" USING btree ("companyId", "ownerId");


--
-- Name: Invoice_companyId_serie_correlativo_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Invoice_companyId_serie_correlativo_key" ON public."Invoice" USING btree ("companyId", serie, correlativo);


--
-- Name: Invoice_companyId_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Invoice_companyId_status_idx" ON public."Invoice" USING btree ("companyId", status);


--
-- Name: MedicalRecord_appointmentId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "MedicalRecord_appointmentId_key" ON public."MedicalRecord" USING btree ("appointmentId");


--
-- Name: MedicalRecord_companyId_petId_visitDate_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "MedicalRecord_companyId_petId_visitDate_idx" ON public."MedicalRecord" USING btree ("companyId", "petId", "visitDate" DESC);


--
-- Name: Menu_code_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Menu_code_key" ON public."Menu" USING btree (code);


--
-- Name: NotificationLog_companyId_appointmentId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "NotificationLog_companyId_appointmentId_idx" ON public."NotificationLog" USING btree ("companyId", "appointmentId");


--
-- Name: NotificationLog_companyId_petId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "NotificationLog_companyId_petId_idx" ON public."NotificationLog" USING btree ("companyId", "petId");


--
-- Name: NotificationLog_companyId_status_scheduledFor_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "NotificationLog_companyId_status_scheduledFor_idx" ON public."NotificationLog" USING btree ("companyId", status, "scheduledFor");


--
-- Name: NotificationLog_providerMsgId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "NotificationLog_providerMsgId_idx" ON public."NotificationLog" USING btree ("providerMsgId");


--
-- Name: Owner_companyId_docNumber_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Owner_companyId_docNumber_key" ON public."Owner" USING btree ("companyId", "docNumber");


--
-- Name: Owner_companyId_lastName_firstName_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Owner_companyId_lastName_firstName_idx" ON public."Owner" USING btree ("companyId", "lastName", "firstName");


--
-- Name: Owner_companyId_phone_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Owner_companyId_phone_idx" ON public."Owner" USING btree ("companyId", phone);


--
-- Name: Pet_companyId_name_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Pet_companyId_name_idx" ON public."Pet" USING btree ("companyId", name);


--
-- Name: Pet_companyId_ownerId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Pet_companyId_ownerId_idx" ON public."Pet" USING btree ("companyId", "ownerId");


--
-- Name: Plan_code_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Plan_code_key" ON public."Plan" USING btree (code);


--
-- Name: Product_companyId_name_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Product_companyId_name_idx" ON public."Product" USING btree ("companyId", name);


--
-- Name: Product_companyId_sku_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Product_companyId_sku_key" ON public."Product" USING btree ("companyId", sku);


--
-- Name: Product_companyId_type_isActive_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Product_companyId_type_isActive_idx" ON public."Product" USING btree ("companyId", type, "isActive");


--
-- Name: RoleMenu_menuId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "RoleMenu_menuId_idx" ON public."RoleMenu" USING btree ("menuId");


--
-- Name: RoleMenu_roleId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "RoleMenu_roleId_idx" ON public."RoleMenu" USING btree ("roleId");


--
-- Name: RoleMenu_roleId_menuId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "RoleMenu_roleId_menuId_key" ON public."RoleMenu" USING btree ("roleId", "menuId");


--
-- Name: Role_name_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Role_name_key" ON public."Role" USING btree (name);


--
-- Name: Role_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Role_slug_key" ON public."Role" USING btree (slug);


--
-- Name: SubscriptionPayment_companyId_paidAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "SubscriptionPayment_companyId_paidAt_idx" ON public."SubscriptionPayment" USING btree ("companyId", "paidAt" DESC);


--
-- Name: SubscriptionPayment_status_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "SubscriptionPayment_status_idx" ON public."SubscriptionPayment" USING btree (status);


--
-- Name: SubscriptionPayment_subscriptionId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "SubscriptionPayment_subscriptionId_idx" ON public."SubscriptionPayment" USING btree ("subscriptionId");


--
-- Name: Subscription_companyId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Subscription_companyId_key" ON public."Subscription" USING btree ("companyId");


--
-- Name: Subscription_status_currentPeriodEnd_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON public."Subscription" USING btree (status, "currentPeriodEnd");


--
-- Name: User_companyId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "User_companyId_idx" ON public."User" USING btree ("companyId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Vaccine_companyId_nextDueAt_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Vaccine_companyId_nextDueAt_idx" ON public."Vaccine" USING btree ("companyId", "nextDueAt");


--
-- Name: Vaccine_companyId_petId_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX "Vaccine_companyId_petId_idx" ON public."Vaccine" USING btree ("companyId", "petId");


--
-- Name: Appointment Appointment_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Appointment Appointment_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Appointment Appointment_vetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InvoiceItem InvoiceItem_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_cashierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Invoice Invoice_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Invoice Invoice_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."Owner"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MedicalRecord MedicalRecord_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: MedicalRecord MedicalRecord_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MedicalRecord MedicalRecord_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MedicalRecord MedicalRecord_vetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Menu Menu_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Menu"
    ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Menu"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: NotificationLog NotificationLog_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationLog NotificationLog_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NotificationLog NotificationLog_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."NotificationLog"
    ADD CONSTRAINT "NotificationLog_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Owner Owner_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Owner"
    ADD CONSTRAINT "Owner_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Pet Pet_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Pet Pet_ownerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES public."Owner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RoleMenu RoleMenu_menuId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."RoleMenu"
    ADD CONSTRAINT "RoleMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES public."Menu"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RoleMenu RoleMenu_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."RoleMenu"
    ADD CONSTRAINT "RoleMenu_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubscriptionPayment SubscriptionPayment_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SubscriptionPayment"
    ADD CONSTRAINT "SubscriptionPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SubscriptionPayment SubscriptionPayment_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SubscriptionPayment"
    ADD CONSTRAINT "SubscriptionPayment_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SubscriptionPayment SubscriptionPayment_subscriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."SubscriptionPayment"
    ADD CONSTRAINT "SubscriptionPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES public."Subscription"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Subscription Subscription_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Subscription"
    ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."Plan"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vaccine Vaccine_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vaccine Vaccine_medicalRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Vaccine Vaccine_petId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_petId_fkey" FOREIGN KEY ("petId") REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Vaccine Vaccine_vetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_vetId_fkey" FOREIGN KEY ("vetId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: admin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict pGyYX8qQH6b8iwP41GEhdagLelZ7FfvkdbhLBolpNVdZmPwKilZ5l39CzKUWcvZ

