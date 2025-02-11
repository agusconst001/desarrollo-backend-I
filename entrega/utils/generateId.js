// Generar un ID único basado en los elementos existentes
export const generateId = (items) => {
    return items.length ? Math.max(...items.map(item => item.id)) + 1 : 1;
};
