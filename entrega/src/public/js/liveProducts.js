const socket = io();

document.getElementById('add-product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const product = { title: form.title.value, price: form.price.value };
    socket.emit('addProduct', product);
    form.reset();
});

function removeProduct(id) {
    socket.emit('deleteProduct', id);
}

socket.on('productAdded', (product) => {
    const list = document.getElementById('products-live');
    list.innerHTML += `<li data-id="${product._id}">${product.title} - $${product.price} <button onclick="removeProduct('${product._id}')">Borrar</button></li>`;
});

socket.on('productRemoved', (id) => {
    document.querySelector(`li[data-id="${id}"]`).remove();
});