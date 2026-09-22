export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'UNKNOWN';

export type UrgencyLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface DomainAnalysis {
  identified_domains: string[];
  spoofing_or_mismatch_detected: boolean;
  notes: string;
}

export interface ForensicEvidenceItem {
  flag: string;
  impact_rating: string; // e.g. "Critical Financial Loss Threat", "High PII Harvesting Risk", "Domain Spoofing / Evasion"
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  technical_explanation: string;
}

export interface EmailHeaderHop {
  hop_number: number;
  hop_index?: number;
  from?: string;
  from_host?: string;
  by?: string;
  by_host?: string;
  ip?: string;
  tls?: string;
  tls_encrypted?: boolean;
  timestamp?: string;
  is_suspicious?: boolean;
  suspicious?: boolean;
}

export interface EmailHeaderAnalysis {
  is_header_input: boolean;
  spf_status: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE' | 'UNKNOWN';
  spf_details?: string;
  dkim_status: 'PASS' | 'FAIL' | 'NONE' | 'UNKNOWN';
  dkim_details?: string;
  dmarc_status: 'PASS' | 'FAIL' | 'NONE' | 'UNKNOWN';
  dmarc_policy?: string;
  sender_from?: string;
  sender_domain?: string;
  return_path?: string;
  return_domain?: string;
  reply_to?: string;
  envelope_aligned: boolean;
  spoofing_flags: string[];
  originating_ip?: string;
  hops: EmailHeaderHop[];
}

export interface SecurityReport {
  scam_threat_index: number; // 0 to 100
  risk_level: RiskLevel;
  category: string;
  summary: string;
  red_flags_detected: string[];
  red_flags_forensic?: ForensicEvidenceItem[];
  positive_indicators: string[];
  tactics_identified: string[];
  urgency_level: UrgencyLevel;
  advance_fee_detected: boolean;
  identity_harvesting_detected: boolean;
  suspicious_channels: string[];
  domain_analysis: DomainAnalysis;
  header_analysis?: EmailHeaderAnalysis;
  safety_recommendations: string[];
  verification_steps: string[];
  analyzed_at?: string;
  input_preview?: string;
  input_hash?: string;
}

export interface AnalysisRequest {
  content: string;
  mode?: 'raw' | 'email_headers';
  source_type?: 'auto' | 'email' | 'job_offer' | 'rental' | 'sms' | 'url';
}

export interface DetectedHeuristic {
  id: string;
  category: 'PAYMENT_APP' | 'OFF_PLATFORM' | 'SUSPICIOUS_TLD' | 'ADVANCE_FEE' | 'URGENCY';
  matched_text: string;
  label: string;
  risk: 'CRITICAL' | 'HIGH' | 'MODERATE';
  description: string;
}

export interface PresetSample {
  id: string;
  title: string;
  category: string;
  description: string;
  expectedRisk: RiskLevel;
  mode?: 'raw' | 'email_headers';
  content: string;
}

