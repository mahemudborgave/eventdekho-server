import express from "express"; 
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from './config/db.js';
import sample from "./routes/sample.js";
import login from './routes/login.js';
import eventt from './routes/eventt.js'
import userauth from './middleware/userauth.js'
import college from './routes/college.js'
import contactus from './routes/contactus.js'
import blog from './routes/blog.js'
import query from './routes/query.js'
import http from 'http';
import { Server } from 'socket.io';
// import routes from './routes/index.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "You are on root endpoint. Please go to specific endpoints:",
    availableEndpoints: {
      auth: "/login",
      events: "/eventt", 
      colleges: "/college",
      queries: "/query",
      blogs: "/blog",
      contact: "/contactus",
      userAuth: "/userauth"
    },
    serverInfo: {
      status: "running",
      port: PORT,
      timestamp: new Date().toISOString()
    }
  });
});

app.use('/sample', sample);
app.use('/login', login);
app.use('/eventt', eventt);
app.use('/college', college);
app.use('/userauth', userauth);
app.use('/contactus', contactus);
app.use('/blog', blog);
app.use('/query', query);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  socket.on('join', (userEmail) => {
    socket.join(userEmail);
  });
});

app.set('io', io);

connectDB();

server.listen(PORT, () => console.log(`Server Running on port ${PORT}`));

export default app;
