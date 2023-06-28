import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

type File = {
    fullPath: (dir: string, fileName: string) => string;
    fullPublicPath: (trimmedFilePath: string) => string;
    create: (dir: string, fileName: string, content: any) => Promise<[boolean, string | Error]>;
    read: (dir: string, fileName: string) => Promise<[false, string] | [true, Error]>;
    readPublic: (trimmedFilePath: string) => Promise<[boolean, string]>;
    readPublicBinary: (trimmedFilePath: string) => Promise<[boolean, string | Buffer]>;
    update: (dir: string, fileName: string, content: any) => Promise<[boolean, string | Error]>;
    delete: (dir: string, fileName: string) => Promise<[boolean, string | Error]>;
}

const file = {} as File;

/**
 * Sugeneruojamas absoliutus kelias iki nurodyto failo.
 * @param {string} dir Reliatyvus kelias iki direktorijos kur laikomi norimi failai, e.g. `/data/users`
 * @param {string} fileName Norimo failo pavadinimas su jo pletiniu
 * @returns {string} Absoliutus kelias iki failo
 */
file.fullPath = (dir: string, fileName: string): string => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '../../.data', dir, fileName);
}
file.fullPublicPath = (trimmedFilePath: string) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '../../public', trimmedFilePath);
}

/**
 * Sukuriamas failas, jei tokio dar nera nurodytoje direktorijoje.
 * @param {string} dir Reliatyvus kelias iki direktorijos kur laikomi norimi failai, pvz.: /data/users
 * @param {string} fileName Norimo failo pavadinimas su jo pletiniu
 * @param {object} content Objektas (pvz.: {...}), kuri norime irasyti i kuriama faila
 * @returns {Promise<[boolean, string | Error]>} Sekmes atveju - `true`; Klaidos atveju - klaidos pranesimas
 */
file.create = async (dir: string, fileName: string, content: any): Promise<[boolean, string | Error]> => {
    let fileDescriptor = null;
    try {
        const filePath = file.fullPath(dir, fileName);
        fileDescriptor = await fs.open(filePath, 'wx');
        await fs.writeFile(fileDescriptor, JSON.stringify(content));
        return [false, 'OK'];
    } catch (error) {
        return [true, error] as [boolean, Error];
    } finally {
        if (fileDescriptor) {
            fileDescriptor.close();
        }
    }
}

/**
 * Perskaitomas failo turinys (tekstinis failas).
 * @param {string} dir Reliatyvus kelias iki direktorijos kur laikomi norimi failai, e.g. `/data/users`
 * @param {string} fileName Norimo failo pavadinimas su jo pletiniu
 * @returns {Promise<[boolean, string | Error]>} Sekmes atveju - failo turinys; Klaidos atveju - klaida
 */
file.read = async (dir: string, fileName: string): Promise<[false, string] | [true, Error]> => {
    try {
        const filePath = file.fullPath(dir, fileName);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return [false, fileContent];
    } catch (error) {
        return [true, error as Error];
    }
}

file.readPublic = async (trimmedFilePath: string): Promise<[boolean, string]> => {
    try {
        const filePath = file.fullPublicPath(trimmedFilePath);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return [false, fileContent];
    } catch (error) {
        return [true, 'Failas nerastas'];
    }
}

file.readPublicBinary = async (trimmedFilePath: string): Promise<[boolean, string | Buffer]> => {
    try {
        const filePath = file.fullPublicPath(trimmedFilePath);
        const fileContent = await fs.readFile(filePath);
        return [false, fileContent] as [boolean, Buffer];
    } catch (error) {
        return [true, 'Failas nerastas'];
    }
}

/**
 * JSON failo turinio atnaujinimas .data folder'yje.
 * @param {string} dir Sub-folder'is esantis .data folder'yje.
 * @param {string} fileName Kuriamo failo pavadinimas be failo pletinio.
 * @param {Object} content JavaScript objektas, pvz.: `{name: "Marsietis"}`.
 * @returns {Promise<[boolean, string | Error]>} Pozymis, ar funkcija sekmingai atnaujintas nurodyta faila.
 */
file.update = async (dir: string, fileName: string, content: any): Promise<[boolean, string | Error]> => {
    let fileDescriptor = null;
    try {
        const filePath = file.fullPath(dir, fileName);
        fileDescriptor = await fs.open(filePath, 'r+');
        await fileDescriptor.truncate();
        await fs.writeFile(fileDescriptor, JSON.stringify(content));
        return [false, 'OK'];
    } catch (error) {
        return [true, error] as [boolean, Error];
    } finally {
        if (fileDescriptor) {
            await fileDescriptor.close();
        }
    }
}

/**
 * JSON failo istrinimas .data folder'yje.
 * @param {string} dir Sub-folder'is esantis .data folder'yje.
 * @param {string} fileName Kuriamo failo pavadinimas be failo pletinio.
 * @returns {Promise<[boolean, string | Error]>} Pozymis, ar funkcija sekmingai istrintas nurodyta faila.
 */
file.delete = async (dir: string, fileName: string): Promise<[boolean, string | Error]> => {
    try {
        const filePath = file.fullPath(dir, fileName);
        await fs.unlink(filePath);
        return [false, 'OK'];
    } catch (error) {
        return [true, error] as [boolean, Error];
    }
}

export { file };