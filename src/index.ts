import { server } from "./lib/server.js";

console.clear();

type App = {
    init: () => void;
}

const app = {} as App;

app.init = () => {
    server.init();

}

app.init();

export default app;