import deepEqual from "fast-deep-equal";
import SuperJSON from "superjson";

/** Recursively sort arrays + object keys */
const deepNormalize = (v: unknown): unknown => {
  if (Array.isArray(v)) {
    return v.map(deepNormalize).sort((a, b) => {
      const sa = JSON.stringify(a);
      const sb = JSON.stringify(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
  }

  if (isPlainObject(v)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(v).sort()) {
      out[key] = deepNormalize(v[key]);
    }
    return out;
  }

  return v; // primitives
};

/**
 * Normalize structures so deep-equal works:
 * - Encode using SuperJSON (handles Dates, BigInts, Maps/Sets via metadata)
 * - Sort arrays so order does not matter
 * - Sort object keys to guarantee stable comparison
 */
const normalize = (value: unknown): unknown => {
  // First serialize using SuperJSON for consistency
  const { json } = SuperJSON.serialize(value);

  return deepNormalize(json);
};

const isPlainObject = (v: unknown): v is Record<string, unknown> => Object.prototype.toString.call(v) === "[object Object]";

export const isDeepEqual = (a: unknown, b: unknown): boolean => {
  return deepEqual(normalize(a), normalize(b));
};
