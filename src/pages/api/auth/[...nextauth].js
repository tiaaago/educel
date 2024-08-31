import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Users from "@/utils/database/models/Users.js";
import Roles from "@/utils/database/models/Roles.js";
import dbConnection from "@/utils/database/mongoConnect";
import { checkPassword } from "@/utils/hashSystem";
import { verify } from 'hcaptcha';
dbConnection();

export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "E-mail", type: "text", placeholder: "E-mail" },
                password: { label: "Senha", type: "password", placeholder: "Senha" },
                "token": { label: "token" }
            },
            async authorize(credentials, req) {
                if (credentials.token != "createdAccount") {
                    const captchaVerify = await verify(process.env.HCAPTCHA_SECRET, credentials.token);
                    if (captchaVerify.success == false) return null;
                }

                const user = await Users.findOne({ email: credentials.email }).select('+password +email')
                if (!user) return null;
                if (credentials.token == "createdAccount" && Date.now() > user.createdAt.getTime() + 30000) return null;

                const infos = { email: user.email, name: user.name, password: user.password }

                const verifyPassword = await checkPassword(credentials.password, infos.password)

                if (verifyPassword) {
                    await Users.findOneAndUpdate(
                        { email: credentials.email },
                        { lastLogin: new Date() }
                    )
                    
                    return infos
                } else {
                    return null
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            return user
        },
        async session({ session, user, token }) {
            const userInfos = await Users.findOne({ email: session.user.email }).select('+pushNotificationData')
            const roles = await Roles.find()

            session.user = {
                ...userInfos._doc,
                roles: roles?.filter(role => userInfos.roles?.find(userRole => userRole == role.id)).map(role => role)
            }

            return session
        },
        async jwt({ token, user, account, profile, isNewUser }) {
            return token
        }
    },
}

export default NextAuth(authOptions)