import { ItemsStore } from '../stores/items-store/items-store'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { AugmentedItem } from '../stores/items-store/interfaces'
import { SampleItemType, SampleItemFields, SampleItems } from '../test-data/test-data-2'
import { Paginator } from './paginator'
import { expect } from '@jest/globals'
import {
    NbOfItemsPerPageChangedPayload,
    NbOfTotalPagesChangedPayload,
    PageNbChangedPayload,
    PaginatedItemsChangedPayload,
} from './interfaces'
import { Searcher } from '../searcher/searcher/searcher'
import { Sorter } from '../sorter/sorter'


describe('NvPaginator', () =>
{
    let allItems: AugmentedItem<SampleItemType>[]
    let searchResults: AugmentedItem<SampleItemType>[]
    let allSearchedItems: AugmentedItem<SampleItemType>[][]

    let itemsStore: ItemsStore<SampleItemType>
    let fieldsStore: FieldsStore<SampleItemType>
    let sorter: Sorter<SampleItemType>
    let searcher: Searcher<SampleItemType>
    let paginator: Paginator<SampleItemType>

    beforeEach(() =>
    {
        allItems = []
        searchResults = []
        allSearchedItems = []

        fieldsStore = new FieldsStore<SampleItemType>()

        itemsStore = new ItemsStore<SampleItemType>(allItems, fieldsStore)

        searcher = new Searcher<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            fieldsStore.getFieldsAsArray.bind(fieldsStore),
            allItems,
            allSearchedItems,
            searchResults,
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )

        sorter = new Sorter<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            searchResults,
            searcher.$searchedItemsChanged,
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )

        paginator = new Paginator<SampleItemType>(
            searchResults,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsAdded,
            searcher.$searchedItemsChanged,
            sorter.$sortingOptionsChanged,
        )
        paginator.setNbOfItemsPerPage(3)

        fieldsStore.initialize(SampleItemFields)
        itemsStore.initialize(SampleItems)
    })

    test('should create an instance of NvPaginator', () =>
    {
        expect(paginator).toBeInstanceOf(Paginator)
    })

    test('should have correct default values', () =>
    {
        allItems = []
        allSearchedItems = []
        searchResults = []

        itemsStore = new ItemsStore<SampleItemType>(allItems, fieldsStore)

        searcher = new Searcher<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            fieldsStore.getFieldsAsArray.bind(fieldsStore),
            allItems,
            allSearchedItems,
            searchResults,
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )

        sorter = new Sorter<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            searchResults,
            searcher.$searchedItemsChanged,
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )

        paginator = new Paginator<SampleItemType>(
            searchResults,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsAdded,
            searcher.$searchedItemsChanged,
            sorter.$sortingOptionsChanged,
        )

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(1)
        expect(paginator.getPageSize()).toBe(0)
        expect(paginator.getItems()).toEqual([])
    })

    test('should have correct values after data init', () =>
    {
        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(7)
        expect(paginator.getPageSize()).toBe(3)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 1 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 3 }) }),
        ])
    })

    test('should have correct values after non-paged-rows removal', () =>
    {
        itemsStore.remove([
            itemsStore.getItems()[10], itemsStore.getItems()[11], itemsStore.getItems()[12],
            itemsStore.getItems()[13], itemsStore.getItems()[14],
        ])

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(5)
        expect(paginator.getPageSize()).toBe(3)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 1 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 3 }) }),
        ])
    })

    test('should have correct values after single paged-rows removal', () =>
    {
        itemsStore.remove([
            itemsStore.getItems()[0], itemsStore.getItems()[11], itemsStore.getItems()[12],
            itemsStore.getItems()[13], itemsStore.getItems()[14],
        ])

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(5)
        expect(paginator.getPageSize()).toBe(3)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 3 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 4 }) }),
        ])
    })

    test('should have correct values after multiple paged-rows removal', () =>
    {
        itemsStore.remove([
            itemsStore.getItems()[0], itemsStore.getItems()[2], itemsStore.getItems()[12],
            itemsStore.getItems()[13], itemsStore.getItems()[14],
        ])

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(5)
        expect(paginator.getPageSize()).toBe(3)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 4 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 5 }) }),
        ])
    })

    test('should have correct values after all paged-rows removals', () =>
    {
        itemsStore.remove([
            itemsStore.getItems()[0], itemsStore.getItems()[1], itemsStore.getItems()[2],
            itemsStore.getItems()[13], itemsStore.getItems()[14],
        ])

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(5)
        expect(paginator.getPageSize()).toBe(3)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 4 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 5 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 6 }) }),
        ])
    })

    test('should have correct values after changing nb of rows per page (increase)', () =>
    {
        paginator.setNbOfItemsPerPage(5)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(4)
        expect(paginator.getPageSize()).toBe(5)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 1 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 3 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 4 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 5 }) }),
        ])
    })

    test('should have correct values after changing nb of rows per page (decrease)', () =>
    {
        paginator.setNbOfItemsPerPage(2)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(10)
        expect(paginator.getPageSize()).toBe(2)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 1 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
        ])
    })

    test('should have correct values after page number page', () =>
    {
        paginator.setNbOfItemsPerPage(2)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 1 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
        ])

        paginator.setPageNb(2)

        expect(paginator.getPageNb()).toBe(2)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 3 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 4 }) }),
        ])

        paginator.setPageNb(3)

        expect(paginator.getPageNb()).toBe(3)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 5 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 6 }) }),
        ])

        paginator.setPageNb(2)

        expect(paginator.getPageNb()).toBe(2)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 3 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 4 }) }),
        ])

        paginator.setPageNb(-1)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 1 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 2 }) }),
        ])

        paginator.setPageNb(10)

        expect(paginator.getPageNb()).toBe(10)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 19 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 20 }) }),
        ])

        paginator.setPageNb(9)
        paginator.setPageNb(50)

        expect(paginator.getPageNb()).toBe(10)
        expect(paginator.getItems()).toEqual([
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 19 }) }),
            expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 20 }) }),
        ])

        paginator.setNbOfItemsPerPage(30)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageSize()).toBe(20)
        expect(paginator.getItems()).toEqual(
            Array.from({ length: 20 }, (_, i) => i + 1)
                .map(uuid => expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid }) })),
        )
    })

    test('should show correct values on infinite scroll', () =>
    {
        paginator.setPageNb(3)
        paginator.setNbOfItemsPerPage(-1)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getPageIndex()).toBe(0)
        expect(paginator.getNbOfPages()).toBe(1)
        expect(paginator.getPageSize()).toBe(20)

        expect(paginator.getItems()).toEqual(
            Array.from({ length: 20 }, (_, i) => i + 1).map(uuid =>
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid }) }),
            ),
        )
    })

    test('should emit page change event', () =>
    {
        itemsStore.initialize(SampleItems.slice(0, 12))

        const paginatedItemsChangeFn = jest.fn()
        const nbOfItemsPerPageChangeFn = jest.fn()
        const pageNbChangeFn = jest.fn()
        const nbOfTotalPagesChangeFn = jest.fn()

        paginator.$nbOfItemsPerPageChanged.subscribe(nbOfItemsPerPageChangeFn)
        paginator.$nbOfTotalPagesChanged.subscribe(nbOfTotalPagesChangeFn)

        paginator.setNbOfItemsPerPage(5)
        paginator.setPageNb(2)

        paginator.$paginatedItemsChanged.subscribe(paginatedItemsChangeFn)
        paginator.$pageNbChanged.subscribe(pageNbChangeFn)

        paginator.setPageNb(3)

        const details = {
            pageNb: 3,
            prevPageNb: 2,
            nbOfItemsPerPage: 5,
            prevNbOfItemsPerPage: 3,
            pageSize: 2,
            prevPageSize: 5,
            totalPages: 3,
            prevTotalPages: 4,
            // @ts-ignore
            pageData: [
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 31 }) }),
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 32 }) }),
            ] as PaginatedItemsChangedPayload<SampleItemType>['paginatedItems'],
            // @ts-ignore
            prevPageData: [
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 26 }) }),
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 27 }) }),
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 28 }) }),
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 29 }) }),
                expect.objectContaining({ tablorMeta: expect.objectContaining({ uuid: 30 }) }),
            ] as PaginatedItemsChangedPayload<SampleItemType>['prevPaginatedItems'],
        }

        expect(paginatedItemsChangeFn).toBeCalledTimes(1)
        expect(paginatedItemsChangeFn).toBeCalledWith({
            paginatedItems: details.pageData,
            prevPaginatedItems: details.prevPageData,
        } as PaginatedItemsChangedPayload<SampleItemType>)

        expect(nbOfItemsPerPageChangeFn).toBeCalledTimes(1)
        expect(nbOfItemsPerPageChangeFn).toBeCalledWith({
            nbOfItemsPerPage: details.nbOfItemsPerPage,
            prevNbOfItemsPerPage: details.prevNbOfItemsPerPage,
        } as NbOfItemsPerPageChangedPayload<SampleItemType>)

        expect(pageNbChangeFn).toBeCalledTimes(1)
        expect(pageNbChangeFn).toBeCalledWith({
            pageNb: details.pageNb,
            prevPageNb: details.prevPageNb,
        } as PageNbChangedPayload<SampleItemType>)

        expect(nbOfTotalPagesChangeFn).toBeCalledTimes(1)
        expect(nbOfTotalPagesChangeFn).toBeCalledWith({
            nbOfTotalPages: details.totalPages,
            prevNbOfTotalPages: details.prevTotalPages,
        } as NbOfTotalPagesChangedPayload<SampleItemType>)
    })

    test('should have correct values after search', () =>
    {
        searcher.searchByNumbersRanges({
            ranges: {
                id: [
                    {
                        min: 10,
                    },
                ],
            },
        })

        paginator.setNbOfItemsPerPage(-1)

        expect(paginator.getPageNb()).toBe(1)
        expect(paginator.getNbOfPages()).toBe(1)
        expect(paginator.getPageSize()).toBe(10)

        expect(paginator.getItems()).toEqual(
            searchResults.filter(item => item.id > 10),
        )
    })
})
