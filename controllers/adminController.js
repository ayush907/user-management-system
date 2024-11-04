import User from "../models/userModel.js"
import bcrypt from "bcrypt"
import Randomstring from "randomstring"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// function for add user mail.
const addUserMail = async (name, email, password, user_id) => {
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
            subject: "admin can add you and Verify your mail.",
            html: `<p>Hii ${name}, please click here to <a href="http://localhost:3000/verify?id=${user_id}">Verify</a> your mail</p>
            <br><br> <b>Email:-</b> ${email} <br> <b>Password:-</b> ${password}`
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
            html: `<p>Hii ${name}, please click here to <a href="http://localhost:3000/admin/forget-password?token=${token}">Reset</a> your Password.</p>`
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

// function for loading admin login page
export const loadLoginAdmin = async (req, res) => {
    try {
        return res.render("login")
    } catch (error) {
        console.log(error.message)
    }
}

// function to verify the login
export const verifyLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (user) {
            const isPassMatch = await bcrypt.compare(password, user.password)
            if (isPassMatch) {
                if (user.is_admin === 0) {
                    return res.render("login", { message: "email or password is wrong." })
                }
                else {
                    req.session.user_id = user._id
                    return res.redirect("/admin/home")
                }
            }
            else {
                return res.render("login", { message: "email or password is incorrect" })
            }
        }
        else {
            return res.render("login", { message: "Email or Passwod is incorrect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// function for loading the admin home page.
export const loadDashboard = async (req, res) => {
    try {
        const user = await User.findById({ _id: req.session.user_id })
        return res.render("home", { admin: user })
    } catch (error) {
        console.log(error.message)
    }
}

// function for admin logout
export const adminLogout = async (req, res) => {
    try {
        req.session.destroy()
        return res.redirect("/admin")
    } catch (error) {
        console.log(error.message)
    }
}

// function for loading the admin forget password page
export const forgetLoad = async (req, res) => {
    try {
        return res.render("forget")
    } catch (error) {
        console.log(error.message)
    }
}

// function for resetting the forget password of admin by verifying.
export const forgetVerify = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (user) {
            if (user.is_admin === 0) {
                return res.render("forget", { message: "email is incorrect." })
            }
            else {
                const randomstring = Randomstring.generate()
                const updatedUser = await User.updateOne({ email: email }, { $set: { token: randomstring } })
                sendResetPasswordMail(user.name, user.email, randomstring)
                return res.render("forget", { message: "please check your mail to reset your password" })
            }
        }
        else {
            return res.render("forget", { message: "Email is incorrect" })
        }
    } catch (error) {
        console.log(error.message)
    }
}

// function forgetPasswordLoad email verification 
export const forgetPasswordLoad = async (req, res) => {
    try {

        const token = req.query.token
        const user = await User.findOne({ token: token })
        if (user) {
            return res.render("forget-password", { user_id: user._id })
        }
        else {
            return res.render("404", { message: "Invalid Link..." })
        }

    } catch (error) {
        console.log(error.message)
    }
}

// function to reset the password 
export const resetPassword = async (req, res) => {
    try {
        const { password, user_id } = req.body

        const hashedPassword = bcrypt.hashSync(password, 10)

        const updatedUser = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: hashedPassword, token: "" } })

        return res.redirect("/admin")
    } catch (error) {
        console.log(error.message)
    }
}

// function for getting the admin dashboard
export const adminDashboard = async (req, res) => {
    try {
        const users = await User.find({ is_admin: 0 })
        return res.render("dashboard", { users: users })
    } catch (error) {
        console.log(error.message)
    }
}



// add new user work start

//function for loading the add new user page 
export const newUserLoad = async (req, res) => {
    try {
        return res.render("new-user")
    } catch (error) {
        console.log(error.message);
    }
}

// function to add new user
export const addUser = async (req, res) => {
    try {
        const { name, email, mno } = req.body
        const image = req.file.filename
        const password = Randomstring.generate(8)
        const hashedPassword = bcrypt.hashSync(password, 10)

        const newUser = new User({
            name: name,
            email: email,
            mobile: mno,
            image: image,
            password: hashedPassword,
            is_admin: 0
        })

        const savedUser = await newUser.save()

        if (savedUser) {
            addUserMail(name, email, password, savedUser._id)
            return res.redirect("/admin/dashboard")
        }
        else {
            return res.render("new-user", { message: "Something went wrong" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

// function for edit-user page Load
export const editUserLoad = async (req, res) => {
    try {
        const id = req.query.id
        const user = await User.findById({ _id: id })
        if (user) {
            return res.render("edit-user", { user: user })
        }
        else {
            return res.redirect("/admin/dashboard")
        }
    } catch (error) {
        console.log(error.message);
    }
}

// function to update the user info by admin 
export const updateUsers = async (req, res) => {
    try {
        const { name, email, mno, id } = req.body
        const verify = req.body.verify
        const updatedUser = await User.findByIdAndUpdate({ _id: id },
            { $set: { name: name, email: email, mobile: mno, is_verified: verify } })
        return res.redirect("/admin/dashboard")
    } catch (error) {
        console.log(error.message)
    }
} 

// delete users by admin
export const deleteUser = async (req, res) => {
    try {
        const id = req.query.id
        const deleted = await User.deleteOne({_id: id})
        return res.redirect("/admin/dashboard")
    } catch (error) {
        console.log(error.message); 
    }
}
