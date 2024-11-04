import express from "express"
import multer from "multer"
import session from "express-session"
import dotenv from "dotenv"
import { addUser, adminDashboard, adminLogout, deleteUser, editUserLoad, forgetLoad, forgetPasswordLoad, forgetVerify, loadDashboard, loadLoginAdmin, newUserLoad, resetPassword, updateUsers, verifyLogin } from "../controllers/adminController.js"
import { isLoginAdmin, isLogoutAdmin } from "../middlewares/adminAuth.js"
dotenv.config()

const router = express()   //creating the router

router.use(session({secret: process.env.session_pass}))   //using  the session 

// setting the view engine
router.set("view engine", "ejs")
router.set("views", "./views/admin")


// using the multer for storing the image
router.use(express.static("public"))

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/userImages')
    },
    filename: (req, file, cb)=>{
        cb(null, `$${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({storage: storage})

// GET requests
router.get("/", isLogoutAdmin, loadLoginAdmin)

router.get("/home", isLoginAdmin, loadDashboard)

router.get("/logout", isLoginAdmin, adminLogout)

router.get("/forget", isLogoutAdmin, forgetLoad)

router.get("/forget-password",isLogoutAdmin ,forgetPasswordLoad)

router.get("/dashboard", isLoginAdmin, adminDashboard)

router.get("/new-user", isLoginAdmin, newUserLoad)

router.get("/edit-user", isLoginAdmin, editUserLoad)

router.get("/delete-user", deleteUser)


// POST requests
router.post("/", verifyLogin)  

router.post("/forget", forgetVerify)

router.post("/forget-password", resetPassword) 

router.post("/new-user", upload.single("image"), addUser)

router.post("/edit-user", updateUsers)


// ye vaala sabse last mai lagaana hota hai 
router.get("*", (req, res)=>{
    res.redirect("/admin")
})
export default router