var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
 if (!req.secure && (req.headers.host.indexOf('localhost') < 0)) {
   res.redirect('https://' + req.headers.host + '/');
 } else {
	  res.redirect('/');
 }
}

module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
  // Display the Login page with any flash message, if any
		res.render('login/index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('login/register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
  var template = "";
  switch(req.user.type) {
  case "Admin":
		  template = 'admin/home';
    break;
  case "Operator":
    template = 'operator/home';
    break;
  default:
    template = 'player/home';
    break;
  }

  res.render(template, { user: req.user });
	});

	return router;
}





