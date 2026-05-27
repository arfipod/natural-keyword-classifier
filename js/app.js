window.NKC_APP = (() => {
    const {
        appendSeedRule,
        createSeedLookup,
        formatSeedRule,
        parseSeeds,
        validateSeedsInput
    } = window.NKC_SEEDS;
    const { parseItems, validateItemsInput } = window.NKC_ITEMS;
    const { clusterSupervised, clusterUnsupervised } = window.NKC_CLUSTERING;
    const {
        createExportData,
        prepareSupervisedResult,
        prepareUnsupervisedResult,
        renderResultViews
    } = window.NKC_RESULTS;
    const { exportResults } = window.NKC_XLSX;
    const {
        createSessionData,
        downloadSession,
        readSessionFile
    } = window.NKC_SESSION;

    const dom = {};
    let currentExportData = null;
    let showErrorToast = () => {};

    function init() {
        cacheDom();
        showErrorToast = window.NKC_TOAST
            .createToastController(dom.toastContainer)
            .showErrorToast;
        bindEvents();
        updateSeedCategoryOptions();
        updateThresholdLabel();
        updateThresholdControl();
    }

    function cacheDom() {
        dom.input = document.getElementById("input");
        dom.seedsInput = document.getElementById("seedsInput");
        dom.seedCategoryInput = document.getElementById("seedCategoryInput");
        dom.seedCategoryOptions = document.getElementById("seedCategoryOptions");
        dom.seedRuleInput = document.getElementById("seedRuleInput");
        dom.seedRuleType = document.getElementById("seedRuleType");
        dom.seedNegativeInput = document.getElementById("seedNegativeInput");
        dom.addSeedRuleButton = document.getElementById("addSeedRuleButton");
        dom.mode = document.getElementById("mode");
        dom.thresholdBlock = document.getElementById("thresholdBlock");
        dom.threshold = document.getElementById("threshold");
        dom.thresholdValue = document.getElementById("thresholdValue");
        dom.clusterButton = document.getElementById("clusterButton");
        dom.exportButton = document.getElementById("exportButton");
        dom.exportSessionButton = document.getElementById("exportSessionButton");
        dom.importSessionButton = document.getElementById("importSessionButton");
        dom.sessionFileInput = document.getElementById("sessionFileInput");
        dom.output = document.getElementById("output");
        dom.toastContainer = document.getElementById("toastContainer");
    }

    function bindEvents() {
        dom.mode.addEventListener("change", updateThresholdControl);
        dom.threshold.addEventListener("input", updateThresholdLabel);
        dom.clusterButton.addEventListener("click", processItems);
        dom.exportButton.addEventListener("click", exportCurrentResults);
        dom.exportSessionButton.addEventListener("click", exportCurrentSession);
        dom.importSessionButton.addEventListener("click", () => dom.sessionFileInput.click());
        dom.sessionFileInput.addEventListener("change", importSelectedSession);
        dom.seedsInput.addEventListener("input", updateSeedCategoryOptions);
        dom.addSeedRuleButton.addEventListener("click", addSeedRuleFromBuilder);
        dom.seedRuleInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addSeedRuleFromBuilder();
            }
        });
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

    function updateSeedCategoryOptions() {
        const fragment = document.createDocumentFragment();

        Object.keys(parseSeeds(dom.seedsInput.value))
            .sort((categoryA, categoryB) => categoryA.localeCompare(categoryB))
            .forEach((category) => {
                const option = document.createElement("option");
                option.value = category;
                fragment.appendChild(option);
            });

        dom.seedCategoryOptions.replaceChildren(fragment);
    }

    function addSeedRuleFromBuilder() {
        const category = dom.seedCategoryInput.value.trim().toUpperCase();
        const rawRule = dom.seedRuleInput.value.trim();

        if (!category || !rawRule) {
            showErrorToast("Add a category and a rule before inserting it.");
            return;
        }

        dom.seedsInput.value = appendSeedRule(
            dom.seedsInput.value,
            category,
            formatSeedRule(rawRule, dom.seedRuleType.value, dom.seedNegativeInput.checked)
        );
        updateSeedCategoryOptions();
        dom.seedRuleInput.value = "";
        dom.seedRuleInput.focus();
    }

    function processItems() {
        try {
            const result = classifyCurrentInputs();

            if (!result) {
                return;
            }

            currentExportData = result.exportData;
            dom.exportButton.disabled = currentExportData.clusters.length === 0;
            renderResultViews(dom.output, result.clusters);
        } catch (error) {
            showErrorToast(error.message || "Unable to cluster items.");
        }
    }

    function classifyCurrentInputs() {
        const itemValidation = validateItemsInput(dom.input.value);
        const seedValidation = validateSeedsInput(dom.seedsInput.value);

        if (!itemValidation.isValid) {
            showErrorToast(itemValidation.message);
            return null;
        }

        const seeds = parseSeeds(dom.seedsInput.value);

        if (dom.mode.value === "SUPERVISED" && Object.keys(seeds).length === 0) {
            showErrorToast("Add at least one seed category for supervised clustering.");
            return null;
        }

        if (seedValidation.invalidLines.length > 0) {
            showErrorToast(
                `${seedValidation.invalidLines.length} seed line(s) ignored due to invalid format.`
            );
        }

        const seedLookup = dom.mode.value === "UNSUPERVISED"
            ? createSeedLookup(seeds)
            : new Map();
        const items = parseItems(dom.input.value, seedLookup);

        if (itemValidation.invalidLines.length > 0) {
            showErrorToast(
                `${itemValidation.invalidLines.length} item line(s) ignored due to invalid format.`
            );
        }

        if (dom.mode.value === "SUPERVISED") {
            const clusters = prepareSupervisedResult(clusterSupervised(items, seeds));

            return {
                clusters,
                exportData: createExportData({
                    mode: "SUPERVISED",
                    similarityThreshold: "",
                    clusters
                })
            };
        }

        const clusters = prepareUnsupervisedResult(
            clusterUnsupervised(items, Number.parseFloat(dom.threshold.value))
        );

        return {
            clusters,
            exportData: createExportData({
                mode: "UNSUPERVISED",
                similarityThreshold: dom.threshold.value,
                clusters
            })
        };
    }

    function exportCurrentResults() {
        if (!currentExportData) {
            showErrorToast("Cluster items before exporting.");
            return;
        }

        try {
            exportResults(currentExportData);
        } catch (error) {
            showErrorToast(error.message || "Unable to export XLSX.");
        }
    }

    function exportCurrentSession() {
        try {
            downloadSession(createSessionData({
                itemsText: dom.input.value,
                seedsText: dom.seedsInput.value,
                mode: dom.mode.value,
                threshold: dom.threshold.value,
                results: currentExportData
            }));
        } catch (error) {
            showErrorToast(error.message || "Unable to export session.");
        }
    }

    async function importSelectedSession() {
        const [file] = dom.sessionFileInput.files;

        if (!file) {
            return;
        }

        try {
            const session = await readSessionFile(file);

            dom.input.value = session.itemsText;
            dom.seedsInput.value = session.seedsText;
            dom.mode.value = session.mode;
            dom.threshold.value = session.threshold;
            updateSeedCategoryOptions();
            updateThresholdLabel();
            updateThresholdControl();
            processItems();
        } catch (error) {
            showErrorToast(error.message || "Unable to import session.");
        } finally {
            dom.sessionFileInput.value = "";
        }
    }

    return { init };
})();
