var Showfinder = require("../models/showfinder");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkShowfinderOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Showfinder.findById(req.params.id, function(err, foundShowfinder){
            if(err || !foundShowfinder){
                req.flash("error", "Listing not found");
                res.redirect("back");
            }else{
                if(foundShowfinder.author.id.equals(req.user.id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "Insufficient permissions")
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "Please login to continue");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            }else{
                if(foundComment.author.id.equals(req.user.id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "Insufficient permissions");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error", "Please login to continue");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        req.flash("error", "Please login to continue");
        res.redirect("/login");
    }
}

module.exports = middlewareObj;