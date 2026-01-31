# TIBET Audit

> Compliance Health Scanner - Like Lynis, but for regulations.

[![npm version](https://badge.fury.io/js/tibet-audit.svg)](https://www.npmjs.com/package/tibet-audit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Scan your projects for **GDPR**, **AI Act**, **PIPA**, **APPI**, **PDPA**, **LGPD**, **JIS** compliance in seconds.

```
══════════════════════════════════════════════════════════════════════════════
  ████████╗██╗██████╗ ███████╗████████╗     █████╗ ██╗   ██╗██████╗ ██╗████████╗
  ╚══██╔══╝██║██╔══██╗██╔════╝╚══██╔══╝    ██╔══██╗██║   ██║██╔══██╗██║╚══██╔══╝
     ██║   ██║██████╔╝█████╗     ██║       ███████║██║   ██║██║  ██║██║   ██║
     ██║   ██║██╔══██╗██╔══╝     ██║       ██╔══██║██║   ██║██║  ██║██║   ██║
     ██║   ██║██████╔╝███████╗   ██║       ██║  ██║╚██████╔╝██████╔╝██║   ██║
     ╚═╝   ╚═╝╚═════╝ ╚══════╝   ╚═╝       ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝   ╚═╝
══════════════════════════════════════════════════════════════════════════════
  "SSL secures the connection. TIBET secures the timeline."
══════════════════════════════════════════════════════════════════════════════
```

## Installation

```bash
npm install -g tibet-audit
```

Or run directly with npx:

```bash
npx tibet-audit scan
```

## Quick Start

```bash
# Scan current directory
tibet-audit scan

# Scan specific path
tibet-audit scan ./my-project

# Scan specific categories
tibet-audit scan --categories gdpr,ai_act

# Sovereign mode (no cloud APIs)
tibet-audit scan --sovereign

# Fix issues automatically (Diaper Protocol)
tibet-audit fix --auto

# Preview fixes without applying
tibet-audit fix --wet-wipe
```

## Programmatic Usage

```typescript
import { scan, getFixableIssues, applyFixes } from 'tibet-audit';

// Basic scan
const result = await scan('./my-project');
console.log(`Score: ${result.score}/100 (Grade: ${result.grade})`);

// Scan specific categories
const result = await scan('.', { categories: ['gdpr', 'ai_act'] });

// Sovereign mode (no cloud APIs)
const result = await scan('.', { sovereignMode: true });

// Fix issues
const fixable = getFixableIssues(result.results);
await applyFixes(fixable);
```

## Supported Regulations

| Category | Region | Checks |
|----------|--------|--------|
| **GDPR** | EU | Privacy policy, DPO, consent, DPIA, breach notification |
| **AI Act** | EU | Risk classification, documentation, human oversight |
| **PIPA** | South Korea | Explicit consent, CPO, 24h breach notification |
| **APPI** | Japan | Privacy manager, cross-border transfers |
| **PDPA** | Singapore | Consent, DPO, 3-day breach notification |
| **LGPD** | Brazil | Legal basis, Encarregado, ARCO rights |
| **JIS** | Universal | Bilateral consent, TIBET provenance, intent verification |

## CLI Options

### Scan

```
tibet-audit scan [path] [options]

Options:
  --categories, -c  Categories to check (gdpr,ai_act,pipa,appi,pdpa,lgpd,jis)
  --output, -o      Output format: terminal, json
  --quiet, -q       Minimal output
  --cry             Verbose mode - all the details
  --sovereign       No cloud APIs, fully local
```

### Fix

```
tibet-audit fix [path] [options]

Options:
  --auto, -a        Diaper Protocol: fix everything, no questions
  --wet-wipe, -w    Preview what would be fixed (dry-run)
  --sovereign       No cloud APIs, fully local
```

## The Diaper Protocol

One command, hands free, compliance done.

```bash
tibet-audit fix --auto
```

Like a diaper change - press the button, hands free, mess cleaned up.

## Sovereign Mode

Run all checks locally without any cloud API calls:

```bash
tibet-audit scan --sovereign
tibet-audit fix --sovereign --auto
```

Your data never leaves your machine.

## Scoring

- **A** (90-100): Excellent compliance
- **B** (80-89): Good compliance
- **C** (70-79): Adequate compliance
- **D** (60-69): Needs improvement
- **F** (<60): Critical gaps

## Also Available

- **Python**: `pip install tibet-audit`
- **npm**: `npm install tibet-audit` (this package)

## License

MIT License - Jasper van de Meent & HumoticaOS

---

Part of the [TIBET Ecosystem](https://humotica.com/tibet) - Transparent Immutable Bilateral Event Trails

"SSL secures the connection. TIBET secures the timeline."
