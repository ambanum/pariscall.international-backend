function tokenValidation(req, res, next) {
  const encodedData = req.query.token;
  if (!encodedData) {
    return res.sendStatus(403);
  }

  next();
}

module.exports = {
  tokenValidation,
};
