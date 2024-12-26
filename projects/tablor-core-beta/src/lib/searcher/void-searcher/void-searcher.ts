import { ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'
import { VoidOpts, ProcessedVoidOptions } from './interfaces'


/**
 * `Void searcher`. This class provides methods for searching items based on void query functionality.
 */
export class VoidSearcher<T extends Item<T>>
{
    /**
     * Processes string query options.
     */
    processOptions(options: VoidOpts<T>): ProcessedVoidOptions<T>
    {
        return {
        }
    }


    /**
     * Searches items based on void query functionality.
     */
    search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcessedVoidOptions<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        return items
    }
}
