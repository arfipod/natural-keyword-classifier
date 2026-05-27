window.NKC_XLSX = (() => {
    const {
        escapeXmlAttribute,
        escapeXmlText,
        formatDateForFile
    } = window.NKC_UTILS;

    function exportResults(data) {
        const workbook = createXlsxWorkbook([
            {
                path: "xl/worksheets/sheet1.xml",
                name: "Summary",
                rows: createSummaryRows(data)
            },
            {
                path: "xl/worksheets/sheet2.xml",
                name: "Items",
                rows: createItemRows(data)
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
        const rows = [
            [
                "Category",
                "Item ID",
                "Description",
                "Tokens",
                "Score",
                "Matched Rules",
                "Negative Rule Notes"
            ]
        ];

        data.clusters.forEach((cluster) => {
            cluster.items.forEach((item) => {
                const classification = item.classification || {
                    score: "",
                    matches: [],
                    excluded: []
                };

                rows.push([
                    cluster.name,
                    item.id,
                    item.description,
                    item.tokens.join(", "),
                    classification.score,
                    classification.matches.join(", "),
                    classification.excluded.join(" | ")
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

    return {
        createItemRows,
        createSummaryRows,
        createXlsxWorkbook,
        exportResults
    };
})();
