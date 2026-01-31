"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AI_ACT_CHECKS: () => AI_ACT_CHECKS,
  ALL_CHECKS: () => ALL_CHECKS,
  APPI_CHECKS: () => APPI_CHECKS,
  GDPR_CHECKS: () => GDPR_CHECKS,
  JIS_CHECKS: () => JIS_CHECKS,
  LGPD_CHECKS: () => LGPD_CHECKS,
  NIS2_CHECKS: () => NIS2_CHECKS,
  PDPA_CHECKS: () => PDPA_CHECKS,
  PIPA_CHECKS: () => PIPA_CHECKS,
  VERSION: () => VERSION,
  applyFixes: () => applyFixes,
  getFixableIssues: () => getFixableIssues,
  scan: () => scan
});
module.exports = __toCommonJS(index_exports);

// src/scanner.ts
var fs7 = __toESM(require("fs"));
var path9 = __toESM(require("path"));
var crypto = __toESM(require("crypto"));

// src/checks/gdpr.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
function findFile(context, patterns) {
  for (const file of context.files) {
    const basename9 = path.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
function hasDependency(context, names) {
  if (!context.packageJson) return false;
  const deps = {
    ...context.packageJson.dependencies || {},
    ...context.packageJson.devDependencies || {}
  };
  return names.some((name) => name in deps);
}
var GDPR_CHECKS = [
  {
    checkId: "GDPR-001",
    name: "Privacy Policy Document",
    category: "gdpr",
    severity: "high",
    scoreWeight: 15,
    description: "Check for privacy policy document",
    run: async (context) => {
      const found = findFile(context, [
        "privacy",
        "privacy-policy",
        "privacypolicy",
        "gdpr",
        "datenschutz"
      ]);
      if (found) {
        return {
          checkId: "GDPR-001",
          name: "Privacy Policy Document",
          status: "passed",
          severity: "high",
          category: "gdpr",
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "GDPR-001",
        name: "Privacy Policy Document",
        status: "failed",
        severity: "high",
        category: "gdpr",
        message: "No privacy policy document found",
        recommendation: "Create a PRIVACY.md or privacy-policy.md file",
        reference: "GDPR Article 13 & 14",
        scoreImpact: 15,
        canAutoFix: true,
        fixAction: {
          description: "Create privacy policy template",
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
Last updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
`;
            fs.writeFileSync(path.join(context.scanPath, "PRIVACY.md"), template);
            return true;
          }
        }
      };
    }
  },
  {
    checkId: "GDPR-002",
    name: "Data Retention Policy",
    category: "gdpr",
    severity: "high",
    scoreWeight: 15,
    description: "Check for data retention policy",
    run: async (context) => {
      const found = findFile(context, [
        "retention",
        "data-retention",
        "dataretention"
      ]);
      const privacyFile = findFile(context, ["privacy", "gdpr"]);
      if (privacyFile) {
        const content = fs.readFileSync(privacyFile, "utf-8").toLowerCase();
        if (content.includes("retention") || content.includes("how long")) {
          return {
            checkId: "GDPR-002",
            name: "Data Retention Policy",
            status: "passed",
            severity: "high",
            category: "gdpr",
            message: "Retention policy found in privacy document",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      if (found) {
        return {
          checkId: "GDPR-002",
          name: "Data Retention Policy",
          status: "passed",
          severity: "high",
          category: "gdpr",
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "GDPR-002",
        name: "Data Retention Policy",
        status: "failed",
        severity: "high",
        category: "gdpr",
        message: "No data retention policy found",
        recommendation: "Add data retention section to privacy policy",
        reference: "GDPR Article 5(1)(e)",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "GDPR-003",
    name: "Breach Notification Procedure",
    category: "gdpr",
    severity: "critical",
    scoreWeight: 20,
    description: "Check for data breach notification procedure (72 hours)",
    run: async (context) => {
      const found = findFile(context, [
        "breach",
        "incident",
        "security-incident",
        "data-breach"
      ]);
      if (found) {
        return {
          checkId: "GDPR-003",
          name: "Breach Notification Procedure",
          status: "passed",
          severity: "critical",
          category: "gdpr",
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "GDPR-003",
        name: "Breach Notification Procedure",
        status: "failed",
        severity: "critical",
        category: "gdpr",
        message: "No breach notification procedure found",
        recommendation: "Create incident response plan (GDPR requires 72-hour notification)",
        reference: "GDPR Article 33 & 34",
        scoreImpact: 20,
        canAutoFix: true,
        fixAction: {
          description: "Create breach notification template",
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

Last updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
`;
            fs.writeFileSync(path.join(context.scanPath, "BREACH-PROCEDURE.md"), template);
            return true;
          }
        }
      };
    }
  },
  {
    checkId: "GDPR-004",
    name: "Consent Management",
    category: "gdpr",
    severity: "high",
    scoreWeight: 15,
    description: "Check for consent management implementation",
    run: async (context) => {
      const consentLibs = [
        "cookieconsent",
        "cookie-consent",
        "gdpr-cookie",
        "tarteaucitron",
        "klaro",
        "onetrust",
        "cookiebot",
        "consent-manager"
      ];
      if (hasDependency(context, consentLibs)) {
        return {
          checkId: "GDPR-004",
          name: "Consent Management",
          status: "passed",
          severity: "high",
          category: "gdpr",
          message: "Consent management library found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile(context, ["consent", "cookie"]);
      if (found) {
        return {
          checkId: "GDPR-004",
          name: "Consent Management",
          status: "passed",
          severity: "high",
          category: "gdpr",
          message: `Found: ${path.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "GDPR-004",
        name: "Consent Management",
        status: "warning",
        severity: "high",
        category: "gdpr",
        message: "No consent management detected",
        recommendation: "Implement cookie consent banner (npm: cookieconsent, klaro)",
        reference: "GDPR Article 7",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "GDPR-005",
    name: "DPO Contact Information",
    category: "gdpr",
    severity: "medium",
    scoreWeight: 10,
    description: "Check for Data Protection Officer contact",
    run: async (context) => {
      const privacyFile = findFile(context, ["privacy", "gdpr"]);
      if (privacyFile) {
        const content = fs.readFileSync(privacyFile, "utf-8").toLowerCase();
        if (content.includes("dpo") || content.includes("data protection officer") || content.includes("datenschutzbeauftragter")) {
          return {
            checkId: "GDPR-005",
            name: "DPO Contact Information",
            status: "passed",
            severity: "medium",
            category: "gdpr",
            message: "DPO information found in privacy policy",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      return {
        checkId: "GDPR-005",
        name: "DPO Contact Information",
        status: "warning",
        severity: "medium",
        category: "gdpr",
        message: "No DPO contact information found",
        recommendation: "Add DPO contact to privacy policy",
        reference: "GDPR Article 37-39",
        scoreImpact: 10,
        canAutoFix: false
      };
    }
  }
];

// src/checks/ai-act.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
function findFile2(context, patterns) {
  for (const file of context.files) {
    const basename9 = path2.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
function hasDependency2(context, names) {
  if (!context.packageJson) return false;
  const deps = {
    ...context.packageJson.dependencies || {},
    ...context.packageJson.devDependencies || {}
  };
  return names.some((name) => name in deps);
}
function hasAILibraries(context) {
  const aiLibs = [
    "openai",
    "@anthropic-ai/sdk",
    "anthropic",
    "@google/generative-ai",
    "langchain",
    "@langchain/core",
    "llamaindex",
    "transformers",
    "tensorflow",
    "@tensorflow/tfjs",
    "onnxruntime",
    "ml5",
    "brain.js"
  ];
  return hasDependency2(context, aiLibs);
}
var AI_ACT_CHECKS = [
  {
    checkId: "AIACT-001",
    name: "AI Decision Audit Trail",
    category: "ai_act",
    severity: "critical",
    scoreWeight: 20,
    description: "Check for AI decision logging/audit trail",
    run: async (context) => {
      if (!hasAILibraries(context)) {
        return {
          checkId: "AIACT-001",
          name: "AI Decision Audit Trail",
          status: "skipped",
          severity: "critical",
          category: "ai_act",
          message: "No AI libraries detected",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile2(context, [
        "audit",
        "ai-log",
        "decision-log",
        "ml-audit",
        "inference-log"
      ]);
      if (found) {
        return {
          checkId: "AIACT-001",
          name: "AI Decision Audit Trail",
          status: "passed",
          severity: "critical",
          category: "ai_act",
          message: `Found: ${path2.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const loggingLibs = ["winston", "pino", "bunyan", "log4js", "tibet-vault"];
      if (hasDependency2(context, loggingLibs)) {
        return {
          checkId: "AIACT-001",
          name: "AI Decision Audit Trail",
          status: "warning",
          severity: "critical",
          category: "ai_act",
          message: "Logging library found, but no AI-specific audit trail detected",
          recommendation: "Implement AI decision logging with tibet-vault for provenance",
          scoreImpact: 10,
          canAutoFix: false
        };
      }
      return {
        checkId: "AIACT-001",
        name: "AI Decision Audit Trail",
        status: "failed",
        severity: "critical",
        category: "ai_act",
        message: "No AI decision audit trail found",
        recommendation: "Implement logging for AI decisions (npm: tibet-vault)",
        reference: "EU AI Act Article 12 - Record-keeping",
        scoreImpact: 20,
        canAutoFix: true,
        fixAction: {
          description: "Create AI audit trail template",
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

Last updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
`;
            fs2.writeFileSync(path2.join(context.scanPath, "AI-AUDIT-TRAIL.md"), template);
            return true;
          }
        }
      };
    }
  },
  {
    checkId: "AIACT-002",
    name: "Human Oversight Mechanism",
    category: "ai_act",
    severity: "high",
    scoreWeight: 15,
    description: "Check for human oversight in AI decisions",
    run: async (context) => {
      if (!hasAILibraries(context)) {
        return {
          checkId: "AIACT-002",
          name: "Human Oversight Mechanism",
          status: "skipped",
          severity: "high",
          category: "ai_act",
          message: "No AI libraries detected",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile2(context, [
        "review",
        "approval",
        "human-oversight",
        "hitl",
        "moderation"
      ]);
      if (found) {
        return {
          checkId: "AIACT-002",
          name: "Human Oversight Mechanism",
          status: "passed",
          severity: "high",
          category: "ai_act",
          message: `Found: ${path2.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "AIACT-002",
        name: "Human Oversight Mechanism",
        status: "warning",
        severity: "high",
        category: "ai_act",
        message: "No human oversight mechanism detected",
        recommendation: "Implement human review for high-risk AI decisions",
        reference: "EU AI Act Article 14 - Human oversight",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "AIACT-003",
    name: "AI Transparency Notice",
    category: "ai_act",
    severity: "high",
    scoreWeight: 15,
    description: "Check for AI transparency/disclosure",
    run: async (context) => {
      if (!hasAILibraries(context)) {
        return {
          checkId: "AIACT-003",
          name: "AI Transparency Notice",
          status: "skipped",
          severity: "high",
          category: "ai_act",
          message: "No AI libraries detected",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile2(context, [
        "ai-disclosure",
        "transparency",
        "model-card",
        "ai-notice"
      ]);
      const readme = findFile2(context, ["readme"]);
      if (readme) {
        const content = fs2.readFileSync(readme, "utf-8").toLowerCase();
        if (content.includes("ai") && (content.includes("powered by") || content.includes("uses"))) {
          return {
            checkId: "AIACT-003",
            name: "AI Transparency Notice",
            status: "passed",
            severity: "high",
            category: "ai_act",
            message: "AI disclosure found in README",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      if (found) {
        return {
          checkId: "AIACT-003",
          name: "AI Transparency Notice",
          status: "passed",
          severity: "high",
          category: "ai_act",
          message: `Found: ${path2.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "AIACT-003",
        name: "AI Transparency Notice",
        status: "warning",
        severity: "high",
        category: "ai_act",
        message: "No AI transparency notice found",
        recommendation: "Add AI disclosure to README or create MODEL-CARD.md",
        reference: "EU AI Act Article 13 - Transparency",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "AIACT-004",
    name: "AI Risk Assessment",
    category: "ai_act",
    severity: "high",
    scoreWeight: 15,
    description: "Check for AI risk assessment documentation",
    run: async (context) => {
      if (!hasAILibraries(context)) {
        return {
          checkId: "AIACT-004",
          name: "AI Risk Assessment",
          status: "skipped",
          severity: "high",
          category: "ai_act",
          message: "No AI libraries detected",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile2(context, [
        "risk-assessment",
        "ai-risk",
        "impact-assessment",
        "pia",
        "dpia"
      ]);
      if (found) {
        return {
          checkId: "AIACT-004",
          name: "AI Risk Assessment",
          status: "passed",
          severity: "high",
          category: "ai_act",
          message: `Found: ${path2.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "AIACT-004",
        name: "AI Risk Assessment",
        status: "failed",
        severity: "high",
        category: "ai_act",
        message: "No AI risk assessment found",
        recommendation: "Create AI risk assessment document",
        reference: "EU AI Act Article 9 - Risk management system",
        scoreImpact: 15,
        canAutoFix: true,
        fixAction: {
          description: "Create AI risk assessment template",
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

Last updated: ${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}
`;
            fs2.writeFileSync(path2.join(context.scanPath, "AI-RISK-ASSESSMENT.md"), template);
            return true;
          }
        }
      };
    }
  }
];

// src/checks/nis2.ts
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
function findFile3(context, patterns) {
  for (const file of context.files) {
    const basename9 = path3.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
function fileContains(filePath, keywords) {
  try {
    const content = fs3.readFileSync(filePath, "utf-8").toLowerCase();
    return keywords.some((kw) => content.includes(kw.toLowerCase()));
  } catch {
    return false;
  }
}
function checkForeignCloud(context) {
  const foreignProviders = [
    { name: "AWS", patterns: ["amazonaws.com", "aws-sdk", "aws.amazon", "s3.amazonaws"] },
    { name: "Azure", patterns: ["azure.com", "microsoft.com", "azure-sdk", "blob.core.windows"] },
    { name: "Google Cloud", patterns: ["googleapis.com", "google-cloud", "gcp", "storage.cloud.google"] },
    { name: "Cloudflare (US)", patterns: ["cloudflare.com", "cloudflare-sdk"] },
    { name: "DigitalOcean", patterns: ["digitalocean.com", "digitaloceanspaces"] },
    { name: "Kyndryl/IBM", patterns: ["kyndryl.com", "ibm.com", "softlayer"] }
  ];
  const found = [];
  if (context.packageJson) {
    const deps = JSON.stringify(context.packageJson).toLowerCase();
    for (const provider of foreignProviders) {
      if (provider.patterns.some((p) => deps.includes(p))) {
        found.push(provider.name);
      }
    }
  }
  const configFiles = context.files.filter((f) => {
    const name = path3.basename(f).toLowerCase();
    return name.includes(".env") || name.includes("config") || name.endsWith(".json") || name.endsWith(".yaml") || name.endsWith(".yml");
  });
  for (const file of configFiles.slice(0, 20)) {
    try {
      const content = fs3.readFileSync(file, "utf-8").toLowerCase();
      for (const provider of foreignProviders) {
        if (provider.patterns.some((p) => content.includes(p)) && !found.includes(provider.name)) {
          found.push(provider.name);
        }
      }
    } catch {
    }
  }
  return { found: found.length > 0, providers: found };
}
var NIS2_CHECKS = [
  {
    checkId: "NIS2-001",
    name: "Risk Management Policy",
    category: "nis2",
    severity: "critical",
    scoreWeight: 15,
    description: "Check for risk management documentation (Article 21)",
    run: async (context) => {
      const found = findFile3(context, ["risk", "security-policy", "isms", "risk-management"]);
      if (found && fileContains(found, ["risk", "threat", "vulnerability", "assessment"])) {
        return {
          checkId: "NIS2-001",
          name: "Risk Management Policy",
          status: "passed",
          severity: "critical",
          category: "nis2",
          message: "Risk management documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-001",
        name: "Risk Management Policy",
        status: "failed",
        severity: "critical",
        category: "nis2",
        message: "No risk management policy found",
        recommendation: "Create risk management policy per NIS2 Article 21",
        reference: "NIS2 Article 21(2)(a)",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-002",
    name: "Incident Handling Procedure",
    category: "nis2",
    severity: "critical",
    scoreWeight: 15,
    description: "Check for incident response plan (24h notification)",
    run: async (context) => {
      const found = findFile3(context, ["incident", "response", "breach", "csirt"]);
      if (found) {
        const has24h = fileContains(found, ["24 hour", "24-hour", "24h", "within 24"]);
        if (has24h) {
          return {
            checkId: "NIS2-002",
            name: "Incident Handling Procedure",
            status: "passed",
            severity: "critical",
            category: "nis2",
            message: "Incident handling with 24h notification found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
        return {
          checkId: "NIS2-002",
          name: "Incident Handling Procedure",
          status: "warning",
          severity: "critical",
          category: "nis2",
          message: "Incident procedure found but no 24h notification mentioned",
          recommendation: "Update procedure with 24-hour early warning requirement",
          reference: "NIS2 Article 23(4)(a)",
          scoreImpact: 10,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-002",
        name: "Incident Handling Procedure",
        status: "failed",
        severity: "critical",
        category: "nis2",
        message: "No incident handling procedure found",
        recommendation: "Create incident response plan with 24h CSIRT notification",
        reference: "NIS2 Article 23",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-003",
    name: "Supply Chain Security",
    category: "nis2",
    severity: "high",
    scoreWeight: 12,
    description: "Check for supply chain security measures",
    run: async (context) => {
      const found = findFile3(context, ["supply-chain", "vendor", "third-party", "supplier"]);
      const hasLockfile = context.files.some((f) => {
        const name = path3.basename(f).toLowerCase();
        return name === "package-lock.json" || name === "yarn.lock" || name === "pnpm-lock.yaml";
      });
      if (found) {
        return {
          checkId: "NIS2-003",
          name: "Supply Chain Security",
          status: "passed",
          severity: "high",
          category: "nis2",
          message: "Supply chain security documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      if (hasLockfile) {
        return {
          checkId: "NIS2-003",
          name: "Supply Chain Security",
          status: "warning",
          severity: "high",
          category: "nis2",
          message: "Lockfile found but no supply chain policy",
          recommendation: "Document supply chain security policy and vendor assessment process",
          reference: "NIS2 Article 21(2)(d)",
          scoreImpact: 6,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-003",
        name: "Supply Chain Security",
        status: "failed",
        severity: "high",
        category: "nis2",
        message: "No supply chain security measures found",
        recommendation: "Implement supply chain security per NIS2 requirements",
        reference: "NIS2 Article 21(2)(d)",
        scoreImpact: 12,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-004",
    name: "Business Continuity",
    category: "nis2",
    severity: "high",
    scoreWeight: 12,
    description: "Check for business continuity / disaster recovery plan",
    run: async (context) => {
      const found = findFile3(context, [
        "continuity",
        "disaster",
        "recovery",
        "backup",
        "bcp",
        "drp"
      ]);
      if (found) {
        return {
          checkId: "NIS2-004",
          name: "Business Continuity",
          status: "passed",
          severity: "high",
          category: "nis2",
          message: "Business continuity plan found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-004",
        name: "Business Continuity",
        status: "failed",
        severity: "high",
        category: "nis2",
        message: "No business continuity plan found",
        recommendation: "Create BCP/DRP documentation",
        reference: "NIS2 Article 21(2)(c)",
        scoreImpact: 12,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-005",
    name: "Access Control Policy",
    category: "nis2",
    severity: "high",
    scoreWeight: 10,
    description: "Check for access control documentation",
    run: async (context) => {
      const found = findFile3(context, ["access", "rbac", "authentication", "authorization"]);
      if (found) {
        return {
          checkId: "NIS2-005",
          name: "Access Control Policy",
          status: "passed",
          severity: "high",
          category: "nis2",
          message: "Access control documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-005",
        name: "Access Control Policy",
        status: "warning",
        severity: "high",
        category: "nis2",
        message: "No access control policy found",
        recommendation: "Document access control and authentication policies",
        reference: "NIS2 Article 21(2)(i)",
        scoreImpact: 10,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-006",
    name: "Encryption & Cryptography",
    category: "nis2",
    severity: "high",
    scoreWeight: 10,
    description: "Check for encryption policy and implementation",
    run: async (context) => {
      const found = findFile3(context, ["encryption", "crypto", "tls", "certificate"]);
      const hasTlsConfig = context.files.some((f) => {
        const name = path3.basename(f).toLowerCase();
        return name.includes("ssl") || name.includes("tls") || name.includes("cert");
      });
      if (found || hasTlsConfig) {
        return {
          checkId: "NIS2-006",
          name: "Encryption & Cryptography",
          status: "passed",
          severity: "high",
          category: "nis2",
          message: "Encryption configuration found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-006",
        name: "Encryption & Cryptography",
        status: "warning",
        severity: "high",
        category: "nis2",
        message: "No encryption policy found",
        recommendation: "Document cryptography policy and ensure TLS configuration",
        reference: "NIS2 Article 21(2)(h)",
        scoreImpact: 10,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-007",
    name: "Vulnerability Management",
    category: "nis2",
    severity: "high",
    scoreWeight: 10,
    description: "Check for vulnerability disclosure and handling",
    run: async (context) => {
      const found = findFile3(context, ["vulnerability", "security.md", "security.txt", "cve"]);
      const hasSecurityTxt = context.files.some((f) => path3.basename(f).toLowerCase() === "security.txt");
      if (found || hasSecurityTxt) {
        return {
          checkId: "NIS2-007",
          name: "Vulnerability Management",
          status: "passed",
          severity: "high",
          category: "nis2",
          message: "Vulnerability handling documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-007",
        name: "Vulnerability Management",
        status: "warning",
        severity: "high",
        category: "nis2",
        message: "No vulnerability management process found",
        recommendation: "Add security.txt and vulnerability disclosure process",
        reference: "NIS2 Article 21(2)(e)",
        scoreImpact: 10,
        canAutoFix: true,
        fixAction: {
          description: "Create security.txt with contact info",
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
              const wellKnown = path3.join(context.scanPath, ".well-known");
              if (!fs3.existsSync(wellKnown)) {
                fs3.mkdirSync(wellKnown, { recursive: true });
              }
              fs3.writeFileSync(path3.join(wellKnown, "security.txt"), securityTxt);
              return true;
            } catch {
              return false;
            }
          }
        }
      };
    }
  },
  {
    checkId: "NIS2-008",
    name: "Digital Sovereignty (no-digid)",
    category: "nis2",
    severity: "high",
    scoreWeight: 12,
    description: "Check for foreign cloud dependencies (US CLOUD Act risk)",
    run: async (context) => {
      const { found, providers } = checkForeignCloud(context);
      if (!found) {
        return {
          checkId: "NIS2-008",
          name: "Digital Sovereignty (no-digid)",
          status: "passed",
          severity: "high",
          category: "nis2",
          message: "No foreign cloud dependencies detected - Sovereign!",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-008",
        name: "Digital Sovereignty (no-digid)",
        status: "warning",
        severity: "high",
        category: "nis2",
        message: `Foreign cloud detected: ${providers.join(", ")}`,
        recommendation: "Consider EU-sovereign alternatives. US CLOUD Act allows foreign access to data.",
        reference: "NIS2 Recital 79 (supply chain), Schrems II",
        scoreImpact: 12,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-009",
    name: "Security Awareness Training",
    category: "nis2",
    severity: "medium",
    scoreWeight: 8,
    description: "Check for security training documentation",
    run: async (context) => {
      const found = findFile3(context, ["training", "awareness", "onboarding", "security-guide"]);
      if (found) {
        return {
          checkId: "NIS2-009",
          name: "Security Awareness Training",
          status: "passed",
          severity: "medium",
          category: "nis2",
          message: "Security training documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-009",
        name: "Security Awareness Training",
        status: "warning",
        severity: "medium",
        category: "nis2",
        message: "No security awareness training found",
        recommendation: "Implement cyber hygiene and security training program",
        reference: "NIS2 Article 21(2)(g)",
        scoreImpact: 8,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "NIS2-010",
    name: "Asset Management",
    category: "nis2",
    severity: "medium",
    scoreWeight: 8,
    description: "Check for asset inventory",
    run: async (context) => {
      const found = findFile3(context, ["asset", "inventory", "cmdb", "infrastructure"]);
      if (found) {
        return {
          checkId: "NIS2-010",
          name: "Asset Management",
          status: "passed",
          severity: "medium",
          category: "nis2",
          message: "Asset management documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "NIS2-010",
        name: "Asset Management",
        status: "warning",
        severity: "medium",
        category: "nis2",
        message: "No asset inventory found",
        recommendation: "Create and maintain IT asset inventory",
        reference: "NIS2 Article 21(2)(a) - risk analysis requires asset knowledge",
        scoreImpact: 8,
        canAutoFix: false
      };
    }
  }
];

// src/checks/pipa.ts
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
function findFile4(context, patterns) {
  for (const file of context.files) {
    const basename9 = path4.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
var PIPA_CHECKS = [
  {
    checkId: "PIPA-001",
    name: "Privacy Officer Designation",
    category: "pipa",
    severity: "critical",
    scoreWeight: 20,
    description: "Check for designated privacy officer (CPO)",
    run: async (context) => {
      const found = findFile4(context, ["privacy", "cpo", "officer"]);
      if (found) {
        const content = fs4.readFileSync(found, "utf-8").toLowerCase();
        if (content.includes("officer") || content.includes("cpo") || content.includes("\uCC45\uC784\uC790")) {
          return {
            checkId: "PIPA-001",
            name: "Privacy Officer Designation",
            status: "passed",
            severity: "critical",
            category: "pipa",
            message: "Privacy officer information found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      return {
        checkId: "PIPA-001",
        name: "Privacy Officer Designation",
        status: "failed",
        severity: "critical",
        category: "pipa",
        message: "No Chief Privacy Officer (CPO) designation found",
        recommendation: "Designate and document a Chief Privacy Officer",
        reference: "PIPA Article 31",
        scoreImpact: 20,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "PIPA-002",
    name: "24-Hour Breach Notification",
    category: "pipa",
    severity: "critical",
    scoreWeight: 20,
    description: "Check for 24-hour breach notification procedure (stricter than GDPR!)",
    run: async (context) => {
      const found = findFile4(context, ["breach", "incident", "notification"]);
      if (found) {
        const content = fs4.readFileSync(found, "utf-8").toLowerCase();
        if (content.includes("24") || content.includes("twenty-four")) {
          return {
            checkId: "PIPA-002",
            name: "24-Hour Breach Notification",
            status: "passed",
            severity: "critical",
            category: "pipa",
            message: "24-hour breach notification procedure found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
        return {
          checkId: "PIPA-002",
          name: "24-Hour Breach Notification",
          status: "warning",
          severity: "critical",
          category: "pipa",
          message: "Breach procedure found but 24-hour requirement not explicit",
          recommendation: "Update to specify 24-hour notification (PIPA requirement)",
          scoreImpact: 10,
          canAutoFix: false
        };
      }
      return {
        checkId: "PIPA-002",
        name: "24-Hour Breach Notification",
        status: "failed",
        severity: "critical",
        category: "pipa",
        message: "No 24-hour breach notification procedure found",
        recommendation: "Create breach procedure with 24-hour notification (stricter than GDPR!)",
        reference: "PIPA Article 34",
        scoreImpact: 20,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "PIPA-003",
    name: "Explicit Consent (Opt-in)",
    category: "pipa",
    severity: "high",
    scoreWeight: 15,
    description: "Check for opt-in consent mechanism",
    run: async (context) => {
      const found = findFile4(context, ["consent", "opt-in", "agreement"]);
      if (found) {
        return {
          checkId: "PIPA-003",
          name: "Explicit Consent (Opt-in)",
          status: "passed",
          severity: "high",
          category: "pipa",
          message: "Consent documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "PIPA-003",
        name: "Explicit Consent (Opt-in)",
        status: "warning",
        severity: "high",
        category: "pipa",
        message: "No explicit opt-in consent mechanism found",
        recommendation: "Implement clear opt-in consent (PIPA requires explicit consent)",
        reference: "PIPA Article 15",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "PIPA-004",
    name: "Cross-Border Transfer Documentation",
    category: "pipa",
    severity: "high",
    scoreWeight: 15,
    description: "Check for cross-border data transfer documentation",
    run: async (context) => {
      const found = findFile4(context, ["transfer", "cross-border", "international"]);
      if (found) {
        return {
          checkId: "PIPA-004",
          name: "Cross-Border Transfer Documentation",
          status: "passed",
          severity: "high",
          category: "pipa",
          message: "Cross-border transfer documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "PIPA-004",
        name: "Cross-Border Transfer Documentation",
        status: "warning",
        severity: "high",
        category: "pipa",
        message: "No cross-border transfer documentation found",
        recommendation: "Document data transfers outside South Korea",
        reference: "PIPA Article 17",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  }
];

// src/checks/appi.ts
var path5 = __toESM(require("path"));
function findFile5(context, patterns) {
  for (const file of context.files) {
    const basename9 = path5.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
var APPI_CHECKS = [
  {
    checkId: "APPI-001",
    name: "Privacy Policy (APPI)",
    category: "appi",
    severity: "high",
    scoreWeight: 15,
    description: "Check for APPI-compliant privacy policy",
    run: async (context) => {
      const found = findFile5(context, ["privacy", "\u30D7\u30E9\u30A4\u30D0\u30B7\u30FC"]);
      if (found) {
        return {
          checkId: "APPI-001",
          name: "Privacy Policy (APPI)",
          status: "passed",
          severity: "high",
          category: "appi",
          message: `Found: ${path5.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "APPI-001",
        name: "Privacy Policy (APPI)",
        status: "failed",
        severity: "high",
        category: "appi",
        message: "No privacy policy found",
        recommendation: "Create privacy policy compliant with APPI",
        reference: "APPI Article 21",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "APPI-002",
    name: "Data Handling Records",
    category: "appi",
    severity: "high",
    scoreWeight: 15,
    description: "Check for data handling records",
    run: async (context) => {
      const found = findFile5(context, ["data-handling", "records", "processing-log"]);
      if (found) {
        return {
          checkId: "APPI-002",
          name: "Data Handling Records",
          status: "passed",
          severity: "high",
          category: "appi",
          message: `Found: ${path5.basename(found)}`,
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "APPI-002",
        name: "Data Handling Records",
        status: "warning",
        severity: "high",
        category: "appi",
        message: "No data handling records found",
        recommendation: "Maintain records of data handling activities",
        reference: "APPI Article 26",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "APPI-003",
    name: "Cross-Border Transfer Rules",
    category: "appi",
    severity: "high",
    scoreWeight: 15,
    description: "Check for cross-border transfer compliance",
    run: async (context) => {
      const found = findFile5(context, ["transfer", "cross-border", "international"]);
      if (found) {
        return {
          checkId: "APPI-003",
          name: "Cross-Border Transfer Rules",
          status: "passed",
          severity: "high",
          category: "appi",
          message: "Cross-border documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "APPI-003",
        name: "Cross-Border Transfer Rules",
        status: "warning",
        severity: "high",
        category: "appi",
        message: "No cross-border transfer documentation",
        recommendation: "Document transfers outside Japan with adequate protection",
        reference: "APPI Article 28",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "APPI-004",
    name: "Pseudonymization Support",
    category: "appi",
    severity: "medium",
    scoreWeight: 10,
    description: "Check for pseudonymization capabilities",
    run: async (context) => {
      const found = findFile5(context, ["pseudonym", "anonymize", "mask"]);
      if (found) {
        return {
          checkId: "APPI-004",
          name: "Pseudonymization Support",
          status: "passed",
          severity: "medium",
          category: "appi",
          message: "Pseudonymization documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "APPI-004",
        name: "Pseudonymization Support",
        status: "warning",
        severity: "medium",
        category: "appi",
        message: "No pseudonymization documentation",
        recommendation: "Consider pseudonymization for enhanced data protection",
        reference: "APPI Article 41",
        scoreImpact: 10,
        canAutoFix: false
      };
    }
  }
];

// src/checks/pdpa.ts
var fs5 = __toESM(require("fs"));
var path6 = __toESM(require("path"));
function findFile6(context, patterns) {
  for (const file of context.files) {
    const basename9 = path6.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
var PDPA_CHECKS = [
  {
    checkId: "PDPA-001",
    name: "Consent Obligation",
    category: "pdpa",
    severity: "high",
    scoreWeight: 15,
    description: "Check for consent mechanism",
    run: async (context) => {
      const found = findFile6(context, ["consent", "agreement", "terms"]);
      if (found) {
        return {
          checkId: "PDPA-001",
          name: "Consent Obligation",
          status: "passed",
          severity: "high",
          category: "pdpa",
          message: "Consent documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "PDPA-001",
        name: "Consent Obligation",
        status: "warning",
        severity: "high",
        category: "pdpa",
        message: "No consent mechanism found",
        recommendation: "Implement clear consent mechanism",
        reference: "PDPA Part IV",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "PDPA-002",
    name: "Data Protection Officer",
    category: "pdpa",
    severity: "high",
    scoreWeight: 15,
    description: "Check for DPO designation",
    run: async (context) => {
      const found = findFile6(context, ["dpo", "officer", "privacy"]);
      if (found) {
        const content = fs5.readFileSync(found, "utf-8").toLowerCase();
        if (content.includes("officer") || content.includes("dpo")) {
          return {
            checkId: "PDPA-002",
            name: "Data Protection Officer",
            status: "passed",
            severity: "high",
            category: "pdpa",
            message: "DPO information found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      return {
        checkId: "PDPA-002",
        name: "Data Protection Officer",
        status: "warning",
        severity: "high",
        category: "pdpa",
        message: "No DPO designation found",
        recommendation: "Designate a Data Protection Officer",
        reference: "PDPA Section 11(3)",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "PDPA-003",
    name: "3-Day Breach Notification",
    category: "pdpa",
    severity: "critical",
    scoreWeight: 20,
    description: "Check for 3-day breach notification procedure",
    run: async (context) => {
      const found = findFile6(context, ["breach", "incident", "notification"]);
      if (found) {
        const content = fs5.readFileSync(found, "utf-8").toLowerCase();
        if (content.includes("3 day") || content.includes("three day") || content.includes("72")) {
          return {
            checkId: "PDPA-003",
            name: "3-Day Breach Notification",
            status: "passed",
            severity: "critical",
            category: "pdpa",
            message: "Breach notification with timeline found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      return {
        checkId: "PDPA-003",
        name: "3-Day Breach Notification",
        status: "failed",
        severity: "critical",
        category: "pdpa",
        message: "No 3-day breach notification procedure",
        recommendation: "Create breach procedure with 3-day notification to PDPC",
        reference: "PDPA Section 26D",
        scoreImpact: 20,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "PDPA-004",
    name: "Do Not Call Compliance",
    category: "pdpa",
    severity: "medium",
    scoreWeight: 10,
    description: "Check for DNC registry compliance",
    run: async (context) => {
      const found = findFile6(context, ["dnc", "do-not-call", "marketing"]);
      if (found) {
        return {
          checkId: "PDPA-004",
          name: "Do Not Call Compliance",
          status: "passed",
          severity: "medium",
          category: "pdpa",
          message: "DNC compliance documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "PDPA-004",
        name: "Do Not Call Compliance",
        status: "warning",
        severity: "medium",
        category: "pdpa",
        message: "No DNC registry compliance found",
        recommendation: "Check Singapore DNC registry before marketing calls",
        reference: "PDPA Part IX",
        scoreImpact: 10,
        canAutoFix: false
      };
    }
  }
];

// src/checks/lgpd.ts
var fs6 = __toESM(require("fs"));
var path7 = __toESM(require("path"));
function findFile7(context, patterns) {
  for (const file of context.files) {
    const basename9 = path7.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
var LGPD_CHECKS = [
  {
    checkId: "LGPD-001",
    name: "Legal Basis for Processing",
    category: "lgpd",
    severity: "high",
    scoreWeight: 15,
    description: "Check for documented legal basis",
    run: async (context) => {
      const found = findFile7(context, ["legal-basis", "privacy", "lgpd"]);
      if (found) {
        const content = fs6.readFileSync(found, "utf-8").toLowerCase();
        if (content.includes("legal basis") || content.includes("base legal") || content.includes("consent")) {
          return {
            checkId: "LGPD-001",
            name: "Legal Basis for Processing",
            status: "passed",
            severity: "high",
            category: "lgpd",
            message: "Legal basis documentation found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      return {
        checkId: "LGPD-001",
        name: "Legal Basis for Processing",
        status: "warning",
        severity: "high",
        category: "lgpd",
        message: "No documented legal basis for processing",
        recommendation: "Document legal basis per LGPD Article 7",
        reference: "LGPD Article 7",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "LGPD-002",
    name: "Encarregado (DPO)",
    category: "lgpd",
    severity: "high",
    scoreWeight: 15,
    description: "Check for Encarregado/DPO designation",
    run: async (context) => {
      const found = findFile7(context, ["dpo", "encarregado", "officer", "privacy"]);
      if (found) {
        const content = fs6.readFileSync(found, "utf-8").toLowerCase();
        if (content.includes("encarregado") || content.includes("dpo") || content.includes("officer")) {
          return {
            checkId: "LGPD-002",
            name: "Encarregado (DPO)",
            status: "passed",
            severity: "high",
            category: "lgpd",
            message: "Encarregado designation found",
            scoreImpact: 0,
            canAutoFix: false
          };
        }
      }
      return {
        checkId: "LGPD-002",
        name: "Encarregado (DPO)",
        status: "warning",
        severity: "high",
        category: "lgpd",
        message: "No Encarregado (DPO) designation found",
        recommendation: "Designate an Encarregado (Data Protection Officer)",
        reference: "LGPD Article 41",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "LGPD-003",
    name: "Data Subject Rights (ARCO)",
    category: "lgpd",
    severity: "high",
    scoreWeight: 15,
    description: "Check for ARCO rights implementation",
    run: async (context) => {
      const found = findFile7(context, ["rights", "arco", "subject-rights"]);
      if (found) {
        return {
          checkId: "LGPD-003",
          name: "Data Subject Rights (ARCO)",
          status: "passed",
          severity: "high",
          category: "lgpd",
          message: "Data subject rights documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "LGPD-003",
        name: "Data Subject Rights (ARCO)",
        status: "warning",
        severity: "high",
        category: "lgpd",
        message: "No ARCO rights implementation found",
        recommendation: "Implement Access, Rectification, Cancellation, Opposition rights",
        reference: "LGPD Article 18",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "LGPD-004",
    name: "Breach Notification",
    category: "lgpd",
    severity: "critical",
    scoreWeight: 20,
    description: "Check for breach notification procedure",
    run: async (context) => {
      const found = findFile7(context, ["breach", "incident", "notification"]);
      if (found) {
        return {
          checkId: "LGPD-004",
          name: "Breach Notification",
          status: "passed",
          severity: "critical",
          category: "lgpd",
          message: "Breach notification procedure found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "LGPD-004",
        name: "Breach Notification",
        status: "failed",
        severity: "critical",
        category: "lgpd",
        message: "No breach notification procedure",
        recommendation: "Create breach notification procedure for ANPD",
        reference: "LGPD Article 48",
        scoreImpact: 20,
        canAutoFix: false
      };
    }
  }
];

// src/checks/jis.ts
var path8 = __toESM(require("path"));
function findFile8(context, patterns) {
  for (const file of context.files) {
    const basename9 = path8.basename(file).toLowerCase();
    for (const pattern of patterns) {
      if (basename9.includes(pattern.toLowerCase())) {
        return file;
      }
    }
  }
  return null;
}
function hasDependency3(context, names) {
  if (!context.packageJson) return false;
  const deps = {
    ...context.packageJson.dependencies || {},
    ...context.packageJson.devDependencies || {}
  };
  return names.some((name) => name in deps);
}
var JIS_CHECKS = [
  {
    checkId: "JIS-001",
    name: "Bilateral Consent Implementation",
    category: "jis",
    severity: "high",
    scoreWeight: 15,
    description: "Check for bilateral consent mechanism (did:jis)",
    run: async (context) => {
      if (hasDependency3(context, ["did-jis", "@jtel/jis", "jis-consent"])) {
        return {
          checkId: "JIS-001",
          name: "Bilateral Consent Implementation",
          status: "passed",
          severity: "high",
          category: "jis",
          message: "JIS bilateral consent library found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile8(context, ["consent", "jis", "bilateral"]);
      if (found) {
        return {
          checkId: "JIS-001",
          name: "Bilateral Consent Implementation",
          status: "passed",
          severity: "high",
          category: "jis",
          message: "Consent implementation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "JIS-001",
        name: "Bilateral Consent Implementation",
        status: "warning",
        severity: "high",
        category: "jis",
        message: "No bilateral consent mechanism found",
        recommendation: "Implement did:jis for bilateral consent (npm: did-jis)",
        reference: "JIS Protocol v1.0",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "JIS-002",
    name: "TIBET Provenance Trail",
    category: "jis",
    severity: "high",
    scoreWeight: 15,
    description: "Check for TIBET provenance implementation",
    run: async (context) => {
      if (hasDependency3(context, ["tibet-vault", "tibet-audit", "mcp-server-tibet"])) {
        return {
          checkId: "JIS-002",
          name: "TIBET Provenance Trail",
          status: "passed",
          severity: "high",
          category: "jis",
          message: "TIBET provenance library found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      const found = findFile8(context, ["tibet", "provenance", "audit-trail"]);
      if (found) {
        return {
          checkId: "JIS-002",
          name: "TIBET Provenance Trail",
          status: "passed",
          severity: "high",
          category: "jis",
          message: "Provenance documentation found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "JIS-002",
        name: "TIBET Provenance Trail",
        status: "warning",
        severity: "high",
        category: "jis",
        message: "No TIBET provenance trail found",
        recommendation: "Implement TIBET for audit trail (npm: tibet-vault)",
        reference: "IETF draft-vandemeent-tibet-provenance",
        scoreImpact: 15,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "JIS-003",
    name: "Intent Verification",
    category: "jis",
    severity: "medium",
    scoreWeight: 10,
    description: "Check for intent verification (ERACHTER)",
    run: async (context) => {
      const found = findFile8(context, ["intent", "erachter", "purpose"]);
      if (found) {
        return {
          checkId: "JIS-003",
          name: "Intent Verification",
          status: "passed",
          severity: "medium",
          category: "jis",
          message: "Intent verification found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "JIS-003",
        name: "Intent Verification",
        status: "warning",
        severity: "medium",
        category: "jis",
        message: "No explicit intent verification",
        recommendation: "Document the ERACHTER (intent/why) for data processing",
        reference: "TIBET ERACHTER principle",
        scoreImpact: 10,
        canAutoFix: false
      };
    }
  },
  {
    checkId: "JIS-004",
    name: "Sign-off Workflow",
    category: "jis",
    severity: "medium",
    scoreWeight: 10,
    description: "Check for human sign-off workflow",
    run: async (context) => {
      const found = findFile8(context, ["signoff", "approval", "review"]);
      if (found) {
        return {
          checkId: "JIS-004",
          name: "Sign-off Workflow",
          status: "passed",
          severity: "medium",
          category: "jis",
          message: "Sign-off workflow found",
          scoreImpact: 0,
          canAutoFix: false
        };
      }
      return {
        checkId: "JIS-004",
        name: "Sign-off Workflow",
        status: "skipped",
        severity: "medium",
        category: "jis",
        message: "No sign-off workflow (optional for non-regulated)",
        recommendation: "Consider --require-signoff for compliance verification",
        reference: "JIS Sign-off Protocol",
        scoreImpact: 0,
        canAutoFix: false
      };
    }
  }
];

// src/checks/index.ts
var ALL_CHECKS = [
  ...GDPR_CHECKS,
  ...AI_ACT_CHECKS,
  ...NIS2_CHECKS,
  ...PIPA_CHECKS,
  ...APPI_CHECKS,
  ...PDPA_CHECKS,
  ...LGPD_CHECKS,
  ...JIS_CHECKS
];

// src/scanner.ts
function generateId() {
  return crypto.randomBytes(4).toString("hex");
}
function calculateGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
function readPackageJson(scanPath) {
  const pkgPath = path9.join(scanPath, "package.json");
  if (fs7.existsSync(pkgPath)) {
    try {
      return JSON.parse(fs7.readFileSync(pkgPath, "utf-8"));
    } catch {
      return void 0;
    }
  }
  return void 0;
}
function getFiles(scanPath) {
  const files = [];
  function walkDir(dir, depth = 0) {
    if (depth > 3) return;
    if (!fs7.existsSync(dir)) return;
    try {
      const entries = fs7.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
        const fullPath = path9.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath, depth + 1);
        } else {
          files.push(fullPath);
        }
      }
    } catch {
    }
  }
  walkDir(scanPath);
  return files;
}
async function scan(scanPath = ".", options = {}) {
  const startTime = Date.now();
  const resolvedPath = path9.resolve(scanPath);
  const context = {
    scanPath: resolvedPath,
    packageJson: readPackageJson(resolvedPath),
    files: getFiles(resolvedPath),
    sovereignMode: options.sovereignMode ?? false
  };
  let checks = ALL_CHECKS;
  if (options.categories && options.categories.length > 0) {
    checks = ALL_CHECKS.filter((c) => options.categories.includes(c.category));
  }
  const results = [];
  for (const check of checks) {
    try {
      const result = await check.run(context);
      results.push(result);
    } catch (error) {
      results.push({
        checkId: check.checkId,
        name: check.name,
        status: "skipped",
        severity: check.severity,
        category: check.category,
        message: `Check failed to run: ${error}`,
        scoreImpact: 0,
        canAutoFix: false
      });
    }
  }
  let deductions = 0;
  for (const result of results) {
    if (result.status === "failed") {
      deductions += result.scoreImpact;
    } else if (result.status === "warning") {
      deductions += result.scoreImpact * 0.5;
    }
  }
  const score = Math.max(0, Math.round(100 - deductions));
  const grade = calculateGrade(score);
  const passed = results.filter((r) => r.status === "passed").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  return {
    timestamp: /* @__PURE__ */ new Date(),
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
    sovereignMode: options.sovereignMode ?? false
  };
}
function getFixableIssues(results) {
  return results.filter((r) => r.canAutoFix && r.status !== "passed");
}
async function applyFixes(issues, options = {}) {
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

// src/index.ts
var VERSION = "0.2.1";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AI_ACT_CHECKS,
  ALL_CHECKS,
  APPI_CHECKS,
  GDPR_CHECKS,
  JIS_CHECKS,
  LGPD_CHECKS,
  NIS2_CHECKS,
  PDPA_CHECKS,
  PIPA_CHECKS,
  VERSION,
  applyFixes,
  getFixableIssues,
  scan
});
/**
 * TIBET Audit - Compliance Health Scanner
 *
 * Like Lynis, but for regulations. Scan your projects for GDPR, AI Act,
 * PIPA, APPI, PDPA, LGPD, and more.
 *
 * The Diaper Protocol: One command, hands free, compliance done.
 *
 * @example
 * ```typescript
 * import { scan, getFixableIssues, applyFixes } from 'tibet-audit';
 *
 * // Basic scan
 * const result = await scan('./my-project');
 * console.log(`Score: ${result.score}/100 (Grade: ${result.grade})`);
 *
 * // Scan specific categories
 * const result = await scan('.', { categories: ['gdpr', 'ai_act'] });
 *
 * // Sovereign mode (no cloud APIs)
 * const result = await scan('.', { sovereignMode: true });
 *
 * // Fix issues
 * const fixable = getFixableIssues(result.results);
 * await applyFixes(fixable);
 * ```
 *
 * @author Jasper van de Meent & Root AI
 * @license MIT
 */
//# sourceMappingURL=index.js.map