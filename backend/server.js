const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();

//Import routes
const userRoutes=require('./routes/userRoutes');
const taskRoutes=require('./routes/taskRoutes');

//initialize express app
const app=express();

//Middleware (allows us to to receive JSON and connects fronend/backned)
app.use(cors());
app.use(express.json());

//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB connected successfully'))
.catch((err)=>console.log('MongoDb connection Error:', err));

//Use new routes. Any requests to /api/users will go to userRoutes.js
app.use('/api/users',userRoutes);
app.use('/api/tasks',taskRoutes);

// a simple test route
/*app.get('/api/health',(req,res)=>{
    res.json({message: "Welcome to Nexis API! The backend is working."});
});*/

//start the server
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
});
