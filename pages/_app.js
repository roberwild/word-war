import Head from 'next/head';
import { GameProvider } from '../context/GameContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <GameProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </GameProvider>
  );
}
