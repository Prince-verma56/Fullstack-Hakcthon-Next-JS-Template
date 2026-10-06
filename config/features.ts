/**
 * Feature Flags
 *
 * Centralized configuration for enabling/disabling capabilities.
 * Reads from environment variables with safe defaults.
 * Import this instead of checking process.env directly throughout the codebase.
 */

function envBool(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export const features = {
  preloader: envBool('FEATURE_PRELOADER', true),
  auth: envBool('FEATURE_AUTH', true),
  otp: envBool('FEATURE_OTP', false),
  email: envBool('FEATURE_EMAIL', false),
  storage: envBool('FEATURE_STORAGE', false),
  payments: envBool('FEATURE_PAYMENTS', false),
  redis: envBool('FEATURE_REDIS', false),
  ai: envBool('FEATURE_AI', false),
  rag: envBool('FEATURE_RAG', false),
  agents: envBool('FEATURE_AGENTS', false),
  mcp: envBool('FEATURE_MCP', false),
  analytics: envBool('FEATURE_ANALYTICS', false),
  demoMode: envBool('FEATURE_DEMO_MODE', true),
} as const;

export type FeatureKey = keyof typeof features;

/**
 * Check if a feature is enabled. Throws if the feature key is invalid.
 */
export function isFeatureEnabled(key: FeatureKey): boolean {
  return features[key];
}
