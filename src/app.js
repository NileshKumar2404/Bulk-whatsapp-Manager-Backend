import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.use((req, res, next) => {
    console.log(`Received ${req.method} request with body:`, req.body);
    console.log(`Received ${req.method} request with params:`, req.params);
    next();
});

// app.use(express.urlencoded({extended: true}))
// app.use(cookieParser())
// app.use(express.json())
// app.use(express.static('public'))
// app.use((req, res, next) => {
//     console.log(`request body: ${req.body}`);
//     next()
// })

import userRoutes from './routes/user.routes.js'
import waRoutes from './routes/wa.routes.js'

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/wa', waRoutes)

export {app}