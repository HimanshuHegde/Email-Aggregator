import express from 'express'
import sendMail from './controller/sendMail.controller.ts';
import CORS from 'cors';
const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CORS());
app.post('/sendMail', sendMail);

app.listen(PORT, () => {
    console.log(`SendMail service is running on port ${PORT}`);
});