const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Error interno del servidor';
  let details = null;

  // Manejo específico para error de clave duplicada en MongoDB (ej. email o slug repetido)
  if (err.code === 11000) {
    statusCode = 409; // Conflicto
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'valor';
    message = 'Ya existe un recurso con ese valor';
    details = [{ field, message: `${field} duplicado` }];
  }

  // Manejo de errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 422; // Unprocessable Content
    code = 'VALIDATION_ERROR';
    message = 'Les dades no són vàlides';
    details = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message
    }));
  }

  // Manejo de errores por ID malformado de MongoDB
  if (err.name === 'CastError') {
    statusCode = 400; // Bad Request
    code = 'BAD_REQUEST';
    message = 'Formato de ID no válido';
  }

  if (err.type === 'entity.parse.failed' || err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    code = 'BAD_REQUEST';
    message = 'El cuerpo JSON no es válido';
  }

  if (err.code === 'BAD_REQUEST' || err.code === 'VALIDATION_ERROR') {
    code = err.code;
    message = err.message;
    details = err.details || null;
  }

  if (statusCode === 404) {
    code = 'NOT_FOUND';
    message = err.message || 'Recurso no encontrado';
  } else if (statusCode === 400 && code === 'INTERNAL_SERVER_ERROR') {
    code = 'BAD_REQUEST';
    message = err.expose ? err.message : 'Solicitud no válida';
  }

  if (statusCode < 400 || statusCode > 599) statusCode = 500;

  // Respuesta centralizada y estructurada del error
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  });
};

module.exports = errorHandler;
