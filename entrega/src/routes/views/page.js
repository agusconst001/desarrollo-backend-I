const express = require('express');
const Cart = require('../../models/Cart');
const Product = require('../../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
    const filters = query ? { category: query } : {};
    const options = { limit: parseInt(limit), page: parseInt(page), sort: sort ? { price: sort } : {} };
    const result = await Product.paginate(filters, options);
    res.render('shop', {
        products: result.docs,
        totalPages: result.totalPages,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? `/?limit=${limit}&page=${result.page - 1}&sort=${sort || ''}&query=${query || ''}` : null,
        nextLink: result.hasNextPage ? `/?limit=${limit}&page=${result.page + 1}&sort=${sort || ''}&query=${query || ''}` : null,
    });
});

router.get('/live', async (req, res) => {
    const products = await Product.find();
    res.render('liveProducts', { products });
});

router.get('/carts/:cid', async (req, res) => {
    const cart = await Cart.findById(req.params.cid).populate('products.product');
    res.render('cart', { products: cart.products, cartId: req.params.cid });
});

router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).render('error', { message: 'Producto no encontrado' });
        res.render('product', { product });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Error al obtener el producto' });
    }
});

module.exports = router;