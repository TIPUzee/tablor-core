import
    {
        ImmutableAugmentedItem,
        ItemsAddedPayload,
        ItemsRemovedPayload,
        Item,
    } from '../stores/items-store/interfaces'
import { Subject } from 'rxjs'
import
    {
        NbOfItemsPerPageChangedPayload,
        NbOfTotalPagesChangedPayload,
        PageNbChangedPayload,
        PaginatedItemsChangedPayload,
    } from './interfaces'
import { Searcher } from '../searcher/searcher/searcher'
import { SearchedItemsChangedPayload } from '../searcher/searcher/interfaces'
import { SortingOptionsChangedPayload } from '../sorter/interfaces'


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
        protected readonly searchedItemsStore: Searcher<T>,
        protected readonly $itemsRemoved: Subject<ItemsRemovedPayload<T>>,
        protected readonly $itemsAdded: Subject<ItemsAddedPayload<T>>,
        protected readonly $searchedItemsChanged: Subject<SearchedItemsChangedPayload<T>>,
        protected readonly $sortingOptionsChanged: Subject<SortingOptionsChangedPayload<T>>,
    )
    {
        this.initializeEventListeners()
    }


    protected initializeEventListeners(): void
    {
        this.$itemsRemoved.subscribe(() => this.handleItemsRemoved())
        this.$itemsAdded.subscribe(() => this.handleItemsAdded())
        this.$searchedItemsChanged.subscribe(() => this.handleItemsSearched())
        this.$sortingOptionsChanged.subscribe(() => this.handleItemsSorted())
    }


    public getPageNb(): number
    {
        return this._pageNb
    }


    public setPageNb(nb: number): void
    {
        this.updatePageNb(nb)
    }


    public getNbOfItemsPerPage(): number
    {
        return this._nbOfItemsPerPage
    }


    public setNbOfItemsPerPage(nb: number): void
    {
        this.updateItemsPerPage(nb)
    }


    public getNbOfPages(): number
    {
        return this._nbOfTotalPages
    }


    public getPageIndex(): number
    {
        return this.getPageNb() - 1
    }


    public getPageSize(): number
    {
        return this.getItems().length
    }


    public getItems(): Readonly<ImmutableAugmentedItem<T>[]>
    {
        return this._paginatedItems
    }


    protected updatePageItemsInternal(): void
    {
        const prevPaginatedItems = this._paginatedItems

        const startIdx = this.getPageIndex() * this._nbOfItemsPerPage
        const endIdx =
            this._nbOfItemsPerPage === -1
                ? this.searchedItemsStore.getItems().length
                : startIdx + this._nbOfItemsPerPage

        if (this._nbOfItemsPerPage === -1)
            this._paginatedItems = this.searchedItemsStore.getItems()
        else
            this._paginatedItems = this.searchedItemsStore.getItems().slice(startIdx, endIdx)

        if (
            prevPaginatedItems.length !== this._paginatedItems.length ||
            !prevPaginatedItems.every((item, index) => item === this._paginatedItems[index])
        )
        {
            this.raisePaginatedItemsChanged(prevPaginatedItems)
        }
    }


    private updateItemsPerPage(nb: number): void
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



    private updatePageNb(nb: number): void
    {
        const prevPageNb = this._pageNb
        this._pageNb = Math.max(1, Math.min(nb, this.getNbOfPages()))

        if (this._pageNb !== prevPageNb)
        {
            this.raisePageNbChanged(prevPageNb)
            this.updatePageItemsInternal()
        }
    }


    private updateNbOfTotalPages(): void
    {
        const prevNbOfTotalPages = this._nbOfTotalPages
        const totalItems = this.searchedItemsStore.getItems().length

        this._nbOfTotalPages = this._nbOfItemsPerPage === -1 ? 1 : Math.ceil(totalItems / this._nbOfItemsPerPage)

        if (this._nbOfTotalPages !== prevNbOfTotalPages)
        {
            this.raiseNbOfTotalPagesChanged(prevNbOfTotalPages)
        }
    }


    private handleItemsRemoved(): void
    {
        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)
        this.updatePageItemsInternal()
    }


    private handleItemsAdded(): void
    {
        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)
        this.updatePageItemsInternal()
    }


    private handleItemsSearched(): void
    {
        this.updateNbOfTotalPages()
        this.updatePageNb(this._pageNb)
        this.updatePageItemsInternal()
    }


    private handleItemsSorted(): void
    {
        this.updatePageItemsInternal()
    }


    private raiseNbOfItemsPerPageChanged(prevNbOfItemsPerPage: number): void
    {
        this.$nbOfItemsPerPageChanged.next({
            nbOfItemsPerPage: this._nbOfItemsPerPage,
            prevNbOfItemsPerPage,
        })
    }


    private raiseNbOfTotalPagesChanged(prevNbOfTotalPages: number): void
    {
        this.$nbOfTotalPagesChanged.next({
            nbOfTotalPages: this._nbOfTotalPages,
            prevNbOfTotalPages,
        })
    }


    private raisePageNbChanged(prevPageNb: number): void
    {
        this.$pageNbChanged.next({ prevPageNb, pageNb: this._pageNb })
    }


    private raisePaginatedItemsChanged(prevPaginatedItems: Readonly<ImmutableAugmentedItem<T>[]>): void
    {
        this.$paginatedItemsChanged.next({
            paginatedItems: this._paginatedItems,
            prevPaginatedItems,
        })
    }
}
