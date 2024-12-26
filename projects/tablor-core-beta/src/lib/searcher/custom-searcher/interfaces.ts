import { ImmutableAugmentedItem } from '../../stores/items-store/interfaces'


/**
 * Represents a custom search options.
 *
 * @property customName - The name of the custom search.
 * @property customFn - The custom search function.
 * Returns `true` if the item should be included, `false` otherwise.
 */
export type CustomOpts<T> = {
    customName: string,
    customFn: (
        item: ImmutableAugmentedItem<T>,
        items: Readonly<ImmutableAugmentedItem<T>[]>,
    ) => boolean,
}

/**
 * Represents a processed custom search options.
 *
 * @property customName - The name of the custom search.
 * @property customFn - The custom search function.
 * Returns `true` if the item should be included, `false` otherwise.
 */
export type ProcCustomOpts<T> = {
    customName: string,
    customFn: (
        item: ImmutableAugmentedItem<T>,
        items: Readonly<ImmutableAugmentedItem<T>[]>,
    ) => boolean,
}
