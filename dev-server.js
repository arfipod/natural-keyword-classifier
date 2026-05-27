const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "localhost";
const PORT = Number.parseInt(process.env.PORT || "5173", 10);
const ROOT = __dirname;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer((request, response) => {
  const filePath = getFilePath(request.url);

  if (!filePath) {
    sendText(response, 400, "Bad request");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": getMimeType(filePath),
      "Cache-Control": "no-store"
    });

    fs.createReadStream(filePath).pipe(response);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Dev server running at http://${HOST}:${PORT}`);
});

function getFilePath(rawUrl = "/") {
  let urlPath;

  try {
    urlPath = decodeURIComponent(new URL(rawUrl, `http://${HOST}`).pathname);
  } catch {
    return null;
  }

  const normalizedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.resolve(ROOT, `.${normalizedPath}`);

  if (!filePath.startsWith(ROOT)) {
    return null;
  }

  return filePath;
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(message);
}
