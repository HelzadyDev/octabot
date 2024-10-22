import { Command } from "#base";
import { embedReply, reply } from "#functions";
import { settings } from "#settings";
import { brBuilder } from "@magicyan/discord";
import { ApplicationCommandType } from "discord.js";

new Command({
  name: "ping",
  description: "Replies with pong 🏓",
  type: ApplicationCommandType.ChatInput,
  async run(interaction) {
	await interaction.deferReply({ ephemeral });
    const { client } = interaction;

    // Obitem o ping do gateway
    const gatewayping = client.ws.ping;

    // Mensagem inicial para calular o ping da api
    const startTime = Date.now();
    await reply.primary({
    	interaction,
		update: true,
    	text: `Calculando o ping da API ${settings.emojis.animated.louding}`
    })
    
    // calculando o ping
    const apiping = Date.now() - startTime;

    setTimeout(async() => {
		await embedReply({
      interaction,
      update: true,
      color: settings.colors.primary,
      embed: {
        description: brBuilder(
          `:ping_pong: | API Ping: ${apiping}ms`,
          `:stopwatch: | Geteway Ping: ${gatewayping}ms`
        ),
      },
    });
	}, 10000);
  },
});
