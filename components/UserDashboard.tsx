

import React, { useState } from 'react';
import { OnDutyRequest, FileData, RequestStatus, UserType } from '../types';
import { INITIAL_FORM_STATE, SEMESTER_OPTIONS, ACADEMIC_YEAR_OPTIONS, BATCH_OPTIONS } from '../constants';

interface UserDashboardProps {
  onSubmitRequest: (request: Omit<OnDutyRequest, 'id' | 'status' | 'submittedBy'>) => void;
  userRequests: OnDutyRequest[];
  loggedInUser: { id: string; type: UserType; name?: string; rollNo?: string; };
}

const DetailItem: React.FC<{label: string, value: string | number}> = ({label, value}) => (
    <div className="text-sm py-1">
        <p className="font-semibold text-gray-400">{label}</p>
        <p className="text-gray-100">{value}</p>
    </div>
);

const AttachmentDisplay: React.FC<{file: FileData | null, name: string}> = ({ file, name }) => {
    if (!file) {
        return <span className="text-gray-500 text-sm">Not provided</span>;
    }

    if (file.type.startsWith('image/')) {
        return (
            <a href={file.dataUrl} target="_blank" rel="noopener noreferrer" className="group">
                <img src={file.dataUrl} alt={`${name} Preview`} className="w-32 h-32 object-cover rounded-lg border-2 border-white/20 group-hover:border-red-500 transition-all" />
            </a>
        );
    }

    return (
        <a 
            href={file.dataUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-white/10 text-white font-semibold py-1 px-3 rounded-lg text-xs hover:bg-white/20 transition duration-300 inline-flex items-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View {name}
        </a>
    );
};


const UserDashboard: React.FC<UserDashboardProps> = ({ onSubmitRequest, userRequests, loggedInUser }) => {
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_STATE,
    name: loggedInUser?.name || '',
    rollNo: loggedInUser?.rollNo || '',
  });
  const [jioTagPhoto, setJioTagPhoto] = useState<FileData | null>(null);
  const [approvalLetter, setApprovalLetter] = useState<FileData | null>(null);
  const [certificate, setCertificate] = useState<FileData | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  const calculateDays = (from: string, to: string): number => {
    if (!from || !to) return 0;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (toDate < fromDate) return 0;
    const diffTime = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
        const newState = { ...prev, [name]: value };

        let from = newState.fromDate;
        let to = newState.toDate;

        if (name === 'fromDate') {
            from = value;
            if (to && new Date(value) > new Date(to)) {
                newState.toDate = value;
                to = value;
            }
        }
        if (name === 'toDate') {
            to = value;
        }

        if (from && to && from !== to) {
            newState.period = 'Full Day';
        }
        
        return newState;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<FileData | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFile({
          name: file.name,
          type: file.type,
          dataUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetForm = () => {
    setFormData({
        ...INITIAL_FORM_STATE,
        name: loggedInUser?.name || '',
        rollNo: loggedInUser?.rollNo || '',
    });
    setJioTagPhoto(null);
    setApprovalLetter(null);
    setCertificate(null);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest({ ...formData, jioTagPhoto, approvalLetter, certificate });
    resetForm();
    setShowForm(false);
    alert('Request submitted successfully!');
  };

  const handleToggleDetails = (id: string) => {
    setExpandedRequestId(prevId => (prevId === id ? null : id));
  };
  
  const getStatusStyle = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return { chip: 'bg-green-500/20 text-green-300', border: 'border-green-500' };
      case RequestStatus.REJECTED: return { chip: 'bg-red-500/20 text-red-300', border: 'border-red-500' };
      case RequestStatus.PENDING:
      default:
        return { chip: 'bg-yellow-500/20 text-yellow-300', border: 'border-yellow-500' };
    }
  };

  return (
    <div className="w-full">
      <div className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">My On-Duty Requests</h2>
            <button
                onClick={() => setShowForm(!showForm)}
                className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300"
            >
                {showForm ? 'Hide Form' : 'New Request'}
            </button>
        </div>
        {userRequests.length > 0 ? (
           <div className="space-y-3">
            {userRequests.map(req => {
                const isExpanded = expandedRequestId === req.id;
                const statusStyle = getStatusStyle(req.status);
                const days = calculateDays(req.fromDate, req.toDate);
                return (
                    <div key={req.id} className={`bg-white/5 rounded-lg border-l-4 ${statusStyle.border} overflow-hidden transition-all duration-300`}>
                        <button onClick={() => handleToggleDetails(req.id)} className="w-full text-left p-4 flex justify-between items-center hover:bg-white/10 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                        <div>
                            <p className="font-bold text-lg text-white">{req.reason}</p>
                            <p className="text-sm text-gray-400">{req.fromDate} to {req.toDate} ({days} {days > 1 ? 'days' : 'day'}) - {req.period}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyle.chip}`}>
                            {req.status}
                            </span>
                            <span className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </span>
                        </div>
                        </button>
                        {isExpanded && (
                        <div className="p-6 border-t border-white/10 bg-black/20">
                            <h4 className="text-lg font-semibold text-white mb-4">Request Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 mb-4">
                                <DetailItem label="Name" value={req.name} />
                                <DetailItem label="Roll No" value={req.rollNo} />
                                <DetailItem label="Batch" value={req.batch} />
                                <DetailItem label="Semester" value={req.semester} />
                                <DetailItem label="Academic Year" value={req.academicYear} />
                                <DetailItem label="College" value={req.collegeName} />
                                <DetailItem label="From Date" value={req.fromDate} />
                                <DetailItem label="To Date" value={req.toDate} />
                            </div>
                            <div className="border-t border-white/10 pt-4 mt-4">
                                <h4 className="font-semibold text-gray-300 mb-4">Attachments</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                                    <div className="flex flex-col items-start space-y-2">
                                        <p className="text-sm font-semibold text-gray-400">Jio Tag Photo</p>
                                        <AttachmentDisplay file={req.jioTagPhoto} name="Jio Tag Photo" />
                                    </div>
                                    <div className="flex flex-col items-start space-y-2">
                                        <p className="text-sm font-semibold text-gray-400">Approval Letter</p>
                                        <AttachmentDisplay file={req.approvalLetter} name="Approval Letter" />
                                    </div>
                                    <div className="flex flex-col items-start space-y-2">
                                        <p className="text-sm font-semibold text-gray-400">Certificate</p>
                                        <AttachmentDisplay file={req.certificate} name="Certificate" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
                )
            })}
            </div>
        ) : (
            <p className="text-center text-gray-400 py-8">You have not submitted any requests yet.</p>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 p-8 space-y-6">
          <h2 className="text-3xl font-bold text-white border-b border-white/20 pb-4 mb-6">Submit On-Duty Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="Name" name="name" value={formData.name} onChange={handleChange} required disabled />
            <InputField label="Roll No" name="rollNo" value={formData.rollNo} onChange={handleChange} required disabled />
            <SelectField label="Semester" name="semester" value={formData.semester} onChange={handleChange} options={SEMESTER_OPTIONS} required />
            <SelectField label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleChange} options={ACADEMIC_YEAR_OPTIONS} required />
            <SelectField label="Batch" name="batch" value={formData.batch} onChange={handleChange} options={BATCH_OPTIONS} required />
            <InputField label="College Name" name="collegeName" value={formData.collegeName} onChange={handleChange} disabled />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">On-Duty Reason</label>
            <textarea name="reason" value={formData.reason} onChange={handleChange} rows={4} className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md shadow-sm focus:border-red-500 focus:ring-red-500 text-white" required></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <InputField label="From Date" name="fromDate" type="date" value={formData.fromDate} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
            <InputField label="To Date" name="toDate" type="date" value={formData.toDate} onChange={handleChange} required min={formData.fromDate} />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Period</label>
              <div className="mt-2 flex space-x-4 items-center h-11">
                <RadioOption id="full_day" name="period" value="Full Day" checked={formData.period === 'Full Day'} onChange={handleChange} />
                <RadioOption 
                    id="half_day" 
                    name="period" 
                    value="Half Day" 
                    checked={formData.period === 'Half Day'} 
                    onChange={handleChange} 
                    disabled={!formData.fromDate || formData.fromDate !== formData.toDate}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/20">
            <FileInputField label="Jio Tag Photo" name="jioTagPhoto" file={jioTagPhoto} onChange={(e) => handleFileChange(e, setJioTagPhoto)} />
            <FileInputField label="Approval Letter Copy" name="approvalLetter" file={approvalLetter} onChange={(e) => handleFileChange(e, setApprovalLetter)} />
            <FileInputField label="Certificate" name="certificate" file={certificate} onChange={(e) => handleFileChange(e, setCertificate)} />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-white/20">
            <button type="button" onClick={resetForm} className="bg-white/10 text-white font-semibold py-2 px-6 rounded-lg hover:bg-white/20 transition duration-300">Cancel</button>
            <button type="submit" className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-red-700 transition duration-300">Submit</button>
          </div>
        </form>
      )}
    </div>
  );
};


// Helper Components
type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
};

const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => (
  <div>
    <label htmlFor={props.name} className="block text-sm font-medium text-gray-300">{label}</label>
    <input id={props.name} {...props} className="mt-1 block w-full rounded-md bg-white/5 border border-white/20 shadow-sm focus:border-red-500 focus:ring-red-500 disabled:bg-white/10 disabled:opacity-70 text-white" />
  </div>
);

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    options: string[];
};

const SelectField: React.FC<SelectFieldProps> = ({ label, options, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-gray-300">{label}</label>
        <select
            id={props.name}
            {...props}
            className="mt-1 block w-full rounded-md bg-white/5 border border-white/20 shadow-sm focus:border-red-500 focus:ring-red-500 text-white"
        >
            {options.map(option => (
                <option key={option} value={option} className="bg-gray-800 text-white">
                    {option}
                </option>
            ))}
        </select>
    </div>
);

const RadioOption: React.FC<{id: string, name: string, value: string, checked: boolean, onChange: (e: any) => void, disabled?: boolean}> = ({ id, disabled, ...props }) => (
    <div className="flex items-center">
      <input id={id} type="radio" disabled={disabled} {...props} className="h-4 w-4 text-red-500 border-gray-500 bg-transparent focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed" />
      <label htmlFor={id} className={`ml-2 block text-sm ${disabled ? 'text-gray-500' : 'text-gray-200'}`}>{props.value}</label>
    </div>
);

const FileInputField: React.FC<{label: string, name: string, file: FileData | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void}> = ({ label, name, file, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input type="file" name={name} onChange={onChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/20 file:text-red-300 hover:file:bg-red-500/30 cursor-pointer"/>
      {file && <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>}
    </div>
);


export default UserDashboard;