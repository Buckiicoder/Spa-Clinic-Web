import { Router } from 'express'
import * as controller from '../controllers/auth.controller.js'
import { authCustomerMiddleware, authStaffMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

// KHÁCH HÀNG
router.post('/customer/register', controller.customerRegister)
router.post('/customer/login', controller.customerLogin)
router.post('/customer/logout', controller.customerLogout)
router.get('/customer/me', authCustomerMiddleware, controller.meCustomer)
router.post('/verify-otp', controller.verifyOTP)

// tạm dùng chung logout

router.post('/staff/login', controller.staffLogin)
router.post('/staff/logout', controller.staffLogout)
router.get('/staff/me', authStaffMiddleware, controller.meStaff)

//upload ảnh đại diện người dùng
router.post("/customer/upload-avatar",
  authCustomerMiddleware,
  upload.single("avatar"),
  controller.uploadAvatar
)

router.post("/staff/upload-avatar",
  authStaffMiddleware,
  upload.single("avatar"),
  controller.uploadAvatar
)



export default router
