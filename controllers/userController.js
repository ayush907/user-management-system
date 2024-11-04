import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"
import Randomstring from "randomstring"
import dotenv from "dotenv"
dotenv.config()

// function sending mail for email verification 
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "vikat2360@gmail.com",
                pass: process.env.em_pass
            }
        })
        const mailOptions = {
            from: "vikat2360@gmail.com",
            to: email,
            subject: "verify your email.",
            html: `<p>Hii ${name}, please click here to <a href="http://localhost:3000/verify?id=${user_id}">Verify</a> your mail</p>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            }
            else {
                console.log(`email has been sent- ${info.response}`);
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// for reset password send mail
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: "vikat2360@gmail.com",
                pass: process.env.em_pass
            }
        })
        const mailOptions = {
            from: "vikat2360@gmail.com",
            to: email,
            subject: "Verify your email",
            html: `<p>Hii ${name}, please click here to <a href="http://localhost:3000/forget-password?token=${token}">Reset</a> your Password.</p>`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            }
            else {
                console.log(`email has been sent- ${info.response}`);
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// function for loading register page
export const loadRegister = (req, res) => {
    try {
        res.render("registration")
    } catch (error) {
        console.log(error)
    }
}

// function for loading Login page
export const loadLogin = (req, res) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error)
    }
}

// function for loading Home page
export const loadHome = async(req, res) => {
    try {
        const user = await User.findById({_id: req.session.user_id})   // logged in user ki information bhi home page pe render karni hai (home page ek protected endpoint(route) pe hai)
        return res.render("home", {user: user})
    } catch (error) {
        console.log(error)
    }
}

// function for user registration 
export const registerUser = async (req, res) => {
    try {
        const { name, email, mno, password } = req.body

        const hashedPassword = bcrypt.hashSync(password, 10)

        const obj = {
            name: name,
            email: email,
            mobile: mno,
            image: req.file.filename,
            password: hashedPassword,
            is_admin: 0
        }
        const user = await User.findOne({ email })
        if (user) {
            return res.render("registration", { message: "user already exists, can not register." })
        }
        const newUser = new User(obj)
        const savedUser = await newUser.save()

        if (savedUser) {
            sendVerifyMail(name, email, savedUser._id)
            return res.render("registration", { message: "user rigistration successful. please verify your mail" })
        }
        else {
            return res.render("registration", { message: "user register failed." })
        }
    }
    catch (error) {
        console.log(error)
    }
}

// function for email verification 
export const verifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } })

        console.log(updateInfo);
        res.render("email-verified")
    } catch (error) {
        console.log(error)
    }
}

//function for user login 
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.render("login", { message: "invalid email or password." })
        }
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.render("login", { message: "invalid email or password." })
        }
        if (user.is_verified !== 1) {
            return res.render("login", { message: "please verify your mail" }) 
        }
        req.session.user_id = user._id
        return res.redirect("/home")
    }
    catch (error) {
        console.log(error.message)
    }
}

//function for Logout user
export const userLogout = (req, res)=>{
    try {
        req.session.destroy();
        return res.redirect("/login")
    } catch (error) {
        console.log(error.message)
    }
}

// function for loading forget password page
export const forgetLoad =(req, res)=>{
    try {
        return res.render("forget")
    } catch (error) {
        console.log(error.message)
    }
}



// function forget verify (this is used to check that the user who is trying to reset passwore is verified or not )
export const forgetVerify = async(req, res)=>{
    try {
        const {email} = req.body
        const user = await User.findOne({email})
        if(user){
            if(user.is_verified === 0){
                return res.render("forget", {message: "please verify your mail."})
            }
            else{
                const randomString = Randomstring.generate()
                const updatedUser = await User.updateOne({email: email}, {$set: {token:randomString}})
                sendResetPasswordMail(user.name, email, randomString)
                return res.render("forget",{message: "please check your mail, to reset the password."})
            }
        }
        else{
            return res.render("forget", {message: "user email is incorrect"})
        }
    } catch (error) {
        console.log(error.message)
    }
}

// function for forget password loader
export const forgetPasswordLoad = async(req, res)=>{
    try {
        const token = req.query.token
        const user = await User.findOne({token: token})
        if(user){
            return res.render("forget-password", {user_id : user._id})
        }
        else{
            return res.render("404", {message: "Token is invalid"})
        }

    } catch (error) {
        console.log(error.message)  
    }
}

// function for reset the password
export const resetPassword = async(req, res)=>{
    try {
        const {password, user_id} = req.body

        const hashedPassword = bcrypt.hashSync(password, 10)
        const updatedUser = await User.findByIdAndUpdate({_id: user_id}, {$set:{password: hashedPassword, token: ""}})

        res.redirect("/login")
    } catch (error) {
        console.log(error.message)
    }
}

// function for loading verification page (for verication send mail link)
export const verificationLoad = async(req, res)=>{
    try {
        return res.render("verification")
    } catch (error) {
        console.log(error.message)
    }
}

// function for sending verification link 
export const sendVerificationLink = async(req, res)=>{
    try {
        const {email} = req.body
        const user = await User.findOne({email: email})
        if(user){
            sendVerifyMail(user.name, user.email, user._id)
            return res.render("verification", {message: "Resent verification mail sent to your email id, please check"})
        }
        else{
            return res.render("verification", {message: "this email does not exists."})
        }
    } catch (error) {
        console.log(error.message)
    }
}

// fuction for loading user profile edit & update page
export const editLoad = async(req, res) =>{
    try {
        const id = req.query.id
        const user = await User.findById({_id: id})
        if(user){
            return res.render("edit", {user: user})
        }
        else{
            res.redirect("/home")
        }
    } catch (error) {
        console.log(error.message)
    }
}

// function for updating the user profile
export const updateProfile = async(req, res )=>{
    try {
        const  {user_id, name, email, mno} = req.body

        if(req.file){
            const image = req.file.filename
            const updatedUser = await User.findByIdAndUpdate({_id: user_id}, {$set: {name: name, email: email, mobile: mno, image: image }})
        }
        else{
            const updatedUser = await User.findByIdAndUpdate({_id: user_id}, {$set: {name: name, email: email, mobile: mno}})
        }
        res.redirect("/home")  

    } catch (error) {
        console.log((error.message))  
    }
}
