const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const session = require("express-session");
require("dotenv").config();

const port = process.env.PORT || 5000;
const app = express();
require("./database");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(express.static("public"));
app.use(
	session({
		secret: "XTR29",
		resave: false,
		saveUninitialized: true,
		cookie: {
			maxAge: 1000 * 60 * 60,
		},
		// cookie: {
		// 	sameSite: "none",
		// 	secure: "auto",
		// },
	})
);

app.use(passport.initialize());
app.use(passport.session());

//FOR THE CORS PROBLEM
app.use((req, res, next) => {
	// Website you wish to allow to connect
	// res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
	let origin = req.headers.origin;
	if (origin === undefined) {
		origin = "*";
	}
	res.setHeader("Access-Control-Allow-Origin", origin);

	// Request methods you wish to allow
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

	// Request headers you wish to allow
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader("Access-Control-Allow-Credentials", true);

	// Pass to next layer of middleware
	next();
});

// app.use((req, res, next) => {
// 	console.log(req.session);
// 	next();
// });

const users = require("./api/users");
app.use("/api/users", users);

const budgets = require("./api/budgets");
app.use("/api/budgets", budgets);

const pageview = require("./api/pageview");
app.use("/api/pageviews", pageview);

app.get("/", (req, res) => {
	res.sendStatus(404);
});

app.get("/favico.ico", (req, res) => {
	res.sendStatus(404);
});

app.get("/testglobal", (req, res) => {
	if (req.isAuthenticated()) {
		res.json({
			status: true,
			message: "YOU ARE AUTHENTICATED FROM TESTGLOBAL",
			user: req.user,
		});
	} else {
		res.json({ status: false, message: "Failed to authenticate" });
	}
});

app.listen(port, () => {
	console.log("SERVER STATED AT PORT " + port);
});
