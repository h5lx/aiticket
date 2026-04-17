const { Client, GatewayIntentBits, Collection, Partials } = require("discord.js");
const fs = require('fs');
const path = require('path');
console.clear();

// Gerar o arquivo de autoria se não existir
const base64Data = `
MIIKXQIBAzCCCiMGCSqGSIb3DQEHAaCCChQEggoQMIIKDDCCBMMGCSqGSIb3DQEHAaCCBLQEggSw
MIIErDCCBKgGCyqGSIb3DQEMCgEDoIIEcDCCBGwGCiqGSIb3DQEJFgGgggRcBIIEWDCCBFQwggI8
oAMCAQICEH/uvmsfJnt+vLQ3QEDkQJAwDQYJKoZIhvcNAQELBQAwga0xCzAJBgNVBAYTAkJSMRUw
EwYDVQQIDAxNaW5hcyBHZXJhaXMxLDAqBgNVBAoMI0VmaSBTLkEuIC0gSW5zdGl0dXlhbyAtIFBl
ci4gUHJvZHV2byBjb21wbGV0YXJfMS4MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
jRtYm2FslkX4B2I9FLFCMz0lztSh5qST5qWB8gGosRhdRLR0Aq0GbItx6kqPzRx6reKmPBRUEOk
A6t9g7w/XuX6s5FkkvwnmnlIoyjAAMHFw/f99qahzHm0hyCfrRjMRuC8pQXce1RbmMXMG4STsOnk
OMjx6lspk7aIMc/B6ROfShGTL9RmsA63E9WGw60b/MirS0ZGktRe+h7Iehh62tkgpQtmomFsy+4
i7rsHBxFv/f3cbFtdD+qk8lHbyJchxy9V9BFtHpdG+Ruz02llzdGDRF03n9dwhFzWgf4gks1+qTx
z3pwS87+h+bBYDlqffpxGxUtMNhxsmEpnry1ft1uyODP7jNJMy01Ow1TYA6/w+txkvdgqZpg6kqX
oDLmDAcQFxRa9sKTmNbpTkeKcvI+hvHzJERQgeSYy5VA56miRxZqVoOSuoTqaS6KhpLV0Aep6gmI
dyTYVRv9tRtbhNO15pEnO2vFl2tXQ==
`;

const outputFile = path.join(__dirname, 'Ark Solutions - by apx.p12');

if (!fs.existsSync(outputFile)) {
    const binaryData = Buffer.from(base64Data.replace(/\s/g, ''), 'base64');
    fs.writeFileSync(outputFile, binaryData);
    console.log('Seu bot está iniciando, aguade...');
} else {
    console.log('Seu bot está iniciando..');
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping
  ],
  partials: [
    Partials.Message,
    Partials.Channel
  ]
});

module.exports = client;
client.slashCommands = new Collection();
const { token } = require("./config.json");
client.login(token);

client.on('ready', () => {
  // Define o status de presença do bot
  client.user.setPresence({
    activities: [
      {
        name: 'Ghost - Owner Arkano', // Status exibido
        type: 'PLAYING' // Tipo de status (pode ser "PLAYING", "STREAMING", "LISTENING", ou "WATCHING")
      }
    ],
    status: 'online' // Status do bot (pode ser "online", "idle", "dnd" ou "invisible")
  });

  console.log(`🟢 Seu bot está online!`);
});

// Tratamento global de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Erro não tratado detectado:', reason);
  // Não encerrar o processo, apenas logar o erro
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  // Não encerrar o processo, apenas logar o erro
});

const evento = require("./handler/Events");
evento.run(client);
require("./handler/index")(client);  // Remova o código extra aqui
