import { useState, useEffect } from 'react';
import axios from 'axios';
import {io} from 'socket.io-client';

//We create the connection outside the component so it doesnt re-connect every time the component re render
const socket=io('http://localhost:5000');

function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks]=useState([]);
  const [taskTitle, setTaskTitle]=useState('');
  const [currentUser, setCurrentUser]=useState(null);
  
  const [formData, setFormData] = useState({ userName: '', email: '', orgName: '' });
  
  //To store our notifications
  const [notifications, setNotifications]=useState([]);

  // Fetch users when the page loads
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //Websocket setup
  useEffect(()=>{
    if(currentUser){
        //Get the organization id
        const orgId =currentUser.organization._id?currentUser.organization._id : currentUser.organization;

        //Tell the server to put us this organization channel
        socket.emit('join_workspace',orgId);

        //Keep listening for the task added shout from the server
        socket.on('task_added',(data)=>{
          console.log('Radio message received');          
          //Add messages to our notifiactions list
          setNotifications((prev)=>[data.message,...prev]);

          //To get instant view of new task added by different people in same organization
          fetchTasks(orgId);        
        });

      //To disconnect the socket
      return()=>{
        socket.off('task_added');
      };
    }
  },[currentUser]);

  const handleRegister=async (e)=>{
    e.preventDefault();
    await axios.post('http://localhost:5000/api/users/register',formData);
    setFormData({userName:'', email:'', orgName:''});
    fetchUsers();
  };

  const fetchTasks=async (orgId)=>{
    try{
      const response=await axios.get(`http://localhost:5000/api/tasks/${orgId}`);
      setTasks(response.data);
    }
    catch(error){
      console.error('Error fetching tasks',error);
    }
    //console.log(response.data); 
  };

  const handleLogin = (user) => {
    //console.log("CLICKED USER DATA:", user);
    if (!user.organization) {
      alert("This user has no organization data.");
      return; 
    }
    const orgId = user.organization._id ? user.organization._id : user.organization ;
    setCurrentUser(user);
    fetchTasks(orgId); 
  };

  const handleLogout = () => {
    //Cut the live connection immediately. (This stops background listeners from running and prevents memory leaks.)
    socket.disconnect(); 

    //Turn the socket back on so it is fresh and ready (For the next person who logs in on this computer.)
    socket.connect(); 

    //Clear the user state in React.(This instantly takes them out of the dashboard view.)
    setCurrentUser(null); 
  };


  const handleCreateTask = async (e) => {
    e.preventDefault();
    const orgId = currentUser.organization._id ? currentUser.organization._id : currentUser.organization;
    await axios.post('http://localhost:5000/api/tasks', {
      title: taskTitle,
      assigneeId: currentUser._id,
      organizationId: orgId 
    });
    setTaskTitle('');
    fetchTasks(orgId);
  };

  const deleteUser = async (user_del)=>{
    const userId= user_del._id ? user_del._id : user_del;
    console.log(`delete working ${userId}`);
    //filtering the user from frontend
    const updatedUser=users.filter(user => user._id != userId)
    //updating the list on frontend
    setUsers(updatedUser);
    console.log('reached before http request');
    const response=await axios.post(`http://localhost:5000/api/users/delete/${userId}`);
    console.log("recaher after http request");
    if(!response){
      console.log('user deleted');
    }
    else{
      console.log(response);
    }
  }
  
  if (currentUser){
    return(
      <div style={{padding:'20px', fontFamily:'sans-serif', display:'flex', gap:'40px'}}>
        
        {/* Left column tasks*/}
        <div style={{flex:2}}>
          
          <button onClick={handleLogout} style={{marginBottom:'20px'}}>Logout</button>
          
          <h2>{currentUser.organization.name} Workspace</h2>
          
          <p>Welcome back, {currentUser.name}</p>

          <form onSubmit={handleCreateTask} style={{marginBottom:'30px'}}>
          
            <input type="text" placeholder="What needs to be done?" valule={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} required style={{padding:'10px', width:'300px'}}/>
            <button type="submit" style={{padding:'10px', width:'300px'}}>Add Task</button>
          
          </form>

          <h3>Project Tasks</h3>
          <ul style={{listStyleType:'none', padding:0}}>
            {tasks.map(task=>(
              <li key={task._id} style={{border:'1px solid black', padding:'15px', margiin:'10px 0', borderRadius:'5px'}}>
                
                <strong>{task.title}</strong>
                
                <span stylel={{float:'right', backgroundColor:'#eee', padding:'5px'}}>task.status</span>

                <p style={{margin:'5px 0 0 0', fontSize:'12px', color:'gray'}}>Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}</p>
              
              </li>
            ))}
          </ul>
        </div>

        {/*Right column: Live notifications*/}
        <div style={{flex:1, backgroundColor:'#f9f9f9', padding:'20px', borderRadius:'8px', border:'1px solid #ddd', maxHeight:'500px', overflow:'auto'}}>
          <h3>Live Notifications</h3>
          {notifications.length===0 ? (
            <p style={{color:'gray', fontSize:'14px'}}>No New Notifications...</p>
          ):(
            <ul style={{listStyleType:'none', padding:0}}>
              {notifications.map((note,index)=>(
                <li key={index} style={{backgroundColor:'#fff', borderLeft:'4px solid green', padding:'10px', marginBottom:'10px', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'}}>
                  {note}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto', padding:'20px'}}>
      <h2>Nexis Login / Register</h2>
      <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'30px'}}>
        <input type="text" name="userName" placeholder="Your Name" value={formData.userName} onChange={e=>setFormData({...formData, userName:e.target.value})} required/>
        <input type="text" name="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/>
        <input type="text" name="orgName" placeholder="Oganization Name" value={formData.orgName} onChange={e=>setFormData({...formData, orgName:e.target.value})} required/>

        <button type="submit" style={{padding:'10px', backgroundColor:'black', color:'white'}}>Create Account</button>
      </form>

      <h3>Simulate Login (Click a user)</h3>
      <ul style={{listStyleType:'none', padding:0}}>
        {users.map((user)=>(
          <li key={user._id} style={{border:'1px solid #ccc', padding:'10px', margin:'10px 0', cursor:'pointer', display:'flex'}}>
            <strong>{user.name}</strong> - {user.organization ? user.organization.name : 'None'}
            <div style={{display:'flex', float:'right'}}>
            <span onClick={()=>handleLogin(user)} style={{float:'left', color:'blue'}}>Login</span>
            <span onClick={()=>deleteUser(user)} style={{float:'right',color:'red'}}>Delete</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

}
export default App;