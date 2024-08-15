const { MessageEmbed, PermissionFlagsBits, SlashCommandBuilder } = require("discord.js");
const Users = require('../../../model/user.js');
const Profiles = require('../../../model/profiles.js');
const config = require('../../../Config/config.json');

module.exports = {
    commandInfo: {
        name: "delete",
        description: "Deletes a user's account",
        options: [
            {
                name: "username",
                description: "Target username.",
                required: true,
                type: 3
            }
        ]
    },
    execute: async (interaction) => {

        if (!config.moderators.includes(interaction.user.id)) {
            return interaction.reply({ content: "You do not have moderator permissions.", ephemeral: true });
        }

        const username = interaction.options.getString('username');
        const deleteAccount = await Users.findOne({ username: username });

        if (!deleteAccount) {
            await interaction.reply({ content: "The selected user does not have **an account**", ephemeral: true });
            return;
        }

        await Users.deleteOne({ username: username });
        await Profiles.deleteOne({ username: username });

        const embed = new MessageEmbed()
            .setTitle("Account deleted")
            .setDescription(`The account for **${username}** has been **deleted**`)
            .setColor("GREEN")
            .setFooter({
                text: "Reload Backend",
                iconURL: "https://i.imgur.com/2RImwlb.png"
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        try {
            const user = await interaction.client.users.fetch(deleteAccount.discordId);
            if (user) {
                await user.send({ content: `Your account has been deleted by <@${interaction.user.id}>` });
            }
        } catch (error) {
            // Nothing Uwu or just use: console.error('Could not send DM:', error);
        }
    }
};