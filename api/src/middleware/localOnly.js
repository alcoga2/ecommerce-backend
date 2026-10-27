const localOnly = (req, res, next) => {
  const address = req.socket.remoteAddress;
  const isLoopback = address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
  if (process.env.NODE_ENV === 'production' || !isLoopback) {
    return res.status(403).json({
      status: 'error',
      message: 'Este endpoint solo está disponible en un entorno local de desarrollo',
    });
  }
  next();
};

module.exports = localOnly;
