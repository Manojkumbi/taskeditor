import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Search, Plus, Edit3, Trash2, Tag, BarChart3, Moon, Sun, Shuffle, CheckSquare, Square, Clock, Filter } from 'lucide-react';

const App = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showTaskEditor, setShowTaskEditor] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [darkMode]);


  async function openFile() {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'JSON Files',
        accept: {
          'application/json': ['.json']
        }
      }
    ],
    excludeAcceptAllOption: true,
    multiple: false
  });

  const file = await fileHandle.getFile();
  const content = await file.text();

  try {
    const json = JSON.parse(content); // Validate JSON
    console.log("Parsed JSON:", json);
    setJournalEntries(json);
  } catch (err) {
    console.error("Invalid JSON file:", err);
    alert("The selected file is not a valid JSON.");
  }
}


  // Journal entries data
  const [journalEntries, setJournalEntries] = useState([
    {
      id: "1748774533500",
      timestamp: "2025-06-01T10:42:13.633Z",
      date: "2025-06-01",
      time: "16:12:13",
      entry: "Today went well. I finished my tasks on time. #productive",
      tags: ["productive"],
      word_count: 10
    }
  ]);

  // Tasks data
  const [tasks, setTasks] = useState([
    {
      id: "task_1",
      title: "Complete project proposal",
      description: "Finish writing the Q2 project proposal",
      completed: false,
      priority: "high",
      dueDate: "2025-06-08",
      createdAt: "2025-06-07T10:00:00.000Z",
      tags: ["work", "urgent"]
    }
  ]);

  // Form states
  const [newEntry, setNewEntry] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: []
  });

  // Helper functions
  const extractTags = (text) => {
    const tagRegex = /#[\w]+/g;
    const matches = text.match(tagRegex);
    return matches ? matches.map(tag => tag.substring(1)) : [];
  };

  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString();
  };

  // Computed values
  const allTags = useMemo(() => {
    const journalTags = journalEntries.flatMap(entry => entry.tags);
    const taskTags = tasks.flatMap(task => task.tags || []);
    return [...new Set([...journalTags, ...taskTags])];
  }, [journalEntries, tasks]);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter(entry => {
      const matchesSearch = !searchQuery || 
        entry.entry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDate = !selectedDate || entry.date === selectedDate;
      const matchesTag = !selectedTag || entry.tags.includes(selectedTag);
      return matchesSearch && matchesDate && matchesTag;
    });
  }, [journalEntries, searchQuery, selectedDate, selectedTag]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesTag = !selectedTag || (task.tags && task.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [tasks, searchQuery, selectedTag]);

  const stats = useMemo(() => {
    const totalEntries = journalEntries.length;
    const totalWords = journalEntries.reduce((sum, entry) => sum + entry.word_count, 0);
    const tagCounts = journalEntries.flatMap(entry => entry.tags)
      .reduce((acc, tag) => ({ ...acc, [tag]: (acc[tag] || 0) + 1 }), {});
    const mostUsedTag = Object.keys(tagCounts).reduce((a, b) => 
      tagCounts[a] > tagCounts[b] ? a : b, '');
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = tasks.length - completedTasks;
    
    return { 
      totalEntries, 
      totalWords, 
      mostUsedTag, 
      completedTasks, 
      pendingTasks,
      totalTasks: tasks.length
    };
  }, [journalEntries, tasks]);

  // CRUD operations for journal entries
  const saveEntry = () => {
    const tags = extractTags(newEntry);
    const wordCount = countWords(newEntry);
    const now = new Date();
    
    const entry = {
      id: editingEntry ? editingEntry.id : Date.now().toString(),
      timestamp: editingEntry ? editingEntry.timestamp : now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('en-GB'),
      entry: newEntry,
      tags,
      word_count: wordCount
    };

    if (editingEntry) {
      setJournalEntries(prev => prev.map(e => e.id === editingEntry.id ? entry : e));
    } else {
      setJournalEntries(prev => [entry, ...prev]);
    }

    setNewEntry('');
    setShowEditor(false);
    setEditingEntry(null);
  };

  const deleteEntry = (id) => {
    setJournalEntries(prev => prev.filter(e => e.id !== id));
  };

  const editEntry = (entry) => {
    setEditingEntry(entry);
    setNewEntry(entry.entry);
    setShowEditor(true);
  };

  // CRUD operations for tasks
  const saveTask = () => {
    const task = {
      id: editingTask ? editingTask.id : `task_${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      completed: editingTask ? editingTask.completed : false,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      tags: newTask.tags
    };

    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? task : t));
    } else {
      setTasks(prev => [task, ...prev]);
    }

    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', tags: [] });
    setShowTaskEditor(false);
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const editTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      tags: task.tags || []
    });
    setShowTaskEditor(true);
  };

  const getRandomEntry = () => {
    if (journalEntries.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * journalEntries.length);
    return journalEntries[randomIndex];
  };

  const exportData = () => {
    const data = {
      journalEntries,
      tasks,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-tasks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const themeClasses = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardClasses = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';
  const inputClasses = darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300';

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors duration-200`}>
      {/* Header */}
      <header className={`${cardClasses} border-b px-6 py-4`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Personal Manager</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={openFile}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Import Data
            </button>
            
            <button
              onClick={exportData}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export Data
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 ${cardClasses} border-r min-h-screen`}>
          <nav className="p-4">
            <div className="space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                { id: 'journal', label: 'Journal', icon: Edit3 },
                { id: 'calendar', label: 'Calendar', icon: Calendar },
                { id: 'stats', label: 'Statistics', icon: BarChart3 },
                { id: 'random', label: 'Random Entry', icon: Shuffle }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-left hover:bg-gray-200 dark:hover:bg-gray-700 ${
                    activeTab === id ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Tag size={14} />
                  Tags
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedTag('')}
                    className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                      !selectedTag ? 'bg-gray-200 text-black dark:bg-gray-700' : ''
                    }`}
                  >
                    All
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                      className={`block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                        selectedTag === tag ? 'bg-gray-200 text-black dark:text-white dark:bg-gray-700' : ''
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search entries, tasks, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${inputClasses}`}
              />
            </div>
          </div>

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${cardClasses} border rounded-lg p-4`}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entries</h3>
                  <p className="text-2xl font-bold">{stats.totalEntries}</p>
                </div>
                <div className={`${cardClasses} border rounded-lg p-4`}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Words</h3>
                  <p className="text-2xl font-bold">{stats.totalWords}</p>
                </div>
                <div className={`${cardClasses} border rounded-lg p-4`}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tasks Completed</h3>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <div className={`${cardClasses} border rounded-lg p-4`}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Tasks</h3>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
                </div>
              </div>

              {/* Recent entries */}
              <div className={`${cardClasses} border rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Journal Entries</h2>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Plus size={16} />
                    New Entry
                  </button>
                </div>
                <div className="space-y-4">
                  {filteredEntries.slice(0, 5).map(entry => (
                    <div key={entry.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <span>{formatDate(entry.date)}</span>
                            <span>•</span>
                            <span>{entry.time}</span>
                            <span>•</span>
                            <span>{entry.word_count} words</span>
                          </div>
                          <p className=" dark:text-gray-50 line-clamp-2">{entry.entry}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {entry.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button onClick={() => editEntry(entry)} className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => deleteEntry(entry.id)} className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent tasks */}
              <div className={`${cardClasses} border rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Tasks</h2>
                  <button
                    onClick={() => setShowTaskEditor(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <Plus size={16} />
                    New Task
                  </button>
                </div>
                <div className="space-y-3">
                  {filteredTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-sm  dark:text-gray-400">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock size={12} />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.tags && task.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => editTask(task)} className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tasks tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tasks</h2>
                <button
                  onClick={() => setShowTaskEditor(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Plus size={16} />
                  New Task
                </button>
              </div>

              <div className="space-y-3">
                {filteredTasks.map(task => (
                  <div key={task.id} className={`${cardClasses} border rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`mt-1 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}
                      >
                        {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                      </button>
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={`px-2 py-1 text-sm rounded ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Clock size={14} />
                              Due: {formatDate(task.dueDate)}
                            </span>
                          )}
                          {task.tags && task.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => editTask(task)} className="p-2 text-gray-400 hover:text-blue-600">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Journal tab */}
          {activeTab === 'journal' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Journal Entries</h2>
                <button
                  onClick={() => setShowEditor(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus size={16} />
                  New Entry
                </button>
              </div>

              <div className="space-y-4">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className={`${cardClasses} border rounded-lg p-6`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{formatDate(entry.date)}</span>
                        <span>•</span>
                        <span>{entry.time}</span>
                        <span>•</span>
                        <span>{entry.word_count} words</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => editEntry(entry)} className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => deleteEntry(entry.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{entry.entry}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      {entry.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar tab */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Calendar View</h2>
              <div className={`${cardClasses} border rounded-lg p-6`}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`${inputClasses} px-3 py-2 border rounded mb-4`}
                />
                {selectedDate && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Entries for {formatDate(selectedDate)}</h3>
                    {filteredEntries.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400">No entries for this date.</p>
                    ) : (
                      filteredEntries.map(entry => (
                        <div key={entry.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-gray-700 dark:text-gray-300">{entry.entry}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {entry.tags.map(tag => (
                                  <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button onClick={() => editEntry(entry)} className="p-1 text-gray-400 hover:text-blue-600">
                                <Edit3 size={14} />
                              </button>
                              <button onClick={() => deleteEntry(entry.id)} className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Statistics tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${cardClasses} border rounded-lg p-6`}>
                  <h3 className="text-lg font-semibold mb-4">Journal Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Entries:</span>
                      <span className="font-semibold">{stats.totalEntries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Words:</span>
                      <span className="font-semibold">{stats.totalWords}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Words per Entry:</span>
                      <span className="font-semibold">{stats.totalEntries > 0 ? Math.round(stats.totalWords / stats.totalEntries) : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Used Tag:</span>
                      <span className="font-semibold">#{stats.mostUsedTag || 'None'}</span>
                    </div>
                  </div>
                </div>
                <div className={`${cardClasses} border rounded-lg p-6`}>
                  <h3 className="text-lg font-semibold mb-4">Task Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Tasks:</span>
                      <span className="font-semibold">{stats.totalTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-semibold text-green-600">{stats.completedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-orange-600">{stats.pendingTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completion Rate:</span>
                      <span className="font-semibold">{stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Random entry tab */}
          {activeTab === 'random' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Random Entry</h2>
                <button
                  onClick={() => {
                    const randomEntry = getRandomEntry();
                    if (randomEntry) {
                      setEditingEntry(randomEntry);
                      setActiveTab('journal');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  <Shuffle size={16} />
                  Get Random Entry
                </button>
              </div>
              {(() => {
                const randomEntry = getRandomEntry();
                return randomEntry ? (
                  <div className={`${cardClasses} border rounded-lg p-6`}>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>{formatDate(randomEntry.date)}</span>
                      <span>•</span>
                      <span>{randomEntry.time}</span>
                      <span>•</span>
                      <span>{randomEntry.word_count} words</span>
                    </div>
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{randomEntry.entry}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      {randomEntry.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={`${cardClasses} border rounded-lg p-6`}>
                    <p className="text-gray-500 dark:text-gray-400">No journal entries available.</p>
                  </div>
                );
              })()}
            </div>
          )}
        </main>
      </div>

      {/* Journal Entry Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardClasses} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write your journal entry here... Use #tags to add tags"
                className={`w-full h-64 p-3 border rounded-lg resize-none ${inputClasses}`}
              />
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Words: {countWords(newEntry)}</span>
                <span>Tags: {extractTags(newEntry).join(', ')}</span>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingEntry(null);
                  setNewEntry('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveEntry}
                disabled={!newEntry.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingEntry ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Editor Modal */}
      {showTaskEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${cardClasses} rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">
                {editingTask ? 'Edit Task' : 'New Task'}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className={`w-full p-3 border rounded-lg ${inputClasses}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                  className={`w-full h-24 p-3 border rounded-lg resize-none ${inputClasses}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className={`w-full p-3 border rounded-lg ${inputClasses}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className={`w-full p-3 border rounded-lg ${inputClasses}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTask.tags.join(', ')}
                  onChange={(e) => setNewTask({ 
                    ...newTask, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                  })}
                  placeholder="work, urgent, personal"
                  className={`w-full p-3 border rounded-lg ${inputClasses}`}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTaskEditor(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', tags: [] });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={saveTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingTask ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;