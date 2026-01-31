/**
 * South Korea PIPA Compliance Checks
 *
 * Personal Information Protection Act
 * Note: PIPA has 24-hour breach notification (stricter than GDPR's 72 hours!)
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

export const PIPA_CHECKS: Check[] = [
  {
    checkId: 'PIPA-001',
    name: 'Privacy Officer Designation',
    category: 'pipa',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Check for designated privacy officer (CPO)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['privacy', 'cpo', 'officer']);

      if (found) {
        const content = fs.readFileSync(found, 'utf-8').toLowerCase();
        if (content.includes('officer') || content.includes('cpo') || content.includes('책임자')) {
          return {
            checkId: 'PIPA-001',
            name: 'Privacy Officer Designation',
            status: 'passed',
            severity: 'critical',
            category: 'pipa',
            message: 'Privacy officer information found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      return {
        checkId: 'PIPA-001',
        name: 'Privacy Officer Designation',
        status: 'failed',
        severity: 'critical',
        category: 'pipa',
        message: 'No Chief Privacy Officer (CPO) designation found',
        recommendation: 'Designate and document a Chief Privacy Officer',
        reference: 'PIPA Article 31',
        scoreImpact: 20,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'PIPA-002',
    name: '24-Hour Breach Notification',
    category: 'pipa',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Check for 24-hour breach notification procedure (stricter than GDPR!)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['breach', 'incident', 'notification']);

      if (found) {
        const content = fs.readFileSync(found, 'utf-8').toLowerCase();
        if (content.includes('24') || content.includes('twenty-four')) {
          return {
            checkId: 'PIPA-002',
            name: '24-Hour Breach Notification',
            status: 'passed',
            severity: 'critical',
            category: 'pipa',
            message: '24-hour breach notification procedure found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
        return {
          checkId: 'PIPA-002',
          name: '24-Hour Breach Notification',
          status: 'warning',
          severity: 'critical',
          category: 'pipa',
          message: 'Breach procedure found but 24-hour requirement not explicit',
          recommendation: 'Update to specify 24-hour notification (PIPA requirement)',
          scoreImpact: 10,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'PIPA-002',
        name: '24-Hour Breach Notification',
        status: 'failed',
        severity: 'critical',
        category: 'pipa',
        message: 'No 24-hour breach notification procedure found',
        recommendation: 'Create breach procedure with 24-hour notification (stricter than GDPR!)',
        reference: 'PIPA Article 34',
        scoreImpact: 20,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'PIPA-003',
    name: 'Explicit Consent (Opt-in)',
    category: 'pipa',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for opt-in consent mechanism',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['consent', 'opt-in', 'agreement']);

      if (found) {
        return {
          checkId: 'PIPA-003',
          name: 'Explicit Consent (Opt-in)',
          status: 'passed',
          severity: 'high',
          category: 'pipa',
          message: 'Consent documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'PIPA-003',
        name: 'Explicit Consent (Opt-in)',
        status: 'warning',
        severity: 'high',
        category: 'pipa',
        message: 'No explicit opt-in consent mechanism found',
        recommendation: 'Implement clear opt-in consent (PIPA requires explicit consent)',
        reference: 'PIPA Article 15',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'PIPA-004',
    name: 'Cross-Border Transfer Documentation',
    category: 'pipa',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for cross-border data transfer documentation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['transfer', 'cross-border', 'international']);

      if (found) {
        return {
          checkId: 'PIPA-004',
          name: 'Cross-Border Transfer Documentation',
          status: 'passed',
          severity: 'high',
          category: 'pipa',
          message: 'Cross-border transfer documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'PIPA-004',
        name: 'Cross-Border Transfer Documentation',
        status: 'warning',
        severity: 'high',
        category: 'pipa',
        message: 'No cross-border transfer documentation found',
        recommendation: 'Document data transfers outside South Korea',
        reference: 'PIPA Article 17',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },
];
