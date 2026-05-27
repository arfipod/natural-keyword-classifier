window.NKC_ITEMS = (() => {
    const config = window.NKC_CONFIG;
    const { normalizeRuleText, normalizeText, tokenizeItem } = window.NKC_TEXT;

    function validateItemsInput(rawItems) {
        const lines = rawItems
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        const invalidLines = lines.filter((line) => !config.itemPattern.test(line));

        if (lines.length === 0) {
            return {
                isValid: false,
                invalidLines,
                message: "Add at least one item before clustering."
            };
        }

        if (invalidLines.length === lines.length) {
            return {
                isValid: false,
                invalidLines,
                message: "No valid items found. Use: ID Text description."
            };
        }

        return {
            isValid: true,
            invalidLines,
            message: ""
        };
    }

    function parseItems(rawItems, seedLookup) {
        return rawItems
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => parseItem(line, seedLookup))
            .filter(Boolean);
    }

    function parseItem(line, seedLookup) {
        const match = line.match(config.itemPattern);

        if (!match) {
            return null;
        }

        const [, id, description] = match;

        return {
            id,
            description,
            normalizedDescription: normalizeText(description),
            normalizedReducedDescription: normalizeRuleText(description),
            tokens: tokenizeItem(description, seedLookup)
        };
    }

    return {
        parseItems,
        validateItemsInput
    };
})();
