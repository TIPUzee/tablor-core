/**
 * Default compare function.
 */
import { ImmutableProcessedSortingOption } from './interfaces'
import { ImmutableAugmentedItem, Item } from '../stores/items-store/interfaces'


export function defaultCompareFn<T extends Item<T>, K extends keyof T>(
    aItem: ImmutableAugmentedItem<T>,
    bItem: ImmutableAugmentedItem<T>,
    options: ImmutableProcessedSortingOption<T, K>,
): number
{
    const {
        prioritizeNulls,
        prioritizeUndefineds,
        numberOptions,
        stringOptions,
    } = options

    try
    {

        const [a, b] = [aItem[options.field], bItem[options.field]]

        // Handle null-specific options
        if (a === null || b === null)
        {
            if (a === b) return 0
            if (prioritizeNulls)
            {
                if (prioritizeNulls === 'AlwaysFirst' || prioritizeNulls === 'FirstOnASC')
                    return a === null ? -1 : 1

                if (prioritizeNulls === 'AlwaysLast' || prioritizeNulls === 'LastOnASC')
                    return b === null ? -1 : 1
            }
        }

        // Handle undefined-specific options
        if (a === undefined || b === undefined)
        {
            if (a === b) return 0
            if (prioritizeUndefineds)
            {
                if (prioritizeUndefineds === 'AlwaysFirst' || prioritizeUndefineds === 'FirstOnASC')
                    return a === null ? -1 : 1

                if (prioritizeUndefineds === 'AlwaysLast' || prioritizeUndefineds === 'LastOnASC')
                    return b === null ? -1 : 1
            }
        }

        // Handle string-specific options
        if (typeof a === 'string' && typeof b === 'string')
        {
            let strA: string = a
            let strB: string = b

            if (stringOptions.ignoreWhitespacesIfString)
            {
                strA = strA.trim()
                strB = strB.trim()
            }

            if (!stringOptions.isCaseSensitiveIfString)
            {
                strA = strA.toLowerCase()
                strB = strB.toLowerCase()
            }

            if (strA === strB) return 0
            return strA < strB ? -1 : 1
        }

        // Handle the number-specific options
        if (typeof a === 'number' && typeof b === 'number')
        {
            let numA: number = a
            let numB: number = b

            if (numberOptions.ignoreDecimalsIfNumber)
            {
                numA = Math.trunc(numA)
                numB = Math.trunc(numB)
            }

            if (numA === numB) return 0
            return numA < numB ? -1 : 1
        }

        // Handle date-specific options
        if (a as Date instanceof Date && b as Date instanceof Date)
        {
            if ((a as Date).getTime() === (b as Date).getTime()) return 0
            return (a as Date).getTime() < (b as Date).getTime() ? -1 : 1
        }

        // Default comparison
        if (a === b) return 0
        return a < b ? -1 : 1
    }
    catch (e)
    {
        console.error(e, aItem, bItem, options)
        return 0
    }
}
