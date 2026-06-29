import Router from 'express'
const router=Router();
import {title} from '../controllers/chat.js'
import authMiddlware from '../middlewares/authMiddleware.js';

router.post("/title",authMiddlware,title)

export default router;