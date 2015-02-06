'use strict';

var express = require('express');
var controller = require('./repos.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

// router.get('/', auth.hasRole('admin'), controller.index);
// router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/repos', controller.me);
router.get('/all/:id', controller.sync);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', controller.show); // make it a protected resource
router.post('/', controller.create);

module.exports = router;
