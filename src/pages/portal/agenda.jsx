import Modal from '@/components/Modal'
import Head from 'next/head'
import base from '@/styles/Base.module.css'
import styles from '@/styles/Students.module.css'
import { useRef, useState } from 'react'
import { getSession } from 'next-auth/react'
import Navbar from '@/components/Navbar'
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
    }

    const infos = session.user

    return {
        props: {
            user: infos,
        },
    }
}

export default function Agenda(ctx) {
    const [eventsList, setEventsList] = useState(ctx.user.events)

    function markEvent(id) {
        const newEventsList = [...eventsList]
        newEventsList.forEach(event => {
            if (event.id == id) event.made = !event.made
        })
        setEventsList(newEventsList)

        fetch(`/api/agenda`, {
            method: 'PUT',
            body: JSON.stringify({
                userId: ctx.user.id,
                events: newEventsList
            })
        })
    }

    function removeEvent(id) {
        const newEventsList = [...eventsList]
        newEventsList.forEach(event => {
            if (event.id == id) newEventsList.splice(newEventsList.indexOf(event), 1)
        })
        setEventsList(newEventsList)

        fetch(`/api/agenda`, {
            method: 'PUT',
            body: JSON.stringify({
                userId: ctx.user.id,
                events: newEventsList
            })
        })
    }

    const [expiredView, setExpiredView] = useState(true)
    const [doneView, setDoneView] = useState(true)
    const [notDoneView, setNotDoneView] = useState(true)

    const [addEventModal, setAddEventModal] = useState(false)

    const newEventName = useRef(null)
    const newEventDate = useRef(null)

    async function addNewEvent() {
        if (!newEventName.current.value) return toast('Por favor, preencha o nome do evento.', { type: 'error' });
        if (!newEventDate.current.value) return toast('Por favor, preencha a data do evento.', { type: 'error' });

        const newEventsList = [...eventsList, { id: randomStr(25, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'), name: newEventName.current.value, timestamp: new Date(newEventDate.current.value).getTime(), made: false }]
        await setEventsList(newEventsList)
        setAddEventModal(false)

        fetch(`/api/agenda`, {
            method: 'PUT',
            body: JSON.stringify({
                userId: ctx.user.id,
                events: newEventsList
            })
        })
    }

    return (
        <>
            <Head>
                <title>EduCEL - Agenda</title>
            </Head>
            <main className={base.main}>
                {
                    addEventModal && <Modal customClasses={[styles.modal]}>
                        <h3 className={base.modalTitle}>Adicionar evento</h3>
                        <iframe name="frame" style={{ display: 'none' }} />
                        <form target='frame' className={base.modalQuestions}>
                            <div className={base.modalColumnQuestion}>
                                <h5 className={base.modalQuestionText}>Qual o nome do evento? *</h5>
                                <input type="text" className={base.modalQuestionInput} ref={newEventName} required />
                            </div>
                            <div className={base.modalColumnQuestion}>
                                <h5 className={base.modalQuestionText}>Qual a data e hora do evento? *</h5>
                                <input type="datetime-local" ref={newEventDate} min={`${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.length == 1 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1}-${new Date().getDate()}T00:00`} max={`${new Date().getFullYear()}-12-31T23:59`} className={base.modalQuestionInput} required />
                            </div>
                            <div className={base.modalFooter}>
                                <button className={base.addModalBtn} onClick={() => addNewEvent()}>Adicionar</button>
                                <button type="button" className={base.closeModalBtn} onClick={() => setAddEventModal(false)}>Fechar</button>
                            </div>
                        </form>
                    </Modal>
                }
                <Navbar name={ctx.user.name.split(' ')[0]} active="agenda" user={ctx.user} />
                <div className={base.content}>
                    <div className={base.contentWrapper}>
                        <div className={base.contentSection}>
                            <h3 className={base.contentSectionTitle}>Agenda</h3>
                            <div className={styles.managementSection}>
                                <div className={base.grayButton} onClick={() => setAddEventModal(true)}><i className={`fa-solid fa-circle-plus`}></i>Adicionar Evento</div>
                            </div>
                            <div className={styles.eventsSection}>
                                <div className={styles.typeSection} style={notDoneView ? { flex: '2' } : { flex: '1' }}>
                                    <div className={styles.typeHeader}>
                                        <h4 className={styles.typeHeaderTitle}>Futuros</h4>
                                        {
                                            notDoneView ? <i className={`fa-solid fa-chevron-down ${styles.typeHeaderArrow}`} onClick={() => setNotDoneView(false)}></i> : <i className={`fa-solid fa-chevron-up ${styles.typeHeaderArrow}`} onClick={() => setNotDoneView(true)}></i>
                                        }
                                    </div>
                                    {
                                        notDoneView && (
                                            eventsList.filter(ev => ev.timestamp > Date.now() && !ev.made).map(ev => (
                                                <div className={styles.eventBox} key={ev.timestamp}>
                                                    <p className={styles.eventName}><span className={styles.eventDateSpan}>{new Date(ev.timestamp).toLocaleDateString('pt-BR')}</span> — {ev.name}</p>
                                                    <div className={styles.eventActions}>
                                                        <i className="fa-regular fa-square-check" onClick={() => markEvent(ev.id)}></i>
                                                        <i className="fa-solid fa-trash" onClick={() => removeEvent(ev.id)}></i>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    }
                                </div>
                                <div className={styles.typeSection} style={doneView ? { flex: '2' } : { flex: '1' }}>
                                    <div className={styles.typeHeader}>
                                        <h4 className={styles.typeHeaderTitle}>Feitos</h4>
                                        {
                                            doneView ? <i className={`fa-solid fa-chevron-down ${styles.typeHeaderArrow}`} onClick={() => setDoneView(false)}></i> : <i className={`fa-solid fa-chevron-up ${styles.typeHeaderArrow}`} onClick={() => setDoneView(true)}></i>
                                        }
                                    </div>
                                    {
                                        doneView && (
                                            eventsList.filter(ev => ev.made).map(ev => (
                                                <div className={styles.eventBox} key={ev.timestamp}>
                                                    <p className={styles.eventName}><span className={styles.eventDateSpan}>{new Date(ev.timestamp).toLocaleDateString('pt-BR')}</span> — {ev.name}</p>
                                                    <div className={styles.eventActions}>
                                                        <i className="fa-solid fa-square-check" onClick={() => markEvent(ev.id)}></i>
                                                        <i className="fa-solid fa-trash" onClick={() => removeEvent(ev.id)}></i>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    }
                                </div>
                                <div className={styles.typeSection} style={expiredView ? { flex: '2' } : { flex: '1' }}>
                                    <div className={styles.typeHeader}>
                                        <h4 className={styles.typeHeaderTitle}>Expirados (não feitos)</h4>
                                        {
                                            expiredView ? <i className={`fa-solid fa-chevron-down ${styles.typeHeaderArrow}`} onClick={() => setExpiredView(false)}></i> : <i className={`fa-solid fa-chevron-up ${styles.typeHeaderArrow}`} onClick={() => setExpiredView(true)}></i>
                                        }
                                    </div>
                                    {
                                        expiredView && (
                                            eventsList.filter(ev => ev.timestamp < Date.now() && !ev.made).map(ev => (
                                                <div className={styles.eventBox} key={ev.timestamp}>
                                                    <p className={styles.eventName}><span className={styles.eventDateSpan}>{new Date(ev.timestamp).toLocaleDateString('pt-BR')}</span> — {ev.name}</p>
                                                    <div className={styles.eventActions}>
                                                        <i className="fa-regular fa-square-check" onClick={() => markEvent(ev.id)}></i>
                                                        <i className="fa-solid fa-trash" onClick={() => removeEvent(ev.id)}></i>
                                                    </div>
                                                </div>
                                            ))
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}
