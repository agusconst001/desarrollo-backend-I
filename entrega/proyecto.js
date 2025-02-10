import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const PORT = 8080;

app.use(express.json()); // Middleware para permitir el uso de JSON en las solicitudes

// Definimos las rutas de los archivos donde se almacenarán los productos y carritos
const productsFile = path.join(__dirname, 'productos.json');
const cartsFile = path.join(__dirname, 'carrito.json');

// Función para leer un archivo JSON de manera asíncrona
const readFile = async (file) => {
    try {
        const data = await fs.readFile(file, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return []; // Si hay un error (ej. el archivo no existe), retorna un array vacío
    }
};

// Función para escribir datos en un archivo JSON
const writeFile = async (file, data) => {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
};

// Función para generar un ID único para los productos y carritos
const generateId = (items) => {
    return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
};

// Definimos el router para productos
const productsRouter = express.Router();

// Ruta GET para obtener todos los productos, con opción de limitarlos
productsRouter.get('/', async (req, res) => {
    const products = await readFile(productsFile);
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});

// Ruta GET para obtener un producto por su ID
productsRouter.get('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const product = products.find(p => p.id == req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

// Ruta POST para agregar un nuevo producto
productsRouter.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails = [] } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }
    const products = await readFile(productsFile);
    const newProduct = {
        id: generateId(products),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails
    };
    products.push(newProduct);
    await writeFile(productsFile, products);
    res.status(201).json(newProduct);
});

// Ruta PUT para actualizar un producto por su ID
productsRouter.put('/:pid', async (req, res) => {
    const products = await readFile(productsFile);
    const index = products.findIndex(p => p.id == req.params.pid);
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    
    const { id, ...updatedFields } = req.body; // Evita modificar el ID del producto
    products[index] = { ...products[index], ...updatedFields };
    await writeFile(productsFile, products);
    res.json(products[index]);
});

// Ruta DELETE para eliminar un producto por su ID
productsRouter.delete('/:pid', async (req, res) => {
    let products = await readFile(productsFile);
    products = products.filter(p => p.id != req.params.pid);
    await writeFile(productsFile, products);
    res.json({ message: 'Producto eliminado' });
});

// Definimos el router para carritos
const cartsRouter = express.Router();

// Ruta POST para crear un nuevo carrito
cartsRouter.post('/', async (req, res) => {
    const carts = await readFile(cartsFile);
    const newCart = { id: generateId(carts), products: [] };
    carts.push(newCart);
    await writeFile(cartsFile, carts);
    res.status(201).json(newCart);
});

// Ruta GET para obtener un carrito por su ID
cartsRouter.get('/:cid', async (req, res) => {
    const carts = await readFile(cartsFile);
    const cart = carts.find(c => c.id == req.params.cid);
    cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

// Ruta POST para agregar un producto a un carrito
cartsRouter.post('/:cid/product/:pid', async (req, res) => {
    const carts = await readFile(cartsFile);
    const products = await readFile(productsFile);
    const cart = carts.find(c => c.id == req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    
    const product = products.find(p => p.id == req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    
    // Verifica si el producto ya está en el carrito
    const productInCart = cart.products.find(p => p.product == req.params.pid);
    if (productInCart) {
        productInCart.quantity++;
    } else {
        cart.products.push({ product: req.params.pid, quantity: 1 });
    }
    
    await writeFile(cartsFile, carts);
    res.json(cart);
});

// Asignamos los routers a las rutas correspondientes
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Iniciamos el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
