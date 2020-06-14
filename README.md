# YelpCamp

<p>YelpCamp is a Node.js express based web application with RESTful routing principals</p>

<h2>Live Demo : <a href= "https://yelpcamp-mahadi1.herokuapp.com/">YelpCamp</a></h2>

<ul>
    <li>Login username: guest</li>
    <li>Login password: Guest123</li>
</ul>

<b>YelpCamp Functions</b>

<ul>
    <li>Authentication:
        <ul>
            <li>User / Admin signup</li>
            <li>User / Admin login</li>
        </ul>
    </li>
    <li>Authorization:
        <ul>
            <li>User cannot create new posts or view user profile without being authenticated</li>
            <li>User cannot edit or delete existing posts and comments created by other users
            </li>
            <li>Admin can manage all posts and comments</li>
        </ul>
    </li>
        <li>Campgrounds:
        <ul>
            <li>List all campgrounds in the database</li>
            <li>Search campgrounds by campground Name</li>
            <li>Create new campgrounds</li>
            <li>Upload a photo for campgrounds (uploaded to the cloudinary)</li>
            <li>Update campgrounds</li>
            <li>Delete campgrounds</li>
            <li>Calculate the average rating from the reviews for a campgrounds</li>
            <li>calculate likes for a campground</li>
        </ul>
        </li>
        <li>Comments / Rating / Review:
        <ul>
            <li>List all comments / rating / reviews on a campgrouns from database</li>
            <li>Create new comments / rating / review</li>
            <li>Update comments / rating / review</li>
            <li>Delete comments / rating / review</li>
        </ul>
        <li>Likes :
        <ul>
            <li>List All Likes</li>
            <li>Like, Remove Like Functionality</li>
        </ul>
    <li>Campground location with Google Maps</li>
    <li>Pricing feature</li>
    <li>Password reset </li>
    <li>Display time since post was created with Moment JS </li>
</ul>
<ul>
    <li>Deployment
        <ul>
        <li><a href ="www.heroku.com">Heroku</a></li>
        </ul>
    </li>
</ul>

<p>Coded from scratch based on a challenge project provided in  - <a href ="https://www.udemy.com/the-web-developer-bootcamp/">Colt Steele's Web Developer Bootcamp course</a>
