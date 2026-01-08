// Optimistic concurrency guard (Express)
module.exports = function occ(required = true) {
  return function(req, res, next) {
    const ifMatch = req.header('If-Match');
    if (required && (ifMatch === undefined || isNaN(Number(ifMatch)))) {
      return res.status(400).json({ error: 'missing_if_match' });
    }
    req.expectedVersion = Number(ifMatch);
    next();
  };
};
