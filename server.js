const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = 3000;
const host = '0.0.0.0';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`request ${req.url}`);

    let filePath = '.' + req.url;
    
    // Explicitly handle root path or query parameters only on root
    if (filePath === './' || filePath.startsWith('./?')) {
        filePath = './index.html';
    }
    
    // Remove query string for file lookup
    filePath = filePath.split('?')[0];

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                console.error(`File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1><p>The file you requested does not exist.</p><p>Try accessing <a href="/index.html">/index.html</a></p>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

function getLocalExternalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '0.0.0.0';
}

server.listen(port, host, () => {
    const localIp = getLocalExternalIp();
    console.log(`Server running at:`);
    console.log(`- Local:   http://localhost:${port}/`);
    console.log(`- Network: http://${localIp}:${port}/`);
    console.log(`- Dev Mode: http://${localIp}:${port}/?dev=true`);
});
