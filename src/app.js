import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: ["http://localhost:5173"],
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
import { waRouter } from './routes/wa.routes.js'
import businessRouter from "./routes/business.routes.js"
import { customerRouter } from './routes/customer.routes.js'
import { templateRouter } from './routes/template.routes.js'
import { campaignRouter } from './routes/campaign.routes.js'
import { testRouter } from './routes/test.routes.js'

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/business', businessRouter)

// health
app.get("/api/v1/health", (req, res) => res.json({ ok: true }));

// webhook (public)
app.use("/api/v1", waRouter);

// protected business routes
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/templates", templateRouter);
app.use("/api/v1/campaigns", campaignRouter);
app.use("/api/v1", testRouter); // optional


export {app}