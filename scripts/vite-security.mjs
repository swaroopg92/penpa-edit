import { isAbsolute, relative, resolve } from "node:path";

export const MAX_DEV_API_BODY_BYTES = 256 * 1024;

const VARIANT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,63}$/;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateVariantId(value, { allowEmpty = false } = {}) {
  if (allowEmpty && value === "") return value;
  if (typeof value !== "string" || !VARIANT_ID_PATTERN.test(value)) {
    throw new TypeError("Variant ID must contain only letters, numbers, spaces, underscores, and hyphens.");
  }
  return value;
}

export function validateVariantMetadata(metadata) {
  if (!isPlainObject(metadata) || !Array.isArray(metadata.variants)) {
    throw new TypeError('Metadata must be a JSON object containing a "variants" array.');
  }
  if (metadata.variants.length > 5000) {
    throw new TypeError("Metadata contains too many variants.");
  }

  metadata.variants.forEach((variant, index) => {
    if (!isPlainObject(variant)) {
      throw new TypeError(`Variant ${index} must be an object.`);
    }
    validateVariantId(variant.id, { allowEmpty: true });
    if (typeof variant.name !== "string" || typeof variant.status !== "string" || !isPlainObject(variant.rules)) {
      throw new TypeError(`Variant ${index} has invalid name, status, or rules.`);
    }
    if (variant.tags !== undefined &&
        (!Array.isArray(variant.tags) || variant.tags.some((tag) => typeof tag !== "string"))) {
      throw new TypeError(`Variant ${index} has invalid tags.`);
    }
    if (variant.inputType !== undefined) {
      if (!isPlainObject(variant.inputType) ||
          !Array.isArray(variant.inputType.categories) ||
          variant.inputType.categories.some((category) => typeof category !== "string") ||
          (variant.inputType.instructions !== undefined &&
           (!Array.isArray(variant.inputType.instructions) ||
            variant.inputType.instructions.some((instruction) => typeof instruction !== "string")))) {
        throw new TypeError(`Variant ${index} has invalid inputType metadata.`);
      }
    }
  });

  return metadata;
}

export function resolveContainedPath(parentDirectory, childPath) {
  const parent = resolve(parentDirectory);
  const candidate = resolve(parent, childPath);
  const pathFromParent = relative(parent, candidate);
  if (pathFromParent === ".." || pathFromParent.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
      isAbsolute(pathFromParent)) {
    throw new TypeError("Generated variant page escapes its output directory.");
  }
  return candidate;
}

export function validateMutationHeaders(headers, encrypted = false) {
  const contentType = String(headers["content-type"] || "").split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return { status: 415, error: "Content-Type must be application/json." };
  }

  const host = headers.host;
  const origin = headers.origin;
  if (!host || !origin) {
    return { status: 403, error: "A same-origin request is required." };
  }

  try {
    const parsedOrigin = new URL(origin);
    const expectedProtocol = encrypted ? "https:" : "http:";
    if (parsedOrigin.protocol !== expectedProtocol || parsedOrigin.host !== host ||
        parsedOrigin.username || parsedOrigin.password) {
      return { status: 403, error: "Cross-origin mutation requests are not allowed." };
    }
  } catch (_error) {
    return { status: 403, error: "A valid same-origin request is required." };
  }

  return null;
}
