/**
 * TIBET Audit Types
 *
 * Core type definitions for the compliance scanner.
 */
type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type Status = 'passed' | 'warning' | 'failed' | 'skipped';
type Grade = 'A' | 'B' | 'C' | 'D' | 'F';
type Category = 'gdpr' | 'ai_act' | 'nis2' | 'pipa' | 'appi' | 'pdpa' | 'lgpd' | 'gulf' | 'ndpr' | 'jis' | 'sovereignty' | 'provider' | 'penguin';
type SignoffState = 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'HUMAN_VERIFIED' | 'HUMAN_REJECTED' | 'JIS_SEALED';
interface FixAction {
    description: string;
    command?: string;
    autoFix?: () => Promise<boolean>;
}
interface CheckResult {
    checkId: string;
    name: string;
    status: Status;
    severity: Severity;
    category: Category;
    message?: string;
    recommendation?: string;
    reference?: string;
    scoreImpact: number;
    canAutoFix: boolean;
    fixAction?: FixAction;
}
interface Check {
    checkId: string;
    name: string;
    category: Category;
    severity: Severity;
    scoreWeight: number;
    description: string;
    run: (context: ScanContext) => Promise<CheckResult>;
}
interface ScanContext {
    scanPath: string;
    packageJson?: Record<string, unknown>;
    files: string[];
    sovereignMode: boolean;
}
interface ScanResult {
    timestamp: Date;
    scanPath: string;
    score: number;
    grade: Grade;
    passed: number;
    warnings: number;
    failed: number;
    skipped: number;
    results: CheckResult[];
    durationMs: number;
    scanId: string;
    sovereignMode: boolean;
}
interface ScanOptions {
    categories?: Category[];
    sovereignMode?: boolean;
    verbose?: boolean;
}
interface FixOptions {
    auto?: boolean;
    wetWipe?: boolean;
    requireSignoff?: boolean;
    reviewer?: string;
    reviewerDid?: string;
    sovereignMode?: boolean;
}
interface SignoffRecord {
    signoffId: string;
    scanId: string;
    scanPath: string;
    scanScore: number;
    scanGrade: Grade;
    issuesFixed: number;
    toolVersion: string;
    timestamp: Date;
    state: SignoffState;
    reviewerName?: string;
    reviewerDid?: string;
    reviewComment?: string;
    jisConsentHash?: string;
    sealedAt?: Date;
}
interface CheckpointResult {
    from: string;
    to: string;
    readinessScore: number;
    mappingType: 'EQUIVALENT' | 'PARTIAL' | 'CONTEXT_BOUND' | 'NON_EQUIVALENT';
    signals: string[];
    recommendations: string[];
}

/**
 * TIBET Audit Scanner
 *
 * The Diaper Protocol - One command, hands free, compliance done.
 *
 * @example
 * ```typescript
 * import { scan } from 'tibet-audit';
 *
 * const result = await scan('./my-project');
 * console.log(`Score: ${result.score}/100 (Grade: ${result.grade})`);
 * ```
 */

/**
 * Scan a directory for compliance issues
 *
 * @param scanPath - Directory to scan (default: current directory)
 * @param options - Scan options
 * @returns Scan result with score and all check results
 *
 * @example
 * ```typescript
 * // Basic scan
 * const result = await scan('./my-project');
 *
 * // Scan specific categories
 * const result = await scan('.', { categories: ['gdpr', 'ai_act'] });
 *
 * // Sovereign mode (no cloud APIs)
 * const result = await scan('.', { sovereignMode: true });
 * ```
 */
declare function scan(scanPath?: string, options?: ScanOptions): Promise<ScanResult>;
/**
 * Get fixable issues from scan results
 */
declare function getFixableIssues(results: CheckResult[]): CheckResult[];
/**
 * Apply fixes for issues
 */
declare function applyFixes(issues: CheckResult[], options?: {
    dryRun?: boolean;
}): Promise<{
    fixed: number;
    failed: number;
}>;

/**
 * GDPR Compliance Checks
 *
 * EU General Data Protection Regulation
 */

declare const GDPR_CHECKS: Check[];

/**
 * EU AI Act Compliance Checks
 *
 * Regulation on Artificial Intelligence
 */

declare const AI_ACT_CHECKS: Check[];

/**
 * NIS2 Compliance Checks
 *
 * Network and Information Security Directive 2 (EU)
 * Deadline: 18 April 2026 for essential entities
 *
 * "76 dagen. De tsunami komt."
 */

declare const NIS2_CHECKS: Check[];

/**
 * South Korea PIPA Compliance Checks
 *
 * Personal Information Protection Act
 * Note: PIPA has 24-hour breach notification (stricter than GDPR's 72 hours!)
 */

declare const PIPA_CHECKS: Check[];

/**
 * Japan APPI Compliance Checks
 *
 * Act on the Protection of Personal Information
 */

declare const APPI_CHECKS: Check[];

/**
 * Singapore PDPA Compliance Checks
 *
 * Personal Data Protection Act
 */

declare const PDPA_CHECKS: Check[];

/**
 * Brazil LGPD Compliance Checks
 *
 * Lei Geral de Proteção de Dados
 */

declare const LGPD_CHECKS: Check[];

/**
 * JIS Compliance Checks
 *
 * JTel Identity Standard - Bilateral consent and intent verification
 */

declare const JIS_CHECKS: Check[];

/**
 * TIBET Audit Checks
 *
 * All compliance checks across 10+ frameworks.
 * Now with NIS2 - 76 days until the tsunami!
 */

declare const ALL_CHECKS: Check[];

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

declare const VERSION = "0.2.1";

export { AI_ACT_CHECKS, ALL_CHECKS, APPI_CHECKS, type Category, type Check, type CheckResult, type CheckpointResult, type FixAction, type FixOptions, GDPR_CHECKS, type Grade, JIS_CHECKS, LGPD_CHECKS, NIS2_CHECKS, PDPA_CHECKS, PIPA_CHECKS, type ScanContext, type ScanOptions, type ScanResult, type Severity, type SignoffRecord, type SignoffState, type Status, VERSION, applyFixes, getFixableIssues, scan };
