import { ImmutableAugmentedItem, Item } from '../stores/items-store/interfaces'

/************ Event Payloads ************/

/**
 * Represents the payload for the `pageNbChanged` event.
 */
export type PageNbChangedPayload<T extends Item<T>> = {
    pageNb: number,
    prevPageNb: number
}

/**
 * Represents the payload for the `nbOfItemsPerPageChanged` event.
 */
export type NbOfItemsPerPageChangedPayload<T extends Item<T>> = {
    nbOfItemsPerPage: number,
    prevNbOfItemsPerPage: number
}

/**
 * Represents the payload for the `nbOfTotalPagesChanged` event.
 */
export type NbOfTotalPagesChangedPayload<T extends Item<T>> = {
    nbOfTotalPages: number,
    prevNbOfTotalPages: number
}

/**
 * Represents the payload for the `paginatedItemsChanged` event.
 */
export type PaginatedItemsChangedPayload<T extends Item<T>> = {
    paginatedItems: Readonly<ImmutableAugmentedItem<T>[]>,
    prevPaginatedItems: Readonly<ImmutableAugmentedItem<T>[]>
}
