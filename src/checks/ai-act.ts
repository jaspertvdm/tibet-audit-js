/**
 * EU AI Act Compliance Checks
 *
 * Regulation on Artificial Intelligence
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

/**
 * Check if project uses AI libraries
 */
function hasAILibraries(context: ScanContext): boolean {
  const aiLibs = [
    'openai',
    '@anthropic-ai/sdk',
    'anthropic',
    '@google/generative-ai',
    'langchain',
    '@langchain/core',
    'llamaindex',
    'transformers',
    'tensorflow',
    '@tensorflow/tfjs',
    'onnxruntime',
    'ml5',
    'brain.js',
  ];
  return hasDependency(context, aiLibs);
}

export const AI_ACT_CHECKS: Check[] = [
  {
    checkId: 'AIACT-001',
    name: 'AI Decision Audit Trail',
    category: 'ai_act',
    severity: 'critical',
    scoreWeight: 20,
    description: 'Check for AI decision logging/audit trail',
    run: async (context: ScanContext): Promise<CheckResult> => {
      // Check if project uses AI
      if (!hasAILibraries(context)) {
        return {
          checkId: 'AIACT-001',
          name: 'AI Decision Audit Trail',
          status: 'skipped',
          severity: 'critical',
          category: 'ai_act',
          message: 'No AI libraries detected',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      // Look for audit/logging files
      const found = findFile(context, [
        'audit',
        'ai-log',
        'decision-log',
        'ml-audit',
        'inference-log',
      ]);

      if (found) {
        return {
          checkId: 'AIACT-001',
          name: 'AI Decision Audit Trail',
          status: 'passed',
          severity: 'critical',
          category: 'ai_act',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      // Check for logging libraries
      const loggingLibs = ['winston', 'pino', 'bunyan', 'log4js', 'tibet-vault'];
      if (hasDependency(context, loggingLibs)) {
        return {
          checkId: 'AIACT-001',
          name: 'AI Decision Audit Trail',
          status: 'warning',
          severity: 'critical',
          category: 'ai_act',
          message: 'Logging library found, but no AI-specific audit trail detected',
          recommendation: 'Implement AI decision logging with tibet-vault for provenance',
          scoreImpact: 10,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'AIACT-001',
        name: 'AI Decision Audit Trail',
        status: 'failed',
        severity: 'critical',
        category: 'ai_act',
        message: 'No AI decision audit trail found',
        recommendation: 'Implement logging for AI decisions (npm: tibet-vault)',
        reference: 'EU AI Act Article 12 - Record-keeping',
        scoreImpact: 20,
        canAutoFix: true,
        fixAction: {
          description: 'Create AI audit trail template',
          autoFix: async () => {
            const template = `# AI Decision Audit Trail

## Purpose
This document describes the logging requirements for AI decisions per EU AI Act.

## What to Log
- Input data (anonymized)
- Model version and parameters
- Output/decision
- Timestamp
- User context (if applicable)
- Confidence scores

## Implementation
\`\`\`javascript
// Example using tibet-vault
import { createToken } from 'tibet-vault';

async function logAIDecision(input, output, modelInfo) {
  await createToken({
    type: 'ai_decision',
    erin: { input: hash(input), output, model: modelInfo },
    erachter: 'AI inference for user request',
    actor: 'ai_system'
  });
}
\`\`\`

## Retention
AI decision logs must be retained for the lifetime of the AI system plus 10 years.

Last updated: ${new Date().toISOString().split('T')[0]}
`;
            fs.writeFileSync(path.join(context.scanPath, 'AI-AUDIT-TRAIL.md'), template);
            return true;
          },
        },
      };
    },
  },

  {
    checkId: 'AIACT-002',
    name: 'Human Oversight Mechanism',
    category: 'ai_act',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for human oversight in AI decisions',
    run: async (context: ScanContext): Promise<CheckResult> => {
      if (!hasAILibraries(context)) {
        return {
          checkId: 'AIACT-002',
          name: 'Human Oversight Mechanism',
          status: 'skipped',
          severity: 'high',
          category: 'ai_act',
          message: 'No AI libraries detected',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      // Look for human-in-the-loop patterns
      const found = findFile(context, [
        'review',
        'approval',
        'human-oversight',
        'hitl',
        'moderation',
      ]);

      if (found) {
        return {
          checkId: 'AIACT-002',
          name: 'Human Oversight Mechanism',
          status: 'passed',
          severity: 'high',
          category: 'ai_act',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'AIACT-002',
        name: 'Human Oversight Mechanism',
        status: 'warning',
        severity: 'high',
        category: 'ai_act',
        message: 'No human oversight mechanism detected',
        recommendation: 'Implement human review for high-risk AI decisions',
        reference: 'EU AI Act Article 14 - Human oversight',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'AIACT-003',
    name: 'AI Transparency Notice',
    category: 'ai_act',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for AI transparency/disclosure',
    run: async (context: ScanContext): Promise<CheckResult> => {
      if (!hasAILibraries(context)) {
        return {
          checkId: 'AIACT-003',
          name: 'AI Transparency Notice',
          status: 'skipped',
          severity: 'high',
          category: 'ai_act',
          message: 'No AI libraries detected',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      // Check for transparency documentation
      const found = findFile(context, [
        'ai-disclosure',
        'transparency',
        'model-card',
        'ai-notice',
      ]);

      // Also check README
      const readme = findFile(context, ['readme']);
      if (readme) {
        const content = fs.readFileSync(readme, 'utf-8').toLowerCase();
        if (content.includes('ai') && (content.includes('powered by') || content.includes('uses'))) {
          return {
            checkId: 'AIACT-003',
            name: 'AI Transparency Notice',
            status: 'passed',
            severity: 'high',
            category: 'ai_act',
            message: 'AI disclosure found in README',
            scoreImpact: 0,
            canAutoFix: false,
          };
        }
      }

      if (found) {
        return {
          checkId: 'AIACT-003',
          name: 'AI Transparency Notice',
          status: 'passed',
          severity: 'high',
          category: 'ai_act',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'AIACT-003',
        name: 'AI Transparency Notice',
        status: 'warning',
        severity: 'high',
        category: 'ai_act',
        message: 'No AI transparency notice found',
        recommendation: 'Add AI disclosure to README or create MODEL-CARD.md',
        reference: 'EU AI Act Article 13 - Transparency',
        scoreImpact: 15,
        canAutoFix: false,
      };
    },
  },

  {
    checkId: 'AIACT-004',
    name: 'AI Risk Assessment',
    category: 'ai_act',
    severity: 'high',
    scoreWeight: 15,
    description: 'Check for AI risk assessment documentation',
    run: async (context: ScanContext): Promise<CheckResult> => {
      if (!hasAILibraries(context)) {
        return {
          checkId: 'AIACT-004',
          name: 'AI Risk Assessment',
          status: 'skipped',
          severity: 'high',
          category: 'ai_act',
          message: 'No AI libraries detected',
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      const found = findFile(context, [
        'risk-assessment',
        'ai-risk',
        'impact-assessment',
        'pia',
        'dpia',
      ]);

      if (found) {
        return {
          checkId: 'AIACT-004',
          name: 'AI Risk Assessment',
          status: 'passed',
          severity: 'high',
          category: 'ai_act',
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false,
        };
      }

      return {
        checkId: 'AIACT-004',
        name: 'AI Risk Assessment',
        status: 'failed',
        severity: 'high',
        category: 'ai_act',
        message: 'No AI risk assessment found',
        recommendation: 'Create AI risk assessment document',
        reference: 'EU AI Act Article 9 - Risk management system',
        scoreImpact: 15,
        canAutoFix: true,
        fixAction: {
          description: 'Create AI risk assessment template',
          autoFix: async () => {
            const template = `# AI Risk Assessment

## System Overview
- **Name**: [AI System Name]
- **Purpose**: [What the AI does]
- **Risk Category**: [ ] Minimal [ ] Limited [ ] High [ ] Unacceptable

## Risk Classification (EU AI Act)
### High-Risk Indicators
- [ ] Biometric identification
- [ ] Critical infrastructure
- [ ] Education/vocational training
- [ ] Employment decisions
- [ ] Essential services access
- [ ] Law enforcement
- [ ] Migration/asylum

## Identified Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | Low/Med/High | Low/Med/High | [Mitigation] |

## Mitigation Measures
1. [Measure 1]
2. [Measure 2]

## Review Schedule
- Next review: [Date]
- Reviewed by: [Name]

Last updated: ${new Date().toISOString().split('T')[0]}
`;
            fs.writeFileSync(path.join(context.scanPath, 'AI-RISK-ASSESSMENT.md'), template);
            return true;
          },
        },
      };
    },
  },
];
