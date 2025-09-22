
import React, { useState, useCallback } from 'react';
import { OnDutyRequest, RequestStatus, UserType, StudentUser, AuditLogEntry } from './types';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { INITIAL_STUDENT_USERS, ADMIN_CREDENTIALS } from './constants';
import Header from './components/Header';

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<{ id: string, type: UserType, name?: string, rollNo?: string } | null>(null);
  const [requests, setRequests] = useState<OnDutyRequest[]>([]);
  const [studentUsers, setStudentUsers] = useState<StudentUser[]>(INITIAL_STUDENT_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const handleAddAuditLog = useCallback((adminId: string, action: string) => {
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      adminId,
      action,
    };
    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  const handleLogin = (id: string, pass: string, type: UserType): boolean => {
    if (type === 'user') {
      const user = studentUsers.find(u => u.id === id && u.password === pass);
      if (user) {
        setLoggedInUser({ id: user.id, type, name: user.name, rollNo: user.rollNo });
        return true;
      }
    }
    if (type === 'admin' && ADMIN_CREDENTIALS[id] && ADMIN_CREDENTIALS[id] === pass) {
      setLoggedInUser({ id, type });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const handleNewRequest = useCallback((newRequest: Omit<OnDutyRequest, 'id' | 'status' | 'submittedBy'>) => {
    if (!loggedInUser) return;
    setRequests(prevRequests => [
      ...prevRequests,
      {
        ...newRequest,
        id: `req-${Date.now()}`,
        status: RequestStatus.PENDING,
        submittedBy: loggedInUser.id,
      },
    ]);
  }, [loggedInUser]);

  const handleUpdateRequestStatus = useCallback((requestId: string, newStatus: RequestStatus) => {
    const request = requests.find(r => r.id === requestId);
    if (request && loggedInUser?.type === 'admin') {
      const action = `${newStatus} request for ${request.name} (${request.rollNo}).`;
      handleAddAuditLog(loggedInUser.id, action);
    }
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      )
    );
  }, [requests, loggedInUser, handleAddAuditLog]);
  
  const handleCreateUser = useCallback((id: string, pass: string, name: string, rollNo: string): boolean => {
    if (studentUsers.some(user => user.id === id)) {
      alert('User ID already exists.');
      return false;
    }
    setStudentUsers(prev => [...prev, { id, password: pass, name, rollNo }]);
    if (loggedInUser?.type === 'admin') {
      const action = `Created new user: ${name} (${id}).`;
      handleAddAuditLog(loggedInUser.id, action);
    }
    alert(`User "${id}" created successfully!`);
    return true;
  }, [studentUsers, loggedInUser, handleAddAuditLog]);

  const handleUpdateUser = useCallback((updatedUser: StudentUser) => {
    setStudentUsers(prev => 
      prev.map(user => user.id === updatedUser.id ? updatedUser : user)
    );
    if (loggedInUser?.type === 'admin') {
      const action = `Updated user profile for ${updatedUser.name} (${updatedUser.id}).`;
      handleAddAuditLog(loggedInUser.id, action);
    }
    alert(`User "${updatedUser.id}" updated successfully!`);
  }, [loggedInUser, handleAddAuditLog]);

  const handleDeleteUser = useCallback((userId: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userId}"? This will also remove all their on-duty requests.`)) {
        setStudentUsers(prev => prev.filter(user => user.id !== userId));
        setRequests(prev => prev.filter(req => req.submittedBy !== userId));
        
        if (loggedInUser?.type === 'admin') {
            const action = `Deleted user "${userId}" and all associated requests.`;
            handleAddAuditLog(loggedInUser.id, action);
        }

        alert(`User "${userId}" and all their requests have been deleted successfully.`);
    }
  }, [loggedInUser, handleAddAuditLog]);

  const renderContent = () => {
    if (!loggedInUser) {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
        {loggedInUser.type === 'user' ? (
          <UserDashboard 
            onSubmitRequest={handleNewRequest} 
            userRequests={requests.filter(r => r.submittedBy === loggedInUser.id)}
            loggedInUser={loggedInUser}
          />
        ) : (
          <AdminDashboard 
            requests={requests} 
            onUpdateRequestStatus={handleUpdateRequestStatus} 
            studentUsers={studentUsers}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            auditLogs={auditLogs}
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-gray-100 font-sans">
      <Header loggedInUser={loggedInUser} onLogout={handleLogout} />
      <main className="flex flex-col items-center justify-center pt-24 pb-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
