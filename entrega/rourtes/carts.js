import express from 'express';
import { readFile, writeFile } from '../utils/fileManager.js';
import { generateId } from '../utils/generateId.js';
import path from 'path';

const router = express.Router();
const cartsFile = path.join('data', 'carrito.json');
const productsFile = path.join('data', 'productos.json');

// Crear un carrito
router.post('/', async (req, res) => {
    const carts = await readFile(cartsFile);
    const newCart = { id: generateId(carts), products: [] };
    carts.push(newCart);
    await writeFile(cartsFile, carts);
    res.status(201).json(newCart);
});

// Obtener un carrito por ID
router.get('/:cid', async (req, res) => {
    const carts = await readFile(cartsFile);
    const cart = carts.find(c => c.id == req.params.cid);
    cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

// Agregar producto a un carrito
router.post('/:cid/product/:pid', async (req, res) => {
    const carts = await readFile(cartsFile);
    const products = await readFile(productsFile);
    const cart = carts.find(c => c.id == req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const product = products.find(p => p.id == req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    // Verificar si el producto ya está en el carrito
    const productInCart = cart.products.find(p => p.product == req.params.pid);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }

    await writeFile(cartsFile, carts);
    res.json(cart);
});

export default router;
