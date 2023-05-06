import test from "node:test";
import assert from "node:assert/strict";

import { normalizeUrl, parseTags, toCsvExport } from "../js/utils.js";

test("normalizeUrl adds https when protocol is missing", () => {
    assert.equal(normalizeUrl("example.com"), "https://example.com/");
});

test("normalizeUrl rejects unsupported protocols", () => {
    assert.equal(normalizeUrl("ftp://example.com"), null);
});

test("parseTags trims, lowercases, and de-duplicates tags", () => {
    assert.deepEqual(parseTags("Sales, growth, sales ,  Product "), ["sales", "growth", "product"]);
});

test("toCsvExport serializes lead rows safely", () => {
    const csv = toCsvExport([
        {
            id: "id-1",
            url: "https://example.com?q=\"a\"",
            tags: ["sales", "product"],
            addedAt: 1700000000000,
        },
    ]);

    assert.match(csv, /"id","url","tags","addedAt"/);
    assert.match(csv, /"id-1","https:\/\/example.com\?q=""a""","sales\|product","1700000000000"/);
});
