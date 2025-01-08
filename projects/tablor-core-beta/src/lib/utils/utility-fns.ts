/**
 * Resolves the index circularly.
 */
export function resolveIndex(index: number, length: number, resolveMinus = true): number
{
    let i = index
    i %= length

    if (resolveMinus && i < 0)
        i += length

    else if (!resolveMinus && i < 0)
        i = 0

    return i
}

/**
 * Checks if two arrays are equal by value.
 */
export function areEqualArrays<T>(a: T[], b: T[]): boolean
{
    if (a.length !== b.length) return false

    for (let i = 0; i < a.length; i++)
    {
        if (a[i] !== b[i]) return false
    }

    return true
}
