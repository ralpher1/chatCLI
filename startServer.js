const http = require('http');

function handleGetRequest(req, res) {
    try {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('Hello World!');
        } else {
            res.writeHead(404);
            res.end();
        }
    } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}

function handlePostRequest(req, res) {
    try {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('Hello World!');
        } else {
            res.writeHead(404);
            res.end();
        }
    } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
}

module.exports=function startServer() {
    const server = http.createServer((req, res) => {
        try {
            switch (req.method) {
                case 'GET':
                    handleGetRequest(req, res);
                    break;
                case 'POST':
                    handlePostRequest(req, res);
                    break;
                default:
                    res.writeHead(405);
                    res.end();
                    break;
            }
        } catch (err) {
            console.error(err);
            res.writeHead(500);
            res.end('Internal Server Error');
        }
    });

    server.on('error', (err) => {
        console.error('Server error:', err);
    });

    server.listen(3000, () => {
        console.log('Server is listening on http://localhost:3000');
    });
}

// Call the function to start the server

