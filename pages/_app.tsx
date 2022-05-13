import PlausibleProvider from "next-plausible";
import { SessionProvider } from "next-auth/react";
import { providers } from 'ethers'

import "@/styles/globals.css";

import type { AppProps } from "next/app";

import { Provider as WAGMIProvider, chain, createClient, defaultChains } from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const alchemyId = process.env.NEXT_PUBLIC_ALCHEMY_ID as string
const chains = defaultChains
const defaultChain = chain.mainnet

const isChainSupported = (chainId?: number) =>
  chains.some((x) => x.id === chainId)

const client = createClient({
  autoConnect: true,
  connectors({ chainId }) {
    const chain = chains.find((x) => x.id === chainId) ?? defaultChain
    const rpcUrl = chain.rpcUrls.alchemy
      ? `${chain.rpcUrls.alchemy}/${alchemyId}`
      : chain.rpcUrls.default
    return [
      new MetaMaskConnector({ chains }),
      new CoinbaseWalletConnector({
        chains,
        options: {
          appName: 'wagmi',
          chainId: chain.id,
          jsonRpcUrl: rpcUrl,
        },
      }),
      new WalletConnectConnector({
        chains,
        options: {
          qrcode: true,
          rpc: { [chain.id]: rpcUrl },
        },
      }),
      new InjectedConnector({ chains, options: { name: 'Injected' } }),
    ]
  },
  provider({ chainId }) {
    return new providers.AlchemyProvider(
      isChainSupported(chainId) ? chainId : defaultChain.id,
      alchemyId,
    )
  },
  webSocketProvider({ chainId }) {
    return new providers.AlchemyWebSocketProvider(
      isChainSupported(chainId) ? chainId : defaultChain.id,
      alchemyId,
    )
  },
})

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <WAGMIProvider client={client}>
      <PlausibleProvider domain="demo.vercel.pub">
        <SessionProvider session={session}>
          <Component {...pageProps} />
        </SessionProvider>
      </PlausibleProvider>
    </WAGMIProvider>
  );
}
