window.NKC_RESULTS = (() => {
    const config = window.NKC_CONFIG;
    const { slugify } = window.NKC_UTILS;

    function prepareSupervisedResult(clusteredItems) {
        return orderClusters(
            Object.entries(clusteredItems).map(([clusterName, items]) => ({
                name: clusterName,
                meta: [`Items: ${items.length}`],
                items
            }))
        );
    }

    function prepareUnsupervisedResult(clusters) {
        return orderClusters(
            clusters.map((cluster) => ({
                name: cluster.name,
                meta: [
                    `Items: ${cluster.items.length}`,
                    `Cluster Tokens: ${cluster.tokens.join(", ")}`
                ],
                items: cluster.items
            }))
        );
    }

    function createExportData({ mode, similarityThreshold, clusters }) {
        return {
            mode,
            similarityThreshold,
            exportedAt: new Date().toISOString(),
            clusters: clusters.map((cluster) => ({
                name: cluster.name,
                meta: cluster.meta,
                items: cluster.items
            }))
        };
    }

    function renderResultViews(outputElement, clusters) {
        const tabs = document.createElement("div");
        const cardsTab = createResultTab("Cluster View", "cardsPanel", true);
        const tableTab = createResultTab("Table View", "tablePanel", false);
        const cardsPanel = createResultPanel("cardsPanel", true);
        const tablePanel = createResultPanel("tablePanel", false);

        outputElement.replaceChildren();
        tabs.className = "result-tabs";
        tabs.setAttribute("role", "tablist");
        tabs.setAttribute("aria-label", "Result views");
        tabs.append(cardsTab, tableTab);

        cardsPanel.appendChild(createCardsView(clusters));
        tablePanel.appendChild(createTableView(clusters));

        bindResultTabs([cardsTab, tableTab], [cardsPanel, tablePanel]);
        outputElement.append(tabs, cardsPanel, tablePanel);
    }

    function createResultTab(label, panelId, isSelected) {
        const tab = document.createElement("button");

        tab.type = "button";
        tab.className = "result-tab";
        tab.id = `${panelId}Tab`;
        tab.textContent = label;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", panelId);
        tab.setAttribute("aria-selected", String(isSelected));

        if (isSelected) {
            tab.classList.add("is-active");
        }

        return tab;
    }

    function createResultPanel(id, isVisible) {
        const panel = document.createElement("div");

        panel.id = id;
        panel.className = "result-panel";
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", `${id}Tab`);
        panel.hidden = !isVisible;

        return panel;
    }

    function bindResultTabs(tabs, panels) {
        tabs.forEach((tab, selectedIndex) => {
            tab.addEventListener("click", () => {
                tabs.forEach((currentTab, index) => {
                    const isSelected = index === selectedIndex;

                    currentTab.classList.toggle("is-active", isSelected);
                    currentTab.setAttribute("aria-selected", String(isSelected));
                    panels[index].hidden = !isSelected;
                });
            });
        });
    }

    function createCardsView(clusters) {
        const view = document.createDocumentFragment();
        const controls = createClusterControls();

        view.appendChild(createCategoryOverview(clusters));
        view.appendChild(controls);

        clusters.forEach((cluster) => {
            view.appendChild(
                createClusterElement({
                    id: cluster.id,
                    title: cluster.name,
                    meta: cluster.meta,
                    items: cluster.items
                })
            );
        });

        return view;
    }

    function createClusterControls() {
        const controls = document.createElement("div");
        const collapseButton = document.createElement("button");
        const expandButton = document.createElement("button");

        controls.className = "cluster-controls";
        collapseButton.type = "button";
        collapseButton.textContent = "Collapse All";
        collapseButton.addEventListener("click", () => setAllClustersOpen(false));
        expandButton.type = "button";
        expandButton.textContent = "Expand All";
        expandButton.addEventListener("click", () => setAllClustersOpen(true));

        controls.append(collapseButton, expandButton);

        return controls;
    }

    function setAllClustersOpen(isOpen) {
        document.querySelectorAll("#cardsPanel .cluster").forEach((cluster) => {
            cluster.open = isOpen;
        });
    }

    function createTableView(clusters) {
        const tableWrap = document.createElement("div");
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        const headerRow = document.createElement("tr");
        const headers = [
            "Category",
            "Item ID",
            "Description",
            "Tokens",
            "Score",
            "Matched Rules",
            "Negative Rule Notes"
        ];

        tableWrap.className = "table-view";
        table.className = "results-table";

        headers.forEach((header) => {
            const cell = document.createElement("th");

            cell.scope = "col";
            cell.textContent = header;
            headerRow.appendChild(cell);
        });

        thead.appendChild(headerRow);

        clusters.forEach((cluster) => {
            if (cluster.items.length === 0) {
                tbody.appendChild(createTableRow(cluster.name, null));
                return;
            }

            cluster.items.forEach((item) => {
                tbody.appendChild(createTableRow(cluster.name, item));
            });
        });

        table.append(thead, tbody);
        tableWrap.appendChild(table);

        return tableWrap;
    }

    function createTableRow(category, item) {
        const row = document.createElement("tr");

        if (category === config.uncategorizedCluster) {
            row.classList.add("is-uncategorized");
        }

        if (!item) {
            [
                category,
                "",
                "No items in this category.",
                "",
                "",
                "",
                ""
            ].forEach((value) => {
                row.appendChild(createTableCell(value));
            });

            return row;
        }

        const classification = getClassification(item);

        [
            category,
            item.id,
            item.description,
            item.tokens.join(", "),
            classification.score,
            classification.matches.join(", "),
            classification.excluded.join(" | ")
        ].forEach((value) => {
            row.appendChild(createTableCell(value));
        });

        return row;
    }

    function createTableCell(value) {
        const cell = document.createElement("td");

        cell.textContent = value === null || value === undefined ? "" : String(value);

        return cell;
    }

    function orderClusters(clusters) {
        const sortedClusters = clusters.map((cluster, index) => ({
            ...cluster,
            id: `cluster-${slugify(cluster.name)}-${index}`
        }));

        return sortedClusters.sort((clusterA, clusterB) => {
            const aIsUncategorized = clusterA.name === config.uncategorizedCluster;
            const bIsUncategorized = clusterB.name === config.uncategorizedCluster;

            if (aIsUncategorized === bIsUncategorized) {
                return 0;
            }

            if (config.uncategorizedPosition === "start") {
                return aIsUncategorized ? -1 : 1;
            }

            return aIsUncategorized ? 1 : -1;
        });
    }

function createCategoryOverview(clusters) {
    const overview = document.createElement("section");
    const heading = document.createElement("h2");
    const list = document.createElement("div");
    const totalItems = clusters.reduce((total, cluster) => (
        total + cluster.items.length
    ), 0);

    overview.className = "category-overview";
    heading.textContent = `Category Summary (${totalItems} total items)`;
    list.className = "category-overview-list";

        clusters.forEach((cluster) => {
            const item = document.createElement("button");
            const count = cluster.items.length;

            item.type = "button";
            item.className = "category-overview-item";
            if (cluster.name === config.uncategorizedCluster) {
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
        if (title === config.uncategorizedCluster) {
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
        const evidence = document.createElement("div");

        item.className = "classified-item";
        tokens.className = "tokens";
        evidence.className = "classification-evidence";
        id.textContent = classifiedItem.id;
        description.textContent = classifiedItem.description;
        tokens.textContent = `Tokens: ${classifiedItem.tokens.join(", ")}`;
        evidence.textContent = formatClassificationEvidence(classifiedItem.classification);

        item.append(id, description, tokens);

        if (evidence.textContent) {
            item.appendChild(evidence);
        }

        return item;
    }

    function formatClassificationEvidence(classification) {
        if (!classification) {
            return "";
        }

        const parts = [];

        if (classification.score > 0) {
            parts.push(`Score: ${classification.score}`);
        }

        if (classification.matches.length > 0) {
            parts.push(`Matched: ${classification.matches.join(", ")}`);
        }

        if (classification.excluded.length > 0) {
            parts.push(`Excluded: ${classification.excluded.join(" | ")}`);
        }

        return parts.join(" | ");
    }

    function getClassification(item) {
        return item.classification || {
            score: "",
            matches: [],
            excluded: []
        };
    }

    return {
        createExportData,
        prepareSupervisedResult,
        prepareUnsupervisedResult,
        renderResultViews
    };
})();
