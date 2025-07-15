import { useParams } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function App() {
  const { id: docId } = useParams();
  const [userName, setUserName] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [joined, setJoined] = useState(false);
  const [title, setTitle] = useState('Untitled');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [userList, setUserList] = useState([]);
  const [joinMessage, setJoinMessage] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const editorRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!joined) return;

    socket.emit('join-document', { docId, name: userName });

    socket.on('load-document', ({ data, title }) => {
      setContent(data);
      setTitle(title);
      editorRef.current.value = data;
    });

    socket.on('receive-changes', data => {
      setContent(data);
      editorRef.current.value = data;
    });

    socket.on('user-list', users => setUserList(users));
    socket.on('user-joined', name => {
      setJoinMessage(`${name} joined`);
      setTimeout(() => setJoinMessage(null), 3000);
    });

    return () => socket.off();
  }, [joined]);

  useEffect(() => {
    if (!joined) return;
    const interval = setInterval(() => {
      setSaving(true);
      socket.emit('save-document', { data: content, title });
      setTimeout(() => setSaving(false), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, [joined, content, title]);

  const handleJoin = () => {
    if (nameInput.trim()) {
      setUserName(nameInput);
      setJoined(true);
    }
  };

  const copyURL = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('🔗 Link copied to clipboard');
  };

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-sans">
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h2 className="text-3xl font-bold mb-4 text-center">Welcome to CollabText</h2>
          <p className="text-gray-400 mb-6 text-sm text-center">Enter your name to join the document</p>
          <input
            className="w-full mb-4 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
          />
          <button
            onClick={handleJoin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Join Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white font-sans">
      <header className="flex flex-wrap justify-between items-center bg-gray-900 border-b border-gray-700 px-6 py-4 shadow-md">
        <input
          className="text-xl font-semibold px-4 py-2 bg-gray-800 border border-gray-700 rounded w-full max-w-xs focus:outline-none"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="flex gap-3 mt-4 sm:mt-0">
          <button
            onClick={copyURL}
            className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 px-4 py-2 rounded text-sm font-medium"
          >
            🔗 Copy Link
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm font-medium"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button
            onClick={() => socket.emit('save-document', { data: content, title })}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-medium"
          >
            💾 Save
          </button>
        </div>
      </header>

      {joinMessage && (
        <div className="p-2 bg-green-500 text-white text-center animate-pulse">{joinMessage}</div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 overflow-y-auto hidden md:block">
          <h3 className="text-lg font-semibold mb-4">👥 Users Online</h3>
          {userList.map(user => (
            <div
              key={user.id}
              className="mb-2 bg-blue-700 px-3 py-2 rounded text-sm font-medium"
            >
              {user.name}
            </div>
          ))}
        </aside>

        <main className="flex-1 p-4 overflow-y-auto">
          <textarea
            ref={editorRef}
            value={content}
            onChange={e => {
              setContent(e.target.value);
              socket.emit('send-changes', e.target.value);
            }}
            className="w-full h-[75vh] p-6 bg-gray-900 border border-gray-700 rounded-lg resize-none text-base leading-relaxed tracking-wide font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start typing your document..."
          />
        </main>
      </div>

      <footer className="text-sm text-center py-3 bg-gray-900 border-t border-gray-800 text-gray-400">
        {saving ? '💾 Saving...' : '✅ All changes saved'}
      </footer>
    </div>
  );
}
