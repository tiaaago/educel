import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta name="description" content="Fique por dentro de tudo que acontece no CEL! Mural virtual, agenda estudantil, desempenho e muito mais!" />
                <link rel='stylesheet' href="https://pro.fontawesome.com/releases/v6.0.0-beta1/css/all.css" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="manifest" href="/manifest.json" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}