import dbConnection from '@/utils/database/mongoConnect.js';
import Roles from '@/utils/database/models/Roles.js';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth].js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 s"),
})

function randomStr(len, arr) {
    var ans = '';
    for (var i = len; i > 0; i--) {
        ans +=
            arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}


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
        const roles = await Roles.find();

        res.status(200).json(roles)
    } else if (req.method == "POST") {
        const roles = await Roles.find()
        const sortIdRoles = [...roles]?.sort((a, b) => b.id - a.id)
        const sortIdPosition = [...roles]?.sort((a, b) => b.position - a.position)
        const body = JSON.parse(req.body)

        await Roles.create({
            id: sortIdRoles[0].id + 1,
            position: sortIdPosition[0].position + 1,
            name: body.name,
            permissions: body.permissions,
            isClass: body.isClass
        })

        res.status(200).json({ message: "200 OK" })
    } else if (req.method == "PATCH") {
        const body = JSON.parse(req.body)

        body.roles.forEach(async role => {
            await Roles.findOneAndUpdate(
                { id: role.id },
                { position: role.position }
            )
        })

        res.status(200).json({ message: "200 OK" })
    }
}