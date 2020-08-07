const express = require("express");
const router = express.Router();
const Budgets = require("../models/budgets.js");

const addManyCounter = {
	countAdd: 0,
	countError: 0,
	countTotal: 0,
	countProcess: 0,
};

//BUDGETS RESPONSE HANDLER
const BudgetsResponseHandler = (response, status, budgets, message) => {
	if (!message) {
		if (status) {
			message = "Success";
		} else {
			message = "Unsuccessful";
		}
	}
	if (!budgets) {
		response.json({ status: status, message: message });
	} else {
		response.json({ status: status, message: message, budgets: budgets });
	}
};

//CREATE OR ADD NEW BUDGET
router.put("/add", (req, res) => {
	const newBudget = new Budgets();
	newBudget.username = req.body.username;
	newBudget.userID = req.body.userID;
	newBudget.type = req.body.type;
	newBudget.title = req.body.title;
	newBudget.note = req.body.note;
	newBudget.amount = req.body.amount;

	if (req.isAuthenticated()) {
		newBudget.save((err) => {
			if (!err) {
				Budgets.find({ username: newBudget.username }, (newerror, budgets) => {
					if (!newerror) {
						BudgetsResponseHandler(res, true, budgets, "Successfully added new budget");
					} else {
						BudgetsResponseHandler(res, false, null, newerror.message);
					}
				});
			} else {
				BudgetsResponseHandler(res, false, null, err.message);
			}
		});
	} else {
		BudgetsResponseHandler(res, false, null, "Add Failed to authenticate");
	}
});

//CREATE OR ADD NEW BUDGET
router.put("/addmany", (req, res) => {
	if (req.isAuthenticated()) {
		console.log(req.body);
		addManyCounter.countAdd = 0;
		addManyCounter.countError = 0;
		addManyCounter.countTotal = req.body.budgets.length;
		addManyCounter.countProcess = 0;

		if (req.body.budgets) {
			// SAVE BUDGETS
			var savingMany = new Promise((resolve, reject) => {
				req.body.budgets.forEach((budget, index) => {
					const budgetNew = new Budgets();
					budgetNew.username = req.body.username;
					budgetNew.userID = req.body.userID;
					budgetNew.type = budget.type;
					budgetNew.title = budget.title;
					budgetNew.amount = budget.amount;
					budgetNew.note = budget.note;

					budgetNew.save((err) => {
						console.log("EXECUTES SAVE EACH");
						if (err) {
							addManyCounter.countError = addManyCounter.countError + 1;
							console.log("ERROR COUNT");
							console.log(addManyCounter.countError);
							console.log(err.message);
						} else {
							addManyCounter.countAdd = addManyCounter.countAdd + 1;
							console.log("ADD COUNT");
							console.log(addManyCounter.countAdd);
						}

						addManyCounter.countProcess = addManyCounter.countProcess + 1;
						console.log("count Process inside SAVE");
						console.log(addManyCounter.countProcess);

						if (addManyCounter.countProcess === addManyCounter.countTotal) {
							resolve();
						}
					});
				});
			});
			savingMany.then(() => {
				// RETURN ALL BUDGETS RESULTS
				if (addManyCounter.countAdd > 0) {
					Budgets.find({ username: req.body.username, userID: req.body.userID }, (fErr, budgets) => {
						if (fErr) {
							BudgetsResponseHandler(res, false, null, fErr.message);
						} else {
							BudgetsResponseHandler(
								res,
								true,
								budgets,
								"Successfully added " +
									addManyCounter.countAdd +
									" of " +
									addManyCounter.countTotal +
									" with " +
									addManyCounter.countError +
									" error"
							);
						}
					});
				} else {
					BudgetsResponseHandler(res, false, null, addManyCounter.countError + " Error(s) during Bulk Addition");
				}
			});
		} else {
			BudgetsResponseHandler(res, false, null, "BUDGETS IS EMPTY");
		}
	} else {
		BudgetsResponseHandler(res, false, null, "Add Failed to authenticate");
	}
});

//UPDATE BUDGET
router.post("/update", (req, res) => {
	const budgetUpdate = {
		$set: { type: req.body.type, title: req.body.title, note: req.body.note, amount: req.body.amount },
	};
	console.log("BUDGET UPDATE API");
	console.log(req.body);

	if (req.isAuthenticated()) {
		Budgets.updateOne({ _id: req.body._id }, budgetUpdate, (err, result) => {
			if (!err) {
				Budgets.find({ username: req.body.username }, (errFind, budgetsFind) => {
					if (!errFind) {
						BudgetsResponseHandler(res, true, budgetsFind, "Successfully updated budget");
					} else {
						BudgetsResponseHandler(res, false, null, errFind.message);
					}
				});
			} else {
				BudgetsResponseHandler(res, false, null, err.message);
			}
		});
	} else {
		BudgetsResponseHandler(res, false, null, "Update Failed to authenticate");
	}
});

//UPDATE BUDGET
router.delete("/delete", (req, res) => {
	console.log("BUDGETE DELETE API");
	console.log(req.body);
	if (req.isAuthenticated()) {
		Budgets.deleteOne({ username: req.body.username, _id: req.body._id }, (err) => {
			if (!err) {
				Budgets.find({ username: req.body.username }, (errFind, budgetsFind) => {
					if (!errFind) {
						BudgetsResponseHandler(res, true, budgetsFind, "Successfully deleted from budget");
					} else {
						BudgetsResponseHandler(res, false, null, errFind.message);
					}
				});
			} else {
				BudgetsResponseHandler(res, false, null, err.message);
			}
		});
	} else {
		BudgetsResponseHandler(res, false, null, "Delete Failed to authenticate");
	}
});

//GET ALL BUDGETS
//RETURN ALL BUDGETS IF PARAMS USER AND CURRENT USER IS SAME
router.get("/:username", (req, res) => {
	const query = { username: req.params.username };

	// console.log(req.user.username);
	if (req.isAuthenticated()) {
		if (query.username === req.user.username) {
			Budgets.find(query, (err, budgets) => {
				if (!err) {
					BudgetsResponseHandler(res, true, budgets, "Authenticated FROM BUDGETS!!!");
				} else {
					BudgetsResponseHandler(res, false, null, err.message);
				}
			});
		} else {
			BudgetsResponseHandler(res, true, null, "Authenticated BUT BUDGETS ARE PRIVATE!!!");
		}
	} else {
		BudgetsResponseHandler(res, false, null, "Get Failed to authenticate");
	}
});

module.exports = router;
