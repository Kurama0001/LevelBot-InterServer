const fs = require('fs');
const Djs = require('discord.js');
const FileDatabase = JSON.parse(fs.readFileSync("./Database.json"));

const Client = new Djs.Client({ intents: 32767 });
Client.login("TOKEN");

Client.on('ready', () => console.log(Client.user.tag));

//Les commandes
Client.on('messageCreate', async (message) => {
  if(message.author.bot) return;
  if(message.channel.type !== "GUILD_TEXT" && message.channel.type !== "GUILD_NEWS") return;

  if(message.content.startsWith(`${!FileDatabase[message.guild.id] || !FileDatabase[message.guild.id].Prefix ? "//" : FileDatabase[message.guild.id].Prefix}setup`)) {
    if(!FileDatabase[message.guild.id]) {
      FileDatabase[message.guild.id] = { Prefix: "//" }
      await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase));
      return message.reply({ content: "**:white_check_mark: Le serveur est configuré avec succès!**" });
    } else {
      return message.reply({ content: "**:x: Le serveur est déjà configuré!**" });
    }
  };

  if(!FileDatabase[message.guild.id] || !FileDatabase[message.guild.id].Prefix && message.content.startsWith("//")) return message.reply({ content: "**:x: Le serveur n'est pas configuré! `//setup`**" });
  const Args = message.content.slice(FileDatabase[message.guild.id].Prefix.length).split(/ +/);

  if(message.content.startsWith(`${FileDatabase[message.guild.id].Prefix}prefix`)) {
    await Args.shift("prefix"); //Nom de la commande
    if(FileDatabase[message.guild.id] .Prefix === Args[0]) {
      return message.reply({ content: "**:x: Le préfix indiqué est le préfix actuel!**" });
    };

    FileDatabase[message.guild.id].Prefix = Args[0];
    await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase));

    return message.reply({ content: `**:white_check_mark: Le préfix a été modifié par \`${Args[0]}\`!**` });
  };

  if(message.content.startsWith(`${FileDatabase[message.guild.id].Prefix}configlevel`)) {
    await Args.shift("configlevel");
    if(Args[0] === "on") {
      if(FileDatabase[message.guild.id].Level !== undefined && FileDatabase[message.guild.id].Level.Statut === true) return message.reply({ content: "**:x: Le système est déjà activé!**" });
      FileDatabase[message.guild.id].Level = { Statut: true };
      await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase));

      return message.reply({ content: "**:white_check_mark: Le système de niveau a été activé!**" });
    } else if(Args[0] === "off") {
      if(!FileDatabase[message.guild.id].Level) return message.reply({ content: "**:x: Le système est déjà désactivé!**" });
      FileDatabase[message.guild.id].Level.Statut = false;
      await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase));

      return message.reply({ content: "**:white_check_mark: Le système de niveau a été désactivé!**" });
    } else {
      return message.reply({ content: "**:x: Veuillez indiquer entre `on & off` pour le système de niveau!**" });
    }
  };

  if(message.content.startsWith(`${FileDatabase[message.guild.id].Prefix}rank`)) {
    await Args.shift("rank");

    const Member = message.mentions.members.first() || message.guild.members.cache.get(Args[0]) || message.member;
    if(!FileDatabase[message.guild.id].Level.Members[Member.user.id]) return message.reply({ content: "**:x: Profil introuvable!**" });

    return message.reply({ embeds: [new Djs.MessageEmbed().setColor("BLURPLE").setDescription(`Profil de ${Member} :\n> **Niveau: ${FileDatabase[message.guild.id].Level.Members[Member.user.id].Level}\n> Expérience: ${FileDatabase[message.guild.id].Level.Members[Member.user.id].XP} / ${FileDatabase[message.guild.id].Level.Members[Member.user.id].Level * 100}**`)] });
  }
});

Client.on('messageCreate', async (message) => {
  if(message.author.bot) return;
  if(message.channel.type !== "GUILD_TEXT" && message.channel.type !== "GUILD_NEWS") return;
  if(!FileDatabase[message.guild.id] || !FileDatabase[message.guild.id].Level || FileDatabase[message.guild.id].Level.Statut !== true) return;

  if(message.content.startsWith(FileDatabase[message.guild.id].Prefix)) return;

  if(!FileDatabase[message.guild.id].Level.Members) { FileDatabase[message.guild.id].Level.Members = { [message.author.id]: { Level: 1, XP: 0, TotalXP: 0 } }; return await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase)); };
  if(FileDatabase[message.guild.id].Level.Members && !FileDatabase[message.guild.id].Level.Members[message.author.id]) { FileDatabase[message.guild.id].Level.Members[message.author.id] = { Level: 1, XP: 0, TotalXP: 0 }; return await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase)); }
  else {
    const RandomXP = Math.floor(Math.random() * 16);
    if((FileDatabase[message.guild.id].Level.Members[message.author.id].Level * 100) <= (FileDatabase[message.guild.id].Level.Members[message.author.id].XP + RandomXP)) {
      FileDatabase[message.guild.id].Level.Members[message.author.id] = {
        Level: FileDatabase[message.guild.id].Level.Members[message.author.id].Level + 1,
        XP: 0,
        TotalXP: FileDatabase[message.guild.id].Level.Members[message.author.id].TotalXP + RandomXP
      }

      await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase));
      return message.channel.send({ content: `**Bien joué ${message.author}, tu es maintenant niveau \`${FileDatabase[message.guild.id].Level.Members[message.author.id].Level}\`!**` });
    } else {
      FileDatabase[message.guild.id].Level.Members[message.author.id] = {
        Level: FileDatabase[message.guild.id].Level.Members[message.author.id].Level,
        XP: FileDatabase[message.guild.id].Level.Members[message.author.id].XP + RandomXP,
        TotalXP: FileDatabase[message.guild.id].Level.Members[message.author.id].TotalXP + RandomXP
      }
      return await fs.writeFileSync('./Database.json', JSON.stringify(FileDatabase));
    }
  }
})