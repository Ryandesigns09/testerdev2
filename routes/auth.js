var express = require('express');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter');
var querystring = require('querystring');
var db = require('../db');


function jitProvision(provider, profile, cb) {
  db.get('SELECT * FROM federated_credentials WHERE provider = ? AND subject = ?', [
    provider,
    profile.id
  ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) {
      db.run('INSERT INTO users (name, username) VALUES (?, ?)', [
        profile.displayName,
        profile.username
              
      ], function(err) {
        if (err) { return cb(err); }
        var id = this.lastID;
        db.run('INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)', [
          id,
          provider,
          profile.id
        ], function(err) {
          if (err) { return cb(err); }
          var user = {
            id: id,
            name: profile.displayName
          };
          return cb(null, user);
        });
      });
    } else {
      db.get('SELECT * FROM users WHERE id = ?', [ row.user_id ], function(err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false); }
        return cb(null, row);
      });
    }
  });
}

passport.use(new TwitterStrategy({
    consumerKey:  "qjmAaQarYKSqEJ1Pf3qu5FXFD",
    consumerSecret: "ZJk1TNnSa7fXCalCLAixDIjXLNtjpAEMDMPGP9bwxFpeZLdHyX",
    callbackURL: "https://marred-pacific-caterpillar.glitch.me/oauth/callback/twitter"
}, function verify(token, tokenSecret, profile, cb) {
  return jitProvision('https://twitter.com', profile, function(err, user) {
    if (err) { return cb(err); }
    var cred = {
      id: profile.id,
      provider: 'https://twitter.com'
    };
    if (profile.username) {
      cred.id = profile.username;
    }
    if (profile.emails && profile.emails[0]) {
      cred.id = profile.emails[0].value;
    }
    if (profile.displayName) {
      cred.name = profile.displayName;
    }
    if (profile.whitelist) {
      cred.whitelist = profile.whitelist;
    }    
        if (profile.battlebadge) {
      cred.battlebadge = profile.battlebadge;
    }    


        if (profile.whitelist == "yes") {
    whitelist_string = 'Congratluations! You are whitelsited'}


    return cb(null, user, { credential: cred });
  });
}));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name, whitelist: user.whitelist, battlebadge: user.battlebadge });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    db.get('SELECT * FROM users WHERE id = ?', [ user.id ], function(err, row) {
      if (err) { return cb(err); }
      if (!row) { return cb(null, false); }
      return cb(null, { id: row.id, username: row.username, name: row.name, whitelist: row.whitelist, battlebadge: row.battlebadge });
    });
  });
});


function setFederatedCredentialCookie(req, res, next) {
  var credential = req.authInfo.credential;
  if (!credential) { return next(); }
  res.cookie('fc', querystring.stringify(credential));
  next();
}

var router = express.Router();

router.get('/login', function(req, res, next) {
  res.render('login');
});


router.get('/login/federated/twitter', passport.authenticate('twitter'));

router.get('/oauth/callback/twitter', passport.authenticate('twitter', {
  failureRedirect: '/login'
}), setFederatedCredentialCookie, function(req, res, next) {
  res.redirect('/');
});

router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
