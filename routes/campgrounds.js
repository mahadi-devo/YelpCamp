const express = require("express"),
  router = express.Router(),
  Campground = require("../models/campground");
(middleware = require("../middleware")),
  (NodeGeocoder = require("node-geocoder"));

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

const multer = require("multer");
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "mahadi",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// INDEX - show all campgrounds
router.get("/", (req, res) => {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all campgrounds from DB
    Campground.find({ name: regex }, function (err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        if (allCampgrounds.length === 0) {
          req.flash(
            "error",
            "No campgrounds match that query, please try again."
          );
          return res.redirect("/campgrounds");
        }
        res.render("campgrounds/index", {
          campGrounds: allCampgrounds,
          page: "campgrounds",
        });
      }
    });
  } else {
    Campground.find({}, (err, allcampground) => {
      if (err || !allcampground) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {
          campGrounds: allcampground,
          page: "campgrounds",
        });
      }
    });
  }
});

// CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function (
  req,
  res
) {
  cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    // add cloudinary url for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    // add image's public_id to campground object
    req.body.campground.imageId = result.public_id;
    // add author to campground
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username,
    };
    geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
        req.flash("error", "Invalid address");
        return res.redirect("back");
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
      // var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};

      Campground.create(req.body.campground, function (err, campground) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        res.redirect("/campgrounds/" + campground.id);
      });
    });
  });
});
// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
  //find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments likes")
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } },
    })
    .exec(function (err, foundCampground) {
      if (err || !foundCampground) {
        console.log(err);
        req.flash("error", "Sorry, that campground does not exist!");
        return res.redirect("/campgrounds");
      }
      console.log(foundCampground);
      //render show template with that campground
      res.render("campgrounds/show", { campground: foundCampground });
    });
});

// Campground Like Route
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    if (err) {
      console.log(err);
      return res.redirect("/campgrounds");
    }

    // check if req.user._id exists in foundCampground.likes
    var foundUserLike = foundCampground.likes.some(function (like) {
      return like.equals(req.user._id);
    });

    if (foundUserLike) {
      // user already liked, removing like
      foundCampground.likes.pull(req.user._id);
    } else {
      // adding the new user like
      foundCampground.likes.push(req.user);
    }

    foundCampground.save(function (err) {
      if (err) {
        console.log(err);
        return res.redirect("/campgrounds");
      }
      return res.redirect("/campgrounds/" + foundCampground._id);
    });
  });
});

// // EDIT - shows edit form for a campground
// router.get("/:id/edit", middleware.isLoggedIn, middleware.checkUserCampground, function(req, res){
//     //render edit template with that campground
//     res.render("campgrounds/edit", {campground: req.campground});
//   });

// Edit ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      req.flash("error", "Campground not found");
      res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

// UPDATE ROUTE
router.put(
  "/:id",
  middleware.checkCampgroundOwnership,
  upload.single("image"),
  (req, res) => {
    delete req.body.campground.rating;
    Campground.findById(req.params.id, async (err, campground) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      } else {
        if (req.file) {
          try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            var result = await cloudinary.v2.uploader.upload(req.file.path);
            campground.imageId = result.public_id;
            campground.image = result.secure_url;
          } catch {
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        console.log("address : " + req.body.campground.location);
        console.log("address : " + req.body.location);
        geocoder.geocode(req.body.campground.location, function (err, data) {
          if (err || !data.length) {
            req.flash("error", "Invalid address");
            console.log(data.length);
            console.log("addre :" + err);
            return res.redirect("back");
          }
          req.body.campground.lat = data[0].latitude;
          req.body.campground.lng = data[0].longitude;
          req.body.campground.location = data[0].formattedAddress;

          // campground.lat = data[0].latitude;
          // campground.lng = data[0].longitude;
          // campground.location = data[0].formattedAddress;

          campground.lat = req.body.campground.lat;
          campground.lng = req.body.campground.lng;
          campground.location = req.body.campground.location;

          campground.name = req.body.campground.name;
          campground.price = req.body.campground.price;
          campground.description = req.body.campground.description;
          campground.save();
          req.flash("success", "Successfully Updated!");
          res.redirect("/campgrounds/" + campground._id);
        });
      }
    });
  }
);
// find Id and Udate
// Campground.findByIdAndUpdate(req.params.id, req.body.campground,(err, updatedCampground)=>{
//     if(err) res.redirect('/campgrounds');
//     else{
//         req.flash('success', 'Successfully updated the campground');
//         res.redirect('/campgrounds/' + updatedCampground._id);//req.params.id
//     }
// });
// });

// DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, async function (err, campground) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.v2.uploader.destroy(campground.imageId);
      campground.remove();
      req.flash("success", "Campground deleted successfully!");
      res.redirect("/campgrounds");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
  });
  // Campground.findByIdAndRemove(req.params.id, (err)=>{
  //     if(err) {
  //         req.flash('error', 'Campground not found');
  //         res.redirect('/campgrounds');
  //     }
  //     else{
  //         req.flash('success', 'Successfully Deleted the Campground');
  //         res.redirect('/campgrounds');
  //     }
  // })
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// router.delete("/:id", (req, res) => {
//     Campground.findById(req.params.id, (err, campground) => {
//       if (err) {
//         console.log(err);
//         res.redirect("/campgrounds");
//       } else {
//         campground.remove();             // foundCampground.remove() which is an instance method,
//         res.redirect("/campgrounds");
//       }
//     });
//   });

module.exports = router;
