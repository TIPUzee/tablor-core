import { RegularFields } from '../stores/fields-store/interfaces'


/**
 * NOTE: Do NOT modify this file, it is used for testing purposes.
 * Some entities' tests depend on this data.
 */


export type SampleItemType = { id: number, name: string }

export const SampleItemFields: Readonly<RegularFields<SampleItemType>> = {
    id: { title: 'ID' },
    name: { title: 'Name' },
}

export const SampleItems: SampleItemType[] = [
    { id: 20, name: 'Tom' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 7, name: 'Grace' },
    { id: 8, name: 'Hank' },
    { id: 17, name: 'Quinn' },
    { id: 19, name: 'Sam' },
    { id: 11, name: 'Karl' },
    { id: 13, name: 'Mary' },
    { id: 10, name: 'Jack' },
    { id: 9, name: 'Ivy' },
    { id: 4, name: 'David' },
    { id: 12, name: 'Lily' },
    { id: 1, name: 'Alice' },
    { id: 6, name: 'Frank' },
    { id: 15, name: 'Oscar' },
    { id: 18, name: 'Rita' },
    { id: 5, name: 'Eve' },
    { id: 16, name: 'Peggy' },
    { id: 14, name: 'Nina' },
]
