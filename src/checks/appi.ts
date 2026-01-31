/**
 * Japan APPI Compliance Checks
 *
 * Act on the Protection of Personal Information
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

export const APPI_CHECKS: Check[] = [
  {
    checkId: 'APPI-001',
    name: 'Privacy Policy (APPI)',
    category: 'appi',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for APPI-compliant privacy policy',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['privacy', 'プライバシー']);

      if (found) {
        return {
          checkId: 'APPI-001',
          name: 'Privacy Policy (APPI)',
          status: 'passed',
          severity: 'high',
          category: 'appi',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'APPI-001',
        name: 'Privacy Policy (APPI)',
        status: 'failed',
        severity: 'high',
        category: 'appi',
        message: 'No privacy policy found',
        recommendation: 'Create privacy policy compliant with APPI',
        reference: 'APPI Article 21',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'APPI-002',
    name: 'Data Handling Records',
    category: 'appi',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for data handling records',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['data-handling', 'records', 'processing-log']);

      if (found) {
        return {
          checkId: 'APPI-002',
          name: 'Data Handling Records',
          status: 'passed',
          severity: 'high',
          category: 'appi',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'APPI-002',
        name: 'Data Handling Records',
        status: 'warning',
        severity: 'high',
        category: 'appi',
        message: 'No data handling records found',
        recommendation: 'Maintain records of data handling activities',
        reference: 'APPI Article 26',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'APPI-003',
    name: 'Cross-Border Transfer Rules',
    category: 'appi',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for cross-border transfer compliance',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['transfer', 'cross-border', 'international']);

      if (found) {
        return {
          checkId: 'APPI-003',
          name: 'Cross-Border Transfer Rules',
          status: 'passed',
          severity: 'high',
          category: 'appi',
          message: 'Cross-border documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'APPI-003',
        name: 'Cross-Border Transfer Rules',
        status: 'warning',
        severity: 'high',
        category: 'appi',
        message: 'No cross-border transfer documentation',
        recommendation: 'Document transfers outside Japan with adequate protection',
        reference: 'APPI Article 28',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'APPI-004',
    name: 'Pseudonymization Support',
    category: 'appi',
    severity: 'medium',
    scoreWeight: 10,
    description: 'Check for pseudonymization capabilities',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['pseudonym', 'anonymize', 'mask']);

      if (found) {
        return {
          checkId: 'APPI-004',
          name: 'Pseudonymization Support',
          status: 'passed',
          severity: 'medium',
          category: 'appi',
          message: 'Pseudonymization documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'APPI-004',
        name: 'Pseudonymization Support',
        status: 'warning',
        severity: 'medium',
        category: 'appi',
        message: 'No pseudonymization documentation',
        recommendation: 'Consider pseudonymization for enhanced data protection',
        reference: 'APPI Article 41',
        scoreImpact: 10,
        canAutoFix: false,
      };
    },
  },
];
