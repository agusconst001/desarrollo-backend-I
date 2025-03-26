
const express = require('express');
const Cart = require('../models/Cart');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).send('Error al crear el carrito');
  }
});

router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid).populate('products.product');
    if (cart) res.json(cart);
    else res.status(404).send('Carrito no encontrado');
  } catch (error) {
    res.status(500).send('Error al obtener el carrito');
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    const product = cart.products.find(p => p.product.toString() === pid);
    if (product) product.quantity += 1;
    else cart.products.push({ product: pid });
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).send('Error al agregar el producto al carrito');
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    res.status(500).send('Error al eliminar el producto');
  }
});

router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;
  try {
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.json(cart);
  } catch (error) {
    res.status(500).send('Error al actualizar el carrito');
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');
    const product = cart.products.find(p => p.product.toString() === pid);
    if (!product) return res.status(404).send('Producto no encontrado en el carrito');
    product.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).send('Error al actualizar la cantidad');
  }
});

router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findByIdAndUpdate(cid, { products: [] }, { new: true });
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.json({ message: 'Carrito vaciado' });
  } catch (error) {
    res.status(500).send('Error al vaciar el carrito');
  }
});

module.exports = router;

