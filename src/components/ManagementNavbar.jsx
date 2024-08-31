import base from '@/styles/Base.module.css'
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react'

export default function ManagementNavbar(ctx) {
    const [openedView, setOpenedView] = useState(false)

    return (
        <>
            <div className={`${base.navbar}`}>
                <div className={base.navbarHeader}>
                    <img src="/user.png" alt="" className={base.navbarUserAvatar} />
                    <h4 className={base.navbarUserName}>Olá, {`${ctx.name}`}!</h4>
                </div>
                <div className={base.navbarContent}>
                    <div className={base.btnGroup}>
                        {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR" || permission == "MANAGE_POSTS")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'home' ? base.navbarContentBtnActive : ''}`} href='/management/announcements'>Mural</Link>}
                        {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR" || permission == "MANAGE_AGENDA")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'agenda' ? base.navbarContentBtnActive : ''}`} href='/management/agenda'>Agenda</Link>}
                        {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'roles' ? base.navbarContentBtnActive : ''}`} href='/management/roles'>Cargos</Link>}
                        {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'users' ? base.navbarContentBtnActive : ''}`} href='/management/users'>Usuários</Link>}
                    </div>
                    <div className={base.btnGroup}>
                        <Link className={`${base.navbarContentBtn}`} href='/portal'><b>Portal</b></Link>
                        <div className={`${base.navbarContentBtn} ${base.navbarLogoutBtn}`} onClick={() => signOut()}>Sair</div>
                    </div>
                </div>
            </div>
            <div className={`${base.mobileNavbar} ${openedView ? `${base.openedMobileNavbar}` : ''}`}>
                <div className={openedView ? `${base.mobileNavbarContent} ${base.openedMobileNavbarContent}` : base.mobileNavbarContent}>
                    {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR" || permission == "MANAGE_POSTS")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'home' ? base.navbarContentBtnActive : ''}`} href='/management/announcements'>Mural</Link>}
                    {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR" || permission == "MANAGE_AGENDA")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'agenda' ? base.navbarContentBtnActive : ''}`} href='/management/agenda'>Agenda</Link>}
                    {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'roles' ? base.navbarContentBtnActive : ''}`} href='/management/roles'>Cargos</Link>}
                    {ctx.user.roles.find(role => role.permissions.find(permission => permission == "ADMINISTRATOR")) && <Link className={`${base.navbarContentBtn} ${ctx.active == 'users' ? base.navbarContentBtnActive : ''}`} href='/management/users'>Usuários</Link>}
                    <Link className={`${base.navbarContentBtn}`} href='/portal'><b>Portal</b></Link>
                    <div className={`${base.navbarContentBtn} ${base.navbarLogoutBtn}`} onClick={() => signOut()}>Sair</div>
                </div>
                <div className={base.mobileNavbarHeader}>
                    <div className={base.mobileHeaderLeftSide}>
                        <img src="/user.png" alt="" className={base.navbarUserAvatar} />
                        <h4 className={base.navbarUserName}>Olá, {`Tiago`}!</h4>
                    </div>
                    <div className={base.mobileHeaderRightSide}>
                        <label className={base.label} onClick={() => setOpenedView(!openedView)}>
                            <span className={`${base.labelSpan} ${openedView ? `${base.labelSpanActivate}` : ''}`}></span>
                            <span className={`${base.labelSpan} ${openedView ? `${base.labelSpanActivate}` : ''}`}></span>
                            <span className={`${base.labelSpan} ${openedView ? `${base.labelSpanActivate}` : ''}`}></span>
                        </label>
                    </div>
                </div>
            </div>
        </>
    )
}