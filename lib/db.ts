import "server-only";

import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

import {
  getDefaultWhatsAppMessage,
  inferBusinessType,
  isBusinessType
} from "@/lib/business-types";
import { slugify } from "@/lib/slug";
import type {
  AnalyticsKey,
  Business,
  CreateBusinessInput,
  Database
} from "@/types/business";

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
    JSON.stringify({ businesses: [] satisfies Business[] }, null, 2),
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

function sanitizeDatabase(input: unknown) {
  const raw =
    typeof input === "object" && input ? (input as Record<string, unknown>) : {};
  const rawBusinesses = Array.isArray(raw.businesses) ? raw.businesses : [];
  const usedSlugs = new Set<string>();
  const businesses = rawBusinesses.map((business, index) =>
    sanitizeBusiness(business, index, usedSlugs)
  );

  return {
    businesses
  } satisfies Database;
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

export async function getBusinessBySlug(slug: string) {
  const database = await readDatabase();
  return database.businesses.find((business) => business.slug === slug) ?? null;
}

export async function createBusiness(input: CreateBusinessInput) {
  return withWriteLock(async () => {
    const database = await readDatabase();
    const slug = buildUniqueSlug(
      input.name,
      new Set(database.businesses.map((business) => business.slug))
    );

    const business: Business = {
      id: randomUUID(),
      slug,
      name: input.name.trim(),
      type: input.type,
      googleReviewLink: input.googleReviewLink.trim(),
      whatsappNumber: normalizeWhatsappNumber(input.whatsappNumber),
      createdAt: new Date().toISOString(),
      analytics: {
        scans: 0,
        positiveClicks: 0,
        negativeClicks: 0
      }
    };

    database.businesses.unshift(business);
    await writeDatabase(database);

    return business;
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
