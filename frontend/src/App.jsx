import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks]=useState([]);
  const [taskTitle, setTaskTitle]=useState('');
  const [currentUser, setCurrentUser]=useState(null);
  
  const [formData, setFormData] = useState({ userName: '', email: '', orgName: '' });
  
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

  const handleRegister=async (e)=>{
    e.preventDefault();
    await axios.post('http://localhost:5000/api/users/register',formData);
    setFormData({userName:'', email:'', orgName:''});
    fetchUsers();
  };

  const fetchTasks=async (orgId)=>{
    const response=await axios.get(`http://localhost:5000/api/tasks/${orgId}`);
    setTasks(response.data);
    //console.log(response.data);
  };

  const handleLogin = (user) => {
    console.log("CLICKED USER DATA:", user);
    if (!user.organization) {
      alert("Hold up! This user has no organization data.");
      return; 
    }
    const orgId = user.organization._id ;
    setCurrentUser(user);
    fetchTasks(orgId); 
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
  
  if(currentUser){
    return(
      <div style={{padding:'20px', fontFamily:'sans-serif'}}>
        <button onClick={()=>setCurrentUser(null)} style={{marginBottom:'20px'}}>Logout</button>

        <h2>{currentUser.organization?.name || 'My'} Workspace</h2>
        <p>Welcome back, {currentUser.name}</p>

        <form onSubmit={handleCreateTask} style={{marginBottom:'30px'}}>
          <input type="text" 
          placeholder="What needs to be done?" 
          value={taskTitle} 
          onChange={(e)=>setTaskTitle(e.target.value)} 
          required 
          style={{padding:'10px', width:'300px'}}
          />

          <button type="submit" style={{padding:'10px', backgroundColor:'blue', color:'white'}}>Add Task</button>
        </form>

        <h3>Project Tasks</h3>
        <ul style={{listStyleType:'none', padding:0}}>
          {tasks.map(task=>(
            <li key={task._id} style={{border:'1px solid black', padding:'15px', margin:'10px 0', borderRadius:'5px'}}>
              <strong>{task.title}</strong>
              <span style={{float:'right', backgroundColor:'#eee', padding:'5px'}}>{task.status}</span>
              <p style={{margin:'5px 0 0 0', fontSize:'12px', color:'gray'}}>
                Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}
              </p>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  else{
  return(
    <div style={{fontFamily:'sans-serif', maxWidth:'600px', margin:'0 auto', padding:'20px', border:'2px solid black', borderRadius:'5px'}}>
      
      <h2>Nexis Login / Register</h2>

      <div style={{border:'2px solid #a89d9d', borderRadius:'5px', padding:'20px 15px'}}>
        <form onSubmit={handleRegister} style={{display:'flex', flexDirection:'column', gap:'10px', marginBottom:'30px'}}>
          <input type="text" name="username" placeholder="Your Name" value={formData.userName} onChange={e=> setFormData({...formData, userName:e.target.value})} required/>
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required/>
          <input type="text" name="orgName" placeholder="Organization value" value={formData.orgName} onChange={e=>setFormData({...formData, orgName: e.target.value})} required/>

          <button type="submit" style={{padding:'10px', backgroundColor:'black', color:'white', borderRadius:'10px'}}>Create Account</button>
        </form>
      </div>
      <h3>Simulate Login</h3>
      <ul style={{listStyleType:'none', padding:0}}>
        {users.map((user)=>(
          <li
          key={user.id}
          onClick={()=>handleLogin(user)}
          style={{border:'1px solid black', padding:'10px', margin:'10x 0', cursor:'pointer'}}
          >
            <strong>{user.name}</strong> - {user.organization ? user.organization.name : 'None'}
            <span style={{float:'right', color:'blue'}}>Login</span>
          </li>
        ))}
      </ul>
    </div>
  );
  }
}

export default App;