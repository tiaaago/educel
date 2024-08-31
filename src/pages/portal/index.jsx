import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Students.module.css'
import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import Navbar from '@/components/Navbar'
import DetectMobile from '@/utils/mobileCheck';
import { useRouter } from 'next/navigation'

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        }
    };

    const user = session.user

    const getPosts = await fetch(`${process.env.NEXTAUTH_URL}/api/posts`)
    const posts = await getPosts.json()

    return {
        props: {
            userAgent: ctx.req.headers['user-agent'],
            vapidKey: process.env.VAPID_PUBLIC,
            query: ctx.query,
            user: user,
            posts: posts?.filter(post => post.from.find(postRole => user.roles?.find(role => role.id == postRole.id) || postRole.id == 1)),
        },
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function Home(ctx) {
    const router = useRouter()

    let totalPosts = ctx.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).sort((a, b) => b.fixed - a.fixed);

    const [posts, setPosts] = useState(totalPosts.slice(0, 5))
    const [isFinishedPosts, setIsFinishedPosts] = useState(false)

    function seenPost(id) {
        const newPosts = [...posts]
        if (!newPosts.find(post => post.id === id).seen.find(user => user == ctx.user.id)) {
            newPosts.find(post => post.id === id).seen.push(ctx.user.id)

            fetch(`/api/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    $push: {
                        seen: ctx.user.id
                    }
                })
            });
        } else {
            newPosts.find(post => post.id === id).seen = newPosts.find(post => post.id === id).seen.filter(user => user != ctx.user.id)

            fetch(`/api/posts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    $pull: {
                        seen: ctx.user.id
                    }
                })
            })
        }

        setPosts(newPosts)
    }

    useEffect(() => {
        const intersectionObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting && posts.length < totalPosts.length)) {
                setPosts((posts) => posts.concat(totalPosts.slice(posts.length, posts.length + 4)));
            } else {
                setIsFinishedPosts(true);
            }
        })
        intersectionObserver.observe(document.querySelector('#loading'));
        return () => intersectionObserver.disconnect();
    }, []);

    useEffect(() => {
        if (ctx.query.post) {
            document.getElementById(`post-${ctx.query.post}`)?.scrollIntoView({
                behavior: 'auto',
                block: 'center',
                inline: 'center'
            });
        }
    }, [])

    const doSomething = async () => {
        if (!('showNotification' in ServiceWorkerRegistration.prototype)) return console.warn('Notifications aren\'t supported.');
        if (Notification.permission == 'denied') return console.warn('The user has blocked notifications.');
        if (!('PushManager' in window)) return console.warn('Push messaging isn\'t supported.');

        const sw = await navigator.serviceWorker.ready;
        const getSubscription = await sw.pushManager.getSubscription();

        if (!getSubscription) {
            if (ctx.user.lastNotificationRequest && Date.now() < ctx.user.lastNotificationRequest + 86400000) return;

            sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(ctx.vapidKey),
            }).then(async subscription => {
                await fetch(`/api/users`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        $push: {
                            pushNotificationData: {
                                vapidKey: ctx.vapidKey,
                                subscription: subscription
                            }
                        }
                    })
                })
            }).catch(async error => {
                if (error.toString().includes('denied')) {
                    await fetch(`/api/users`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            $set: {
                                lastNotificationRequest: Date.now()
                            }
                        })
                    })
                } else {
                    console.log(error)
                }
            })
        } else if (getSubscription && !ctx.user.pushNotificationData?.find(data => data.endpoint == getSubscription.endpoint)) {
            if (ctx.user.lastNotificationRequest && Date.now() < ctx.user.lastNotificationRequest + 86400000) return;

            sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(ctx.vapidKey),
            }).then(async subscription => {
                await fetch(`/api/users`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        $push: {
                            vapidKey: ctx.vapidKey,
                            subscription: subscription
                        }
                    })
                })
            }).catch(async error => {
                if (error.toString().includes('denied')) {
                    await fetch(`/api/users`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            $set: {
                                lastNotificationRequest: Date.now()
                            }
                        })
                    })
                } else {
                    console.log(error)
                }
            })
        }
    }

    useEffect(() => {
        doSomething();
    }, []) // parte que ta dando erro no IOS, pq ele diz que o Notification ali do Notification.permission não existe

    return (
        <>
            <Head>
                <title>EduCEL - Mural</title>
            </Head>
            <main className={base.main}>
                <Navbar name={ctx.user.name.split(' ')[0]} active="home" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Estatísticas</h3>
                            <div className={styles.widgets}>
                                <div className={`${styles.widgetBlue} ${styles.widget}`}>
                                    <i className={`fa-solid fa-calendar`}></i>
                                    <h2 className={base.widgetTitle}>{ctx.user?.events?.filter(ev => ev.timestamp > Date.now() && !ev.made).length ?? 0} atividades pendentes</h2>
                                </div>
                                {/* <div className={`${styles.widgetGray} ${styles.widget}`}>
                                    <i className={`fa-solid fa-messages`}></i>
                                    <h2 className={styles.widgetTitle}>10 mensagens<br />não lidas</h2>
                                </div> */}
                                <div className={`${styles.widgetGray} ${styles.widget}`}>
                                    <i className={`fa-solid fa-exclamation`}></i>
                                    <h2 className={styles.widgetTitle}>{totalPosts.filter(post => !post.seen.find(user => user == ctx.user.id)).length ?? 0} avisos<br />não vistos</h2>
                                </div>
                            </div>
                        </div>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Avisos</h3>
                            <div className={styles.announcements}>
                                {
                                    posts.map(post => (
                                        <div className={styles.announcement} id={`post-${post.id}`} key={post._id}>
                                            <div className={styles.announcementBox}>
                                                <div className={styles.announcementBoxHeader}>
                                                    <img src="/user.png" alt="" className={styles.announcementBoxHeaderAvatar} />
                                                    <h4 className={styles.announcementBoxHeaderInfo}>{`${post.author.name} | ${new Date(post.createdAt).toLocaleDateString('pt-BR')} ${new Date(post.createdAt).toLocaleTimeString('pt-BR').slice(0, 5)}`}</h4>
                                                </div>
                                                {
                                                    (post.fixed || post.tags) && (
                                                        <div className={styles.tags}>
                                                            {
                                                                post.fixed && (
                                                                    <div className={styles.tag}>Post Fixado</div>
                                                                )
                                                            }
                                                            {
                                                                post.tags && (
                                                                    post.tags.map(tag => (
                                                                        <div className={styles.tag} key={tag}>{tag}</div>
                                                                    ))
                                                                )
                                                            }
                                                        </div>
                                                    )
                                                }
                                                <div className={styles.displayAnnouncementText} dangerouslySetInnerHTML={{ __html: post.content }}></div>
                                            </div>
                                            <div className={`${styles.seenBtn}`} onClick={() => seenPost(post.id)}>
                                                <i className={`fa-solid fa-badge-check ${post.seen?.find(id => id == ctx.user.id) ? `${styles.seen}` : ''}`}></i>
                                                <p className={`${styles.seenText} ${post.seen?.find(id => id == ctx.user.id) ? `${styles.seen}` : ''}`}>{post.seen?.find(id => id == ctx.user.id) ? 'Lido' : 'Marcar como lido'}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                                <p className={styles.loadingMessage} id="loading">{isFinishedPosts ? 'Você não possui mais posts! :)' : 'Carregando mais posts, aguarde...'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
