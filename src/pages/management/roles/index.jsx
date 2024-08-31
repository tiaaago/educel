import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Management.module.css'
import React, { useState, useRef } from 'react';
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
    const [roles, setRoles] = useState(ctx.roles.sort((a, b) => a.position - b.position));

    const dragItem = useRef();
    const dragOverItem = useRef();

    const dragStart = (e, position) => {
        dragItem.current = position;
    };

    const dragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const drop = (e) => {
        const copyListItems = [...roles];
        const dragItemContent = copyListItems[dragItem.current];
        copyListItems.splice(dragItem.current, 1);
        copyListItems.splice(dragOverItem.current, 0, dragItemContent);
        dragItem.current = null;
        dragOverItem.current = null;
        const newListItems = copyListItems.map((role, index) => ({ ...role, position: index + 1 }));

        fetch(`/api/roles`, {
            method: 'PATCH',
            body: JSON.stringify({
                roles: newListItems
            })
        })

        setRoles(newListItems);
    };

    function deleteRole(id) {
        fetch(`/api/roles/${id}`, {
            method: 'DELETE',
        })
            .then(res => res.json())
            .then(data => {
                Swal.fire({
                    title: 'Excluído!',
                    text: 'O cargo foi excluído com sucesso.',
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
                <title>Administração - Cargos</title>
            </Head>
            <main className={base.main}>
                <ManagementNavbar name={ctx.user.name.split(' ')[0]} active="roles" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Ações</h3>
                            <div className={styles.widgets}>
                                <Link href='/management/roles/create'><div className={base.grayButton}><i className={`fa-solid fa-circle-plus`}></i>Criar novo cargo</div></Link>
                            </div>
                        </div>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Cargos</h3>
                            <div className={base.contentSectionWrapper}>
                                <table className={`${styles.tableData} ${styles.table}`}>
                                    <thead>
                                        <tr>
                                            <th className={styles.tableData}>Cargo</th>
                                            <th className={styles.tableData}>Permissões</th>
                                            <th className={styles.tableData}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            roles.map((role, index) => (
                                                <>
                                                    {
                                                        role.id != 1 && (
                                                            <tr draggable={true} onDragStart={(e) => dragStart(e, index)} onDragEnter={(e) => dragEnter(e, index)} onDragEnd={drop} key={index}>
                                                                <td className={styles.tableData}>{role.name}</td>
                                                                <td className={styles.tableData} style={{ maxWidth: '330px' }}>{role.permissions.length > 0 ? role.permissions.map(permission => permission).join(', ') : "Nenhuma permissão definida"}</td>
                                                                <td className={styles.tableData}>
                                                                    <div className={styles.tableActions}>
                                                                        <Link href={`/management/roles/${role.id}`}><i className={`fa-light fa-pencil ${styles.listIcons}`}></i></Link>
                                                                        <i className={`fa-light fa-trash ${styles.listIcons}`} onClick={() => deleteRole(role.id)}></i>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    }
                                                </>
                                            ))
                                        }
                                        <tr>
                                            <td className={styles.tableData}>Todos</td>
                                            <td className={styles.tableData}>{"Nenhuma permissão definida"}</td>
                                            <td className={styles.tableData}>
                                                <div className={styles.tableActions}>

                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
