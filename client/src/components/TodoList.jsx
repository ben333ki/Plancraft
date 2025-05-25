import { useState, useEffect } from 'react';
import '../styles/TodoList.css';
import Navbar from './Navbar';

const CATEGORIES = [
  { key: 'all', label: 'All Tasks' },
  { key: 'building', label: 'Building' },
  { key: 'crafting', label: 'Crafting' },
  { key: 'exploration', label: 'Exploration' },
  { key: 'farming', label: 'Farming' }
];

const PRIORITIES = ['low', 'medium', 'high'];



const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentSort, setCurrentSort] = useState('date');
  const [currentTask, setCurrentTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [showLateOnly, setShowLateOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  // Load saved tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('minecraftTasks');
    const savedCompletedTasks = localStorage.getItem('minecraftCompletedTasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCompletedTasks) setCompletedTasks(JSON.parse(savedCompletedTasks));
  }, []);

  // Storage
  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('minecraftTasks', JSON.stringify(newTasks));
  };

  const saveCompletedTasks = (newCompletedTasks) => {
    setCompletedTasks(newCompletedTasks);
    localStorage.setItem('minecraftCompletedTasks', JSON.stringify(newCompletedTasks));
  };

  // Task Status Functions
  const getLateTasks = () => {
    const now = new Date();
    return tasks.filter(task => new Date(task.endDate) < now);
  };

  const togglePriority = (priority) => {
    setSelectedPriorities(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // Filter Functions
  const filterTasksBySearch = (taskList) => {
    if (!searchTerm) return taskList;
    return taskList.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterTasksByCategory = (taskList) => {
    if (currentCategory === 'all') return taskList;
    return taskList.filter(task => task.category === currentCategory);
  };

  const filterTasksByPriority = (taskList) => {
    if (selectedPriorities.length === 0) return taskList;
    return taskList.filter(task => selectedPriorities.includes(task.priority));
  };

  // Sorting Tasks
  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      let primarySort = 0;
      switch (currentSort) {
        case 'date':
          primarySort = new Date(a.endDate) - new Date(b.endDate);
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          primarySort = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'category':
          primarySort = a.category.localeCompare(b.category);
          break;
        default:
          return 0;
      }
      return primarySort === 0 ? new Date(a.endDate) - new Date(b.endDate) : primarySort;
    });
  };

  // Apply all filters and sorting
  const getFilteredAndSortedTasks = (taskList) => {
    let filtered = taskList;
    filtered = filterTasksBySearch(filtered);
    filtered = filterTasksByCategory(filtered);
    filtered = filterTasksByPriority(filtered);
    return sortTasks(filtered);
  };

  // Get filtered and sorted tasks for each status
  const filteredActiveTasks = getFilteredAndSortedTasks(tasks);
  const filteredLateTasks = getFilteredAndSortedTasks(getLateTasks());
  const filteredCompletedTasks = getFilteredAndSortedTasks(completedTasks);

  // Task Management Functions
  const addTask = (taskData) => {
    const newTask = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      ...taskData,
      pinned: editingTask ? editingTask.pinned : false
    };

    if (showCompletedOnly) {
      const newCompletedTasks = completedTasks.map(task => 
        task.id === editingTask.id ? newTask : task
      );
      saveCompletedTasks(newCompletedTasks);
    } else {
      const newTasks = editingTask
        ? tasks.map(task => task.id === editingTask.id ? newTask : task)
        : [...tasks, newTask];
      saveTasks(newTasks);
    }

    setShowModal(false);
    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    if (showCompletedOnly) {
      const newCompletedTasks = completedTasks.filter(task => task.id !== taskId);
      saveCompletedTasks(newCompletedTasks);
    } else {
      const newTasks = tasks.filter(task => task.id !== taskId);
      saveTasks(newTasks);
    }
    setCurrentTask(null);
    setShowDeleteConfirmation(false);
    setTaskToDelete(null);
  };

  const completeTask = (task) => {
    const taskWithCompletionDate = {
      ...task,
      completedDate: new Date().toISOString()
    };
    saveCompletedTasks([...completedTasks, taskWithCompletionDate]);
    deleteTask(task.id);
  };

  const uncompleteTask = (task) => {
    const { completedDate, ...taskWithoutCompletionDate } = task;
    saveTasks([...tasks, taskWithoutCompletionDate]);
    saveCompletedTasks(completedTasks.filter(t => t.id !== task.id));
    setCurrentTask(null);
  };

  // Event Handlers
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowDeleteConfirmation(true);
  };

  // Render Functions
  const renderTaskItem = (task, isCompleted = false) => (
    <div
      key={task.id}
      className={`todo-task-item ${isCompleted ? 'completed' : ''} ${currentTask?.id === task.id ? 'active' : ''} ${new Date(task.endDate) < new Date() ? 'late' : ''}`}
      onClick={() => setCurrentTask(task)}
    >
      <h3>{task.title}</h3>
      <p>{task.category} - {task.priority} priority</p>
      <small>
        {isCompleted 
          ? `Completed: ${new Date(task.completedDate).toLocaleDateString()}`
          : `End: ${new Date(task.endDate).toLocaleDateString()}`
        }
      </small>
    </div>
  );

  return (
    <div className="todo-bg">
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
                  className={`todo-priority-item ${selectedPriorities.includes(priority) ? 'selected' : ''}`}
                  onClick={() => togglePriority(priority)}
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
                className={`todo-late-btn ${showLateOnly ? 'active' : ''}`}
                onClick={() => {
                  setShowLateOnly(!showLateOnly);
                  setShowCompletedOnly(false);
                }}
              >
                <span className="todo-late-count">
                  {searchTerm ? 
                    getLateTasks().filter(task => 
                      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      task.category.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length : 
                    getLateTasks().length
                  }
                </span>
                <span className="todo-late-label">Late Tasks</span>
              </button>
              <button
                className={`todo-completed-btn ${showCompletedOnly ? 'active' : ''}`}
                onClick={() => {
                  setShowCompletedOnly(!showCompletedOnly);
                  setShowLateOnly(false);
                }}
              >
                <span className="todo-completed-count">
                  {searchTerm ? 
                    completedTasks.filter(task => 
                      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      task.category.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length : 
                    completedTasks.length
                  }
                </span>
                <span className="todo-completed-label">Completed Tasks</span>
              </button>
            </div>
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

            {/* Tasks Section */}
            <div className="todo-tasks-section">
              <div className="todo-tasks-header">
                <h2>
                  {showLateOnly ? 'Late Tasks' : 
                   showCompletedOnly ? 'Completed Tasks' : 
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
                {showCompletedOnly ? (
                  filteredCompletedTasks.length === 0 ? (
                    <p className="todo-no-tasks">No completed tasks</p>
                  ) : (
                    filteredCompletedTasks.map(task => renderTaskItem(task, true))
                  )
                ) : showLateOnly ? (
                  filteredLateTasks.length === 0 ? (
                    <p className="todo-no-tasks">No late tasks</p>
                  ) : (
                    filteredLateTasks.map(task => renderTaskItem(task))
                  )
                ) : searchTerm ? (
                  <>
                    {filteredActiveTasks.length === 0 && filteredCompletedTasks.length === 0 ? (
                      <p className="todo-no-tasks">No tasks found</p>
                    ) : (
                      <>
                        {filteredActiveTasks.map(task => renderTaskItem(task))}
                        {filteredCompletedTasks.map(task => renderTaskItem(task, true))}
                      </>
                    )}
                  </>
                ) : (
                  filteredActiveTasks.length === 0 ? (
                    <p className="todo-no-tasks">No tasks found</p>
                  ) : (
                    filteredActiveTasks.map(task => renderTaskItem(task))
                  )
                )}
              </div>
            </div>
          </main>

          {/* Task Details */}
          <section className="todo-details">
            <h2>Task Details</h2>
            <div className="todo-details-content">
              {currentTask && (
                <div className="todo-task-info">
                  <div className="todo-task-title">{currentTask.title}</div>
                  <div className="todo-task-category">{currentTask.category}</div>
                  <div className="todo-task-dates">
                    <div className="todo-start-date">Start: {new Date(currentTask.startDate).toLocaleDateString()}</div>
                    <div className="todo-end-date">End: {new Date(currentTask.endDate).toLocaleDateString()}</div>
                    {currentTask.completedDate && (
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
                    {!showCompletedOnly && !currentTask.completedDate && (
                      <button className="todo-complete-btn" onClick={() => completeTask(currentTask)}>Complete</button>
                    )}
                    {currentTask.completedDate && (
                      <button className="todo-uncomplete-btn" onClick={() => uncompleteTask(currentTask)}>Uncomplete</button>
                    )}
                    <button className="todo-delete-btn" onClick={() => handleDeleteClick(currentTask)}>Delete</button>
                    <button className="todo-back-btn" onClick={() => setCurrentTask(null)}>Back</button>
                  </div>
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
          }}
          onSave={addTask}
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
    </div>
  );
};

// Task Form Modal Component
const TaskFormModal = ({ task, onClose, onSave }) => {
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