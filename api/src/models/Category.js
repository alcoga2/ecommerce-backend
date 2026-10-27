const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'El slug es obligatorio'],
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [500, 'La descripción no puede superar los 500 caracteres']
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
