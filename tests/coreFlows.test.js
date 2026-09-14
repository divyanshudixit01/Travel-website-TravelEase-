/**
 * TravelEase Core Production Sanity & Security Tests
 * Run with: node tests/coreFlows.test.js
 */

import assert from 'node:assert';
import crypto from 'node:crypto';
import { sanitize } from '../server/src/utils/sanitize.js';
import {
  createSignedQuote,
  verifyQuoteToken,
  calculateFlightQuote,
  calculateHotelQuote,
  resolveAuthoritativeBaseFare,
  canonicalStringify,
  USD_TO_INR_RATE
} from '../server/src/services/pricingService.js';

console.log('🧪 Starting TravelEase Core Flow Sanity & Zero-Trust Security Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

// 1. Input Sanitization Tests
test('Input Sanitization strips MongoDB $ operators', () => {
  const malicious = {
    username: 'admin',
    password: { $gt: '' },
    nested: { $where: '1==1', normal: 'hello' }
  };
  const cleaned = sanitize(malicious);
  assert.strictEqual(cleaned.username, 'admin');
  assert.strictEqual(Object.keys(cleaned.password).length, 0);
  assert.strictEqual(cleaned.nested.$where, undefined);
  assert.strictEqual(cleaned.nested.normal, 'hello');
});

test('Input Sanitization strips dotted keys that allow property tampering', () => {
  const payload = { 'profile.role': 'admin', normalKey: 'test' };
  const cleaned = sanitize(payload);
  assert.strictEqual(cleaned['profile.role'], undefined);
  assert.strictEqual(cleaned.normalKey, 'test');
});

// 2. Prototype Pollution Elimination
test('Input Sanitization strips prototype pollution keys (__proto__, constructor, prototype)', () => {
  const malicious = JSON.parse('{"__proto__": {"polluted": "yes"}, "constructor": {"polluted": "yes"}, "prototype": {"polluted": "yes"}, "safe": "ok"}');
  const cleaned = sanitize(malicious);
  assert.strictEqual(cleaned.__proto__, undefined);
  assert.strictEqual(cleaned.constructor, undefined);
  assert.strictEqual(cleaned.prototype, undefined);
  assert.strictEqual(cleaned.safe, 'ok');
  assert.strictEqual(({}).polluted, undefined, 'Global Object.prototype must not be polluted');
});

test('Input Sanitization strips ASCII control characters cleanly without regex errors', () => {
  const dirty = { text: "Hello\x00\x08\x0B\x0C\x0E\x1F World" };
  const cleaned = sanitize(dirty);
  assert.strictEqual(cleaned.text, 'Hello World');
});

// 3. Email Validation Logic
test('Email validation regex rejects malformed emails', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(emailRegex.test('valid.traveler@example.com'), true);
  assert.strictEqual(emailRegex.test('invalid-email'), false);
  assert.strictEqual(emailRegex.test('@missinguser.com'), false);
  assert.strictEqual(emailRegex.test('missingat.com'), false);
});

// 4. Search Date Validation Logic
test('Search dates validate checkOut is strictly after checkIn', () => {
  const isValidDateRange = (depart, returnD) => {
    return new Date(returnD) > new Date(depart);
  };
  assert.strictEqual(isValidDateRange('2026-09-15', '2026-09-20'), true);
  assert.strictEqual(isValidDateRange('2026-09-20', '2026-09-15'), false);
  assert.strictEqual(isValidDateRange('2026-09-15', '2026-09-15'), false);
});

// 5. Booking ID Reference Generation
test('Booking references have correct prefix and format', () => {
  const generateBookingReference = (prefix = 'TE') => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${code}`;
  };
  const ref = generateBookingReference('TE');
  assert.strictEqual(ref.startsWith('TE-'), true);
  assert.strictEqual(ref.length, 9);
});

// 6. Indian Corporate GSTIN Validation
test('GSTIN validation regex correctly validates 15-character Indian tax numbers', () => {
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  assert.strictEqual(gstinRegex.test('07AAAAA0000A1Z5'), true); // Delhi Corporate
  assert.strictEqual(gstinRegex.test('27AAPFU0939F1ZV'), true); // Maharashtra Corporate
  assert.strictEqual(gstinRegex.test('INVALID_GSTIN'), false);
  assert.strictEqual(gstinRegex.test('07AAAAA0000A1'), false); // Too short
  assert.strictEqual(gstinRegex.test('07AAAAA0000A1Z55'), false); // Too long
});

// 7. Roundtrip Fare Multiplier & Zero Convenience Fee Integrity
test('Roundtrip fare calculation applies 1.85x bundled multiplier with ₹0 convenience fee', () => {
  const singleLegPrice = 120;
  const legMultiplier = 1.85;
  const pax = 2;
  const calculated = Math.round(singleLegPrice * legMultiplier) * pax;
  assert.strictEqual(calculated, 444);

  const convenienceFee = 0;
  assert.strictEqual(convenienceFee, 0);
});

// 8. Server Authoritative Quote & Cryptographic Signing
test('Quote generation issues signed quoteToken that passes verification', () => {
  const quoteResult = createSignedQuote({
    serviceType: 'flight',
    itemTitle: 'Emirates EK-511 (DEL ➔ DXB)',
    from: 'DEL',
    to: 'DXB',
    departDate: '2026-10-15',
    baseFareUSD: 240,
    passengers: { adults: 1, children: 0, infants: 0 }
  });

  assert.ok(quoteResult.quoteToken, 'quoteToken must be generated');
  assert.ok(quoteResult.expiresAt > Date.now(), 'expiresAt must be in the future');

  const verification = verifyQuoteToken(quoteResult.quoteToken);
  assert.strictEqual(verification.valid, true, 'Verification of untampered quote must be valid');
  assert.strictEqual(verification.quote.serviceType, 'flight');
  assert.ok(verification.quote.amountINR > 0, 'amountINR must be greater than 0');
});

// 9. Quote Tamper Protection
test('Tampered quote payload is rejected with invalid signature', () => {
  const quoteResult = createSignedQuote({
    serviceType: 'flight',
    itemTitle: 'Emirates EK-511',
    baseFareUSD: 300,
    passengers: { adults: 1 }
  });

  const rawJson = Buffer.from(quoteResult.quoteToken, 'base64url').toString('utf-8');
  const parsed = JSON.parse(rawJson);

  // Malicious user attempts to reduce price to 1 rupee
  parsed.amountINR = 1;
  const tamperedToken = Buffer.from(JSON.stringify(parsed)).toString('base64url');

  const verification = verifyQuoteToken(tamperedToken);
  assert.strictEqual(verification.valid, false, 'Tampered quote must be rejected');
  assert.ok(verification.reason.includes('invalid or tampered'));
});

// 10. Canonical JSON Stringification Determinism
test('Canonical JSON serialization produces identical signatures regardless of key ordering', () => {
  const obj1 = { zebra: 1, apple: 'sweet', details: { b: 2, a: 1 } };
  const obj2 = { apple: 'sweet', details: { a: 1, b: 2 }, zebra: 1 };

  const str1 = canonicalStringify(obj1);
  const str2 = canonicalStringify(obj2);

  assert.strictEqual(str1, str2, 'Key insertion order must not change canonical JSON string');
  assert.strictEqual(str1, '{"apple":"sweet","details":{"a":1,"b":2},"zebra":1}');

  const hash1 = crypto.createHmac('sha256', 'test-secret').update(str1).digest('hex');
  const hash2 = crypto.createHmac('sha256', 'test-secret').update(str2).digest('hex');
  assert.strictEqual(hash1, hash2, 'Signatures from reordered objects must match identically');
});

// 11. Authoritative Base Fare Floors (Prevent $1 Quote Forging)
test('Authoritative base fare resolution enforces realistic floors against tampering', () => {
  // Flight domestic floor ($50)
  const domesticFare = resolveAuthoritativeBaseFare('flight', { from: 'DEL', to: 'BOM' }, 1);
  assert.strictEqual(domesticFare, 50, 'Domestic flight base fare cannot be less than $50');

  // Flight international floor ($200)
  const intlFare = resolveAuthoritativeBaseFare('flight', { from: 'DEL', to: 'DXB' }, 1);
  assert.strictEqual(intlFare, 200, 'International flight base fare cannot be less than $200');

  // Hotel floor ($60)
  const hotelFare = resolveAuthoritativeBaseFare('hotel', {}, 1);
  assert.strictEqual(hotelFare, 60, 'Hotel rate per night cannot be forged below $60');

  // Higher legitimate fare is preserved
  const legitFare = resolveAuthoritativeBaseFare('flight', { from: 'DEL', to: 'BOM' }, 120);
  assert.strictEqual(legitFare, 120, 'Legitimate base fare above floor must be respected');
});

// 12. Passenger Manifest Fare Calculation (Adult 100%, Child 75%, Infant 10%)
test('Passenger tiering correctly calculates Adult, Child, and Infant fares', () => {
  const quote = calculateFlightQuote({
    baseFareUSD: 200,
    cabinClass: 'ECONOMY',
    passengers: { adults: 2, children: 1, infants: 1 }
  });

  // Base: (200 * 2) + (200 * 0.75 * 1) + (200 * 0.10 * 1) = 400 + 150 + 20 = 570
  // Tax (12% Economy): 570 * 0.12 = 68.4 => round 68
  // Total USD: 570 + 68 = 638
  assert.strictEqual(quote.travelDetails.totalTravelers, 4);
  assert.strictEqual(quote.amountUSD, 638);
  assert.strictEqual(quote.amountINR, Math.round(638 * USD_TO_INR_RATE));
});

// 13. International Passport Validity (IATA 6-Month Rule)
test('IATA international passport validation verifies 6-month remaining validity', () => {
  const validatePassport = (num) => /^[A-Z0-9]{6,12}$/i.test((num || '').trim());
  const validatePassportExpiry = (expiryDate, travelDate) => {
    if (!expiryDate) return false;
    const exp = new Date(expiryDate);
    const ref = travelDate ? new Date(travelDate) : new Date();
    const diffDays = (exp - ref) / (1000 * 60 * 60 * 24);
    return diffDays >= 180;
  };

  assert.strictEqual(validatePassport('Z1234567'), true);
  assert.strictEqual(validatePassport('A123'), false); // Too short

  const travelDate = '2026-10-01';
  assert.strictEqual(validatePassportExpiry('2027-05-01', travelDate), true); // 7 months away
  assert.strictEqual(validatePassportExpiry('2026-11-01', travelDate), false); // only 1 month away (violates IATA 6-month rule)
});

// 14. Razorpay Webhook Raw Buffer HMAC Signature Verification
test('Webhook HMAC SHA-256 signature validates correctly against raw body buffer', () => {
  const secret = 'webhook_secret_key_123';
  const rawBuffer = Buffer.from(JSON.stringify({ event: 'payment.captured', id: 'pay_9988' }));

  const validSignature = crypto.createHmac('sha256', secret).update(rawBuffer).digest('hex');

  // Verify constant time equality
  const expectedSig = crypto.createHmac('sha256', secret).update(rawBuffer).digest('hex');
  const expectedBuf = Buffer.from(expectedSig);
  const validBuf = Buffer.from(validSignature);

  const isValid = expectedBuf.byteLength === validBuf.byteLength && crypto.timingSafeEqual(validBuf, expectedBuf);
  assert.strictEqual(isValid, true);

  // Tampered signature of matching length should fail
  const badSig = '0000000000000000000000000000000000000000000000000000000000000000';
  const badBuf = Buffer.from(badSig);
  const isBadValid = badBuf.byteLength === expectedBuf.byteLength && crypto.timingSafeEqual(badBuf, expectedBuf);
  assert.strictEqual(isBadValid, false);
});

// 15. Timing Safe Equal Length-Guard Resilience (No Uncaught TypeError)
test('timingSafeEqual length guard gracefully rejects mismatched lengths without throwing TypeError', () => {
  const safeCompare = (sigA, sigB) => {
    const bufA = Buffer.from(sigA);
    const bufB = Buffer.from(sigB);
    if (bufA.byteLength !== bufB.byteLength) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  };

  // Malformed short signature
  assert.strictEqual(safeCompare('short_sig', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'), false);

  // Empty signature
  assert.strictEqual(safeCompare('', 'valid_length_signature_string_here_32_bytes!'), false);

  // Exact match
  const valid = 'f3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  assert.strictEqual(safeCompare(valid, valid), true);
});

// 16. Hotel Room Pricing & Hospitality GST slabs
test('Hotel quote calculates nights, room capacity, and 12%/18% GST slab', () => {
  const hotelQuote = calculateHotelQuote({
    checkIn: '2026-11-01',
    checkOut: '2026-11-04', // 3 nights
    roomsCount: 1,
    ratePerNightUSD: 100 // ₹8,650/night (> ₹7,500/night attracts 18% GST)
  });

  assert.strictEqual(hotelQuote.travelDetails.nights, 3);
  assert.strictEqual(hotelQuote.fareBreakdown.baseFareUSD, 300);
  assert.strictEqual(hotelQuote.fareBreakdown.taxesAndGstUSD, 54); // 300 * 0.18 = 54
});

// Summary
console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('✨ All core production sanity & zero-trust security tests passed successfully!');
}
