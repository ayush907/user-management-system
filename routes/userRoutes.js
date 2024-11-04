import express from "express"
import dotenv from "dotenv"
dotenv.config()
import multer from "multer"
import { editLoad, forgetLoad, forgetPasswordLoad, forgetVerify, loadHome, loadLogin, loadRegister, loginUser, registerUser, resetPassword, sendVerificationLink, updateProfile, userLogout, verificationLoad, verifyMail } from "../controllers/userController.js"
const router = express()  //creating the router
import session from "express-session"
import { islogin, isLogout } from "../middlewares/auth.js"

router.use(session({secret: process.env.session_pass}))

router.use(express.static("public"))

//setting the view engine for the router
router.set("view engine", "ejs")
router.set("views", "./views/users")

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, './public/userImages')
    },
    filename: (req, file, cb)=>{
        cb(null, `$${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({storage: storage})



// handling get requests here 

router.get("/",isLogout, (req, res)=>{   // ess route mai 2 middleware ki protection hai 
    res.render("index")          // this is for (index page) this page shows login or registration options.
})
router.get("/register",isLogout ,loadRegister)  //router for loading register page. 
router.get("/login", isLogout,loadLogin)     //router for loading login page.
router.get("/home", islogin,loadHome)
router.get('/verify', verifyMail)
router.get("/logout", islogin, userLogout)

router.get("/forget", isLogout, forgetLoad)

router.get("/forget-password", isLogout, forgetPasswordLoad)

router.get("/verification", verificationLoad)

router.get("/edit", islogin, editLoad)


// handling post requests here
router.post("/forget-password", resetPassword)

router.post("/register", upload.single("image"), registerUser)
router.post("/login", loginUser)

router.post("/forget", forgetVerify)

router.post("/verification", sendVerificationLink)

router.post("/edit",upload.single("image") ,updateProfile)



export default router   


