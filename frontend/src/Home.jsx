import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [docId, setDocId] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/documents')
      .then(res => res.json())
      .then(setDocs);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans px-6 py-10">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold mb-8 tracking-tight text-blue-400">
          ✍️ CollabText
        </h1>

        <button
          onClick={() => navigate(`/doc/${uuidv4()}`)}
          className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg text-lg font-medium shadow mb-8"
        >
          + Create New Document
        </button>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <input
            value={docId}
            onChange={e => setDocId(e.target.value)}
            placeholder="Enter document ID"
            className="flex-1 px-4 py-2 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => docId && navigate(`/doc/${docId}`)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium"
          >
            Join
          </button>
        </div>

        <div className="text-left">
          <h2 className="text-xl font-semibold mb-4 text-white/90">📄 Recent Documents</h2>
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-gray-400">No documents found.</p>
            ) : (
              docs.map(doc => (
                <button
                  key={doc._id}
                  onClick={() => navigate(`/doc/${doc._id}`)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-700 px-5 py-3 rounded-lg transition-all duration-150"
                >
                  <div className="font-semibold text-white">{doc.title || 'Untitled'}</div>
                  <div className="text-sm text-gray-400">
                    {doc._id} • {new Date(doc.updatedAt).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
