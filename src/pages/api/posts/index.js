import dbConnection from '@/utils/database/mongoConnect';
import Roles from '@/utils/database/models/Roles';
import Posts from '@/utils/database/models/Posts';
import Users from '@/utils/database/models/Users';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth].js";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { sendNotification } from '@/utils/sendPushNotification';

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

    if (req.method == "GET") {
        const roles = await Roles.find()
        const posts = await Posts.find()
        const users = await Users.find()

        const treatedPosts = posts.map(post => {
            const author = users.find(user => user.id === post.author)
            return ({
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
        })

        res.status(200).json(treatedPosts)
    } else if (req.method == "POST") {
        const users = await Users.find().select('+pushNotificationData')
        let lastPostId = await Posts.find()
        lastPostId = lastPostId.sort((a, b) => b.id - a.id)[0]?.id
        const body = JSON.parse(req.body)

        await Posts.create({
            id: lastPostId ? lastPostId + 1 : 1,
            createdAt: Date.now(),
            author: body.author,
            from: body.from,
            fixed: body.fixed,
            content: body.content
        });

        console.log(body.from)

        if (body.from.find(roleId => roleId == 1)) {
            users.forEach(async user => {
                user.pushNotificationData?.filter(data => data.vapidKey == process.env.VAPID_PUBLIC).forEach(data => {
                    sendNotification(data.subscription, {
                        body: `Você tem novas postagens no mural!`,
                        icon: './favicon.ico',
                        data: {
                            url: `https://educel.vercel.app/portal?post=${lastPostId + 1}`
                        }
                    })
                        .catch(async err => {
                            if (err.toString().includes('WebPushError: Received unexpected response code')) {
                                await Users.findOneAndUpdate(
                                    { id: user.id },
                                    { $pull: { "pushNotificationData": data } }
                                )
                            }
                        })
                })
            })
        }

        res.status(200).json({ message: "200 OK" })
    }
}
