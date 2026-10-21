import assert from "node:assert/strict";
import test from "node:test";
import { formatGold, formatWhole, normalizeNumber, orderPreview, validGoldAmount } from "../src/lib/trading.mjs";

test("Persian digits, Arabic separators and grouping are normalized", () => {
    assert.equal(normalizeNumber("۰٫۵"), "0.5");
    assert.equal(normalizeNumber("۱۰٬۰۰۰٬۰۰۰"), "10000000");
    assert.equal(normalizeNumber("١,٢٥"), "125");
});

test("The order total uses exact decimal arithmetic", () => {
    assert.equal(orderPreview("0.5", "10000000"), "5000000");
    assert.equal(orderPreview("0.000001", "500000"), "1"); // HALF_UP
    assert.equal(orderPreview("0.000001", "499999"), null); // rounds to zero
    assert.equal(orderPreview("0.3", "3"), "1");
});

test("Reject invalid amounts and prices without floating-point conversion", () => {
    assert.equal(orderPreview("0", "100"), null);
    assert.equal(orderPreview("-1", "100"), null);
    assert.equal(orderPreview("0.1234567", "100"), null);
    assert.equal(orderPreview("1", "10.5"), null);
    assert.equal(orderPreview("1", "0"), null);
    assert.equal(validGoldAmount("0.000001"), true);
    assert.equal(validGoldAmount("0.000000"), false);
});

test("Handles financial values beyond Number.MAX_SAFE_INTEGER", () => {
    assert.equal(orderPreview("999999999999.999999", "999999999999999999"), "999999999999999998000000000000");
    assert.equal(formatWhole("100000000"), "۱۰۰٬۰۰۰٬۰۰۰");
    assert.equal(formatGold("2.500000"), "۲٫۵");
});
