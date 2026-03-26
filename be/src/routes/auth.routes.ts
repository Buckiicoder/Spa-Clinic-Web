import { Router } from 'express'
import * as controller from '../controllers/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();

router.post('/register', controller.register)
router.post('/login/customer', controller.customerLogin)
router.post('/login/staff', controller.staffLogin)
// tạm dùng chung logout
router.post('/logout', controller.logout)
router.post('/logout/staff', controller.logout)
router.get('/me', authMiddleware, controller.me)
router.post('/verify-otp', controller.verifyOTP)

//upload ảnh đại diện người dùng
router.post("/upload-avatar",
  authMiddleware,
  upload.single("avatar"),
  controller.uploadAvatar
)

export default router
