# Natural Keyword Classifier
Natural Keyword Classifier is a small, offline browser app for grouping text items by
keyword categories or by token similarity. It is designed to work as a self-contained repository:
the app runs locally, does not call external services, and exports results directly from the
browser.

## Features

- Supervised classification with user-defined seed categories.
- Positive and negative seed rules for category inclusion and exclusion.
- Seed matching by word, quoted phrase, or JavaScript regular expression.
- Unsupervised clustering based on token similarity.
- Native browser tokenization with normalized seed lookup and no external NLP runtime.
- Optimized unsupervised clustering with an inverted token index.
- Category summary with clickable category shortcuts.
- Collapsible category sections.
- Result tabs with the existing cluster view and an Excel-style table view.
- XLSX export with `Summary` and `Items` sheets.
- JSON session export/import to pause a classification pass and resume later.
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
CATEGORY: word1, "key phrase", /regex/, -excluded
```

Example:

```text
AUTH: login,token,session,password,"access control",-/guest|anonymous/
EXPORT: spreadsheet,xlsx,download,file,-preview
UI: button,toast,screen,section,-api
```

Seed category names are normalized to uppercase. Seed words and phrases are normalized before
matching. Regex rules are JavaScript regular expressions and run locally in the browser. Prefix a
rule with `-` to make it negative; if a negative rule matches, that category is excluded for that
item.

The seed rule builder above the textarea can append common rules without hiding the plain text
format, so configurations remain easy to review, paste, and version.

## Classification Modes

### Supervised

Supervised mode uses the seed categories. Each item is tokenized, seed words are mapped to their
category, and the item is assigned to the highest-scoring category. Phrase and regex matches carry
a higher score than single-word matches. Items with no matching seed category, or only excluded
categories, are placed in `UNCATEGORIZED`.

The similarity threshold control is hidden in supervised mode because it is not used.

### Unsupervised

Unsupervised mode groups items by token similarity. It uses the similarity threshold to decide
whether an item should join an existing cluster or start a new one.

The clustering implementation uses an inverted token index so each item is only compared with
clusters that share at least one token.

## Tokenization

Tokenization is implemented in `js/text.js` and runs entirely in the browser.

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
- classification evidence for supervised results, including score and matched rules.
- an alternate table view with category, item ID, description, tokens, score, matched rules, and
  negative-rule notes.

`UNCATEGORIZED` is kept visually distinct and ordered separately from normal categories.

## XLSX Export

Click `Export XLSX` after clustering.

The generated workbook contains:

- `Summary`: mode, threshold, export timestamp, category names, and item counts.
- `Items`: category, item ID, description, tokens, score, matched rules, and negative-rule notes.

The XLSX file is generated in the browser without external libraries or network calls.

## Session JSON

Click `Export Session JSON` to save the current item input, seed categories, mode, threshold, and
last generated results. Click `Import Session JSON` to load that file later; the app restores the
inputs and reclusters automatically so work can continue from the same setup.

Session files are plain JSON and are generated/read entirely in the browser.

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
- `script.js`: tiny browser bootstrap that starts the app after the DOM is ready.
- `js/config.js`: shared app constants and stopwords.
- `js/text.js`: normalization, suffix reduction, and tokenization.
- `js/seeds.js`: seed parsing, negative rules, phrases, regex rules, and seed editor helpers.
- `js/items.js`: item input validation and item parsing.
- `js/clustering.js`: supervised and unsupervised clustering logic.
- `js/results.js`: result preparation, cluster cards, and table view rendering.
- `js/xlsx.js`: offline XLSX workbook generation and download.
- `js/toast.js`: toast notification rendering.
- `js/session.js`: offline JSON session save/load helpers.
- `js/app.js`: DOM wiring and top-level workflow orchestration.
- `dev-server.js`: local static development server.
- `package.json`: development command definition.
- `examples/`: importable offline sample sessions.
- `vendor/`: vendored assets kept in the repository for offline use.
