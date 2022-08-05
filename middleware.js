const {campgroundSchema ,reviewSchema}= require('./schemas.js');
const ExpressError =require('./utilities/ExpressError');
const Campground= require('./models/campground');
const Review= require('./models/review');



module.exports.isLoggedIn = (req,res,next)=>{

    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in')
        return res.redirect('/login')
    }
    next();
}


module.exports.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You are not authorized to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async(req,res,next)=>{
    const {id,reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You are not authorized to do that')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateCampground = (req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
     const msg = error.details.map(el=> el.message).join(',')
     throw new ExpressError(msg,400);
    }
    else{
     next();
    }
}

         //new path given .. not recomended .. i will change this later
module.exports.validateReview =(req,res,next)=>{
    if(req.body.review.rating==0){
        var newPath = req.originalUrl
        newPath = newPath.substring(0,newPath.length-7)
        req.method='GET';
        req.flash('error','You must choose star ratting')
        res.redirect(newPath)
    }
    else{
        const { error} =reviewSchema.validate(req.body);
        if(error){
            const msg = error.details.map(el=> el.message).join(',')
            throw new ExpressError(msg,400);
        }
        else{
        next();
       }
    }
    
}