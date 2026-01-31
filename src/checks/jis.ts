/**
 * JIS Compliance Checks
 *
 * JTel Identity Standard - Bilateral consent and intent verification
 */

import * as fs from 'fs';
import * as path from 'path';
import { Check, ScanContext, CheckResult } from '../types';

function findFile(context: ScanContext, patterns: string[]): string | null {
  for (const file of context.files) {
    const basename = path.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}

function hasDependency(context: ScanContext, names: string[]): boolean {
  if (!context.packageJson) return false;
  const deps = {
    ...(context.packageJson.dependencies as Record<string, string> || {}),
    ...(context.packageJson.devDependencies as Record<string, string> || {}),
  };
  return names.some((name) => name in deps);
}

export const JIS_CHECKS: Check[] = [
  {
    checkId: 'JIS-001',
    name: 'Bilateral Consent Implementation',
    category: 'jis',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for bilateral consent mechanism (did:jis)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      // Check for did-jis package
      if (hasDependency(context, ['did-jis', '@jtel/jis', 'jis-consent'])) {
        return {
          checkId: 'JIS-001',
          name: 'Bilateral Consent Implementation',
          status: 'passed',
          severity: 'high',
          category: 'jis',
          message: 'JIS bilateral consent library found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      const found = findFile(context, ['consent', 'jis', 'bilateral']);

      if (found) {
        return {
          checkId: 'JIS-001',
          name: 'Bilateral Consent Implementation',
          status: 'passed',
          severity: 'high',
          category: 'jis',
          message: 'Consent implementation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'JIS-001',
        name: 'Bilateral Consent Implementation',
        status: 'warning',
        severity: 'high',
        category: 'jis',
        message: 'No bilateral consent mechanism found',
        recommendation: 'Implement did:jis for bilateral consent (npm: did-jis)',
        reference: 'JIS Protocol v1.0',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'JIS-002',
    name: 'TIBET Provenance Trail',
    category: 'jis',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for TIBET provenance implementation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      // Check for tibet packages
      if (hasDependency(context, ['tibet-vault', 'tibet-audit', 'mcp-server-tibet'])) {
        return {
          checkId: 'JIS-002',
          name: 'TIBET Provenance Trail',
          status: 'passed',
          severity: 'high',
          category: 'jis',
          message: 'TIBET provenance library found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      const found = findFile(context, ['tibet', 'provenance', 'audit-trail']);

      if (found) {
        return {
          checkId: 'JIS-002',
          name: 'TIBET Provenance Trail',
          status: 'passed',
          severity: 'high',
          category: 'jis',
          message: 'Provenance documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'JIS-002',
        name: 'TIBET Provenance Trail',
        status: 'warning',
        severity: 'high',
        category: 'jis',
        message: 'No TIBET provenance trail found',
        recommendation: 'Implement TIBET for audit trail (npm: tibet-vault)',
        reference: 'IETF draft-vandemeent-tibet-provenance',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'JIS-003',
    name: 'Intent Verification',
    category: 'jis',
    severity: 'medium',
    scoreWeight: 10,
    description: 'Check for intent verification (ERACHTER)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['intent', 'erachter', 'purpose']);

      if (found) {
        return {
          checkId: 'JIS-003',
          name: 'Intent Verification',
          status: 'passed',
          severity: 'medium',
          category: 'jis',
          message: 'Intent verification found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'JIS-003',
        name: 'Intent Verification',
        status: 'warning',
        severity: 'medium',
        category: 'jis',
        message: 'No explicit intent verification',
        recommendation: 'Document the ERACHTER (intent/why) for data processing',
        reference: 'TIBET ERACHTER principle',
        scoreImpact: 10,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'JIS-004',
    name: 'Sign-off Workflow',
    category: 'jis',
    severity: 'medium',
    scoreWeight: 10,
    description: 'Check for human sign-off workflow',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['signoff', 'approval', 'review']);

      if (found) {
        return {
          checkId: 'JIS-004',
          name: 'Sign-off Workflow',
          status: 'passed',
          severity: 'medium',
          category: 'jis',
          message: 'Sign-off workflow found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'JIS-004',
        name: 'Sign-off Workflow',
        status: 'skipped',
        severity: 'medium',
        category: 'jis',
        message: 'No sign-off workflow (optional for non-regulated)',
        recommendation: 'Consider --require-signoff for compliance verification',
        reference: 'JIS Sign-off Protocol',
        scoreImpact: 0,
        canAutoFix: false,
      };
    },
  },
];
