import {
    AugmentedItem,
    ImmutableAugmentedItem,
    ItemsAddedPayload, ItemsRemovedPayload, ItemsUpdatedPayload,
    Item,
} from '../../stores/items-store/interfaces'
import { ProcessedField } from '../../stores/fields-store/interfaces'
import { StringQuerySearcher } from '../string-query-searcher/string-query-searcher'
import { DateRangeSearcher } from '../date-ranges-searcher/date-range-searcher'
import { NumberRangesSearcher } from '../numbers-range-searcher/number-ranges-searcher'
import { CustomSearcher } from '../custom-searcher/custom-searcher'
import { VoidSearcher } from '../void-searcher/void-searcher'
import { ExactValuesSearcher } from '../exact-values-searcher/exact-values-searcher'
import { Subject } from 'rxjs'

import {
    DraftCustomSearchOptions,
    DraftDateRangeSearchOptions,
    DraftExactValueSearchOptions,
    DraftNumberRangeSearchOptions,
    DraftSearchableOptions,
    DraftStringQuerySearchOptions,
    DraftVoidSearchOptions,
    SearchedItemsChangedPayload,
    ProcessedSearchableOptions,
    SearchOptionsChangedPayload,
    ItemsSearchedPayload,
} from './interfaces'


/**
 * `Searcher`. This class is the parent of all searcher classes.
 */
export class Searcher<T extends Item<T>>
{
    protected readonly stringQuerySearcher: StringQuerySearcher<T>
    protected readonly dateRangesSearcher: DateRangeSearcher<T>
    protected readonly numbersRangesSearcher: NumberRangesSearcher<T>
    protected readonly customFnSearcher: CustomSearcher<T>
    protected readonly voidSearcher: VoidSearcher<T>
    protected readonly exactValuesSearcher: ExactValuesSearcher<T>

    protected readonly _options: ProcessedSearchableOptions<T>[] = []

    public readonly $itemsSearched
        = new Subject<ItemsSearchedPayload<T>>()

    public readonly $searchedOptionsChanged
        = new Subject<SearchOptionsChangedPayload<T>>()

    public readonly $searchedItemsChanged
        = new Subject<SearchedItemsChangedPayload<T>>()


    constructor(
        protected readonly hasField: (key: keyof T) => boolean,
        protected readonly getFields: () => ProcessedField<T, keyof T>[],
        protected readonly allItems: AugmentedItem<T>[],
        protected readonly allSearchedItems: ImmutableAugmentedItem<T>[][],
        protected readonly searchResults: ImmutableAugmentedItem<T>[],
        protected readonly $itemsAdded: Subject<ItemsAddedPayload<T>>,
        protected readonly $itemsRemoved: Subject<ItemsRemovedPayload<T>>,
        protected readonly $itemsUpdated: Subject<ItemsUpdatedPayload<T>>,
    )
    {
        this.stringQuerySearcher = new StringQuerySearcher(getFields, hasField)
        this.dateRangesSearcher = new DateRangeSearcher(hasField)
        this.numbersRangesSearcher = new NumberRangesSearcher(hasField)
        this.customFnSearcher = new CustomSearcher()
        this.voidSearcher = new VoidSearcher()
        this.exactValuesSearcher = new ExactValuesSearcher(hasField)

        $itemsRemoved.subscribe(this.onItemsRemoved.bind(this))
        $itemsAdded.subscribe(this.onItemsAdded.bind(this))
        $itemsUpdated.subscribe(this.onItemsUpdated.bind(this))
    }


    /**
     * Returns the search options.
     */
    public getOptions(): Readonly<ProcessedSearchableOptions<T>[]>
    {
        return this._options
    }


    /**
     * Returns the searched items.
     */
    public getItems(): ImmutableAugmentedItem<T>[]
    {
        return this.searchResults
    }


    /**
     * Clears the search.
     */
    public clearSearch(): void
    {
        const prevSearchResults = this.getItems()
        const prevSearchOptions = this._options

        this._options.length = 0
        this.allSearchedItems.length = 0
        this.makeNewSearchResults()

        if (prevSearchOptions.length !== this._options.length)
        {
            this.$searchedItemsChanged.next({
                searchResults: this.getItems(),
                prevSearchResults: prevSearchResults,
            })

            this.$searchedOptionsChanged.next({
                options: this._options,
                prevOptions: prevSearchOptions,
            })

            this.$itemsSearched.next({
                options: this._options,
                prevOptions: prevSearchOptions,
                searchResults: this.getItems(),
                prevSearchResults: prevSearchResults,
            })
        }
    }


    /**
     * Returns the number of searched items.
     */
    public getNbOfSearchedItems(): number
    {
        return this.getItems().length
    }


    /**
     * Search items by a specific type of query functionality.
     */
    public searchByStringQuery(options: DraftStringQuerySearchOptions<T>): void
    {
        this.search('StringQuery', options)
    }


    /**
     * Search items by a specific type of query functionality.
     */
    public searchByDateRanges(options: DraftDateRangeSearchOptions<T>): void
    {
        this.search('DateTimesRanges', options)
    }


    /**
     * Search items by a specific type of query functionality.
     */
    public searchByNumbersRanges(options: DraftNumberRangeSearchOptions<T>): void
    {
        this.search('NumbersRanges', options)
    }


    /**
     * Search items by a specific type of query functionality.
     */
    public searchByCustomFn(options: DraftCustomSearchOptions<T>): void
    {
        this.search('CustomFn', options)
    }


    /**
     * Search items by a specific type of query functionality.
     */
    public searchByVoid(options: DraftVoidSearchOptions<T>): void
    {
        this.search('Void', options)
    }


    /**
     * Search items by a specific type of query functionality.
     */
    public searchByExactValues(options: DraftExactValueSearchOptions<T>): void
    {
        this.search('ExactValues', options)
    }


    /**
     * Search items by a specific type of query functionality.
     */
    protected search(
        by: ProcessedSearchableOptions<T>['by'],
        options: DraftSearchableOptions<T>,
    ): void
    {
        const searcher = this.getTargetSearcher(by)

        const processedOptions = this.processSharedOptions(
            by,
            options,
            searcher.processOptions(options as any) as ProcessedSearchableOptions<T>,
        )

        if (!searcher.checkKeys(processedOptions as any))
        {
            console.warn('Invalid options keys', processedOptions)
            return
        }

        this.performPrevResultsBehavior(processedOptions)

        const targetItems = this.getTargetItems(processedOptions)

        let newlySearchedItems: ImmutableAugmentedItem<T>[] = searcher.search(
            targetItems,
            processedOptions as any,
        )

        newlySearchedItems = this.performItemsReverting(
            targetItems,
            newlySearchedItems,
            processedOptions,
        )

        const prevItems = this.getItems()
        const prevOptions = this.getOptions().map(o => o)

        this.allSearchedItems.push(newlySearchedItems)
        this._options.push(processedOptions)

        this.makeNewSearchResults()

        this.$itemsSearched.next({
            options: this.getOptions(),
            prevOptions,
            searchResults: this.getItems(),
            prevSearchResults: prevItems,
        })

        this.$searchedItemsChanged.next({
            searchResults: this.getItems(),
            prevSearchResults: prevItems,
        })

        this.$searchedOptionsChanged.next({
            options: this.getOptions(),
            prevOptions,
        })
    }


    /**
     * Creates the new search results.
     */
    protected makeNewSearchResults(): void
    {
        if (this.allSearchedItems.length === 0)
        {
            this.searchResults.splice(0, this.searchResults.length, ...this.allItems)
            return
        }

        const searchedItemsResults: ImmutableAugmentedItem<T>[][] = []

        for (let i = this.allSearchedItems.length - 1; i >= 0; i--)
        {
            searchedItemsResults.push(this.allSearchedItems[i])
            if (this._options[i].searchTarget.scope === 'Prev')
                break
        }

        searchedItemsResults.reverse()

        this.searchResults.splice(0, this.searchResults.length, ...Array.from(new Set(searchedItemsResults.flat())))
    }


    /**
     * Triggers when items are removed.
     */
    protected onItemsRemoved({ removedItems }: ItemsRemovedPayload<T>): void
    {
        const prevSearchResults = this.getItems()

        for (let i = 0; i < this.allSearchedItems.length; i++)
        {
            this.allSearchedItems[i] = this.allSearchedItems[i].filter(
                item => !removedItems.includes(item),
            )
        }

        this.makeNewSearchResults()

        if (prevSearchResults.length !== this.getItems().length)
        {
            this.$searchedItemsChanged.next({
                searchResults: this.getItems(),
                prevSearchResults: prevSearchResults,
            })
        }
    }


    /**
     * Triggers when items are added.
     */
    protected onItemsAdded({ addedItems }: ItemsAddedPayload<T>): void
    {
        const prevSearchResults = this.getItems()

        let prevAddedItems: ImmutableAugmentedItem<T>[] = addedItems

        for (let i = 0; i < this._options.length; i++)
        {
            const processedOptions = this._options[i]

            let targetItems

            if (processedOptions.searchTarget.scope === 'All')
                targetItems = addedItems
            else if (processedOptions.searchTarget.scope === 'Prev')
                targetItems = prevAddedItems
            else
                throw new Error('Invalid search target scope')

            const searcher = this.getTargetSearcher(processedOptions.by)

            let itemsToAdd: ImmutableAugmentedItem<T>[] = searcher.search(
                // @ts-ignore
                targetItems,
                processedOptions as any,
            )

            itemsToAdd = this.performItemsReverting(
                targetItems,
                itemsToAdd,
                processedOptions,
            )

            this.allSearchedItems[i] = this.allSearchedItems[i].concat(itemsToAdd)

            prevAddedItems = itemsToAdd
        }

        this.makeNewSearchResults()

        if (prevSearchResults.length !== this.getItems().length)
        {
            this.$searchedItemsChanged.next({
                searchResults: this.getItems(),
                prevSearchResults: prevSearchResults,
            })
        }
    }


    /**
     * Triggers when items are updated.
     */
    protected onItemsUpdated({ updatedItems }: ItemsUpdatedPayload<T>): void
    {
        if (updatedItems.length === 0) return

        const prevSearchResults = this.getItems()

        for (let i = 0; i < this._options.length; i++)
        {
            const processedOptions = this._options[i]

            let targetItems = updatedItems

            const searcher = this.getTargetSearcher(processedOptions.by)

            let itemsToAdd: ImmutableAugmentedItem<T>[] = searcher.search(
                targetItems,
                processedOptions as any,
            )

            itemsToAdd = this.performItemsReverting(
                targetItems,
                itemsToAdd,
                processedOptions,
            )

            let itemsToRemove = targetItems.filter(item => !itemsToAdd.includes(item))

            // Add items if not already there
            itemsToAdd = itemsToAdd
                .filter(item => !this.allSearchedItems[i].includes(item))

            this.allSearchedItems[i] = this.allSearchedItems[i].concat(itemsToAdd)

            // Remove items if already there
            itemsToRemove = itemsToRemove
                .filter(item => this.allSearchedItems[i].includes(item))

            this.allSearchedItems[i] = this.allSearchedItems[i].filter(
                item => !itemsToRemove.includes(item),
            )
        }

        let anythingChanged = false

        if (prevSearchResults.length === this.getItems().length)
        {
            const newSearchResults = this.getItems()

            for (let i = 0; i < newSearchResults.length; i++)
            {
                if (newSearchResults[i] !== prevSearchResults[i])
                    anythingChanged = true
            }
        }

        this.makeNewSearchResults()

        if (anythingChanged || prevSearchResults.length !== this.getItems().length)
            this.$searchedItemsChanged.next({
                searchResults: this.getItems(),
                prevSearchResults: prevSearchResults,
            })
    }


    /**
     * Returns the target searcher.
     */
    protected getTargetSearcher(
        by: ProcessedSearchableOptions<T>['by'],
    ): StringQuerySearcher<T>
        | DateRangeSearcher<T>
        | NumberRangesSearcher<T>
        | CustomSearcher<T>
        | VoidSearcher<T>
        | ExactValuesSearcher<T>
    {
        switch (by)
        {
            case 'StringQuery':
                return this.stringQuerySearcher
            case 'DateTimesRanges':
                return this.dateRangesSearcher
            case 'NumbersRanges':
                return this.numbersRangesSearcher
            case 'CustomFn':
                return this.customFnSearcher
            case 'Void':
                return this.voidSearcher
            case 'ExactValues':
                return this.exactValuesSearcher
            default:
                throw new Error('Invalid search type')
        }
    }


    /**
     * Returns the target items.
     */
    protected getTargetItems(options: ProcessedSearchableOptions<T>): ImmutableAugmentedItem<T>[]
    {
        if (this.getOptions().length === 0) return this.allItems

        if (options.searchTarget.scope === 'All')
            return this.allItems

        else if (options.searchTarget.scope === 'Prev')
            return this.getItems()

        else
            throw new Error('Invalid search target scope')
    }


    /**
     * Performs the previous results' behavior.
     */
    protected performPrevResultsBehavior(
        options: ProcessedSearchableOptions<T>,
    ): void
    {
        const prevResults = options.prevResults

        if (prevResults.action === 'Keep')
            return

        else if (prevResults.action === 'Clear')
        {
            if (prevResults.scope === 'All')
                this.deleteSearchResults(0, this._options.length)

            else if (prevResults.scope === 'Single')
            {
                if (prevResults.target === 'Last')
                    this.deleteSearchResults(this._options.length - 1)

                else if (prevResults.target === 'LastIfSameType')
                {
                    if (
                        this._options.length > 0 &&
                        this._options[this._options.length - 1].by === options.by
                    )
                        this.deleteSearchResults(this._options.length - 1)
                }

                else if (prevResults.target > -1)
                    this.deleteSearchResults(prevResults.target)
            }
        }
    }


    /**
     * Deletes search results.
     */
    protected deleteSearchResults(optionsIndex: number, deletedCount: number = 1): void
    {
        this.allSearchedItems.splice(optionsIndex, deletedCount)
        this._options.splice(optionsIndex, deletedCount)
    }


    /**
     * Processes shared options.
     */
    protected processSharedOptions(
        by: ProcessedSearchableOptions<T>['by'],
        draftOptions: DraftSearchableOptions<T>,
        preProcessedOptions: ProcessedSearchableOptions<T>,
    ): ProcessedSearchableOptions<T>
    {
        preProcessedOptions.by = by

        const processedOptions: ProcessedSearchableOptions<T> = { ...preProcessedOptions }

        processedOptions.revertResultsAtEnd = draftOptions.revertResultsAtEnd !== undefined ?
                                              draftOptions.revertResultsAtEnd : false

        processedOptions.searchTarget = draftOptions.searchTarget !== undefined ?
                                        draftOptions.searchTarget : { scope: 'Prev' }

        const draftPrevResults = draftOptions.prevResults

        if (draftPrevResults === undefined)
        {
            processedOptions.prevResults = {
                action: 'Keep',
            }

            return processedOptions
        }

        if (draftPrevResults.action === undefined || draftPrevResults.action === 'Keep')
        {
            processedOptions.prevResults = {
                action: 'Keep',
            }
        }
        else if (draftPrevResults.action === 'Clear')
        {
            if (draftPrevResults.scope === undefined || draftPrevResults.scope === 'All')
                processedOptions.prevResults = {
                    action: 'Clear',
                    scope: 'All',
                }

            else if (draftPrevResults.scope === 'Single')
                processedOptions.prevResults = {
                    action: 'Clear',
                    scope: 'Single',
                    target: this.resolveIndex(draftPrevResults.target),
                }
        }

        return processedOptions
    }


    /**
     * Resolves an index for searchable options.
     * Makes sure that the index is not out of bounds.
     */
    protected resolveIndex(index: number | 'Last' | 'LastIfSameType'): number
    {
        const length = this._options.length

        if (length === 0 || index === undefined) return length - 1

        if (index === 'Last')
            return length - 1

        if (index === 'LastIfSameType')
        {
            if (this._options.length > 0 && this._options[this._options.length - 1].by === this._options[0].by)
                return length - 1
            else
                return -1
        }

        if (index < 0)
            return length + index >= 0 ? length + index : index

        return index
    }


    /**
     * Performs items revert.
     */
    protected performItemsReverting(
        targetItems: ImmutableAugmentedItem<T>[],
        searchedItems: ImmutableAugmentedItem<T>[],
        processedOptions: ProcessedSearchableOptions<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        if (!processedOptions.revertResultsAtEnd)
            return searchedItems

        return targetItems.filter(item => !searchedItems.includes(item))
    }
}
