/**
 * Singapore PDPA Compliance Checks
 *
 * Personal Data Protection Act
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

export const PDPA_CHECKS: Check[] = [
  {
    checkId: 'PDPA-001',
    name: 'Consent Obligation',
    category: 'pdpa',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for consent mechanism',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['consent', 'agreement', 'terms']);

      if (found) {
        return {
          checkId: 'PDPA-001',
          name: 'Consent Obligation',
          status: 'passed',
          severity: 'high',
          category: 'pdpa',
          message: 'Consent documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'PDPA-001',
        name: 'Consent Obligation',
        status: 'warning',
        severity: 'high',
        category: 'pdpa',
        message: 'No consent mechanism found',
        recommendation: 'Implement clear consent mechanism',
        reference: 'PDPA Part IV',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'PDPA-002',
    name: 'Data Protection Officer',
    category: 'pdpa',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for DPO designation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['dpo', 'officer', 'privacy']);

      if (found) {
        const content = fs.readFileSync(found, 'utf-8').toLowerCase();
        if (content.includes('officer') || content.includes('dpo')) {
          return {
            checkId: 'PDPA-002',
            name: 'Data Protection Officer',
            status: 'passed',
            severity: 'high',
            category: 'pdpa',
            message: 'DPO information found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      return {
        checkId: 'PDPA-002',
        name: 'Data Protection Officer',
        status: 'warning',
        severity: 'high',
        category: 'pdpa',
        message: 'No DPO designation found',
        recommendation: 'Designate a Data Protection Officer',
        reference: 'PDPA Section 11(3)',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'PDPA-003',
    name: '3-Day Breach Notification',
    category: 'pdpa',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Check for 3-day breach notification procedure',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['breach', 'incident', 'notification']);

      if (found) {
        const content = fs.readFileSync(found, 'utf-8').toLowerCase();
        if (content.includes('3 day') || content.includes('three day') || content.includes('72')) {
          return {
            checkId: 'PDPA-003',
            name: '3-Day Breach Notification',
            status: 'passed',
            severity: 'critical',
            category: 'pdpa',
            message: 'Breach notification with timeline found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      return {
        checkId: 'PDPA-003',
        name: '3-Day Breach Notification',
        status: 'failed',
        severity: 'critical',
        category: 'pdpa',
        message: 'No 3-day breach notification procedure',
        recommendation: 'Create breach procedure with 3-day notification to PDPC',
        reference: 'PDPA Section 26D',
        scoreImpact: 20,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'PDPA-004',
    name: 'Do Not Call Compliance',
    category: 'pdpa',
    severity: 'medium',
    scoreWeight: 10,
    description: 'Check for DNC registry compliance',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['dnc', 'do-not-call', 'marketing']);

      if (found) {
        return {
          checkId: 'PDPA-004',
          name: 'Do Not Call Compliance',
          status: 'passed',
          severity: 'medium',
          category: 'pdpa',
          message: 'DNC compliance documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'PDPA-004',
        name: 'Do Not Call Compliance',
        status: 'warning',
        severity: 'medium',
        category: 'pdpa',
        message: 'No DNC registry compliance found',
        recommendation: 'Check Singapore DNC registry before marketing calls',
        reference: 'PDPA Part IX',
        scoreImpact: 10,
        canAutoFix: false,
      };
    },
  },
];
