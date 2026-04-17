const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const SlashsArray = [];

  const commandsFolder = path.join(__dirname, "../commands");

  const loadCommands = (folderPath) => {
    fs.readdirSync(folderPath).forEach((file) => {
      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        loadCommands(fullPath);
      } else if (file.endsWith(".js")) {
        const command = require(fullPath);
        if (!command?.name) return;

        client.slashCommands.set(command.name, command);
        SlashsArray.push(command);
      }
    });
  };

  loadCommands(commandsFolder);

  client.on("ready", async () => {
    client.guilds.cache.forEach((guild) => guild.commands.set(SlashsArray));
  });
};