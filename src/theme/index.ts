/**
 * Re-exports the canonical design tokens from theme/tokens.ts (repo root) so
 * components import them via the @/ alias. The single source of truth remains
 * theme/tokens.ts (DESIGN_SYSTEM §18, DoR §17.1) — never hard-code hex, radii,
 * spacing, or durations in components.
 */
export * from '../../theme/tokens';
export { theme as default } from '../../theme/tokens';
