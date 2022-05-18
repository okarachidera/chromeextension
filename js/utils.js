export function normalizeUrl(value) {
    const candidate = /^(https?:\/\/)/i.test(value) ? value : `https://${value}`;

    try {
        const parsed = new URL(candidate);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return null;
        }
        return parsed.href;
    } catch {
        return null;
    }
}

export function truncate(value, maxLength) {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
}

export function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function parseTags(rawValue) {
    if (!rawValue) {
        return [];
    }

    const tags = rawValue
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean);

    return [...new Set(tags)];
}

export function buildLead(url, tags = []) {
    return {
        id: createId(),
        url,
        tags: [...new Set(tags)],
        addedAt: Date.now(),
    };
}

export function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function getAllTags(leads) {
    return [...new Set(leads.flatMap((lead) => lead.tags || []))].sort((a, b) => a.localeCompare(b));
}

export function toJsonExport(leads) {
    return JSON.stringify(leads, null, 2);
}

export function toCsvExport(leads) {
    const headers = ["id", "url", "tags", "addedAt"];
    const rows = leads.map((lead) => [
        lead.id || "",
        lead.url || "",
        (lead.tags || []).join("|"),
        String(lead.addedAt || ""),
    ]);

    return [headers, ...rows]
        .map((columns) => columns.map(escapeCsvCell).join(","))
        .join("\n");
}

export function triggerFileDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 250);
}

function createId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
        return globalThis.crypto.randomUUID();
    }
    return `lead_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function escapeCsvCell(value) {
    const safeValue = String(value).replaceAll('"', '""');
    return `"${safeValue}"`;
}
