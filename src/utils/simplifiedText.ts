import { SecurityReport } from '../types';

export interface PlainEnglishExplanation {
  headline: string;
  verdict: string;
  whatIsHappening: string;
  theTrick: string;
  whatYouRiskLosing: string;
  immediateActions: string[];
  safeVerdictExplanation?: string;
  jargonTranslations: { term: string; simpleExplanation: string }[];
}

export function generatePlainEnglishExplanation(report: SecurityReport): PlainEnglishExplanation {
  const score = report.scam_threat_index;
  const isCritical = report.risk_level === 'CRITICAL' || score >= 80;
  const isHigh = !isCritical && (report.risk_level === 'HIGH' || score >= 60);
  const isModerate = !isCritical && !isHigh && (report.risk_level === 'MODERATE' || score >= 30);
  const isLow = !isCritical && !isHigh && !isModerate && (report.risk_level === 'LOW' || (score >= 1 && score < 30));
  const isUnknown = report.risk_level === 'UNKNOWN' || score === 0;

  const categoryLower = (report.category || '').toLowerCase();
  const summaryLower = (report.summary || '').toLowerCase();
  const isJobScam = categoryLower.includes('job') || summaryLower.includes('job') || summaryLower.includes('interview');
  const isRentalScam = categoryLower.includes('rental') || categoryLower.includes('apartment') || summaryLower.includes('rental');
  const isPhishing = categoryLower.includes('phishing') || categoryLower.includes('credential') || summaryLower.includes('password') || summaryLower.includes('login');
  const isJailbreak = categoryLower.includes('jailbreak') || categoryLower.includes('injection');

  const jargonTranslations: { term: string; simpleExplanation: string }[] = [];

  if (report.advance_fee_detected) {
    jargonTranslations.push({
      term: 'Advance-Fee Trap',
      simpleExplanation: 'They ask you to pay or forward money upfront (or deposit a fake check) promising you will get it back. You will not.',
    });
  }

  if (report.suspicious_channels && report.suspicious_channels.length > 0) {
    jargonTranslations.push({
      term: 'Off-Platform Channel (Telegram/WhatsApp)',
      simpleExplanation: 'Scammers move you away from official company websites so their accounts cannot be banned or traced.',
    });
  }

  if (report.domain_analysis?.spoofing_or_mismatch_detected) {
    jargonTranslations.push({
      term: 'Domain Spoofing / Lookalike Website',
      simpleExplanation: 'The web address looks almost like a famous company, but has subtle spelling tricks, hyphens, or a strange ending (.xyz, .net).',
    });
  }

  if (report.identity_harvesting_detected) {
    jargonTranslations.push({
      term: 'Identity Harvesting',
      simpleExplanation: 'Trying to trick you into typing your Social Security Number, passport, or banking password so they can steal your accounts.',
    });
  }

  if (report.urgency_level === 'HIGH' || report.urgency_level === 'EXTREME') {
    jargonTranslations.push({
      term: 'Urgency Manipulation',
      simpleExplanation: 'Claiming "You have 2 hours!" or "Immediate action required!" to panic you into acting before you can ask a friend.',
    });
  }

  // 1. Critical Scenario
  if (isCritical) {
    if (isJailbreak) {
      return {
        headline: 'Security Attack: System Override Attempt',
        verdict: 'Dangerous: Do Not Run or Trust This Text',
        whatIsHappening: 'Someone submitted technical commands designed to trick the AI analyzer into turning off its security filters.',
        theTrick: 'They use words like "Ignore previous instructions" or "System override" trying to bypass fraud protection.',
        whatYouRiskLosing: 'If this was executed in an automated system, it could bypass security rules and allow scammers through.',
        immediateActions: [
          'Treat this content as untrusted attack text.',
          'Do not click any embedded links or run code mentioned inside it.',
        ],
        jargonTranslations,
      };
    }

    if (isJobScam) {
      return {
        headline: 'Confirmed Job Scam: Fake Check / Money Forwarding Scheme',
        verdict: 'Danger: 100% Fake Job Offer',
        whatIsHappening: 'A scammer is pretending to hire you for a high-paying remote job, but their only goal is to steal money from your bank account.',
        theTrick: 'They promise very high hourly pay (like $50-$120/hr) with almost no interview. Then they tell you to download Telegram, send you a fake check, and tell you to wire that money to their "vendor" for home office equipment. The check bounces days later, and your bank holds you responsible for all the money you sent.',
        whatYouRiskLosing: 'Thousands of dollars from your own savings that the bank will demand back once the fake check bounces, plus your identity if you sent your Social Security number.',
        immediateActions: [
          'Do NOT deposit any check they send you—even if your mobile banking app shows funds temporarily available.',
          'Never send money via Zelle, Venmo, Wire Transfer, or Gift Cards to anyone claiming to be an employer.',
          'Stop talking to them on Telegram or WhatsApp immediately.',
          'Block their email and phone number.',
        ],
        jargonTranslations,
      };
    }

    if (isRentalScam) {
      return {
        headline: 'Confirmed Rental Scam: Fake Landlord Listing',
        verdict: 'Danger: Fake Apartment / Stolen Photos',
        whatIsHappening: 'Someone copy-pasted photos of a real home and is pretending to be the landlord while claiming they are out of the country.',
        theTrick: 'They offer an amazing rent price way below normal market rates. They tell you they cannot show you the inside until you send a deposit or first month rent via Zelle or wire.',
        whatYouRiskLosing: 'All deposit money you send. You will arrive at the address and find out the scammer never owned the property.',
        immediateActions: [
          'Never wire or send deposit money before walking inside the property with a licensed agent.',
          'Look up the address on county tax records or Google Street View.',
          'Cut all communication immediately.',
        ],
        jargonTranslations,
      };
    }

    return {
      headline: 'Critical Threat: Malicious Scam / Theft Attempt',
      verdict: 'High Alert: Clear Fraud Pattern Detected',
      whatIsHappening: 'This communication is a counterfeit message designed to trick you into sending money, buying gift cards, or handing over sensitive accounts.',
      theTrick: 'The sender uses false urgency, promises huge rewards, or claims your account is frozen so you act fast without double-checking.',
      whatYouRiskLosing: 'Your money, your passwords, and control over your email or banking accounts.',
      immediateActions: [
        'Stop responding immediately.',
        'Never send funds through Zelle, Wire, Cash App, or Crypto.',
        'Do not click links or download attachments.',
      ],
      jargonTranslations,
    };
  }

  // 2. High Risk Scenario
  if (isHigh) {
    if (isPhishing) {
      return {
        headline: 'Dangerous Phishing: Fake Login / Password Theft',
        verdict: 'Warning: Fake Security Alert or Sign-in Page',
        whatIsHappening: 'A scammer is pretending to be a bank, tech company, or government service to steal your password and login codes.',
        theTrick: 'They send a scary email saying "Your account is suspended!" and give you a link to a website that looks identical to the real login page.',
        whatYouRiskLosing: 'Access to your real account, your email, and any credit cards saved inside.',
        immediateActions: [
          'Do NOT click the link in the message.',
          'If you want to check your account, open a new browser tab and type the official address yourself (like bank.com).',
          'If you already typed your password, change it immediately on the real website and turn on two-factor authentication.',
        ],
        jargonTranslations,
      };
    }

    return {
      headline: 'High Risk: Likely Scam or Phishing Attempt',
      verdict: 'Warning: Unsafe Communication',
      whatIsHappening: 'This message shows multiple strong warning signs of fraud, including suspicious links, pressure tactics, or unusual requests.',
      theTrick: 'The sender is disguising their identity and trying to rush you into an irreversible action.',
      whatYouRiskLosing: 'Personal identification information (SSN, date of birth) or unauthorized charges on your bank account.',
      immediateActions: [
        'Do not share personal details, IDs, or banking numbers.',
        'Verify the sender by calling their public phone number from their official website, not the number in the email.',
        'Delete or report the message as spam.',
      ],
      jargonTranslations,
    };
  }

  // 3. Moderate Risk Scenario
  if (isModerate) {
    return {
      headline: 'Unverified / Suspicious: Proceed with Caution',
      verdict: 'Caution: Unconfirmed Claims & Minor Red Flags',
      whatIsHappening: 'The message has some odd wording, missing contact info, or unverifiable claims, but no direct demand for money or passwords yet.',
      theTrick: 'Sometimes scammers start with friendly, normal-sounding emails to test if you reply before springing the trap.',
      whatYouRiskLosing: 'Wasted time, or falling for a scam if they eventually ask for money or passwords in their next message.',
      immediateActions: [
        'Ask yourself: Did I apply for this? Did I sign up for this service?',
        'Look up the company on LinkedIn or Google and confirm the recruiter or sender is a real employee.',
        'Never agree to move to Telegram or WhatsApp if they ask later.',
      ],
      jargonTranslations,
    };
  }

  // 4. Low Risk Scenario
  if (isLow) {
    return {
      headline: 'Looks Legitimate: Standard Corporate Communication',
      verdict: 'Safe: Conforms to Authentic Professional Patterns',
      whatIsHappening: 'This message looks like a normal, legitimate email or business message. No scam patterns were found.',
      theTrick: 'None detected. The company uses official email domains, does not ask for upfront money, and follows standard interview or business procedures.',
      whatYouRiskLosing: 'Low to no risk observed. Normal healthy communication.',
      immediateActions: [
        'You can proceed normally.',
        'Still keep standard habits: never share passwords or wire money for job equipment.',
      ],
      safeVerdictExplanation: 'Verified sender domain, reasonable business context, and zero demands for wire transfers, crypto, or private passwords.',
      jargonTranslations: [
        {
          term: 'Authentic Corporate Pattern',
          simpleExplanation: 'The message matches how real reputable companies speak, with legitimate company domain names and professional interview steps.',
        },
      ],
    };
  }

  // 5. Unknown / Inconclusive Scenario
  return {
    headline: 'Inconclusive: Not Enough Information',
    verdict: 'Unknown: Need More Text or Email Body',
    whatIsHappening: 'The text provided was too short, empty, or just a few test words like "hello", so our security scanner cannot evaluate it.',
    theTrick: 'Cannot tell without real message content.',
    whatYouRiskLosing: 'Unknown.',
    immediateActions: [
      'Copy and paste the full email, job offer, or text message you received.',
      'Include who sent it, their email address, and any links they provided.',
    ],
    jargonTranslations: [],
  };
}
