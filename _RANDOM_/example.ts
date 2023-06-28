const file = () => {
    return [false, 'HTML'];
};
const getUserByID = () => {
    return [false, 'HTML'];
};
const getUserByEmail = () => {
    return [false, 'HTML'];
};

const url = 'api/random';
const pages: Record<string, Function> = {
    'api/user': getUserByID,
    'api/user-by-email': getUserByEmail,
    // 'api/random' : 548565,
}

const funcToCall = pages[url];

let fileResponse = funcToCall();

let [err, msg] = fileResponse;

if (err) {
    fileResponse = file('404.html');
    err = fileResponse[0];
    msg = fileResponse[1];
}

res.end(msg)