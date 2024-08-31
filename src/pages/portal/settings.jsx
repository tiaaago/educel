import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState } from 'react';
import { getSession } from 'next-auth/react';
import Swal from 'sweetalert2';
import Select from 'react-select';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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

    return {
        props: {
            userAgent: ctx.req.headers['user-agent'],
            user: user
        },
    }
}

export default function Announcements(ctx) {
    const [email, setEmail] = useState(ctx.user.email)
    const [actualPassword, setActualPassword] = useState(null)
    const [newPassword, setNewPassword] = useState(null)
    const [repeatNewPassword, setRepeatNewPassword] = useState(null)

    const edit = () => {
        if (newPassword != repeatNewPassword) return Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: "As senhas inseridas não são iguais."
        })

        fetch(`/api/users`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                actualPassword: actualPassword,
                password: newPassword,
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success == false) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.message
                    })
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Editado!',
                        text: "Suas informações foram editadas com sucesso.",
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
                }
            })
    }

    return (
        <>
            <Head>
                <title>EduCEL - Configurações</title>
            </Head>
            <main className={base.main}>
                <Navbar name={ctx.user.name.split(' ')[0]} active="configs" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        {/* <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Preferências</h3>
                            <div className={styles.contentSectionWrapper}>
                                <iframe name="frame" style={{ display: 'none' }}></iframe>
                                <form target="frame" className={styles.questions}>
                                    <div className={styles.question}>
                                        <div className={styles.questionContainer}>
                                            <div className={styles.questionHead}>
                                                <h4 className={styles.questionTitle}>E-mail</h4>
                                                <p className={styles.questionDescription}>Endereço de e-mail utilizado para acessar a plataforma.</p>
                                            </div>
                                            <input className={styles.questionInput} placeholder="E-mail" defaultValue={email} onChange={e => setEmail(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className={styles.submitButtonArea}>
                                        <button className={base.blueButton} onClick={edit}><i className={`fa-solid fa-pencil`}></i>Editar</button>
                                    </div>
                                </form>
                            </div>
                        </div> */}
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Alterar Senha</h3>
                            <div className={styles.contentSectionWrapper}>
                                <iframe name="frame" style={{ display: 'none' }}></iframe>
                                <form target="frame" className={styles.questions}>
                                    <div className={styles.question}>
                                        <div className={styles.questionContainer}>
                                            <div className={styles.questionHead}>
                                                <h4 className={styles.questionTitle}>Senha Atual</h4>
                                            </div>
                                            <input type='password' className={styles.questionInput} placeholder="Senha atual" onChange={e => setActualPassword(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.question}>
                                        <div className={styles.questionContainer}>
                                            <div className={styles.questionHead}>
                                                <h4 className={styles.questionTitle}>Nova Senha</h4>
                                            </div>
                                            <input type='password' className={styles.questionInput} placeholder="Senha nova" onChange={e => setNewPassword(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.question}>
                                        <div className={styles.questionContainer}>
                                            <div className={styles.questionHead}>
                                                <h4 className={styles.questionTitle}>Repetir Nova Senha</h4>
                                            </div>
                                            <input type='password' className={styles.questionInput} placeholder="Senha nova" onChange={e => setRepeatNewPassword(e.target.value)} />
                                        </div>
                                    </div>
                                    <div className={styles.submitButtonArea}>
                                        <button className={base.blueButton} onClick={edit}><i className={`fa-solid fa-pencil`}></i>Alterar Senha</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
