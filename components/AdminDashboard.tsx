
import React, { useState, useEffect } from 'react';
import { OnDutyRequest, RequestStatus, StudentUser, AuditLogEntry } from '../types';
import RequestCard from './RequestCard';

interface AdminDashboardProps {
  requests: OnDutyRequest[];
  onUpdateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
  studentUsers: StudentUser[];
  onCreateUser: (id: string, pass: string, name: string, rollNo: string) => boolean;
  onUpdateUser: (user: StudentUser) => void;
  onDeleteUser: (userId: string) => void;
  auditLogs: AuditLogEntry[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ requests, onUpdateRequestStatus, studentUsers, onCreateUser, onUpdateUser, onDeleteUser, auditLogs }) => {
  const [newUserId, setNewUserId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRollNo, setNewUserRollNo] = useState('');
  const [editingUser, setEditingUser] = useState<StudentUser | null>(null);

  useEffect(() => {
    if (editingUser) {
        setNewUserName(editingUser.name);
        setNewUserRollNo(editingUser.rollNo);
        setNewUserId(editingUser.id);
        setNewUserPassword('');
    } else {
        resetForm();
    }
  }, [editingUser]);

  const resetForm = () => {
    setNewUserId('');
    setNewUserPassword('');
    setNewUserName('');
    setNewUserRollNo('');
    setEditingUser(null);
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim() || !newUserName.trim() || !newUserRollNo.trim()) {
        alert('Name, Roll No, and User ID are required.');
        return;
    }

    if(editingUser) {
        // Update user
        const updatedUser = {
            ...editingUser,
            name: newUserName,
            rollNo: newUserRollNo,
            password: newUserPassword.trim() ? newUserPassword : editingUser.password,
        };
        onUpdateUser(updatedUser);
    } else {
        // Create user
        if (!newUserPassword.trim()) {
            alert('Password is required for new users.');
            return;
        }
        onCreateUser(newUserId, newUserPassword, newUserName, newUserRollNo);
    }
    resetForm();
  }

  const handleEditClick = (user: StudentUser) => {
    setEditingUser(user);
  }

  const handleCancelEdit = () => {
    resetForm();
  }

  const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING);
  const reviewedRequests = requests.filter(r => r.status !== RequestStatus.PENDING);

  return (
    <div className="w-full space-y-12">
       <div>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-red-500/50 pb-2">User Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                    {editingUser ? 'Edit Student User' : 'Create New Student User'}
                </h3>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <InputField label="Student Name" id="newUserName" value={newUserName} onChange={setNewUserName} placeholder="e.g., John Doe" required />
                    <InputField label="Roll Number" id="newUserRollNo" value={newUserRollNo} onChange={setNewUserRollNo} placeholder="e.g., 7377222IT228" required />
                    <InputField label="User ID" id="newUserId" value={newUserId} onChange={setNewUserId} placeholder="e.g., student123" required disabled={!!editingUser} />
                    <InputField 
                        label="Password" 
                        id="newUserPassword" 
                        type="password" 
                        value={newUserPassword} 
                        onChange={setNewUserPassword} 
                        placeholder={editingUser ? "Leave blank to keep current password" : "Enter a secure password"} 
                        required={!editingUser} 
                    />
                    <div className="flex items-center space-x-4 pt-2">
                        <button type="submit" className="flex-grow bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-700 transition duration-300">
                            {editingUser ? 'Update User' : 'Create User'}
                        </button>
                        {editingUser && (
                             <button type="button" onClick={handleCancelEdit} className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/20 transition duration-300">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
                <h3 className="text-2xl font-bold text-white mb-4">Existing Student Users ({studentUsers.length})</h3>
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                    {studentUsers.map(user => (
                        <div key={user.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center text-sm transition-colors hover:bg-white/10">
                            <div>
                                <p className="text-gray-100 font-semibold">{user.name}</p>
                                <p className="text-gray-400">{user.rollNo} <span className="text-gray-500">({user.id})</span></p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => handleEditClick(user)} className="p-2 rounded-full hover:bg-blue-500/20 text-blue-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                </button>
                                <button onClick={() => onDeleteUser(user.id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
       <div>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-red-500/50 pb-2">Audit Log</h2>
        <div className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8">
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {auditLogs.length > 0 ? auditLogs.map(log => (
                    <div key={log.id} className="bg-white/5 p-4 rounded-lg text-sm border-l-2 border-gray-500">
                        <div className="flex justify-between items-center mb-1">
                            <p className="font-semibold text-gray-200">{log.action}</p>
                            <p className="text-xs text-gray-400">{log.timestamp.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-gray-500">Performed by: <span className="font-medium text-gray-400">{log.adminId}</span></p>
                    </div>
                )) : (
                    <p className="text-center text-gray-400">No administrative actions have been logged yet.</p>
                )}
            </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-red-500/50 pb-2">Pending Requests ({pendingRequests.length})</h2>
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {pendingRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onUpdateRequestStatus={onUpdateRequestStatus} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-black/20 backdrop-blur-lg rounded-lg p-8 text-center border border-white/10">
            <p className="text-gray-300 text-lg">No pending requests to review.</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-white/20 pb-2">Reviewed Requests ({reviewedRequests.length})</h2>
        {reviewedRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {reviewedRequests.map(request => (
              <RequestCard 
                key={request.id} 
                request={request} 
                onUpdateRequestStatus={onUpdateRequestStatus} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-black/20 backdrop-blur-lg rounded-lg p-8 text-center border border-white/10">
            <p className="text-gray-300 text-lg">No requests have been reviewed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component for Inputs
interface InputFieldProps {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, value, onChange, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-300">{label}</label>
        <input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1 block w-full rounded-md bg-white/5 border border-white/20 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:bg-black/20 disabled:opacity-50 text-white"
            {...props}
        />
    </div>
);


export default AdminDashboard;
