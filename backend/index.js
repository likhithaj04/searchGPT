import 'dotenv/config';
import Groq from "groq-sdk";
import express from 'express'
import { tavily } from "@tavily/core";
import readline from 'node:readline/promises'
import cors from 'cors'
import NodeCache from 'node-cache';
// import signupRouter from './routes/signin.js'
import profileRouter from './routes/profile.js'
import authMiddleware from './middlewares/authMiddleware.js';
import prisma from './config/dbConfig.js';
import chatRouter from './routes/chat.js'
const app = express();

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use("/profile",profileRouter)
app.use("/data",chatRouter)

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const myCache = new NodeCache({ stdTTL: 60 * 60 * 24 })
app.post("/search", authMiddleware, async (req, res) => {
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
You are an intelligent AI assistant.

Adapt your response length to the user's question.

- Very short questions → Answer in 1-3 sentences.
- General questions → Give a concise explanation with bullets if needed.
- Technical questions → Explain concepts clearly with examples.
- "Explain", "Teach me", "Compare", or "Guide me" → Provide detailed, structured answers.
- If the user requests depth, don't oversimplify.
- If the user asks for a quick answer, keep it brief.

Formatting:
- Use Markdown.
- Use headings only when beneficial.
- Use bullet points for lists.
- Use numbered steps for procedures.
- Use tables for comparisons.
- Use code blocks for programming.
- Never make the response longer than necessary.

Accuracy:
- Never invent facts.
- If unsure, state the limitation.
- Use the web search tool whenever current or real-time information is needed.

Available Tool:
searchWeb({ query: String })

Use it for:
- Current events
- Latest news
- Live data
- Recent technology updates
- Anything time-sensitive

Current UTC Date:
${new Date().toUTCString()}
`,
  },
];  

    let chatId = threadId;
    if (!chatId) {
      const chat = await prisma.chat.create({
        data: {
          user_id: req.user.id,
          title: question.slice(0, 40),
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
});

// async function main() {
//         const rl=readline.createInterface({input:process.stdin, output:process.stdout})

//  const message= [
//         {
//             role:"system",
//             content:`You are a Smart assistant who provides one to five words  answer on the given provided question
//             . The data should be accurate as of present time. If no data found return data not available
//             1.searchWeb({query}:{query:String}) // Search latest information and realtime data  on the internet .
//             current date and time :${new Date().toUTCString()}
//             `
//         },
//       // {
//       //   role: "user",
//       //   content: "Rupee",
//       // },
//     ]
//     while(true){

//       const question=await rl.question("You : ")

//       if(question=== 'stop'){
//         break
//       }
//     message.push({
//       role:'user',
//       content:question
//     })
//       while(true){
// const completion = await groq.chat.completions.create({
//     model: "openai/gpt-oss-120b",
//     messages:message,
//      "tools": [
//     {
//       type: "function",
//       function: {
//         name: "searchWeb",
//         description: "Search the web for of for the answer to given provied query",
//       parameters: {
//           type: "object",
//           properties: {
//             query:{
//               type: "string",
//               description: "Search query to perform search on",
//             }
//           },
//           required: ["query"]
//         }
//       }
//     }
//   ],
//   tool_choice:'auto'
//   });

//   message.push(completion.choices[0].message)
//   const toolcall= completion.choices[0].message.tool_calls;

//   if(!toolcall){
//     console.log(`Asst : ${completion.choices[0].message.content}`);
//     break;
//   }

//  for(const tool of toolcall){
//     // console.log("tools : ",tool);
//     const functionName=tool.function.name;
//     const params=tool.function.arguments



//     if(functionName=="searchWeb"){
//       let toolresult=await searchWeb(JSON.parse(params))
//       // console.log(toolresult);
//        message.push({
//     role:'tool',
//         tool_call_id:tool.id,
//     content:toolresult
//    })
//     }


//  }
// }
//     }

//   // const completion2 = await groq.chat.completions.create({
//   //   model: "llama-3.3-70b-versatile",
//   //   messages:messsage,
//   //    "tools": [
//   //   {
//   //     type: "function",
//   //     function: {
//   //       name: "searchWeb",
//   //       description: "Get the currency of given countries with comparing to how much of that is to doller",
//   //     parameters: {
//   //         type: "object",
//   //         properties: {
//   //           query:{
//   //             type: "string",
//   //             description: "Search query to perform search on",
//   //           }
//   //         },
//   //         required: ["query"]
//   //       }
//   //     }
//   //   }
//   // ],
//   // tool_choice:'auto'
//   // });
//   // console.log(JSON.stringify(completion2.choices[0].message,null,2));

//   rl.close();
// }
// main().catch(console.error);


// app.use("/user",signupRouter)

// async function db(){
//   const d=await prisma.user.findUnique({
//     where:{
//       id:"4490647a-fe26-4582-9d8c-40894654f6e0"
//     },
//     include:{
//       chats:true
//     }
//   })
//   console.log(d);
  
// }
// db()



async function searchWeb({ query }) {
  console.log("calling WEBSEARCH.......");
  const response = await tvly.search(query);
  const finalres = response.results.map((result) => result.content).join('\n\n')
  return finalres;
}


// app.post("/title",async(req,res)=>{
//    const title= await prisma.
// })

app.listen(8000, () => {
  console.log("server running");

})