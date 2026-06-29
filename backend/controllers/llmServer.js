import 'dotenv/config';
import Groq from "groq-sdk";
import express from 'express'
import { tavily } from "@tavily/core";
import readline from 'node:readline/promises'
import cors from 'cors'
import NodeCache from 'node-cache';
import prisma from '../config/dbConfig.js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 })

export const searchllm=async (req, res) => {
  try {
    const { question, threadId } = req.body;
// console.log("frontend......",threadId);

    if (!question) {
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
      // console.log(chatId);
      
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
      },
    });

    messages.push({
      role: "user",
      content: question,
    });

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

      // Loop continues automatically.
      // Model now sees tool output and generates final answer.
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

