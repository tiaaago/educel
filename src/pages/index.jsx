import Head from 'next/head'
import styles from '@/styles/Login.module.css'
import { signIn, getSession } from 'next-auth/react';
import React, { useRef } from 'react';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);

    if (session) {
        return {
            redirect: {
                destination: '/portal',
                permanent: false,
            },
        }
    } else {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            }
        }
    }
}

export default function Home() {
    return (
        <></>
    )
}