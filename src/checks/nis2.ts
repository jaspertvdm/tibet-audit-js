/**
 * NIS2 Compliance Checks
 *
 * Network and Information Security Directive 2 (EU)
 * Deadline: 18 April 2026 for essential entities
 *
 * "76 dagen. De tsunami komt."
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

function fileContains(filePath: string, keywords: string[]): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    return keywords.some((kw) => content.includes(kw.toLowerCase()));
  } catch {
    return false;
  }
}

// Check for foreign cloud dependencies in config files
function checkForeignCloud(context: ScanContext): { found: boolean; providers: string[] } {
  const foreignProviders = [
    { name: 'AWS', patterns: ['amazonaws.com', 'aws-sdk', 'aws.amazon', 's3.amazonaws'] },
    { name: 'Azure', patterns: ['azure.com', 'microsoft.com', 'azure-sdk', 'blob.core.windows'] },
    { name: 'Google Cloud', patterns: ['googleapis.com', 'google-cloud', 'gcp', 'storage.cloud.google'] },
    { name: 'Cloudflare (US)', patterns: ['cloudflare.com', 'cloudflare-sdk'] },
    { name: 'DigitalOcean', patterns: ['digitalocean.com', 'digitaloceanspaces'] },
    { name: 'Kyndryl/IBM', patterns: ['kyndryl.com', 'ibm.com', 'softlayer'] },
  ];

  const found: string[] = [];

  // Check package.json dependencies
  if (context.packageJson) {
    const deps = JSON.stringify(context.packageJson).toLowerCase();
    for (const provider of foreignProviders) {
      if (provider.patterns.some((p) => deps.includes(p))) {
        found.push(provider.name);
      }
    }
  }

  // Check config files
  const configFiles = context.files.filter((f) => {
    const name = path.basename(f).toLowerCase();
    return (
      name.includes('.env') ||
      name.includes('config') ||
      name.endsWith('.json') ||
      name.endsWith('.yaml') ||
      name.endsWith('.yml')
    );
  });

  for (const file of configFiles.slice(0, 20)) {
    // Limit to prevent slowdown
    try {
      const content = fs.readFileSync(file, 'utf-8').toLowerCase();
      for (const provider of foreignProviders) {
        if (provider.patterns.some((p) => content.includes(p)) && !found.includes(provider.name)) {
          found.push(provider.name);
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return { found: found.length > 0, providers: found };
}

export const NIS2_CHECKS: Check[] = [
  {
    checkId: 'NIS2-001',
    name: 'Risk Management Policy',
    category: 'nis2' as any,
    severity: 'critical',
    scoreWeight: 15,
    description: 'Check for risk management documentation (Article 21)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['risk', 'security-policy', 'isms', 'risk-management']);

      if (found && fileContains(found, ['risk', 'threat', 'vulnerability', 'assessment'])) {
        return {
          checkId: 'NIS2-001',
          name: 'Risk Management Policy',
          status: 'passed',
          severity: 'critical',
          category: 'nis2' as any,
          message: 'Risk management documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-001',
        name: 'Risk Management Policy',
        status: 'failed',
        severity: 'critical',
        category: 'nis2' as any,
        message: 'No risk management policy found',
        recommendation: 'Create risk management policy per NIS2 Article 21',
        reference: 'NIS2 Article 21(2)(a)',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-002',
    name: 'Incident Handling Procedure',
    category: 'nis2' as any,
    severity: 'critical',
    scoreWeight: 15,
    description: 'Check for incident response plan (24h notification)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['incident', 'response', 'breach', 'csirt']);

      if (found) {
        const has24h = fileContains(found, ['24 hour', '24-hour', '24h', 'within 24']);
        if (has24h) {
          return {
            checkId: 'NIS2-002',
            name: 'Incident Handling Procedure',
            status: 'passed',
            severity: 'critical',
            category: 'nis2' as any,
            message: 'Incident handling with 24h notification found',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
        return {
          checkId: 'NIS2-002',
          name: 'Incident Handling Procedure',
          status: 'warning',
          severity: 'critical',
          category: 'nis2' as any,
          message: 'Incident procedure found but no 24h notification mentioned',
          recommendation: 'Update procedure with 24-hour early warning requirement',
          reference: 'NIS2 Article 23(4)(a)',
          scoreImpact: 10,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-002',
        name: 'Incident Handling Procedure',
        status: 'failed',
        severity: 'critical',
        category: 'nis2' as any,
        message: 'No incident handling procedure found',
        recommendation: 'Create incident response plan with 24h CSIRT notification',
        reference: 'NIS2 Article 23',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-003',
    name: 'Supply Chain Security',
    category: 'nis2' as any,
    severity: 'high',
    scoreWeight: 12,
    description: 'Check for supply chain security measures',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['supply-chain', 'vendor', 'third-party', 'supplier']);

      // Also check for package-lock.json or yarn.lock (dependency tracking)
      const hasLockfile = context.files.some((f) => {
        const name = path.basename(f).toLowerCase();
        return name === 'package-lock.json' || name === 'yarn.lock' || name === 'pnpm-lock.yaml';
      });

      if (found) {
        return {
          checkId: 'NIS2-003',
          name: 'Supply Chain Security',
          status: 'passed',
          severity: 'high',
          category: 'nis2' as any,
          message: 'Supply chain security documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      if (hasLockfile) {
        return {
          checkId: 'NIS2-003',
          name: 'Supply Chain Security',
          status: 'warning',
          severity: 'high',
          category: 'nis2' as any,
          message: 'Lockfile found but no supply chain policy',
          recommendation: 'Document supply chain security policy and vendor assessment process',
          reference: 'NIS2 Article 21(2)(d)',
          scoreImpact: 6,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-003',
        name: 'Supply Chain Security',
        status: 'failed',
        severity: 'high',
        category: 'nis2' as any,
        message: 'No supply chain security measures found',
        recommendation: 'Implement supply chain security per NIS2 requirements',
        reference: 'NIS2 Article 21(2)(d)',
        scoreImpact: 12,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-004',
    name: 'Business Continuity',
    category: 'nis2' as any,
    severity: 'high',
    scoreWeight: 12,
    description: 'Check for business continuity / disaster recovery plan',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, [
        'continuity',
        'disaster',
        'recovery',
        'backup',
        'bcp',
        'drp',
      ]);

      if (found) {
        return {
          checkId: 'NIS2-004',
          name: 'Business Continuity',
          status: 'passed',
          severity: 'high',
          category: 'nis2' as any,
          message: 'Business continuity plan found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-004',
        name: 'Business Continuity',
        status: 'failed',
        severity: 'high',
        category: 'nis2' as any,
        message: 'No business continuity plan found',
        recommendation: 'Create BCP/DRP documentation',
        reference: 'NIS2 Article 21(2)(c)',
        scoreImpact: 12,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-005',
    name: 'Access Control Policy',
    category: 'nis2' as any,
    severity: 'high',
    scoreWeight: 10,
    description: 'Check for access control documentation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['access', 'rbac', 'authentication', 'authorization']);

      if (found) {
        return {
          checkId: 'NIS2-005',
          name: 'Access Control Policy',
          status: 'passed',
          severity: 'high',
          category: 'nis2' as any,
          message: 'Access control documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-005',
        name: 'Access Control Policy',
        status: 'warning',
        severity: 'high',
        category: 'nis2' as any,
        message: 'No access control policy found',
        recommendation: 'Document access control and authentication policies',
        reference: 'NIS2 Article 21(2)(i)',
        scoreImpact: 10,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-006',
    name: 'Encryption & Cryptography',
    category: 'nis2' as any,
    severity: 'high',
    scoreWeight: 10,
    description: 'Check for encryption policy and implementation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['encryption', 'crypto', 'tls', 'certificate']);

      // Check for TLS/SSL config
      const hasTlsConfig = context.files.some((f) => {
        const name = path.basename(f).toLowerCase();
        return name.includes('ssl') || name.includes('tls') || name.includes('cert');
      });

      if (found || hasTlsConfig) {
        return {
          checkId: 'NIS2-006',
          name: 'Encryption & Cryptography',
          status: 'passed',
          severity: 'high',
          category: 'nis2' as any,
          message: 'Encryption configuration found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-006',
        name: 'Encryption & Cryptography',
        status: 'warning',
        severity: 'high',
        category: 'nis2' as any,
        message: 'No encryption policy found',
        recommendation: 'Document cryptography policy and ensure TLS configuration',
        reference: 'NIS2 Article 21(2)(h)',
        scoreImpact: 10,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-007',
    name: 'Vulnerability Management',
    category: 'nis2' as any,
    severity: 'high',
    scoreWeight: 10,
    description: 'Check for vulnerability disclosure and handling',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['vulnerability', 'security.md', 'security.txt', 'cve']);

      // Check for security.txt
      const hasSecurityTxt = context.files.some((f) => path.basename(f).toLowerCase() === 'security.txt');

      if (found || hasSecurityTxt) {
        return {
          checkId: 'NIS2-007',
          name: 'Vulnerability Management',
          status: 'passed',
          severity: 'high',
          category: 'nis2' as any,
          message: 'Vulnerability handling documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-007',
        name: 'Vulnerability Management',
        status: 'warning',
        severity: 'high',
        category: 'nis2' as any,
        message: 'No vulnerability management process found',
        recommendation: 'Add security.txt and vulnerability disclosure process',
        reference: 'NIS2 Article 21(2)(e)',
        scoreImpact: 10,
        canAutoFix: true,
        fixAction: {
          description: 'Create security.txt with contact info',
          autoFix: async () => {
            const securityTxt = `Contact: security@example.com
Expires: 2026-12-31T23:59:00.000Z
Preferred-Languages: en, nl
Canonical: https://example.com/.well-known/security.txt
Policy: https://example.com/security-policy

# NIS2 Compliance: Vulnerability Disclosure
# Update contact info and URLs before deploying
`;
            try {
              const wellKnown = path.join(context.scanPath, '.well-known');
              if (!fs.existsSync(wellKnown)) {
                fs.mkdirSync(wellKnown, { recursive: true });
              }
              fs.writeFileSync(path.join(wellKnown, 'security.txt'), securityTxt);
              return true;
            } catch {
              return false;
            }
          },
        },
      };
    },
  },

  {
    checkId: 'NIS2-008',
    name: 'Digital Sovereignty (no-digid)',
    category: 'nis2' as any,
    severity: 'high',
    scoreWeight: 12,
    description: 'Check for foreign cloud dependencies (US CLOUD Act risk)',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const { found, providers } = checkForeignCloud(context);

      if (!found) {
        return {
          checkId: 'NIS2-008',
          name: 'Digital Sovereignty (no-digid)',
          status: 'passed',
          severity: 'high',
          category: 'nis2' as any,
          message: 'No foreign cloud dependencies detected - Sovereign!',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-008',
        name: 'Digital Sovereignty (no-digid)',
        status: 'warning',
        severity: 'high',
        category: 'nis2' as any,
        message: `Foreign cloud detected: ${providers.join(', ')}`,
        recommendation:
          'Consider EU-sovereign alternatives. US CLOUD Act allows foreign access to data.',
        reference: 'NIS2 Recital 79 (supply chain), Schrems II',
        scoreImpact: 12,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-009',
    name: 'Security Awareness Training',
    category: 'nis2' as any,
    severity: 'medium',
    scoreWeight: 8,
    description: 'Check for security training documentation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['training', 'awareness', 'onboarding', 'security-guide']);

      if (found) {
        return {
          checkId: 'NIS2-009',
          name: 'Security Awareness Training',
          status: 'passed',
          severity: 'medium',
          category: 'nis2' as any,
          message: 'Security training documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-009',
        name: 'Security Awareness Training',
        status: 'warning',
        severity: 'medium',
        category: 'nis2' as any,
        message: 'No security awareness training found',
        recommendation: 'Implement cyber hygiene and security training program',
        reference: 'NIS2 Article 21(2)(g)',
        scoreImpact: 8,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'NIS2-010',
    name: 'Asset Management',
    category: 'nis2' as any,
    severity: 'medium',
    scoreWeight: 8,
    description: 'Check for asset inventory',
    run: async (context: ScanContext): Promise<CheckResult> => {
      const found = findFile(context, ['asset', 'inventory', 'cmdb', 'infrastructure']);

      if (found) {
        return {
          checkId: 'NIS2-010',
          name: 'Asset Management',
          status: 'passed',
          severity: 'medium',
          category: 'nis2' as any,
          message: 'Asset management documentation found',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'NIS2-010',
        name: 'Asset Management',
        status: 'warning',
        severity: 'medium',
        category: 'nis2' as any,
        message: 'No asset inventory found',
        recommendation: 'Create and maintain IT asset inventory',
        reference: 'NIS2 Article 21(2)(a) - risk analysis requires asset knowledge',
        scoreImpact: 8,
        canAutoFix: false,
      };
    },
  },
];
