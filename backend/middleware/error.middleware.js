function errorMiddleware(
  err,
  _req,
  res,
  _next,
) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });

  // In dev you may want to log the full error
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

module.exports = { errorMiddleware };

