import {
    AugmentedItem,
    ItemsAddedPayload,
    ItemsUpdatedPayload,
    Item,
    ImmutableAugmentedItem,
} from '../stores/items-store/interfaces'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { Subject } from 'rxjs'
import {
    DraftSortingOption,
    ImmutableProcessedSortingOption,
    ProcessedSortingOptions,
    SortingOptionsChangedPayload,
} from './interfaces'
import { SearchedItemsChangedPayload } from '../searcher/searcher/interfaces'


/**
 * `Sorter` is responsible for sorting items.
 */
export class Sorter<T extends Item<T>>
{
    protected readonly _options: ProcessedSortingOptions<T, keyof T>[] = []

    public readonly $sortingOptionsChanged = new Subject<SortingOptionsChangedPayload<T>>()


    constructor(
        protected readonly fieldsStore: FieldsStore<T>,
        protected readonly allItems: AugmentedItem<T>[],
        protected readonly searchedItems: Readonly<ImmutableAugmentedItem<T>[][]>,
        protected readonly $itemsAdded: Subject<ItemsAddedPayload<T>>,
        protected readonly $itemsUpdated: Subject<ItemsUpdatedPayload<T>>,
        protected readonly $searchedItemsChanged: Subject<SearchedItemsChangedPayload<T>>,
    )
    {
        this.initializeEventListeners()
    }


    /**
     * Initializes event listeners so that whenever an item is added or updated, the sorter will re-sort the items.
     */
    protected initializeEventListeners(): void
    {
        const callback = () =>
        {
            if (this._options.length === 0) return

            this.sortAllItems(0)
        }

        this.$itemsAdded.subscribe(callback)
        this.$itemsUpdated.subscribe(callback)
        this.$searchedItemsChanged.subscribe(callback)
    }


    /**
     * Returns the current sorting options as an immutable array.
     */
    public getOptions(includeDisabled = true): Readonly<Readonly<ImmutableProcessedSortingOption<T, keyof T>>[]>
    {
        return this._options.filter(
            option => includeDisabled || !option.disabled,
        )
    }


    /**
     * Clears the current sorting options.
     *
     * @remarks
     * This method will re-order the items to their original order, by tablorMeta.uuid, because it is generated in order.
     */
    public clearSort<K extends keyof T>(field?: K): void
    {
        const prevOptions = [...this._options]

        if (field)
        {
            const index = this._options.findIndex(option => option.field === field)

            this._options.splice(index, 1)

            this.sortAllItems(index)
        }
        else
        {
            this._options.splice(0, this._options.length)
            this.allItems.sort((a, b) => a.tablorMeta.uuid - b.tablorMeta.uuid)
        }

        this.$sortingOptionsChanged.next({
            options: this._options,
            prevOptions,
        })
    }


    sortAllItems(optionIndex: number): void
    {
        const items = [this.allItems, ...this.searchedItems]

        for (let i = 0; i < items.length; i++)
        {
            for (let j = optionIndex; j < this.getOptions().length; j++)
            {
                this.sortInternal(j, items[i], i === optionIndex)
            }
        }
    }


    /**
     * Sorts the items by the given options.
     */
    public sort<K extends keyof T>(options: DraftSortingOption<T, K>): void
    {
        const processedOptions = this.processOptions(options)

        const prevOptions = [...this._options]

        this.performNewAndPrevSortedFieldsBehavior(processedOptions)

        const optionIndex = this._options.findIndex(option => option.field === processedOptions.field)

        this.sortAllItems(optionIndex)

        this.$sortingOptionsChanged.next({
            options: this._options,
            prevOptions,
        })
    }


    /**
     * Sorts the items by the given options index.
     */
    protected sortInternal(optionIndex: number, items: ImmutableAugmentedItem<T>[], forceSort = false): void
    {
        const option = this._options[optionIndex]
        if (option.disabled && !forceSort) return

        let superOption: ImmutableProcessedSortingOption<T, keyof T> | undefined = this.getOptions(false)[optionIndex -
        1]

        const superField = superOption !== undefined ? superOption.field : undefined
        const field = option.field
        const order = option.order

        const superOptionCompareFnForNestedMatch =
            superOption !== undefined ? superOption.customCompareFnForNestedMatch : () => true

        const optionCompareFn = option.customCompareFn

        let sortFn: (a: ImmutableAugmentedItem<T>, b: ImmutableAugmentedItem<T>) => number

        if (option.order === 'ORIGINAL')
            sortFn = (a, b) => a.tablorMeta.uuid - b.tablorMeta.uuid
        else
            sortFn = (a, b) => optionCompareFn(a[field], b[field], option) * (order === 'ASC' ? 1 : -1)

        if (superOption === undefined)
        {
            this.sortInRange(
                sortFn,
                0,
                items.length,
                items,
            )
            return
        }

        let nestedRangeStartIndex = 0

        for (let i = 1; i < items.length + 1; i++)
        {
            if (
                i === items.length ||
                superOptionCompareFnForNestedMatch(
                    items[nestedRangeStartIndex][superField as keyof T],
                    items[i][superField as keyof T],
                    option,
                ) !== 0
            )
            {
                this.sortInRange(
                    sortFn,
                    nestedRangeStartIndex,
                    i,
                    items,
                )
                nestedRangeStartIndex = i
            }
        }
    }


    /**
     * Default compare function.
     */
    protected defaultCompareFn<K extends keyof T>(
        a: T[K],
        b: T[K],
        options: ImmutableProcessedSortingOption<T, K>,
    ): number
    {
        const {
            prioritizeNulls,
            prioritizeUndefineds,
            ignoreDecimalsIfNumber,
            ignoreWhitespacesIfString,
            isCaseSensitiveIfString,
        } = options

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

            if (ignoreWhitespacesIfString)
            {
                strA = strA.trim()
                strB = strB.trim()
            }

            if (!isCaseSensitiveIfString)
            {
                strA = strA.toLowerCase()
                strB = strB.toLowerCase()
            }

            if (strA === strB) return 0
            return strA < strB ? -1 : 1
        }

        // Handle number-specific options
        if (typeof a === 'number' && typeof b === 'number')
        {
            let numA: number = a
            let numB: number = b

            if (ignoreDecimalsIfNumber)
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


    /**
     * Sorts the items in the given range by the given compare function.
     */
    protected sortInRange(
        compareFn: (a: ImmutableAugmentedItem<T>, b: ImmutableAugmentedItem<T>) => number,
        start: number, end: number,
        items: ImmutableAugmentedItem<T>[],
    ): void
    {
        if (start === end) return

        const range = items.slice(start, end)

        range.sort(compareFn)

        items.splice(start, range.length, ...range)
    }


    /**
     * Transforms the given draft options into processed options.
     */
    protected processOptions<K extends keyof T>(options: DraftSortingOption<T, K>): ImmutableProcessedSortingOption<T, K>
    {
        const prevIndex = this.getOptions().findIndex(
            option => option.field === options.field,
        )

        const nextOrder: Record<ImmutableProcessedSortingOption<T, K>['order'], ImmutableProcessedSortingOption<T, K>['order']> = {
            ASC: 'DESC',
            DESC: 'ORIGINAL',
            ORIGINAL: 'ASC',
        }

        const newOptions: ImmutableProcessedSortingOption<T, K> = {
            field: options.field,

            order:
                options.order === 'Toggle' ?
                (prevIndex === -1 ? 'ASC' : nextOrder[this.getOptions()[prevIndex].order]) :
                options.order,

            disabled: false,

            insertBehavior:
                options.insertBehavior !== undefined ?
                options.insertBehavior : { action: 'Mutate', scope: 'Single', target: 'OptionWithSameField' },

            isCaseSensitiveIfString:
                options.isCaseSensitiveIfString !== undefined ? options.isCaseSensitiveIfString : false,

            ignoreWhitespacesIfString:
                options.ignoreWhitespacesIfString !== undefined ? options.ignoreWhitespacesIfString : false,

            ignoreDecimalsIfNumber:
                options.ignoreDecimalsIfNumber !== undefined ? options.ignoreDecimalsIfNumber : false,

            customCompareFn:
                options.customCompareFn === undefined ? this.defaultCompareFn : options.customCompareFn,

            customCompareFnForNestedMatch:
                options.customCompareFnForNestedMatch === undefined ?
                this.defaultCompareFn : options.customCompareFnForNestedMatch,

            prioritizeNulls:
                options.prioritizeNulls !== undefined ? options.prioritizeNulls : 'FirstOnASC',

            prioritizeUndefineds:
                options.prioritizeUndefineds !== undefined ? options.prioritizeUndefineds : 'FirstOnASC',
        }

        if (options.processingCallback)
            options.processingCallback(
                newOptions,
                this.getOptions()[prevIndex] as any,
                this.getOptions(),
            )

        return newOptions
    }


    /**
     * Performs the new and previously sorted fields behavior.
     */
    protected performNewAndPrevSortedFieldsBehavior<K extends keyof T>(options: ImmutableProcessedSortingOption<T, K>): void
    {
        if (options.insertBehavior.action === 'Mutate')
        {
            if (options.insertBehavior.scope === 'Single' && options.insertBehavior.target === 'OptionWithSameField')
            {
                const prevIndex = this.getOptions().findIndex(
                    option => option.field === options.field,
                )

                if (prevIndex !== -1)
                    this._options.splice(prevIndex, 1, options as any)
                else
                    this._options.push(options as any)
            }
        }
        else if (options.insertBehavior.action === 'Clear')
        {
            if (options.insertBehavior.scope === 'All')
                this._options.splice(0, this._options.length, options as any)

            else if (options.insertBehavior.scope === 'Single' && options.insertBehavior.target === 'OptionWithSameField')
            {
                this._options.splice(
                    this._options.findIndex(
                        option => option.field === options.field,
                    ),
                    1,
                )
                this._options.push(options as any)
            }
        }
    }
}
