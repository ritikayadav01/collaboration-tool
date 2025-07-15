import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import cors from 'cors';
import Document from './models/Document.js';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://ritya0117:CuV3nBrTPCrZHJXv@cluster0.faizjbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const usersInDoc = {};

io.on('connection', socket => {
  socket.on('join-document', async ({ docId, name }) => {
    socket.join(docId);

    let doc = await Document.findById(docId);
    if (!doc) doc = await Document.create({ _id: docId, data: '', title: 'Untitled' });
    socket.emit('load-document', { data: doc.data, title: doc.title });

    usersInDoc[docId] = usersInDoc[docId] || [];
    usersInDoc[docId].push({ id: socket.id, name });
    io.to(docId).emit('user-list', usersInDoc[docId]);
    socket.broadcast.to(docId).emit('user-joined', name);

    socket.on('send-changes', content => {
      socket.broadcast.to(docId).emit('receive-changes', content);
    });

    socket.on('save-document', async ({ data, title }) => {
      await Document.findByIdAndUpdate(docId, { data, title, updatedAt: Date.now() });
    });

    socket.on('disconnect', () => {
      usersInDoc[docId] = (usersInDoc[docId] || []).filter(u => u.id !== socket.id);
      io.to(docId).emit('user-list', usersInDoc[docId]);
    });
  });
});

app.get('/documents', async (req, res) => {
  const docs = await Document.find({}, '_id title updatedAt')
    .sort({ updatedAt: -1 })
    .limit(10)
    .lean();
  res.json(docs);
});

server.listen(3001, () => console.log('Server running on port 3001'));
