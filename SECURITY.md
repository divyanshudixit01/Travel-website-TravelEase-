# Security Policy

## Supported Versions

TravelEase maintains active security support for the current production release.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take the security and privacy of our travelers and platform users very seriously. If you discover a vulnerability or potential security flaw, please follow our responsible disclosure guidelines:

1. **Do not create a public GitHub issue.** Public issues disclose vulnerabilities before patches can be deployed.
2. **Report Privately**: Please submit your vulnerability report to `security@travelease.com` with:
   - Detailed description of the vulnerability and attack vector.
   - Proof of concept (PoC) steps or script.
   - Impact assessment (e.g., data disclosure, denial of service, privilege escalation).
3. **Response Window**: Our engineering security team acknowledges reports within **24 hours** and aims to validate and patch critical issues within **72 hours**.
4. **Recognition**: We are pleased to acknowledge ethical security researchers in our release notes upon coordinated public disclosure.

---

## Security Architecture & Best Practices

TravelEase employs a multi-tiered defense-in-depth model:
- **Zero-Trust Authoritative Pricing**: All quotes, taxes, and final payable amounts are cryptographically signed using HMAC-SHA256 tokens and verified on checkout to prevent client-side parameter tampering.
- **Input Sanitization**: Deep recursive object sanitization eliminates MongoDB query selector injections (`$gt`, `$where`) and Prototype Pollution vectors (`__proto__`, `constructor`).
- **HTTP Hardening**: Strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), cross-origin isolation, and rate-limiting across authentication endpoints.
- **Credential Storage**: Passwords hashed using bcrypt (cost factor 10). Production JWT secrets and payment credentials are never exposed to client-side bundles.
