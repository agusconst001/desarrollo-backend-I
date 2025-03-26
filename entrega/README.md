# Backend Application

Una aplicación de comercio electrónico con API REST, vistas dinámicas y actualizaciones en tiempo real.

## Instalación
1. Clona el repositorio.
2. Instala dependencias: `npm install`.
3. Inicia el servidor: `npm start`.

## Endpoints
- `GET /api/products`: Lista de productos.
- `POST /api/carts`: Crear un carrito.
- `GET /`: Vista estática de productos.
- `GET /live`: Vista en tiempo real.

## Notas
- No se incluye la carpeta `node_modules` en el repositorio (ver .gitignore), pero se puede regenerar con `npm install`.
- Usa `package-lock.json` para garantizar versiones exactas de dependencias.