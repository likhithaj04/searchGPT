import 'dotenv/config';
import express from 'express'
import cors from 'cors'
import profileRouter from './routes/profile.js'
import chatRouter from './routes/chat.js'

const app = express();

app.use(express.json())

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use("/profile",profileRouter)
app.use("/data",chatRouter)





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





// app.post("/title",async(req,res)=>{
//    const title= await prisma.
// })

app.listen(8000, () => {
  console.log("server running");

})