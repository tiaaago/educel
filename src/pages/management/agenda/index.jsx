import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState } from 'react';
import { getSession } from 'next-auth/react';
import ManagementNavbar from '@/components/ManagementNavbar';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function randomStr(len, arr) {
    var ans = '';
    for (var i = len; i > 0; i--) {
        ans +=
            arr[Math.floor(Math.random() * arr.length)];
    }
    return ans;
}

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

    if (!user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR" || perm == "MANAGE_AGENDA"))) {
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
    const [eventName, setEventName] = useState(null);
    const [addedRoles, setAddedRoles] = useState([]);
    const [eventDate, setEventDate] = useState(null);

    const getRolesPermissioned = () => {
        if (ctx.user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR"))) {
            return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position || role.id == 1);
        } else if (ctx.user.roles.filter(role => role.permissions.find(perm => perm == "MANAGE_AGENDA")).length > 0) {
            if (ctx.user.roles.find(role => role.permissions.find(perm => perm == "MANAGE_AGENDA") && !role.permissions.find(perm => perm == "MANAGE_AGENDA_FOR_ROLES"))) {
                return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position || role.id == 1);
            } else {
                return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position && ctx.user.roles.find(userRole => userRole.id == role.id));
            }
        } else return [];
    }

    function create() {
        if (eventName == null || eventDate == null || addedRoles.length == 0) return toast('Verifique se os campos obrigatórios (*) foram preenchidos.', { type: 'error' });

        Swal.fire({
            title: 'Tem certeza?',
            text: "Confira tudo antes de enviar, pois, uma vez enviado, um evento não pode ser excluído por Administradores!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545',
            confirmButtonText: 'Sim, enviar!',
            iconColor: '#3E4095',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/agenda`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name: eventName,
                        date: eventDate,
                        roles: addedRoles
                    }),
                })
                    .then(res => res.json())
                    .then(data => {
                        Swal.fire({
                            title: 'Criado!',
                            text: 'O evento foi criado com sucesso.',
                            icon: 'success',
                            showConfirmButton: false,
                            iconColor: '#3E4095',
                            timer: 1000.,
                            willClose: () => {
                                location.reload();
                            }
                        }).then((result) => {
                            /* Read more about handling dismissals below */
                            if (result.dismiss === Swal.DismissReason.timer) {
                                location.relaod();
                            }
                        })
                    })
            }
        })
    }

    return (
        <>
            <Head>
                <title>Administração - Novo Evento</title>
            </Head>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="colored"
            />
            <main className={base.main}>
                <ManagementNavbar name={ctx.user.name.split(' ')[0]} active="agenda" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Novo Evento</h3>
                            <iframe name="frame" style={{ display: 'none' }}></iframe>
                            <form target="frame" className={styles.questions}>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Nome do Evento *</h4>
                                        </div>
                                        <input className={styles.questionInput} placeholder="Nome do evento" onChange={e => setEventName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Quais cargos deseja adicionar? *</h4>
                                            <p className={styles.questionDescription}>Selecione no menu rolante ao lado para quais cargos você deseja adicionar esse evento na agenda.</p>
                                        </div>
                                        <Select
                                            isMulti
                                            instanceId={ctx.id}
                                            name="colors"
                                            placeholder="Selecione os cargos"
                                            options={getRolesPermissioned().sort((a, b) => a.position - b.position).map(role => ({ value: role.id, label: role.name }))}
                                            defaultValue={addedRoles.map(role => ({ value: role.id, label: role.name }))}
                                            onChange={(selectedOptions) => setAddedRoles(selectedOptions.map(option => option.value))}
                                            className={`${styles.questionSelect}`}
                                        />
                                    </div>
                                </div>
                                <div className={styles.question}>
                                    <div className={styles.questionContainer}>
                                        <div className={styles.questionHead}>
                                            <h4 className={styles.questionTitle}>Data e Hora *</h4>
                                            <p className={styles.questionDescription}>Preencha com a data e hora que o evento irá expirar.</p>
                                        </div>
                                        <input className={styles.questionInput} type="datetime-local" onChange={e => setEventDate(e.target.value)} max={`${new Date().getFullYear()}-12-31T23:59`} required />
                                    </div>
                                </div>
                                <div className={styles.submitButtonArea}>
                                    <button className={base.blueButton} onClick={create}><i className={`fas fa-paper-plane`}></i>Publicar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
