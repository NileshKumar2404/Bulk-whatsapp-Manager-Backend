import connectDB from "./db/index.js"
import dotenv from 'dotenv'
import {app} from "./app.js"

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.join(__dirname, "../property.env") // project-root/property.env
});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port: `, process.env.PORT);
    })
})

.catch((err) => {
    console.log(`Mongodb connection error!!`, err);
})