import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import { FaHome, FaCalendarAlt, FaClock, FaBook, FaChartBar, FaStickyNote, FaBullseye, FaMoon, FaCheckCircle, FaRegClock, FaBookOpen, FaRegStickyNote, FaTrophy, FaTrash, FaPlay, FaPause, FaUndo, FaEdit, FaGithub, FaTwitter, FaUser, FaStar, FaRegStar, FaUserPlus } from 'react-icons/fa';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import './App.css';
import { io } from 'socket.io-client';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

const navItems = [
  { label: 'Dashboard', icon: <FaHome /> },
  { label: 'Study Calendar', icon: <FaCalendarAlt /> },
  { label: 'Pomodoro Timer', icon: <FaClock /> },
  { label: 'Subjects', icon: <FaBook /> },
  { label: 'Progress', icon: <FaChartBar /> },
  { label: 'Notes', icon: <FaStickyNote /> },
  { label: 'Goals & Tasks', icon: <FaBullseye /> },
  { label: 'Habits', icon: <FaCheckCircle /> },
  { label: 'Online Study', icon: <FaUserPlus /> },
];

// Add a set of preset avatar URLs (can be SVGs or PNGs in public folder or data URLs)
const presetAvatars = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=study1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=study2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=study3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=study4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=study5',
];
const defaultAvatar = presetAvatars[0];

const presetAccentColors = [
  '#1976d2', // blue
  '#7c3aed', // purple
  '#e53935', // red
  '#43a047', // green
  '#f59e42', // orange
  '#00bcd4', // teal
  '#ffb300', // gold
];
const defaultAccent = presetAccentColors[0];

function ProfileModal({ open, onClose, email, setEmail, onSave, avatar, setAvatar, accent, setAccent }) {
  const emailRef = useRef();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(() => localStorage.getItem(`studyfloe-email-verified-${email}`) === 'true');
  const [feedback, setFeedback] = useState('');
  const [avatarTab, setAvatarTab] = useState('preset'); // 'preset' or 'upload'
  const fileInputRef = useRef();

  const handleSendOtp = async () => {
    setFeedback('');
    setVerifying(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setOtpSent(true);
        setFeedback('OTP sent to your email.');
      } else {
        setFeedback('Failed to send OTP.');
      }
    } catch {
      setFeedback('Failed to send OTP.');
    }
    setVerifying(false);
  };

  const handleVerifyOtp = async () => {
    setFeedback('');
    setVerifying(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          setVerified(true);
          localStorage.setItem(`studyfloe-email-verified-${email}`, 'true');
          setFeedback('Email verified!');
        } else {
          setFeedback('Incorrect OTP.');
        }
      } else {
        setFeedback('Verification failed.');
      }
    } catch {
      setFeedback('Verification failed.');
    }
    setVerifying(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    setOtpSent(false);
    setVerified(localStorage.getItem(`studyfloe-email-verified-${email}`) === 'true');
    setFeedback('');
    setOtp('');
  }, [email, open]);

  return open ? (
    <div className="login-modal-bg" onClick={onClose}>
      <form className="login-modal profile-modal" onClick={e => e.stopPropagation()} onSubmit={e => { e.preventDefault(); onSave(); }}>
        <h2>User Profile</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
          <img src={avatar || defaultAvatar} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', boxShadow: '0 2px 8px #b6c6e040', marginBottom: 10, objectFit: 'cover', background: '#f3f6fa' }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <button type="button" className={avatarTab==='preset' ? 'active' : ''} onClick={() => setAvatarTab('preset')}>Choose Avatar</button>
            <button type="button" className={avatarTab==='upload' ? 'active' : ''} onClick={() => setAvatarTab('upload')}>Upload</button>
          </div>
          {avatarTab === 'preset' ? (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }}>
              {presetAvatars.map((url, idx) => (
                <img
                  key={url}
                  src={url}
                  alt={`avatar${idx}`}
                  style={{ width: 44, height: 44, borderRadius: '50%', border: avatar === url ? '2.5px solid #1976d2' : '2.5px solid #e3e6ee', cursor: 'pointer', background: '#fff', objectFit: 'cover' }}
                  onClick={() => setAvatar(url)}
                />
              ))}
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Select Image</button>
            </div>
          )}
        </div>
        <div style={{ marginBottom: 18, width: '100%' }}>
          <label style={{ marginBottom: 6, display: 'block' }}>Accent Color</label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            {presetAccentColors.map((color) => (
              <button
                key={color}
                type="button"
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: accent === color ? '3px solid #1976d2' : '2px solid #e3e6ee', background: color, cursor: 'pointer', outline: 'none', boxShadow: accent === color ? '0 2px 8px #b6c6e040' : 'none', transition: 'border 0.15s, box-shadow 0.15s',
                }}
                aria-label={`Accent ${color}`}
                onClick={() => setAccent(color)}
              />
            ))}
          </div>
        </div>
        <label>Email</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="email" ref={emailRef} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={{ flex: 1 }} />
          {verified ? (
            <span style={{ color: '#2ecc40', fontWeight: 600, fontSize: 14 }}>Verified ✓</span>
          ) : (
            <button type="button" style={{ padding: '7px 14px', fontSize: 13 }} onClick={handleSendOtp} disabled={verifying || !email || otpSent}>Verify</button>
          )}
        </div>
        {otpSent && !verified && (
          <div style={{ marginTop: 10 }}>
            <label>Enter OTP</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" style={{ flex: 1 }} />
              <button type="button" style={{ padding: '7px 14px', fontSize: 13 }} onClick={handleVerifyOtp} disabled={verifying || !otp}>Submit</button>
            </div>
          </div>
        )}
        {feedback && <div style={{ color: feedback.includes('verified') ? '#2ecc40' : '#e53935', marginTop: 8, fontWeight: 500 }}>{feedback}</div>}
        <div className="profile-modal-actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={!verified}>Save</button>
        </div>
      </form>
    </div>
  ) : null;
}

function Sidebar({ selected, setSelected, darkMode, onToggleDarkMode, avatar, accent }) {
  return (
    <div className="sidebar" style={{ borderRight: `3.5px solid ${accent}` }}>
      <div className="sidebar-header">
        <img src={avatar || defaultAvatar} alt="avatar" className="sidebar-logo" style={{ borderRadius: '50%', background: '#f3f6fa', objectFit: 'cover', border: `2.5px solid ${accent}` }} />
        <span className="sidebar-title" style={{ color: accent }}>StudyFlow</span>
      </div>
      <div className="sidebar-dark-toggle" onClick={onToggleDarkMode} title="Toggle dark mode">
        <span className="sidebar-icon"><FaMoon /></span>
        <span>Dark Mode</span>
        <input type="checkbox" checked={darkMode} readOnly style={{ marginLeft: 8 }} />
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.label}
            className={`sidebar-nav-item${selected === item.label ? ' active' : ''}`}
            onClick={() => setSelected(item.label)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

function UsernameForm({ onSubmit }) {
  const [input, setInput] = useState("");
  return (
    <div className="username-form-wrapper">
      <form className="username-form" onSubmit={e => { e.preventDefault(); if(input.trim()) onSubmit(input.trim()); }}>
        <h2>Welcome!</h2>
        <label htmlFor="username-input">Enter your name to get started:</label>
        <input
          id="username-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Your name"
          autoFocus
        />
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}

function Dashboard({ userName, tasks, setTasks }) {
  // Static data for demonstration
  const streak = 7;
  const completedTasks = tasks.filter(t => t.done).length;
  const overview = [
    { label: "Today's Sessions", value: 0, icon: <FaRegClock color="#1976d2" size={24} /> },
    { label: 'Completed Tasks', value: completedTasks, icon: <FaCheckCircle color="#2e7d32" size={24} /> },
    { label: 'Active Subjects', value: 4, icon: <FaBookOpen color="#7c3aed" size={24} /> },
    { label: 'Notes Created', value: 2, icon: <FaRegStickyNote color="#f59e42" size={24} /> },
  ];
  const toggleTask = idx => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {userName}!</h1>
          <div className="dashboard-subtitle">Here's your study overview for today</div>
        </div>
        <div className="dashboard-streak">
          <FaTrophy color="#f59e42" style={{ marginRight: 6 }} />
          <span>{streak} day streak</span>
        </div>
      </div>
      
      <div className="dashboard-overview">
        {overview.map((item) => (
          <div className="dashboard-card" key={item.label}>
            <div className="dashboard-card-row">
              <div className="dashboard-card-label">{item.label}</div>
              <div>{item.icon}</div>
            </div>
            <div className="dashboard-card-value">{item.value}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-tasks">
        <div className="dashboard-tasks-title">Today's Tasks</div>
        <div className="dashboard-tasks-list">
          {tasks.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '18px 0', fontSize: '1.08rem' }}>
              <span role="img" aria-label="no tasks" style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>📝</span>
              No tasks yet! Add your first task to get started.
            </div>
          ) : (
            tasks.map((task, idx) => (
              <div className={`dashboard-task${task.done ? ' done' : ''}`} key={idx}>
                <input type="checkbox" checked={task.done} onChange={() => toggleTask(idx)} />
                <span className="dashboard-task-text">{task.text}</span>
                <span className="dashboard-task-tag">{task.tag}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StudyCalendar() {
  const [events, setEvents] = useState([
    {
      subject: 'Math',
      topic: 'Calculus',
      date: '2025-06-18',
      time: '09:00',
      tag: 'Mathematics',
      completed: false,
    },
    {
      subject: 'Physics',
      topic: 'Mechanics',
      date: '2025-06-18',
      time: '14:00',
      tag: 'Physics',
      completed: true,
    },
    {
      subject: 'Chemistry',
      topic: 'Organic',
      date: '2025-06-19',
      time: '10:00',
      tag: 'Chemistry',
      completed: false,
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: '', topic: '', date: '', time: '', tag: '' });

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!form.subject || !form.topic || !form.date || !form.time || !form.tag) return;
    setEvents([
      ...events,
      { ...form, completed: false },
    ]);
    setForm({ subject: '', topic: '', date: '', time: '', tag: '' });
    setShowModal(false);
  };

  const markCompleted = (idx) => {
    setEvents(events.map((ev, i) => i === idx ? { ...ev, completed: !ev.completed } : ev));
  };

  const deleteEvent = (idx) => {
    setEvents(events.filter((_, i) => i !== idx));
  };

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <h1>Study Calendar</h1>
        <button className="calendar-add-btn" onClick={() => setShowModal(true)}>+ Add Event</button>
      </div>
      <div className="calendar-card">
        <div className="calendar-card-title">Upcoming Study Sessions</div>
        <div className="calendar-events-list">
          {events.map((ev, idx) => (
            <div
              className={`calendar-event${ev.completed ? ' completed' : ''}`}
              key={idx}
              style={ev.completed ? { background: '#e8faef' } : {}}
            >
              <div className="calendar-event-main">
                <div className="calendar-event-title">
                  <b>{ev.subject} - {ev.topic}</b>
                </div>
                <div className="calendar-event-datetime">
                  {ev.date} at {ev.time}
                </div>
                <span className="calendar-event-tag">{ev.tag}</span>
              </div>
              <div className="calendar-event-actions">
                <button
                  className="calendar-event-complete-btn"
                  title={ev.completed ? 'Mark as incomplete' : 'Mark as completed'}
                  onClick={() => markCompleted(idx)}
                >
                  {ev.completed ? <FaCheckCircle color="#2ecc40" size={24} /> : <FaCheckCircle color="#d1d5db" size={24} />}
                </button>
                <button
                  className="calendar-event-delete-btn"
                  title="Delete event"
                  onClick={() => deleteEvent(idx)}
                >
                  <FaTrash color="#e53935" size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="calendar-modal-bg" onClick={() => setShowModal(false)}>
          <form className="calendar-modal" onClick={e => e.stopPropagation()} onSubmit={handleAddEvent}>
            <h2>Add Study Event</h2>
            <input type="text" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required />
            <input type="text" placeholder="Topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} required />
            <input type="text" placeholder="Tag (e.g. Mathematics)" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} required />
            <div className="calendar-modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function PomodoroTimer() {
  const initialTime = 25 * 60; // 25 minutes in seconds
  const [seconds, setSeconds] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRunning && seconds > 0) {
      timer = setInterval(() => setSeconds(s => s - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, seconds]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(initialTime);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="pomodoro-section">
      <h1 className="pomodoro-title">Pomodoro Timer</h1>
      <div className="pomodoro-card">
        <div className="pomodoro-label">Study Session</div>
        <div className="pomodoro-timer">{mm}:{ss}</div>
        <div className="pomodoro-controls">
          <button className="pomodoro-btn start" onClick={handleStart} disabled={isRunning}>
            <FaPlay style={{ marginRight: 8 }} /> Start
          </button>
          <button className="pomodoro-btn pause" onClick={handlePause} disabled={!isRunning}>
            <FaPause style={{ marginRight: 8 }} /> Pause
          </button>
          <button className="pomodoro-btn reset" onClick={handleReset}>
            <FaUndo style={{ marginRight: 8 }} /> Reset
          </button>
        </div>
      </div>
      <div className="pomodoro-sessions-card">
        <div className="pomodoro-sessions-title">Today's Sessions</div>
      </div>
    </div>
  );
}

function Subjects({ subjects, setSubjects }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', color: '#2563eb', topic: '' });
  const [expanded, setExpanded] = useState(null);
  const [newTopic, setNewTopic] = useState('');

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!form.name || !form.color) return;
    setSubjects([
      ...subjects,
      { name: form.name, color: form.color, topics: [] },
    ]);
    setForm({ name: '', color: '#2563eb', topic: '' });
    setShowModal(false);
  };

  const handleDeleteSubject = (idx) => {
    setSubjects(subjects.filter((_, i) => i !== idx));
    if (expanded === idx) setExpanded(null);
  };

  const handleAddTopic = (idx) => {
    if (!newTopic.trim()) return;
    setSubjects(subjects.map((subj, i) =>
      i === idx ? { ...subj, topics: [...subj.topics, { name: newTopic.trim(), done: false }] } : subj
    ));
    setNewTopic('');
  };

  const handleDeleteTopic = (subjIdx, topicIdx) => {
    setSubjects(subjects.map((subj, i) =>
      i === subjIdx ? { ...subj, topics: subj.topics.filter((_, t) => t !== topicIdx) } : subj
    ));
  };

  const handleToggleTopic = (subjIdx, topicIdx) => {
    setSubjects(subjects.map((subj, i) =>
      i === subjIdx ? {
        ...subj,
        topics: subj.topics.map((t, j) => j === topicIdx ? { ...t, done: !t.done } : t)
      } : subj
    ));
  };

  return (
    <div className="subjects-section">
      <div className="subjects-header">
        <h1>Subjects</h1>
        <button className="subjects-add-btn" onClick={() => setShowModal(true)}>+ Add Subject</button>
      </div>
      <div className="subjects-list">
        {subjects.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', padding: '28px 0', fontSize: '1.13rem', borderRadius: 12, background: '#f7f8fa', boxShadow: '0 1px 4px 0 #e5e7eb', marginBottom: 24 }}>
            <span role="img" aria-label="no subjects" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📚</span>
            No subjects yet! Add your first subject to start tracking.
          </div>
        ) : (
          subjects.map((subj, idx) => {
            const topicsDone = subj.topics.filter(t => t.done).length;
            const topicsTotal = subj.topics.length;
            const percent = topicsTotal ? Math.round((topicsDone / topicsTotal) * 100) : 0;
            return (
              <div className="subject-card" key={idx}>
                <div className="subject-card-header">
                  <span className="subject-dot" style={{ background: subj.color }}></span>
                  <span className="subject-name">{subj.name}</span>
                  <button className="subject-delete-btn" title="Delete subject" onClick={() => handleDeleteSubject(idx)}><FaTrash color="#e53935" size={16} /></button>
                </div>
                <div className="subject-progress-label">Progress</div>
                <div className="subject-progress-bar-bg">
                  <div className="subject-progress-bar" style={{ width: percent + '%', background: subj.color }}></div>
                  <span className="subject-progress-count">{topicsDone}/{topicsTotal} topics</span>
                </div>
                <button className="subject-view-btn" onClick={() => setExpanded(idx === expanded ? null : idx)}>
                  View Topics
                </button>
                {expanded === idx && (
                  <div className="subject-topics-list">
                    {subj.topics.length === 0 && <div className="subject-topics-placeholder">No topics yet.</div>}
                    {subj.topics.map((topic, tIdx) => (
                      <div className="subject-topic-row" key={tIdx}>
                        <input type="checkbox" checked={topic.done} onChange={() => handleToggleTopic(idx, tIdx)} />
                        <span className={topic.done ? 'subject-topic-done' : ''}>{topic.name}</span>
                        <button className="topic-delete-btn" title="Delete topic" onClick={() => handleDeleteTopic(idx, tIdx)}><FaTrash color="#e53935" size={14} /></button>
                      </div>
                    ))}
                    <div className="subject-add-topic-row">
                      <input
                        type="text"
                        placeholder="Add new topic"
                        value={expanded === idx ? newTopic : ''}
                        onChange={e => setNewTopic(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTopic(idx); }}
                      />
                      <button className="topic-add-btn" onClick={() => handleAddTopic(idx)}>Add Topic</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {showModal && (
        <div className="subjects-modal-bg" onClick={() => setShowModal(false)}>
          <form className="subjects-modal" onClick={e => e.stopPropagation()} onSubmit={handleAddSubject}>
            <h2>Add Subject</h2>
            <input type="text" placeholder="Subject Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <label style={{ marginTop: 8, marginBottom: 2 }}>Color:</label>
            <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 40, height: 32, border: 'none', background: 'none' }} />
            <div className="subjects-modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function GoalsTasks({ tasks, setTasks }) {
  const [goals, setGoals] = useState([
    { text: 'Complete 5 Math topics', done: 3, total: 5 },
    { text: 'Finish Physics lab reports', done: 1, total: 2 },
    { text: 'Study 20 hours this week', done: 12, total: 20 },
  ]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ text: '', total: 1 });
  const [taskForm, setTaskForm] = useState({ text: '', tag: '' });

  const addGoal = (e) => {
    e.preventDefault();
    if (!goalForm.text.trim() || !goalForm.total) return;
    setGoals([...goals, { text: goalForm.text.trim(), done: 0, total: Number(goalForm.total) }]);
    setGoalForm({ text: '', total: 1 });
    setShowGoalModal(false);
  };
  const addTask = (e) => {
    e.preventDefault();
    if (!taskForm.text.trim() || !taskForm.tag.trim()) return;
    setTasks([...tasks, { text: taskForm.text.trim(), done: false, tag: taskForm.tag.trim() }]);
    setTaskForm({ text: '', tag: '' });
    setShowTaskModal(false);
  };
  const deleteGoal = idx => setGoals(goals.filter((_, i) => i !== idx));
  const deleteTask = idx => setTasks(tasks.filter((_, i) => i !== idx));
  const toggleTask = idx => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  return (
    <div className="goals-section">
      <div className="goals-card">
        <div className="goals-title-row">
          <div className="goals-title">Weekly Goals</div>
          <button className="goals-add-btn" onClick={() => setShowGoalModal(true)}>+ Add Goal</button>
        </div>
        {goals.map((goal, idx) => {
          const percent = Math.round((goal.done / goal.total) * 100);
          return (
            <div className="goal-row" key={idx}>
              <div className="goal-row-header">
                <span>{goal.text}</span>
                <span className="goal-count">{goal.done}/{goal.total}</span>
                <button className="goal-delete-btn" title="Delete goal" onClick={() => deleteGoal(idx)}><FaTrash color="#e53935" size={16} /></button>
              </div>
              <div className="goal-progress-bar-bg">
                <div className="goal-progress-bar" style={{ width: percent + '%' }}></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="tasks-card">
        <div className="tasks-title-row">
          <div className="tasks-title">Daily Tasks</div>
          <button className="tasks-add-btn" onClick={() => setShowTaskModal(true)}>+ Add Task</button>
        </div>
        <div className="tasks-list">
          {tasks.map((task, idx) => (
            <div className={`task-row${task.done ? ' done' : ''}`} key={idx}>
              <input type="checkbox" checked={task.done} onChange={() => toggleTask(idx)} />
              <span className="task-text">{task.text}</span>
              <span className={`task-tag ${task.tag.toLowerCase()}`}>{task.tag}</span>
              <button className="task-delete-btn" title="Delete task" onClick={() => deleteTask(idx)}><FaTrash color="#e53935" size={16} /></button>
            </div>
          ))}
        </div>
      </div>
      {showGoalModal && (
        <div className="goals-modal-bg" onClick={() => setShowGoalModal(false)}>
          <form className="goals-modal" onClick={e => e.stopPropagation()} onSubmit={addGoal}>
            <h2>Add Weekly Goal</h2>
            <input type="text" placeholder="Goal description" value={goalForm.text} onChange={e => setGoalForm(f => ({ ...f, text: e.target.value }))} required />
            <input type="number" min="1" placeholder="Total" value={goalForm.total} onChange={e => setGoalForm(f => ({ ...f, total: e.target.value }))} required />
            <div className="goals-modal-actions">
              <button type="button" onClick={() => setShowGoalModal(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
      {showTaskModal && (
        <div className="tasks-modal-bg" onClick={() => setShowTaskModal(false)}>
          <form className="tasks-modal" onClick={e => e.stopPropagation()} onSubmit={addTask}>
            <h2>Add Daily Task</h2>
            <input type="text" placeholder="Task description" value={taskForm.text} onChange={e => setTaskForm(f => ({ ...f, text: e.target.value }))} required />
            <input type="text" placeholder="Tag (e.g. Mathematics)" value={taskForm.tag} onChange={e => setTaskForm(f => ({ ...f, tag: e.target.value }))} required />
            <div className="tasks-modal-actions">
              <button type="button" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StudyNotes() {
  const [notes, setNotes] = useState([
    { title: 'Calculus Formulas', desc: 'Key integration formulas...', tag: 'Mathematics', date: '2025-06-17' },
    { title: "Newton's Laws", desc: 'Three fundamental laws...', tag: 'Physics', date: '2025-06-16' },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ title: '', desc: '', tag: '', date: '' });

  const openAdd = () => {
    setForm({ title: '', desc: '', tag: '', date: new Date().toISOString().slice(0, 10) });
    setEditIdx(null);
    setShowModal(true);
  };
  const openEdit = (idx) => {
    setForm(notes[idx]);
    setEditIdx(idx);
    setShowModal(true);
  };
  const handleDelete = (idx) => setNotes(notes.filter((_, i) => i !== idx));
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.desc.trim() || !form.tag.trim() || !form.date) return;
    if (editIdx !== null) {
      setNotes(notes.map((n, i) => i === editIdx ? { ...form } : n));
    } else {
      setNotes([{ ...form }, ...notes]);
    }
    setShowModal(false);
  };

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h1>Study Notes</h1>
        <button className="notes-add-btn" onClick={openAdd}>+ New Note</button>
      </div>
      <div className="notes-list">
        {notes.map((note, idx) => (
          <div className="note-card" key={idx}>
            <div className="note-title">{note.title}</div>
            <div className="note-desc">{note.desc}</div>
            <span className="note-tag">{note.tag}</span>
            <div className="note-card-divider" />
            <div className="note-card-footer">
              <span className="note-date">{note.date}</span>
              <button className="note-edit-btn" title="Edit" onClick={() => openEdit(idx)}><FaEdit size={16} /></button>
              <button className="note-delete-btn" title="Delete" onClick={() => handleDelete(idx)}><FaTrash color="#e53935" size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      {showModal && (
        <div className="notes-modal-bg" onClick={() => setShowModal(false)}>
          <form className="notes-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editIdx !== null ? 'Edit Note' : 'Add Note'}</h2>
            <input type="text" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <textarea placeholder="Description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} required />
            <input type="text" placeholder="Tag (e.g. Mathematics)" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} required />
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
            <div className="notes-modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit">{editIdx !== null ? 'Save' : 'Add'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ProgressTracking({ subjects }) {
  // Weekly study hours (line chart) remains static
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours',
        data: [3, 4, 2, 5, 3, 4, 2],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.1)',
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };
  // Subject progress (pie chart) is now dynamic
  const pieData = {
    labels: subjects.map(
      subj => `${subj.name}: ${subj.topics.filter(t => t.done).length}/${subj.topics.length}`
    ),
    datasets: [
      {
        data: subjects.map(subj => subj.topics.filter(t => t.done).length),
        backgroundColor: subjects.map(subj => subj.color),
        borderWidth: 1,
      },
    ],
  };
  return (
    <div className="progress-section">
      <div className="progress-card">
        <div className="progress-title">Weekly Study Hours</div>
        <div className="progress-chart">
          <Line data={lineData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 2 } } } }} height={80} width={250} />
        </div>
      </div>
      <div className="progress-card">
        <div className="progress-title">Subject Progress</div>
        <div className="progress-chart">
          <Pie data={pieData} options={{ plugins: { legend: { position: 'right', labels: { font: { size: 14 } } } } }} height={80} width={120} />
        </div>
      </div>
    </div>
  );
}

function Habits({ habits, setHabits }) {
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const [scheduleType, setScheduleType] = useState('daily'); // 'daily', 'times', 'days'
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [selectedDays, setSelectedDays] = useState([1, 3, 5]); // Mon/Wed/Fri by default
  const [showArchived, setShowArchived] = useState(false);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayIdx = new Date().getDay();
  const getWeekKey = (offset = 0) => {
    const now = new Date();
    now.setDate(now.getDate() - now.getDay() - 7 * offset);
    const start = new Date(now.setHours(0, 0, 0, 0));
    return `${start.getFullYear()}-${start.getMonth() + 1}-${start.getDate()}`;
  };
  const weekKey = getWeekKey(0);
  const last4Weeks = [0, 1, 2, 3].map(getWeekKey);

  // Add new habit
  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    let schedule = { type: scheduleType };
    if (scheduleType === 'times') schedule.times = timesPerWeek;
    if (scheduleType === 'days') schedule.days = selectedDays;
    const habitObj = {
      name: newHabit.trim(),
      schedule,
      progress: {},
      archived: false,
    };
    setHabits([...habits, habitObj]);
    setNewHabit('');
    setScheduleType('daily');
    setTimesPerWeek(3);
    setSelectedDays([1, 3, 5]);
    setShowModal(false);
  };
  // Delete habit
  const handleDeleteHabit = (idx) => {
    setHabits(habits.filter((_, i) => i !== idx));
  };
  // Toggle day for habit
  const handleToggleDay = (habitIdx, dayIdx) => {
    setHabits(habits.map((habit, i) => {
      if (i !== habitIdx) return habit;
      const week = habit.progress[weekKey] || Array(7).fill(false);
      week[dayIdx] = !week[dayIdx];
      return { ...habit, progress: { ...habit.progress, [weekKey]: week } };
    }));
  };
  // Calculate current streak for a habit
  const getStreak = (habit) => {
    let streak = 0;
    let weekOffset = 0;
    let week = habit.progress[getWeekKey(weekOffset)] || [];
    let i = todayIdx;
    while (true) {
      if (week[i]) {
        streak++;
        i--;
        if (i < 0) {
          weekOffset++;
          week = habit.progress[getWeekKey(weekOffset)] || [];
          i = 6;
        }
      } else {
        break;
      }
    }
    return streak;
  };
  // Calculate longest streak for a habit
  const getLongestStreak = (habit) => {
    let maxStreak = 0, streak = 0;
    const allWeeks = Object.values(habit.progress);
    for (const week of allWeeks) {
      for (let i = 0; i < 7; i++) {
        if (week[i]) {
          streak++;
          maxStreak = Math.max(maxStreak, streak);
        } else {
          streak = 0;
        }
      }
    }
    return maxStreak;
  };
  // Calculate completion percentage for a habit
  const getCompletion = (habit) => {
    let done = 0, total = 0;
    Object.values(habit.progress).forEach(week => {
      week.forEach(val => { total++; if (val) done++; });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };
  // Get bar data for last 4 weeks
  const getWeekBar = (habit, weekKey) => {
    const week = habit.progress[weekKey] || [];
    const count = week.filter(Boolean).length;
    return count;
  };
  // For each habit, determine which days are active this week
  const getActiveDays = (habit) => {
    if (!habit.schedule || habit.schedule.type === 'daily') return [0,1,2,3,4,5,6];
    if (habit.schedule.type === 'days') return habit.schedule.days;
    if (habit.schedule.type === 'times') return [0,1,2,3,4,5,6]; // allow any day, but only X per week
    return [0,1,2,3,4,5,6];
  };
  // For 'times' schedule, count checked days this week
  const getCheckedCount = (habit) => {
    const week = habit.progress[weekKey] || [];
    return week.filter(Boolean).length;
  };
  // Archive habit
  const handleArchiveHabit = (idx) => {
    setHabits(habits.map((h, i) => i === idx ? { ...h, archived: true } : h));
  };
  // Restore habit
  const handleRestoreHabit = (idx) => {
    setHabits(habits.map((h, i) => i === idx ? { ...h, archived: false } : h));
  };
  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);

  return (
    <div className="habits-section">
      <div className="habits-header">
        <h1>Habits</h1>
        <button className="habits-add-btn" onClick={() => setShowModal(true)}>+ New Habit</button>
      </div>
      <div className="habits-list">
        {activeHabits.length === 0 ? (
          <div className="habits-placeholder">No habits yet. Add your first habit!</div>
        ) : (
          activeHabits.map((habit, idx) => {
            const realIdx = habits.findIndex(h => h === habit);
            const activeDays = getActiveDays(habit);
            const checkedCount = getCheckedCount(habit);
            const timesGoal = habit.schedule && habit.schedule.type === 'times' ? habit.schedule.times : null;
            return (
              <div key={habit.name + realIdx} className="habit-card">
                <div className="habit-name">{habit.name}</div>
                <div className="habit-week">
                  {days.map((day, dayIdx) => (
                    <button
                      key={day}
                      className={`habit-day${(habit.progress[weekKey] && habit.progress[weekKey][dayIdx]) ? ' checked' : ''}${dayIdx === todayIdx ? ' today' : ''}`}
                      onClick={() => activeDays.includes(dayIdx) && handleToggleDay(realIdx, dayIdx)}
                      disabled={!activeDays.includes(dayIdx)}
                      style={!activeDays.includes(dayIdx) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {timesGoal && (
                  <div className="habit-times-progress">{checkedCount} / {timesGoal} times this week</div>
                )}
                <div className="habit-analytics-row">
                  <div className="habit-streak">🔥 Streak: {getStreak(habit)}</div>
                  <div className="habit-longest">🏅 Longest: {getLongestStreak(habit)}</div>
                  <div className="habit-completion">✅ {getCompletion(habit)}%</div>
                </div>
                <div className="habit-bar-history">
                  {last4Weeks.map((wk, i) => (
                    <div key={wk} className="habit-bar-week">
                      <div className="habit-bar-label">{i === 0 ? 'This' : `${4 - i}w ago`}</div>
                      <div className="habit-bar-outer">
                        <div className="habit-bar-inner" style={{ width: `${(getWeekBar(habit, wk) / 7) * 100}%` }} />
                      </div>
                      <div className="habit-bar-count">{getWeekBar(habit, wk)}/7</div>
                    </div>
                  ))}
                </div>
                <button className="habit-delete-btn" onClick={() => handleDeleteHabit(realIdx)}>Delete</button>
                <button className="habit-archive-btn" onClick={() => handleArchiveHabit(realIdx)}>Archive</button>
              </div>
            );
          })
        )}
      </div>
      {archivedHabits.length > 0 && (
        <div className="habits-archived-section">
          <button className="habits-archived-toggle" onClick={() => setShowArchived(s => !s)}>{showArchived ? 'Hide' : 'Show'} Archived Habits ({archivedHabits.length})</button>
          {showArchived && (
            <div className="habits-list habits-archived-list">
              {archivedHabits.map((habit, idx) => {
                const realIdx = habits.findIndex(h => h === habit);
                const activeDays = getActiveDays(habit);
                const checkedCount = getCheckedCount(habit);
                const timesGoal = habit.schedule && habit.schedule.type === 'times' ? habit.schedule.times : null;
                return (
                  <div key={habit.name + realIdx} className="habit-card habit-archived">
                    <div className="habit-name">{habit.name}</div>
                    <div className="habit-week">
                      {days.map((day, dayIdx) => (
                        <button
                          key={day}
                          className={`habit-day${(habit.progress[weekKey] && habit.progress[weekKey][dayIdx]) ? ' checked' : ''}${dayIdx === todayIdx ? ' today' : ''}`}
                          onClick={() => activeDays.includes(dayIdx) && handleToggleDay(realIdx, dayIdx)}
                          disabled={!activeDays.includes(dayIdx)}
                          style={!activeDays.includes(dayIdx) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    {timesGoal && (
                      <div className="habit-times-progress">{checkedCount} / {timesGoal} times this week</div>
                    )}
                    <div className="habit-analytics-row">
                      <div className="habit-streak">🔥 Streak: {getStreak(habit)}</div>
                      <div className="habit-longest">🏅 Longest: {getLongestStreak(habit)}</div>
                      <div className="habit-completion">✅ {getCompletion(habit)}%</div>
                    </div>
                    <div className="habit-bar-history">
                      {last4Weeks.map((wk, i) => (
                        <div key={wk} className="habit-bar-week">
                          <div className="habit-bar-label">{i === 0 ? 'This' : `${4 - i}w ago`}</div>
                          <div className="habit-bar-outer">
                            <div className="habit-bar-inner" style={{ width: `${(getWeekBar(habit, wk) / 7) * 100}%` }} />
                          </div>
                          <div className="habit-bar-count">{getWeekBar(habit, wk)}/7</div>
                        </div>
                      ))}
                    </div>
                    <button className="habit-delete-btn" onClick={() => handleDeleteHabit(realIdx)}>Delete</button>
                    <button className="habit-archive-btn" onClick={() => handleRestoreHabit(realIdx)}>Restore</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {showModal && (
        <div className="habits-modal-bg" onClick={() => setShowModal(false)}>
          <form className="habits-modal" onClick={e => e.stopPropagation()} onSubmit={handleAddHabit}>
            <h2>New Habit</h2>
            <input type="text" placeholder="Habit name" value={newHabit} onChange={e => setNewHabit(e.target.value)} required />
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: 500, marginRight: 10 }}>Schedule:</label>
              <select value={scheduleType} onChange={e => setScheduleType(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="times">X times per week</option>
                <option value="days">Specific days</option>
              </select>
              {scheduleType === 'times' && (
                <input type="number" min={1} max={7} value={timesPerWeek} onChange={e => setTimesPerWeek(Number(e.target.value))} style={{ width: 48, marginLeft: 10 }} />
              )}
              {scheduleType === 'days' && (
                <span style={{ marginLeft: 10 }}>
                  {days.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      className={selectedDays.includes(idx) ? 'habit-day checked' : 'habit-day'}
                      style={{ padding: '4px 10px', marginRight: 2, fontSize: '0.98rem' }}
                      onClick={() => setSelectedDays(selectedDays.includes(idx) ? selectedDays.filter(d => d !== idx) : [...selectedDays, idx])}
                    >
                      {day}
                    </button>
                  ))}
                </span>
              )}
            </div>
            <div className="habits-modal-actions">
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit">Add</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MainContent({ selected, userName, subjects, setSubjects, tasks, setTasks, decks, setDecks, habits, setHabits }) {
  return (
    <div className="main-content">
      {selected === 'Dashboard' ? <Dashboard userName={userName} tasks={tasks} setTasks={setTasks} /> :
        selected === 'Study Calendar' ? <StudyCalendar /> :
        selected === 'Pomodoro Timer' ? <PomodoroTimer /> :
        selected === 'Subjects' ? <Subjects subjects={subjects} setSubjects={setSubjects} /> :
        selected === 'Goals & Tasks' ? <GoalsTasks tasks={tasks} setTasks={setTasks} /> :
        selected === 'Notes' ? <StudyNotes /> :
        selected === 'Progress' ? <ProgressTracking subjects={subjects} /> :
        selected === 'Habits' ? <Habits habits={habits} setHabits={setHabits} /> :
        selected === 'Online Study' ? <OnlineStudy userName={userName} /> : (
        <>
          <h1>{selected}</h1>
        </>
      )}
    </div>
  );
}

function LoginLogoutButtons({ loggedIn, onLogin, onLogout }) {
  return (
    <>
      {!loggedIn && (
        <div style={{ position: 'fixed', top: 0, right: 0, padding: '24px 40px', zIndex: 10000 }}>
          <button className="login-btn" onClick={onLogin}>Login</button>
        </div>
      )}
      {loggedIn && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, padding: '24px 40px', zIndex: 10000 }}>
          <button className="login-btn" onClick={onLogout}>Logout</button>
        </div>
      )}
    </>
  );
}

function AuthModal({ open, onClose, onAuthSuccess }) {
  const [tab, setTab] = useState('register'); // 'register' or 'login'
  // Registration state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regError, setRegError] = useState('');
  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  // Forgot username state
  const [forgotUsername, setForgotUsername] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [forgotUsernameError, setForgotUsernameError] = useState('');

  // Register user
  const handleRegister = (e) => {
    e.preventDefault();
    setRegError('');
    if (!regUsername || !regPassword || !regEmail) {
      setRegError('Please fill all fields.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setRegError('Please enter a valid email address.');
      return;
    }
    
    let users = {};
    try {
      users = JSON.parse(localStorage.getItem('studyfloe-users')) || {};
    } catch {
      users = {};
    }
    
    // Check if username already exists
    if (users[regUsername]) {
      setRegError('Username already exists.');
      return;
    }
    
    // Check if email already exists
    const emailExists = Object.values(users).some(user => user.email === regEmail);
    if (emailExists) {
      setRegError('Email already registered.');
      return;
    }
    
    // Store user data with email
    users[regUsername] = { 
      password: regPassword, 
      email: regEmail 
    };
    localStorage.setItem('studyfloe-users', JSON.stringify(users));
    localStorage.setItem('studyfloe-username', regUsername);
    
    // Also store email for the user (for profile functionality)
    localStorage.setItem(`studyfloe-email-${regUsername}`, regEmail);
    
    onAuthSuccess(regUsername);
  };

  // Login user with username
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    let users = {};
    try {
      users = JSON.parse(localStorage.getItem('studyfloe-users')) || {};
    } catch {
      users = {};
    }
    if (users[loginUsername]) {
      if (users[loginUsername].password === loginPassword) {
        localStorage.setItem('studyfloe-username', loginUsername);
        onAuthSuccess(loginUsername);
      } else {
        setLoginError('Incorrect password.');
      }
    } else {
      setLoginError('Username not found.');
    }
  };

  // Login user with email (forgot username)
  const handleLoginWithEmail = (e) => {
    e.preventDefault();
    setForgotUsernameError('');
    if (!loginEmail || !loginPassword) {
      setForgotUsernameError('Please fill all fields.');
      return;
    }
    
    let users = {};
    try {
      users = JSON.parse(localStorage.getItem('studyfloe-users')) || {};
    } catch {
      users = {};
    }
    
    // Find user by email
    const userEntry = Object.entries(users).find(([username, userData]) => userData.email === loginEmail);
    
    if (userEntry) {
      const [username, userData] = userEntry;
      if (userData.password === loginPassword) {
        localStorage.setItem('studyfloe-username', username);
        onAuthSuccess(username);
      } else {
        setForgotUsernameError('Incorrect password.');
      }
    } else {
      setForgotUsernameError('Email not found.');
    }
  };

  // Reset form when switching tabs
  const handleTabChange = (newTab) => {
    setTab(newTab);
    setRegError('');
    setLoginError('');
    setForgotUsernameError('');
    setForgotUsername(false);
    if (newTab === 'register') {
      setRegUsername('');
      setRegPassword('');
      setRegEmail('');
    } else {
      setLoginUsername('');
      setLoginPassword('');
      setLoginEmail('');
    }
  };

  // Toggle forgot username mode
  const toggleForgotUsername = () => {
    setForgotUsername(!forgotUsername);
    setLoginError('');
    setForgotUsernameError('');
    setLoginUsername('');
    setLoginPassword('');
    setLoginEmail('');
  };

  if (!open) return null;
  return (
    <div className="login-modal-bg" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', marginBottom: 20 }}>
          <button onClick={() => handleTabChange('register')} style={{ flex: 1, fontWeight: tab === 'register' ? 700 : 400 }}>Register</button>
          <button onClick={() => handleTabChange('login')} style={{ flex: 1, fontWeight: tab === 'login' ? 700 : 400 }}>Login</button>
        </div>
        {tab === 'register' ? (
          <form onSubmit={handleRegister} className="username-form">
            <h2>Register</h2>
            <label>Username</label>
            <input 
              type="text" 
              value={regUsername} 
              onChange={e => setRegUsername(e.target.value)} 
              placeholder="Enter your username"
              required 
            />
            <label>Password</label>
            <input 
              type="password" 
              value={regPassword} 
              onChange={e => setRegPassword(e.target.value)} 
              placeholder="Enter your password"
              required 
            />
            <label>Gmail</label>
            <input 
              type="email" 
              value={regEmail} 
              onChange={e => setRegEmail(e.target.value)} 
              placeholder="Enter your Gmail address"
              required 
            />
            {regError && <div style={{ color: '#e53935', marginTop: 8, fontWeight: 500 }}>{regError}</div>}
            <button type="submit">Register</button>
          </form>
        ) : (
          <div>
            {!forgotUsername ? (
              <form onSubmit={handleLogin} className="username-form">
                <h2>Login</h2>
                <label>Username</label>
                <input 
                  type="text" 
                  value={loginUsername} 
                  onChange={e => setLoginUsername(e.target.value)} 
                  placeholder="Enter your username"
                  required 
                />
                <label>Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  placeholder="Enter your password"
                  required 
                />
                {loginError && <div style={{ color: '#e53935', fontWeight: 500, marginBottom: 8 }}>{loginError}</div>}
                <button type="submit">Login</button>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button 
                    type="button" 
                    onClick={toggleForgotUsername}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#1976d2', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      fontSize: '0.95rem'
                    }}
                  >
                    Forgot Username?
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginWithEmail} className="username-form">
                <h2>Login with Email</h2>
                <label>Gmail</label>
                <input 
                  type="email" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                  placeholder="Enter your Gmail address"
                  required 
                />
                <label>Password</label>
                <input 
                  type="password" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                  placeholder="Enter your password"
                  required 
                />
                {forgotUsernameError && <div style={{ color: '#e53935', fontWeight: 500, marginBottom: 8 }}>{forgotUsernameError}</div>}
                <button type="submit">Login</button>
                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <button 
                    type="button" 
                    onClick={toggleForgotUsername}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#1976d2', 
                      cursor: 'pointer', 
                      textDecoration: 'underline',
                      fontSize: '0.95rem'
                    }}
                  >
                    Back to Username Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="footer-main">
        <span className="footer-brand">© 2024 StudyFlow</span>
        <nav className="footer-links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <div className="footer-social">
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
        </div>
        <span className="footer-version">v1.0.0</span>
      </div>
      <div className="footer-divider" />
      <div className="footer-quote">"Stay consistent. Small steps every day!"</div>
    </footer>
  );
}

const socket = io(process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000'); // Use your backend port

function OnlineStudy({ userName }) {
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // You'd need a way to get all users
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    // Register user when socket connects
    newSocket.on('connect', () => {
      newSocket.emit('register', userName);
    });

    newSocket.on('friendsList', setFriends);
    newSocket.on('pendingRequests', setPending);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [userName]);

  // Room avatars/icons (emoji)
  const roomIcons = ['📚', '🧑‍🎓', '📝', '🔬', '🧪', '📖', '🧠', '💡', '🧩', '🎯'];
  // Mock state for rooms, current room, chat, and members
  const [rooms, setRooms] = useState([
    { id: 'room1', name: 'Math Group', subject: 'Mathematics', description: "Let's solve math together!", icon: '📚', maxMembers: 15, members: ['Alice', 'Bob'], pinned: false, unread: 2 },
    { id: 'room2', name: 'Physics Cram', subject: 'Physics', description: 'Physics last-minute prep.', icon: '🔬', maxMembers: 10, members: ['Charlie'], pinned: false, unread: 0 },
  ]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', subject: '', description: '', icon: roomIcons[0], maxMembers: 10 });
  const [search, setSearch] = useState('');
  const [pinnedRooms, setPinnedRooms] = useState([]);
  const [unreadRooms, setUnreadRooms] = useState({});
  const chatEndRef = useRef(null);

  // Filtered and sorted rooms
  const filteredRooms = rooms
    .filter(room => room.name.toLowerCase().includes(search.toLowerCase()) || room.subject.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Animated transitions (simple fade)
  const [fade, setFade] = useState(false);
  useEffect(() => {
    setFade(true);
    const t = setTimeout(() => setFade(false), 350);
    return () => clearTimeout(t);
  }, [currentRoom]);

  // Join a room (now with Socket.IO)
  const handleJoinRoom = (room) => {
    setCurrentRoom(room);
    setMembers(room.members);
    setChatMessages([
      { sender: 'System', text: `Welcome to ${room.name}!`, time: Date.now() },
    ]);
    setUnreadRooms({ ...unreadRooms, [room.id]: 0 });
    
    // Join room via socket
    if (socket) {
      socket.emit('join-room', { roomId: room.id, user: userName || 'You' });
      socket.on('chat-message', (msg) => {
        setChatMessages((prev) => [...prev, msg]);
      });
      socket.on('room-members', (members) => {
        setMembers(members);
      });
    }
  };
  
  // Leave room (and disconnect socket)
  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    setCurrentRoom(null);
    setMembers([]);
    setChatMessages([]);
  };
  
  // Send message (via socket if connected)
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (socket) {
      socket.emit('chat-message', message);
      setChatMessages((prev) => [...prev, { sender: userName || 'You', text: message, time: Date.now() }]);
    } else {
      setChatMessages([...chatMessages, { sender: userName || 'You', text: message, time: Date.now() }]);
    }
    setMessage('');
  };

  // Helper: get initials
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  // Helper: format time
  const formatTime = (t) => {
    const d = new Date(t);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Pin/unpin room
  const handlePinRoom = (roomId) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, pinned: !r.pinned } : r));
  };
  
  // Create new room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;
    const icon = newRoom.icon || roomIcons[0];
    const id = 'room' + (rooms.length + 1);
    setRooms([...rooms, { 
      id, 
      name: newRoom.name, 
      subject: newRoom.subject, 
      description: newRoom.description, 
      icon, 
      maxMembers: newRoom.maxMembers,
      members: ['You'], 
      pinned: false, 
      unread: 0 
    }]);
    setShowCreateModal(false);
    setNewRoom({ name: '', subject: '', description: '', icon: roomIcons[0], maxMembers: 10 });
  };

  const handleAddFriend = (toUserName) => {
    if (socket) {
      // Don't add yourself as a friend
      if (toUserName === userName || toUserName === 'You') {
        alert('You cannot add yourself as a friend!');
        return;
      }
      
      // Check if already friends
      if (friends.some(f => f.name === toUserName)) {
        alert(`${toUserName} is already your friend!`);
        return;
      }
      
      // Check if request is already pending
      if (pending.includes(toUserName)) {
        alert(`Friend request to ${toUserName} is already pending!`);
        return;
      }
      
      socket.emit('sendFriendRequest', toUserName);
      alert(`Friend request sent to ${toUserName}!`);
    } else {
      alert('Connection not available. Please try again.');
    }
  };

  const handleAcceptFriend = (fromUserName) => {
    if (socket) {
      socket.emit('acceptFriendRequest', fromUserName);
      alert(`Accepted friend request from ${fromUserName}!`);
    } else {
      alert('Connection not available. Please try again.');
    }
  };

  const handleRejectFriend = (fromUserName) => {
    if (socket) {
      socket.emit('rejectFriendRequest', fromUserName);
      alert(`Rejected friend request from ${fromUserName}.`);
    } else {
      alert('Connection not available. Please try again.');
    }
  };

  return (
    <div className={`online-study-section${fade ? ' fade' : ''}`}>
      <h1>Online Study</h1>
      {!currentRoom ? (
        <div className="online-study-rooms-list">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2>Available Rooms</h2>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rooms..." style={{ padding: '7px 12px', borderRadius: 7, border: '1.5px solid #cfd8dc', fontSize: '1.01rem', minWidth: 160 }} />
          </div>
          {filteredRooms.length === 0 && <div className="online-study-empty">No rooms found. Try a different search or create a new room!</div>}
          {filteredRooms.map(room => (
            <div key={room.id} className="online-study-room-card">
              <span style={{ fontSize: '1.7rem', marginRight: 12 }}>{room.icon}</span>
              <div style={{ flex: 1 }}>
                <div className="online-study-room-name">{room.name}</div>
                <div className="online-study-room-members">
                  Members: {room.members.length}{room.maxMembers ? `/${room.maxMembers}` : ''}
                </div>
                <div className="online-study-room-desc">{room.description}</div>
                {room.subject && (
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: 4 }}>
                    Subject: {room.subject}
                  </div>
                )}
              </div>
              <button title={room.pinned ? 'Unpin' : 'Pin'} style={{ marginRight: 8, background: 'none', color: '#fbc02d' }} onClick={() => handlePinRoom(room.id)}>{room.pinned ? <FaStar /> : <FaRegStar />}</button>
              {room.unread > 0 && <span className="online-study-unread-badge">{room.unread}</span>}
              <button onClick={() => handleJoinRoom(room)}>Join</button>
            </div>
          ))}
          <button className="online-study-create-btn" onClick={() => setShowCreateModal(true)}>+ Create New Room</button>
        </div>
      ) : (
        <div className="online-study-room-view">
          <div className="online-study-room-header">
            <h2>{currentRoom.icon} {currentRoom.name}</h2>
            <button onClick={handleLeaveRoom}>Leave Room</button>
          </div>
          <div className="online-study-room-main">
            <div className="online-study-chat">
              <div className="online-study-chat-messages">
                {chatMessages.length === 0 && <div className="online-study-empty">No messages yet. Start the conversation!</div>}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`online-study-chat-message${msg.sender === 'You' ? ' self' : ''}`}>
                    <span className="online-study-chat-sender">{msg.sender}:</span> {msg.text}
                    <span style={{ float: 'right', fontSize: '0.85em', color: '#888', marginLeft: 8 }}>{formatTime(msg.time)}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form className="online-study-chat-input" onSubmit={handleSendMessage}>
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." />
                <button type="submit">Send</button>
              </form>
            </div>
            <div className="online-study-members">
              <h3>Members</h3>
              {members.length === 0 && <div className="online-study-empty">No members yet.</div>}
              <ul>
                {members.map((m, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#e3e6ee', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.01rem' }}>{getInitials(m)}</span>
                    {m}
                    <button title="Add Friend" style={{ marginLeft: 6, background: 'none', color: '#1976d2', border: 'none', cursor: 'pointer' }} onClick={() => handleAddFriend(m)}><FaUserPlus /></button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="online-study-friends">
              <h3>Friends ({friends.length})</h3>
              {friends.length === 0 && <div className="online-study-empty">No friends yet. Add some from the member list!</div>}
              <ul>
                {friends.map((f, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8, 
                    color: f.online ? '#43a047' : '#888',
                    padding: '4px 0'
                  }}>
                    <span style={{ 
                      background: f.online ? '#43a047' : '#ccc', 
                      borderRadius: '50%', 
                      width: 8, 
                      height: 8, 
                      display: 'inline-block' 
                    }}></span>
                    {f.name} {f.online ? '(Online)' : '(Offline)'}
                  </li>
                ))}
              </ul>
            </div>
            {pending.length > 0 && (
              <div className="online-study-pending">
                <h3>Pending Friend Requests ({pending.length})</h3>
                <ul>
                  {pending.map((p, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      {p}
                      <button style={{ background: '#43a047', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleAcceptFriend(p)}>Accept</button>
                      <button style={{ background: '#e53935', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }} onClick={() => handleRejectFriend(p)}>Reject</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Room Creation Modal */}
      {showCreateModal && (
        <div className="online-study-modal-bg" onClick={() => setShowCreateModal(false)}>
          <form className="online-study-modal" onClick={e => e.stopPropagation()} onSubmit={handleCreateRoom}>
            <div className="modal-header">
              <h2>Create New Study Room</h2>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label htmlFor="roomName">Room Name *</label>
                <input 
                  id="roomName"
                  type="text" 
                  value={newRoom.name} 
                  onChange={e => setNewRoom({ ...newRoom, name: e.target.value })} 
                  placeholder="Enter room name..."
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roomSubject">Subject</label>
                <input 
                  id="roomSubject"
                  type="text" 
                  value={newRoom.subject} 
                  onChange={e => setNewRoom({ ...newRoom, subject: e.target.value })} 
                  placeholder="e.g., Mathematics, Physics..."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="roomDescription">Description</label>
                <textarea 
                  id="roomDescription"
                  value={newRoom.description} 
                  onChange={e => setNewRoom({ ...newRoom, description: e.target.value })} 
                  placeholder="Describe what this room is for..."
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="roomIcon">Room Icon</label>
                  <select 
                    id="roomIcon"
                    value={newRoom.icon} 
                    onChange={e => setNewRoom({ ...newRoom, icon: e.target.value })}
                  >
                    {roomIcons.map(icon => (
                      <option key={icon} value={icon}>
                        {icon} {icon === '📚' ? 'Books' : 
                               icon === '🧑‍🎓' ? 'Student' :
                               icon === '📝' ? 'Notes' :
                               icon === '🔬' ? 'Science' :
                               icon === '🧪' ? 'Chemistry' :
                               icon === '📖' ? 'Reading' :
                               icon === '🧠' ? 'Brain' :
                               icon === '💡' ? 'Ideas' :
                               icon === '🧩' ? 'Puzzle' :
                               icon === '🎯' ? 'Target' : 'Study'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="maxMembers">Max Members</label>
                  <input 
                    id="maxMembers"
                    type="number" 
                    min="2" 
                    max="50"
                    value={newRoom.maxMembers} 
                    onChange={e => setNewRoom({ ...newRoom, maxMembers: parseInt(e.target.value) || 10 })} 
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Room
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Standalone Email Verification Component
function EmailVerification({ email, onVerified, onCancel }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSendOtp = async () => {
    setFeedback('');
    setVerifying(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setOtpSent(true);
        setFeedback('OTP sent to your email.');
      } else {
        setFeedback('Failed to send OTP.');
      }
    } catch {
      setFeedback('Failed to send OTP.');
    }
    setVerifying(false);
  };

  const handleVerifyOtp = async () => {
    setFeedback('');
    setVerifying(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          setVerified(true);
          setFeedback('Email verified successfully!');
          if (onVerified) onVerified(email);
        } else {
          setFeedback('Incorrect OTP.');
        }
      } else {
        setFeedback('Verification failed.');
      }
    } catch {
      setFeedback('Verification failed.');
    }
    setVerifying(false);
  };

  return (
    <div className="email-verification-modal">
      <h3>Verify Your Email</h3>
      <p>We'll send a verification code to: <strong>{email}</strong></p>
      
      {!otpSent ? (
        <div>
          <button 
            onClick={handleSendOtp} 
            disabled={verifying}
            className="send-otp-btn"
          >
            {verifying ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div>
          <label>Enter OTP Code:</label>
          <input 
            type="text" 
            value={otp} 
            onChange={e => setOtp(e.target.value)} 
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            className="otp-input"
          />
          <div className="otp-actions">
            <button 
              onClick={handleVerifyOtp} 
              disabled={verifying || !otp || otp.length !== 6}
              className="verify-btn"
            >
              {verifying ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              onClick={handleSendOtp} 
              disabled={verifying}
              className="resend-btn"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}
      
      {feedback && (
        <div className={`feedback ${feedback.includes('verified') ? 'success' : 'error'}`}>
          {feedback}
        </div>
      )}
      
      {onCancel && (
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      )}
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState('Dashboard');
  const [userName, setUserName] = useState(() => localStorage.getItem('studyfloe-username') || '');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('studyfloe-dark') === 'true');
  const [profileOpen, setProfileOpen] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem(`studyfloe-email-${userName}`) || '');
  const [accent, setAccent] = useState(() => localStorage.getItem(`studyfloe-accent-${userName}`) || defaultAccent);
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`studyfloe-avatar-${userName}`) || defaultAvatar);

  // Default data for new users: EMPTY
  const defaultSubjects = [];
  const defaultTasks = [];
  const defaultHabits = [];

  // Per-user state
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [tasks, setTasks] = useState(defaultTasks);
  const [habits, setHabits] = useState(defaultHabits);

  // Load user data on login
  useEffect(() => {
    if (userName) {
      localStorage.setItem('studyfloe-username', userName);
      
      // Load user's email from stored user data
      try {
        const users = JSON.parse(localStorage.getItem('studyfloe-users')) || {};
        const userData = users[userName];
        if (userData && userData.email) {
          setEmail(userData.email);
          localStorage.setItem(`studyfloe-email-${userName}`, userData.email);
        }
      } catch (error) {
        console.error('Error loading user email:', error);
      }
      
      // Load user's avatar
      const savedAvatar = localStorage.getItem(`studyfloe-avatar-${userName}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      } else {
        setAvatar(defaultAvatar);
      }
      
      const userDataRaw = localStorage.getItem(`studyfloe-data-${userName}`);
      if (userDataRaw) {
        try {
          const userData = JSON.parse(userDataRaw);
          setSubjects(userData.subjects || defaultSubjects);
          setTasks(userData.tasks || defaultTasks);
          setHabits(userData.habits || defaultHabits);
        } catch {
          setSubjects(defaultSubjects);
          setTasks(defaultTasks);
          setHabits(defaultHabits);
        }
      } else {
        setSubjects(defaultSubjects);
        setTasks(defaultTasks);
        setHabits(defaultHabits);
      }
    }
  }, [userName]);

  // Save user data on change
  useEffect(() => {
    if (userName) {
      const userData = { subjects, tasks, habits };
      localStorage.setItem(`studyfloe-data-${userName}`, JSON.stringify(userData));
    }
    // eslint-disable-next-line
  }, [subjects, tasks, habits, userName]);

  // Save avatar when it changes
  useEffect(() => {
    if (userName && avatar) {
      localStorage.setItem(`studyfloe-avatar-${userName}`, avatar);
    }
  }, [avatar, userName]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('studyfloe-dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (accent) {
      document.body.style.setProperty('--accent-color', accent);
    }
    localStorage.setItem(`studyfloe-accent-${userName}`, accent);
  }, [accent, userName]);

  // If not logged in, show login modal (not the old welcome screen)
  if (!userName && !authModalOpen) {
    setAuthModalOpen(true);
    return null;
  }

  // Handler for logging out
  const handleLogout = () => {
    setUserName('');
    setEmail('');
    setAvatar(defaultAvatar);
    localStorage.removeItem('studyfloe-username');
  };

  // Handler for login form submit (multi-user logic)
  const handleAuthSuccess = (username) => {
    setUserName(username);
    setAuthModalOpen(false);
  };

  // Save email to localStorage per user
  const handleProfileSave = () => {
    localStorage.setItem(`studyfloe-email-${userName}`, email);
    setProfileOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar selected={selected} setSelected={setSelected} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(dm => !dm)} avatar={avatar} accent={accent} />
      <div style={{ flex: 1, position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'fixed', top: 0, right: 0, padding: '24px 40px', zIndex: 10001, display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="profile-btn" onClick={() => setProfileOpen(true)} title="Profile"><FaUser /></button>
          <LoginLogoutButtons loggedIn={!!userName} onLogin={() => setAuthModalOpen(true)} onLogout={handleLogout} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <MainContent
            selected={selected}
            userName={userName}
            subjects={subjects}
            setSubjects={setSubjects}
            tasks={tasks}
            setTasks={setTasks}
            habits={habits}
            setHabits={setHabits}
          />
        </div>
        <AppFooter />
        {authModalOpen && (
          <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} />
        )}
        <ProfileModal 
          open={profileOpen} 
          onClose={() => setProfileOpen(false)} 
          email={email} 
          setEmail={setEmail} 
          onSave={handleProfileSave} 
          avatar={avatar} 
          setAvatar={setAvatar} 
          accent={accent} 
          setAccent={setAccent} 
        />
      </div>
    </div>
  );
}

export default App;
