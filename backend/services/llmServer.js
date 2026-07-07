import 'dotenv/config';
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import prisma from '../config/dbConfig.js';
import { executeTool } from './toolServices.js';


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 })

export async function llmService({
  req,
  res,
  question,
  threadId = null,
  context = null,
  fileData = null,
}) {
  try {
    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
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

## Links

Whenever referring to any website, documentation, GitHub repository, company, research paper, or API, always provide the complete HTTPS URL.

Example:

https://react.dev
https://expressjs.com
https://supabase.com/docs

## Programming

For programming questions:

- Explain the concept first.
- Then provide complete runnable code.
- Follow modern best practices.
- Mention common mistakes if relevant.
- Avoid deprecated APIs.

## Accuracy

- Never invent facts.
- If unsure, clearly say so.
- Distinguish assumptions from facts.
- Mention versions when relevant.

## Document Context

If document context is provided later in the conversation:

- Treat it as the primary source.
- Base answers on the document.
- Do not invent information missing from it.
- Adapt your analysis depending on whether it is:
  - Resume
  - Research Paper
  - Documentation
  - Report
  - Notes
  - Book
  - Legal document
  - Manual
  - Any uploaded document

If no document context exists, answer normally.

## Web Search

Use the searchWeb tool whenever information is:

- Recent
- Live
- Version-specific
- News related
- Current APIs
- Current documentation

Never guess when fresh information is needed.

## Tool

searchWeb({
    query:String
})

Current UTC Time

${new Date().toUTCString()}
`,
      },
    ];
console.log("fileDataReached1");

    let chatId = threadId;
    
    if (!chatId) {
      const chat = await prisma.chat.create({
        data: {
          user_id: req.user.id,
          title: question.slice(0, 20),
        },
      });

      chatId = chat.id;
      
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

    file_name: fileData?.name || null,
    file_url: fileData?.url || null,
    file_type: fileData?.type || null,
    public_id: fileData?.public_id || null,
  },
});

console.log("filedata reached2");

 if(context && fileData){
      
       await prisma.doccument.create({
        data:{
          chat_id: chatId,
         filename: fileData.name,
         fileurl: fileData.url,
         extracted: context,
        }
      })
    }

  messages.push({
  role: "user",
  content: context
    ? `
Question:
${question}

Uploaded document:

${context}
`
    : question,
});
   
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

        const toolResult = await executeTool(functionName, args);

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

