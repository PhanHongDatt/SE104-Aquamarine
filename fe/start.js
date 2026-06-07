// start.js - Wrapper that adds static file serving to Next.js standalone server
// Monkey-patches http.Server.prototype.listen to prepend a static file handler
var fs = require("fs");
var path = require("path");
var url = require("url");

var STATIC_DIR = path.join(__dirname, ".next", "static");
var MIME = {
  ".js": "application/javascript; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

// Build hash map
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
      }
    }
  } catch (e) {}
}
scanDir(STATIC_DIR, "");

// Map CSS files (CSS filenames may not follow name-HASH.ext pattern)
try {
  var cssDir = path.join(STATIC_DIR, "css");
  fs.readdirSync(cssDir).forEach(function (f) {
    if (f.endsWith(".css")) {
      hashMap["css/app/layout.css"] = path.join(cssDir, f);
      hashMap["css/layout.css"] = path.join(cssDir, f);
    }
  });
} catch (e) {}
console.log("[start.js] Static map: " + Object.keys(hashMap).length + " entries");

function serveFile(res, filePath) {
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return false;
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

function tryStatic(req, res) {
  var pathname = url.parse(req.url).pathname;
  if (pathname.indexOf("/_next/static/") !== 0) return false;
  var rel = pathname.replace("/_next/static/", "").split("?")[0];

  // Exact path
  if (serveFile(res, path.join(STATIC_DIR, rel))) return true;
  // HashMap
  if (hashMap[rel] && serveFile(res, hashMap[rel])) return true;
  // Basename
  var bn = path.basename(rel);
  if (hashMap[bn] && serveFile(res, hashMap[bn])) return true;

  // Fuzzy match for app/ prefix files
  if (rel.indexOf("app/") === 0) {
    var nameOnly = bn.replace(/\.\w+$/, "");
    var ext = path.extname(bn);
    try {
      // Search in chunks/
      var entries = fs.readdirSync(path.join(STATIC_DIR, "chunks"));
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].indexOf(nameOnly) !== -1 && entries[i].endsWith(ext)) {
          if (serveFile(res, path.join(STATIC_DIR, "chunks", entries[i]))) return true;
        }
      }
      // Search in chunks/app/ recursively
      var appDir = path.join(STATIC_DIR, "chunks", "app");
      if (fs.existsSync(appDir)) {
        var found = false;
        var walk = function (dir) {
          if (found) return;
          var ents = fs.readdirSync(dir, { withFileTypes: true });
          for (var j = 0; j < ents.length; j++) {
            if (found) return;
            if (ents[j].isDirectory()) {
              walk(path.join(dir, ents[j].name));
            } else if (
              ents[j].isFile() &&
              ents[j].name.indexOf(nameOnly) !== -1 &&
              ents[j].name.endsWith(ext)
            ) {
              if (serveFile(res, path.join(dir, ents[j].name))) {
                found = true;
                return;
              }
            }
          }
        };
        walk(appDir);
        if (found) return true;
      }
    } catch (e) {}
  }
  return false;
}

// Monkey-patch Server.prototype.listen to prepend our handler
var origListen = require("http").Server.prototype.listen;
require("http").Server.prototype.listen = function () {
  this.prependListener("request", function (req, res) {
    if (tryStatic(req, res)) return;
  });
  return origListen.apply(this, arguments);
};

// Load the actual server
require("./server.js");
