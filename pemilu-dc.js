require('dotenv').config();

const { Client, Intents, IntentsBitField, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const { TOKEN, APPLICATION_ID } = process.env;
const bot = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

bot.on('ready', () => {
    console.log('Bot Online!');
});

const url = 'https://pemilu.bisnis.com/quick-count-2024';

async function getQuickCountData() {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Mengambil tanggal dan waktu terakhir pembaruan
        const lastUpdateDate = $('#date-indikator').text().trim();
        const lastUpdateTime = $('#time-indikator').text().trim();

        // Mengambil persentase data masuk
        const incomingDataPercentage = $('#incoming_data-indikator').text().trim();

        // Mengambil persentase quick count untuk setiap paslon
        const paslon1Persentase = $('#percentage-indikator-1').text().trim();
        const paslon2Persentase = $('#percentage-indikator-2').text().trim();
        const paslon3Persentase = $('#percentage-indikator-3').text().trim();

        return {
            lastUpdateDate,
            lastUpdateTime,
            incomingDataPercentage,
            paslon1Persentase,
            paslon2Persentase,
            paslon3Persentase
        };
    } catch (error) {
        console.error('Error:', error);
        return 'Terjadi kesalahan saat mengambil data quick count.';
    }
}


bot.on('messageCreate', async (message) => {
    if (message.content === '!qc') {
        const quickCountData = await getQuickCountData();
        if (quickCountData) {
            const embeds = [];
            embeds.push(
                new EmbedBuilder()
                    
                    .setAuthor({ name: 'Ezra Bot', iconURL: 'https://cdn.discordapp.com/avatars/1127105994766426122/e10f495c1d617ab94163c69b507e5399.png?size=4096'})
                    .setTitle('Quick Count Indikator')
                    .setDescription(`Tanggal: \`${quickCountData.lastUpdateDate} ${quickCountData.lastUpdateTime}\` \n Persentase Data Masuk: \`${quickCountData.incomingDataPercentage}\``)
                    .addFields(
                        { name: 'Paslon 1 Persentase', value: `${quickCountData.paslon1Persentase}`, inline: true },
                        { name: 'Paslon 2 Persentase', value: `${quickCountData.paslon2Persentase}`, inline: true },
                        { name: 'Paslon 3 Persentase', value: `${quickCountData.paslon3Persentase}`, inline: true }
                        )
                    .setFooter({ text: `Ezra Bot` })
            );
            message.reply({
                content: 'Ezra has finished scraping.',
                embeds: embeds,
            });
        } else {
            message.reply('Terjadi kesalahan saat mengambil data quick count.');
        }
    }
});
bot.login(process.env.TOKEN);
