import prisma from '../prisma'

export const findOrCreateUser = async (address: string, avatar?: string | null, ensAddress?: string | null) => {
    let user = await prisma.user.findUnique({ where: { id: address } })

    if (user) {
        return user
    }

    user = await prisma.user.create({
        data: {
            id: address,
            ensAddress,
            image: avatar,
        }
    })

    return user
}