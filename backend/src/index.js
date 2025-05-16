require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require('./auth/authRoutes');
const coaches = require('./coaches/coaches');
const lessons = require('./lesson/lessons');
const invoices = require('./invoices/invoices');

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);

app.use('/api/coaches', coaches);

app.use('/api/lessons', lessons);

app.use('/api/invoice', invoices);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
