export function normalizeNumber(value) {
    return String(value)
        .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
        .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
        .replace(/٫/g, ".")
        .replace(/[٬,،\s]/g, "");
}

export function persianDigits(value) {
    return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function formatWhole(value) {
    try {
        return BigInt(String(value).split(".")[0] || "0").toLocaleString("fa-IR");
    } catch {
        return "—";
    }
}

export function formatGold(value) {
    if (value === null || value === undefined) return "—";
    const [whole, fraction = ""] = String(value).split(".");
    const decimals = fraction.slice(0, 6).replace(/0+$/, "");
    return `${formatWhole(whole)}${decimals ? `٫${persianDigits(decimals)}` : ""}`;
}

export function orderPreview(amountInput, priceInput) {
    const amount = normalizeNumber(amountInput);
    const price = normalizeNumber(priceInput);
    if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,6})?$/.test(amount)) return null;
    if (!/^[1-9]\d{0,17}$/.test(price)) return null;

    const [whole, decimal = ""] = amount.split(".");
    const amountUnits = BigInt(whole) * 1000000n + BigInt(decimal.padEnd(6, "0") || "0");
    if (amountUnits <= 0n) return null;

    // Match Laravel's HALF_UP rounding to the nearest rial without floating point.
    const total = (amountUnits * BigInt(price) + 500000n) / 1000000n;
    return total > 0n ? total.toString() : null;
}

export function validGoldAmount(value) {
    const amount = normalizeNumber(value);
    if (!/^(?:0|[1-9]\d{0,11})(?:\.\d{1,6})?$/.test(amount)) return false;
    const [whole, decimals = ""] = amount.split(".");
    return BigInt(whole) * 1000000n + BigInt(decimals.padEnd(6, "0") || "0") > 0n;
}
