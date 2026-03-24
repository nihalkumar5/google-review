import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import {
  getDefaultWhatsAppMessage,
  inferBusinessType,
  isBusinessType,
  isPlanType
} from "@/lib/business-types";
import { slugify } from "@/lib/slug";
import type {
  AnalyticsKey,
  Business,
  CreateBusinessInput,
  Database,
  PlanType
} from "@/types/business";
import type {
  CreatePendingPaymentInput,
  PaymentMode,
  PaymentRecord,
  PaymentStatus
} from "@/types/payment";

const seedPath = path.join(process.cwd(), "data", "seed.json");
const databasePath =
  process.env.SMART_REVIEW_DATA_PATH ||
  (process.env.VERCEL
    ? path.join("/tmp", "smart-review-qr", "db.json")
    : path.join(process.cwd(), "data", "db.json"));

let writeQueue = Promise.resolve();

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDatabaseFile() {
  await fs.mkdir(path.dirname(databasePath), { recursive: true });

  if (await fileExists(databasePath)) {
    return;
  }

  if (await fileExists(seedPath)) {
    await fs.copyFile(seedPath, databasePath);
    return;
  }

  await fs.writeFile(
    databasePath,
    JSON.stringify(
      {
        businesses: [] satisfies Business[],
        payments: [] satisfies PaymentRecord[]
      },
      null,
      2
    ),
    "utf8"
  );
}

async function readDatabase() {
  await ensureDatabaseFile();

  const raw = await fs.readFile(databasePath, "utf8");
  const normalized = sanitizeDatabase(JSON.parse(raw));
  const normalizedRaw = JSON.stringify(normalized, null, 2);

  if (normalizedRaw.trim() !== raw.trim()) {
    await fs.writeFile(databasePath, normalizedRaw, "utf8");
  }

  return normalized;
}

async function writeDatabase(data: Database) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2), "utf8");
}

function withWriteLock<T>(action: () => Promise<T>) {
  const result = writeQueue.then(action, action);
  writeQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
}

function buildUniqueSlug(name: string, existing: Set<string>) {
  const base = slugify(name) || "business";
  let slug = base;

  while (existing.has(slug)) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return slug;
}

function normalizeAnalytics(value: unknown) {
  const raw = typeof value === "object" && value ? value : {};
  const analytics = raw as Record<string, unknown>;

  return {
    scans: Number(analytics.scans) || 0,
    positiveClicks: Number(analytics.positiveClicks) || 0,
    negativeClicks: Number(analytics.negativeClicks) || 0
  };
}

function isPaymentMode(value: string): value is PaymentMode {
  return value === "create" || value === "upgrade";
}

function isPaymentStatus(value: string): value is PaymentStatus {
  return value === "created" || value === "paid" || value === "failed";
}

function sanitizeBusiness(
  rawBusiness: unknown,
  index: number,
  usedSlugs: Set<string>
): Business {
  const raw =
    typeof rawBusiness === "object" && rawBusiness
      ? (rawBusiness as Record<string, unknown>)
      : {};

  const name =
    typeof raw.name === "string" && raw.name.trim()
      ? raw.name.trim()
      : `Business ${index + 1}`;
  const slugSource =
    typeof raw.slug === "string" && raw.slug.trim() ? raw.slug : name;
  const baseSlug = slugify(slugSource) || `business-${index + 1}`;
  let slug = baseSlug;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  usedSlugs.add(slug);

  const type =
    typeof raw.type === "string" && isBusinessType(raw.type)
      ? raw.type
      : inferBusinessType(
          `${name} ${typeof raw.reviewSuggestion === "string" ? raw.reviewSuggestion : ""}`
        );

  const whatsappNumber =
    typeof raw.whatsappNumber === "string"
      ? normalizeWhatsappNumber(raw.whatsappNumber)
      : typeof raw.whatsapp === "string"
        ? normalizeWhatsappNumber(raw.whatsapp)
        : "";

  return {
    id:
      typeof raw.id === "string" && raw.id.trim() ? raw.id : randomUUID(),
    slug,
    name,
    type,
    plan:
      typeof raw.plan === "string" && isPlanType(raw.plan)
        ? raw.plan
        : "basic",
    googleReviewLink:
      typeof raw.googleReviewLink === "string" && raw.googleReviewLink.trim()
        ? raw.googleReviewLink.trim()
        : "https://www.google.com",
    whatsappNumber,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim()
        ? raw.createdAt
        : new Date().toISOString(),
    analytics: normalizeAnalytics(raw.analytics)
  };
}

function sanitizeDraft(rawDraft: unknown): CreateBusinessInput | undefined {
  if (typeof rawDraft !== "object" || !rawDraft) {
    return undefined;
  }

  const draft = rawDraft as Record<string, unknown>;
  const name = typeof draft.name === "string" ? draft.name.trim() : "";
  const googleReviewLink =
    typeof draft.googleReviewLink === "string" ? draft.googleReviewLink.trim() : "";
  const whatsappNumber =
    typeof draft.whatsappNumber === "string"
      ? normalizeWhatsappNumber(draft.whatsappNumber)
      : "";

  if (
    !name ||
    typeof draft.type !== "string" ||
    !isBusinessType(draft.type) ||
    typeof draft.plan !== "string" ||
    !isPlanType(draft.plan) ||
    !googleReviewLink ||
    !whatsappNumber
  ) {
    return undefined;
  }

  return {
    name,
    type: draft.type,
    plan: draft.plan,
    googleReviewLink,
    whatsappNumber
  };
}

function sanitizePayment(
  rawPayment: unknown,
  index: number,
  businessesById: Map<string, Business>
): PaymentRecord {
  const raw =
    typeof rawPayment === "object" && rawPayment
      ? (rawPayment as Record<string, unknown>)
      : {};

  const businessId =
    typeof raw.businessId === "string" && raw.businessId.trim()
      ? raw.businessId
      : undefined;
  const linkedBusiness = businessId ? businessesById.get(businessId) : undefined;
  const draft = sanitizeDraft(raw.draft);

  return {
    id:
      typeof raw.id === "string" && raw.id.trim() ? raw.id : randomUUID(),
    mode:
      typeof raw.mode === "string" && isPaymentMode(raw.mode)
        ? raw.mode
        : "create",
    status:
      typeof raw.status === "string" && isPaymentStatus(raw.status)
        ? raw.status
        : "created",
    plan:
      typeof raw.plan === "string" && isPlanType(raw.plan)
        ? raw.plan
        : linkedBusiness?.plan || draft?.plan || "basic",
    amount: Math.max(0, Number(raw.amount) || 0),
    currency:
      typeof raw.currency === "string" && raw.currency.trim()
        ? raw.currency
        : "INR",
    orderId:
      typeof raw.orderId === "string" && raw.orderId.trim()
        ? raw.orderId
        : `order_missing_${index + 1}`,
    receipt:
      typeof raw.receipt === "string" && raw.receipt.trim()
        ? raw.receipt
        : `receipt_${index + 1}`,
    businessId,
    businessSlug:
      typeof raw.businessSlug === "string" && raw.businessSlug.trim()
        ? raw.businessSlug
        : linkedBusiness?.slug,
    businessName:
      typeof raw.businessName === "string" && raw.businessName.trim()
        ? raw.businessName
        : linkedBusiness?.name || draft?.name || `Business ${index + 1}`,
    draft,
    paymentId:
      typeof raw.paymentId === "string" && raw.paymentId.trim()
        ? raw.paymentId
        : undefined,
    signature:
      typeof raw.signature === "string" && raw.signature.trim()
        ? raw.signature
        : undefined,
    createdAt:
      typeof raw.createdAt === "string" && raw.createdAt.trim()
        ? raw.createdAt
        : new Date().toISOString(),
    paidAt:
      typeof raw.paidAt === "string" && raw.paidAt.trim() ? raw.paidAt : undefined
  };
}

function sanitizeDatabase(input: unknown) {
  const raw =
    typeof input === "object" && input ? (input as Record<string, unknown>) : {};
  const rawBusinesses = Array.isArray(raw.businesses) ? raw.businesses : [];
  const usedSlugs = new Set<string>();
  const businesses = rawBusinesses.map((business, index) =>
    sanitizeBusiness(business, index, usedSlugs)
  );
  const businessesById = new Map(businesses.map((business) => [business.id, business]));
  const rawPayments = Array.isArray(raw.payments) ? raw.payments : [];
  const payments = rawPayments.map((payment, index) =>
    sanitizePayment(payment, index, businessesById)
  );

  return {
    businesses,
    payments
  } satisfies Database;
}

function createBusinessRecord(
  input: CreateBusinessInput,
  existingSlugs: Set<string>
): Business {
  return {
    id: randomUUID(),
    slug: buildUniqueSlug(input.name, existingSlugs),
    name: input.name.trim(),
    type: input.type,
    plan: input.plan,
    googleReviewLink: input.googleReviewLink.trim(),
    whatsappNumber: normalizeWhatsappNumber(input.whatsappNumber),
    createdAt: new Date().toISOString(),
    analytics: {
      scans: 0,
      positiveClicks: 0,
      negativeClicks: 0
    }
  };
}

export function normalizeWhatsappNumber(number: string) {
  const trimmed = number.trim();

  if (trimmed.startsWith("+")) {
    return `+${trimmed.slice(1).replace(/\D/g, "")}`;
  }

  return trimmed.replace(/\D/g, "");
}

export function buildWhatsAppLink(business: Business) {
  const digits = normalizeWhatsappNumber(business.whatsappNumber).replace(
    /^\+/,
    ""
  );

  return `https://wa.me/${digits}?text=${encodeURIComponent(getDefaultWhatsAppMessage(business.name))}`;
}

export async function listBusinesses() {
  const database = await readDatabase();

  return [...database.businesses].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function listPayments() {
  const database = await readDatabase();

  return [...database.payments].sort((a, b) =>
    (b.paidAt || b.createdAt).localeCompare(a.paidAt || a.createdAt)
  );
}

export async function getBusinessBySlug(slug: string) {
  const database = await readDatabase();
  return database.businesses.find((business) => business.slug === slug) ?? null;
}

export async function getBusinessById(id: string) {
  const database = await readDatabase();
  return database.businesses.find((business) => business.id === id) ?? null;
}

export async function createBusiness(input: CreateBusinessInput) {
  return withWriteLock(async () => {
    const database = await readDatabase();
    const business = createBusinessRecord(
      input,
      new Set(database.businesses.map((entry) => entry.slug))
    );

    database.businesses.unshift(business);
    await writeDatabase(database);

    return business;
  });
}

export async function updateBusinessPlan(businessId: string, plan: PlanType) {
  return withWriteLock(async () => {
    const database = await readDatabase();
    const business = database.businesses.find((entry) => entry.id === businessId);

    if (!business) {
      return null;
    }

    business.plan = plan;
    await writeDatabase(database);

    return business;
  });
}

export async function createPendingPayment(input: CreatePendingPaymentInput) {
  return withWriteLock(async () => {
    const database = await readDatabase();

    const payment: PaymentRecord = {
      id: randomUUID(),
      mode: input.mode,
      status: "created",
      plan: input.plan,
      amount: input.amount,
      currency: input.currency || "INR",
      orderId: input.orderId,
      receipt: input.receipt,
      businessId: input.businessId,
      businessSlug: input.businessSlug,
      businessName: input.businessName,
      draft: input.draft,
      createdAt: new Date().toISOString()
    };

    database.payments.unshift(payment);
    await writeDatabase(database);

    return payment;
  });
}

export async function finalizePayment({
  orderId,
  paymentId,
  signature
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  return withWriteLock(async () => {
    const database = await readDatabase();
    const payment = database.payments.find((entry) => entry.orderId === orderId);

    if (!payment) {
      return null;
    }

    let business =
      payment.businessId
        ? database.businesses.find((entry) => entry.id === payment.businessId) || null
        : payment.businessSlug
          ? database.businesses.find((entry) => entry.slug === payment.businessSlug) ||
            null
          : null;

    if (payment.status === "paid") {
      return {
        payment,
        business
      };
    }

    if (payment.mode === "create") {
      if (!payment.draft) {
        throw new Error("Saved checkout draft is missing.");
      }

      business = createBusinessRecord(
        payment.draft,
        new Set(database.businesses.map((entry) => entry.slug))
      );
      database.businesses.unshift(business);
    } else {
      if (!business) {
        throw new Error("Business could not be found for this upgrade.");
      }

      business.plan = payment.plan;
    }

    payment.status = "paid";
    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.paidAt = new Date().toISOString();

    if (business) {
      payment.businessId = business.id;
      payment.businessSlug = business.slug;
      payment.businessName = business.name;
    }

    await writeDatabase(database);

    return {
      payment,
      business
    };
  });
}

export async function incrementAnalytics(slug: string, key: AnalyticsKey) {
  return withWriteLock(async () => {
    const database = await readDatabase();
    const target = database.businesses.find((business) => business.slug === slug);

    if (!target) {
      return null;
    }

    target.analytics[key] += 1;
    await writeDatabase(database);

    return target;
  });
}
