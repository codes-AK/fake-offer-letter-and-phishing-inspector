# 🛡️ CyberSafe Fraud Shield & Phishing Inspector

An AI-powered cybersecurity analysis engine built for hackathons to detect fraudulent job offer letters, email spoofing, advance-fee scams, and social engineering traps in real-time.

---

## ⚡ Overview
CyberSafe Fraud Shield combines fast threat detection heuristics with **Google Gemini 3.8 Flash** to deliver actionable, enterprise-grade forensic reports. It evaluates raw text, job offers, and raw email headers to protect users from financial fraud and identity theft.

---

## ✨ Key Features
* **Scam Threat Index (0–100%):** Immediate visual risk gauge powered by structured JSON evaluation.
* **Email Header Spoof Inspector:** Deep forensic parsing for SPF, DKIM, DMARC alignment, and reply-to discrepancies.
* **Real-Time Threat Sensors:** Highlights high-risk domain TLDs, urgency manipulation tactics, and suspicious financial requests.
* **Jailbreak & Prompt Injection Defense:** Input isolation layers that treat untrusted payload text safely without prompt leakage.
* **Exportable Audit Dossier:** Generates printable, audit-ready threat reports with cryptographic checksum verification and escalation steps.

---

## 🛠️ Tech Stack
* **Frontend:** React, Vite, TypeScript, Tailwind CSS
* **AI Engine:** Google Gemini 3.8 Flash (`@google/genai` SDK)
  
