import http, { IncomingMessage, ServerResponse } from 'node:http';
import { file } from './file.js';

type Server = {
    init: (api: object) => void;
    // httpServer: typeof http.createServer;
    httpServer: any;
    api: object;
    readBody: (req: IncomingMessage) => Promise<string>
}

const server = {} as Server;

server.readBody = async (req: IncomingMessage) => {
    let body = "";
    return new Promise((resolve, reject) => {
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            resolve(body);
        });
    });
}

server.httpServer = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const socket = req.socket as any;
    const encryption = socket.encryption as any;
    const ssl = encryption !== undefined ? 's' : '';

    const baseURL = `http${ssl}://${req.headers.host}`;
    const parsedURL = new URL(req.url ?? '', baseURL);
    const httpMethod = req.method ? req.method.toLowerCase() : 'get';
    const trimmedPath = parsedURL.pathname
        .replace(/^\/+|\/+$/g, '')
        .replace(/\/\/+/g, '/');

    const textFileExtensions = ['css', 'js', 'svg', 'webmanifest'];
    const binaryFileExtensions = ['png', 'jpg', 'jpeg', 'webp', 'ico', 'eot', 'ttf', 'woff', 'woff2', 'otf'];
    const fileExtension = trimmedPath.slice(trimmedPath.lastIndexOf('.') + 1);

    const isTextFile = textFileExtensions.includes(fileExtension);
    const isBinaryFile = binaryFileExtensions.includes(fileExtension);
    const isAPI = trimmedPath.startsWith('api/');
    const isPage = !isTextFile && !isBinaryFile && !isAPI;

    // type Mimes = { [key: string]: string };
    type Mimes = Record<string, string>;

    const MIMES: Mimes = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        json: 'application/json',
        txt: 'text/plain',
        svg: 'image/svg+xml',
        xml: 'application/xml',
        ico: 'image/vnd.microsoft.icon',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        woff2: 'font/woff2',
        woff: 'font/woff',
        ttf: 'font/ttf',
        webmanifest: 'application/manifest+json',
    };

    let responseContent: string | Buffer = 'ERROR: neturiu tai ko tu nori...';

    if (isTextFile) {
        const [err, msg] = await file.readPublic(trimmedPath);
        res.writeHead(err ? 404 : 200, {
            'Content-Type': MIMES[fileExtension],
            'cache-control': `max-age=60`,
        });
        if (err) {
            responseContent = '404';
        } else {
            responseContent = msg;
        }
    }

    if (isBinaryFile) {
        const [err, msg] = await file.readPublicBinary(trimmedPath);
        res.writeHead(err ? 404 : 200, {
            'Content-Type': MIMES[fileExtension],
            'cache-control': `max-age=60`,
        });
        if (err) {
            responseContent = msg;
        } else {
            responseContent = msg;
        }
    }

    if (isAPI) {
        const controllerName = trimmedPath.replace('api/', '').match(/([a-z\-]+)\/{0,1}(.*)/);
        const controller = server.api[controllerName[1]] || null;
        const param = controllerName[2] || null;
        let data = null;
        let msg = 'Not found';

        if (controller !== null) {
            if (httpMethod === 'get' && param !== null) {
                [data, msg] = await controller.get(param);
            } else if (httpMethod ===  'post' && param === null) {
                [data, msg] = await controller.create(JSON.parse(await server.readBody(req)));
            } else if (httpMethod === 'put' && param !== null) {
                data = controller.update(param);
            }
        }

        res.writeHead(!data ? 404 : 200, {
            'Content-Type': MIMES.json,
        });

        responseContent = data instanceof Object ? JSON.stringify(data) : JSON.stringify({
            status: data ? true : false,
            message: msg
        });
    }

    if (isPage) {
        let fileResponse = await file.read('../pages', trimmedPath + '.html');
        let [err, msg] = fileResponse;

        if (err) {
            fileResponse = await file.read('../pages', '404.html');
            err = fileResponse[0];
            msg = fileResponse[1];
        }

        res.writeHead(err ? 404 : 200, {
            'Content-Type': MIMES.html,
        });

        responseContent = msg as string;
    }

    return res.end(responseContent);
});

server.init = (api: object) => {
    server.api = api;
    server.httpServer.listen(4410, () => {
        console.log('Serveris sukasi  ant http://localhost:4410');
    });
};

export { server };