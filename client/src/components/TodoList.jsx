import { useState, useEffect, useContext } from 'react';
import '../styles/TodoList.css';
import Navbar from './Navbar';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../config/constants';

const API_BASE_URL = `${API_URL}/api/todolist/tasks`;

const CATEGORIES = [
  { key: 'all', label: 'All Tasks' },
  { key: 'building', label: 'Building' },
  { key: 'crafting', label: 'Crafting' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'farming', label: 'Farming' }
];

const PRIORITIES = ['low', 'medium', 'high'];

// API Service Functions
const todoApi = {
  getAllTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const response = await axios.get(`${API_BASE_URL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.tasks;
  },

  getTaskCounts: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/amount`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get task counts error:', error.response?.data || error.message);
      throw error;
    }
  },

  createTask: async (taskData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}`, {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        startDate: new Date(taskData.startDate),
        endDate: new Date(taskData.endDate),
        status: "pending",
        userID: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user_id : null
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create task error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${id}`, {
        title: taskData.title,
        description: taskData.description,
        category: taskData.category,
        priority: taskData.priority,
        startDate: new Date(taskData.startDate),
        endDate: new Date(taskData.endDate)
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update task error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Delete task error:', error.response?.data || error.message);
      throw error;
    }
  },

  markComplete: async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/${id}/complete`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Complete task error:', error.response?.data || error.message);
      throw error;
    }
  },

  markUncomplete: async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/${id}/uncomplete`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Uncomplete task error:', error.response?.data || error.message);
      throw error;
    }
  }
};

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [taskCounts, setTaskCounts] = useState({ pending: "0", late: "0", complete: "0" });
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentSort, setCurrentSort] = useState('date');
  const [currentTask, setCurrentTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [detailsWidth, setDetailsWidth] = useState(400);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load tasks from API
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        category: currentCategory !== 'all' ? currentCategory : undefined,
        priority: selectedPriority || undefined,
        search: searchTerm || undefined,
        status: selectedStatus || undefined
      };
      
      const [fetchedTasks, counts] = await Promise.all([
        todoApi.getAllTasks(filters),
        todoApi.getTaskCounts()
      ]);
      
      setTasks(fetchedTasks || []);
      setTaskCounts(counts);
    } catch (err) {
      setError('Failed to load tasks');
      console.error('Error loading tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load calendar tasks
  const loadCalendarTasks = async () => {
    try {
      const calendarTasks = await todoApi.getAllTasks({ status: 'pending' });
      setCalendarTasks(calendarTasks || []);
    } catch (err) {
      console.error('Error loading calendar tasks:', err);
      setCalendarTasks([]);
    }
  };

  // Initial load
  useEffect(() => {
    loadTasks();
    loadCalendarTasks();
  }, []);

  // Reload when filters change
  useEffect(() => {
    if (!loading) {
      loadTasks();
    }
  }, [currentCategory, selectedPriority, searchTerm, selectedStatus]);

  const handlePriorityClick = (priority) => {
    setSelectedPriority(prev => prev === priority ? '' : priority);
  };

  const handleStatusClick = (status) => {
    setSelectedStatus(prev => prev === status ? '' : status);
  };

  // Filter Functions
  const filterTasksBySearch = (taskList) => {
    if (!searchTerm) return taskList;
    const searchLower = searchTerm.toLowerCase();
    return taskList.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower) ||
      task.category.toLowerCase().includes(searchLower)
    );
  };

  const filterTasksByCategory = (taskList) => {
    if (currentCategory === 'all') return taskList;
    return taskList.filter(task => task.category === currentCategory);
  };

  const filterTasksByPriority = (taskList) => {
    if (!selectedPriority) return taskList;
    return taskList.filter(task => task.priority === selectedPriority);
  };

  // Sorting Tasks
  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      switch (currentSort) {
        case 'date':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          return priorityDiff !== 0 ? priorityDiff : new Date(a.endDate) - new Date(b.endDate);
        case 'category':
          const categoryDiff = a.category.localeCompare(b.category);
          return categoryDiff !== 0 ? categoryDiff : new Date(a.endDate) - new Date(b.endDate);
        default:
          return new Date(a.endDate) - new Date(b.endDate);
      }
    });
  };

  // Apply all filters and sorting
  const getFilteredAndSortedTasks = (taskList) => {
    let filtered = [...taskList];
    
    if (searchTerm) {
      filtered = filterTasksBySearch(filtered);
    }
    
    if (currentCategory !== 'all') {
      filtered = filterTasksByCategory(filtered);
    }
    
    if (selectedPriority) {
      filtered = filterTasksByPriority(filtered);
    }
    
    return sortTasks(filtered);
  };

  // Task Management Functions
  const addTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      if (editingTask) {
        await todoApi.updateTask(editingTask.id, taskData);
      } else {
        await todoApi.createTask(taskData);
      }
      await loadTasks();
      setShowModal(false);
      setEditingTask(null);
    } catch (err) {
      if (err.response?.status === 500) {
        setError('This title name already exists');
      } else {
        setError(err.response?.data?.error || 'Failed to save task');
      }
      console.error('Error saving task:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      setError(null);
      await todoApi.deleteTask(taskId);
      await loadTasks();
      setCurrentTask(null);
      setShowDeleteConfirmation(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task');
      console.error('Error deleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (task) => {
    try {
      setLoading(true);
      setError(null);
      await todoApi.markComplete(task.id);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete task');
      console.error('Error completing task:', err);
    } finally {
      setLoading(false);
    }
  };

  const uncompleteTask = async (task) => {
    try {
      setLoading(true);
      setError(null);
      await todoApi.markUncomplete(task.id);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to uncomplete task');
      console.error('Error uncompleting task:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirmation(true);
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleResizeMove = (e) => {
    if (!isResizing) return;
    
    const mainArea = document.querySelector('.todo-main-area');
    const mainAreaRect = mainArea.getBoundingClientRect();
    const newWidth = mainAreaRect.right - e.clientX;
    
    if (newWidth >= 320 && newWidth <= 800) {
      setDetailsWidth(newWidth);
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getTasksForDate = (date) => {
    return calendarTasks.filter(task => {
      const taskDate = new Date(task.startDate);
      return taskDate.getDate() === date.getDate() &&
             taskDate.getMonth() === date.getMonth() &&
             taskDate.getFullYear() === date.getFullYear();
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const tasksForDate = getTasksForDate(date);
      const hasTasks = tasksForDate.length > 0;
      
      // Format task titles with numbers if there are multiple tasks
      const taskTitles = hasTasks 
        ? tasksForDate.map((task, index) => 
            tasksForDate.length > 1 
              ? `${index + 1}. ${task.title}`
              : task.title
          ).join('\n')
        : '';
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(date) ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}`}
          onClick={() => {
            if (hasTasks) {
              setCurrentTask(tasksForDate[0]);
            }
          }}
          title={taskTitles}
        >
          {day}
          {hasTasks && <span className="task-dot"></span>}
        </div>
      );
    }

    return days;
  };

  const renderTaskItem = (task) => (
    <div
      key={task.id}
      className={`todo-task-item ${task.status === 'complete' ? 'completed' : ''} ${currentTask?.id === task.id ? 'active' : ''} ${task.status === 'late' ? 'late' : ''}`}
      onClick={() => setCurrentTask(task)}
    >
      <h3>{task.title}</h3>
      <p>{task.category} - {task.priority} priority</p>
      <small>
        {task.status === 'complete' 
          ? `Completed: ${new Date(task.completedDate).toLocaleDateString()}`
          : `End: ${new Date(task.endDate).toLocaleDateString()}`
        }
      </small>
    </div>
  );

  return (
    <div className="todo-page">
      <Navbar />
      <div className="todo-layout">
        {/* Sidebar */}
        <aside className="todo-sidebar">
          {/* Categories Section */}
          <div className="todo-sidebar-section">
            <h3>Categories</h3>
            <div className="todo-category-buttons">
              {CATEGORIES.map(category => (
                <button
                  key={category.key}
                  className={`todo-category-btn ${currentCategory === category.key ? 'active' : ''}`}
                  onClick={() => setCurrentCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Section */}
          <div className="todo-sidebar-section">
            <h3>Priority</h3>
            <div className="todo-priority-list">
              {PRIORITIES.map(priority => (
                <span
                  key={priority}
                  className={`todo-priority-item ${selectedPriority === priority ? 'selected' : ''}`}
                  onClick={() => handlePriorityClick(priority)}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Task Status Section */}
          <div className="todo-sidebar-section">
            <h3>Task Status</h3>
            <div className="todo-status-filters">
              <button
                className={`todo-pending-btn ${selectedStatus === 'pending' ? 'active' : ''}`}
                onClick={() => handleStatusClick('pending')}
              >
                <span className="todo-pending-count">
                  {taskCounts.pending}
                </span>
                <span className="todo-pending-label">In progress tasks</span>
              </button>
              <button
                className={`todo-late-btn ${selectedStatus === 'late' ? 'active' : ''}`}
                onClick={() => handleStatusClick('late')}
              >
                <span className="todo-late-count">
                  {taskCounts.late}
                </span>
                <span className="todo-late-label">Late tasks</span>
              </button>
              <button
                className={`todo-complete-btn ${selectedStatus === 'complete' ? 'active' : ''}`}
                onClick={() => handleStatusClick('complete')}
              >
                <span className="todo-complete-count">
                  {taskCounts.complete}
                </span>
                <span className="todo-complete-label">Completed tasks</span>
              </button>
            </div>
          </div>

          {/* Calendar Button */}
          <div className="todo-sidebar-section">
            <button 
              className="todo-calendar-btn"
              onClick={() => setShowCalendar(true)}
            >
              <span className="calendar-icon">📅</span>
              <span>View Calendar</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className={`todo-main-area ${currentTask ? 'show-details' : ''}`}>
          <main className="todo-main-list">
            {/* Header */}
            <div className="todo-header">
              <h1>To do list - Minecraft</h1>
              <div className="todo-button-container">
                <input
                  type="text"
                  className="todo-search"
                  placeholder="Search tasks"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="todo-add-btn" onClick={() => setShowModal(true)}>
                  + New Task
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="todo-error-message">
                {error}
              </div>
            )}

            {/* Tasks Section */}
            <div className="todo-tasks-section">
              <div className="todo-tasks-header">
                <h2>
                  {selectedStatus ? `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Tasks` : 
                   searchTerm ? 'Search Results' : 'Tasks'}
                </h2>
                <div className="todo-task-filters">
                  <select
                    value={currentSort}
                    onChange={(e) => setCurrentSort(e.target.value)}
                  >
                    <option value="date">Sort by Date</option>
                    <option value="priority">Sort by Priority</option>
                    <option value="category">Sort by Category</option>
                  </select>
                </div>
              </div>

              {/* Task List */}
              <div className="todo-tasks-list">
                {loading ? (
                  <div className="todo-loading-container">
                    <p className="todo-loading">Loading...</p>
                  </div>
                ) : error ? (
                  <div className="todo-error-container">
                    <p className="todo-error">{error}</p>
                  </div>
                ) : getFilteredAndSortedTasks(tasks).length === 0 ? (
                  <div className="todo-empty-container">
                    <p className="todo-no-tasks">
                      {searchTerm ? 'No tasks match your search' :
                       selectedPriority ? 'No tasks match the selected priority' :
                       currentCategory !== 'all' ? 'No tasks in this category' :
                       'No tasks found'}
                    </p>
                  </div>
                ) : (
                  getFilteredAndSortedTasks(tasks).map(task => renderTaskItem(task))
                )}
              </div>
            </div>
          </main>

          {/* Task Details */}
          <section className="todo-details" style={{ width: `${detailsWidth}px` }}>
            <div 
              className="todo-resize-handle"
              onMouseDown={handleResizeStart}
            ></div>
            <h2>Task Details</h2>
            <div className="todo-details-content">
              {currentTask ? (
                <div className="todo-task-info">
                  <div className="todo-task-title">{currentTask.title}</div>
                  <div className="todo-task-category">{currentTask.category}</div>
                  <div className="todo-task-dates">
                    <div className="todo-start-date">Start: {new Date(currentTask.startDate).toLocaleDateString()}</div>
                    <div className="todo-end-date">End: {new Date(currentTask.endDate).toLocaleDateString()}</div>
                    {currentTask.status === 'complete' && (
                      <div className="todo-completed-date">
                        Completed: {new Date(currentTask.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="todo-task-description">
                    {currentTask.description || 'No description'}
                  </div>
                  <div className="todo-task-actions">
                    <button className="todo-edit-btn" onClick={() => handleEditTask(currentTask)}>Edit</button>
                    {currentTask.status !== 'complete' && (
                      <button className="todo-complete-btn" onClick={() => completeTask(currentTask)}>Complete</button>
                    )}
                    {currentTask.status === 'complete' && (
                      <button className="todo-uncomplete-btn" onClick={() => uncompleteTask(currentTask)}>Uncomplete</button>
                    )}
                    <button className="todo-delete-btn" onClick={() => handleDeleteClick(currentTask)}>Delete</button>
                    <button className="todo-back-btn" onClick={() => setCurrentTask(null)}>Back</button>
                  </div>
                </div>
              ) : (
                <div className="todo-no-task-selected">
                  <p>Select a task to view details</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Task Form Modal */}
      {showModal && (
        <TaskFormModal
          task={editingTask}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
            setError(null);
          }}
          onSave={addTask}
          error={error}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="todo-confirmation-dialog">
          <div className="todo-confirmation-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this task?</p>
            <div className="todo-confirmation-buttons">
              <button className="todo-confirm-delete" onClick={() => deleteTask(taskToDelete.id)}>Delete</button>
              <button className="todo-cancel-delete" onClick={() => setShowDeleteConfirmation(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="calendar-modal" onClick={e => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h2>Calendar</h2>
              <button className="calendar-close-btn" onClick={() => setShowCalendar(false)}>×</button>
            </div>
            <div className="calendar-modal-content">
              <div className="calendar-controls">
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                  ←
                </button>
                <span>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                  →
                </button>
              </div>
              <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                {renderCalendar()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Task Form Modal Component
const TaskFormModal = ({ task, onClose, onSave, error }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    category: task?.category || '',
    startDate: task?.startDate || '',
    endDate: task?.endDate || '',
    priority: task?.priority || '',
    description: task?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="todo-modal" onClick={onClose}>
      <div className="todo-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="todo-modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="todo-close-modal" onClick={onClose}>&times;</button>
        </div>
        {error && (
          <div className="todo-modal-error">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="todo-form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {CATEGORIES.filter(cat => cat.key !== 'all').map(category => (
                <option key={category.key} value={category.key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="todo-form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="6"
            />
          </div>
          <div className="todo-form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="">Select priority</option>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="todo-form-actions">
            <button type="button" className="todo-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="todo-save-btn">Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoList;