import dbConnection from '@/utils/database/mongoConnect.js';
import Users from '@/utils/database/models/Users.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth].js";
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 s"),
})


export default async function handler(req, res) {
    dbConnection();

    const session = await getServerSession(req, res, authOptions)
    if (!session && req.method != "GET") return res.status(401).json({ message: '401 Unauthorized' })

    if (req.method != "GET") {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        const { success } = await ratelimit.limit(ip)
        if (!success) return res.status(429).json({ message: "429 Too Many Requests" })
    }

    if (req.method == "POST") {
        const users = await Users.find().select('+pushNotificationData')
        const body = JSON.parse(req.body)

        if (body.roles.find(role => role == 1)) {
            users.forEach(async user => {
                const date = new Date(body.date).getTime()

                await Users.findOneAndUpdate(
                    { id: user.id },
                    { $push: { events: { id: body.id, name: body.name, timestamp: date, made: false } } }
                )
            })
        } else {
            users.filter(user => user.roles.find(role => body.roles.includes(role))).forEach(async user => {
                const date = new Date(body.date).getTime()

                await Users.findOneAndUpdate(
                    { id: user.id },
                    { $push: { events: { id: body.id, name: body.name, timestamp: date, made: false } } }
                )
            })
        }

        res.status(200).json({ message: "200 OK" });
    }

    if (req.method == "PUT") {
        const body = JSON.parse(req.body)
        const users = await Users.findOne({ id: body.userId })

        await Users.findOneAndUpdate(
            { id: body.userId },
            { $set: { events: body.events } }
        )

        res.status(200).json({ message: "200 OK" });
    }
}