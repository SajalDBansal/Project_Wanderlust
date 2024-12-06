// A wrapper function to throw error in the routes
function wrapAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
}

module.exports = wrapAsync;
