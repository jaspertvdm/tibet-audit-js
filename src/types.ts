/**
 * TIBET Audit Types
 *
 * Core type definitions for the compliance scanner.
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Status = 'passed' | 'warning' | 'failed' | 'skipped';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type Category =
  | 'gdpr'
  | 'ai_act'
  | 'nis2'
  | 'pipa'
  | 'appi'
  | 'pdpa'
  | 'lgpd'
  | 'gulf'
  | 'ndpr'
  | 'jis'
  | 'sovereignty'
  | 'provider'
  | 'penguin';

export type SignoffState =
  | 'PENDING_REVIEW'
  | 'UNDER_REVIEW'
  | 'HUMAN_VERIFIED'
  | 'HUMAN_REJECTED'
  | 'JIS_SEALED';

export interface FixAction {
  description: string;
  command?: string;
  autoFix?: () => Promise<boolean>;
}

export interface CheckResult {
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

export interface Check {
  checkId: string;
  name: string;
  category: Category;
  severity: Severity;
  scoreWeight: number;
  description: string;
  run: (context: ScanContext) => Promise<CheckResult>;
}

export interface ScanContext {
  scanPath: string;
  packageJson?: Record<string, unknown>;
  files: string[];
  sovereignMode: boolean;
}

export interface ScanResult {
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

export interface ScanOptions {
  categories?: Category[];
  sovereignMode?: boolean;
  verbose?: boolean;
}

export interface FixOptions {
  auto?: boolean;
  wetWipe?: boolean;
  requireSignoff?: boolean;
  reviewer?: string;
  reviewerDid?: string;
  sovereignMode?: boolean;
}

export interface SignoffRecord {
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

export interface CheckpointResult {
  from: string;
  to: string;
  readinessScore: number;
  mappingType: 'EQUIVALENT' | 'PARTIAL' | 'CONTEXT_BOUND' | 'NON_EQUIVALENT';
  signals: string[];
  recommendations: string[];
}
