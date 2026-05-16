module.exports=(req,res,next)=>{
    if(req.session.role==="admin"){
        return next();
    }
    req.flash("error","you must be an admin to get further access ")
    res.redirect("/login");
}