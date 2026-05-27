window.NKC_UTILS = (() => {
    function unique(items) {
        return [...new Set(items)];
    }

    function slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function escapeXmlText(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function escapeXmlAttribute(value) {
        return escapeXmlText(value).replace(/"/g, "&quot;");
    }

    function formatDateForFile(date) {
        return date.toISOString().slice(0, 19).replace(/[:T]/g, "-");
    }

    return {
        escapeXmlAttribute,
        escapeXmlText,
        formatDateForFile,
        slugify,
        unique
    };
})();
