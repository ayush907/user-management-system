import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

const uri = process.env.db_uri

mongoose.connect(uri)
.then((conn)=>{
    console.log(`connected to mongodb with database ${conn.connection.name} & host is ${conn.connection.host}`)
})
.catch((err)=>{
    console.log(err)
})