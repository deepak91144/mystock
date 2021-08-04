exports.checkUserLoggedIn = async (req, res, next) => {
	const loggedInUser = req.session.user;
	if (loggedInUser) {
		next();
	} else {
		res.redirect("/login");
	}
};
exports.updateUser = async (req, res) => {
	const userId = req.params.userId;
	const user = await userModel.findById(userId);
	if (user) {
		res.render("frontend/UpdateUser", { user: user });
	}
};
