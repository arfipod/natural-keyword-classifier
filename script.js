const APP_CONFIG = {
    itemPattern: /^(\S+)\s+(.*)$/,
    tokenPattern: /[a-z0-9]+/g,
    diacriticPattern: /[\u0300-\u036f]/g,
    uncategorizedCluster: "UNCATEGORIZED",
    unknownCluster: "UNKNOWN_CLUSTER",
    uncategorizedPosition: "end",
    stopwords: new Set([
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
        "via",
        "andor",
        "able",
        "allow",
        "allows",
        "provide",
        "provides",
        "support",
        "supports",
        "use",
        "uses",
        "using",
        "user",
        "users",
        "data",
        "del",
        "los",
        "las",
        "una",
        "unos",
        "unas",
        "para",
        "por",
        "con",
        "sin",
        "que",
        "como",
        "sobre",
        "desde",
        "entre",
        "este",
        "esta",
        "estos",
        "estas",
        "sistema",
        "sistemas",
        "usuario",
        "usuarios",
        "datos"
    ])
};

const dom = {};
let currentExportData = null;
let toastId = 0;

document.addEventListener("DOMContentLoaded", init);

function init() {
    cacheDom();
    bindEvents();
    updateThresholdLabel();
    updateThresholdControl();
}

function cacheDom() {
    dom.input = document.getElementById("input");
    dom.seedsInput = document.getElementById("seedsInput");
    dom.mode = document.getElementById("mode");
    dom.thresholdBlock = document.getElementById("thresholdBlock");
    dom.threshold = document.getElementById("threshold");
    dom.thresholdValue = document.getElementById("thresholdValue");
    dom.clusterButton = document.getElementById("clusterButton");
    dom.exportButton = document.getElementById("exportButton");
    dom.output = document.getElementById("output");
    dom.toastContainer = document.getElementById("toastContainer");
}

function bindEvents() {
    dom.mode.addEventListener("change", updateThresholdControl);
    dom.threshold.addEventListener("input", updateThresholdLabel);
    dom.clusterButton.addEventListener("click", processItems);
    dom.exportButton.addEventListener("click", exportCurrentResults);
    window.addEventListener("error", (event) => {
        showErrorToast(event.message || "Unexpected error.");
    });
    window.addEventListener("unhandledrejection", (event) => {
        showErrorToast(event.reason?.message || "Unexpected async error.");
    });
}

function updateThresholdLabel() {
    dom.thresholdValue.textContent = dom.threshold.value;
}

function updateThresholdControl() {
    const usesThreshold = dom.mode.value === "UNSUPERVISED";

    dom.threshold.disabled = !usesThreshold;
    dom.thresholdBlock.hidden = !usesThreshold;
}

function processItems() {
    try {
        const itemValidation = validateItemsInput(dom.input.value);
        const seedValidation = validateSeedsInput(dom.seedsInput.value);

        if (!itemValidation.isValid) {
            showErrorToast(itemValidation.message);
            return;
        }

        const seeds = parseSeeds(dom.seedsInput.value);

        if (dom.mode.value === "SUPERVISED" && Object.keys(seeds).length === 0) {
            showErrorToast("Add at least one seed category for supervised clustering.");
            return;
        }

        if (seedValidation.invalidLines.length > 0) {
            showErrorToast(
                `${seedValidation.invalidLines.length} seed line(s) ignored due to invalid format.`
            );
        }

        const seedLookup = createSeedLookup(seeds);
        const items = parseItems(dom.input.value, seedLookup);

        if (itemValidation.invalidLines.length > 0) {
            showErrorToast(
                `${itemValidation.invalidLines.length} item line(s) ignored due to invalid format.`
            );
        }

        if (dom.mode.value === "SUPERVISED") {
            renderSupervised(clusterSupervised(items, seeds));
            return;
        }

        renderUnsupervised(
            clusterUnsupervised(items, Number.parseFloat(dom.threshold.value))
        );
    } catch (error) {
        showErrorToast(error.message || "Unable to cluster items.");
    }
}

function validateItemsInput(rawItems) {
    const lines = rawItems
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const invalidLines = lines.filter((line) => !APP_CONFIG.itemPattern.test(line));

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

        return line.slice(separatorIndex + 1).trim().length === 0;
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
            const words = line
                .slice(separatorIndex + 1)
                .split(",")
                .map(normalizeSeedWord)
                .filter(Boolean);

            if (category && words.length > 0) {
                seeds[category] = words;
            }

            return seeds;
        }, {});
}

function createSeedLookup(seeds) {
    return Object.entries(seeds).reduce((lookup, [category, words]) => {
        words.forEach((word) => {
            word.split(" ").forEach((token) => {
                lookup.set(token, category.toLowerCase());
            });
        });

        return lookup;
    }, new Map());
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
    const match = line.match(APP_CONFIG.itemPattern);

    if (!match) {
        return null;
    }

    const [, id, description] = match;

    return {
        id,
        description,
        tokens: tokenizeItem(description, seedLookup)
    };
}

function tokenizeItem(text, seedLookup) {
    const normalizedText = normalizeText(text);
    const tokens = [];
    const seen = new Set();
    let match;

    APP_CONFIG.tokenPattern.lastIndex = 0;

    while ((match = APP_CONFIG.tokenPattern.exec(normalizedText)) !== null) {
        const rawToken = match[0];
        const reducedToken = reduceToken(rawToken);

        if (rawToken.length <= 2 || APP_CONFIG.stopwords.has(rawToken)) {
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

function normalizeSeedWord(word) {
    const normalizedWord = normalizeText(word).match(APP_CONFIG.tokenPattern);

    return normalizedWord ? normalizedWord.map(reduceToken).join(" ") : "";
}

function normalizeText(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(APP_CONFIG.diacriticPattern, "");
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

function clusterSupervised(items, seeds) {
    const seedClusters = Object.keys(seeds);
    const clusterByToken = seedClusters.reduce((lookup, cluster) => {
        lookup.set(cluster.toLowerCase(), cluster);
        return lookup;
    }, new Map());
    const clusters = Object.keys(seeds).reduce((initialClusters, seedName) => {
        initialClusters[seedName] = [];
        return initialClusters;
    }, { [APP_CONFIG.uncategorizedCluster]: [] });

    return items.reduce((clustersByName, item) => {
        const scores = scoreItem(
            item.tokens,
            seedClusters,
            clusterByToken
        );
        const bestClusters = getBestClusters(scores);

        bestClusters.forEach((cluster) => {
            clustersByName[cluster] = clustersByName[cluster] || [];
            clustersByName[cluster].push(item);
        });

        return clustersByName;
    }, clusters);
}

function scoreItem(tokens, seedClusters, clusterByToken) {
    const scores = seedClusters.reduce((initialScores, cluster) => {
        initialScores[cluster] = 0;
        return initialScores;
    }, {});

    tokens.forEach((token) => {
        const cluster = clusterByToken.get(token);

        if (cluster) {
            scores[cluster] += 1;
        }
    });

    return scores;
}

function getBestClusters(scores) {
    const maxScore = Math.max(0, ...Object.values(scores));

    if (maxScore === 0) {
        return [APP_CONFIG.uncategorizedCluster];
    }

    return Object.keys(scores).filter((cluster) => scores[cluster] === maxScore);
}

function clusterUnsupervised(items, threshold) {
    const clusters = [];
    const clusterIndexByToken = new Map();
    let visitId = 0;
    const emptyTokenCluster = {
        index: 0,
        name: APP_CONFIG.unknownCluster,
        tokens: [],
        tokenSet: new Set(),
        tokenCount: 0,
        items: [],
        matchCount: 0,
        seenAt: 0
    };

    items.forEach((item) => {
        if (item.tokens.length === 0) {
            if (emptyTokenCluster.items.length === 0) {
                emptyTokenCluster.index = clusters.length;
                clusters.push(emptyTokenCluster);
            }

            emptyTokenCluster.items.push(item);
            return;
        }

        const matchingCluster = findBestCluster(
            item.tokens,
            clusterIndexByToken,
            threshold,
            visitId += 1
        );

        if (matchingCluster) {
            addItemToCluster(matchingCluster, item, clusterIndexByToken);
            return;
        }

        const cluster = {
            index: clusters.length,
            name: generateClusterName(item.tokens),
            tokens: item.tokens,
            tokenSet: new Set(item.tokens),
            tokenCount: item.tokens.length,
            items: [item],
            matchCount: 0,
            seenAt: 0
        };

        clusters.push(cluster);
        indexClusterTokens(cluster, item.tokens, clusterIndexByToken);
    });

    return clusters;
}

function findBestCluster(tokens, clusterIndexByToken, threshold, visitId) {
    const candidates = [];
    const tokenCount = tokens.length;
    const thresholdScore = threshold * threshold;
    let bestCluster = null;
    let bestScore = thresholdScore;

    tokens.forEach((token) => {
        const indexedClusters = clusterIndexByToken.get(token);

        if (!indexedClusters) {
            return;
        }

        indexedClusters.forEach((cluster) => {
            if (cluster.seenAt !== visitId) {
                cluster.seenAt = visitId;
                cluster.matchCount = 0;
                candidates.push(cluster);
            }

            cluster.matchCount += 1;
        });
    });

    candidates.forEach((cluster) => {
        const currentScore =
            (cluster.matchCount * cluster.matchCount) / (tokenCount * cluster.tokenCount);

        if (currentScore >= bestScore) {
            bestScore = currentScore;
            bestCluster = cluster;
        }
    });

    return bestCluster;
}

function addItemToCluster(cluster, item, clusterIndexByToken) {
    const newTokens = [];

    item.tokens.forEach((token) => {
        if (cluster.tokenSet.has(token)) {
            return;
        }

        cluster.tokenSet.add(token);
        cluster.tokens.push(token);
        cluster.tokenCount += 1;
        newTokens.push(token);
    });

    cluster.items.push(item);

    if (newTokens.length > 0) {
        indexClusterTokens(cluster, newTokens, clusterIndexByToken);
    }
}

function indexClusterTokens(cluster, tokens, clusterIndexByToken) {
    tokens.forEach((token) => {
        let indexedClusters = clusterIndexByToken.get(token);

        if (!indexedClusters) {
            indexedClusters = [];
            clusterIndexByToken.set(token, indexedClusters);
        }

        indexedClusters.push(cluster);
    });
}

function generateClusterName(tokens) {
    if (tokens.length === 0) {
        return APP_CONFIG.unknownCluster;
    }

    return `CLUSTER_${tokens.slice(0, 3).join("_").toUpperCase()}`;
}

function renderSupervised(clusteredItems) {
    clearOutput();

    const clusters = orderClusters(
        Object.entries(clusteredItems).map(([clusterName, items]) => ({
            name: clusterName,
            meta: [`Items: ${items.length}`],
            items
        }))
    );

    setExportData({
        mode: "SUPERVISED",
        similarityThreshold: "",
        clusters
    });

    dom.output.appendChild(createCategoryOverview(clusters));

    clusters.forEach((cluster) => {
        dom.output.appendChild(
            createClusterElement({
                id: cluster.id,
                title: cluster.name,
                meta: cluster.meta,
                items: cluster.items
            })
        );
    });
}

function renderUnsupervised(clusters) {
    clearOutput();

    const outputClusters = orderClusters(
        clusters.map((cluster) => ({
            name: cluster.name,
            meta: [
                `Items: ${cluster.items.length}`,
                `Cluster Tokens: ${cluster.tokens.join(", ")}`
            ],
            items: cluster.items
        }))
    );

    setExportData({
        mode: "UNSUPERVISED",
        similarityThreshold: dom.threshold.value,
        clusters: outputClusters
    });

    dom.output.appendChild(createCategoryOverview(outputClusters));

    outputClusters.forEach((cluster) => {
        dom.output.appendChild(
            createClusterElement({
                id: cluster.id,
                title: cluster.name,
                meta: cluster.meta,
                items: cluster.items
            })
        );
    });
}

function clearOutput() {
    dom.output.replaceChildren();
}

function setExportData({ mode, similarityThreshold, clusters }) {
    currentExportData = {
        mode,
        similarityThreshold,
        exportedAt: new Date().toISOString(),
        clusters: clusters.map((cluster) => ({
            name: cluster.name,
            meta: cluster.meta,
            items: cluster.items
        }))
    };

    dom.exportButton.disabled = currentExportData.clusters.length === 0;
}

function orderClusters(clusters) {
    const sortedClusters = clusters.map((cluster, index) => ({
        ...cluster,
        id: `cluster-${slugify(cluster.name)}-${index}`
    }));

    return sortedClusters.sort((clusterA, clusterB) => {
        const aIsUncategorized = clusterA.name === APP_CONFIG.uncategorizedCluster;
        const bIsUncategorized = clusterB.name === APP_CONFIG.uncategorizedCluster;

        if (aIsUncategorized === bIsUncategorized) {
            return 0;
        }

        if (APP_CONFIG.uncategorizedPosition === "start") {
            return aIsUncategorized ? -1 : 1;
        }

        return aIsUncategorized ? 1 : -1;
    });
}

function createCategoryOverview(clusters) {
    const overview = document.createElement("section");
    const heading = document.createElement("h2");
    const list = document.createElement("div");

    overview.className = "category-overview";
    heading.textContent = "Category Summary";
    list.className = "category-overview-list";

    clusters.forEach((cluster) => {
        const item = document.createElement("button");
        const count = cluster.items.length;

        item.type = "button";
        item.className = "category-overview-item";
        if (cluster.name === APP_CONFIG.uncategorizedCluster) {
            item.classList.add("is-uncategorized");
        }
        item.textContent = `${cluster.name}: ${count}`;
        item.addEventListener("click", () => scrollToCluster(cluster.id));
        list.appendChild(item);
    });

    overview.append(heading, list);

    return overview;
}

function scrollToCluster(clusterId) {
    const cluster = document.getElementById(clusterId);

    if (!cluster) {
        return;
    }

    cluster.open = true;
    cluster.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createClusterElement({ id, title, meta, items }) {
    const cluster = document.createElement("details");
    const heading = document.createElement("h2");
    const header = document.createElement("summary");
    const metaElement = document.createElement("div");
    const itemList = document.createElement("div");

    cluster.id = id;
    cluster.className = "cluster";
    cluster.open = true;
    if (title === APP_CONFIG.uncategorizedCluster) {
        cluster.classList.add("is-uncategorized");
    }
    metaElement.className = "cluster-summary";
    itemList.className = "cluster-items";
    heading.textContent = title;

    meta.forEach((line) => {
        const item = document.createElement("span");
        item.textContent = line;
        metaElement.appendChild(item);
    });

    header.append(heading, metaElement);
    cluster.appendChild(header);

    if (items.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-cluster";
        emptyMessage.textContent = "No items in this category.";
        itemList.appendChild(emptyMessage);
    } else {
        items.forEach((item) => {
            itemList.appendChild(createItemElement(item));
        });
    }

    cluster.appendChild(itemList);

    return cluster;
}

function createItemElement(classifiedItem) {
    const item = document.createElement("article");
    const id = document.createElement("strong");
    const description = document.createElement("p");
    const tokens = document.createElement("div");

    item.className = "classified-item";
    tokens.className = "tokens";
    id.textContent = classifiedItem.id;
    description.textContent = classifiedItem.description;
    tokens.textContent = `Tokens: ${classifiedItem.tokens.join(", ")}`;

    item.append(id, description, tokens);

    return item;
}

function unique(items) {
    return [...new Set(items)];
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function showErrorToast(message) {
    const toast = document.createElement("div");
    const text = document.createElement("p");
    const closeButton = document.createElement("button");
    const id = toastId += 1;

    toast.className = "toast toast-error";
    toast.dataset.toastId = String(id);
    toast.setAttribute("role", "alert");
    text.textContent = message;
    closeButton.type = "button";
    closeButton.className = "toast-close";
    closeButton.setAttribute("aria-label", "Dismiss error");
    closeButton.textContent = "x";
    closeButton.addEventListener("click", () => dismissToast(toast));

    toast.append(text, closeButton);
    dom.toastContainer.appendChild(toast);

    window.setTimeout(() => {
        dismissToast(toast);
    }, 6000);
}

function dismissToast(toast) {
    if (!toast || !toast.isConnected) {
        return;
    }

    toast.classList.add("is-hiding");
    window.setTimeout(() => {
        toast.remove();
    }, 180);
}

function exportCurrentResults() {
    if (!currentExportData) {
        showErrorToast("Cluster items before exporting.");
        return;
    }

    try {
        const workbook = createXlsxWorkbook([
            {
                path: "xl/worksheets/sheet1.xml",
                name: "Summary",
                rows: createSummaryRows(currentExportData)
            },
            {
                path: "xl/worksheets/sheet2.xml",
                name: "Items",
                rows: createItemRows(currentExportData)
            }
        ]);
        const blob = new Blob([workbook], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `natural-keyword-classifier-${formatDateForFile(new Date())}.xlsx`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    } catch (error) {
        showErrorToast(error.message || "Unable to export XLSX.");
    }
}

function createSummaryRows(data) {
    const rows = [
        ["Mode", data.mode],
        ["Similarity Threshold", data.similarityThreshold],
        ["Exported At", data.exportedAt],
        [],
        ["Category", "Item Count", "Details"]
    ];

    data.clusters.forEach((cluster) => {
        rows.push([
            cluster.name,
            cluster.items.length,
            cluster.meta.join(" | ")
        ]);
    });

    return rows;
}

function createItemRows(data) {
    const rows = [["Category", "Item ID", "Description", "Tokens"]];

    data.clusters.forEach((cluster) => {
        cluster.items.forEach((item) => {
            rows.push([
                cluster.name,
                item.id,
                item.description,
                item.tokens.join(", ")
            ]);
        });
    });

    return rows;
}

function createXlsxWorkbook(sheets) {
    const files = [
        {
            path: "[Content_Types].xml",
            content: createContentTypesXml(sheets)
        },
        {
            path: "_rels/.rels",
            content: createRootRelsXml()
        },
        {
            path: "xl/workbook.xml",
            content: createWorkbookXml(sheets)
        },
        {
            path: "xl/_rels/workbook.xml.rels",
            content: createWorkbookRelsXml(sheets)
        },
        ...sheets.map((sheet) => ({
            path: sheet.path,
            content: createWorksheetXml(sheet.rows)
        }))
    ];

    return createZip(files);
}

function createContentTypesXml(sheets) {
    const worksheetOverrides = sheets
        .map((sheet) => (
            `<Override PartName="/${sheet.path}" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
        ))
        .join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${worksheetOverrides}
</Types>`;
}

function createRootRelsXml() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function createWorkbookXml(sheets) {
    const sheetXml = sheets
        .map((sheet, index) => (
            `<sheet name="${escapeXmlAttribute(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
        ))
        .join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>${sheetXml}</sheets>
</workbook>`;
}

function createWorkbookRelsXml(sheets) {
    const rels = sheets
        .map((sheet, index) => (
            `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/${sheet.path.split("/").pop()}"/>`
        ))
        .join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels}
</Relationships>`;
}

function createWorksheetXml(rows) {
    const sheetRows = rows
        .map((row, rowIndex) => {
            const rowNumber = rowIndex + 1;
            const cells = row
                .map((cell, columnIndex) => createCellXml(cell, columnIndex, rowNumber))
                .join("");

            return `<row r="${rowNumber}">${cells}</row>`;
        })
        .join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${sheetRows}</sheetData>
</worksheet>`;
}

function createCellXml(value, columnIndex, rowNumber) {
    const cellReference = `${getColumnName(columnIndex)}${rowNumber}`;
    const text = value === null || value === undefined ? "" : String(value);

    return `<c r="${cellReference}" t="inlineStr"><is><t>${escapeXmlText(text)}</t></is></c>`;
}

function getColumnName(index) {
    let columnName = "";
    let currentIndex = index + 1;

    while (currentIndex > 0) {
        const remainder = (currentIndex - 1) % 26;
        columnName = String.fromCharCode(65 + remainder) + columnName;
        currentIndex = Math.floor((currentIndex - 1) / 26);
    }

    return columnName;
}

function createZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((file) => {
        const nameBytes = encoder.encode(file.path);
        const contentBytes = encoder.encode(file.content);
        const crc = crc32(contentBytes);
        const localHeader = createZipLocalHeader(nameBytes, contentBytes, crc);
        const centralHeader = createZipCentralHeader(
            nameBytes,
            contentBytes,
            crc,
            offset
        );

        localParts.push(localHeader, contentBytes);
        centralParts.push(centralHeader);
        offset += localHeader.length + contentBytes.length;
    });

    const centralOffset = offset;
    const centralSize = centralParts.reduce((size, part) => size + part.length, 0);
    const endRecord = createZipEndRecord(files.length, centralSize, centralOffset);

    return concatUint8Arrays([...localParts, ...centralParts, endRecord]);
}

function createZipLocalHeader(nameBytes, contentBytes, crc) {
    const header = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, contentBytes.length, true);
    view.setUint32(22, contentBytes.length, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    header.set(nameBytes, 30);

    return header;
}

function createZipCentralHeader(nameBytes, contentBytes, crc, localHeaderOffset) {
    const header = new Uint8Array(46 + nameBytes.length);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, crc, true);
    view.setUint32(20, contentBytes.length, true);
    view.setUint32(24, contentBytes.length, true);
    view.setUint16(28, nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, localHeaderOffset, true);
    header.set(nameBytes, 46);

    return header;
}

function createZipEndRecord(entryCount, centralSize, centralOffset) {
    const record = new Uint8Array(22);
    const view = new DataView(record.buffer);

    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, entryCount, true);
    view.setUint16(10, entryCount, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralOffset, true);
    view.setUint16(20, 0, true);

    return record;
}

function concatUint8Arrays(parts) {
    const totalLength = parts.reduce((length, part) => length + part.length, 0);
    const output = new Uint8Array(totalLength);
    let offset = 0;

    parts.forEach((part) => {
        output.set(part, offset);
        offset += part.length;
    });

    return output;
}

function crc32(bytes) {
    let crc = 0xffffffff;

    for (let index = 0; index < bytes.length; index += 1) {
        crc ^= bytes[index];

        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
        }
    }

    return (crc ^ 0xffffffff) >>> 0;
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
