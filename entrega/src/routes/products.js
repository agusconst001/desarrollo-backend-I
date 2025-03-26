const express = require('express');
const Product = require('../models/Product');
const io = require('../../server').io;
const router = express.Router();

const getPaginationLink = (limit, page, sort, query, direction) => {
  return `/api/products?limit=${limit}&page=${page + direction}&sort=${sort || ''}&query=${query || ''}`;
};

router.get('/', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;
  try {
    let filters = {};
    if (query) {
      if (query === 'true' || query === 'false') {
        filters.status = query === 'true';
      } else {
        filters.category = query;
      }
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
    };

    const result = await Product.paginate(filters, options);

    const response = {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.hasPrevPage ? result.page - 1 : null,
      nextPage: result.hasNextPage ? result.page + 1 : null,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? getPaginationLink(limit, result.page, sort, query, -1) : null,
      nextLink: result.hasNextPage ? getPaginationLink(limit, result.page, sort, query, 1) : null,
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});

router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  try {
    const product = await Product.findById(pid);
    if (product) {
      res.json(product);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (error) {
    res.status(500).send('Error al obtener el producto');
  }
});

router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;
  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  try {
    const newProduct = new Product ({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails });
    await newProduct.save();
    io.emit('productAdded', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al agregar el producto:', error);
    res.status(500).send('Error al agregar el producto');
  }
});

router.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const updates = req.body;
  try {
    const product = await Product.findByIdAndUpdate(pid, updates, { new: true });
    if (product) res.json(product);
    else res.status(404).send('Producto no encontrado');
  } catch (error) {
    res.status(500).send('Error al actualizar el producto');
  }
});

router.delete('/:pid', async (req, res) => {
  const { pid } = req.params;

  try {
    await Product.findByIdAndDelete(pid);
    io.emit('productRemoved', pid);
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Error al eliminar el producto');
  }
});

module.exports = router;

