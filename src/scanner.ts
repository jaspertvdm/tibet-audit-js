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

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  ScanResult,
  ScanOptions,
  ScanContext,
  CheckResult,
  Grade,
  Category,
  Check,
} from './types';
import { ALL_CHECKS } from './checks';

/**
 * Generate a short unique ID
 */
function generateId(): string {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Calculate grade from score
 */
function calculateGrade(score: number): Grade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Read package.json if it exists
 */
function readPackageJson(scanPath: string): Record<string, unknown> | undefined {
  const pkgPath = path.join(scanPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      return JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/**
 * Get all files in directory (non-recursive for speed)
 */
function getFiles(scanPath: string): string[] {
  const files: string[] = [];

  function walkDir(dir: string, depth = 0) {
    if (depth > 3) return; // Max 3 levels deep for speed
    if (!fs.existsSync(dir)) return;

    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath, depth + 1);
        } else {
          files.push(fullPath);
        }
      }
    } catch {
      // Permission denied, etc.
    }
  }

  walkDir(scanPath);
  return files;
}

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
export async function scan(
  scanPath: string = '.',
  options: ScanOptions = {}
): Promise<ScanResult> {
  const startTime = Date.now();
  const resolvedPath = path.resolve(scanPath);

  // Build context
  const context: ScanContext = {
    scanPath: resolvedPath,
    packageJson: readPackageJson(resolvedPath),
    files: getFiles(resolvedPath),
    sovereignMode: options.sovereignMode ?? false,
  };

  // Filter checks by category if specified
  let checks: Check[] = ALL_CHECKS;
  if (options.categories && options.categories.length > 0) {
    checks = ALL_CHECKS.filter((c) => options.categories!.includes(c.category));
  }

  // Run all checks
  const results: CheckResult[] = [];
  for (const check of checks) {
    try {
      const result = await check.run(context);
      results.push(result);
    } catch (error) {
      results.push({
        checkId: check.checkId,
        name: check.name,
        status: 'skipped',
        severity: check.severity,
        category: check.category,
        message: `Check failed to run: ${error}`,
        scoreImpact: 0,
        canAutoFix: false,
      });
    }
  }

  // Calculate score
  let deductions = 0;
  for (const result of results) {
    if (result.status === 'failed') {
      deductions += result.scoreImpact;
    } else if (result.status === 'warning') {
      deductions += result.scoreImpact * 0.5;
    }
  }
  const score = Math.max(0, Math.round(100 - deductions));
  const grade = calculateGrade(score);

  // Count by status
  const passed = results.filter((r) => r.status === 'passed').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return {
    timestamp: new Date(),
    scanPath: resolvedPath,
    score,
    grade,
    passed,
    warnings,
    failed,
    skipped,
    results,
    durationMs: Date.now() - startTime,
    scanId: generateId(),
    sovereignMode: options.sovereignMode ?? false,
  };
}

/**
 * Get fixable issues from scan results
 */
export function getFixableIssues(results: CheckResult[]): CheckResult[] {
  return results.filter((r) => r.canAutoFix && r.status !== 'passed');
}

/**
 * Apply fixes for issues
 */
export async function applyFixes(
  issues: CheckResult[],
  options: { dryRun?: boolean } = {}
): Promise<{ fixed: number; failed: number }> {
  let fixed = 0;
  let failed = 0;

  for (const issue of issues) {
    if (!issue.fixAction?.autoFix) continue;

    if (options.dryRun) {
      console.log(`Would fix: ${issue.checkId} - ${issue.fixAction.description}`);
      fixed++;
      continue;
    }

    try {
      const success = await issue.fixAction.autoFix();
      if (success) {
        fixed++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { fixed, failed };
}
