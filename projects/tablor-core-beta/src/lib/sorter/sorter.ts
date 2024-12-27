import {
    AugmentedItem,
    ImmutableAugmentedItem,
    Item,
    ItemsAddedPayload, ItemsRemovedPayload,
    ItemsUpdatedPayload,
} from '../stores/items-store/interfaces'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { Subject } from 'rxjs'
import {
    DraftSortingOption,
    ImmutableProcessedSortingOption,
    InsertBehavior, ItemsSortedPayload,
    ProcessedSortingOptions,
    ProcessedSortingOptionsWithMeta, SortedItemsChangedPayload,
    SortingOptionsChangedPayload,
    SortRange,
} from './interfaces'
import { SearchedItemsChangedPayload } from '../searcher/searcher/interfaces'
import { defaultCompareFn } from './sorter-utils'


/**
 * `Sorter` is responsible for sorting items.
 */
export class Sorter<T extends Item<T>>
{
    protected readonly _options: ProcessedSortingOptions<T, keyof T>[] = []
    protected readonly _sortingRanges: SortRange[][] = []

    public readonly $sortingOptionsChanged = new Subject<SortingOptionsChangedPayload<T>>()
    public readonly $itemsSorted = new Subject<ItemsSortedPayload<T>>()
    public readonly $sortedItemsChanged = new Subject<SortedItemsChangedPayload<T>>()


    constructor(
        protected readonly fieldsStore: FieldsStore<T>,
        protected readonly searchResults: AugmentedItem<T>[],
        protected readonly $searchedItemsChanged: Subject<SearchedItemsChangedPayload<T>>,
        protected readonly $itemsAdded: Subject<ItemsAddedPayload<T>>,
        protected readonly $itemsRemoved: Subject<ItemsRemovedPayload<T>>,
        protected readonly $itemsUpdated: Subject<ItemsUpdatedPayload<T>>,
    )
    {
        this.$searchedItemsChanged.subscribe(this.handleSearchedItemsChange.bind(this))
        this.$itemsRemoved.subscribe(this.handleSearchedItemsChange.bind(this))
        this.$itemsAdded.subscribe(this.handleSearchedItemsChange.bind(this))
        this.$itemsUpdated.subscribe(this.handleSearchedItemsChange.bind(this))
    }


    /**
     * Returns the current sorting options
     */
    public getOptions(): Readonly<ImmutableProcessedSortingOption<T, keyof T>[]>
    {
        return this._options
    }


    /**
     * Returns the current sorted items
     */
    public getItems(): ImmutableAugmentedItem<T>[]
    {
        return this.searchResults
    }


    /**
     * Returns the current sorting ranges
     *
     * @remarks
     * This method is only for testing purposes
     */
    protected getSortingRanges(): Readonly<Readonly<Readonly<SortRange>[]>[]>
    {
        return this._sortingRanges
    }


    /**
     * Clears the sorting
     */
    public clearSort(): void
    {
        const prevOptions = [...this._options]
        this._options.splice(0)
        this._sortingRanges.splice(0)

        const sortFn: (a: ImmutableAugmentedItem<T>, b: ImmutableAugmentedItem<T>) => number
            = (a, b) => (a.tablorMeta.uuid - b.tablorMeta.uuid)

        this.searchResults.sort(sortFn)

        this.$sortingOptionsChanged.next({
            options: this._options,
            prevOptions,
        })
    }


    /**
     * Sorts the items based on the provided options.
     */
    public sort<K extends keyof T>(options: DraftSortingOption<T, K>): void
    {
        const prevOptions = [...this._options]
        const prevSortedItems = [...this.searchResults]

        const processedOptions = this.processOptionsWithMeta(options)

        const optionsIndex = this.addNewOptions(processedOptions)

        for (let currOptionsIndex = optionsIndex; currOptionsIndex < this._options.length; currOptionsIndex++)
        {
            this.sortItems(currOptionsIndex)
        }

        this.$sortingOptionsChanged.next({
            options: this._options,
            prevOptions: prevOptions,
        })

        this.$itemsSorted.next({
            items: this.searchResults,
            prevItems: prevSortedItems,
        })

        this.$sortedItemsChanged.next({
            items: this.searchResults,
            prevItems: prevSortedItems,
        })
    }


    /**
     * Sorts the items based on the current sorting options.
     */
    protected sortItems<K extends keyof T>(optionsIndex: number): void
    {
        this._sortingRanges.splice(optionsIndex, this._sortingRanges.length)

        const currOptions: ImmutableProcessedSortingOption<T, K> = this._options[optionsIndex] as any

        const currCompareFn: ProcessedSortingOptions<T, K>['customCompareFn'] =
            currOptions.order === 'ORIGINAL' ?
            (a, b) => (a.tablorMeta.uuid - b.tablorMeta.uuid) * -1 : currOptions.customCompareFn

        const currCompareFnForNestedMatch: ProcessedSortingOptions<T, K>['customCompareFnForNestedMatch'] =
            currOptions.order === 'ORIGINAL' ?
            (a, b) => (a.tablorMeta.uuid - b.tablorMeta.uuid) * -1 :
            currOptions.customCompareFnForNestedMatch

        if (optionsIndex === 0)
        {
            const sortedItems = this.applySort(
                this.searchResults,
                currCompareFn,
                optionsIndex,
            )

            this.searchResults.splice(0, this.searchResults.length, ...sortedItems)

            this._sortingRanges.splice(
                0, this._sortingRanges.length,
                this.makeSortingRangesForNestedSortingOptions(
                    this.searchResults,
                    currCompareFnForNestedMatch,
                    currOptions,
                ),
            )
        }
        else
        {
            for (let range of this._sortingRanges[optionsIndex - 1])
            {
                const sortedItems = this.applySort(
                    this.searchResults.slice(range.start, range.end),
                    currCompareFn,
                    optionsIndex,
                )

                this.searchResults.splice(range.start, range.end - range.start, ...sortedItems)
            }

            this._sortingRanges.splice(
                optionsIndex, this._sortingRanges.length,
                this.makeSortingRangesForNestedSortingOptions(
                    this.searchResults,
                    currCompareFnForNestedMatch,
                    currOptions,
                ),
            )
        }
    }


    /**
     * Creates sorting ranges for nested sorting options.
     */
    protected makeSortingRangesForNestedSortingOptions<K extends keyof T>(
        items: ImmutableAugmentedItem<T>[],
        currCompareFnForNestedMatch: ProcessedSortingOptions<T, K>['customCompareFnForNestedMatch'],
        currOptions: ImmutableProcessedSortingOption<T, K>,
        currOptionsIndex: number = 0,
    ): SortRange[]
    {
        const sortingRanges: SortRange[] = []

        const superRanges: SortRange[] =
            currOptionsIndex === 0 ?
                [{ start: 0, end: this.searchResults.length }] :
            this._sortingRanges[currOptionsIndex - 1]

        for (let range of superRanges)
        {
            let start = range.start
            for (let i = start + 1; i < range.end; i++)
            {
                const areSame = currCompareFnForNestedMatch(
                    items[start],
                    items[i],
                    currOptions,
                ) === 0

                if (i === range.end - 1)
                {
                    if (areSame)
                    {
                        sortingRanges.push({ start, end: i + 1 })
                    }
                    else
                    {
                        sortingRanges.push({ start, end: i })
                        sortingRanges.push({ start: i, end: i + 1 })
                    }
                }
                else if (!areSame)
                {
                    sortingRanges.push({ start, end: i })
                    start = i
                }
            }
        }

        return sortingRanges
    }


    /**
     * Sorts the items based on the given compare function.
     */
    protected applySort<K extends keyof T>(
        items: ImmutableAugmentedItem<T>[],
        compareFn: ProcessedSortingOptions<T, K>['customCompareFn'],
        optionsIndex: number,
    ): ImmutableAugmentedItem<T>[]
    {
        if (items.length <= 1) return items

        const options: ProcessedSortingOptions<T, K> = this._options[optionsIndex] as any

        const orderedCompareFn: (a: ImmutableAugmentedItem<T>, b: ImmutableAugmentedItem<T>) => number =
            (a, b) =>
            {
                return compareFn(a, b, options) * (options.order === 'ASC' ? 1 : -1)
            }

        items.sort(orderedCompareFn)

        return items
    }


    /**
     * Transforms the given draft options into processed options with meta-data.
     */
    protected processOptionsWithMeta<K extends keyof T>(options: DraftSortingOption<T, K>): ProcessedSortingOptionsWithMeta<T, K>
    {
        const prevIndex = this.getOptions().findIndex(
            option => option.field === options.field,
        )

        const nextOrder: Record<ImmutableProcessedSortingOption<T, K>['order'], ImmutableProcessedSortingOption<T, K>['order']> = {
            ASC: 'DESC',
            DESC: 'ORIGINAL',
            ORIGINAL: 'ASC',
        }

        const newOptions: ProcessedSortingOptionsWithMeta<T, K> = {
            field: options.field,

            order:
                options.order === 'Toggle' ?
                (
                    prevIndex === -1 ?
                    (options.firstOrderOnToggle !== undefined ? options.firstOrderOnToggle : 'ASC') :
                    (nextOrder[this.getOptions()[prevIndex].order])
                ) :
                options.order,

            stringOptions: {
                isCaseSensitiveIfString:
                    options.stringOptions?.isCaseSensitiveIfString !== undefined ?
                    options.stringOptions.isCaseSensitiveIfString :
                    false,

                ignoreWhitespacesIfString:
                    options.stringOptions?.ignoreWhitespacesIfString !== undefined ?
                    options.stringOptions.ignoreWhitespacesIfString :
                    true,
            },

            numberOptions: {
                ignoreDecimalsIfNumber:
                    options.numberOptions?.ignoreDecimalsIfNumber !== undefined ?
                    options.numberOptions.ignoreDecimalsIfNumber : false,
            },

            customCompareFn:
                options.customCompareFn === undefined ? defaultCompareFn : options.customCompareFn,

            customCompareFnForNestedMatch:
                options.customCompareFnForNestedMatch === undefined ? (...args: any) =>
                {
                    // @ts-ignore
                    return defaultCompareFn(...args)
                } : options.customCompareFnForNestedMatch,

            prioritizeNulls:
                options.prioritizeNulls !== undefined ? options.prioritizeNulls : 'FirstOnASC',

            prioritizeUndefineds:
                options.prioritizeUndefineds !== undefined ? options.prioritizeUndefineds : 'FirstOnASC',

            insertBehavior:
                options.insertBehavior !== undefined ?
                options.insertBehavior : {
                        strategy: 'PresetPosition',
                        target: 'SameType',
                        action: 'Replace',
                        notFoundBehavior: {
                            strategy: 'PresetPosition',
                            action: 'Push',
                            target: 'End',
                        },
                    },

            clear: {
                target:
                    options.clear?.target !== undefined ? options.clear.target : undefined,
            },
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
     * Removes the meta-data from the given options.
     */
    protected removeMeta<K extends keyof T>(options: ProcessedSortingOptionsWithMeta<T, K>): ProcessedSortingOptions<T, K>
    {
        return {
            field: options.field,
            order: options.order,
            stringOptions: options.stringOptions,
            numberOptions: options.numberOptions,
            customCompareFn: options.customCompareFn,
            customCompareFnForNestedMatch: options.customCompareFnForNestedMatch,
            prioritizeNulls: options.prioritizeNulls,
            prioritizeUndefineds: options.prioritizeUndefineds,
        }
    }


    /**
     * Performs the behavior for handling new and previously sorted fields.
     */
    protected addNewOptions<K extends keyof T>(options: ProcessedSortingOptionsWithMeta<T, K>): number
    {
        const getInsertIndex = (insertBehavior: InsertBehavior<T, K>, prevIndex: number): [number, number] =>
        {
            if (insertBehavior.strategy === 'PresetPosition')
            {
                if (insertBehavior.action === 'Replace')
                {
                    if (insertBehavior.target === 'SameType')
                    {
                        if (prevIndex !== -1)
                            return [prevIndex, 1]

                        else
                            return getInsertIndex(insertBehavior.notFoundBehavior, prevIndex)
                    }
                }
                else if (insertBehavior.action === 'Push')
                {
                    if (insertBehavior.target === 'Start')
                        return [0, 0]

                    else if (insertBehavior.target === 'End')
                        return [this._options.length, 0]
                }
            }
            else if (insertBehavior.strategy === 'SpecifiedField')
            {
                const targetIndex = this._options.findIndex(
                    option => option.field === insertBehavior.target,
                )

                if (targetIndex === -1)
                {
                    if (insertBehavior.notFoundBehavior === undefined)
                        return [-1, -1]

                    return getInsertIndex(insertBehavior.notFoundBehavior, prevIndex)
                }

                else if (insertBehavior.action === 'Replace')
                    return [targetIndex, 1]

                else if (insertBehavior.action === 'NewAsSuper')
                    return [targetIndex, 0]

                else if (insertBehavior.action === 'NewAsNested')
                    return [targetIndex + 1, 0]

            }
            else if (insertBehavior.strategy === 'SpecifiedFieldIndex')
            {
                const targetIndex = insertBehavior.target > this._options.length ?
                                    this._options.length : insertBehavior.target < 0 ?
                                                           0 : insertBehavior.target

                if (insertBehavior.action === 'Replace')
                    return [targetIndex, 1]

                else if (insertBehavior.action === 'Push')
                    return [targetIndex, 0]
            }

            return [-1, -1]
        }

        const [index, count] = getInsertIndex(
            options.insertBehavior,
            this._options.findIndex(option => option.field === options.field),
        )

        if (index === -1) return -1

        this._options.splice(index, count, this.removeMeta(options as any))

        return index
    }


    /**
     * Sorts the items based on the current sorting options.
     */
    protected handleSearchedItemsChange(): void
    {
        const prevSortedItems = [...this.searchResults]

        for (let optionsIndex = 0; optionsIndex < this._options.length; optionsIndex++)
        {
            this.sortItems(optionsIndex)
        }

        if (
            prevSortedItems.length !== this.searchResults.length ||
            prevSortedItems.some((item, index) => item !== this.searchResults[index])
        )
        {
            this.$sortedItemsChanged.next({
                items: this.searchResults,
                prevItems: prevSortedItems,
            })
        }
    }

}
