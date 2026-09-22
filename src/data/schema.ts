export const SECURITY_REPORT_JSON_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SecurityFraudReport",
  "type": "object",
  "required": [
    "scam_threat_index",
    "risk_level",
    "category",
    "summary",
    "red_flags_detected",
    "positive_indicators",
    "tactics_identified",
    "urgency_level",
    "advance_fee_detected",
    "identity_harvesting_detected",
    "suspicious_channels",
    "domain_analysis",
    "safety_recommendations",
    "verification_steps"
  ],
  "properties": {
    "scam_threat_index": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100,
      "description": "Calculated deterministic threat score from 0 (Safe / Unknown) to 100 (Critical Scam / Injection)."
    },
    "risk_level": {
      "type": "string",
      "enum": ["CRITICAL", "HIGH", "MODERATE", "LOW", "UNKNOWN"],
      "description": "Deterministic tier assignment based strictly on Risk Assessment Criteria."
    },
    "category": {
      "type": "string",
      "description": "Classified fraud or threat category (e.g., Job Offer Scam, Phishing, Rental Fraud, Adversarial Jailbreak)."
    },
    "summary": {
      "type": "string",
      "description": "Concise, clear executive summary of primary risk factors and findings."
    },
    "red_flags_detected": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Itemized evidence and suspicious markers detected in communication."
    },
    "positive_indicators": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Legitimate enterprise markers, verified corporate patterns, or clear contact paths."
    },
    "tactics_identified": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Social engineering and manipulation tactics observed (e.g., Urgency, Advance-Fee, Domain Spoofing)."
    },
    "urgency_level": {
      "type": "string",
      "enum": ["NONE", "LOW", "MODERATE", "HIGH", "EXTREME"],
      "description": "Intensity of psychological pressure and deadline manipulation."
    },
    "advance_fee_detected": {
      "type": "boolean",
      "description": "True if communication instructs recipient to pay or wire money upfront or forward funds."
    },
    "identity_harvesting_detected": {
      "type": "boolean",
      "description": "True if sensitive personal PII (SSN, banking credentials, CVV, passwords) was requested."
    },
    "suspicious_channels": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Off-platform or irreversible payment/communication channels (Telegram, WhatsApp, Zelle, Crypto)."
    },
    "domain_analysis": {
      "type": "object",
      "required": ["identified_domains", "spoofing_or_mismatch_detected", "notes"],
      "properties": {
        "identified_domains": {
          "type": "array",
          "items": { "type": "string" },
          "description": "Domain names extracted from the payload."
        },
        "spoofing_or_mismatch_detected": {
          "type": "boolean",
          "description": "True if domains exhibit lookalike patterns, hyphenation, or brand mismatches."
        },
        "notes": {
          "type": "string",
          "description": "Detailed notes on domain hygiene and reputation."
        }
      }
    },
    "safety_recommendations": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Immediate protective steps to prevent financial loss or credential exposure."
    },
    "verification_steps": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Concrete out-of-band steps to authenticate claims with genuine organizations."
    }
  }
};
