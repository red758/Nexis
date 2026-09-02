const express=require("express");
const Groq=require('groq-sdk');
const router=express.Router();
const Task=require('../models/Task');

router.post('/generate',async(req,res)=>{
    try{
        const {prompt, organizationId, assigneeId, userName}=req.body;
        //Inititalizing google gemini
        const groq=new  Groq({apiKey: process.env.GROQ_API_KEY});

        //Prompt Engineering(Forcing AI to act like a Senior Technical Project Manager)
        const aiPrompt = `
            You are a Technical Project Manager. 
            Goal: "${prompt}".
            Break this down into exactly 4 technical tasks.
            Output ONLY a JSON object with a single key "tasks" containing an array of strings.
            Example: {"tasks": ["Setup database", "Build API", "Design UI", "Testing"]}
        `;

        //Calling the AI
        console.log(`Asking Groq (LLAMA 3) to plan: "${prompt}"...`);
        const completion=await groq.chat.completions.create({
            messages:[{role:"user", content:aiPrompt}],
            model:"openai/gpt-oss-120b",
            response_format:{type:"json_object"}
        });

        //Cleaning the AI response
        const aiText=completion.choices[0].message.content;
        const parsedData=JSON.parse(aiText);

        const aiGeneratedTasks=parsedData.tasks;

        //Convert AI response of taak in list
        const taskToInsert=aiGeneratedTasks.map(title=>({
            title:title,
            status:'Todo',
            assignee:assigneeId,
            organization:organizationId
        }));

        //Add task in database
        const savedTasks=await Task.insertMany(taskToInsert);

        const io=req.app.get("io");
        
        io.to(organizationId).emit('task_added',{
            message :`AI Copilot generated ${savedTasks.length} tasks for ${userName}`
        });

        res.status(201).json({message:"AI tasks generated successfully", tasks: savedTasks});
    }catch(error){
        console.error('AI Generation Failed: ',error);
        res.status(500).json({error:"Failed to generate AI tasks"});
    }
});

module.exports=router;