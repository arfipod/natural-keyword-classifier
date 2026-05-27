# Natural Keyword Classifier by ARRF

Natural Keyword Classifier by ARRF is a small, offline browser app for grouping text items by
keyword categories or by token similarity. It is designed to work as a self-contained repository:
the app runs locally, does not call external services, and exports results directly from the
browser.

## Features

- Supervised classification with user-defined seed categories.
- Unsupervised clustering based on token similarity.
- Native browser tokenization with normalized seed lookup and no external NLP runtime.
- Optimized unsupervised clustering with an inverted token index.
- Category summary with clickable category shortcuts.
- Collapsible category sections.
- XLSX export with `Summary` and `Items` sheets.
- Error toasts for invalid input, invalid seed lines, clustering errors, and export errors.

## Run The App

Open `index.html` directly in a browser.

For local development with Node installed, run:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Item Input Format

Each item must be on its own line.

The first word is used as the item ID. Everything after the first space is used as the item text.
The ID can use any prefix or shape; it does not need to start with `SSS-`.

```text
ID Text description
BUG-17 Login fails after token refresh
DOC7 Exported spreadsheet should include a summary sheet
abc123 Any first word can be used as the identifier
```

Lines without both an ID and a description are ignored and reported with an error toast.

## Seed Category Format

Seed categories are optional in unsupervised mode and required in supervised mode.

Each category must be on its own line:

```text
CATEGORY: word1,word2,word3
```

Example:

```text
AUTH: login,token,session,password
EXPORT: spreadsheet,xlsx,download,file
UI: button,toast,screen,section
```

Seed category names are normalized to uppercase. Seed words are normalized before matching.

## Classification Modes

### Supervised

Supervised mode uses the seed categories. Each item is tokenized, seed words are mapped to their
category, and the item is assigned to the highest-scoring category. Items with no matching seed
category are placed in `UNCATEGORIZED`.

The similarity threshold control is hidden in supervised mode because it is not used.

### Unsupervised

Unsupervised mode groups items by token similarity. It uses the similarity threshold to decide
whether an item should join an existing cluster or start a new one.

The clustering implementation uses an inverted token index so each item is only compared with
clusters that share at least one token.

## Tokenization

Tokenization is implemented in `script.js` and runs entirely in the browser.

The tokenizer:

- lowercases text,
- removes diacritics,
- extracts alphanumeric tokens,
- removes short tokens and stopwords,
- applies light suffix reduction for common plural and verb endings,
- maps seed words to their seed category,
- deduplicates tokens per item.

## Results

After clustering, the app shows:

- a category summary with item counts,
- clickable summary buttons that scroll to each category,
- collapsible category sections,
- each item ID, description, and generated token list.

`UNCATEGORIZED` is kept visually distinct and ordered separately from normal categories.

## XLSX Export

Click `Export XLSX` after clustering.

The generated workbook contains:

- `Summary`: mode, threshold, export timestamp, category names, and item counts.
- `Items`: category, item ID, description, and tokens.

The XLSX file is generated in the browser without external libraries or network calls.

## Error Handling

Errors are shown as white toast messages with a red accent. Toasts appear for:

- empty item input,
- invalid item lines,
- invalid seed lines,
- supervised mode without valid seed categories,
- export attempts before clustering,
- unexpected clustering or export failures.

## Repository Files

- `index.html`: app markup.
- `styles.css`: app layout and visual styling.
- `script.js`: parsing, tokenization, clustering, rendering, toasts, and XLSX generation.
- `dev-server.js`: local static development server.
- `package.json`: development command definition.
- `vendor/`: vendored assets kept in the repository for offline use.
