import 'dotenv/config';
import Groq from "groq-sdk";
import express from 'express'
import {tavily }from "@tavily/core";
import readline from 'node:readline/promises'
import cors from 'cors'

const app=express();
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const groq = new Groq( {apiKey:process.env.GROQ_API_KEY});
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });


app.post("/search",async(req,res)=>{
  try{
    const question=req.body.query;
    console.log(question);   

    //  const rl=readline.createInterface({input:process.stdin, output:process.stdout})

 const message= [
        {
            role:"system",
            content:`You are a Smart assistant who provides one to five words  answer on the given provided question
            . The data should be accurate as of present time. If no data found return data not available
            1.searchWeb({query}:{query:String}) // Search latest information and realtime data  on the internet .
            current date and time :${new Date().toUTCString()}
            `
        },
    ]
  
   
      // const question=await rl.question("You : ")

      // if(question=== 'stop'){
      //   break;
      // }
    message.push({
      role:'user',
      content:question
    })
      while(true){
        console.log("1 Request received");

const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages:message,
     "tools": [
    {
      type: "function",
      function: {
        name: "searchWeb",
        description: "Search the web for of for the answer to given provied query",
      parameters: {
          type: "object",
          properties: {
            query:{
              type: "string",
              description: "Search query to perform search on",
            }
          },
          required: ["query"]
        }
      }
    }
  ],
  tool_choice:'auto'
  });
  // console.log("2 Completion received");

  message.push(completion.choices[0].message)
  const toolcall= completion.choices[0].message.tool_calls;

  if(!toolcall){
    console.log(`Asst : ${completion.choices[0].message.content}`);
return res.send({
        status: 200,
        message: "success",
        data: completion.choices[0].message.content
    });  }
  
 for(const tool of toolcall){
    // console.log("tools : ",tool);
    const functionName=tool.function.name;
    const params=tool.function.arguments

    if(functionName=="searchWeb"){
      let toolresult=await searchWeb(JSON.parse(params))
      // console.log("tool res",toolresult);
       message.push({
    role:'tool',
        tool_call_id:tool.id,
    content:toolresult
   })
    return  res.send({status:200,message:"success",data:toolresult})  

    }
 }

}

  }
  catch(err){
    console.log(err);
    
  }
})

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


async function searchWeb({query}) {
  console.log("calling WEBSEARCH.......");
  const response = await tvly.search(query);
 const finalres=response.results.map((result)=>result.content).join('\n\n')
    return finalres;
}


app.listen(8000,()=>{
  console.log("server running");
  
})