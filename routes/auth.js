var express = require('express');
var router = express.Router();
let userControllers = require('../controllers/users');
let { check_authentication } = require("../utils/check_auth");
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

// Đăng nhập (không yêu cầu đăng nhập)
router.post('/login', async function (req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let result = await userControllers.checkLogin(username, password);
        res.status(200).send({
            success: true,
            data: jwt.sign({
                id: result,
                expireIn: (new Date(Date.now() + 3600 * 1000)).getTime()
            }, constants.SECRET_KEY)
        });
    } catch (error) {
        next(error);
    }
});

// Đăng ký (không yêu cầu đăng nhập)
router.post('/signup', async function (req, res, next) {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let email = req.body.email;
        let result = await userControllers.createAnUser(username, password, email, 'user');
        res.status(200).send({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Lấy thông tin người dùng hiện tại (yêu cầu đăng nhập)
router.get('/me', check_authentication, async function (req, res, next) {
    try {
        res.send({
            success: true,
            data: req.user
        });
    } catch (error) {
        next(error);
    }
});

// Đổi mật khẩu (yêu cầu đăng nhập)
router.post('/changepassword', check_authentication, async function (req, res, next) {
    try {
        let userId = req.user._id;
        let { oldPassword, newPassword } = req.body;

        // Kiểm tra mật khẩu cũ
        let user = await userControllers.getUserById(userId);
        if (!user || !userControllers.checkPassword(user, oldPassword)) {
            return res.status(400).send({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        // Cập nhật mật khẩu mới
        user.password = userControllers.hashPassword(newPassword);
        await user.save();

        res.status(200).send({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;