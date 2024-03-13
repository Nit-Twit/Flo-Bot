const mongoose = require('mongoose');
const MONGODBURL = process.env.MONGODBURL;

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {

        if (!MONGODBURL) return;

        mongoose.connect(MONGODBURL || '', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            rejectUnauthorized: false
        })


        if (mongoose.connect) {
            console.log('mongoose connected :)')
            client.user.setPresence({ activities: [{ name: '/help | v1.0.0' }], status: 'online' });
            console.log('Ready!');
        }

        async function pickPresence() {
            const option = Math.floor(Math.random() * statusArray.length);

            try {
                await client.user.setPresence({
                    activities: [
                        {
                            name: statusArray[option].content,
                            type: statusArray[option].type,

                        },

                    ],

                    status: statusArray[option].status
                })
            } catch (error) {
                console.error(error);
            }
        }
    },
};