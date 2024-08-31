import dbConnection from '@/utils/database/mongoConnect';
import Users from '@/utils/database/models/Users';
import Roles from '@/utils/database/models/Roles';
import Posts from '@/utils/database/models/Posts';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth].js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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
        if (req.query.id == 1) return res.status(200).json({ message: "Esse cargo não pode ser alterado." })
        const role = await Roles.findOne({ id: req.query.id })
        res.status(200).json(role)
    } else if (req.method == "POST") {
        const body = JSON.parse(req.body)

        await Roles.findOneAndUpdate(
            { id: req.query.id },
            {
                name: body.name,
                isClass: body.isClass,
                permissions: body.permissions,
            }
        )

        res.status(200).json({ message: "200 OK" })
    } else if (req.method == "DELETE") {
        await Roles.findOneAndDelete({
            id: req.query.id
        })

        await Users.updateMany(
            {},
            { $pull: { roles: req.query.id } }
        )

        await Posts.updateMany(
            {},
            { $pull: { from: req.query.id } }
        )

        res.status(200).json({ message: "200 OK" })
    }
}