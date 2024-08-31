// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import dbConnection from '@/utils/database/mongoConnect.js';
import Users from '@/utils/database/models/Users.js';
import { sendNotification } from '@/utils/sendPushNotification';

export default async function handler(req, res) {
    dbConnection();

    if (req.method == "GET") {
        const user = await Users.findOne({ id: req.query.id }).select('+pushNotificationData')

        user.pushNotificationData?.filter(data => data.vapidKey == process.env.VAPID_PUBLIC).forEach(data => {
            sendNotification(data.subscription, {
                body: 'Teste',
                icon: './favicon.ico',
                data: {
                    url: 'https://google.com/'
                }
            })
        })

        res.status(200).json({ message: "200 OK" })
    }
}
