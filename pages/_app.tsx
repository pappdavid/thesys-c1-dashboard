import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '@crayonai/react-ui/styles/index.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
