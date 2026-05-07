import dotenv from 'dotenv';
import app from './app';
import { timeStamp } from 'console';

dotenv.config();

const PORT = process.env.PORT || 3000;
const currentTime = new Date().toLocaleTimeString('en-GB', {hour12: false});

app.listen(PORT, () => {
    console.log(`${currentTime}: API started. Running on port ${PORT}`);
});