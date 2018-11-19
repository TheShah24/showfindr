var express = require("express");
var router = express.Router();
var Showfinder = require("../models/showfinder");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeocoder(options);

//INDEX
router.get("/", function(req, res){
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Showfinder.find({name: regex}, function(err, allshowfinders){
            if(err){
                console.log(err);
            }else{
                if(allshowfinders.lenth < 1){
                    req.flash("error", "Listing not found");
                    return res.redirect("back");
                }
            }
        });
    }else{
        Showfinder.find({}, function(err, allshowfinders){
            if(err){
                console.log(err);
            }else{
                res.render("showfinders/index", {showfinders:allshowfinders})
            }
        });
    }
});

//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length){
            req.flash("error", "Invalid Address");
            return res.redirect("back");
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newShowfinder = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng}
        Showfinder.create(newShowfinder, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/showfinders");
        }
       }); 
    });
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("showfinders/new");
});

//SHOW 
router.get("/:id", function(req, res){
    Showfinder.findById(req.params.id).populate("comments").exec(function(err, foundShowfinder){
        if(err || !foundShowfinder){
            console.log(err);
            req.flash("error", "Listing not found");
            res.redirect("back");
        }else{
            res.render("showfinders/show", {showfinder: foundShowfinder, page: 'showfinders'});
        }
    });
});

//EDIT
router.get("/:id/edit", middleware.checkShowfinderOwnership, function(req, res){
    Showfinder.findById(req.params.id, function(err, foundShowfinder) {
        res.render("showfinders/edit", {showfinder: foundShowfinder})
    });
});

//UPDATE
router.put("/:id", middleware.checkShowfinderOwnership, function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.showfinder.lat = data[0].latitude;
    req.body.showfinder.lng = data[0].longitude;
    req.body.showfinder.location = data[0].formattedAddress;
    
    Showfinder.findByIdAndUpdate(req.params.id, req.body.showfinder, function(err, showfinder){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            req.flash("success", "Entry Updated");
            res.redirect("/showfinders/" + showfinder._id);
        }
    });
    });
});

//DESTROY
router.delete("/:id", middleware.checkShowfinderOwnership, function(req, res) {
    Showfinder.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/showfinders");
        }else{
            res.redirect("/showfinders");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;