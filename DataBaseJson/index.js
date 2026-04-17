const {
    JsonDatabase,
  } = require("wio.db");
  
  const general = new JsonDatabase({
    databasePath: "./DataBaseJson/general.json"
  });
  
  const tickets = new JsonDatabase({
    databasePath: "./DataBaseJson/ticket.json"
  });
  
  
  module.exports = {
    general,
    tickets
  }