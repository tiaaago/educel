import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState } from 'react';
import { getSession } from 'next-auth/react';
import ManagementNavbar from '@/components/ManagementNavbar';
import dynamic from "next/dynamic";
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const getPost = await fetch(`${process.env.NEXTAUTH_URL}/api/posts/${ctx.query.id}`)
    const post = await getPost.json()

    const getRoles = await fetch(`${process.env.NEXTAUTH_URL}/api/roles`)
    const roles = await getRoles.json()

    return {
        props: {
            userAgent: ctx.req.headers['user-agent'],
            user: user,
            post: post,
            roles: roles.sort((a, b) => a.position - b.position),
        },
    }
}

var Editor = dynamic(() => import("../../../components/Editor.jsx"), { ssr: false });

export default function Announcements(ctx) {
    const [data, setData] = useState(ctx.post.content);
    const [addedRoles, setAddedRoles] = useState(ctx.post.from);
    const [fixPost, setFixPost] = useState(ctx.post.fixed);

    const getRolesPermissioned = () => {
        if (ctx.user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR"))) {
            return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position || role.id == 1);
        } else if (ctx.user.roles.filter(role => role.permissions.find(perm => perm == "MANAGE_POSTS")).length > 0) {
            if (ctx.user.roles.find(role => role.permissions.find(perm => perm == "MANAGE_POSTS") && !role.permissions.find(perm => perm == "CREATE_POST_FOR_ROLES"))) {
                return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position || role.id == 1);
            } else {
                return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position && ctx.user.roles.find(userRole => userRole.id == role.id));
            }
        }
    }

    function edit() {
        if (addedRoles.length == 0 || !data) return toast('Verifique se os campos obrigatórios (*) foram preenchidos.', { type: 'error' });

        fetch(`/api/posts/${ctx.post.id}`, {
            method: "POST",
            body: JSON.stringify({
                from: addedRoles.map(role => role.id),
                editor: ctx.user.id,
                fixed: fixPost,
                content: data
            }),
        })
            .then(res => res.json())
            .then(data => {
                Swal.fire({
                    title: 'Editado!',
                    text: 'O post foi editado com sucesso.',
                    icon: 'success',
                    showConfirmButton: false,
                    iconColor: '#3E4095',
                    timer: 1000,
                    willClose: () => {
                        location.replace('/management/announcements');
                    }
                }).then((result) => {
                    /* Read more about handling dismissals below */
                    if (result.dismiss === Swal.DismissReason.timer) {
                        location.replace('/management/announcements');
                    }
                })
            })
    }

    return (
        <>
            <Head>
                <title>Administração - Editar Post</title>
            </Head>
            <main className={base.main}>
                <ManagementNavbar name={ctx.user.name.split(' ')[0]} active="home" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Editar Post</h3>
                            <iframe name="frame" style={{ display: 'none' }}></iframe>
                            <form target="frame" className={styles.questions}>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Para quais cargos deseja publicar? *</h4>
                                            <p className={styles.questionDescription}>Selecione no menu rolante ao lado para quais cargos você quer enviar o post.</p>
                                        </div>
                                        <Select
                                            isMulti
                                            instanceId={ctx.id}
                                            name="colors"
                                            required
                                            placeholder="Selecione os cargos"
                                            options={getRolesPermissioned().map(role => ({ value: role.id, label: role.name }))}
                                            defaultValue={addedRoles.map(role => ({ value: role.id, label: role.name }))}
                                            onChange={(selectedOptions) => setAddedRoles(selectedOptions.map(option => option.value))}
                                            className={`${styles.questionSelect}`}
                                        />
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Fixar post</h4>
                                            <p className={styles.questionDescription}>Ao fixar, o post ficará no topo da página de avisos.</p>
                                        </div>
                                        <label className={styles.switch}>
                                            <input className={styles.checkbox} type="checkbox" defaultChecked={fixPost} onChange={e => setFixPost(e.target.checked)} />
                                            <span className={`${styles.slider} ${styles.round}`}></span>
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionHead}>
                                        <h4 className={styles.questionTitle}>Conteúdo do Post *</h4>
                                        <p className={styles.questionDescription}>Escreva o conteúdo do aviso no editor de texto abaixo.</p>
                                    </div>
                                    <Editor data={data} setData={setData} />
                                </div>
                                <div className={styles.submitButtonArea}>
                                    <button className={base.blueButton} onClick={edit}><i className={`fa-solid fa-pencil`}></i>Editar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
