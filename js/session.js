window.NKC_SESSION = (() => {
    const SESSION_VERSION = 1;

    function createSessionData({ itemsText, seedsText, mode, threshold, results }) {
        return {
            app: "natural-keyword-classifier",
            version: SESSION_VERSION,
            savedAt: new Date().toISOString(),
            inputs: {
                items: itemsText,
                seeds: seedsText
            },
            controls: {
                mode,
                threshold
            },
            results: results || null
        };
    }

    function downloadSession(sessionData) {
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `natural-keyword-classifier-session-${formatDateForFile(new Date())}.json`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function readSessionFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.addEventListener("load", () => {
                try {
                    resolve(validateSessionData(JSON.parse(String(reader.result))));
                } catch (error) {
                    reject(error);
                }
            });
            reader.addEventListener("error", () => {
                reject(new Error("Unable to read session file."));
            });
            reader.readAsText(file);
        });
    }

    function validateSessionData(data) {
        if (!data || data.app !== "natural-keyword-classifier") {
            throw new Error("This is not a Natural Keyword Classifier session.");
        }

        if (!data.inputs || typeof data.inputs.items !== "string") {
            throw new Error("Session file is missing item input.");
        }

        if (typeof data.inputs.seeds !== "string") {
            throw new Error("Session file is missing seed input.");
        }

        return {
            itemsText: data.inputs.items,
            seedsText: data.inputs.seeds,
            mode: data.controls?.mode === "UNSUPERVISED" ? "UNSUPERVISED" : "SUPERVISED",
            threshold: data.controls?.threshold || "0.30",
            results: data.results || null
        };
    }

    function formatDateForFile(date) {
        return date.toISOString().slice(0, 19).replace(/[:T]/g, "-");
    }

    return {
        createSessionData,
        downloadSession,
        readSessionFile
    };
})();
