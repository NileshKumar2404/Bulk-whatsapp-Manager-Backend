import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import { engine } from 'express-handlebars'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupSwagger } from './swagger.js'
import { verifyUser } from './middleware/authMiddleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Setup Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials')
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(cors({
    origin: ["http://localhost:3002", "http://localhost:5173"],
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

app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))
// app.use((req, res, next) => {
//     console.log(`request body: ${req.body}`);
//     next()
// })

import userRoutes from './routes/user.routes.js'
import { waWebhookRouter } from './routes/wa.routes.js'
import businessRouter from "./routes/business.routes.js"
import { customerRouter } from './routes/customer.routes.js'
import { templateRouter } from './routes/template.routes.js'
import { campaignRouter } from './routes/campaign.routes.js'
import { testRouter } from './routes/test.routes.js'

// Frontend routes
app.get("/", (req, res) => res.redirect("/login"));
app.get("/login", (req, res) => res.render("login", { title: "Login" }));
app.get("/register", (req, res) => res.render("register", { title: "Register" }));
app.get("/dashboard", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("dashboard", { title: "Dashboard", user });
});
app.get("/customers", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("customers", { title: "Customers", user });
});
app.get("/business", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("business", { title: "Business", user });
});
app.get("/templates", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("templates", { title: "Templates", user });
});
app.get("/campaigns", verifyUser, (req, res) => {
    const user = { 
        firstName: req.user.firstName, 
        lastName: req.user.lastName 
    };
    res.render("campaigns", { title: "Campaigns", user });
});

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/business', businessRouter)

// health
app.get("/api/v1/health", (req, res) => res.json({ ok: true,message : "hello world 2" }));

// sample hello world
app.get("/api/v1/hello", (req, res) => res.json({ message: "Hello, world!" }));

// docs
setupSwagger(app)

// webhook (public)
app.use("/api/v1", waWebhookRouter);

// protected business routes
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/templates", templateRouter);
app.use("/api/v1/campaigns", campaignRouter);
app.use("/api/v1", testRouter); // optional


export {app}