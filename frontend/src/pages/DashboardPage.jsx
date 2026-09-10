import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

// Keep the connection outside so it doesn't reconnect constantly
const socket = io('http://localhost:5000');

export default function DashboardPage() {
  const { currentUser, logout } = useContext(AuthContext);
  
  // Dashboard State
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [queryResults, setQueryResults] = useState([]);
  const [queryType, setQueryType] = useState('status');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- WEBSOCKETS AND DATA FETCHING ---
  const orgId = currentUser?.organization?._id || currentUser?.organization;

  const fetchTasks = async (orgIdToFetch) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tasks/${orgIdToFetch}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
      
    }
  };

  const runDynamicQuery = async (orgIdToFetch, type) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/query`, {
        organizationId: orgIdToFetch,
        groupBy: type
      });
      setQueryResults(response.data);
    } catch (error) {
      console.error("Error running query: ", error);
    }
  };

  useEffect(() => {
    if (orgId) {
      // 1. Initial Data Load
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);

      // 2. Turn on the Walkie Talkie
      socket.emit('join_workspace', orgId);

      socket.on('task_added', (data) => {
        setNotifications((prev) => [data.message, ...prev]);
        fetchTasks(orgId);        
        runDynamicQuery(orgId, queryType);
      });

      socket.on('task_updated', (data) => {
        setNotifications((prev) => [data.message, ...prev]);
        fetchTasks(orgId);
        runDynamicQuery(orgId, queryType);
      });

      // 3. Cleanup Walkie Talkie when leaving the dashboard
      return () => {
        socket.off('task_added');
        socket.off('task_updated');
      };
    }
  }, [orgId, queryType]);

  // --- CRUD OPERATIONS ---
  const handleCreateTask = async (e) => {
    console.log("Create task reaching");
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/tasks/${currentUser.name}`, {
        title: taskTitle,
        assigneeId: currentUser._id,
        organizationId: orgId 
      });
      setTaskTitle('');
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    } catch (error) {
      console.error("Error creating task: ", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Do you want to delete this task?")) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
        fetchTasks(orgId);
        runDynamicQuery(orgId, queryType);
      } catch (error) {
        console.error("Error deleting the task", error);
      }
    }
  };

  const handelUpdateStatus = async (taskId, newStatus, taskTitle) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, {
        status: newStatus,
        organizationId: orgId,
        title: taskTitle,
        userName: currentUser.name
      });
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    } catch (error) {
      console.error("Error updating the task: ", error);
    }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    setIsAiLoading(true);
    try {
      await axios.post('http://localhost:5000/api/ai/generate', {
        prompt: aiPrompt,
        assigneeId: currentUser._id,
        organizationId: orgId,
        userName: currentUser.name
      });
      setAiPrompt('');
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    } catch (error) {
      console.error("Error generating AI tasks", error);
      alert("AI Generation failed. Check backend console.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSafeLogout = () => {
    socket.disconnect(); // Turn off radio before logging out
    logout();
    socket.connect(); // Ready it for the next user
  };

  // --- UI RENDER (The Minimalist Design you approved) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* ULTRA CLEAN NAVBAR */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white">
              <svg className="w-8 h-7 text-white-900 fill-current" viewBox="0 0 320 400">
                <path className="logo-path" d="M160 20 L270 380 L220 380 L160 160 L100 380 L50 380 L160 20 Z" />
                <path className="logo-path" d="M 30 140 C 120 120, 180 140, 240 180 C 300 220, 320 280, 280 340 C 240 400, 180 360, 190 320 C 200 280, 260 260, 280 180 C 300 100, 150 80, 30 140 Z" />
              </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-900">{currentUser.organization.name}</h2>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-sm font-medium text-slate-600">Welcome, <span className="text-slate-900 font-bold">{currentUser.name}</span></p>
          <button onClick={handleSafeLogout} className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-100 rounded-md transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI COPILOT */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-1 text-slate-900 flex items-center gap-2">Nexis AI Copilot</h3>
            <p className="text-slate-500 mb-6 text-sm">Type a goal, and our AI will break it down into technical tasks instantly.</p>
            <form onSubmit={handleAiGenerate} className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" placeholder="e.g. Build a secure authentication system..." value={aiPrompt} onChange={(e)=>setAiPrompt(e.target.value)} required 
                className="flex-1 px-2 py-2 placeholder:text-sm text-sm rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-slate-900 transition-all font-medium" disabled={isAiLoading}
              />
              <button type="submit" disabled={isAiLoading} className="px-6 py-1 text-sm bg-slate-900 text-white font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-wait">
                {isAiLoading ? 'Planning...' : 'Auto-Plan'}
              </button>
            </form>
          </div>

          {/* DYNAMIC REPORTS */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">Dynamic Reports</h3>
              <select value={queryType} onChange={(e)=>setQueryType(e.target.value)} className="bg-white border border-slate-200 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-slate-900 font-medium cursor-pointer">
                <option value="status">Group By Status</option>
                <option value="assignee">Group By Assignee</option>
              </select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {queryResults.map((result, index)=>(
                <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col justify-center items-center text-center">
                  <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{result._id}</span>
                  <strong className="text-2xl font-bold text-slate-900">{result.count}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* TASKS */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Project Tasks</h3>
            <form onSubmit={handleCreateTask} className="flex gap-3 mb-6 bg-white p-1.5 rounded-lg border border-slate-200 shadow-sm">
              <input type="text" placeholder="Add a task..." value={taskTitle} onChange={(e)=>setTaskTitle(e.target.value)} required className="flex-1 px-3 py-1.5 text-sm font-medium" />
              <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">Add</button>
            </form>
            <ul className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-sm">No tasks yet.</div>
              ) : (
                tasks.map(task=>(
                  <li key={task._id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-slate-300 transition-colors group flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <strong className="text-slate-900 font-semibold block mb-1">{task.title}</strong>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                        Assigned to: {task.assignee ? task.assignee.name : 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select value={task.status} onChange={(e)=>handelUpdateStatus(task._id, e.target.value, task.title)} className="text-xs font-medium rounded-md px-2.5 py-1 border cursor-pointer outline-none bg-white">
                        <option value='Todo'>Todo</option>
                        <option value='In Progress'>In Progress</option>
                        <option value='Done'>Done</option>
                      </select>
                      <button onClick={()=>handleDeleteTask(task._id)} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 text-slate-400 rounded-md hover:bg-slate-100 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">✕</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24 shadow-sm">
            <div className="bg-slate-50 border-b border-slate-200 p-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span></span>
                Activity Feed
              </h3>
            </div>
            <div className="p-4 h-[600px] overflow-y-auto">
              {notifications.length === 0 ? <p className="text-slate-400 text-xs text-center mt-10">No recent activity.</p> : (
                <ul className="space-y-3">
                  {notifications.map((note, index)=>(
                    <li key={index} className="bg-white border border-slate-200 border-l-2 border-l-slate-900 p-3 rounded-md shadow-sm text-xs text-slate-700">{note}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}