import { useState } from 'react';

const Task = ({ task, onDelete, onStatusChange }) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [note, setNote] = useState(task.note || '');

  const handleNoteSave = (content) => {
    setNote(content);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.name}</h3>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-400 hover:text-red-500"
          title="Delete Task"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
      <div className="flex justify-between items-center">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          className="bg-gray-700 text-sm rounded px-2 py-1"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

export default Task; 