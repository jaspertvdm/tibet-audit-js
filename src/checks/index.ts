/**
 * TIBET Audit Checks
 *
 * All compliance checks across 10+ frameworks.
 * Now with NIS2 - 76 days until the tsunami!
 */

import { Check } from '../types';
import { GDPR_CHECKS } from './gdpr';
import { AI_ACT_CHECKS } from './ai-act';
import { NIS2_CHECKS } from './nis2';
import { PIPA_CHECKS } from './pipa';
import { APPI_CHECKS } from './appi';
import { PDPA_CHECKS } from './pdpa';
import { LGPD_CHECKS } from './lgpd';
import { JIS_CHECKS } from './jis';

export const ALL_CHECKS: Check[] = [
  ...GDPR_CHECKS,
  ...AI_ACT_CHECKS,
  ...NIS2_CHECKS,
  ...PIPA_CHECKS,
  ...APPI_CHECKS,
  ...PDPA_CHECKS,
  ...LGPD_CHECKS,
  ...JIS_CHECKS,
];

export {
  GDPR_CHECKS,
  AI_ACT_CHECKS,
  NIS2_CHECKS,
  PIPA_CHECKS,
  APPI_CHECKS,
  PDPA_CHECKS,
  LGPD_CHECKS,
  JIS_CHECKS,
};
