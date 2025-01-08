import {
    AugmentedItem,
    ImmutableAugmentedItem,
    Item,
    ItemsAddedPayload, ItemsRemovedPayload,
    ItemsUpdatedPayload,
} from '../stores/items-store/interfaces'
import { Subject } from 'rxjs'
import {
    DraftSortingOptions,
    ImmutableProcessedSortingOption,
    ItemsSortedPayload,
    ProcessedSortingOptions,
    SortedItemsChangedPayload,
    SortingOptionsChangedPayload,
    SortRange,
} from './interfaces'
import { SearchedItemsChangedPayload } from '../searcher/searcher/interfaces'
import { defaultCompareFn } from './sorter-utils'
import { areEqualArrays, resolveIndex } from '../utils/utility-fns'


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
        protected readonly hasField: (key: keyof T) => boolean,
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
    public getOptions(includingNoneOrdered: boolean = true): Readonly<ImmutableProcessedSortingOption<T, keyof T>[]>
    {
        if (includingNoneOrdered)
            return this._options

        return this._options.filter(o => o.order !== 'NONE')
    }


    /**
     * Returns the keys of all current sorting options
     */
    public getSortingFieldKeys(includingNoneOrdered: boolean = true): (keyof T)[]
    {
        if (includingNoneOrdered)
            return this._options.map(o => o.field)

        return this._options.filter(o => o.order !== 'NONE').map(o => o.field)
    }


    /**
     * Returns the order of all current sorting options
     */
    public getSortingFieldOrders(includingNoneOrdered: boolean = true): ProcessedSortingOptions<T, keyof T>['order'][]
    {
        if (includingNoneOrdered)
            return this._options.map(o => o.order)

        return this._options.filter(o => o.order !== 'NONE').map(o => o.order)
    }


    /**
     * Returns the order of a specific sorting option
     */
    public getSortingFieldOrder(indexOrKey: number | keyof T): ProcessedSortingOptions<T, keyof T>['order'] | undefined
    {
        if (typeof indexOrKey === 'number')
        {
            return this._options[resolveIndex(indexOrKey, this._options.length)].order
        }

        return this._options.find(o => o.field === indexOrKey)?.order
    }


    /**
     * Returns whether a field is currently sorted
     */
    public isFieldSorted(field: keyof T, includingNoneOrdered: boolean = true): boolean
    {
        if (includingNoneOrdered)
            return this._options.some(o => o.field === field)

        return this._options.some(o => o.field === field && o.order !== 'NONE')
    }


    /**
     * Returns the current sorted items
     */
    public getItems(): Readonly<ImmutableAugmentedItem<T>[]>
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
        const prevOptions = [...this.getOptions(true)]
        this._options.splice(0)
        this._sortingRanges.splice(0)

        const sortFn: (a: ImmutableAugmentedItem<T>, b: ImmutableAugmentedItem<T>) => number
            = (a, b) => (a.tablorMeta.uuid - b.tablorMeta.uuid)

        this.searchResults.sort(sortFn)

        this.$sortingOptionsChanged.next({
            options: this.getOptions(true),
            prevOptions,
        })
    }


    /**
     * Sorts the items based on the provided options.
     */
    public sort<K extends keyof T>(options: DraftSortingOptions<T, K>): void
    {
        if (!this.hasField(options.field))
            return

        const prevOptions = [...this.getOptions(true)]
        const prevSortedItems = [...this.searchResults]

        const processedOptions = this.processOptions(options)

        this.addNewOptions(processedOptions)

        for (let i = processedOptions.insertBehavior.insertAt; i < this.getOptions(true).length; i++)
        {
            this.sortItems(i)
        }

        this.$sortingOptionsChanged.next({
            options: this.getOptions(true),
            prevOptions: prevOptions,
        })

        this.$itemsSorted.next({
            items: this.searchResults,
            prevItems: prevSortedItems,
        })

        if (!areEqualArrays(this.searchResults, prevSortedItems))
            this.$sortedItemsChanged.next({
                items: this.searchResults,
                prevItems: prevSortedItems,
            })
    }


    /**
     * Sorts the items based on the current sorting options.
     */
    protected sortItems(optionsIndex: number): void
    {
        this._sortingRanges.splice(optionsIndex, this._sortingRanges.length)

        const currOptions = this.getOptions(true)[optionsIndex]

        const currCompareFn: ProcessedSortingOptions<T, keyof T>['customCompareFn'] =
            currOptions.order === 'ORIGINAL' || currOptions.order === 'NONE' ?
            (a, b) => (a.tablorMeta.uuid - b.tablorMeta.uuid) * -1 :
            currOptions.customCompareFn

        const currCompareFnForNestedMatch: ProcessedSortingOptions<T, keyof T>['customCompareFnForNestedMatch'] =
            currOptions.order === 'ORIGINAL' ?
            (a, b) => (a.tablorMeta.uuid - b.tablorMeta.uuid) * -1 :
            currOptions.order === 'NONE' ?
            () => 0 :
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
                    optionsIndex,
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
                    optionsIndex,
                ),
            )
        }
    }


    /**
     * Creates sorting ranges for nested sorting options.
     */
    protected makeSortingRangesForNestedSortingOptions(
        items: ImmutableAugmentedItem<T>[],
        currCompareFnForNestedMatch: ProcessedSortingOptions<T, keyof T>['customCompareFnForNestedMatch'],
        optionsIndex: number = 0,
    ): SortRange[]
    {
        const sortingRanges: SortRange[] = []

        const superRanges: SortRange[] =
            optionsIndex === 0 ?
                [{ start: 0, end: this.searchResults.length }] :
            this._sortingRanges[optionsIndex - 1]

        for (let range of superRanges)
        {
            let start = range.start
            for (let i = start + 1; i < range.end; i++)
            {
                const areSame = currCompareFnForNestedMatch(
                    items[start],
                    items[i],
                    this._options[optionsIndex],
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

        const options: ProcessedSortingOptions<T, K> = this.getOptions(true)[optionsIndex] as any

        const orderedCompareFn: (a: ImmutableAugmentedItem<T>, b: ImmutableAugmentedItem<T>) => number =
            (a, b) =>
            {
                return compareFn(a, b, options) * (options.order === 'ASC' ? 1 : -1)
            }

        items.sort(orderedCompareFn)

        return items
    }


    /**
     * Transform\\\\s the given draft options into processed options with meta-data.
     */
    protected processOptions<K extends keyof T>(options: DraftSortingOptions<T, K>):
        ProcessedSortingOptions<T, K>
    {
        let insertBehavior: ProcessedSortingOptions<T, K>['insertBehavior'] = {
            insertAt: !options.insertBehavior && !options.clear ?
                      this._options.findIndex(o => o.field === options.field) : this._options.length,
        }

        if (options.insertBehavior)
        {
            if (typeof options.insertBehavior.insertAt === 'string')
                insertBehavior.insertAt = this._options.findIndex(o => o.field === insertBehavior.insertAt)
            else if (typeof options.insertBehavior.insertAt === 'number')
                insertBehavior.insertAt = options.insertBehavior.insertAt
        }
        insertBehavior.insertAt = resolveIndex(
            insertBehavior.insertAt,
            this._options.length + 1,
        )

        const processedOptions: ProcessedSortingOptions<T, K> = {
            field: options.field,

            stringOptions: {
                caseSensitive:
                    options.stringOptions?.caseSensitive !== undefined ?
                    options.stringOptions.caseSensitive : false,

                ignoreWhitespaces:
                    options.stringOptions?.ignoreWhitespaces !== undefined ?
                    options.stringOptions.ignoreWhitespaces : true,
            },

            numberOptions: {
                ignoreDecimals:
                    options.numberOptions?.ignoreDecimals !== undefined ?
                    options.numberOptions.ignoreDecimals : false,
            },

            customCompareFn:
                options.customCompareFn === undefined ?
                defaultCompareFn : options.customCompareFn,

            customCompareFnForNestedMatch:
                options.customCompareFnForNestedMatch === undefined ?
                defaultCompareFn : options.customCompareFnForNestedMatch,

            prioritizeNulls:
                options.prioritizeNulls !== undefined ? options.prioritizeNulls : 'FirstOnASC',

            prioritizeUndefineds:
                options.prioritizeUndefineds !== undefined ? options.prioritizeUndefineds : 'FirstOnASC',

            insertBehavior: insertBehavior,

            clear:
                options.clear ? options.clear : { target: 'InsertPosition' },

            order: options.order as any,

            supportedToggleOrders: undefined as any,

            toggleOrderIndex: undefined as any,
        }

        const replacingOptions = this._options[processedOptions.insertBehavior.insertAt]

        if (options.order === 'Toggle')
        {
            if (options.supportedToggleOrders)
                processedOptions.supportedToggleOrders = options.supportedToggleOrders
            else
                processedOptions.supportedToggleOrders = ['ASC', 'DESC', 'NONE']

            if (options.toggleOrderIndex)
                processedOptions.toggleOrderIndex = options.toggleOrderIndex
            else
            {

                if (!replacingOptions)
                    processedOptions.toggleOrderIndex = 0
                else if (
                    replacingOptions.supportedToggleOrders &&
                    replacingOptions.field === processedOptions.field
                )
                {
                    processedOptions.toggleOrderIndex = replacingOptions.toggleOrderIndex + 1
                }
                else
                    processedOptions.toggleOrderIndex = 0
            }

            processedOptions.toggleOrderIndex = resolveIndex(
                processedOptions.toggleOrderIndex,
                processedOptions.supportedToggleOrders.length,
            )
            processedOptions.order = processedOptions.supportedToggleOrders[processedOptions.toggleOrderIndex]
        }

        if (options.processingCallback)
            options.processingCallback(
                processedOptions,
                replacingOptions,
                this.getOptions(true),
            )

        return processedOptions
    }


    /**
     * Performs the behavior for handling new and previously sorted fields.
     */
    protected addNewOptions<K extends keyof T>(options: ProcessedSortingOptions<T, K>): void
    {
        let actualTarget: number
        let deleteLength: number

        if (options.clear.target === 'All')
        {
            actualTarget = 0
            deleteLength = this._options.length
        }
        else if (options.clear.target === 'AllParent')
        {
            actualTarget = 0
            deleteLength = options.insertBehavior.insertAt
        }
        else if (options.clear.target === 'AllNested')
        {
            actualTarget = options.insertBehavior.insertAt
            deleteLength = this._options.length - options.insertBehavior.insertAt
        }
        else if (options.clear.target === 'InsertPosition')
        {
            actualTarget = options.insertBehavior.insertAt
            deleteLength = 1
        }
        else
        {
            actualTarget = options.insertBehavior.insertAt
            deleteLength = 0
        }

        this._options.splice(
            actualTarget,
            deleteLength,
            options as any,
        )

        this._sortingRanges.splice(
            actualTarget,
            this._options.length,
        )

        options.insertBehavior.insertAt = actualTarget
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
