
// ye middleware hai server side pe route protection lagaane ke liye (protected end point)
export const islogin = async (req, res, next)=>{
    try {
        if(req.session.user_id){
            // nothing to do
            console.log(req.session)    // ham yha pe session ki details print karwa sakte hai 
        }
        else{
            res.redirect("/login")
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

// ye middleware hai ye check karne ke liye ki agar user logout hai toh he vo login kar sake.
export const isLogout =(req, res, next)=>{
    try {
        if(req.session.user_id){
            res.redirect("/home")
        }
        next()  
    } catch (error) {
        // console.log(error.message);
        console.log(error);
    }
}