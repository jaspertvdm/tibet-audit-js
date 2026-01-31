/**
 * TIBET Audit - Compliance Health Scanner
 *
 * Like Lynis, but for regulations. Scan your projects for GDPR, AI Act,
 * PIPA, APPI, PDPA, LGPD, and more.
 *
 * The Diaper Protocol: One command, hands free, compliance done.
 *
 * @example
 * ```typescript
 * import { scan, getFixableIssues, applyFixes } from 'tibet-audit';
 *
 * // Basic scan
 * const result = await scan('./my-project');
 * console.log(`Score: ${result.score}/100 (Grade: ${result.grade})`);
 *
 * // Scan specific categories
 * const result = await scan('.', { categories: ['gdpr', 'ai_act'] });
 *
 * // Sovereign mode (no cloud APIs)
 * const result = await scan('.', { sovereignMode: true });
 *
 * // Fix issues
 * const fixable = getFixableIssues(result.results);
 * await applyFixes(fixable);
 * ```
 *
 * @author Jasper van de Meent & Root AI
 * @license MIT
 */

// Core scanning functionality
export { scan, getFixableIssues, applyFixes } from './scanner';

// Types
export type {
  Severity,
  Status,
  Grade,
  Category,
  SignoffState,
  FixAction,
  CheckResult,
  Check,
  ScanContext,
  ScanResult,
  ScanOptions,
  FixOptions,
  SignoffRecord,
  CheckpointResult,
} from './types';

// Checks (for advanced usage)
export {
  ALL_CHECKS,
  GDPR_CHECKS,
  AI_ACT_CHECKS,
  NIS2_CHECKS,
  PIPA_CHECKS,
  APPI_CHECKS,
  PDPA_CHECKS,
  LGPD_CHECKS,
  JIS_CHECKS,
} from './checks';

// Version
export const VERSION = '0.2.1';
