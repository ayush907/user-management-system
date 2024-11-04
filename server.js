import express from "express"
import "./models/conn.js"
import userRoute from "./routes/userRoutes.js"
import adminRoute from "./routes/adminRoute.js"

const port = 3000
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// route to handle user related operations 
app.use("/", userRoute)   


//route to handle andmin operations
app.use("/admin", adminRoute)




app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})