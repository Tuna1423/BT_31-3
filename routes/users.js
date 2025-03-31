var express = require('express');
var router = express.Router();
var userControllers = require('../controllers/users');
let { check_authentication, check_authorization } = require("../utils/check_auth");
const constants = require('../utils/constants');

/* GET all users (mod only) */
router.get('/', check_authentication, check_authorization(['mod']), async function (req, res, next) {
  try {
    let users = await userControllers.getAllUsers();
    res.send({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
});

/* GET user by ID (mod only, except self) */
router.get('/:id', check_authentication, check_authorization(['mod']), async function (req, res, next) {
  try {
    if (req.user._id === req.params.id) {
      return res.status(403).send({
        success: false,
        message: "You cannot access your own information here."
      });
    }
    let user = await userControllers.getUserById(req.params.id);
    res.send({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

/* POST create a new user (admin only) */
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userControllers.createAnUser(
      body.username,
      body.password,
      body.email,
      body.role
    );
    res.status(200).send({
      success: true,
      message: newUser
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: error.message
    });
  }
});

/* PUT update a user (admin only) */
router.put('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;
    let updatedUser = await userControllers.updateAnUser(req.params.id, body);
    res.status(200).send({
      success: true,
      message: updatedUser
    });
  } catch (error) {
    next(error);
  }
});

/* DELETE a user (admin only) */
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let deleteUser = await userControllers.deleteAnUser(req.params.id);
    res.status(200).send({
      success: true,
      message: deleteUser
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
