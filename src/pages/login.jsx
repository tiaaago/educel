import Head from 'next/head'
import styles from '@/styles/Login.module.css'
import { signIn, getSession } from 'next-auth/react';
import React, { useRef, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

export async function getServerSideProps(ctx) {
    const session = await getSession(ctx);

    if (session) {
        return {
            redirect: {
                destination: '/portal',
                permanent: false,
            },
        }
    }

    return {
        props: {},
    }
}

export default function Home() {
    const router = useRouter();

    const emailInput = useRef(null);
    const passwordInput = useRef(null);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [captchaKey, setCaptchaKey] = useState(0);

    const sign = () => {
        if (!emailInput.current.value || !passwordInput.current.value) return toast("Preencha todos os campos!", { type: "error" })

        signIn('credentials', {
            email: emailInput.current.value,
            password: passwordInput.current.value,
            token: captchaToken,
            redirect: false
        })
            .then(login => {
                if (login.ok) {
                    router.push("/portal");
                } else {
                    if (login.error == "CredentialsSignin") {
                        toast("Credenciais incorretas!", { type: "error" });
                    } else {
                        console.log(login)
                    }
                    setCaptchaKey(captchaKey + 1)
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <>
            <Head>
                <title>EduCEL - Login</title>
            </Head>
            <main className={styles.main}>
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
                <iframe name="frame" style={{ display: 'none' }}></iframe>
                <form target='frame' className={styles.loginBox}>
                    <img src="/logo-new.png" alt="" className={styles.educelLogo} />
                    <div className={styles.inputsLogin}>
                        <input ref={emailInput} type="text" placeholder='E-mail' className={styles.inputLogin} required />
                        <input ref={passwordInput} type="password" placeholder='Senha' className={styles.inputLogin} required />
                    <HCaptcha key={captchaKey} sitekey="8203d116-5b04-4aed-8181-5712bfe45c11" onVerify={token => setCaptchaToken(token)} />
                    </div>
                    <div className={styles.btnArea}>
                        <button className={styles.loginBtn} onClick={sign}><b>Entrar</b></button>
                    </div>
                </form>
            </main>
        </>
    )
}
