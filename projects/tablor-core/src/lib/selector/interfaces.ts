import { ImmutableAugmentedItem } from '../stores/items-store/interfaces'

/***************** Event Payloads *****************/

/**
 * Represents the payload for the `itemsSelectionChanged` event.
 *
 * @property items - The items that have been selected or deselected.
 */
export type ItemsSelectionChangedPayload<T> = {
    items: ImmutableAugmentedItem<T>[]
}
