/**
 * Global Feature Flags
 * 
 * Use these flags to enable/disable specific features across the application.
 * This allows for incomplete features to be merged into master without being
 * exposed to end users, and enables easy A/B testing or gradual rollouts.
 */
export const FEATURES = {
  // Currently active
  auditTimeline: true,
  
  // In development / planned
  analytics: false,
  aiForecasting: false,
  barcodeScanner: false,
  multiCurrency: false,
  bulkImport: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;

/**
 * Helper to check if a feature is enabled.
 * In the future, this could be extended to check user-specific flags via an API.
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  return FEATURES[feature];
}
