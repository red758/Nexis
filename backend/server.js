const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
require('dotenv').config();

//Importing HTTP and Socket.io
const http=require('http');
const {Server}=require('socket.io');

//Importing routes
const userRoutes=require('./routes/userRoutes');
const taskRoutes=require('./routes/taskRoutes');
const queryRoutes=require('./routes/queryRoutes');
const authMiddleware=require('./middleware/auth');
const aiRoutes=require('./routes/aiRoutes');

//Initializing express app
const app=express();

//Middleware (allows us to to receive JSON and connects fronend/backned)
app.use(cors());
//Middleware to parse JSON string moving over requests
app.use(express.json());

//Websocket Setup
const server=http.createServer(app);

//Attaching socket to the server
const io=new Server(server,{
    cors:{
        origin:'http://localhost:5173',
        methods:["GET", "POST"]
    }
});

//Listen for connection
io.on('connection',(socket)=>{
    console.log(`A user connected to WebSockets: ${socket.id}`);
    
    //Make user join its workspace room
    socket.on('join_workspace',(orgId)=>{
        socket.join(orgId);
        console.log(`User joined Workspace Channel: ${orgId}`);
    });

    //Listen to disconnect the connection string
    socket.on('disconnect',()=>{
        console.log(`User disconected: ${socket.id}`);
    });
});

//Put the io for global access. (Can access things in app.set() from anywhere)
app.set('io',io);

//connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB connected successfully'))
.catch((err)=>console.log('MongoDb connection Error:', err));

//Use new routes. Any requests to /api/users will go to userRoutes.js
app.use('/api/users', userRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/query', authMiddleware, queryRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);

// a simple test route
/*app.get('/api/health',(req,res)=>{
    res.json({message: "Welcome to Nexis API! The backend is working."});
});*/

//start the server
const PORT=process.env.PORT||5000;
server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
});
