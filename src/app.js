const express = require('express');
const path = require('path');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

module.exports = app;
