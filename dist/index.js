import { server } from "./lib/server.js";
console.clear();
const app = {};
app.init = () => {
    server.init();
};
app.init();
export default app;
