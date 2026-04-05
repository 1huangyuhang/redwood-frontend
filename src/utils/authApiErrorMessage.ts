type ValidationDetails = {
  fieldErrors?: Record<string, string[] | undefined>;
  formErrors?: string[];
};

function firstMessageFromFlatten(details: unknown): string | null {
  if (!details || typeof details !== 'object') return null;
  const det = details as ValidationDetails;
  if (det.fieldErrors) {
    for (const msgs of Object.values(det.fieldErrors)) {
      const first = Array.isArray(msgs) ? msgs[0] : undefined;
      if (first) return first;
    }
  }
  if (det.formErrors?.[0]) return det.formErrors[0];
  return null;
}

/**
 * 解析 /auth/register、/auth/login 等接口的错误体（含统一 ApiFailure + Zod flatten）。
 */
export function getAuthApiErrorMessage(
  data: unknown,
  fallback: string
): string {
  if (typeof data === 'string' && data.trim()) return data;
  if (!data || typeof data !== 'object') return fallback;

  const d = data as Record<string, unknown>;

  if (d.success === false) {
    const m = typeof d.message === 'string' ? d.message.trim() : '';
    if (m) return m;
    const fromDetails = firstMessageFromFlatten(d.details);
    if (fromDetails) return fromDetails;
    return fallback;
  }

  if (typeof d.message === 'string' && d.message.trim()) return d.message;
  if (typeof d.error === 'string' && d.error.trim()) {
    if (d.error !== 'Validation Error') return d.error;
  }
  if (
    d.error === 'Validation Error' &&
    d.details &&
    typeof d.details === 'object'
  ) {
    const fromLegacy = firstMessageFromFlatten(d.details);
    if (fromLegacy) return fromLegacy;
  }
  return fallback;
}
