import { AugmentedItem, ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'
import {
    CustomOpts,
    ProcCustomOpts,
} from './interfaces'


/**
 * Custom searcher. This searcher is used to filter items based on a custom function.
 */
export class CustomSearcher<T extends Item<T>>
{
    constructor()
    {}


    /**
     * Processes the options.
     */
    processOptions(options: CustomOpts<T>): ProcCustomOpts<T>
    {
        return options
    }


    /**
     * Checks if the given options are valid.
     */
    checkKeys(): boolean
    {
        return true
    }


    /**
     * Filters items based on a custom function.
     */
    search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcCustomOpts<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        return this.filterMatchingItemsUuids(
            options.customFn,
            items,
        )
    }


    /**
     * Filters items based on a custom function.
     */
    protected filterMatchingItemsUuids(
        fn: ProcCustomOpts<T>['customFn'],
        items: AugmentedItem<T>[],
    ): ImmutableAugmentedItem<T>[]
    {
        const searchedItems: ImmutableAugmentedItem<T>[] = []

        for (const item of items)
        {
            if (fn(item, items))
                searchedItems.push(item)
        }

        return searchedItems
    }

}
