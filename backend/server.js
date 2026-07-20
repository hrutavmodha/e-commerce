const express = require("express")
const cors = require("cors")
const path = require("path")
const rateLimit = require("express-rate-limit")
const cookieParser = require("cookie-parser")
const morgan = require("morgan")
const helmet = require("helmet") 
const xss = require("xss-clean")
const mongoose = require("mongoose")
const { body, validationResult } = require("express-validator")
const sanitize = require("express-mongo-sanitize")
const compress = require("compression")
const { signup, login, oauth } = require("./handlers/auth")
const connect = require("./connect")
const { verifyToken } = require("./handlers/jwts")
const checkRole = require("./handlers/checkRole")
const upload = require("./handlers/upload")
const addProduct = require("./handlers/addProduct")
const listProducts = require("./handlers/listProducts")
const addToCart = require("./handlers/addToCart")
const showCart = require("./handlers/showCart")
const deleteCart = require("./handlers/deleteCart")
const searchProducts = require("./handlers/searchProducts")
const showProduct = require("./handlers/showProduct")
const saveComment = require("./handlers/saveComment")
const showReview = require("./handlers/showReview")
const mail = require("./handlers/mail")
const app = express()
require("dotenv").config()
app.use(cors({
    origin: process.env.REACT_APP_FRONTEND_URL,
    credentials: true
}))
app.use(
    express.json({
        limit: "1mb"
    })
)
app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
)
app.use("/images", express.static(path.join(__dirname, "handlers", "images")))
// app.use(rateLimit({
//     windowMs: 120 * 60 * 1000,
//     max: 10, 
//     message: "Too many requests from this IP, please try again later"
// }))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet())
app.use(xss())
app.use(sanitize())
app.use(compress())
connect("ecommerce")
.then(() => {
    console.log("Connected to MongoDB successfully")
})
.catch((err) => {
    console.log(err)
})
app.post("/signup", [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Email is not valid"),
    body("password").isLength({ 
        min: 8 
    }).withMessage("Password must be at least 8 characters long"),
    body("role").notEmpty().withMessage("Role is required")
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ 
            errors: errors.array() 
        })
    }
    await signup(req, res)
    await mail(req, res)
})
app.post("/oauth", async (req, res) => {
    await oauth(req, res)
})
app.post("/login", [
    body("email").isEmail().withMessage("Email is not valid"),
    body("password").isLength({ 
        min: 8
     }).withMessage("Password must be at least 8 characters long")
],async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: errors.array()
        })
    }
    await login(req, res)
})
app.post("/products", verifyToken, checkRole("Retailer"), upload.single("image"), async (req, res) => {
    await addProduct(req, res)
})
app.get("/products", async (req, res) => {
    await listProducts(req, res)
})
app.post("/cart", verifyToken, async (req, res) => {
    await addToCart(req, res)
})
app.get("/cart", verifyToken, async (req, res) => {
    await showCart(req, res)
})
app.delete("/cart", verifyToken, async (req, res) => {
    await deleteCart(req, res)
})
app.post("/searchProducts", async (req, res) => {
    await searchProducts(req, res)
})
app.post("/reviews", verifyToken, async (req, res) => {
    await saveComment(req, res)
})
app.get("/reviews", async (req, res) => {
    await showReview(req, res)
})
app.get("/health", (req, res) => {
    if (mongoose.connection.readyState === 1) {
        return res.status(200).json({
            status: "ok",
            database: "connected"
        })
    }

    return res.status(503).json({
        status: "unavailable",
        database: "disconnected"
    })
})
app.get("/:id", async (req, res) => {
    await showProduct(req, res)
})
app.listen(5000, () => {
    console.log("Server is running at port 5000")   
})
