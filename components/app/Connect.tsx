import type { OnConnectFn } from '@/lib/useLogin'
import { useConnect } from 'wagmi'
import { useLogin } from '@/lib/useLogin'
import { useIsMounted } from '@/lib/useIsMounted'
import classNames from 'classnames'

type ConnectProps = {
  onConnect: OnConnectFn
}

export function Connect({ onConnect }: ConnectProps) {
  const isMounted = useIsMounted()
  const {
    activeConnector,
    connectors,
    error,
    isConnecting,
    pendingConnector,
  } = useConnect()
  const login = useLogin(onConnect)

  if (!isMounted) {
    return null
  }

  return (
    <>
      {connectors
        .filter((x) => isMounted && x.ready)
        .map((x) => (
          <button
            key={x.id}
            onClick={() => login(x)}
            className={classNames('block px-4 py-2 w-full', {
              'bg-orange-500 text-white': x.id === 'injected',
              'bg-sky-500 text-white': x.id === 'walletConnect',
              'bg-blue-500 text-white': x.id === 'coinbaseWallet',
            })}
          >
            {x.name}
            {isConnecting && x.id === pendingConnector?.id && ' (connecting)'}
            {activeConnector?.id === x.id && ' (connected)'}
          </button>
      ))}

      {error && <div>{error.message}</div>}
    </>
  )
}