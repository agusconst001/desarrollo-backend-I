const express = require('express');
const { Server } = require('socket.io');
const handlebars = require('express-handlebars');
const path = require('path');
const connectDB = require('./config/db');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./src/routes/views/pages');
const Product = require('./models/Product');

const app = express();
const PORT = 8080;

connectDB();

const server = app.listen(PORT, () => {
  console.log(`Servidor de e-commerce escuchando en el puerto ${PORT}`);
});
const io = new Server(server);

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
  console.log('Cliente conectado');
  socket.on('addProduct', async (product) => {
    const newProduct = new Product({ ...product });
    await newProduct.save();
    io.emit('productAdded', newProduct);
  });
  socket.on('deleteProduct', async (id) => {
    await Product.findByIdAndDelete(id);
    io.emit('productRemoved', id);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

module.exports = { io };


