// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import dbConnection from '@/utils/database/mongoConnect.js';
import Roles from '@/utils/database/models/Roles.js';
import Users from '@/utils/database/models/Users.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth].js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { verify } from 'hcaptcha';
import { hashPassword, checkPassword } from '@/utils/hashSystem.js';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 s"),
})

export default async function handler(req, res) {
    dbConnection();

    const session = await getServerSession(req, res, authOptions);
    if (!session && req.method != "GET") return res.status(401).json({ message: '401 Unauthorized' });

    const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
    const { success } = await ratelimit.limit(ip)
    if (!success) return res.status(429).json({ success: false, message: "429 Too Many Requests" })

    if (req.method == "PATCH") {
        const userWithPassword = await Users.findOne({ id: session.user.id }).select("+password")

        const body = req.body

        let password = body.password;
        if (password) {
            const verifyActualPassword = await checkPassword(body.actualPassword, userWithPassword.password)
            if (!verifyActualPassword) return res.status(404).json({ success: false, message: 'A senha atual informada não confere!' })

            password = await hashPassword(body.password)

            await Users.findOneAndUpdate(
                { id: session.user.id },
                { $set: {
                    password: password
                } }
            )
        }

        res.status(200).json({ message: "200 OK" })
    } else if (req.method == "PUT") {
        await Users.findOneAndUpdate(
            { id: session.user.id },
            JSON.parse(req.body)
        )

        res.status(200).json({ message: "200 OK" })
    }
}

