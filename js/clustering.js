window.NKC_CLUSTERING = (() => {
    const config = window.NKC_CONFIG;

    function clusterSupervised(items, seeds) {
        const seedClusters = Object.keys(seeds);
        const clusters = Object.keys(seeds).reduce((initialClusters, seedName) => {
            initialClusters[seedName] = [];
            return initialClusters;
        }, { [config.uncategorizedCluster]: [] });

        return items.reduce((clustersByName, item) => {
            const scoredItem = scoreItem(item, seedClusters, seeds);
            const bestClusters = getBestClusters(scoredItem.scores, scoredItem.blocked);

            bestClusters.forEach((cluster) => {
                clustersByName[cluster] = clustersByName[cluster] || [];
                clustersByName[cluster].push({
                    ...item,
                    classification: createClassificationDetails(cluster, scoredItem)
                });
            });

            return clustersByName;
        }, clusters);
    }

    function scoreItem(item, seedClusters, seeds) {
        const scores = seedClusters.reduce((initialScores, cluster) => {
            initialScores[cluster] = 0;
            return initialScores;
        }, {});
        const matches = seedClusters.reduce((initialMatches, cluster) => {
            initialMatches[cluster] = [];
            return initialMatches;
        }, {});
        const blocked = seedClusters.reduce((initialBlocked, cluster) => {
            initialBlocked[cluster] = [];
            return initialBlocked;
        }, {});

        seedClusters.forEach((cluster) => {
            const ruleSet = seeds[cluster];

            ruleSet.negative.forEach((rule) => {
                const match = matchRule(rule, item);

                if (match) {
                    blocked[cluster].push(match);
                }
            });

            if (blocked[cluster].length > 0) {
                return;
            }

            ruleSet.positive.forEach((rule) => {
                const match = matchRule(rule, item);

                if (!match) {
                    return;
                }

                scores[cluster] += rule.weight;
                matches[cluster].push(match);
            });
        });

        return { scores, matches, blocked };
    }

    function matchRule(rule, item) {
        if (rule.kind === "token") {
            return item.tokens.includes(rule.normalized) ? rule.raw : "";
        }

        if (rule.kind === "phrase") {
            return item.normalizedReducedDescription.includes(rule.normalized)
                ? `phrase: ${rule.raw}`
                : "";
        }

        if (rule.kind === "regex") {
            const match = item.description.match(rule.regex);

            return match ? `regex: ${rule.raw}` : "";
        }

        return "";
    }

    function createClassificationDetails(cluster, scoredItem) {
        if (cluster === config.uncategorizedCluster) {
            const excluded = Object.entries(scoredItem.blocked)
                .filter(([, matches]) => matches.length > 0)
                .map(([category, matches]) => `${category} excluded by ${matches.join(", ")}`);

            return {
                category: cluster,
                score: 0,
                matches: [],
                excluded
            };
        }

        return {
            category: cluster,
            score: scoredItem.scores[cluster],
            matches: scoredItem.matches[cluster],
            excluded: scoredItem.blocked[cluster]
        };
    }

    function getBestClusters(scores, blocked) {
        const maxScore = Math.max(0, ...Object.values(scores));

        if (maxScore === 0) {
            return [config.uncategorizedCluster];
        }

        return Object.keys(scores).filter((cluster) => (
            scores[cluster] === maxScore && blocked[cluster].length === 0
        ));
    }

    function clusterUnsupervised(items, threshold) {
        const clusters = [];
        const clusterIndexByToken = new Map();
        let visitId = 0;
        const emptyTokenCluster = {
            index: 0,
            name: config.unknownCluster,
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
            return config.unknownCluster;
        }

        return `CLUSTER_${tokens.slice(0, 3).join("_").toUpperCase()}`;
    }

    return {
        clusterSupervised,
        clusterUnsupervised
    };
})();
