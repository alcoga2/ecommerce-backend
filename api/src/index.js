require('dotenv').config(); 
const express = require('express'); 
const connectDB = require('./config/db'); 
const productRoutes = require('./routes/productRoutes'); // Importem les rutes
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const app = express(); 
app.use(express.json());
connectDB(); 
app.get('/', (req, res) => res.send('API Ecommerce en marxa ��')); 
app.use('/api/products', productRoutes); // Muntem les rutes de productes sota el prefix '/api/products' 
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use((req, res, next) => {
  const error = new Error('Recurso no encontrado');
  error.statusCode = 404;
  next(error);
});
app.use(errorHandler);
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Servidor escoltant al port ${PORT}`)); 
