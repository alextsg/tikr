'use strict';

var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var http = require('http');
// var request = require('request');
var https = require('https');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.getSkills = function(req, res) {
  console.log("asdfsadf=1-231230")
};


/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  console.log(userId);
  var key = '2f7424c2dcb96b2d19d1';
  var sec = 'd68ca1fb9bf38eefece375ae85c618cbbeb94d92';
// https://api.github.com/users/alextsg?client_id=2f7424c2dcb96b2d19d1&client_secret=d68ca1fb9bf38eefece375ae85c618cbbeb94d92
  var requestObject = {
    host: 'api.github.com',
    path: '/users/' + userId + '?client_id=2f7424c2dcb96b2d19d1&client_secret=d68ca1fb9bf38eefece375ae85c618cbbeb94d92',
    port: 443,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': userId
    }
  };

  // var requestObject = {
  //   host: 'google.com',
  //   path: '/users/alextsg?client_id=2f7424c2dcb96b2d19d1&client_secret=d68ca1fb9bf38eefece375ae85c618cbbeb94d92',
  //   port: 443,
  //   method: 'GET',
  //   headers: {
  //       'Content-Type': 'application/json'
  //   }
  // };

  // http.request(requestObject, function(err, res) {
  //   console.log(err, "ERROR");
  //   console.log(res, "RESPONSE");
  // });
  https.get(requestObject, function(response) {
    var data;
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function(){
      console.log(data)
      res.json({message: data.toString()})
    });
  }).on('error', function(e) {
    console.log("Got error: " + e);
  }).on('data', function(d) {
    console.log(d);
  });

//   http.request(options, [callback])#
// Node maintains several connections per server to make HTTP requests. This function allows one to transparently issue requests.

// options can be an object or a string. If options is a string, it is automatically parsed with url.parse().

// Options:

// host: A domain name or IP address of the server to issue the request to. Defaults to 'localhost'.
// hostname: To support url.parse() hostname is preferred over host
// port: Port of remote server. Defaults to 80.
// localAddress: Local interface to bind for network connections.
// socketPath: Unix Domain Socket (use one of host:port or socketPath)
// method: A string specifying the HTTP request method. Defaults to 'GET'.
// path: Request path. Defaults to '/'. Should include query string if any. E.G. '/index.html?page=12'
// headers: An object containing request headers.
// auth: Basic authentication i.e. 'user:password' to compute an Authorization header.
// agent: Controls Agent behavior. When an Agent is used request will default to Connection: keep-alive. Possible values:
// undefined (default): use global Agent for this host and port.
// Agent object: explicitly use the passed in Agent.
// false: opts out of connection pooling with an Agent, defaults request to Connection: close.
// The optional callback parameter will be added as a one time listener for the 'response' event.

// http.request() returns an instance of the http.ClientRequest class. The ClientRequest instance is a writable stream. If one needs to upload a file with a POST request, then write to the ClientRequest object.

// Example:
//   // User.findById(userId, function (err, user) {
//   //   if (err) return next(err);
//   //   if (!user) return res.send(401);
//   //   res.json(user.profile);
//   // });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
