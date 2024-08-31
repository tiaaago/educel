import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import ManagementNavbar from '@/components/ManagementNavbar';
import Swal from 'sweetalert2';
import Link from 'next/link';

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

    if (!user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR" || perm == "MANAGE_POSTS"))) {
        return {
            redirect: {
                destination: '/management',
                permanent: false,
            },
        }
    }

    const getPosts = await fetch(`${process.env.NEXTAUTH_URL}/api/posts`)
    const posts = await getPosts.json()

    return {
        props: {
            userAgent: ctx.req.headers['user-agent'],
            user: user,
            posts: posts,
        },
    }
}

export default function Announcements(ctx) {
    const totalPosts = ctx.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).sort((a, b) => b.fixed - a.fixed);

    const [posts, setPosts] = useState(totalPosts.slice(0, 30))

    useEffect(() => {
        const intersectionObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting && posts.length < totalPosts.length)) {
                setPosts((posts) => posts.concat(totalPosts.slice(posts.length, posts.length + 4)));
            }
        })
        intersectionObserver.observe(document.querySelector('#loading'));
        return () => intersectionObserver.disconnect();
    }, []);

    function deletePost(id) {
        fetch(`/api/posts/${id}`, {
            method: 'DELETE',
        })
            .then(res => res.json())
            .then(data => {
                Swal.fire({
                    title: 'Excluído!',
                    text: 'O post foi excluído com sucesso.',
                    icon: 'success',
                    showConfirmButton: false,
                    iconColor: '#3E4095',
                    timer: 1000,
                    willClose: () => {
                        location.reload();
                    }
                }).then((result) => {
                    /* Read more about handling dismissals below */
                    if (result.dismiss === Swal.DismissReason.timer) {
                        location.reload();
                    }
                })
            })
    }

    return (
        <>
            <Head>
                <title>Administração - Postagens</title>
            </Head>
            <main className={base.main}>
                <ManagementNavbar name={ctx.user.name.split(' ')[0]} active="home" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Ações</h3>
                            <div className={styles.widgets}>
                                <Link href='./announcements/create'><div className={base.grayButton}><i className={`fa-solid fa-circle-plus`}></i>Novo Post</div></Link>
                            </div>
                        </div>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Postados</h3>
                            <div className={styles.announcements}>
                                <table className={`${styles.tableData} ${styles.table}`}>
                                    <thead>
                                        <tr>
                                            <th className={styles.tableData}>Fixado</th>
                                            <th className={styles.tableData}>ID</th>
                                            <th className={styles.tableData}>Data/Hora</th>
                                            <th className={styles.tableData}>Autor</th>
                                            <th className={styles.tableData}>Destinatário(s)</th>
                                            <th className={styles.tableData}>Lidos</th>
                                            <th className={styles.tableData}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {posts.map(post => (
                                            <tr>    
                                                <td className={styles.tableData}>{post.fixed ? 'Sim' : 'Não'}</td>
                                                <td className={styles.tableData}>{post.id}</td>
                                                <td className={styles.tableData}>{new Date(post.createdAt).toLocaleDateString('pt-BR')} {new Date(post.createdAt).toLocaleTimeString('pt-BR')}</td>
                                                <td className={styles.tableData}>{post.author.name.split(' ')[0]} {post.author.name.split(' ')[1] ?? ''}</td>
                                                <td className={styles.tableData}>{post.from.map(role => role.name).join(', ')}</td>
                                                <td className={styles.tableData}>{post.seen.length}</td>
                                                <td className={styles.tableData}>
                                                    <div className={styles.tableActions}>
                                                        <Link href={`./announcements/${post.id}`}><i className={`fa-light fa-pencil ${styles.listIcons}`}></i></Link>
                                                        <i className={`fa-light fa-trash ${styles.listIcons}`} onClick={() => deletePost(post.id)}></i>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className={styles.loadingMessage} id="loading"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
