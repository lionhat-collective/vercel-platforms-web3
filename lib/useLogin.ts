import type { Connector } from "wagmi"
import { useCallback } from "react"
import { SiweMessage } from "siwe"
import { useConnect } from "wagmi"
import { getCsrfToken } from "next-auth/react"

export type LoginReturnType = {
    message: SiweMessage
    signature: string
}
type Login = (connector: Connector) => unknown

export type OnConnectFn = (data: LoginReturnType) => Promise<void> | void

type UseLoginReturnType = Login

export function useLogin(onConnect: OnConnectFn): UseLoginReturnType {
    const { connectAsync, activeConnector } = useConnect()
    const login = useCallback<Login>(async (connector: Connector) => {
        try {
            const getConnector = async () => {
                let chainId: number | undefined = undefined
                let address: string | undefined = undefined
                if (activeConnector) {
                    chainId = await activeConnector.getChainId()
                    address = await activeConnector.getAccount()
                    return { chainId, address }
                }
                const response = await connectAsync(connector)
                chainId = response.chain.id
                address = response.account
                return { chainId, address }
            }
            const { address, chainId } = await getConnector()
            const message = new SiweMessage({
                domain: window.location.host,
                address,
                statement: `Sign into App`,
                uri: window.location.origin,
                version: '1',
                chainId,
                nonce: await getCsrfToken(),
            })
            const signer = await connector.getSigner()
            const signature = await signer.signMessage(message.prepareMessage())
            return onConnect({
                message,
                signature,
            })
        } catch (err) {
            if (err instanceof Error) {
                throw err.message
            // } else if (err instanceof UserRejectedRequestError) {
            //     throw 'Please sign with your wallet to log in. It does not cost any gas.'
            } else {
                console.error(err)
                throw 'Something went wrong. Please try again.'
            }
        }
    }, [connectAsync, onConnect, activeConnector])
    return login
}