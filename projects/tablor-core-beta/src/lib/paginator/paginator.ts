import { Subject } from 'rxjs'
import
{
    ImmutableAugmentedItem,
    ItemsAddedPayload,
    ItemsRemovedPayload,
    Item,
} from '../stores/items-store/interfaces'
import
{
    NbOfItemsPerPageChangedPayload,
    NbOfTotalPagesChangedPayload,
    PageNbChangedPayload,
    PaginatedItemsChangedPayload,
} from './interfaces'
import { SearchedItemsChangedPayload } from '../searcher/searcher/interfaces'
import { SortingOptionsChangedPayload } from '../sorter/interfaces'
import { Searcher } from '../searcher/searcher/searcher'


/**
 * Handles pagination of items
 */
export class Paginator<T extends Item<T>>
{
    protected _paginatedItems: Readonly<ImmutableAugmentedItem<T>[]> = []
    protected _pageNb: number = 1
    protected _nbOfItemsPerPage: number = 10
    protected _nbOfTotalPages: number = 1

    public readonly $pageNbChanged = new Subject<PageNbChangedPayload<T>>()
    public readonly $nbOfItemsPerPageChanged = new Subject<NbOfItemsPerPageChangedPayload<T>>()
    public readonly $nbOfTotalPagesChanged = new Subject<NbOfTotalPagesChangedPayload<T>>()
    public readonly $paginatedItemsChanged = new Subject<PaginatedItemsChangedPayload<T>>()


    constructor(
        protected readonly getSearchResults: Searcher<T>['getMutableItems'],
        protected readonly $itemsRemoved: Subject<ItemsRemovedPayload<T>>,
        protected readonly $itemsAdded: Subject<ItemsAddedPayload<T>>,
        protected readonly $searchedItemsChanged: Subject<SearchedItemsChangedPayload<T>>,
        protected readonly $sortingOptionsChanged: Subject<SortingOptionsChangedPayload<T>>,
    )
    {
        this.$itemsRemoved.subscribe(() => this.handleItemsRemoved())
        this.$itemsAdded.subscribe(() => this.handleItemsAdded())
        this.$searchedItemsChanged.subscribe(() => this.handleItemsSearched())
        this.$sortingOptionsChanged.subscribe(() => this.handleItemsSorted())
    }


    /**
     * Returns the current page number
     */
    public getPageNb(): number
    {
        return this._pageNb
    }


    /**
     * Sets the current page number
     */
    public setPageNb(nb: number): void
    {
        this.updatePageNb(nb)
    }


    /**
     * Returns the number of items per page
     */
    public getNbOfItemsPerPage(): number
    {
        return this._nbOfItemsPerPage
    }


    /**
     * Sets the number of items per page
     */
    public setNbOfItemsPerPage(nb: number): void
    {
        this.updateItemsPerPage(nb)
    }


    /**
     * Returns the total number of pages
     */
    public getNbOfPages(): number
    {
        return this._nbOfTotalPages
    }


    /**
     * Returns the current page index
     */
    public getPageIndex(): number
    {
        return this.getPageNb() - 1
    }


    /**
     * Returns the total number of items
     */
    public getPageSize(): number
    {
        return this.getItems().length
    }


    /**
     * Returns the current page items
     */
    public getItems(): Readonly<ImmutableAugmentedItem<T>[]>
    {
        return this._paginatedItems
    }


    /**
     * Updates the current page items
     */
    protected updatePageItemsInternal(): void
    {
        const prevPaginatedItems = this._paginatedItems

        const startIdx = this.getPageIndex() * this._nbOfItemsPerPage
        const endIdx =
            this._nbOfItemsPerPage === -1
            ? this.getSearchResults().length
            : startIdx + this._nbOfItemsPerPage

        if (this._nbOfItemsPerPage === -1)
            this._paginatedItems = this.getSearchResults()
        else
            this._paginatedItems = this.getSearchResults().slice(startIdx, endIdx)

        if (
            prevPaginatedItems.length !== this._paginatedItems.length ||
            !prevPaginatedItems.every((item, index) => item === this._paginatedItems[index])
        )
        {
            this.raisePaginatedItemsChanged(prevPaginatedItems)
        }
    }


    /**
     * Updates the number of items per page
     */
    protected updateItemsPerPage(nb: number): void
    {
        if (nb < 0) nb = -1

        if (nb === this._nbOfItemsPerPage)
        {
            return
        }

        const prevItemsPerPage = this._nbOfItemsPerPage
        this._nbOfItemsPerPage = nb

        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)

        this.raiseNbOfItemsPerPageChanged(prevItemsPerPage)
        this.updatePageItemsInternal()
    }


    /**
     * Updates the current page number
     */
    protected updatePageNb(nb: number): void
    {
        const prevPageNb = this._pageNb
        this._pageNb = Math.max(1, Math.min(nb, this.getNbOfPages()))

        if (this._pageNb !== prevPageNb)
        {
            this.raisePageNbChanged(prevPageNb)
            this.updatePageItemsInternal()
        }
    }


    /**
     * Updates the number of total pages
     */
    protected updateNbOfTotalPages(): void
    {
        const prevNbOfTotalPages = this._nbOfTotalPages
        const totalItems = this.getSearchResults().length

        this._nbOfTotalPages = this._nbOfItemsPerPage === -1 ? 1 : Math.ceil(totalItems / this._nbOfItemsPerPage)

        if (this._nbOfTotalPages !== prevNbOfTotalPages)
        {
            this.raiseNbOfTotalPagesChanged(prevNbOfTotalPages)
        }
    }


    /**
     * Updates the current page items
     */
    protected handleItemsRemoved(): void
    {
        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)
        this.updatePageItemsInternal()
    }


    /**
     * Updates the current page items
     */
    protected handleItemsAdded(): void
    {
        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)
        this.updatePageItemsInternal()
    }


    /**
     * Updates the current page items
     */
    protected handleItemsSearched(): void
    {
        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)
        this.updatePageItemsInternal()
    }


    /**
     * Updates the current page items
     */
    protected handleItemsSorted(): void
    {
        this.updatePageItemsInternal()
    }


    /**
     * Updates the current page items
     */
    protected raiseNbOfItemsPerPageChanged(prevNbOfItemsPerPage: number): void
    {
        this.$nbOfItemsPerPageChanged.next({
            nbOfItemsPerPage: this._nbOfItemsPerPage,
            prevNbOfItemsPerPage,
        })
    }


    /**
     * Updates the current page items
     */
    protected raiseNbOfTotalPagesChanged(prevNbOfTotalPages: number): void
    {
        this.$nbOfTotalPagesChanged.next({
            nbOfTotalPages: this._nbOfTotalPages,
            prevNbOfTotalPages,
        })
    }


    /**
     * Updates the current page items
     */
    protected raisePageNbChanged(prevPageNb: number): void
    {
        this.$pageNbChanged.next({ prevPageNb, pageNb: this._pageNb })
    }


    /**
     * Updates the current page items
     */
    protected raisePaginatedItemsChanged(prevPaginatedItems: Readonly<ImmutableAugmentedItem<T>[]>): void
    {
        this.$paginatedItemsChanged.next({
            paginatedItems: this._paginatedItems,
            prevPaginatedItems,
        })
    }
}
