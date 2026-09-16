const express = require("express");
const {createTutorProfile} = require("../controller/users/becomeTutor");
const {upload} = require("../controller/common/upload");


const {authenticate} = require("../controller/auth/authenticate");
const {getAllTutors} = require("../controller/tutors/getAllTutors")
const {getTutorProfile} = require("../controller/tutors/getTutorProfile");
const {searchTutors} = require("../controller/tutors/searchTutors");
const {updateUserLocation} = require("../controller/tutors/updateLocation");

const tutors = express.Router();


tutors.get("/", getAllTutors)
tutors.get('/search', searchTutors);
tutors.get('/:id', getTutorProfile);
tutors.post('/location-update', authenticate, updateUserLocation);
tutors.post("/createTutorProfile", authenticate, upload.single("photo"), createTutorProfile);

module.exports = {tutors}