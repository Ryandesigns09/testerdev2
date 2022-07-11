var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');

mkdirp.sync('./var/db');

var db = new sqlite3.Database('./var/db/todos.db');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT, \
    name TEXT, \
    whitelist TEXT DEFAULT no \
  )").run("ALTER TABLE users ADD COLUMN address TEXT", function(err){
    if(!err){
      console.log("column added");
    }
  });
    db.run("CREATE TABLE IF NOT EXISTS federated_credentials ( \
    id INTEGER PRIMARY KEY, \
    user_id INTEGER NOT NULL, \
    provider TEXT NOT NULL, \
    subject TEXT NOT NULL, \
    UNIQUE (provider, subject) \
  )");

      db.run("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER PRIMARY KEY, \
    owner_id INTEGER NOT NULL, \
    title TEXT NOT NULL, \
    completed INTEGER \
  )");
});

module.exports = db;
