const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const NEXT_PORT = 3001;
const STATIC_DIR = path.join(process.cwd(), ".next", "static");
const NEXT_DIR = path.join(process.cwd(), ".next");

const MIME = {
  ".js": "application/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
};

// Build hash map from file system scan
var hashMap = {};
function scanDir(dir, prefix) {
  try {
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      if (entry.isDirectory()) {
        scanDir(path.join(dir, entry.name), prefix + entry.name + "/");
      } else if (entry.isFile()) {
        var fullPath = path.join(dir, entry.name);
        var unhashed = entry.name.replace(/-[a-f0-9]+(\.\w+)$/, "$1");
        if (unhashed !== entry.name) {
          hashMap[prefix + unhashed] = fullPath;
        }
        // Also store by extension in subdirectories for fallback
        var ext = path.extname(entry.name);
        if (ext === ".css" || ext === ".js") {
          hashMap["__any" + ext + "__" + prefix] = fullPath;
        }
      }
    }
  } catch (e) {}
}
scanDir(STATIC_DIR, "");

// Also read build manifests to map dev-style names to hashed files
function loadJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, "utf8")); } catch (e) { return null; }
}

var buildManifest = loadJson(path.join(NEXT_DIR, "build-manifest.json"));
var appManifest = loadJson(path.join(NEXT_DIR, "app-build-manifest.json"));

// Build manifest mapping: for each page, map dev-style chunk names to hashed files
function addManifestMapping(files) {
  if (!files) return;
  for (var i = 0; i < files.length; i++) {
    var file = files[i]; // e.g. "static/css/5e292aaa70805abb.css"
    var basename = path.basename(file); // "5e292aaa70805abb.css"
    var ext = path.extname(basename);

    // For CSS files, map common dev-style names
    if (ext === ".css") {
      // Map "app/layout.css" => this file
      // The dev URL uses "app/layout.css" but the actual file is just a hash
      // We need to figure out which CSS file corresponds to which dev name
      // From the app-build-manifest, "/layout" maps to this CSS file
      hashMap["css/app/layout.css"] = path.join(NEXT_DIR, file);
    }
  }
}

if (buildManifest) {
  var pages = buildManifest.pages || {};
  for (var page in pages) {
    addManifestMapping(pages[page]);
  }
}
if (appManifest) {
  var appPages = appManifest.pages || {};
  for (var page in appPages) {
    addManifestMapping(appPages[page]);
  }
}

// Also map CSS files by directory scan
// CSS files in .next/static/css/ might not follow name-HASH.ext pattern
try {
  var cssDir = path.join(STATIC_DIR, "css");
  var cssFiles = fs.readdirSync(cssDir);
  for (var i = 0; i < cssFiles.length; i++) {
    var f = cssFiles[i];
    if (f.endsWith(".css")) {
      // Map common dev-style CSS paths
      hashMap["css/app/layout.css"] = path.join(cssDir, f);
      hashMap["css/layout.css"] = path.join(cssDir, f);
    }
  }
} catch (e) {}

var mapKeys = Object.keys(hashMap);
console.log("[proxy] URL map entries: " + mapKeys.length);

function serveFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    if (!fs.statSync(filePath).isFile()) return false;
    var data = fs.readFileSync(filePath);
    var ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Content-Length": data.length,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    res.end(data);
    return true;
  } catch (e) {
    return false;
  }
}

function tryServeStatic(req, res) {
  var pathname = url.parse(req.url).pathname;

  if (pathname.indexOf("/_next/static/") === 0) {
    var rel = pathname.replace("/_next/static/", "").split("?")[0];

    // Try exact path first
    var exact = path.join(STATIC_DIR, rel);
    if (serveFile(res, exact)) return true;

    // Try hash map with full relative path
    if (hashMap[rel] && serveFile(res, hashMap[rel])) return true;

    // Try basename lookup
    var basename = path.basename(rel);
    if (hashMap[basename] && serveFile(res, hashMap[basename])) return true;

    // Try fuzzy match: find any hashMap entry that ends with the basename
    // and is in the same directory structure
    var dir = path.dirname(rel);
    var candidate = dir + "/" + basename;
    if (hashMap[candidate] && serveFile(res, hashMap[candidate])) return true;

    // For CSS files, try serving any CSS file from the css directory
    if (rel.indexOf(".css") !== -1) {
      try {
        var cssDir = path.join(STATIC_DIR, "css");
        var cssFiles = fs.readdirSync(cssDir);
        for (var i = 0; i < cssFiles.length; i++) {
          if (cssFiles[i].endsWith(".css")) {
            if (serveFile(res, path.join(cssDir, cssFiles[i]))) return true;
          }
        }
      } catch (e) {}
    }

    // For JS files with app/ prefix, try matching by stripping app/
    if (rel.indexOf("app/") === 0) {
      var stripped = rel.replace("app/", "");
      if (hashMap["chunks/" + stripped] && serveFile(res, hashMap["chunks/" + stripped])) return true;
      if (hashMap[stripped] && serveFile(res, hashMap[stripped])) return true;

      // Try matching by basename in chunks directory
      try {
        var chunksDir = path.join(STATIC_DIR, "chunks");
        var chunkEntries = fs.readdirSync(chunksDir);
        for (var i = 0; i < chunkEntries.length; i++) {
          var entry = chunkEntries[i];
          // Check if the hashed filename contains the basename (without extension)
          var nameWithoutExt = basename.replace(/\.\w+$/, "");
          if (entry.indexOf(nameWithoutExt) !== -1 && entry.endsWith(path.extname(basename))) {
            if (serveFile(res, path.join(chunksDir, entry))) return true;
          }
        }
      } catch (e) {}
    }

    console.log("[proxy] MISS: " + rel);
  }

  if (pathname === "/favicon.ico") {
    var fp = path.join(process.cwd(), "public", "favicon.ico");
    if (serveFile(res, fp)) return true;
  }

  return false;
}

var server = http.createServer(function(req, res) {
  if (tryServeStatic(req, res)) return;

  // Proxy to Next.js
  var opts = {
    hostname: "127.0.0.1",
    port: NEXT_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  var proxyReq = http.request(opts, function(proxyRes) {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  proxyReq.on("error", function() {
    res.writeHead(502);
    res.end("Bad Gateway");
  });
  req.pipe(proxyReq, { end: true });
});

server.listen(PORT, function() {
  console.log("[proxy] Listening on port " + PORT + ", Next.js on port " + NEXT_PORT);
});
