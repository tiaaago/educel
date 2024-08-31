import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState, useEffect } from 'react';
import { getSession } from 'next-auth/react';
import ManagementNavbar from '@/components/ManagementNavbar';
import Swal from 'sweetalert2';
import Users from '@/utils/database/models/Users';
import Select from 'react-select';
import Link from 'next/link';
import dbConnection from '@/utils/database/mongoConnect';

export async function getServerSideProps(ctx) {
    dbConnection();
    
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

    if (!user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR" || perm == "MANAGE_USERS"))) {
        return {
            redirect: {
                destination: '/management',
                permanent: false,
            },
        }
    }

    const users = await Users.find()

    const getRoles = await fetch(`${process.env.NEXTAUTH_URL}/api/roles`)
    const roles = await getRoles.json()

    return {
        props: {
            userAgent: ctx.req.headers['user-agent'],
            user: user,
            users: JSON.parse(JSON.stringify(users)),
            roles: roles
        },
    }
}

export default function Announcements(ctx) {
    const totalUsers = ctx.users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).sort((a, b) => b.fixed - a.fixed);
    const [selectedUser, setSelectedUser] = useState(null);

    const [name, setName] = useState(null)
    const [email, setEmail] = useState(null)
    const [addedRoles, setAddedRoles] = useState([])
    const [password, setPassword] = useState(null)

    const setUser = (user) => {
        setSelectedUser(user)
        setName(user?.name)
        setEmail(user?.email)
        setAddedRoles(user?.roles)
        setPassword(null)
    }

    const selectCustomStyles = {
        multiValue: (base, state) => {
            return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
        },
        multiValueLabel: (base, state) => {
            return state.data.isFixed ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 } : base;
        },
        multiValueRemove: (base, state) => {
            return state.data.isFixed ? { ...base, display: 'none' } : base;
        },
    };

    const getRolesPermissioned = () => {
        if (ctx.user.roles.find(role => role.permissions.find(perm => perm == "ADMINISTRATOR"))) {
            return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position);
        } else if (ctx.user.roles.filter(role => role.permissions.find(perm => perm == "MANAGE_USERS")).length > 0) {
            if (ctx.user.roles.find(role => role.permissions.find(perm => perm == "MANAGE_USERS"))) {
                return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position);
            } else {
                return ctx.roles.filter(role => role.position > ctx.user.roles.sort((a, b) => a.position - b.position)[0].position && ctx.user.roles.find(userRole => userRole.id == role.id));
            }
        } else return [];
    }
    const permissionedRoles = getRolesPermissioned();

    const onChange = (newValues, actionMeta) => {
        if (actionMeta.action == "remove-value" || actionMeta.action == "pop-value") {
            if (actionMeta.removedValue.isFixed) return;

            setAddedRoles(newValues.map(option => option.value));
        } else if (actionMeta.action == "clear") {
            newValues = addedRoles.filter(role => !permissionedRoles.find(r => r.id == role));

            setAddedRoles(newValues);
        } else if (actionMeta.action == "select-option") {
            console.log(addedRoles)
            
            setAddedRoles(newValues.map(option => option.value));
        }

        console.log(actionMeta)
    }

    const edit = () => {
        fetch(`/api/users/${selectedUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
                roles: addedRoles
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
                        text: "O usuário foi editado com sucesso.",
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
                            <h3 className={base.contentSectionTitle}>Gerenciar</h3>
                            <Select
                                isClearable
                                instanceId={ctx.id}
                                name="colors"
                                placeholder="Selecione um usuário"
                                options={totalUsers.map(user => ({ value: user.id, label: user.name }))}
                                onChange={(selectedOption) => setUser(totalUsers.find(user => user.id == selectedOption?.value))}
                            />
                            <div className={styles.contentSectionWrapper}>
                                {
                                    selectedUser && (
                                        <>
                                            <iframe name="frame" style={{ display: 'none' }}></iframe>
                                            <form target="frame" className={styles.questions}>
                                                <div className={styles.question}>
                                                    <div className={styles.questionContainer}>
                                                        <div className={styles.questionHead}>
                                                            <h4 className={styles.questionTitle}>Nome</h4>
                                                            <p className={styles.questionDescription}></p>
                                                        </div>
                                                        <input className={styles.questionInput} placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className={styles.question}>
                                                    <div className={styles.questionContainer}>
                                                        <div className={styles.questionHead}>
                                                            <h4 className={styles.questionTitle}>E-mail</h4>
                                                            <p className={styles.questionDescription}></p>
                                                        </div>
                                                        <input className={styles.questionInput} placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
                                                    </div>
                                                </div>
                                                <div className={styles.question}>
                                                    <div className={styles.questionContainer}>
                                                        <div className={styles.questionHead}>
                                                            <h4 className={styles.questionTitle}>Cargos</h4>
                                                            <p className={styles.questionDescription}></p>
                                                        </div>
                                                        <Select
                                                            isMulti
                                                            required
                                                            name="colors"
                                                            instanceId={ctx.id}
                                                            styles={selectCustomStyles}
                                                            placeholder="Selecione os cargos"
                                                            isClearable={addedRoles.some(role => !permissionedRoles.find(r => r.id == role))}
                                                            options={permissionedRoles.sort((a, b) => a.position - b.position).map(role => ({ value: role.id, label: role.name }))}
                                                            value={addedRoles.map(role => ({ value: role, label: ctx.roles.find(r => r.id == role)?.name, isFixed: !permissionedRoles.find(r => r.id == role) }))}
                                                            onChange={onChange}
                                                            className={`${styles.questionSelect}`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className={styles.question}>
                                                    <div className={styles.questionContainer}>
                                                        <div className={styles.questionHead}>
                                                            <h4 className={styles.questionTitle}>Senha</h4>
                                                            <p className={styles.questionDescription}>Utilize esse campo apenas caso você queira mudar a senha do usuário.</p>
                                                        </div>
                                                        <input type='password' className={styles.questionInput} placeholder="Nova senha" onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                                                    </div>
                                                </div>
                                                <div className={styles.submitButtonArea}>
                                                    <button className={base.blueButton} onClick={edit}><i className={`fa-solid fa-pencil`}></i>Editar</button>
                                                </div>
                                            </form>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
