import { Command, Responder, ResponderType } from "#base";
import { settings } from "#settings";
import {
  brBuilder,
  createEmbed,
  createEmbedAuthor,
  createRow,
} from "@magicyan/discord";
import { ApplicationCommandType, bold, ButtonBuilder, ButtonStyle } from "discord.js";
import { reply } from "#functions";

new Command({
  name: "ver informações",
  type: ApplicationCommandType.User,
  async run(interaction) {
      const { targetUser, client, guild } = interaction;

    

    await interaction.deferReply({ ephemeral });

    let member = guild.members.cache.get(targetUser.id); // Tenta obter o membro do cache do servidor (guild)

    // Se não encontrar o membro no cache, tenta buscar no servidor
    if (!member) {
      try {
        member = await guild.members.fetch(targetUser.id);
      } catch (error) {
        // Caso ocorra um erro ao buscar o membro, responde com uma mensagem de erro
        return reply.danger({
          interaction,
          update: true,
          text: "Não consegui obter as informações desse usuário.",
        });
      }
    }

    // Se o timestamp de entrada do membro no servidor não for encontrado, retorna erro
    if (!member.joinedTimestamp) {
      return reply.danger({
        interaction,
        update: true,
        text: "Não consegui obter as informações desse usuário.",
      });
    }

    // Obtém as datas de criação da conta do usuário e entrada no servidor, convertendo de milissegundos para segundos
    const creationDate = Math.floor(targetUser.createdTimestamp / 1000);
    const JoinedDate = Math.floor(member?.joinedTimestamp / 1000);

    // Embed com informações do usuário.
    const embedUserInfo = createEmbed({
      color: settings.colors.primary,
      title: targetUser.username,
      author: { name: "Informações sobre o usuário" },
      thumbnail: { url: targetUser.displayAvatarURL() ?? undefined },
      fields: [
        {
          name: `${settings.emojis.static.id} ID do Discord`,
          value: `\`${targetUser.id}\``,
          inline: true,
        },
        {
          name: `${settings.emojis.static.label} Tag do Discord`,
          value: `\`@${targetUser.username}\``,
          inline: true,
        },
        {
          name: `${settings.emojis.static.calendar} Data de Criação da Conta`,
          value: `<t:${creationDate}:f> (<t:${creationDate}:R>)`,
          inline: true,
        },
      ],
    });

    // Pega maior cargo do usuário.
    const highestRole = member?.roles.highest;

    const screeningStatus = member.pending
      ? `${settings.emojis.static.crossmark} Avaliação de Associação pendente.`
      : `${settings.emojis.static.check} Completou a Avaliação de Associação`;

    // Embed com inforções de membro
    const embedMemberInfo = createEmbed({
      color: settings.colors.magic,
      author: { name: "Informações sobre o membro" },
      title: targetUser.username,
      thumbnail: { url: targetUser.displayAvatarURL() ?? undefined },
      fields: [
        {
          name: `${settings.emojis.static.calendar} Data de Entrada no Servidor`,
          value: `<t:${JoinedDate}:f> (<t:${JoinedDate}:R>)`, // Data de entrada no servidor
          inline: true,
        },
        {
          name: "Maior Cargo",
          value: highestRole ? `${highestRole}` : "Nenhum cargo encontrado", // Data de criação da conta
          inline: true,
        },
        {
          name: "Curiosidade",
          value: brBuilder(screeningStatus),
          inline: false,
        },
      ],
    });

    const infoButtonsRow = createRow(
      new ButtonBuilder({
        customId: `button/info/avatar/${targetUser.id}`,
        label: "Ver avatar global do usuário",
        style: ButtonStyle.Primary,
      }),
      new ButtonBuilder({
        customId: `button/info/memberPermission/${targetUser.id}`,
        label: "Permições do membro",
        style: ButtonStyle.Primary,
      })
    );

    

    // Switch para lidar com diferentes tipos de usuários (cliente, bot, ou usuário comum)
    switch (true) {
      case targetUser.id === client.user.id:
        // Resposta se o usuário alvo for o próprio bot (cliente)

        const embedClientInfo = createEmbed({
          color: settings.colors.nitro,
          author: { name: "Infomações sobre o aplicativo" },
          title: `${client.user.displayName}`,
          thumbnail: { url: targetUser.displayAvatarURL() ?? undefined },
          description: brBuilder(
            ":wave: Olá!",
            ":kissing_heart: Meu nome é Titania",
            ":man_tipping_hand: Precisar de ajuda? https://discord.gg/5m3gM6VE8P"
          ),
          fields: [
            {
              name: `${settings.emojis.static.id} Id do Servidor de suporte`,
              value: "`1296238610323869706`",
              inline: true,
            },
            {
              name: `${settings.emojis.static.label} Marcadores`,
              value: "personalização, painel, diversão, uso geral, moderação",
              inline: true,
            },
            {
              name: `:bug: Slug`,
              value: "`titania`",
              inline: true,
            },
            {
              name: "Curiosidades Interesantes",
              value: brBuilder(
                `${settings.emojis.static.check} Público`,
                `${settings.emojis.static.crossmark} Requer Código de Autenticação via OAuth2`,
                `${settings.emojis.static.crossmark} Usa Interação Via HTTP`,
                `${settings.emojis.static.crossmark} Intent de Presenças Pelo Gateway`,
                `${settings.emojis.static.check} Intent de Membros de Servidores`,
                `${settings.emojis.static.check} Intent de Conteúdo de Mensagens`
              ),
              inline: false,
            },
            {
              name: ":computer: Chave Pública de Verificação de Requisições HTTP",
              value:
                "`ef19c6eeceb66894bbfbb4d17223a65651b4ad6347fcf1eefadc64d44f033998`",
              inline: false,
            },
          ],
        });

        await interaction.editReply({
          embeds: [embedUserInfo, embedMemberInfo, embedClientInfo],
          components: [infoButtonsRow],
        });
        break;

      case targetUser.bot && targetUser.id !== client.user.id:
        // Resposta se o usuário alvo for um bot de terceiros

        const embedBotsInfo = createEmbed({
          description: brBuilder("test"),
        });

        await interaction.editReply({
          embeds: [embedUserInfo, embedMemberInfo, embedBotsInfo],
          components: [infoButtonsRow],
          content: "bot de terceiros",
        });

        break;

      default:
        // Resposta para um usuário comum

        await interaction.editReply({
          embeds: [embedUserInfo, embedMemberInfo],
          components: [infoButtonsRow],
        });

        break;
    }
  },
});

new Responder({
  customId: "button/info/avatar/:targetUser",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction, { targetUser }) {
    await interaction.deferReply({ ephemeral });
    const { client } = interaction;

    const targetUserID = await client.users.fetch(targetUser);

    const embed = createEmbed({
      color: settings.colors.primary,
      author: createEmbedAuthor(targetUserID),
      image: { url: targetUserID.displayAvatarURL() },
    });

    const row = createRow(
      new ButtonBuilder({
        url: targetUserID.displayAvatarURL({ size: 2048 }),
        label: "Abrir Avatar no Navegador",
        style: ButtonStyle.Link,
      })
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
});

new Responder({
  customId: "button/info/memberPermission/:targetUser",
  type: ResponderType.Button,
  cache: "cached",
  async run(interaction, { targetUser }) {
    await interaction.deferReply({ephemeral});
    const { guild } = interaction;

    const member = await guild.members.fetch(targetUser);

    if(!member){
      return reply.danger({
        interaction,
        update: true,
        text: "Usuário não encontrado"
      })
    }

    const permissions = member.permissions.toArray();

    const permissionsList = permissions.length > 0 ? permissions.join(", ") : "Sem Permissões Específicas";
    
    const embed = createEmbed({
      author: createEmbedAuthor(member.user),
      description: brBuilder(bold("Permissões do Usuário"), permissionsList)
    })

    await interaction.editReply({embeds: [embed]})
  },
});
 