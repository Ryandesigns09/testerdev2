var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');

mkdirp.sync('./var/db');

var db = new sqlite3.Database('./var/db/todos.db');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    username TEXT, \
    name TEXT, \
    battlebadge TEXT, \
    whitelist TEXT DEFAULT no, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
  )").run("ALTER TABLE users ADD COLUMN address TEXT", function(err){
    if(!err){
      console.log("column added");
    }
  });
  
});

module.exports = db;
