const mongoose = require('mongoose');

// Definimos la estructura que tendrán los productos en nuestra tienda online
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // El nombre del producto es obligatorio
      required: [true, 'El nom del producte és obligatori'],
      trim: true,
      // Para evitar títulos excesivamente largos, limitamos a 100 caracteres
      maxlength: [100, 'El nom no pot superar els 100 caràcters'],
    },
    description: {
      type: String,
      // Obligamos a añadir una descripción del producto
      required: [true, 'La descripció és obligatòria'],
    },
    price: {
      type: Number,
      // El precio es obligatorio
      required: [true, 'El preu és obligatori'],
      // El precio no puede ser un número negativo
      min: [0, 'El preu no pot ser negatiu'],
      //Ponemos un tope para el precio
      max: [1000000, 'El preu no pot superar els 1.000.000€'],
      // Comprobación personalizada para evitar precios con más de 2 decimales (centavos)
      validate: {
        // validator: function (v) {
        //   // Multiplicamos por 100 y comprobamos si da un número entero sin decimales sobrantes
        //   return Number.isInteger(v * 100);

          
        // },
          validator: function (v) {
          return Number(v.toFixed(2)) === v;
          },
        message: (props) => `${props.value} no és un preu vàlid (màxim 2 decimals)`,
      },
    },
    // category: {
    //   type: String,
    //   // Es obligatorio asignar una categoría al producto
    //   required: [true, 'La categoria és obligatòria'],
    //   // Solo permitimos categorías que estén en esta lista
    //   enum: ['figurita', 'ropa', 'cuadro', 'dvd', 'otro'],
    // },

    // Dentro de la definición de tu Schema de Product:
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false
    },
    
    stock: {
      type: Number,
      required: true,
      // Si no especificamos stock al crear el producto, se establece automáticamente en 0
      default: 0,
      // No se puede tener un número de unidades en stock negativo
      min: [0, 'El stock no pot ser negatiu'],
    },
  },
  {
    // Registra automáticamente cuándo se creó y modificó el producto por última vez
    timestamps: true,
  }
);

// Permite hacer búsquedas rápidas por palabras clave en el nombre y la descripción
productSchema.index({ name: 'text', description: 'text' });

// Optimiza el rendimiento al filtrar por categoría y ordenar por precio al mismo tiempo
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
