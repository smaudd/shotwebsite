# Screenshot Utility

A command-line utility for capturing website screenshots in both desktop and mobile views. This tool removes unwanted elements, and blocks tracking domains automatically.

## Features

- Captures both desktop and mobile screenshots
- Removes specified elements from the page before taking screenshots
- Waits for animations to complete
- Compatible with older versions of Puppeteer
- Fully configurable via command-line arguments

## Requirements

- Node.js (v10 or higher)
- NPM or Yarn

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

## Usage

```bash
node index.js [url] [output-folder]
```

Example:

```bash
node index.js https://example.com my-screenshots
```

This will:

- Take screenshots of https://example.com
- Save them to `./screenshots/my-screenshots/`

## Advanced Usage

You can customize which elements to remove and which domains to block:

```bash
node index.js [url] [output-folder] --selectors="selector1,selector2" --domains="domain1.com,domain2.com"
```

## Output
The script generates two files in the specified output directory:

- desktop.png - Desktop view screenshot (1920×1080)
- mobile.png - Mobile view screenshot (430×932)
