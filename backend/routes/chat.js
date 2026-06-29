import Router from 'express'
const router=Router();
import {allchats, title} from '../controllers/chat.js'
import { searchllm } from '../controllers/llmServer.js';
import authMiddlware from '../middlewares/authMiddleware.js';

router.post("/search",authMiddlware,searchllm)

router.post("/title",authMiddlware,title)

router.post("/:chatId",authMiddlware,allchats)

export default router;