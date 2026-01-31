/**
 * Brazil LGPD Compliance Checks
 *
 * Lei Geral de Proteção de Dados
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

export const LGPD_CHECKS: Check[] = [
  {
    checkId: 'LGPD-001',
    name: 'Legal Basis for Processing',
    category: 'lgpd',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for documented legal basis',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['legal-basis', 'privacy', 'lgpd']);

      if (found) {
        const content = fs.readFileSync(found, 'utf-8').toLowerCase();
        if (content.includes('legal basis') || content.includes('base legal') || content.includes('consent')) {
          return {
            checkId: 'LGPD-001',
            name: 'Legal Basis for Processing',
            status: 'passed',
            severity: 'high',
            category: 'lgpd',
            message: 'Legal basis documentation found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      return {
        checkId: 'LGPD-001',
        name: 'Legal Basis for Processing',
        status: 'warning',
        severity: 'high',
        category: 'lgpd',
        message: 'No documented legal basis for processing',
        recommendation: 'Document legal basis per LGPD Article 7',
        reference: 'LGPD Article 7',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'LGPD-002',
    name: 'Encarregado (DPO)',
    category: 'lgpd',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for Encarregado/DPO designation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['dpo', 'encarregado', 'officer', 'privacy']);

      if (found) {
        const content = fs.readFileSync(found, 'utf-8').toLowerCase();
        if (content.includes('encarregado') || content.includes('dpo') || content.includes('officer')) {
          return {
            checkId: 'LGPD-002',
            name: 'Encarregado (DPO)',
            status: 'passed',
            severity: 'high',
            category: 'lgpd',
            message: 'Encarregado designation found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      return {
        checkId: 'LGPD-002',
        name: 'Encarregado (DPO)',
        status: 'warning',
        severity: 'high',
        category: 'lgpd',
        message: 'No Encarregado (DPO) designation found',
        recommendation: 'Designate an Encarregado (Data Protection Officer)',
        reference: 'LGPD Article 41',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'LGPD-003',
    name: 'Data Subject Rights (ARCO)',
    category: 'lgpd',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for ARCO rights implementation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['rights', 'arco', 'subject-rights']);

      if (found) {
        return {
          checkId: 'LGPD-003',
          name: 'Data Subject Rights (ARCO)',
          status: 'passed',
          severity: 'high',
          category: 'lgpd',
          message: 'Data subject rights documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'LGPD-003',
        name: 'Data Subject Rights (ARCO)',
        status: 'warning',
        severity: 'high',
        category: 'lgpd',
        message: 'No ARCO rights implementation found',
        recommendation: 'Implement Access, Rectification, Cancellation, Opposition rights',
        reference: 'LGPD Article 18',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'LGPD-004',
    name: 'Breach Notification',
    category: 'lgpd',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Check for breach notification procedure',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['breach', 'incident', 'notification']);

      if (found) {
        return {
          checkId: 'LGPD-004',
          name: 'Breach Notification',
          status: 'passed',
          severity: 'critical',
          category: 'lgpd',
          message: 'Breach notification procedure found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'LGPD-004',
        name: 'Breach Notification',
        status: 'failed',
        severity: 'critical',
        category: 'lgpd',
        message: 'No breach notification procedure',
        recommendation: 'Create breach notification procedure for ANPD',
        reference: 'LGPD Article 48',
        scoreImpact: 20,
        canAutoFix: false,
      };
    },
  },
];
