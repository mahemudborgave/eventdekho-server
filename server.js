import express from "express"; 
import dotenv from "dotenv";
import cors from 'cors';
import connectDB from './config/db.js';
import sample from "./routes/sample.js";
import login from './routes/login.js';
import eventt from './routes/eventt.js'
import userauth from './middleware/userauth.js'

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use('/sample', sample);
app.use('/login', login);
app.use('/eventt', eventt);
app.use('/userauth', userauth);

connectDB();


app.listen(PORT, () => console.log(`Server Running on port ${PORT}`));
