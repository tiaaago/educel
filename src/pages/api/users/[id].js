// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import dbConnection from '@/utils/database/mongoConnect.js';
import Roles from '@/utils/database/models/Roles.js';
import Users from '@/utils/database/models/Users.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth].js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { hashPassword } from '@/utils/hashSystem.js';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 s"),
})

export default async function handler(req, res) {
    dbConnection();

    const session = await getServerSession(req, res, authOptions)
    if (!session && req.method != "GET") return res.status(401).json({ message: '401 Unauthorized' })

    if(req.method != "GET") {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
        const { success } = await ratelimit.limit(ip)
        if (!success) return res.status(429).json({ message: "429 Too Many Requests" })
    }

    if (req.method == "GET") {
        const user = await Users.findOne({ id: req.query.id })
        const roles = await Roles.find()

        res.status(200).json({
            ...user._doc,
            roles: roles.filter(role => user.roles?.find(userRole => userRole == role.id)).map(role => role)
        })
    } else if (req.method == "PATCH") {
        if (!session.user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR" || perm == "MANAGE_USERS"))) return res.status(403).json({ message: '403 Forbidden' })

        const body = req.body
        if (!body.email || !body.name || !body.roles) return res.status(404).json({ success: false, message: 'Preencha todos os campos!' })

        let password = body.password;
        if (password != null) password = await hashPassword(body.password)

        await Users.findOneAndUpdate(
            { id: req.query.id },
            { $set: password ? { email: body.email, name: body.name, password: password, roles: body.roles } : { email: body.email, name: body.name, roles: body.roles } }
        )

        res.status(200).json({ message: "200 OK" })
    }
}
