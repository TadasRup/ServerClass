import { file } from './../lib/file.js';
const user = {};
const userByEmail = {};
user.create = async (data) => {
    let [err, msg] = await file.read('../data', data.email + '.json');
    if (!err) {
        return [false, 'User exists'];
    }
    [err, msg] = await file.lastFile('../data');
    if (!err) {
        data.id = JSON.parse(msg).id + 1;
    }
    [err, msg] = await file.create('../data', data.email + '.json', data);
    return [err ? false : true, err ? 'User not created' : 'User created'];
};
userByEmail.get = async (email) => {
    let [err, msg] = await file.read('../data', email + '.json');
    return err ? [null, 'User does not exists'] : [JSON.parse(msg), ''];
};
export { user, userByEmail };
