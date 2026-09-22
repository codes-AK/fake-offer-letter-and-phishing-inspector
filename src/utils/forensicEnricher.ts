import { ForensicEvidenceItem } from '../types';

export function enrichRedFlags(rawFlags: string[]): ForensicEvidenceItem[] {
  if (!rawFlags || rawFlags.length === 0) {
    return [];
  }

  return rawFlags.map((flag) => {
    const lower = flag.toLowerCase();

    // 1. Advance-Fee / Financial Loss
    if (
      lower.includes('advance-fee') ||
      lower.includes('zelle') ||
      lower.includes('wire') ||
      lower.includes('cashier') ||
      lower.includes('vendor') ||
      lower.includes('overpayment') ||
      lower.includes('money transfer') ||
      lower.includes('irreversible')
    ) {
      return {
        flag,
        impact_rating: 'Critical Financial Loss Threat',
        severity: 'CRITICAL',
        technical_explanation:
          'Exploits Regulation CC clearing float: Banks are legally mandated to make check funds accessible within 1-2 business days before true interbank settlement (which takes 4-7 days). Fraudsters instruct victims to forward funds via non-clawback rails (Zelle/Wire) before the fake check inevitably bounces, leaving the victim strictly liable for the entire overdraft balance.',
      };
    }

    // 2. Off-platform routing / Telegram / WhatsApp
    if (
      lower.includes('telegram') ||
      lower.includes('whatsapp') ||
      lower.includes('off-platform') ||
      lower.includes('signal') ||
      lower.includes('channel')
    ) {
      return {
        flag,
        impact_rating: 'Enterprise Audit Evasion & Tracking Obstruction',
        severity: 'HIGH',
        technical_explanation:
          'Criminal syndicates deliberately divert candidates away from monitored corporate portals (LinkedIn, Greenhouse, Workday) to end-to-end encrypted messaging apps. This completely bypasses enterprise DLP (Data Loss Prevention) sensors, prevents account termination by job board trust teams, and obscures sender IP metadata.',
      };
    }

    // 3. Domain Spoofing / Lookalikes
    if (
      lower.includes('domain') ||
      lower.includes('spoof') ||
      lower.includes('mismatch') ||
      lower.includes('lookalike') ||
      lower.includes('envelope') ||
      lower.includes('tld')
    ) {
      return {
        flag,
        impact_rating: 'Brand Impersonation & Malicious Infrastructure Abuse',
        severity: 'HIGH',
        technical_explanation:
          'Utilizes typosquatting, hyphenated sub-domains, or newly registered top-level domains (.top, .xyz) mimicking legitimate corporate brands. Attackers configure autonomous mail servers without SPF/DKIM alignment to spoof corporate executive or recruiting communications.',
      };
    }

    // 4. PII Harvesting / Identity Theft
    if (
      lower.includes('ssn') ||
      lower.includes('social security') ||
      lower.includes('pii') ||
      lower.includes('banking') ||
      lower.includes('credential') ||
      lower.includes('identity') ||
      lower.includes('passport')
    ) {
      return {
        flag,
        impact_rating: 'High PII Harvesting & Synthetic Identity Theft Hazard',
        severity: 'HIGH',
        technical_explanation:
          'Early-stage requests for government identifiers, date of birth, driver license scans, or bank routing numbers violate standard corporate recruitment pipelines. Stolen data is immediately monetized on darknet forums or utilized to open fraudulent credit lines and synthetic identities.',
      };
    }

    // 5. Unrealistic compensation / Financial bait
    if (lower.includes('unrealistic') || lower.includes('compensation') || lower.includes('pay') || lower.includes('hourly') || lower.includes('$75')) {
      return {
        flag,
        impact_rating: 'Greed-Vector Psychological Baiting',
        severity: 'MODERATE',
        technical_explanation:
          'Promising exaggerated wages ($70–$120/hr) for generic clerical, typing, or data entry positions targets job seekers in economic distress, deliberately dulling their critical skepticism before delivering advance-fee or identity-harvesting requests.',
      };
    }

    // 6. Urgency / Pressure
    if (lower.includes('urgency') || lower.includes('pressure') || lower.includes('immediate') || lower.includes('hours') || lower.includes('deadline')) {
      return {
        flag,
        impact_rating: 'Cognitive Overload & Psychological Pressure Vector',
        severity: 'MODERATE',
        technical_explanation:
          'Imposes artificial time limits (e.g., "reply within 2 hours or your spot will be given away") to trigger adrenaline-induced panic. This prevents the victim from conducting independent out-of-band verification or consulting security professionals.',
      };
    }

    // 7. Prompt Injection / Adversarial
    if (lower.includes('jailbreak') || lower.includes('prompt injection') || lower.includes('override')) {
      return {
        flag,
        impact_rating: 'Adversarial Threat Defense Evasion',
        severity: 'CRITICAL',
        technical_explanation:
          'Payload contains explicit adversarial instructions intended to hijack LLM system prompts and subvert defensive posture. All execution is hard-isolated to protect analyzer integrity.',
      };
    }

    // Default / Generic
    return {
      flag,
      impact_rating: 'Deceptive Communication Anomaly',
      severity: 'MODERATE',
      technical_explanation:
        'This pattern violates baseline enterprise communication authenticity standards and strongly correlates with known phishing or impersonation campaign playbooks.',
    };
  });
}

/**
 * Computes a pseudo-cryptographic deterministic SHA-256 style hex hash string
 */
export async function computePayloadHash(content: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(content);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }
  } catch (err) {
    // fallback
  }

  // Pure JS fallback FNV-1a / polynomial hash formatted as 64-hex string
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `sha256_${part1}${part2}${part1}${part2}`.padEnd(64, '0');
}
