// ========================================
// UI EVENTS
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const threshold =
        document.getElementById("threshold");

    const thresholdValue =
        document.getElementById("thresholdValue");

    threshold.addEventListener("input", () => {

        thresholdValue.innerText =
            threshold.value;
    });
});

// ========================================
// STOPWORDS
// ========================================

const stopwords = [

    "the",
    "and",
    "with",
    "for",
    "shall",
    "must",
    "should",

    "system",
    "systems",

    "failed",
    "failure",
    "error",
    "completed",
    "completion",
    "rejected",
    "detected",

    "operation",
    "operations",

    "generate",
    "update",
    "manage",
    "insert",
    "delete",
    "create",

    "request",
    "response",

    "invalid",
    "unexpectedly",
    "initiated",
    "started",

    "after",
    "during",
    "from",
    "into",
    "via"
];

// ========================================
// LOAD SEEDS FROM UI
// ========================================

function loadSeeds() {

    const raw =
        document
            .getElementById("seedsInput")
            .value;

    const lines =
        raw
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0);

    let dynamicSeeds = {};

    lines.forEach(line => {

        const parts =
            line.split(":");

        if (parts.length !== 2) {
            return;
        }

        const category =
            parts[0]
                .trim()
                .toUpperCase();

        const words =
            parts[1]
                .split(",")
                .map(w =>
                    w.trim().toLowerCase()
                )
                .filter(w =>
                    w.length > 0
                );

        dynamicSeeds[category] = words;
    });

    return dynamicSeeds;
}

// ========================================
// NORMALIZE TOKEN
// ========================================

function normalizeToken(token, seeds) {

    for (const category in seeds) {

        if (
            seeds[category]
            .includes(token)
        ) {

            return category.toLowerCase();
        }
    }

    return token;
}

// ========================================
// NLP PREPROCESSING
// ========================================

function preprocess(text, seeds) {

    let doc =
        nlp(text.toLowerCase());

    let words =
        doc.terms().out('array');

    words = words
        .map(w =>
            w.replace(/[^a-zA-Z0-9]/g, "")
        )
        .filter(w =>
            w.length > 2 &&
            !stopwords.includes(w)
        );

    words =
        words.map(w =>
            normalizeToken(w, seeds)
        );

    words =
        [...new Set(words)];

    return words;
}

// ========================================
// SUPERVISED SCORING
// ========================================

function scoreRequirement(tokens, seeds) {

    let scores = {};

    for (const cluster in seeds) {

        scores[cluster] = 0;

        tokens.forEach(token => {

            if (
                token ===
                cluster.toLowerCase()
            ) {

                scores[cluster] += 1;
            }
        });
    }

    return scores;
}

// ========================================
// GET BEST CLUSTERS
// ========================================

function getBestClusters(scores) {

    let maxScore = 0;

    for (const cluster in scores) {

        if (scores[cluster] > maxScore) {

            maxScore = scores[cluster];
        }
    }

    let bestClusters = [];

    for (const cluster in scores) {

        if (
            scores[cluster] === maxScore &&
            maxScore > 0
        ) {

            bestClusters.push(cluster);
        }
    }

    if (bestClusters.length === 0) {

        bestClusters.push(
            "UNCATEGORIZED"
        );
    }

    return bestClusters;
}

// ========================================
// TOKEN SIMILARITY
// ========================================

function similarity(tokensA, tokensB) {

    const setA =
        new Set(tokensA);

    const setB =
        new Set(tokensB);

    const intersection =
        [...setA]
        .filter(x => setB.has(x));

    return (
        intersection.length /
        Math.sqrt(
            setA.size * setB.size
        )
    );
}

// ========================================
// AUTO CLUSTER NAME
// ========================================

function generateClusterName(tokens) {

    if (!tokens || tokens.length === 0) {

        return "UNKNOWN_CLUSTER";
    }

    return (
        "CLUSTER_" +
        tokens
            .slice(0, 3)
            .join("_")
            .toUpperCase()
    );
}

// ========================================
// UNSUPERVISED CLUSTERING
// ========================================

function unsupervisedCluster(requirements) {

    let clusters = [];

    const threshold =
        parseFloat(
            document
                .getElementById("threshold")
                .value
        );

    requirements.forEach(req => {

        let assigned = false;

        for (let cluster of clusters) {

            let sim =
                similarity(
                    req.tokens,
                    cluster.tokens
                );

            if (sim >= threshold) {

                cluster.items.push(req);

                cluster.tokens =
                    [...new Set([

                        ...cluster.tokens,
                        ...req.tokens

                    ])];

                assigned = true;

                break;
            }
        }

        if (!assigned) {

            clusters.push({

                name:
                    generateClusterName(
                        req.tokens
                    ),

                tokens: req.tokens,

                items: [req]
            });
        }
    });

    return clusters;
}

// ========================================
// PROCESS REQUIREMENTS
// ========================================

function processRequirements() {

    const input =
        document
            .getElementById("input")
            .value;

    const mode =
        document
            .getElementById("mode")
            .value;

    const seeds =
        loadSeeds();

    const lines =
        input
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0);

    let requirements = [];

    lines.forEach(line => {

        const match =
            line.match(
                /^(SSS-[0-9]+)\s+(.*)$/
            );

        if (!match) {
            return;
        }

        const id =
            match[1];

        const description =
            match[2];

        const tokens =
            preprocess(
                description,
                seeds
            );

        requirements.push({

            id,
            description,
            tokens
        });
    });

    if (mode === "SUPERVISED") {

        supervisedMode(
            requirements,
            seeds
        );

    } else {

        unsupervisedMode(
            requirements
        );
    }
}

// ========================================
// SUPERVISED MODE
// ========================================

function supervisedMode(
    requirements,
    seeds
) {

    let clustered = {};

    requirements.forEach(req => {

        const scores =
            scoreRequirement(
                req.tokens,
                seeds
            );

        const bestClusters =
            getBestClusters(scores);

        bestClusters.forEach(cluster => {

            if (!clustered[cluster]) {

                clustered[cluster] = [];
            }

            clustered[cluster].push(req);
        });
    });

    renderSupervised(clustered);
}

// ========================================
// UNSUPERVISED MODE
// ========================================

function unsupervisedMode(requirements) {

    const clusters =
        unsupervisedCluster(
            requirements
        );

    renderUnsupervised(clusters);
}

// ========================================
// RENDER SUPERVISED
// ========================================

function renderSupervised(clustered) {

    const output =
        document.getElementById("output");

    output.innerHTML = "";

    for (const cluster in clustered) {

        const div =
            document.createElement("div");

        div.className = "cluster";

        let html = `

            <h2>
                ${cluster}
            </h2>

            <div class="cluster-summary">

                Requirements:
                ${clustered[cluster].length}

            </div>
        `;

        clustered[cluster]
            .forEach(req => {

            html += `

                <div class="requirement">

                    <strong>
                        ${req.id}
                    </strong>

                    <br>

                    ${req.description}

                    <div class="tokens">

                        Tokens:

                        ${req.tokens.join(", ")}

                    </div>

                </div>
            `;
        });

        div.innerHTML = html;

        output.appendChild(div);
    }
}

// ========================================
// RENDER UNSUPERVISED
// ========================================

function renderUnsupervised(clusters) {

    const output =
        document.getElementById("output");

    output.innerHTML = "";

    clusters.forEach(cluster => {

        const div =
            document.createElement("div");

        div.className = "cluster";

        let html = `

            <h2>
                ${cluster.name}
            </h2>

            <div class="cluster-summary">

                Requirements:
                ${cluster.items.length}

                <br>

                Cluster Tokens:

                ${cluster.tokens.join(", ")}

            </div>
        `;

        cluster.items.forEach(req => {

            html += `

                <div class="requirement">

                    <strong>
                        ${req.id}
                    </strong>

                    <br>

                    ${req.description}

                    <div class="tokens">

                        Tokens:

                        ${req.tokens.join(", ")}

                    </div>

                </div>
            `;
        });

        div.innerHTML = html;

        output.appendChild(div);
    });
}