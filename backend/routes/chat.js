import Router from 'express'
const router=Router();
import {allchats, title} from '../controllers/chat.js'
// import { searchllm } from '../services/llmServer.js';
import { chat } from '../controllers/chat.js';
import authMiddlware from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/upload.js';
// import multer from 'multer';

// const upload = multer({
//   storage: multer.memoryStorage(),
// });

router.post("/search",  upload.single("file"),authMiddlware,chat)

router.post("/title",authMiddlware,title)

router.post("/:chatId",authMiddlware,allchats)

export default router;