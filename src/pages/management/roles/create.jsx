import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState } from 'react';
import { getSession } from 'next-auth/react';
import ManagementNavbar from '@/components/ManagementNavbar';
import Swal from 'sweetalert2';
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

    if (!user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR"))) {
        return {
            redirect: {
                destination: '/management',
                permanent: false,
            },
        }
    }

    const getRoles = await fetch(`${process.env.NEXTAUTH_URL}/api/roles`)
    const roles = await getRoles.json()

    return {
        props: {
            userAgent: ctx.req.headers['user-agent'],
            user: user,
            roles: roles,
        },
    }
}

export default function Announcements(ctx) {
    const [roleName, setRoleName] = useState(null);
    const [isClass, setIsClass] = useState(null);
    const [permissions, setPermissions] = useState([]);

    const hasPermission = (perm) => {
        if (permissions.find(p => p == perm)) {
            return true;
        } else {
            return false;
        }
    }
    const changePermission = (perm) => {
        if (hasPermission(perm)) {
            setPermissions(permissions.filter(p => p != perm))
        } else {
            setPermissions([...permissions, perm])
        }
    }

    function create() {
        if (!roleName) return toast('Por favor, preencha o nome do cargo.', { type: 'error' });

        fetch(`/api/roles`, {
            method: "POST",
            body: JSON.stringify({
                name: roleName,
                isClass: isClass,
                permissions: permissions
            }),
        })
            .then(res => res.json())
            .then(data => {
                Swal.fire({
                    title: 'Criado!',
                    text: 'O cargo foi criado com sucesso.',
                    icon: 'success',
                    showConfirmButton: false,
                    iconColor: '#3E4095',
                    timer: 1000,
                    willClose: () => {
                        location.replace(`/management/roles`);
                    }
                }).then((result) => {
                    /* Read more about handling dismissals below */
                    if (result.dismiss === Swal.DismissReason.timer) {
                        location.replace(`/management/roles`);
                    }
                })
            })
    }

    return (
        <>
            <Head>
                <title>Administração - Novo Cargo</title>
            </Head>
            <main className={base.main}>
                <ManagementNavbar name={ctx.user.name.split(' ')[0]} active="roles" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Propriedades</h3>
                            <iframe name="frame" style={{ display: 'none' }}></iframe>
                            <form target="frame" className={styles.questions}>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Qual o nome do cargo? *</h4>
                                        </div>
                                        <input className={styles.questionInput} placeholder="Nome do cargo" onChange={e => setRoleName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Turma</h4>
                                            <p className={styles.questionDescription}>Essa opção deverá ser utilizada apenas caso o cargo criado seja de uma turma.</p>
                                        </div>
                                        <label className={styles.switch}>
                                            <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={isClass} onChange={e => setIsClass(e.target.checked)} />
                                            <span className={`${styles.slider} ${styles.round}`}></span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Permissões</h3>
                            <iframe name="frame" style={{ display: 'none' }}></iframe>
                            <form target="frame" className={styles.questions}>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={`${styles.questionHead}`}>
                                            <h4 className={styles.questionTitle}>Administrador</h4>
                                            <p className={styles.questionDescription}>Os usuários terão todas as permissões do site, tome cuidado ao ativar isso.</p>
                                        </div>
                                        <label className={styles.switch}>
                                            <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('ADMINISTRATOR')} onChange={e => changePermission('ADMINISTRATOR')} />
                                            <span className={`${styles.slider} ${styles.round}`}></span>
                                        </label>
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={`${styles.questionHead}`}>
                                            <h4 className={styles.questionTitle}>Criar postagens</h4>
                                            <p className={styles.questionDescription}>Os usuários poderão criar postagens no mural.</p>
                                        </div>
                                        <label className={styles.switch}>
                                            <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('MANAGE_POSTS')} onChange={e => changePermission('MANAGE_POSTS')} />
                                            <span className={`${styles.slider} ${styles.round}`}></span>
                                        </label>
                                    </div>
                                    {
                                        hasPermission('MANAGE_POSTS') && (
                                            <>
                                                <div className={styles.subQuestionContainer}>
                                                    <div className={`${styles.questionHead}`}>
                                                        <h4 className={styles.questionTitle}>Apenas para cargos que possuírem</h4>
                                                    </div>
                                                    <label className={styles.switch}>
                                                        <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('CREATE_POST_FOR_ROLES')} onChange={e => changePermission('CREATE_POST_FOR_ROLES')} />
                                                        <span className={`${styles.slider} ${styles.round}`}></span>
                                                    </label>
                                                </div>
                                                <div className={styles.subQuestionContainer}>
                                                    <div className={`${styles.questionHead}`}>
                                                        <h4 className={styles.questionTitle}>Para o cargo "Todos"</h4>
                                                    </div>
                                                    <label className={styles.switch}>
                                                        <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('CREATE_POST_FOR_EVERYONE')} onChange={e => changePermission('CREATE_POST_FOR_EVERYONE')} />
                                                        <span className={`${styles.slider} ${styles.round}`}></span>
                                                    </label>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={`${styles.questionHead}`}>
                                            <h4 className={styles.questionTitle}>Gerenciar agenda</h4>
                                            <p className={styles.questionDescription}>Os usuários poderão criar novos eventos na agenda.</p>
                                        </div>
                                        <label className={styles.switch}>
                                            <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('MANAGE_AGENDA')} onChange={e => changePermission('MANAGE_AGENDA')} />
                                            <span className={`${styles.slider} ${styles.round}`}></span>
                                        </label>
                                    </div>
                                    {
                                        hasPermission('MANAGE_AGENDA') && (
                                            <>
                                                <div className={styles.subQuestionContainer}>
                                                    <div className={`${styles.questionHead}`}>
                                                        <h4 className={styles.questionTitle}>Apenas para cargos que possuírem</h4>
                                                    </div>
                                                    <label className={styles.switch}>
                                                        <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('MANAGE_AGENDA_FOR_ROLES')} onChange={e => changePermission('MANAGE_AGENDA_FOR_ROLES')} />
                                                        <span className={`${styles.slider} ${styles.round}`}></span>
                                                    </label>
                                                </div>
                                                <div className={styles.subQuestionContainer}>
                                                    <div className={`${styles.questionHead}`}>
                                                        <h4 className={styles.questionTitle}>Para o cargo "Todos"</h4>
                                                    </div>
                                                    <label className={styles.switch}>
                                                        <input className={styles.checkbox} id={ctx.id} type="checkbox" defaultChecked={hasPermission('MANAGE_AGENDA_FOR_EVERYONE')} onChange={e => changePermission('MANAGE_AGENDA_FOR_EVERYONE')} />
                                                        <span className={`${styles.slider} ${styles.round}`}></span>
                                                    </label>
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                                <div className={styles.submitButtonArea}>
                                    <button className={base.blueButton} onClick={create}><i className={`fa-solid fa-circle-plus`}></i>Criar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
