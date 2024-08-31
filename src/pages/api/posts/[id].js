import dbConnection from '@/utils/database/mongoConnect';
import Roles from '@/utils/database/models/Roles';
import Posts from '@/utils/database/models/Posts';
import Users from '@/utils/database/models/Users';
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
        const roles = await Roles.find()
        const users = await Users.find()
        const post = await Posts.findOne({ id: req.query.id })
        const author = users.find(user => user.id === post.author)

        res.status(200).json({
            ...post._doc,
            author: {
                id: author?.id,
                name: author?.name ? author.name : `Deleted User`,
                profilePicture: author?.profilePicture
            },
            from: post.from.map(role => {
                const findRole = roles.find(findRole => findRole.id === role)
                if (findRole) {
                    return ({
                        id: findRole.id,
                        name: findRole.name
                    })
                } else {
                    return ({
                        id: role,
                        name: null
                    })
                }
            })
        })
    } else if (req.method == "POST") {
        const post = await Posts.findOne({ id: req.query.id })
        const body = JSON.parse(req.body)

        var addOlderVersion = post.olderVersions.push({
            editedAt: Date.now(),
            editor: body.editor,
            oldContent: post.content,
            newContent: body.content,
            oldFrom: post.from,
            newFrom: body.from
        })

        await Posts.findOneAndUpdate(
            { id: req.query.id },
            {
                content: body.content,
                from: body.from,
                fixed: body.fixed,
                olderVersions: post.olderVersions
            }
        )

        res.status(200).json({ message: "200 OK" })
    } else if (req.method == "PUT") {
        await Posts.findOneAndUpdate(
            { id: req.query.id },
            JSON.parse(req.body)
        )

        res.status(200).json({ message: "200 OK" })
    } else if (req.method == "DELETE") {
        await Posts.findOneAndDelete({
            id: req.query.id
        })

        res.status(200).json({ message: "200 OK" })
    }
}