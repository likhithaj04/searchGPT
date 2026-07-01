import 'dotenv/config';
import Groq from "groq-sdk";
import express from 'express'
import { tavily } from "@tavily/core";
import readline from 'node:readline/promises'
import cors from 'cors'
import NodeCache from 'node-cache';
import prisma from '../config/dbConfig.js';
import { PDFParse } from 'pdf-parse';
import { readFile } from 'node:fs/promises';
import { upload } from '../middlewares/upload.js';
import { uploadToCloudinary} from '../uploads/UploadCloudinary.js';


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 })

export const searchllm=async (req, res) => {
  try {
    const { question }= req.body
    const {threadId}=req.body
// console.log("reached here");
// console.log("body",req.body);
// console.log("thread",req.body.threadId);
// console.log(typeof req.body.threadId);


    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

const parser = new PDFParse({
  data: req.file.buffer,
});
 let text=''
 let uploadResult = null;

    if(req.file){
      try{
        console.log(req.file);
                const result = await parser.getText();
                text=result.text || ""
                 uploadResult = await uploadToCloudinary(req.file);
                console.log("upload............",uploadResult);
                
      }
     catch(err){
      console.log(err);
      
     }
    }

const baseMessages = [
  {
    role: "system",
    content: `
You are a highly intelligent AI assistant.

Your primary goal is to provide accurate, readable, and helpful answers.

## Response Style

- Match the user's level of detail.
- Keep simple questions short.
- Expand only when explanation genuinely improves understanding.
- Never add unnecessary filler or repetition.
- Be direct and precise.

## Formatting Rules

- Always use clean Markdown.
- Use headings only when they improve readability.
- Use bullet points for lists.
- Use numbered steps for instructions.
- Use tables only when comparing multiple items.
- Use fenced code blocks with language names for programming.
- Never use decorative separators like:
  - ---
  - ***
  - ___
  - =====
- Never use emojis unless the user explicitly requests them.
- Avoid excessive bold text.
- Avoid excessive italics.
- Do not repeat the question.
- Keep spacing clean and natural.

## Links

- Whenever referring to a website, official documentation, GitHub repository, research paper, API, company website, or online resource:
  - Return the complete clickable HTTPS URL.
  - Prefer official sources.
  - Do not shorten URLs.
  - Example:
    https://react.dev
    https://expressjs.com
    https://supabase.com/docs

## Programming

For coding questions:

- Explain the idea first.
- Then provide the code.
- Ensure code is complete and runnable.
- Follow modern best practices.
- Mention common mistakes if relevant.
- Avoid deprecated APIs.

## Accuracy

- Never invent facts.
- If uncertain, clearly say so.
- Distinguish between facts and assumptions.
- If the answer depends on versions, mention the version.

## Document Context

If a document or extracted text is provided, treat it as the primary source of truth for answering the user's questions.

Guidelines:
- Carefully read and understand the document before answering.
- Base your responses only on the document unless the user explicitly asks for external information.
- If the answer cannot be found in the document, clearly state that it is not present instead of making assumptions.
- Adapt your analysis to the type of document:
  - Resume/CV → Review skills, experience, formatting, ATS compatibility, grammar, missing sections, and provide actionable improvement suggestions.
  - Research paper → Summarize, explain concepts, methodology, findings, strengths, limitations, and answer questions about the content.
  - Report → Summarize key insights, identify trends, important figures, conclusions, and recommendations.
  - Documentation/Manual → Explain features, usage, workflows, APIs, and troubleshoot issues using the document.
  - Contracts/Legal documents → Explain clauses in simple language, highlight obligations, risks, dates, and important terms. Do not provide legal advice.
  - Books, notes, or study material → Summarize chapters, explain concepts, create quizzes, answer questions, and simplify difficult topics.
  - Any other document → Infer its purpose and provide the most relevant analysis based on the user's request.

Always prioritize the user's current question. Do not summarize the entire document unless the user explicitly asks for a summary.

If the user asks to compare the document with external knowledge (e.g., latest technologies, job requirements, current standards), use the available web search tool when appropriate and clearly distinguish information from the document and information from external sources.
## Web Search

Use the searchWeb tool whenever information could be:
- recent
- live
- changing over time
- version-specific
- related to news
- market prices
- current APIs
- current documentation
- current company information

Never guess when fresh information is required.

## Tool

searchWeb({ query: String })

## Current UTC Time

${new Date().toUTCString()}

`,
  },
];


    let chatId = threadId;
    if (!chatId) {
      const chat = await prisma.chat.create({
        data: {
          user_id: req.user.id,
          title: question.slice(0, 20),
        },
      });

      chatId = chat.id;
      console.log(chatId);
      
    }


    const previousMessages = await prisma.message.findMany({
      where: {
        chat_id: chatId,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    const messages = [
      ...baseMessages,
      ...previousMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];


    await prisma.message.create({
      data: {
        chat_id: chatId,
        role: "user",
        content: question,
         file_url: uploadResult?.secure_url || null,
    file_name: req.file?.originalname || null,
    file_type: req.file?.mimetype || null,
    public_id: uploadResult?.public_id || null
      },
    });

   if (text) {
  messages.push({
    role: "user",
    content: `
Question:
${question}

Uploaded document:

${text}
`
  });
} else {
  messages.push({
    role: "user",
    content: question
  });
}
    
    // console.log("Messages",messages);
    

    const MAX_RETRIES = 10;
    let count = 0;

    while (true) {
      if (count >= MAX_RETRIES) {
        return res.status(500).json({
          success: false,
          message: "Could not generate response",
        });
      }

      count++;

      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "searchWeb",
              description:
                "Search latest information on the internet",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "Search query",
                  },
                },
                required: ["query"],
              },
            },
          },
        ],
        tool_choice: "auto",
      });

      const assistantMessage = completion.choices[0].message;

      messages.push(assistantMessage);

      const toolCalls = assistantMessage.tool_calls;


      if (!toolCalls || toolCalls.length === 0) {
        const aiResponse = assistantMessage.content;
// console.log("ai........",aiResponse);

        await prisma.message.create({
          data: {
            chat_id: chatId,
            role: "assistant",
            content: aiResponse,
          },
        });
// console.log("ChatId.........", chatId, aiResponse);

        return res.json({
          success: true,
          chatId,
          data: aiResponse,
        });
      }

      for (const tool of toolCalls) {
        const functionName = tool.function.name;
        const args = JSON.parse(tool.function.arguments);

        let toolResult = "";

        if (functionName === "searchWeb") {
          toolResult = await searchWeb(args);
        }

        messages.push({
          role: "tool",
          tool_call_id: tool.id,
          content:
            typeof toolResult === "string"
              ? toolResult
              : JSON.stringify(toolResult),
        });
      }

    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

async function searchWeb({ query }) {
  console.log("calling WEBSEARCH.......");
  const response = await tvly.search(query);
  const finalres = response.results.map((result) => result.content).join('\n\n')
  return finalres;
}

