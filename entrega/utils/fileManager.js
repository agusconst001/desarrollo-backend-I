import fs from 'fs/promises';

// Leer un archivo JSON
export const readFile = async (file) => {
    try {
        const data = await fs.readFile(file, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

// Escribir en un archivo JSON
export const writeFile = async (file, data) => {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
};
