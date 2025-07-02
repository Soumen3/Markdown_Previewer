import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import MarkdownEditor from './pages/MarkdownEditor'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import { client } from './lib/appwrite'
import { useEffect, useState } from 'react'
import { AppwriteException } from 'appwrite'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ToastContainer from './components/Toast'

function App() {
  const [status, setStatus] = useState("idle")
  const [logs, setLogs] = useState([])
  const [showLogs, setShowLogs] = useState(false)

  async function sendPing() {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const result = await client.ping();
      const log = {
        date: new Date(),
        method: "GET",
        path: "/v1/ping",
        status: 200,
        response: JSON.stringify(result),
      };
      setLogs((prevLogs) => [log, ...prevLogs]);
      setStatus("success");
      console.log('Appwrite ping successful:', result);
      
    } catch (err) {
      const log = {
        date: new Date(),
        method: "GET",
        path: "/v1/ping",
        status: err instanceof AppwriteException ? err.code : 500,
        response:
          err instanceof AppwriteException
            ? err.message
            : "Something went wrong",
      };
      setLogs((prevLogs) => [log, ...prevLogs]);
      setStatus("error");
      console.error('Appwrite ping failed:', err);
    }
    setShowLogs(true);
  }

  // useEffect(()=>{
  //   sendPing();
  //   console.log('App mounted, sending ping to Appwrite server');
  // },[])

  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor/:fileId" 
              element={
                <ProtectedRoute>
                  <MarkdownEditor />
                </ProtectedRoute>
              } 
            />
            {/* <Route 
              path="/editor" 
              element={
                <ProtectedRoute>
                  <MarkdownEditor />
                </ProtectedRoute>
              } 
            /> */}
          </Routes>
          <ToastContainer />
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
