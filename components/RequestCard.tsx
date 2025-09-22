import React from 'react';
import { OnDutyRequest, RequestStatus, FileData } from '../types';

interface RequestCardProps {
  request: OnDutyRequest;
  onUpdateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
}

const AttachmentDisplay: React.FC<{file: FileData | null, name: string}> = ({ file, name }) => {
    if (!file) {
        return <span className="text-gray-500 text-sm">Not provided</span>;
    }

    if (file.type.startsWith('image/')) {
        return (
            <a href={file.dataUrl} target="_blank" rel="noopener noreferrer" className="group inline-block">
                <img src={file.dataUrl} alt={`${name} Preview`} className="max-h-48 w-auto object-contain rounded-lg border-2 border-white/20 group-hover:border-red-500 transition-all" />
            </a>
        );
    }
    
    return (
      <a 
        href={file.dataUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="bg-white/10 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-white/20 transition duration-300 inline-flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View {name}
      </a>
    );
};

const calculateDays = (from: string, to: string): number => {
    if (!from || !to) return 0;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (toDate < fromDate) return 0;
    const diffTime = toDate.getTime() - fromDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

const RequestCard: React.FC<RequestCardProps> = ({ request, onUpdateRequestStatus }) => {
  
  const getStatusChipColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED: return 'bg-green-500/20 text-green-300';
      case RequestStatus.REJECTED: return 'bg-red-500/20 text-red-300';
      case RequestStatus.PENDING:
      default:
        return 'bg-yellow-500/20 text-yellow-300';
    }
  };

  const DetailItem: React.FC<{label: string, value: string | number}> = ({label, value}) => (
    <div className="text-sm">
        <p className="font-semibold text-gray-400">{label}</p>
        <p className="text-gray-100">{value}</p>
    </div>
  );

  const days = calculateDays(request.fromDate, request.toDate);

  return (
    <div className="bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg overflow-hidden flex flex-col transition-transform hover:scale-105 duration-300">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white">{request.name}</h3>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusChipColor(request.status)}`}>
            {request.status}
          </span>
        </div>

        <p className="text-gray-300 mb-4 bg-white/5 p-3 rounded-md border border-white/10">{request.reason}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <DetailItem label="Roll No" value={request.rollNo} />
            <DetailItem label="Batch" value={request.batch} />
            <DetailItem label="Semester" value={request.semester} />
            <DetailItem label="Academic Year" value={request.academicYear} />
            <DetailItem label="From Date" value={request.fromDate} />
            <DetailItem label="To Date" value={request.toDate} />
            <DetailItem label="Duration" value={`${days} ${days > 1 ? 'days' : 'day'}`} />
            <DetailItem label="Period" value={request.period} />
        </div>
        
        <div className="border-t border-white/10 pt-4 mt-4">
            <h4 className="font-semibold text-gray-300 mb-4">Attachments</h4>
            <div className="space-y-4 text-center">
                <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">Jio Tag Photo</p>
                    <AttachmentDisplay file={request.jioTagPhoto} name="Photo" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">Approval Letter</p>
                    <AttachmentDisplay file={request.approvalLetter} name="Letter" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-400 mb-2">Certificate</p>
                    <AttachmentDisplay file={request.certificate} name="Certificate" />
                </div>
            </div>
        </div>
      </div>
      
      {request.status === RequestStatus.PENDING && (
        <div className="bg-black/20 p-4 flex justify-end space-x-3 border-t border-white/10">
          <button 
            onClick={() => onUpdateRequestStatus(request.id, RequestStatus.REJECTED)}
            className="bg-red-600/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-500 transition duration-300"
          >
            Reject
          </button>
          <button 
            onClick={() => onUpdateRequestStatus(request.id, RequestStatus.APPROVED)}
            className="bg-green-600/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-500 transition duration-300"
          >
            Approve
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;