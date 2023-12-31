import fs from 'fs/promises';
import fsSync from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';
const file = {};
const getNewestFile = (files, path) => {
    let out = [];
    files.forEach(function (file) {
        var stats = fsSync.statSync(path + "/" + file);
        if (stats.isFile()) {
            out.push({ "file": file, "mtime": stats.mtime.getTime() });
        }
    });
    out.sort(function (a, b) {
        return b.mtime - a.mtime;
    });
    return (out.length > 0) ? out[0].file : "";
};
file.lastFile = async (dir) => {
    const path = file.fullPath(dir, '');
    console.log(getNewestFile(await fs.readdir(path), path));
    return file.read(dir, getNewestFile(await fs.readdir(path), path));
};
/**
 * Sugeneruojamas absoliutus kelias iki nurodyto failo.
 * @param {string} dir Reliatyvus kelias iki direktorijos kur laikomi norimi failai, e.g. `/data/users`
 * @param {string} fileName Norimo failo pavadinimas su jo pletiniu
 * @returns {string} Absoliutus kelias iki failo
 */
file.fullPath = (dir, fileName) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '../../.data', dir, fileName);
};
file.fullPublicPath = (trimmedFilePath) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '../../public', trimmedFilePath);
};
/**
 * Sukuriamas failas, jei tokio dar nera nurodytoje direktorijoje.
 * @param {string} dir Reliatyvus kelias iki direktorijos kur laikomi norimi failai, pvz.: /data/users
 * @param {string} fileName Norimo failo pavadinimas su jo pletiniu
 * @param {object} content Objektas (pvz.: {...}), kuri norime irasyti i kuriama faila
 * @returns {Promise<[boolean, string | Error]>} Sekmes atveju - `true`; Klaidos atveju - klaidos pranesimas
 */
file.create = async (dir, fileName, content) => {
    let fileDescriptor = null;
    try {
        const filePath = file.fullPath(dir, fileName);
        fileDescriptor = await fs.open(filePath, 'wx');
        await fs.writeFile(fileDescriptor, JSON.stringify(content));
        return [false, 'OK'];
    }
    catch (error) {
        return [true, error];
    }
    finally {
        if (fileDescriptor) {
            fileDescriptor.close();
        }
    }
};
/**
 * Perskaitomas failo turinys (tekstinis failas).
 * @param {string} dir Reliatyvus kelias iki direktorijos kur laikomi norimi failai, e.g. `/data/users`
 * @param {string} fileName Norimo failo pavadinimas su jo pletiniu
 * @returns {Promise<[boolean, string | Error]>} Sekmes atveju - failo turinys; Klaidos atveju - klaida
 */
file.read = async (dir, fileName) => {
    try {
        const filePath = file.fullPath(dir, fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return [false, fileContent];
    }
    catch (error) {
        return [true, error];
    }
};
file.readPublic = async (trimmedFilePath) => {
    try {
        const filePath = file.fullPublicPath(trimmedFilePath);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return [false, fileContent];
    }
    catch (error) {
        return [true, 'Failas nerastas'];
    }
};
file.readPublicBinary = async (trimmedFilePath) => {
    try {
        const filePath = file.fullPublicPath(trimmedFilePath);
        const fileContent = await fs.readFile(filePath);
        return [false, fileContent];
    }
    catch (error) {
        return [true, 'Failas nerastas'];
    }
};
/**
 * JSON failo turinio atnaujinimas .data folder'yje.
 * @param {string} dir Sub-folder'is esantis .data folder'yje.
 * @param {string} fileName Kuriamo failo pavadinimas be failo pletinio.
 * @param {Object} content JavaScript objektas, pvz.: `{name: "Marsietis"}`.
 * @returns {Promise<[boolean, string | Error]>} Pozymis, ar funkcija sekmingai atnaujintas nurodyta faila.
 */
file.update = async (dir, fileName, content) => {
    let fileDescriptor = null;
    try {
        const filePath = file.fullPath(dir, fileName);
        fileDescriptor = await fs.open(filePath, 'r+');
        await fileDescriptor.truncate();
        await fs.writeFile(fileDescriptor, JSON.stringify(content));
        return [false, 'OK'];
    }
    catch (error) {
        return [true, error];
    }
    finally {
        if (fileDescriptor) {
            await fileDescriptor.close();
        }
    }
};
/**
 * JSON failo istrinimas .data folder'yje.
 * @param {string} dir Sub-folder'is esantis .data folder'yje.
 * @param {string} fileName Kuriamo failo pavadinimas be failo pletinio.
 * @returns {Promise<[boolean, string | Error]>} Pozymis, ar funkcija sekmingai istrintas nurodyta faila.
 */
file.delete = async (dir, fileName) => {
    try {
        const filePath = file.fullPath(dir, fileName);
        await fs.unlink(filePath);
        return [false, 'OK'];
    }
    catch (error) {
        return [true, error];
    }
};
export { file };
