const normalizeBoolean = (value?: string) =>
  String(value || '')
    .trim()
    .toLowerCase() === 'true';

export const RECHARGE_FEATURE_ENABLED = normalizeBoolean(
  process.env.NEXT_PUBLIC_RECHARGE_ENABLED,
);

