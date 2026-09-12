import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TabBar from '../components/TabBar';
import OverviewTab from '../components/OverviewTab';
import TasksTab from '../components/TasksTab';
import ChatTab from '../components/ChatTab';
import DocumentsTab from '../components/DocumentsTab';

const socket = io('http://localhost:5000');

export default function DashboardPage() {
  const { currentUser, logout } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [queryResults, setQueryResults] = useState([]);
  const [queryType, setQueryType] = useState('status');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [projectBrief, setProjectBrief] = useState(currentUser?.organization?.projectBrief || 'Loading brief...');
  const [isEditingBrief, setIsEditingBrief] = useState(false);

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
      const response = await axios.post('http://localhost:5000/api/query', {
        organizationId: orgIdToFetch,
        groupBy: type,
      });
      setQueryResults(response.data);
    } catch (error) {
      console.error('Error running query: ', error);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
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
      return () => {
        socket.off('task_added');
        socket.off('task_updated');
      };
    }
  }, [orgId, queryType, currentUser]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tasks', { title: taskTitle, assigneeId: currentUser._id, organizationId: orgId });
      setTaskTitle('');
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    } catch (error) { console.error('Error creating task: ', error); }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Do you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`);
        fetchTasks(orgId);
        runDynamicQuery(orgId, queryType);
      } catch (error) { console.error('Error deleting the task', error); }
    }
  };

  const handelUpdateStatus = async (taskId, newStatus, title) => {
    try {
      await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus, organizationId: orgId, title, userName: currentUser.name });
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    } catch (error) { console.error('Error updating the task: ', error); }
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    setIsAiLoading(true);
    try {
      await axios.post('http://localhost:5000/api/ai/generate', { prompt: aiPrompt, assigneeId: currentUser._id, organizationId: orgId, userName: currentUser.name });
      setAiPrompt('');
      fetchTasks(orgId);
      runDynamicQuery(orgId, queryType);
    } catch (error) {
      alert('AI Generation failed. Check backend console.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSafeLogout = () => {
    socket.disconnect();
    logout();
    socket.connect();
  };

  const handleSaveBrief = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/organization/${orgId}/brief`, { projectBrief });
      setIsEditingBrief(false);
      alert('Project brief saved successfully');
    } catch (error) {
      console.error('Error saving brief: ', error);
      alert('Failed to save');
    }
  };

  const handleQueryChange = (newType) => {
    setQueryType(newType);
    runDynamicQuery(orgId, newType);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      
      <Navbar currentUser={currentUser} onLogout={handleSafeLogout} />
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">

        {activeTab === 'overview' && (
          <OverviewTab
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            isAiLoading={isAiLoading}
            onAiSubmit={handleAiGenerate}
            queryType={queryType}
            queryResults={queryResults}
            onQueryChange={handleQueryChange}
            notifications={notifications}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksTab
            currentUser={currentUser}
            tasks={tasks}
            taskTitle={taskTitle}
            setTaskTitle={setTaskTitle}
            onCreateTask={handleCreateTask}
            onUpdateStatus={handelUpdateStatus}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'chat' && <ChatTab />}

        {activeTab === 'documents' && (
          <DocumentsTab
            projectBrief={projectBrief}
            setProjectBrief={setProjectBrief}
            isEditingBrief={isEditingBrief}
            setIsEditingBrief={setIsEditingBrief}
            onSaveBrief={handleSaveBrief}
          />
        )}

      </main>
    </div>
  );
}
