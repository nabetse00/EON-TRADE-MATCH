import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from './pages/ErrorPage.tsx';
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import App from './App.tsx';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

import { Chain } from 'wagmi'
import ShowTrades from './pages/ShowTrades.tsx';
import CreateTrade from './pages/CreateTrade.tsx';
import Dispenser from './pages/MatchTrades.tsx';

export const eonGobi = {
  id: 1663,
  name: 'Gobi Testnet',
  network: 'Gobi Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'test ZEN',
    symbol: 'tZen',
  },
  rpcUrls: {
    public: { http: ['https://gobi-testnet.horizenlabs.io/ethv1'] },
    default: { http: ['https://gobi-testnet.horizenlabs.io/ethv1'] },
  },
  blockExplorers: {
    default: { name: 'Gobi Explorer', url: 'https://gobi-explorer.horizen.io/' },
  },
} as const satisfies Chain

// wagmi config

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [localhost, eonGobi],
  [publicProvider()],
)

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
  ],
  publicClient,
  webSocketPublicClient,
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [{
      path: "/create-trades",
      element: <CreateTrade />,
    },
    {
      path: "/show-trades",
      element: <ShowTrades />,
    },
    {
      path: "/dispenser",
      element: <Dispenser />,
    },

    ]
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={config}>
      <RouterProvider router={router} />
    </WagmiConfig>
  </React.StrictMode>,
)
