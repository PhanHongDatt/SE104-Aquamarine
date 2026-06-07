// Patch server.js to serve static files from .next/static
// This script modifies server.js to add a static file handler
// that intercepts requests before the Next.js handler
const fs = require("fs");
const path = require("path");

let code = fs.readFileSync("server.js", "utf8");

// Static file handler code to inject
const handler = `
// === Injected static file handler ===
;(function() {
  var _fs = require("fs");
  var _path = require("path");
  var _url = require("url");
  var _STATIC = _path.join(__dirname, ".next", "static");
  var _MIME = {".js":"application/javascript; charset=UTF-8",".css":"text/css; charset=UTF-8",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".ico":"image/x-icon",".woff":"font/woff",".woff2":"font/woff2"};
  var _hashMap = {};
  function _scan(d,p){try{_fs.readdirSync(d,{withFileTypes:true}).forEach(function(e){if(e.isDirectory())_scan(_path.join(d,e.name),p+e.name+"/");else if(e.isFile()){var u=e.name.replace(/-[a-f0-9]+(\\.\\w+)$/,"$1");if(u!==e.name)_hashMap[p+u]=_path.join(d,e.name);}})}catch(e){}}
  _scan(_STATIC,"");
  try{var _cssDir=_path.join(_STATIC,"css");_fs.readdirSync(_cssDir).forEach(function(f){if(f.endsWith(".css")){_hashMap["css/app/layout.css"]=_path.join(_cssDir,f);_hashMap["css/layout.css"]=_path.join(_cssDir,f);}})}catch(e){}
  console.log("[static] URL map: " + Object.keys(_hashMap).length + " entries");
  function _serve(res,fp){try{if(!_fs.existsSync(fp)||!_fs.statSync(fp).isFile())return false;var d=_fs.readFileSync(fp);var e=_path.extname(fp);res.writeHead(200,{"Content-Type":_MIME[e]||"application/octet-stream","Content-Length":d.length,"Cache-Control":"public, max-age=31536000, immutable"});res.end(d);return true}catch(e){return false}}
  function _try(req,res){var pn=_url.parse(req.url).pathname;if(pn.indexOf("/_next/static/")!==0)return false;var rel=pn.replace("/_next/static/","").split("?")[0];if(_serve(res,_path.join(_STATIC,rel)))return true;if(_hashMap[rel]&&_serve(res,_hashMap[rel]))return true;var bn=_path.basename(rel);if(_hashMap[bn]&&_serve(res,_hashMap[bn]))return true;if(rel.indexOf("app/")===0){var n=bn.replace(/\\.\\w+$/,"");var x=_path.extname(bn);try{var es=_fs.readdirSync(_path.join(_STATIC,"chunks"));for(var i=0;i<es.length;i++){if(es[i].indexOf(n)!==-1&&es[i].endsWith(x)){if(_serve(res,_path.join(_STATIC,"chunks",es[i])))return true}}}catch(e){}}return false}
  var _origListen=require("http").Server.prototype.listen;
  require("http").Server.prototype.listen=function(){this.prependListener("request",function(req,res){if(_try(req,res))return});return _origListen.apply(this,arguments)};
  var _origListen6=require("https").Server.prototype.listen;
  require("https").Server.prototype.listen=function(){this.prependListener("request",function(req,res){if(_try(req,res))return});return _origListen6.apply(this,arguments)};
})();
// === End injected handler ===

`;

// Insert before process.env.NODE_ENV = 'production'
var idx = code.indexOf("process.env.NODE_ENV");
if (idx > 0) {
  code = code.substring(0, idx) + handler + code.substring(idx);
  fs.writeFileSync("server.js", code);
  console.log("[patch] server.js patched successfully");
} else {
  console.log("[patch] Could not find insertion point");
}
