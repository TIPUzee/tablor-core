import { ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'
import { ProcessedVoidOptions } from './interfaces'


/**
 * `Void searcher`. This class provides methods for searching items based on void query functionality.
 */
export class VoidSearcher<T extends Item<T>>
{
    constructor()
    {}


    /**
     * Processes string query options.
     */
    processOptions(): ProcessedVoidOptions<T>
    {
        return {}
    }


    /**
     * Checks if the given options are valid.
     */
    checkKeys(): boolean
    {
        return true
    }


    /**
     * Searches items based on void query functionality.
     */
    search(
        items: ImmutableAugmentedItem<T>[],
    ): ImmutableAugmentedItem<T>[]
    {
        return items
    }
}
