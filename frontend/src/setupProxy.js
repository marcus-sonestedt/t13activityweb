const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    /^\/(api|admin|app)/,
    proxy({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};