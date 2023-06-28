import { server } from "./lib/server.js";
import { user, userByEmail } from "./api/user.js";
console.clear();
const app = {};
app.init = () => {
    // susikurti reikiamus/trukstamus folderius ir failus
    // atsinaujinti informacija
    // duombaze:
    // - prisijungti
    // - pasiruosti struktura
    // - surasyti pradinius duomenis
    // paleisti serverio logika
    server.init({
        user: user,
        'user-by-email': userByEmail
    });
    // laike pasikartojantys procesai:
    // - isivalyti nereikalingus failus/info
    // - atnaujinti failus/info
    // - backup darymas
};
app.init();
export default app;
