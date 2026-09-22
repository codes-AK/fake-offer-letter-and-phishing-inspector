import { DetectedHeuristic } from '../types';

export function detectRealTimeHeuristics(text: string): DetectedHeuristic[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const results: DetectedHeuristic[] = [];
  const lower = text.toLowerCase();

  // 1. Payment Apps & Irreversible Money Methods
  const paymentRegexes = [
    { regex: /\b(zelle)\b/gi, label: 'Zelle Payment Request', desc: 'Irreversible instantaneous P2P payment method frequently leveraged in advance-fee scams.' },
    { regex: /\b(venmo)\b/gi, label: 'Venmo Transfer', desc: 'Personal payment app lacking commercial purchase or escrow safeguards.' },
    { regex: /\b(cash\s*app)\b/gi, label: 'Cash App Transfer', desc: 'Unregistered peer-to-peer money routing with zero fraud refund recourse.' },
    { regex: /\b(wire\s*transfer|wire\s*money|western\s*union|moneygram)\b/gi, label: 'Wire / Cash Forwarding', desc: 'High-risk irreversible cash wire request, hallmark of employment equipment fraud.' },
    { regex: /\b(bitcoin|btc|crypto|usdt|ethereum|gift\s*card(s)?)\b/gi, label: 'Crypto / Gift Card Remittance', desc: 'Anonymous untraceable token settlement, classic indicator of financial extortion or fraudulent payment.' },
  ];

  for (const { regex, label, desc } of paymentRegexes) {
    const matches = text.match(regex);
    if (matches) {
      results.push({
        id: `pay-${label}-${matches[0]}`,
        category: 'PAYMENT_APP',
        matched_text: matches[0],
        label,
        risk: 'CRITICAL',
        description: desc,
      });
    }
  }

  // 2. Off-Platform Channels & Handles
  const commRegexes = [
    { regex: /\b(telegram|t\.me\/[a-zA-Z0-9_]+)\b/gi, label: 'Telegram Off-Platform Channel', desc: 'Redirection to encrypted non-corporate chat evasion layer.' },
    { regex: /\b(whatsapp|wa\.me\/[0-9+]+)\b/gi, label: 'WhatsApp Private Routing', desc: 'Attempts to bypass corporate audit logs and enterprise monitoring.' },
    { regex: /\b(signal\s*app|signal\s*chat)\b/gi, label: 'Signal Anonymous Channel', desc: 'Off-platform encrypted messaging.' },
    { regex: /@([a-zA-Z0-9_]{4,32})\b/g, label: 'Handle / Alias Mention', desc: 'Personal username reference rather than corporate support desk.' },
  ];

  for (const { regex, label, desc } of commRegexes) {
    // avoid false positive on normal emails for @handle
    if (label === 'Handle / Alias Mention') {
      const handles = text.match(regex);
      if (handles) {
        // filter out email addresses like name@company.com
        const filtered = handles.filter((h) => {
          const idx = text.indexOf(h);
          if (idx > 0 && /[a-zA-Z0-9._-]/.test(text[idx - 1])) {
            return false; // Part of email
          }
          return true;
        });
        if (filtered.length > 0 && (lower.includes('telegram') || lower.includes('contact') || lower.includes('dm'))) {
          results.push({
            id: `comm-handle-${filtered[0]}`,
            category: 'OFF_PLATFORM',
            matched_text: filtered[0],
            label: 'Off-Platform Direct Handle',
            risk: 'HIGH',
            description: desc,
          });
        }
      }
      continue;
    }

    const matches = text.match(regex);
    if (matches) {
      results.push({
        id: `comm-${label}-${matches[0]}`,
        category: 'OFF_PLATFORM',
        matched_text: matches[0],
        label,
        risk: 'HIGH',
        description: desc,
      });
    }
  }

  // 3. Suspicious / High-Abuse TLDs
  const suspiciousTldRegex = /\b([a-zA-Z0-9-]+\.(top|xyz|cc|ru|cn|click|buzz|monster|link|rest|tk|ml|ga|cf|pw|work|shop|site))\b/gi;
  const tldMatches = text.match(suspiciousTldRegex);
  if (tldMatches) {
    for (const match of Array.from(new Set(tldMatches))) {
      results.push({
        id: `tld-${match}`,
        category: 'SUSPICIOUS_TLD',
        matched_text: match,
        label: `High-Risk TLD (${match})`,
        risk: 'CRITICAL',
        description: 'Host domain uses a low-cost, disposable top-level domain frequently associated with spam and phishing campaigns.',
      });
    }
  }

  // 4. Advance Fee & Overpayment Triggers
  const advanceFeeRegex = /\b(cashier('?s)?\s*check|send\s*(us|me)?\s*(\$|\d+).*back|check.*deposit.*wire|equipment\s*(vendor|check|funds)|refundable\s*deposit|pre-employment\s*screening\s*fee)\b/gi;
  const feeMatches = text.match(advanceFeeRegex);
  if (feeMatches) {
    results.push({
      id: `advance-fee-${feeMatches[0]}`,
      category: 'ADVANCE_FEE',
      matched_text: feeMatches[0],
      label: 'Advance-Fee / Fake Check Indicator',
      risk: 'CRITICAL',
      description: 'Pattern matches fake check cashing overpayment or upfront hardware purchase scam.',
    });
  }

  // 5. Artificial Urgency / Pressure
  const urgencyRegex = /\b(act\s*immediately|within\s*24\s*hours|immediate\s*action\s*required|account\s*(will\s*be\s*)?suspended|final\s*warning|offer\s*expires\s*today)\b/gi;
  const urgencyMatches = text.match(urgencyRegex);
  if (urgencyMatches) {
    results.push({
      id: `urgency-${urgencyMatches[0]}`,
      category: 'URGENCY',
      matched_text: urgencyMatches[0],
      label: 'Psychological Urgency Trigger',
      risk: 'MODERATE',
      description: 'High-pressure countdown forcing recipient to act without independent verification.',
    });
  }

  // Deduplicate by ID
  const seen = new Set<string>();
  return results.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

/**
 * Checks if input is gibberish, non-contextual or randomized
 */
export function isGibberishInput(text: string): { isGibberish: boolean; reason?: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    return { isGibberish: true, reason: 'Empty input.' };
  }

  if (trimmed.length < 5) {
    return { isGibberish: true, reason: 'Payload length is under minimum 5 character threshold.' };
  }

  // Single word known harmless tests
  if (/^(hello|hi|hey|test|testing|ping|asdf|qwerty|rerun)$/i.test(trimmed)) {
    return { isGibberish: true, reason: 'Non-contextual placeholder greeting or keyword.' };
  }

  // Repetition of characters e.g. "aaaaaaaa", "11111111"
  if (/^([a-zA-Z0-9])\1{5,}$/i.test(trimmed)) {
    return { isGibberish: true, reason: 'Monotonous repeating character pattern detected.' };
  }

  // Check random keyboard mash without spaces and high consonant ratio
  if (trimmed.length > 10 && !trimmed.includes(' ') && !trimmed.includes('/') && !trimmed.includes('@')) {
    const vowels = (trimmed.match(/[aeiouy]/gi) || []).length;
    const ratio = vowels / trimmed.length;
    if (ratio < 0.1 || ratio > 0.9) {
      return { isGibberish: true, reason: 'Atypical character entropy consistent with keyboard mash.' };
    }
  }

  return { isGibberish: false };
}
