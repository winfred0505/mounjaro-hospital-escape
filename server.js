const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const BASE_DIR = path.resolve(__dirname, "..");

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
    let reqUrl = decodeURI(req.url.split("?")[0]);
    if (reqUrl === "/" || reqUrl === "/hospital-escape" || reqUrl === "/hospital-escape/") {
        reqUrl = "/hospital-escape/index.html";
    }

    const filePath = path.join(BASE_DIR, reqUrl);
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("404 Not Found");
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`🏥 猛健樂醫院藥事解密伺服器啟動於: http://localhost:${PORT}/hospital-escape/index.html`);
});