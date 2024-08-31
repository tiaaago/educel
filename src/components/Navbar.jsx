import base from '@/styles/Base.module.css'
import { signOut } from 'next-auth/react';
import { useState } from 'react'
import Modal from './Modal';
import Link from 'next/link';

export default function Navbar(ctx) {
    const [openedView, setOpenedView] = useState(false)
    const [reportModal, setReportModal] = useState(false)

    return (
        <>
            {/* <div className={base.reportError} onClick={() => setReportModal(true)}>
                <i class="fa-solid fa-circle-exclamation"></i>
            </div>
            {
                reportModal && <Modal>
                    <h3 className={base.modalTitle}>Reportar erro</h3>
                    <div className={base.modalQuestions}>
                        
                    </div>
                    <div className={base.modalFooter}>
                        <div className={base.addModalBtn} onClick={() => {}}>Enviar</div>
                        <div className={base.closeModalBtn} onClick={() => setReportModal(false)}>Fechar</div>
                    </div>
                </Modal>
            } */}
            <div className={`${base.navbar}`}>
                <div className={base.navbarHeader}>
                    <img src="/user.png" alt="" className={base.navbarUserAvatar} />
                    <h4 className={base.navbarUserName}>Olá, {`${ctx.name}`}!</h4>
                </div>
                <div className={base.navbarContent}>
                    <div className={base.btnGroup}>
                        <Link className={`${base.navbarContentBtn} ${ctx.active == 'home' ? base.navbarContentBtnActive : ''}`} href='/portal'>Mural</Link>
                        <Link className={`${base.navbarContentBtn} ${ctx.active == 'agenda' ? base.navbarContentBtnActive : ''}`} href='/portal/agenda'>Agenda</Link>
                        <Link className={`${base.navbarContentBtn} ${ctx.active == 'configs' ? base.navbarContentBtnActive : ''}`} href='/portal/settings'>Configurações</Link>
                    </div>
                    <div className={base.btnGroup}>
                        {ctx.user.roles.find(role => role.permissions.length > 0) && <Link className={`${base.navbarContentBtn}`} href='../management/announcements'><b>Admin</b></Link>}
                        <div className={`${base.navbarContentBtn} ${base.navbarLogoutBtn}`} onClick={() => signOut()}>Sair</div>
                    </div>
                </div>
            </div>
            <div className={`${base.mobileNavbar} ${openedView ? `${base.openedMobileNavbar}` : ''}`}>
                <div className={openedView ? `${base.mobileNavbarContent} ${base.openedMobileNavbarContent}` : base.mobileNavbarContent}>
                    <Link className={`${base.navbarContentBtn} ${ctx.active == 'home' ? base.navbarContentBtnActive : ''}`} href='/'>Mural</Link>
                    <Link className={`${base.navbarContentBtn} ${ctx.active == 'agenda' ? base.navbarContentBtnActive : ''}`} href='/portal/agenda'>Agenda</Link>
                    <Link className={`${base.navbarContentBtn} ${ctx.active == 'configs' ? base.navbarContentBtnActive : ''}`} href='/portal/settings'>Configurações</Link>
                    {ctx.user.roles.find(role => role.permissions.length > 0) && <Link className={`${base.navbarContentBtn}`} href='../management/announcements'><b>Admin</b></Link>}
                    <div className={`${base.navbarContentBtn} ${base.navbarLogoutBtn}`} onClick={() => signOut()}>Sair</div>
                </div>
                <div className={base.mobileNavbarHeader}>
                    <div className={base.mobileHeaderLeftSide}>
                        <img src="/user.png" alt="" className={base.navbarUserAvatar} />
                        <h4 className={base.navbarUserName}>Olá, {ctx.name}!</h4>
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