var express = require("express");
var router  = express.Router({mergeParams: true});
var Showfinder = require("../models/showfinder");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//COMMENT ROUTES

router.get("/new", middleware.isLoggedIn, function(req, res){
    Showfinder.findById(req.params.id, function(err, showfinder){
        if(err || !showfinder){
            req.flash("error", "Listing not found");
            res.redirect("back");
        }else{
            res.render("comments/new", {showfinder: showfinder});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    Showfinder.findById(req.params.id, function(err, showfinder){
        if(err){
            console.log(err);
        }else{
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                    req.flash("error", "Something went wrong");
                }else{
                    comment.author.id = req.user.id;
                    comment.author.username = req.user.username;
                    comment.save();
                    showfinder.comments.push(comment);
                    showfinder.save();
                    req.flash("success", "Comment Added");
                    res.redirect("/showfinders/" + showfinder._id);
                }
            });
            
        }
    });
});

//COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Showfinder.findById(req.params.id, function(err, foundShowfinder) {
        if(err || !foundShowfinder){
            req.flash("error", "Listing not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment) {
            if(err){
                res.redirect("back");
            }else{
                res.render("comments/edit", {showfinder_id: req.params.id, comment: foundComment});
            }
        });
    });
});

//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment Deleted");
            res.redirect("/showfinders/"+req.params.id);
        }
    });
});

//COMMENT DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndDelete(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success", "Comment deleted");
            res.redirect("/showfinders/"+req.params.id);
        }
    });
});

module.exports = router;