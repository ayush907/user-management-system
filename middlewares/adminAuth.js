
export const isLoginAdmin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // nothing to do here 
        }
        else {
            res.redirect("/admin")
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

export const isLogoutAdmin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect("/admin/home")
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}