import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import { RootState } from './store/store';
import Login from './pages/Login';
import TaskList from './pages/TaskList';
import './App.css';

const App: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/tasks" /> : <Login />} 
            />
            <Route 
              path="/tasks" 
              element={user ? <TaskList /> : <Navigate to="/" />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;