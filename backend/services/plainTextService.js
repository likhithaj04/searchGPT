import { llmService } from './llmServer.js';


export async function plainTextService(req,res){
    const {question,threadId}=req.body;

    return llmService({
        req,
        res,
        question,
        threadId,
        context:null,

        fileData:null
    });
}