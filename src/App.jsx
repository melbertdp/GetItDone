import React, { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import NoteModal from './components/NoteModal';

const initialData = {
  Backlog: [],
  'This Week': [],
  Today: [],
  Done: []
};

const CATEGORIES = ['Backlog', 'This Week', 'Today', 'Done'];

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.stopPropagation();
    // remove onClose() here
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div
        className="relative bg-gray-800 rounded-md p-6 max-w-lg w-full"
      >
        {children}
      </div>
    </div>
  );
};

const TaskItem = ({ task, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [note, setNote] = useState(task.note || '');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEdit = () => {
    setShowMenu(false);
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleSaveEdit = () => {
    onEdit(task.id, editedTask);
    setShowEditModal(false);
  };

  const handleConfirmDelete = () => {
    onDelete(task.id);
    setShowDeleteModal(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleNoteSave = (content) => {
    setNote(content);
    onEdit(task.id, { ...task, note: content });
  };

  return (
    <>
      <div className="bg-gray-800 border border-gray-700 rounded-md p-4 group relative">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="text-white font-semibold mb-1">{task.title}</div>
            <div className="text-gray-400 text-xs flex items-center gap-2">
              <span>{task.date}</span>
              <span>•</span>
              <span>{task.timeEstimate}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span>•</span>
              <span className="text-gray-500">{task.category}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onMouseDown={() => setIsNoteModalOpen(true)}
              className="text-gray-400 hover:text-white p-1"
              title="Edit Note"
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
                className="w-4 h-4"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              ref={buttonRef}
              onPointerDown={handleMenuClick}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity p-1"
            >
              ⋮
            </button>
          </div>
        </div>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-full mt-1 bg-gray-700 rounded-md shadow-lg z-50 min-w-[120px]"
            style={{ transform: 'translateY(4px)' }}
          >
            <button
              onPointerDown={handleEdit}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-600 first:rounded-t-md"
            >
              Edit
            </button>
            <button
              onPointerDown={handleDelete}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600 last:rounded-b-md"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)}>
        <h2 className="text-xl font-bold text-white mb-4">Edit Task</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
            placeholder="Task title"
          />
          <input
            type="date"
            value={editedTask.date}
            onChange={(e) => setEditedTask({ ...editedTask, date: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
          />
          <input
            type="text"
            value={editedTask.timeEstimate}
            onChange={(e) => setEditedTask({ ...editedTask, timeEstimate: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
            placeholder="Time estimate"
          />
          <select
            value={editedTask.priority}
            onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <select
            value={editedTask.category}
            onChange={(e) => setEditedTask({ ...editedTask, category: e.target.value })}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onPointerDown={() => setShowEditModal(false)}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onPointerDown={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h2 className="text-xl font-bold text-white mb-4">Delete Task</h2>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this task? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>

      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        note={note}
        onSave={handleNoteSave}
      />
    </>
  );
};

const SortableTaskItem = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-2"
    >
      <TaskItem
        task={task}
        onEdit={(id, updatedTask) => onEdit(id, updatedTask)}
        onDelete={(id) => onDelete(id)}
      />
    </div>
  );
};

const SlideDown = ({ children, isOpen }) => {
  const ref = useRef(null);
  const [height, setHeight] = useState('0px');

  useEffect(() => {
    if (ref.current) {
      setHeight(isOpen ? `${ref.current.scrollHeight}px` : '0px');
    }
  }, [isOpen]);

  return (
    <div
      ref={ref}
      style={{
        height,
        overflow: 'hidden',
        transition: 'height 300ms ease'
      }}
    >
      {children}
    </div>
  );
};

const BoardSection = ({ id, title, tasks, onAddTask, onEditTask, onDeleteTask }) => {
  const { setNodeRef } = useDroppable({ id });

  // State for form inputs
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [taskPriority, setTaskPriority] = useState('Low');
  const [taskCategory, setTaskCategory] = useState(id);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showSearch, setShowSearch] = useState(false);

  const handleAddClick = () => {
    if (!taskTitle.trim()) return;

    onAddTask(taskCategory, {
      id: `task-${Date.now()}`,
      title: taskTitle.trim(),
      date: taskDate || 'No Date',
      timeEstimate: timeEstimate || 'N/A',
      priority: taskPriority,
      category: taskCategory
    });

    setTaskTitle('');
    setTaskDate('');
    setTimeEstimate('');
    setTaskPriority('Low');
    setTaskCategory(id);
    setShowAddModal(false);
  };

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;
    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Clear search and filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setPriorityFilter('All');
    setCategoryFilter('All');
  };

  return (
    <div className="min-w-[320px] h-[600px] p-6 rounded-lg bg-gray-900 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>

        <div className="flex items-center gap-2">
          {/* Search Toggle Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-md transition-colors ${
              showSearch ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            aria-label="Toggle search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setShowAddModal(true)}
            aria-label="Add task"
            className="text-white hover:text-blue-400 transition"
            style={{ fontSize: '24px', lineHeight: 1 }}
          >
            +
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div
        className={`space-y-2 mb-4 transition-all duration-300 ease-in-out overflow-hidden ${
          showSearch ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full p-2 pl-10 rounded-md bg-gray-700 text-white placeholder-gray-400"
          />
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
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="flex-1 p-2 rounded-md bg-gray-700 text-white"
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 p-2 rounded-md bg-gray-700 text-white"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {(searchQuery || priorityFilter !== 'All' || categoryFilter !== 'All') && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            Clear filters
          </button>
        )}
      </div>

      <div className="text-gray-400 text-sm mb-4">
        {filteredTasks.length} of {tasks.length} tasks
      </div>

      <div className="flex-1 overflow-y-auto">
        <SortableContext
          items={filteredTasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef}>
            {filteredTasks.map((task) => (
              <SortableTaskItem
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <h2 className="text-xl font-bold text-white mb-4">Add New Task</h2>
        <div className="space-y-4">
          <input
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
            placeholder="Task title"
            autoFocus
          />
          <input
            type="date"
            value={taskDate}
            onChange={(e) => setTaskDate(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
          />
          <input
            type="text"
            value={timeEstimate}
            onChange={(e) => setTimeEstimate(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
            placeholder="Time estimate (e.g. 2hr)"
          />
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          <select
            value={taskCategory}
            onChange={(e) => setTaskCategory(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 text-white"
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleAddClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const App = () => {
  const [items, setItems] = useState(initialData);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = (id) => {
    if (id in items) return id;
    return Object.keys(items).find((key) =>
      items[key].some((task) => task.id === id)
    );
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  const handleDragOver = (event) => {
    const { active, over } = event;
    const overId = over?.id;
    if (!overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setItems((items) => {
      const activeItems = items[activeContainer];
      const overItems = items[overContainer];
      const activeIndex = activeItems.findIndex((task) => task.id === active.id);
      const overIndex = overItems.findIndex((task) => task.id === overId);

      return {
        ...items,
        [activeContainer]: activeItems.filter((task) => task.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, overIndex),
          activeItems[activeIndex],
          ...overItems.slice(overIndex),
        ],
      };
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer !== overContainer) {
      setActiveId(null);
      return;
    }

    const activeIndex = items[activeContainer].findIndex((task) => task.id === active.id);
    const overIndex = items[overContainer].findIndex((task) => task.id === over.id);

    if (activeIndex !== overIndex) {
      setItems((items) => ({
        ...items,
        [overContainer]: arrayMove(items[overContainer], activeIndex, overIndex),
      }));
    }

    setActiveId(null);
  };

  const handleAddTask = (category, newTask) => {
    setItems((items) => ({
      ...items,
      [category]: [...items[category], newTask],
    }));
  };

  const handleEditTask = (taskId, updatedTask) => {
    setItems((items) => {
      const newItems = { ...items };
      Object.keys(newItems).forEach((category) => {
        newItems[category] = newItems[category].map((task) =>
          task.id === taskId ? updatedTask : task
        );
      });
      return newItems;
    });
  };

  const handleDeleteTask = (taskId) => {
    setItems((items) => {
      const newItems = { ...items };
      Object.keys(newItems).forEach((category) => {
        newItems[category] = newItems[category].filter((task) => task.id !== taskId);
      });
      return newItems;
    });
  };

  const activeTask = activeId
    ? Object.values(items).flat().find((task) => task.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-4">
        {CATEGORIES.map((category) => (
          <BoardSection
            key={category}
            id={category}
            title={category}
            tasks={items[category]}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <TaskItem
            task={activeTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default App;


