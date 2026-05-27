window.NKC_TEXT = (() => {
    const config = window.NKC_CONFIG;

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(config.diacriticPattern, "");
    }

    function reduceToken(token) {
        if (token.length > 5 && token.endsWith("ies")) {
            return `${token.slice(0, -3)}y`;
        }

        if (token.length > 6 && token.endsWith("sses")) {
            return token.slice(0, -2);
        }

        if (token.length > 5 && token.endsWith("ing")) {
            return token.slice(0, -3);
        }

        if (token.length > 4 && token.endsWith("ed")) {
            return token.slice(0, -2);
        }

        if (token.length > 4 && token.endsWith("es")) {
            return token.slice(0, -2);
        }

        if (token.length > 4 && token.endsWith("s")) {
            return token.slice(0, -1);
        }

        return token;
    }

    function normalizeRuleText(value) {
        const normalizedTokens = normalizeText(value).match(config.tokenPattern);

        return normalizedTokens ? normalizedTokens.map(reduceToken).join(" ") : "";
    }

    function tokenizeItem(text, seedLookup) {
        const normalizedText = normalizeText(text);
        const tokens = [];
        const seen = new Set();
        let match;

        config.tokenPattern.lastIndex = 0;

        while ((match = config.tokenPattern.exec(normalizedText)) !== null) {
            const rawToken = match[0];
            const reducedToken = reduceToken(rawToken);

            if (rawToken.length <= 2 || config.stopwords.has(rawToken)) {
                continue;
            }

            const token =
                seedLookup.get(rawToken) || seedLookup.get(reducedToken) || reducedToken;

            if (seen.has(token)) {
                continue;
            }

            seen.add(token);
            tokens.push(token);
        }

        return tokens;
    }

    return {
        normalizeRuleText,
        normalizeText,
        reduceToken,
        tokenizeItem
    };
})();
