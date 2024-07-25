require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandlers');
const printerRoutes = require('./routes/printerRoutes');
const cartRoutes = require('./routes/cartRoutes');
const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes');

const app = express();
const port = process.env.PORT || 3000;
// testing
// const corsOptions ={
//   origin : '*', 
//   methods: ['GET','POST'],
//   allowedHeaders:'*'
// }

// Connect to MongoDB
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/printers', printerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
