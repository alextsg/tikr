'use strict';

var User = require('./user.model');
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
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.repos = [{'repoName':'repo1', 'repoUrl':'Url1'},{'repoName':'repo2', 'repoUrl':'Url2'}];
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

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    console.log("LOGGING USER JSON", user);
    res.json(user.profile);
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
 * Query for users by skills
 */
exports.search = function(req, res, next) {
  // return users who have all of the specified skills
  if(req.body.hasAllSkills){
    User.find({'skills': { $all: req.body.skills}}, '-salt -hashedPassword', 
     function(err, users) {
      if (err) return next(err);
      if (!users) return res.json(401);
      res.json(users);
    });
  } else { // return users who have at least one of the skills
    User.find({'skills': { $in: req.body.skills }}, '-salt -hashedPassword', 
     function(err, users) {
      if (err) return next(err);
      if (!users) return res.json(401);
      res.json(users);
    });
  }
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

function findAndCreate(req, res, next) {
  var userId = req.params.githubUsername;
  console.log(userId, "findAndCreate");
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
  // user = new User({
  //         name: profile.displayName,
  //         username: profile.username,
  //         role: 'user',
  //         provider: 'github',
  //         github: profile._json
  //       });
  https.get(requestObject, function(response) {
    var data = '';
    response.on('data', function (chunk) {
      data += chunk;
    })
    .on('end', function(){
      data = JSON.parse(JSON.parse(JSON.stringify(data.toString())));
      console.log(typeof data, data.displayName);
      var user = new User({
        name: data.name,
        username: data.login,
        role: 'user',
        provider: 'github',
        github: data
      });
      user.save(function(err) {
        if (err) return done(err);
        user.getSkills(null, res);
      });
      // console.log(JSON.stringify(data.toString()));
      // res.json({message: data.toString()})
    })
    .on('error', function(e) {
      console.log("Got error: " + e);
    })
  });
};

exports.getUserProfile = function(req, res, next){

  User.findOne({'github.login': req.params.githubUsername},
    '-salt -hashedPassword',
    function(err, user){
      if (err){
        return next(err);
      }
      if (!user){
        findAndCreate(req, res, next);
      }
      //console.log("THISIS THE USER DATA ON THE SERVER", user);
      else if(user) {
        res.json(user);
      }
  });
};

exports.postNewSkill = function(req, res, next){
  //TODO verify that user authorized to add a skill on server side
  User.findOneAndUpdate(
    {'github.login': req.params.githubUsername},
    {$push: {skills: req.body}},
    {safe: true},
    function(err, user){ //user is the full updated user document (a js object)
      if (err) {
        res.send(500);
      } else {
        res.json(user);
      }
    }
  );
};

exports.postNewRepo = function(req, res, next){
  //TODO verify that user authorized to add a repo on server side
  User.findOneAndUpdate(
    {'github.login': req.params.githubUsername},
    {$push: {repos: req.body}},
    {safe: true},
    function(err, user){ //user is the full updated user document (a js object)
      if (err) {
        res.send(500);
      } else {
        res.json(user);
      }
    }
  );
};