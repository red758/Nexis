const express=require('express');
const {GoogleGenerativeAI}=require("@google/generative-ai");
const router=express.Router();
const Task=require('../models/Task');

router.post('/generate',async(req,res)=>{
    try{
        const {prompt, organizationId, assigneeId, userName}=req.body;
        //Inititalizing google gemini
        const genAI=new  GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model=genAI.getGenerativeModel({model:"gemini-1.5-flash"});

        //Prompt Engineering(Forcing AI to act like a Senior Technical Project Manager)
        const aiPrompt=`
            You are a Senior Technical Project Manager.
            The user wants to accomplish this goal: "${prompt}".
            Break this goal down into exactly 4 actionable, technical tasks.
            Return only a valid JSON array of strings. Do not include any markdown, explanations, or formatting.
            Example format: ["Task 1", "Task 2", "Task 3", "Task 4"]
        `;

        //Calling the AI
        console.log(`Asking Gemini AI to plan: "${prompt}"...`);
        const result=await model.generateContent(aiPrompt);
        let aiText = result.response.text();

        //Cleaning the AI response
        ai.Text=aiText.replace(/```json/g,'').replace(/```/g,'').trim();

        const aiGeneratedTasks=JSON.parse(aiText)

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
            message :`AI Copilot generated ${savedTasks.length}tasks for ${userName}`
        });

        res.status(200).json({message:"AI tasks generated successfully", tasks: savedTasks});
    }catch(error){
        console.error('AI Generation Failed: ',error);
        res.status(500).json({error:"Failed to generate AI tasks"});
    }
});

module.exports=router;