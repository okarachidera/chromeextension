import { MAX_DISPLAY_URL_LENGTH } from "./config.js";
import { escapeHtml, formatDate, truncate } from "./utils.js";

export function getDom() {
    return {
        inputButton: document.getElementById("input-btn"),
        inputEl: document.getElementById("input-el"),
        tagInputEl: document.getElementById("tag-input-el"),
        deleteButton: document.getElementById("delete-btn"),
        tabButton: document.getElementById("tab-btn"),
        listEl: document.getElementById("ul-el"),
        countEl: document.getElementById("count-el"),
        emptyStateEl: document.getElementById("empty-el"),
        statusEl: document.getElementById("status-el"),
        searchEl: document.getElementById("search-el"),
        sortEl: document.getElementById("sort-el"),
        tagFilterEl: document.getElementById("tag-filter-el"),
        exportJsonButton: document.getElementById("export-json-btn"),
        exportCsvButton: document.getElementById("export-csv-btn"),
        syncToggle: document.getElementById("sync-toggle"),
    };
}

export function renderLeads(dom, leads, totalCount) {
    dom.countEl.textContent = leads.length === totalCount ? String(totalCount) : `${leads.length}/${totalCount}`;
    dom.emptyStateEl.style.display = leads.length ? "none" : "block";

    dom.listEl.innerHTML = leads
        .map((lead) => {
            const displayUrl = truncate(lead.url, MAX_DISPLAY_URL_LENGTH);
            const tagMarkup = lead.tags.length
                ? lead.tags.map((tag) => `<span class="lead-tag">${escapeHtml(tag)}</span>`).join("")
                : '<span class="lead-tag pill-muted">untagged</span>';

            return `
                <li class="lead-item">
                    <div class="lead-main">
                        <a class="lead-link" href="${escapeHtml(lead.url)}" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(displayUrl)}
                        </a>
                        <div class="lead-meta">
                            ${tagMarkup}
                            <span class="lead-date">${escapeHtml(formatDate(lead.addedAt))}</span>
                        </div>
                    </div>
                    <button class="remove-btn" type="button" data-lead-id="${escapeHtml(lead.id)}" aria-label="Remove lead">x</button>
                </li>
            `;
        })
        .join("");
}

export function renderTagFilterOptions(dom, tags, selectedTag) {
    dom.tagFilterEl.innerHTML = [
        '<option value="all">All tags</option>',
        ...tags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`),
    ].join("");

    dom.tagFilterEl.value = tags.includes(selectedTag) ? selectedTag : "all";
}

export function setSyncToggle(dom, useSync) {
    dom.syncToggle.checked = useSync;
}

export function showStatus(dom, message, isError = false) {
    dom.statusEl.textContent = message;
    dom.statusEl.classList.toggle("error", isError);
}
