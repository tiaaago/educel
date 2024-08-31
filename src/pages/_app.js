import '@/styles/globals.css'
import { SessionProvider } from "next-auth/react"
import { useEffect } from 'react'
import Head from 'next/head'

export default function App({ Component, pageProps: { session, ...pageProps } }) {
    useEffect(() => {
        navigator.serviceWorker.register('/service-worker.js')
    }, [])

    return (
        <>
            <Head>
                <title>EduCEL</title>
            </Head>
            <SessionProvider session={session}>
                <Component {...pageProps} />
            </SessionProvider>
        </>
    )
}
