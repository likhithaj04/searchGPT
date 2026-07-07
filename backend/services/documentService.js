import { PDFParse } from 'pdf-parse';
import { readFile } from 'node:fs/promises';
import { upload } from '../middlewares/upload.js';
import { uploadToCloudinary} from '../uploads/UploadCloudinary.js';
import { llmService } from './llmServer.js';

export async function documentServices(req,res) {

    const { question,threadId }= req.body
    console.log("fileeee",req.file)
    
    let extracted='';
    const parser = new PDFParse({
  data: req.file.buffer,
})
 const result = await parser.getText();
 extracted=result.text || ' '
 let uploadResult = await uploadToCloudinary(req.file);
console.log("cl",uploadResult);

  const fileData={

        name:req.file.originalname,

        url:uploadResult.secure_url,

        type:req.file.mimetype,

        public_id:uploadResult.public_id
    };
console.log("formData",FormData);

    return llmService({

        req,

        res,

        question,

        threadId,

        context:`
Uploaded document:

${extracted}
`,

        fileData

    });
}