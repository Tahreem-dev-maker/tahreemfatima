module.exports=(req,res,next)=>{
    if(req.session.userId){
        return next();
    }
    req.flash("error","you must be logged in to get further access ")
    res.redirect("/login");
};