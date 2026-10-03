const express = require("express");
const {upload} = require("../controller/common/upload");
const {createTutorProfile} = require("../controller/users/becomeTutor");


const {authenticate} = require("../controller/auth/authenticate");
const {getAllTutors} = require("../controller/tutors/getAllTutors")
const {getTutorProfile} = require("../controller/tutors/getTutorProfile");
const {searchTutors} = require("../controller/tutors/searchTutors");
const {updateUserLocation} = require("../controller/tutors/updateLocation");
const {getTutorReviews, addReview} = require("../controller/tutors/reviews")
const {updateTutorProfile, updateUserPassword} = require("../controller/tutors/updateTutorProfile")

const tutors = express.Router();


tutors.get("/", getAllTutors)
tutors.get('/search', searchTutors);
tutors.get('/:id', getTutorProfile);
tutors.post('/location-update', authenticate, updateUserLocation);
tutors.post("/createTutorProfile", authenticate, upload.single("photo"), createTutorProfile);
tutors.patch("/profile", authenticate, upload.single("photo"), updateTutorProfile);
tutors.patch("/password", authenticate, updateUserPassword);


tutors.get("/reviews/:tutorId", getTutorReviews);
tutors.post("/reviews/add", authenticate, addReview);

module.exports = {tutors}
