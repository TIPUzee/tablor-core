import { ItemsStore } from '../stores/items-store/items-store'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { AugmentedItem } from '../stores/items-store/interfaces'
import { SampleItemType, SampleItemFields, SampleItems } from '../test-data/test-data-4'
import { Paginator } from './paginator'
import { Searcher } from '../searcher/searcher/searcher'
import { Sorter } from '../sorter/sorter'


describe('NvPaginator', () =>
{
        let allItems: AugmentedItem<SampleItemType>[]
    let allSearchedItems: AugmentedItem<SampleItemType>[][]
    let searchResults: AugmentedItem<SampleItemType>[]
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
            allItems,
            allSearchedItems,
            searchResults,
            fieldsStore,
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )

        sorter = new Sorter<SampleItemType>(
            fieldsStore,
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

        for (let i = 0; i < 100; i++)
        {
            itemsStore.add(SampleItems)
        }
    })

    test('should be created', () =>
    {
        expect(paginator).toBeTruthy()
    })

    test('should change nb of items per page to +ve value', () =>
    {
        paginator.setNbOfItemsPerPage(100)

        expect(paginator.getNbOfItemsPerPage()).toBe(100)
    })

    test('should change nb of items per page to -ve value', () =>
    {
        paginator.setNbOfItemsPerPage(-1)

        expect(paginator.getNbOfItemsPerPage()).toBe(-1)
    })

    test('should change nb of items per page to -ve value, multiple times', () =>
    {
        paginator.setNbOfItemsPerPage(-1)
        paginator.setNbOfItemsPerPage(-2)
        paginator.setNbOfItemsPerPage(-3)
        paginator.setNbOfItemsPerPage(-4)
        paginator.setNbOfItemsPerPage(-1)
        paginator.setNbOfItemsPerPage(-3)
        paginator.setNbOfItemsPerPage(-10)

        expect(paginator.getNbOfItemsPerPage()).toBe(-1)
    })
})
