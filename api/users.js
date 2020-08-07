const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const Users = require("../models/users.js");

//PASSPORT CONFIG STARTS HERE
passport.use(
	new LocalStrategy((username, password, done) => {
		Users.findOne({ username: username, password: password }, (err, user) => {
			if (!user) {
				//No found users
				return done(null, false);
			} else {
				//found users
				return done(null, user);
			}
		});
	})
);

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (_id, done) {
	Users.findById(_id, function (err, user) {
		done(err, user);
	});
});
//PASSPORT CONFIG ENDS HERE

//USERS RESPONSE HANDLER
const UsersResponseHandler = (response, status, user, message) => {
	if (!message) {
		if (status) {
			message = "Success";
		} else {
			message = "Unsuccessful";
		}
	}
	if (!user) {
		response.json({ status: status, message: message });
	} else {
		response.json({ status: status, message: message, user: user });
	}
};
//USERS LOGIN HANDLER
const LoginHandler = (req, res, user) => {
	req.login(user, (err) => {
		if (err) {
			UsersResponseHandler(res, false, null, err.message);
		} else {
			passport.authenticate("local")(req, res, () => {
				if (req.isAuthenticated()) {
					Users.findOneAndUpdate(
						{ username: req.user.username, _id: req.user._id },
						{ isLogIn: true },
						(uerr, user) => {
							if (!uerr) {
								req.session.save();
								UsersResponseHandler(res, true, req.user, "Login Successful.");
							} else {
								UsersResponseHandler(res, false, null, uerr.message);
							}
						}
					);
				} else {
					UsersResponseHandler(res, false, null, "Login Unsuccessful.");
				}
			});
		}
	});
};

//LOGIN
//RETURN ALL USER INFO ON SUCCESSFUL LOGIN
router.post("/login", (req, res) => {
	if (!req.isAuthenticated()) {
		// LOGIN IF AUTHENTICATED
		const user = new Users({
			username: req.body.username,
			password: req.body.password,
		});
		LoginHandler(req, res, user);
	} else {
		if (req.user) {
			Users.findById(req.user._id, (err, user) => {
				if (!err) {
					if (user) {
						UsersResponseHandler(res, true, user, "Successfully ReLogin");
					} else {
						UsersResponseHandler(res, false, null, "No user found.");
					}
				} else {
					UsersResponseHandler(res, false, null, err.message);
				}
			});
		}
	}
});

//LOGOUT CURRENT USER
//RETURNS USERNAME
router.post("/logout", function (req, res) {
	if (!req.user) {
		UsersResponseHandler(res, false, null, "ERROR Logging out Unsuccessful.");
	} else {
		Users.findOneAndUpdate({ username: req.user.username, _id: req.user._id }, { isLogIn: false }, (uerr, user) => {
			if (!uerr) {
				req.session.destroy();
				req.logout();
				UsersResponseHandler(res, true, { username: user.username }, "Logged out Successful.");
			} else {
				UsersResponseHandler(res, false, null, uerr.message);
			}
		});
	}
});

//GET USER INFO BY NAME | VALIDATES IF CURRENT USER IS SAME WITH THE PARAMS
//RETURN USERNAME AND EMAIL ONLY IF NOT THE CURRENT USER ELSE ALL USER INFO
router.get("/:username", (req, res) => {
	if (req.isAuthenticated()) {
		Users.findOne({ username: req.params.username }, (err, user) => {
			if (!err) {
				let userInfo;
				if (req.params.username === req.user.username) {
					//RETURN CURRENT USER ALL INFO
					userInfo = user;
				} else {
					if (user) {
						//RETURN USERNAME ONLY AND EMAIL IF NOT THE CURRENT USER
						userInfo = { username: user.username, email: user.email };
					} else {
						userInfo = { username: "", email: "" };
					}
				}
				UsersResponseHandler(res, true, userInfo, "Authenticated.");
			} else {
				UsersResponseHandler(res, true, null, err.message);
			}
		});
	} else {
		UsersResponseHandler(res, false, null, "Failed to authenticate.");
	}
});

//CREATE USER
router.put("/register", (req, res) => {
	const newUser = new Users();
	newUser.username = req.body.username;
	newUser.password = req.body.password;
	newUser.email = req.body.email;
	newUser.firstName = req.body.firstName;
	newUser.lastName = req.body.lastName;
	newUser.isLogIn = req.body.isLogIn;
	Users.register(newUser, req.body.password, (err, user) => {
		if (!err) {
			Users.find({ username: req.body.username }, (newerror, newuser) => {
				if (!newerror) {
					UsersResponseHandler(res, true, newuser, "Successfully registered.");
				} else {
					UsersResponseHandler(res, false, null, newerror.message);
				}
			});
		} else {
			UsersResponseHandler(res, false, null, err.message);
		}
	});
});

//UPDATE USER
router.post("/update", (req, res) => {
	if (req.isAuthenticated()) {
		if (req.user.username === req.body.username) {
			const userUpdate = {
				username: req.body.username,
				password: req.body.password,
				email: req.body.email,
				firstName: req.body.firstName,
				lastName: req.body.lastName,
				isLogIn: false,
			};

			Users.updateOne({ username: userUpdate.username, password: userUpdate.password }, userUpdate, (err, user) => {
				if (!err) {
					UsersResponseHandler(res, true, user, "User update successful");
				} else {
					UsersResponseHandler(res, false, null, "User update failed. " + err.message);
				}
			});
		} else {
			UsersResponseHandler(res, false, null, "Not authorized to update. Username not the same with current user");
		}
	} else {
		UsersResponseHandler(res, false, null, "Not authorized to update");
	}
});

module.exports = router;
