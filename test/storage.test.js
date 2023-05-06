import test from "node:test";
import assert from "node:assert/strict";

import { toLeadRecord } from "../js/storage.js";

test("toLeadRecord converts legacy string lead", () => {
    const lead = toLeadRecord("https://example.com");

    assert.equal(lead.url, "https://example.com");
    assert.deepEqual(lead.tags, []);
    assert.equal(typeof lead.id, "string");
    assert.ok(lead.id.length > 0);
    assert.equal(typeof lead.addedAt, "number");
});

test("toLeadRecord normalizes object tags and preserves id", () => {
    const lead = toLeadRecord({
        id: "lead-123",
        url: "https://example.com/docs",
        tags: ["Docs", "  docs ", "Reference"],
        addedAt: 1700000000000,
    });

    assert.equal(lead.id, "lead-123");
    assert.equal(lead.url, "https://example.com/docs");
    assert.deepEqual(lead.tags, ["docs", "reference"]);
    assert.equal(lead.addedAt, 1700000000000);
});

test("toLeadRecord returns null for malformed entries", () => {
    assert.equal(toLeadRecord(null), null);
    assert.equal(toLeadRecord({ id: "x" }), null);
});
