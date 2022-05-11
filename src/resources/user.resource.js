import { map } from 'modern-async'

export async function userProfileResource(user) {
    return {
        id: user._id,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        companyName: user.companyName,
        country: user.country,
        companyLogo: user.companyLogo ? process.env.AP_URL + user.companyLogo : null,
        sex: user.sex,
        age: user.age,
        image: user.image ? process.env.AP_URL + user.image : null,
        email: user.email,
        title: user.title ?? null,
        biography: user.biography ?? null,
        linkedIn: user.linkedIn ?? null,
        facebook: user.facebook ?? null,
        behance: user.behance ?? null,
        dribbble: user.dribbble ?? null,
        website: user.website ?? null,
        role: user.role,
        status: user.status,
        lastActivityAt: user.lastActivityAt,
        lastLoginAt: user.lastLoginAt,
        registeredAt: user.createdAt,
        isVerify: Boolean(user.verifiedAt),
        totalCandidatesApplied: Math.floor(Math.random()*(15 - 1) + 1),
        totalTestsCreated: Math.floor(Math.random()*(20 - 1) + 1),
        totalAssessmentsCreated: Math.floor(Math.random()*(10 - 1) + 1),
        isFreeAccount: true,
    }
}

export async function userResourceCollections(users) {
    return await map(users, async (user) => {
        return userProfileResource(user)
    });
};
