'use strict';

var User = require('../user/user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
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
    path: '/users/' + userId + '/repos' + '?client_id=2f7424c2dcb96b2d19d1&client_secret=d68ca1fb9bf38eefece375ae85c618cbbeb94d92',
    port: 443,
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': userId
    }
  };
  // console.log(re);
  https.get(requestObject, function(response) {
    var data;
    response.on('data', function (chunk) {
      data += chunk;
    });
    response.on('end', function(){
      console.log(data.toString(), "DATA")
      res.json({message: data.toString()})
    });
  }).on('error', function(e) {
    console.log("Got error: " + e);
  }).on('data', function(d) {
    console.log(d);
  });
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
