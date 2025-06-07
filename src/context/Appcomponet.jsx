import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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
    <AppContext.Provider value={{
      activeTab, setActiveTab,
      darkMode, setDarkMode,
      searchQuery, setSearchQuery,
      selectedDate, setSelectedDate,
      selectedTag, setSelectedTag,
      showEditor, setShowEditor,
      editingEntry, setEditingEntry,
      showTaskEditor, setShowTaskEditor,
      editingTask, setEditingTask,
      journalEntries, setJournalEntries,
      tasks, setTasks,
      newEntry, setNewEntry,
      newTask, setNewTask,
      extractTags,
      countWords,
      allTags,
      filteredEntries,
      filteredTasks,
      saveEntry,
      deleteEntry,
      editEntry,
      saveTask,
      deleteTask,
      toggleTask,
      editTask,
      exportData,
      themeClasses,
      cardClasses,
      inputClasses,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
