export function notFound(req, res) {
  res.status(404).json({ error: `Route non trouvée : ${req.originalUrl}` });
}

export function errorHandler(err, req, res, _next) {
  console.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Erreur interne du serveur.",
  });
}
