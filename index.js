import { loadAppData, saveLeads, setSyncMode } from "./js/storage.js";
import { getDom, renderLeads, renderTagFilterOptions, setSyncToggle, showStatus } from "./js/ui.js";
import { buildLead, getAllTags, normalizeUrl, parseTags, toCsvExport, toJsonExport, triggerFileDownload } from "./js/utils.js";

const dom = getDom();

const state = {
    leads: [],
    searchQuery: "",
    selectedTag: "all",
    sortBy: "newest",
    useSync: false,
};

init();

async function init() {
    const appData = await loadAppData();
    state.leads = appData.leads;
    state.useSync = appData.useSync;
    setSyncToggle(dom, state.useSync);
    bindEvents();
    await persistAndRender();
}

function bindEvents() {
    dom.inputButton.addEventListener("click", onSaveInput);
    dom.tabButton.addEventListener("click", onSaveCurrentTab);
    dom.deleteButton.addEventListener("click", onClearAll);
    dom.exportJsonButton.addEventListener("click", onExportJson);
    dom.exportCsvButton.addEventListener("click", onExportCsv);

    dom.inputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            onSaveInput();
        }
    });

    dom.searchEl.addEventListener("input", (event) => {
        state.searchQuery = event.target.value.trim().toLowerCase();
        renderCurrentView();
    });

    dom.sortEl.addEventListener("change", (event) => {
        state.sortBy = event.target.value;
        renderCurrentView();
    });

    dom.tagFilterEl.addEventListener("change", (event) => {
        state.selectedTag = event.target.value;
        renderCurrentView();
    });

    dom.syncToggle.addEventListener("change", onSyncToggle);

    dom.listEl.addEventListener("click", (event) => {
        const target = event.target;
        if (target instanceof HTMLElement && target.matches(".remove-btn")) {
            const leadId = target.dataset.leadId;
            if (leadId) {
                onRemoveLead(leadId);
            }
        }
    });
}

async function onSaveInput() {
    const inputValue = dom.inputEl.value.trim();
    if (!inputValue) {
        showStatus(dom, "Enter a URL first.", true);
        return;
    }

    const normalizedUrl = normalizeUrl(inputValue);
    if (!normalizedUrl) {
        showStatus(dom, "Please enter a valid website URL.", true);
        return;
    }

    const tags = parseTags(dom.tagInputEl.value);
    const added = await addOrUpdateLead(normalizedUrl, tags);
    if (added) {
        dom.inputEl.value = "";
        dom.tagInputEl.value = "";
    }
}

function onSaveCurrentTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.url) {
            showStatus(dom, "Could not access the current tab URL.", true);
            return;
        }

        const normalizedUrl = normalizeUrl(activeTab.url);
        if (!normalizedUrl) {
            showStatus(dom, "This tab URL cannot be saved.", true);
            return;
        }

        const tags = parseTags(dom.tagInputEl.value);
        const added = await addOrUpdateLead(normalizedUrl, tags);
        if (added) {
            dom.tagInputEl.value = "";
        }
    });
}

async function onClearAll() {
    if (state.leads.length === 0) {
        showStatus(dom, "Nothing to clear.");
        return;
    }

    state.leads = [];
    await persistAndRender();
    showStatus(dom, "All leads cleared.");
}

async function onRemoveLead(leadId) {
    state.leads = state.leads.filter((lead) => lead.id !== leadId);
    await persistAndRender();
    showStatus(dom, "Lead removed.");
}

function onExportJson() {
    if (!state.leads.length) {
        showStatus(dom, "No leads to export.", true);
        return;
    }

    const content = toJsonExport(state.leads);
    triggerFileDownload("lead-vault-export.json", content, "application/json");
    showStatus(dom, "JSON export downloaded.");
}

function onExportCsv() {
    if (!state.leads.length) {
        showStatus(dom, "No leads to export.", true);
        return;
    }

    const content = toCsvExport(state.leads);
    triggerFileDownload("lead-vault-export.csv", content, "text/csv");
    showStatus(dom, "CSV export downloaded.");
}

async function onSyncToggle(event) {
    state.useSync = event.target.checked;
    await setSyncMode(state.useSync, state.leads);
    showStatus(dom, state.useSync ? "Sync mode enabled." : "Local mode enabled.");
}

async function addOrUpdateLead(url, tags) {
    const existingLead = state.leads.find((lead) => lead.url === url);
    if (existingLead) {
        const mergedTags = [...new Set([...existingLead.tags, ...tags])];
        const changed = mergedTags.length !== existingLead.tags.length;
        existingLead.tags = mergedTags;
        await persistAndRender();
        showStatus(dom, changed ? "Lead exists. Tags merged." : "That lead is already saved.");
        return false;
    }

    state.leads.unshift(buildLead(url, tags));
    await persistAndRender();
    showStatus(dom, "Lead saved.");
    return true;
}

async function persistAndRender() {
    await saveLeads(state.leads, state.useSync);
    renderCurrentView();
}

function renderCurrentView() {
    const tags = getAllTags(state.leads);
    renderTagFilterOptions(dom, tags, state.selectedTag);

    if (!tags.includes(state.selectedTag)) {
        state.selectedTag = "all";
    }

    const visibleLeads = getVisibleLeads(state.leads, state.searchQuery, state.selectedTag, state.sortBy);
    renderLeads(dom, visibleLeads, state.leads.length);
}

function getVisibleLeads(leads, searchQuery, selectedTag, sortBy) {
    const filtered = leads.filter((lead) => {
        const passesTag = selectedTag === "all" || lead.tags.includes(selectedTag);
        if (!passesTag) {
            return false;
        }

        if (!searchQuery) {
            return true;
        }

        const inUrl = lead.url.toLowerCase().includes(searchQuery);
        const inTags = lead.tags.some((tag) => tag.includes(searchQuery));
        return inUrl || inTags;
    });

    return filtered.sort((a, b) => compareLeads(a, b, sortBy));
}

function compareLeads(a, b, sortBy) {
    if (sortBy === "oldest") {
        return a.addedAt - b.addedAt;
    }
    if (sortBy === "alpha") {
        return a.url.localeCompare(b.url);
    }
    if (sortBy === "alpha_desc") {
        return b.url.localeCompare(a.url);
    }
    return b.addedAt - a.addedAt;
}
