import { LEGACY_STORAGE_KEY, STORAGE_KEY, STORAGE_MODE_KEY } from "./config.js";

export async function loadAppData() {
    const localState = await storageGet(chrome.storage.local, [STORAGE_KEY, STORAGE_MODE_KEY]);
    const useSync = Boolean(localState[STORAGE_MODE_KEY]);
    const leads = await loadLeadsByMode(useSync, localState[STORAGE_KEY]);
    return { leads, useSync };
}

export async function saveLeads(leads, useSync) {
    await storageSet(getStorageArea(useSync), { [STORAGE_KEY]: leads });
}

export async function setSyncMode(useSync, leads) {
    await storageSet(chrome.storage.local, { [STORAGE_MODE_KEY]: useSync });
    await saveLeads(leads, useSync);
}

async function loadLeadsByMode(useSync, localLeads) {
    if (useSync) {
        const syncState = await storageGet(chrome.storage.sync, [STORAGE_KEY]);
        if (Array.isArray(syncState[STORAGE_KEY])) {
            return syncState[STORAGE_KEY].map(toLeadRecord).filter(Boolean);
        }
        if (Array.isArray(localLeads)) {
            return localLeads.map(toLeadRecord).filter(Boolean);
        }
        return [];
    }

    if (Array.isArray(localLeads)) {
        return localLeads.map(toLeadRecord).filter(Boolean);
    }

    const fromLegacy = readLegacyLeads();
    if (Array.isArray(fromLegacy)) {
        return fromLegacy.map(toLeadRecord).filter(Boolean);
    }

    return [];
}

function toLeadRecord(item) {
    if (typeof item === "string") {
        return {
            id: fallbackId(),
            url: item,
            tags: [],
            addedAt: Date.now(),
        };
    }

    if (item && typeof item.url === "string") {
        const tags = Array.isArray(item.tags)
            ? item.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
            : [];

        return {
            id: typeof item.id === "string" && item.id ? item.id : fallbackId(),
            url: item.url,
            tags: [...new Set(tags)],
            addedAt: Number(item.addedAt) || Date.now(),
        };
    }

    return null;
}

function getStorageArea(useSync) {
    return useSync ? chrome.storage.sync : chrome.storage.local;
}

function readLegacyLeads() {
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyRaw) {
        return null;
    }

    try {
        const parsed = JSON.parse(legacyRaw);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return parsed;
    } catch {
        return null;
    }
}

function fallbackId() {
    return `legacy_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function storageGet(area, keys) {
    return new Promise((resolve) => area.get(keys, resolve));
}

function storageSet(area, value) {
    return new Promise((resolve) => area.set(value, resolve));
}
