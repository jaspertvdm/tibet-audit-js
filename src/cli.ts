#!/usr/bin/env node
/**
 * TIBET Audit CLI
 *
 * Compliance Health Scanner - Like Lynis, but for regulations.
 *
 * The Diaper Protocol: One command, hands free, compliance done.
 */

import { scan, getFixableIssues, applyFixes } from './scanner';
import { ScanResult, CheckResult, Category, Grade } from './types';

const VERSION = '0.2.1';

// Dutch government slogans - Easter egg for Grade F
// "Hoop dat de overheid 'm gebruikt" - Jasper, 2026
const DUTCH_GOVT_SLOGANS = [
  'Wat betekent dat voor u?',
  'Leuker kunnen we het niet maken, wel makkelijker.',
  'Van F naar Beter!',
  'De overheid. Voor u.',
  'Samen werken aan een veilig Nederland.',
  'Niet haalbaar, wel verplicht.',
  'We verwachten Q3 2025 weer normale scores. (update volgt)',
  'Uw compliance is belangrijk voor ons. Een moment geduld.',
  'Deze score past bij uw profiel.',
  'Minder regels, meer ruimte. Behalve voor u.',
  'Leuker kunnen we het niet maken, wel veiliger.',
  'Wat betekent dit voor u? Dat u waarschijnlijk data naar Virginia lekt.',
  'Foutje, bedankt! (U overtreedt nu Artikel 21 van NIS2)',
  'Een veiligere cloud begint bij uzelf.',
  'U heeft 1 nieuw bericht in uw Berichtenbox: CRITICAL FAILURE.',
];

function getDutchGovtSlogan(): string {
  return DUTCH_GOVT_SLOGANS[Math.floor(Math.random() * DUTCH_GOVT_SLOGANS.length)];
}

// ANSI color codes (no dependencies!)
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function color(text: string, c: keyof typeof colors): string {
  return `${colors[c]}${text}${colors.reset}`;
}

const BANNER = `
${color('══════════════════════════════════════════════════════════════════════════════', 'blue')}
${color('  ████████╗██╗██████╗ ███████╗████████╗     █████╗ ██╗   ██╗██████╗ ██╗████████╗', 'blue')}
${color('  ╚══██╔══╝██║██╔══██╗██╔════╝╚══██╔══╝    ██╔══██╗██║   ██║██╔══██╗██║╚══██╔══╝', 'blue')}
${color('     ██║   ██║██████╔╝█████╗     ██║       ███████║██║   ██║██║  ██║██║   ██║   ', 'blue')}
${color('     ██║   ██║██╔══██╗██╔══╝     ██║       ██╔══██║██║   ██║██║  ██║██║   ██║   ', 'blue')}
${color('     ██║   ██║██████╔╝███████╗   ██║       ██║  ██║╚██████╔╝██████╔╝██║   ██║   ', 'blue')}
${color('     ╚═╝   ╚═╝╚═════╝ ╚══════╝   ╚═╝       ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═╝   ╚═╝   ', 'blue')}
${color('══════════════════════════════════════════════════════════════════════════════', 'blue')}
${color(`  Compliance Health Scanner v${VERSION}`, 'dim')}
${color('  "SSL secures the connection. TIBET secures the timeline."', 'dim')}
${color('══════════════════════════════════════════════════════════════════════════════', 'blue')}
`;

const DIAPER_BANNER = `
${color('══════════════════════════════════════════════════════════════════════════════', 'yellow')}
${color('  🍼 DIAPER PROTOCOL™ ACTIVATED', 'yellow')}
${color('  "Press the button, hands free, diaper change, server fixed."', 'dim')}
${color('══════════════════════════════════════════════════════════════════════════════', 'yellow')}
`;

function printHelp(): void {
  console.log(BANNER);
  console.log(`
${color('USAGE:', 'bold')}
  tibet-audit <command> [options]

${color('COMMANDS:', 'bold')}
  scan [path]       Scan for compliance issues
  fix [path]        Fix compliance issues automatically
  help              Show this help message

${color('SCAN OPTIONS:', 'bold')}
  --categories, -c  Categories to check (gdpr,ai_act,nis2,pipa,appi,pdpa,lgpd,jis)
  --output, -o      Output format: terminal, json
  --quiet, -q       Minimal output
  --cry             Verbose mode - all the details
  --sovereign       🏴 No cloud APIs, fully local

${color('FIX OPTIONS:', 'bold')}
  --auto, -a        🍼 Diaper Protocol: fix everything, no questions
  --wet-wipe, -w    Preview what would be fixed (dry-run)
  --sovereign       🏴 No cloud APIs, fully local

${color('EXAMPLES:', 'bold')}
  tibet-audit scan
  tibet-audit scan ./my-project --categories gdpr,ai_act
  tibet-audit scan --sovereign
  tibet-audit fix --wet-wipe
  tibet-audit fix --auto

${color('MORE INFO:', 'bold')}
  https://humotica.com/tibet-audit
  https://github.com/jaspertvdm/tibet-audit-js
`);
}

function gradeColor(grade: Grade): string {
  switch (grade) {
    case 'A':
      return color(grade, 'green');
    case 'B':
      return color(grade, 'green');
    case 'C':
      return color(grade, 'yellow');
    case 'D':
      return color(grade, 'yellow');
    case 'F':
      return color(grade, 'red');
  }
}

function statusIcon(status: string): string {
  switch (status) {
    case 'passed':
      return color('✓', 'green');
    case 'warning':
      return color('!', 'yellow');
    case 'failed':
      return color('✗', 'red');
    case 'skipped':
      return color('-', 'dim');
    default:
      return '?';
  }
}

function printResults(result: ScanResult, verbose: boolean = false): void {
  // Score summary
  console.log('');
  console.log(
    `${color('COMPLIANCE HEALTH SCORE:', 'bold')} ${result.score}/100 (Grade: ${gradeColor(result.grade)})`
  );

  // Easter egg: Dutch government slogan for Grade F
  if (result.grade === 'F') {
    console.log(color(`  "${getDutchGovtSlogan()}"`, 'dim'));
  }
  console.log('');

  // Category summary
  const byCategory = new Map<string, CheckResult[]>();
  for (const r of result.results) {
    const cat = r.category || 'general';
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
    }
    byCategory.get(cat)!.push(r);
  }

  for (const [category, checks] of byCategory) {
    const passed = checks.filter((c) => c.status === 'passed').length;
    const total = checks.filter((c) => c.status !== 'skipped').length;
    if (total === 0) continue;

    console.log(
      `${color(category.toUpperCase(), 'cyan')}: ${passed}/${total} passed`
    );

    if (verbose) {
      for (const check of checks) {
        console.log(`  ${statusIcon(check.status)} ${check.name}`);
        if (check.message && check.status !== 'passed') {
          console.log(`    ${color(check.message, 'dim')}`);
        }
      }
      console.log('');
    }
  }

  // Top priorities
  const failed = result.results.filter((r) => r.status === 'failed');
  const warnings = result.results.filter((r) => r.status === 'warning');

  if (failed.length > 0 || warnings.length > 0) {
    console.log('');
    console.log(color('TOP PRIORITIES:', 'bold'));
    let priority = 1;

    for (const issue of failed.slice(0, 3)) {
      console.log(
        `  ${priority}. ${color(`[${issue.severity.toUpperCase()}]`, 'red')} ${issue.name}`
      );
      if (issue.recommendation) {
        console.log(`     ${color('→ ' + issue.recommendation, 'dim')}`);
      }
      priority++;
    }

    for (const issue of warnings.slice(0, 2)) {
      console.log(
        `  ${priority}. ${color(`[${issue.severity.toUpperCase()}]`, 'yellow')} ${issue.name}`
      );
      if (issue.recommendation) {
        console.log(`     ${color('→ ' + issue.recommendation, 'dim')}`);
      }
      priority++;
    }
  }

  // Fixable count
  const fixable = getFixableIssues(result.results);
  if (fixable.length > 0) {
    console.log('');
    console.log(`💡 ${fixable.length} issue(s) can be auto-fixed:`);
    console.log(`   ${color('tibet-audit fix --auto', 'cyan')}  (Diaper Protocol™)`);
  }

  // Stats
  console.log('');
  console.log(color('─'.repeat(60), 'dim'));
  console.log(
    color(
      `Scanned in ${result.durationMs}ms | Passed: ${result.passed} | Warnings: ${result.warnings} | Failed: ${result.failed} | Skipped: ${result.skipped}`,
      'dim'
    )
  );

  if (result.sovereignMode) {
    console.log(color('🏴 Sovereign mode: No data left your machine', 'cyan'));
  }
}

async function runScan(args: string[]): Promise<void> {
  let scanPath = '.';
  let categories: Category[] | undefined;
  let outputFormat = 'terminal';
  let quiet = false;
  let verbose = false;
  let sovereign = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--categories' || arg === '-c') {
      categories = args[++i]?.split(',') as Category[];
    } else if (arg === '--output' || arg === '-o') {
      outputFormat = args[++i] || 'terminal';
    } else if (arg === '--quiet' || arg === '-q') {
      quiet = true;
    } else if (arg === '--cry') {
      verbose = true;
    } else if (arg === '--sovereign') {
      sovereign = true;
    } else if (!arg.startsWith('-')) {
      scanPath = arg;
    }
  }

  if (!quiet && outputFormat === 'terminal') {
    console.log(BANNER);
    if (sovereign) {
      console.log(color('🏴 SOVEREIGN MODE', 'cyan'));
      console.log(color('   All checks run locally. No data leaves your machine.', 'dim'));
      console.log('');
    }
  }

  const result = await scan(scanPath, { categories, sovereignMode: sovereign });

  if (outputFormat === 'json') {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printResults(result, verbose);
  }

  // Exit with error code if failed
  if (result.failed > 0) {
    process.exit(1);
  }
}

async function runFix(args: string[]): Promise<void> {
  let scanPath = '.';
  let auto = false;
  let wetWipe = false;
  let sovereign = false;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--auto' || arg === '-a') {
      auto = true;
    } else if (arg === '--wet-wipe' || arg === '-w' || arg === '--dry-run' || arg === '-n') {
      wetWipe = true;
    } else if (arg === '--sovereign') {
      sovereign = true;
    } else if (!arg.startsWith('-')) {
      scanPath = arg;
    }
  }

  if (auto && !wetWipe) {
    console.log(DIAPER_BANNER);
  } else {
    console.log(BANNER);
  }

  if (sovereign) {
    console.log(color('🏴 SOVEREIGN MODE', 'cyan'));
    console.log(color('   All operations run locally. No data leaves your machine.', 'dim'));
    console.log('');
  }

  // First scan
  console.log('Scanning for fixable issues...');
  const result = await scan(scanPath, { sovereignMode: sovereign });

  const fixable = getFixableIssues(result.results);

  if (fixable.length === 0) {
    console.log(color('✓ No fixable issues found! Your compliance is looking good.', 'green'));
    return;
  }

  console.log('');
  console.log(`Found ${fixable.length} fixable issue(s):`);
  console.log('');

  for (const issue of fixable) {
    console.log(`  ${statusIcon(issue.status)} ${color(issue.checkId, 'cyan')}: ${issue.name}`);
    if (issue.fixAction?.description) {
      console.log(`     ${color('→ ' + issue.fixAction.description, 'dim')}`);
    }
  }

  if (wetWipe) {
    console.log('');
    console.log(color('🧻 Wet-wipe mode: No changes made. Run without --wet-wipe to apply fixes.', 'yellow'));
    return;
  }

  if (!auto) {
    console.log('');
    console.log('Run with --auto to apply fixes automatically.');
    return;
  }

  // Apply fixes
  console.log('');
  console.log(color('🍼 Diaper Protocol: Applying all fixes...', 'yellow'));
  console.log('');

  const { fixed, failed } = await applyFixes(fixable);

  console.log('');
  console.log(color(`🎉 Done! Fixed: ${fixed}, Failed: ${failed}`, 'green'));
  console.log('');
  console.log(color("Run 'tibet-audit scan' to verify improvements.", 'dim'));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'scan':
      await runScan(args.slice(1));
      break;
    case 'fix':
      await runFix(args.slice(1));
      break;
    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;
    case 'version':
    case '--version':
    case '-v':
      console.log(`tibet-audit v${VERSION}`);
      break;
    default:
      if (!command) {
        printHelp();
      } else {
        console.error(`Unknown command: ${command}`);
        console.error("Run 'tibet-audit help' for usage.");
        process.exit(1);
      }
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
