import { EmailHeaderAnalysis, EmailHeaderHop } from '../types';

export function parseEmailHeaders(rawHeaders: string): EmailHeaderAnalysis {
  const lines = rawHeaders.split(/\r?\n/);
  const headerMap: Record<string, string> = {};
  let currentKey = '';

  // Unfold folded RFC 822 header lines
  for (const line of lines) {
    if (/^\s+[^\s]/.test(line) && currentKey) {
      headerMap[currentKey] = (headerMap[currentKey] || '') + ' ' + line.trim();
    } else {
      const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (match) {
        currentKey = match[1].toLowerCase();
        headerMap[currentKey] = match[2].trim();
      }
    }
  }

  // Extract common header fields
  const fromHeader = headerMap['from'] || '';
  const returnPath = headerMap['return-path'] || '';
  const replyTo = headerMap['reply-to'] || '';
  const authResults = headerMap['authentication-results'] || '';
  const receivedSpf = headerMap['received-spf'] || '';
  const dkimSig = headerMap['dkim-signature'] || '';

  // Extract From Domain
  let senderDomain = '';
  const fromEmailMatch = fromHeader.match(/<([^>]+)>/) || fromHeader.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (fromEmailMatch) {
    const parts = fromEmailMatch[1].split('@');
    if (parts.length > 1) {
      senderDomain = parts[1].toLowerCase();
    }
  }

  // Extract Return-Path Domain
  let returnDomain = '';
  const returnEmailMatch = returnPath.match(/<([^>]+)>/) || returnPath.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (returnEmailMatch) {
    const parts = returnEmailMatch[1].split('@');
    if (parts.length > 1) {
      returnDomain = parts[1].toLowerCase();
    }
  }

  // 1. Evaluate SPF
  let spfStatus: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL' | 'NONE' | 'UNKNOWN' = 'NONE';
  let spfDetails = 'No SPF authentication record found in headers.';
  const combinedSpfText = (authResults + ' ' + receivedSpf).toLowerCase();

  if (combinedSpfText.includes('spf=pass') || combinedSpfText.includes('pass (')) {
    spfStatus = 'PASS';
    spfDetails = 'Designated sending MTA is explicitly authorized by domain DNS SPF record.';
  } else if (combinedSpfText.includes('spf=fail') || combinedSpfText.includes('fail (')) {
    spfStatus = 'FAIL';
    spfDetails = 'Sender IP address is NOT authorized by the originating domain SPF record (high spoofing risk).';
  } else if (combinedSpfText.includes('spf=softfail') || combinedSpfText.includes('softfail')) {
    spfStatus = 'SOFTFAIL';
    spfDetails = 'SPF Softfail: IP is discouraged or transitioning. Potential unauthorized relay.';
  } else if (combinedSpfText.includes('spf=neutral') || combinedSpfText.includes('neutral')) {
    spfStatus = 'NEUTRAL';
    spfDetails = 'SPF record explicitly declines to assert legitimacy (?all).';
  }

  // 2. Evaluate DKIM
  let dkimStatus: 'PASS' | 'FAIL' | 'NONE' | 'UNKNOWN' = 'NONE';
  let dkimDetails = 'No cryptographic DKIM signature found.';
  const combinedDkimText = authResults.toLowerCase();

  if (combinedDkimText.includes('dkim=pass') || (dkimSig && !combinedDkimText.includes('dkim=fail'))) {
    dkimStatus = 'PASS';
    dkimDetails = 'Valid cryptographic signature verified against published public DNS key.';
  } else if (combinedDkimText.includes('dkim=fail')) {
    dkimStatus = 'FAIL';
    dkimDetails = 'Cryptographic body hash or signature mismatch. Email content altered in transit or key revoked.';
  }

  // 3. Evaluate DMARC
  let dmarcStatus: 'PASS' | 'FAIL' | 'NONE' | 'UNKNOWN' = 'NONE';
  let dmarcPolicy = 'none';
  if (combinedDkimText.includes('dmarc=pass')) {
    dmarcStatus = 'PASS';
  } else if (combinedDkimText.includes('dmarc=fail')) {
    dmarcStatus = 'FAIL';
  }

  const dmarcPolicyMatch = authResults.match(/dmarc=.*?(action|policy|p)=(reject|quarantine|none)/i);
  if (dmarcPolicyMatch) {
    dmarcPolicy = dmarcPolicyMatch[2].toLowerCase();
  }

  // 4. Envelope Alignment Check
  let envelopeAligned = true;
  const spoofingFlags: string[] = [];

  if (senderDomain && returnDomain && senderDomain !== returnDomain) {
    // If different top domain
    const senderRoot = senderDomain.split('.').slice(-2).join('.');
    const returnRoot = returnDomain.split('.').slice(-2).join('.');
    if (senderRoot !== returnRoot) {
      envelopeAligned = false;
      spoofingFlags.push(
        `Envelope Sender Mismatch: Displayed From domain (${senderDomain}) does not align with MailFrom / Return-Path (${returnDomain}).`
      );
    }
  }

  if (replyTo && senderDomain) {
    const replyToEmailMatch = replyTo.match(/<([^>]+)>/) || replyTo.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (replyToEmailMatch) {
      const replyDomain = replyToEmailMatch[1].split('@')[1]?.toLowerCase();
      const replyRoot = replyDomain ? replyDomain.split('.').slice(-2).join('.') : '';
      const senderRoot = senderDomain.split('.').slice(-2).join('.');
      if (replyDomain && replyRoot !== senderRoot) {
        spoofingFlags.push(
          `Deceptive Reply-To Target: Responses will be routed to ${replyDomain} instead of declared sender ${senderDomain}.`
        );
      }
    }
  }

  if (spfStatus === 'FAIL') {
    spoofingFlags.push('SPF Authentication Failed: IP transmission did not originate from authorized mailservers.');
  }

  if (dkimStatus === 'FAIL') {
    spoofingFlags.push('DKIM Cryptographic Integrity Broken: Message tampering or forged signature.');
  }

  if (dmarcStatus === 'FAIL') {
    spoofingFlags.push('DMARC Alignment Breach: Header fails enterprise domain policy.');
  }

  // 5. Parse Received Hops (IP trace)
  const hops: EmailHeaderHop[] = [];
  const receivedLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^Received:/i.test(lines[i])) {
      let fullBlock = lines[i].replace(/^Received:\s*/i, '');
      while (i + 1 < lines.length && /^\s+[^\s]/.test(lines[i + 1])) {
        i++;
        fullBlock += ' ' + lines[i].trim();
      }
      receivedLines.push(fullBlock);
    }
  }

  let hopIdx = 1;
  let originatingIp = '';

  for (const block of receivedLines) {
    const fromMatch = block.match(/from\s+([^\s;]+)/i);
    const byMatch = block.match(/by\s+([^\s;]+)/i);
    const ipMatch = block.match(/\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]/);
    const tlsMatch = block.match(/(using\s+TLS[v0-9.]+|version=TLS[0-9._]+)/i);
    const dateMatch = block.match(/;\s*([A-Za-z0-9,:\s+-]+)$/);

    const ip = ipMatch ? ipMatch[1] : undefined;
    if (ip && !originatingIp) {
      originatingIp = ip;
    }

    const isSuspicious = ip ? isPrivateOrSuspiciousIp(ip) : false;

    hops.push({
      hop_number: hopIdx++,
      from: fromMatch ? fromMatch[1].replace(/[()]/g, '') : undefined,
      by: byMatch ? byMatch[1] : undefined,
      ip,
      tls: tlsMatch ? tlsMatch[0] : 'Cleartext / Unencrypted',
      timestamp: dateMatch ? dateMatch[1].trim() : undefined,
      is_suspicious: isSuspicious,
    });
  }

  return {
    is_header_input: Boolean(fromHeader || receivedLines.length > 0 || authResults),
    spf_status: spfStatus,
    spf_details: spfDetails,
    dkim_status: dkimStatus,
    dkim_details: dkimDetails,
    dmarc_status: dmarcStatus,
    dmarc_policy: dmarcPolicy,
    sender_from: fromHeader || undefined,
    sender_domain: senderDomain || undefined,
    return_path: returnPath || undefined,
    return_domain: returnDomain || undefined,
    reply_to: replyTo || undefined,
    envelope_aligned: envelopeAligned,
    spoofing_flags: spoofingFlags,
    originating_ip: originatingIp || undefined,
    hops,
  };
}

function isPrivateOrSuspiciousIp(ip: string): boolean {
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('127.')) {
    return false; // Private LAN
  }
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
    return false;
  }
  return false;
}
