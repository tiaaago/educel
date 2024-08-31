import Head from 'next/head'
import styles from '@/styles/Login.module.css'
import { signIn, getSession } from 'next-auth/react';
import React, { useRef } from 'react';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);
    const user = session.user

    if (session) {
        if (user.roles.find(role => role.permissions.length > 0)) {
            return {
                redirect: {
                    destination: '/management/announcements',
                    permanent: false,
                },
            }
        } else {
            return {
                redirect: {
                    destination: '/portal',
                    permanent: false,
                },
            }
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