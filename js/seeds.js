window.NKC_SEEDS = (() => {
    const { unique } = window.NKC_UTILS;
    const { normalizeRuleText } = window.NKC_TEXT;

    function validateSeedsInput(rawSeeds) {
        const lines = rawSeeds
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);
        const invalidLines = lines.filter((line) => {
            const separatorIndex = line.indexOf(":");

            if (separatorIndex < 1) {
                return true;
            }

            const rawRules = line.slice(separatorIndex + 1).trim();

            if (rawRules.length === 0) {
                return true;
            }

            return splitSeedRules(rawRules).some((rule) => {
                const trimmedRule = rule.trim().replace(/^-/, "").trim();

                return trimmedRule.startsWith("/") && !parseSeedRule(rule);
            });
        });

        return { invalidLines };
    }

    function parseSeeds(rawSeeds) {
        return rawSeeds
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .reduce((seeds, line) => {
                const separatorIndex = line.indexOf(":");

                if (separatorIndex < 0) {
                    return seeds;
                }

                const category = line.slice(0, separatorIndex).trim().toUpperCase();
                const rules = splitSeedRules(line.slice(separatorIndex + 1))
                    .map(parseSeedRule)
                    .filter(Boolean);

                if (category && rules.length > 0) {
                    seeds[category] = {
                        positive: rules.filter((rule) => !rule.isNegative),
                        negative: rules.filter((rule) => rule.isNegative)
                    };
                }

                return seeds;
            }, {});
    }

    function createSeedLookup(seeds) {
        return Object.entries(seeds).reduce((lookup, [category, ruleSet]) => {
            ruleSet.positive.forEach((rule) => {
                if (rule.kind === "token") {
                    lookup.set(rule.normalized, category.toLowerCase());
                }
            });

            return lookup;
        }, new Map());
    }

    function splitSeedRules(rawRules) {
        const rules = [];
        let current = "";
        let quote = "";
        let inRegex = false;
        let isEscaped = false;

        for (const char of rawRules) {
            if (char === "," && !quote && !inRegex) {
                rules.push(current.trim());
                current = "";
                isEscaped = false;
                continue;
            }

            current += char;

            if (isEscaped) {
                isEscaped = false;
                continue;
            }

            if (char === "\\") {
                isEscaped = true;
                continue;
            }

            if ((char === "\"" || char === "'") && !inRegex) {
                quote = quote === char ? "" : quote || char;
                continue;
            }

            if (char === "/" && !quote) {
                inRegex = !inRegex;
            }
        }

        if (current.trim()) {
            rules.push(current.trim());
        }

        return rules;
    }

    function parseSeedRule(rawRule) {
        let ruleText = rawRule.trim();
        let isNegative = false;

        if (!ruleText) {
            return null;
        }

        if (ruleText.startsWith("-")) {
            isNegative = true;
            ruleText = ruleText.slice(1).trim();
        }

        if (isRegexRule(ruleText)) {
            const lastSlash = ruleText.lastIndexOf("/");
            const pattern = ruleText.slice(1, lastSlash);
            const flags = unique(`${ruleText.slice(lastSlash + 1)}i`.split(""))
                .filter((flag) => "dgimsuvy".includes(flag) && flag !== "g")
                .join("");

            try {
                return {
                    kind: "regex",
                    raw: ruleText,
                    isNegative,
                    weight: 2,
                    regex: new RegExp(pattern, flags)
                };
            } catch {
                return null;
            }
        }

        const unquotedRule = stripRuleQuotes(ruleText);
        const normalized = normalizeRuleText(unquotedRule);

        if (!normalized) {
            return null;
        }

        return {
            kind: normalized.includes(" ") ? "phrase" : "token",
            raw: unquotedRule,
            normalized,
            isNegative,
            weight: normalized.includes(" ") ? 2 : 1
        };
    }

    function isRegexRule(value) {
        return /^\/.+\/[dgimsuvy]*$/.test(value.trim());
    }

    function isQuotedRule(value) {
        return /^(['"]).*\1$/.test(value.trim());
    }

    function stripRuleQuotes(value) {
        const trimmedValue = value.trim();

        if (isQuotedRule(trimmedValue)) {
            return trimmedValue.slice(1, -1).trim();
        }

        return trimmedValue;
    }

    function formatSeedRule(rawRule, type, isNegative) {
        let rule = rawRule.trim();

        if (type === "REGEX" && !isRegexRule(rule)) {
            rule = `/${rule}/`;
        } else if (type === "PHRASE" && !isQuotedRule(rule)) {
            rule = `"${rule.replace(/"/g, "")}"`;
        }

        return `${isNegative && !rule.startsWith("-") ? "-" : ""}${rule}`;
    }

    function appendSeedRule(seedText, category, rule) {
        const lines = seedText.split("\n");
        const categoryPrefix = `${category}:`;
        let wasAdded = false;

        const nextLines = lines.map((line) => {
            if (line.trim().toUpperCase().startsWith(categoryPrefix)) {
                wasAdded = true;
                return `${line.trim().replace(/,*\s*$/, "")}, ${rule}`;
            }

            return line;
        });

        if (!wasAdded) {
            nextLines.push(`${category}: ${rule}`);
        }

        return nextLines.filter((line, index) => (
            line.trim() || index < nextLines.length - 1
        )).join("\n");
    }

    return {
        appendSeedRule,
        createSeedLookup,
        formatSeedRule,
        isQuotedRule,
        isRegexRule,
        parseSeedRule,
        parseSeeds,
        splitSeedRules,
        validateSeedsInput
    };
})();
