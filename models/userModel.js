import mongoose from "mongoose";

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    mobile: {type: String, required: true},
    image: {type: String, required: true},
    password: {type: String, required: true},
    is_admin: {type: Number, required: true},
    is_verified: {type: Number, default: 0},
    token: {type: String, default: ''}       // reset passwored token 
})

const userModel = mongoose.model("users", userSchema)

export default userModel