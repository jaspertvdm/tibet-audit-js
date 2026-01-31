/**
 * GDPR Compliance Checks
 *
 * EU General Data Protection Regulation
 */

import * as fs from 'fs';
import * as path from 'path';
import { Check, ScanContext, CheckResult } from '../types';

/**
 * Helper to check if file exists with common names
 */
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

/**
 * Helper to check package.json for dependency
 */
function hasDependency(context: ScanContext, names: string[]): boolean {
  if (!context.packageJson) return false;
  const deps = {
    ...(context.packageJson.dependencies as Record<string, string> || {}),
    ...(context.packageJson.devDependencies as Record<string, string> || {}),
  };
  return names.some((name) => name in deps);
}

export const GDPR_CHECKS: Check[] = [
  {
    checkId: 'GDPR-001',
    name: 'Privacy Policy Document',
    category: 'gdpr',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for privacy policy document',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, [
        'privacy',
        'privacy-policy',
        'privacypolicy',
        'gdpr',
        'datenschutz',
      ]);

      if (found) {
        return {
          checkId: 'GDPR-001',
          name: 'Privacy Policy Document',
          status: 'passed',
          severity: 'high',
          category: 'gdpr',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'GDPR-001',
        name: 'Privacy Policy Document',
        status: 'failed',
        severity: 'high',
        category: 'gdpr',
        message: 'No privacy policy document found',
        recommendation: 'Create a PRIVACY.md or privacy-policy.md file',
        reference: 'GDPR Article 13 & 14',
        scoreImpact: 15,
        canAutoFix: true,
        fixAction: {
          description: 'Create privacy policy template',
          autoFix: async () => {
            const template = `# Privacy Policy

## Data Controller
[Your Company Name]

## What Data We Collect
- [List data types]

## Why We Collect It
- [Legal basis under GDPR]

## Your Rights
Under GDPR, you have the right to:
- Access your data
- Rectify inaccurate data
- Erase your data ("right to be forgotten")
- Restrict processing
- Data portability
- Object to processing

## Contact
[DPO contact information]

## Updates
Last updated: ${new Date().toISOString().split('T')[0]}
`;
            fs.writeFileSync(path.join(context.scanPath, 'PRIVACY.md'), template);
            return true;
          },
        },
      };
    },
  },

  {
    checkId: 'GDPR-002',
    name: 'Data Retention Policy',
    category: 'gdpr',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for data retention policy',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, [
        'retention',
        'data-retention',
        'dataretention',
      ]);

      // Also check privacy policy for retention section
      const privacyFile = findFile(context, ['privacy', 'gdpr']);
      if (privacyFile) {
        const content = fs.readFileSync(privacyFile, 'utf-8').toLowerCase();
        if (content.includes('retention') || content.includes('how long')) {
          return {
            checkId: 'GDPR-002',
            name: 'Data Retention Policy',
            status: 'passed',
            severity: 'high',
            category: 'gdpr',
            message: 'Retention policy found in privacy document',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      if (found) {
        return {
          checkId: 'GDPR-002',
          name: 'Data Retention Policy',
          status: 'passed',
          severity: 'high',
          category: 'gdpr',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'GDPR-002',
        name: 'Data Retention Policy',
        status: 'failed',
        severity: 'high',
        category: 'gdpr',
        message: 'No data retention policy found',
        recommendation: 'Add data retention section to privacy policy',
        reference: 'GDPR Article 5(1)(e)',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'GDPR-003',
    name: 'Breach Notification Procedure',
    category: 'gdpr',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Check for data breach notification procedure (72 hours)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, [
        'breach',
        'incident',
        'security-incident',
        'data-breach',
      ]);

      if (found) {
        return {
          checkId: 'GDPR-003',
          name: 'Breach Notification Procedure',
          status: 'passed',
          severity: 'critical',
          category: 'gdpr',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'GDPR-003',
        name: 'Breach Notification Procedure',
        status: 'failed',
        severity: 'critical',
        category: 'gdpr',
        message: 'No breach notification procedure found',
        recommendation: 'Create incident response plan (GDPR requires 72-hour notification)',
        reference: 'GDPR Article 33 & 34',
        scoreImpact: 20,
        canAutoFix: true,
        fixAction: {
          description: 'Create breach notification template',
          autoFix: async () => {
            const template = `# Data Breach Response Procedure

## GDPR Requirement
Notify supervisory authority within **72 hours** of becoming aware of a breach.

## Steps
1. **Detect** - Identify the breach
2. **Contain** - Stop further data loss
3. **Assess** - Determine scope and impact
4. **Notify** - Inform authorities (72h) and affected individuals
5. **Document** - Record all actions taken
6. **Review** - Prevent future occurrences

## Notification Checklist
- [ ] Nature of the breach
- [ ] Categories of data affected
- [ ] Approximate number of individuals affected
- [ ] Contact details of DPO
- [ ] Likely consequences
- [ ] Measures taken to address the breach

## Contacts
- DPO: [email]
- Supervisory Authority: [authority contact]
- Legal Team: [contact]

Last updated: ${new Date().toISOString().split('T')[0]}
`;
            fs.writeFileSync(path.join(context.scanPath, 'BREACH-PROCEDURE.md'), template);
            return true;
          },
        },
      };
    },
  },

  {
    checkId: 'GDPR-004',
    name: 'Consent Management',
    category: 'gdpr',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for consent management implementation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      // Check for consent libraries in package.json
      const consentLibs = [
        'cookieconsent',
        'cookie-consent',
        'gdpr-cookie',
        'tarteaucitron',
        'klaro',
        'onetrust',
        'cookiebot',
        'consent-manager',
      ];

      if (hasDependency(context, consentLibs)) {
        return {
          checkId: 'GDPR-004',
          name: 'Consent Management',
          status: 'passed',
          severity: 'high',
          category: 'gdpr',
          message: 'Consent management library found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      // Check for consent-related files
      const found = findFile(context, ['consent', 'cookie']);
      if (found) {
        return {
          checkId: 'GDPR-004',
          name: 'Consent Management',
          status: 'passed',
          severity: 'high',
          category: 'gdpr',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'GDPR-004',
        name: 'Consent Management',
        status: 'warning',
        severity: 'high',
        category: 'gdpr',
        message: 'No consent management detected',
        recommendation: 'Implement cookie consent banner (npm: cookieconsent, klaro)',
        reference: 'GDPR Article 7',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'GDPR-005',
    name: 'DPO Contact Information',
    category: 'gdpr',
    severity: 'medium',
    scoreWeight: 10,
    description: 'Check for Data Protection Officer contact',
    run: async (context: ScanContext): Promise<CheckResult> => {
      // Check privacy policy for DPO
      const privacyFile = findFile(context, ['privacy', 'gdpr']);
      if (privacyFile) {
        const content = fs.readFileSync(privacyFile, 'utf-8').toLowerCase();
        if (
          content.includes('dpo') ||
          content.includes('data protection officer') ||
          content.includes('datenschutzbeauftragter')
        ) {
          return {
            checkId: 'GDPR-005',
            name: 'DPO Contact Information',
            status: 'passed',
            severity: 'medium',
            category: 'gdpr',
            message: 'DPO information found in privacy policy',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      return {
        checkId: 'GDPR-005',
        name: 'DPO Contact Information',
        status: 'warning',
        severity: 'medium',
        category: 'gdpr',
        message: 'No DPO contact information found',
        recommendation: 'Add DPO contact to privacy policy',
        reference: 'GDPR Article 37-39',
        scoreImpact: 10,
        canAutoFix: false,
      };
    },
  },
];
