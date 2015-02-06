'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/:id/repos', controller.showRepos);
router.get('/:id', controller.showUser);
router.post('/:id/:data', controller.updateUser);

module.exports = router;

// {repos: [{repoName: "asdfasdf", repoURL: 'asdf'}]}