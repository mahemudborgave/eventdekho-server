import express from "express"; 
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from './config/db.js';
import sample from "./routes/sample.js";
import login from './routes/login.js';
import auth from './routes/auth.js';
import eventt from './routes/eventt.js'
import userauth from './middleware/userauth.js'
import organization from './routes/organization.js'
import contactus from './routes/contactus.js'
import blog from './routes/blog.js'
import query from './routes/query.js'
import root from './routes/root.js'
import http from 'http';
import { Server } from 'socket.io';
import wishlist from './routes/wishlist.js';
import featuredImages from './routes/featuredImages.js';
import stats from "./routes/stats.js";
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
      auth: "/auth",
      legacyAuth: "/login",
      events: "/eventt", 
      organizations: "/organization",
      queries: "/query",
      blogs: "/blog",
      contact: "/contactus",
      userAuth: "/userauth",
      root: "/root"
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
app.use('/auth', auth);
app.use('/eventt', eventt);
app.use('/organization', organization);
app.use('/userauth', userauth);
app.use('/contactus', contactus);
app.use('/blog', blog);
app.use('/query', query);
app.use('/root', root);
app.use('/wishlist', wishlist);
app.use('/api/featured-images', featuredImages);
app.use('/stats', stats);

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
