/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/profiles', require('./api/user'));
  app.use('/pub', require('./api/pub'));
  app.use('/auth', require('./auth'));
  app.use('/repos', require('./api/repos'));
  app.use('/sync', require('./api/repos'));
  app.use('/devs/:username', function(req, res) {
    // res
    console.log('First Log ------- -');
    res.sendfile(app.get('appPath') + '/index.html');
  });
  // // All undefined asset or api routes should return a 404
  // app.route('/:url(api|auth|components|app|bower_components|assets)/*')
  //  .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      console.log('------');
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
