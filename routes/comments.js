const express = require('express'),
      router = express.Router({mergeParams : true}),
      Campground = require('../models/campground'),
      Comment = require('../models/comment');
      middleware = require('../middleware');

// NEW ROUTE
router.get("/new", middleware.isLoggedIn, (req, res)=>{
    //find campground by id
    Campground.findById(req.params.id, (err, foundCampground) =>{
        if(err || !foundCampground){
            req.flash("error", "Error: Campground not found.");
            res.redirect("back");
        }else{
            res.render("comments/new", {campground : foundCampground});
        }
    })  
});

// CRAETE ROUTE
router.post("/", middleware.isLoggedIn, (req, res)=>{
    //lookup campground using ID
    Campground.findById(req.params.id, (err, campground) =>{
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
         //create new comment
         Comment.create(req.body.comment, (err, comment)=>{
            if(err){
                req.flash('error', 'Something went wrong');
                console.log(err);
            } else {
                // add User Id and username
                comment.author.id = req.user._id;
                comment.author.username = req.user.username;
                // save the user in comment
                comment.save();
                //connect new comment to campground
                campground.comments.push(comment);
                campground.save();
                //redirect campground show page
                // console.log(comment);
                req.flash('success', 'Comment added to the campground');
                res.redirect('/campgrounds/' + campground._id);
            }
         });
        }
    });  
 });

// EDIT - shows edit form for a comment
// router.get("/:commentId/edit", middleware.isLoggedIn, middleware.checkUserComment, function(req, res){
//     res.render("comments/edit", {campground_id: req.params.id, comment: req.comment});
// });

// Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err || !foundCampground){
            req.flash('error', 'Campground is not found');
            res.redirect("back");
        } else{
            Comment.findById(req.params.comment_id, function(err, foundComment){
                if(err || !foundComment){
                    req.flash('error', 'Comment is not found');
                    res.redirect("back");
                } else {
                  res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
                }
            })
        }
    });
 });


// Update Route
router.put('/:comment_id', middleware.checkCommentOwnership, (req,res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
        if(err) res.redirect('back');
        else{
            res.redirect('/campgrounds/'+ req.params.id);
        }
    });
});

// Destroy Route
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res)=>{
    Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
        if(err) res.redirect('back');
        else {
            req.flash('success', 'Comment deleted');
            res.redirect('/campgrounds/'+ req.params.id);
        }
    })
});


module.exports = router;