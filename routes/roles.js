var express = require('express');
var router = express.Router();
const roleSchema = require('../schemas/role');
const { check_authentication, check_authorization } = require('../utils/check_auth');

// Lấy danh sách tất cả các role (không yêu cầu quyền và đăng nhập)
router.get('/', async function (req, res, next) {
  try {
    let roles = await roleSchema.find({});
    res.send({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error); // Xử lý lỗi
  }
});

// Tạo role mới (chỉ dành cho admin)
router.post('/', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;

    // Kiểm tra nếu không có name
    if (!body.name) {
      return res.status(400).send({
        success: false,
        message: 'Role name is required',
      });
    }

    // Kiểm tra role đã tồn tại chưa
    const existingRole = await roleSchema.findOne({ name: body.name });
    if (existingRole) {
      return res.status(400).send({
        success: false,
        message: 'Role already exists',
      });
    }

    // Tạo role mới
    let newRole = new roleSchema({
      name: body.name,
    });
    await newRole.save();

    res.status(200).send({
      success: true,
      message: 'Role created successfully',
      data: newRole,
    });
  } catch (error) {
    next(error); // Xử lý lỗi
  }
});

// Cập nhật role (chỉ dành cho admin)
router.put('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let body = req.body;

    // Kiểm tra nếu không có name
    if (!body.name) {
      return res.status(400).send({
        success: false,
        message: 'Role name is required',
      });
    }

    // Cập nhật role
    let updatedRole = await roleSchema.findByIdAndUpdate(req.params.id, { name: body.name }, { new: true });
    if (!updatedRole) {
      return res.status(404).send({
        success: false,
        message: 'Role not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error) {
    next(error); // Xử lý lỗi
  }
});

// Xóa role (chỉ dành cho admin)
router.delete('/:id', check_authentication, check_authorization(['admin']), async function (req, res, next) {
  try {
    let deletedRole = await roleSchema.findByIdAndDelete(req.params.id);
    if (!deletedRole) {
      return res.status(404).send({
        success: false,
        message: 'Role not found',
      });
    }

    res.status(200).send({
      success: true,
      message: 'Role deleted successfully',
      data: deletedRole,
    });
  } catch (error) {
    next(error); // Xử lý lỗi
  }
});

module.exports = router;
