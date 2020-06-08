const mongoose = require("mongoose");
const Comment = require("./comment");
const Review = require("./review");

//Schema Setup
const campgroundSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  imageId: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
  location: String,
  lat: Number,
  lng: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
});

campgroundSchema.pre("findByIdAndRemove", async function () {
  try {
    await Comment.deleteMany({
      _id: {
        $in: this.comments,
      },
    });
    // deletes all reviews associated with the campground
    await Review.deleteMany({
      _id: {
        $in: this.reviews,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// campgroundSchema.pre('remove', async function(next) {
// 	try{
//             await Comment.deleteMany({  //.deleteMany() is only a static method, meaning it gets called on the Model, e.g., Campground.deleteMany()
//             _id: {
//                 $in: this.comments
//             }
//        });
//        return next();
//     }catch (err){
//         return next(err);
//     }

// });

module.exports = mongoose.model("Campground", campgroundSchema);