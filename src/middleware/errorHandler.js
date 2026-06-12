function errorHandler(err, req, res, next) {
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ errors: err.errors.map((e) => e.message) });
  }

  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
