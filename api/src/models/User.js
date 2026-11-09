const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Definimos la estructura de la información que guardaremos para cada usuario
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // Hacemos que el nombre sea obligatorio
      required: [true, 'El nom és obligatori'],
      // Limpia espacios en blanco vacíos al principio y al final
      trim: true,
      // Exigimos que tenga como mínimo 2 letras
      minlength: [2, 'El nom ha de tenir almenys 2 caràcters'],
    },
    email: {
      type: String,
      // Es obligatorio proporcionar un correo
      required: [true, 'L\'email és obligatori'],
      // Evita que se registren dos usuarios con el mismo correo
      unique: true,
      // Convierte el email a minúsculas automáticamente antes de guardarlo
      lowercase: true,
      trim: true,
      // Comprueba que el formato del texto siga la estructura normal de un email (usuario@dominio.com)
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Introdueix un email vàlid'],
    },
    // password: {
    //   type: String,
    //   // La contraseña es obligatoria
    //   required: [true, 'La contrasenya és obligatòria'],
    //   // Obligamos a que la contraseña tenga al menos 6 caracteres por seguridad
    //   minlength: [6, 'La contrasenya ha de tenir almenys 6 caràcters'],
    // },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      // Solo se permite uno de estos dos valores exactos: 'user' o 'admin'
      enum: ['client', 'admin'],
      // Si no se especifica ningún rol al crear el usuario, por defecto será 'user'
      default: 'client',
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    // Añade automáticamente dos campos a la base de datos: 'createdAt' (fecha de creación) y 'updatedAt' (última actualización)
    timestamps: true,
  }
);

// Abans de desar, xifra la contrasenya només si ha canviat.
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Ocultar passwordHash en las respuestas JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  return user;
};

module.exports = mongoose.model('User', userSchema);
