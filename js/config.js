window.NKC_CONFIG = {
    itemPattern: /^(\S+)\s+(.*)$/,
    tokenPattern: /[a-z0-9]+/g,
    diacriticPattern: /[\u0300-\u036f]/g,
    uncategorizedCluster: "UNCATEGORIZED",
    unknownCluster: "UNKNOWN_CLUSTER",
    uncategorizedPosition: "end",
    stopwords: new Set([
        "the", "and", "with", "for", "shall", "must", "should", "system",
        "systems", "failed", "failure", "error", "completed", "completion",
        "rejected", "detected", "operation", "operations", "generate", "update",
        "manage", "insert", "delete", "create", "request", "response", "invalid",
        "unexpectedly", "initiated", "started", "after", "during", "from", "into",
        "via", "andor", "able", "allow", "allows", "provide", "provides",
        "support", "supports", "use", "uses", "using", "user", "users", "data",
        "del", "los", "las", "una", "unos", "unas", "para", "por", "con",
        "sin", "que", "como", "sobre", "desde", "entre", "este", "esta",
        "estos", "estas", "sistema", "sistemas", "usuario", "usuarios", "datos"
    ])
};
