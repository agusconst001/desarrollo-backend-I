import express from 'express';
import { readFile, writeFile } from '../utils/fileManager.js';
import { generateId } from '../utils/generateId.js';
import path from 'path';

const router = express.Router();
const productsFile = path.join('data', 'productos.json');

// Obtener todos los productos
router.get('/', async (req, res) => {
    const products = await readFile(productsFile);
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});

// Obtener producto por ID
router.get('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const product = products.find(p => p.id == req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

// Agregar nuevo producto
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }
    const products = await readFile(productsFile);
    const newProduct = { id: generateId(products), title, description, code, price, status: true, stock, category, thumbnails };
    products.push(newProduct);
    await writeFile(productsFile, products);
    res.status(201).json(newProduct);
});

// Actualizar un producto
router.put('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const { id, ...updatedFields } = req.body;
    products[index] = { ...products[index], ...updatedFields };
    await writeFile(productsFile, products);
    res.json(products[index]);
});

// Eliminar un producto
router.delete('/:pid', async (req, res) => {
    let products = await readFile(productsFile);
    products = products.filter(p => p.id != req.params.pid);
    await writeFile(productsFile, products);
    res.json({ message: 'Producto eliminado' });
});

export default router;
