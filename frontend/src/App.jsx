import { useContext } from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import axios from 'axios';
import {AuthContext} from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

axios.interceptors.request.use((config)=>{
  const token=localStorage.getItem('nexis_token');
  if(token){
    config.headers['Authorization']=`Bearer ${token}`;
  }
  //console.log(config);
  return config;
}, (error)=>{
  return Promise.reject(error);
});

function App() {
  
  const {currentUser, loading}=useContext(AuthContext);
  if(loading){
    return(
      <div className="mih-h-screen absolute top-70 w-full bg-slate-50 flex items-center justify-center"> {/*spinner centered*/}
        <div className="animate-spin rounded-full h-12 w-12 top-border border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return(
    <Router>
      <Routes>
        <Route 
          path="/"
          element={!currentUser ? <AuthPage/> : <Navigate to='/dashboard'/>}
        />

        <Route
          path="/dashboard"
          element={
            currentUser ? (<div className="p-10 text-2xl font-bold"><DashboardPage/></div>) : (<Navigate to="/"/>)
          }
        />
      </Routes>
    </Router>
  );

}
export default App;