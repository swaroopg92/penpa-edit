(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) {
        module.exports = api;
    }
    root.PenpaUrlSecurity = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    function normalizeHttpUrl(value) {
        if (typeof value !== "string") return null;

        const trimmed = value.trim();
        if (!trimmed || /[\u0000-\u001F\u007F]/.test(trimmed)) return null;

        try {
            const parsed = new URL(trimmed);
            if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
            if (parsed.username || parsed.password) return null;
            return parsed.href;
        } catch (_error) {
            return null;
        }
    }

    function openHttpUrl(value, target = "_blank") {
        const url = normalizeHttpUrl(value);
        if (!url || typeof window === "undefined") return false;

        const opened = window.open(url, target, "noopener,noreferrer");
        if (opened) opened.opener = null;
        return true;
    }

    return { normalizeHttpUrl, openHttpUrl };
});
