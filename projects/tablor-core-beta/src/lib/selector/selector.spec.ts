import { Selector } from './selector'
import { ItemsStore } from '../stores/items-store/items-store'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { expect } from '@jest/globals'
import { SampleItemType, SampleItemFields, SampleItems } from '../test-data/test-data-2'
import { Paginator } from '../paginator/paginator'
import { Searcher } from '../searcher/searcher/searcher'
import { Sorter } from '../sorter/sorter'


describe('Selector', () =>
{
    let itemsStore: ItemsStore<SampleItemType>
    let fieldsStore: FieldsStore<SampleItemType>
    let searcher: Searcher<SampleItemType>
    let sorter: Sorter<SampleItemType>
    let paginator: Paginator<SampleItemType>
    let selector: Selector<SampleItemType>

    beforeEach(() =>
    {
        fieldsStore = new FieldsStore<SampleItemType>()
        itemsStore = new ItemsStore<SampleItemType>(fieldsStore.getFieldsAsArray.bind(fieldsStore))
        searcher = new Searcher<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            fieldsStore.getFieldsAsArray.bind(fieldsStore),
            itemsStore.getItems.bind(itemsStore),
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )
        sorter = new Sorter<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            searcher.getMutableItems.bind(searcher),
            searcher.$searchedItemsChanged,
            itemsStore.$itemsAdded,
            itemsStore.$itemsRemoved,
            itemsStore.$itemsUpdated,
        )
        paginator = new Paginator<SampleItemType>(
            searcher.getMutableItems.bind(searcher),
            itemsStore.$itemsRemoved,
            itemsStore.$itemsAdded,
            searcher.$searchedItemsChanged,
            sorter.$sortingOptionsChanged,
        )
        selector = new Selector<SampleItemType>(
            itemsStore.getItems.bind(itemsStore),
            paginator.getItems.bind(paginator),
            itemsStore.findOneIndexForEach.bind(itemsStore),
            itemsStore.$itemsRemoved,
        )

        fieldsStore.initialize(SampleItemFields)
        itemsStore.initialize(SampleItems)
    })

    test('should initialize with no selected items', () =>
    {
        expect(selector.getNbOfSelectedItems()).toBe(0)
    })

    test('should select an item and emit an event', () =>
    {
        let fn = jest.fn()
        selector.$itemsSelectionChanged.subscribe(fn)

        const item1 = itemsStore.getItems()[0]

        selector.select(item1, true)
        expect(item1.tablorMeta.isSelected).toBe(true)
        expect(selector.getNbOfSelectedItems()).toBe(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: true },
                },
            ],
        })
    })

    test('should deselect an item and emit an event', () =>
    {
        const item1 = itemsStore.getItems()[0]
        selector.select(item1, true)

        let fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        selector.select(item1, false)
        expect(item1.tablorMeta.isSelected).toBe(false)
        expect(selector.getNbOfSelectedItems()).toBe(0)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: false },
                },
            ],
        })
    })

    test('should toggle item selection', () =>
    {
        let fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        const item1 = itemsStore.getItems()[0]

        selector.select(item1, 'toggle')
        expect(item1.tablorMeta.isSelected).toBe(true)
        expect(selector.getNbOfSelectedItems()).toBe(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: true },
                },
            ],
        })

        fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        selector.select(item1, 'toggle')

        expect(item1.tablorMeta.isSelected).toBe(false)
        expect(selector.getNbOfSelectedItems()).toBe(0)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: false },
                },
            ],
        })
    })

    test('should select multiple items and emit events', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]

        let fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        selector.selectMultiple([item1, item2], true)
        expect(item1.tablorMeta.isSelected).toBe(true)
        expect(item2.tablorMeta.isSelected).toBe(true)
        expect(selector.getNbOfSelectedItems()).toBe(2)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: true },
                },
                {
                    ...item2, tablorMeta: { ...(item2.tablorMeta), isSelected: true },
                },
            ],
        })
    })

    test('should deselect multiple items and emit events', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]

        selector.selectMultiple([item1, item2], true)

        let fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        selector.selectMultiple([item1, item2], false)
        expect(item1.tablorMeta.isSelected).toBe(false)
        expect(item2.tablorMeta.isSelected).toBe(false)
        expect(selector.getNbOfSelectedItems()).toBe(0)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: false },
                },
                {
                    ...item2, tablorMeta: { ...(item2.tablorMeta), isSelected: false },
                },
            ],
        })
    })

    test('should handle toggle for multiple items', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]

        selector.select(item1, true)

        let fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        selector.selectMultiple([item1, item2], 'toggle')
        expect(item1.tablorMeta.isSelected).toBe(false)
        expect(item2.tablorMeta.isSelected).toBe(true)
        expect(selector.getNbOfSelectedItems()).toBe(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: false },
                },
                {
                    ...item2, tablorMeta: { ...(item2.tablorMeta), isSelected: true },
                },
            ],
        })

        fn = jest.fn()

        selector.$itemsSelectionChanged.subscribe(fn)

        selector.selectMultiple([item1, item2], 'toggle')
        expect(item1.tablorMeta.isSelected).toBe(true)
        expect(item2.tablorMeta.isSelected).toBe(false)
        expect(selector.getNbOfSelectedItems()).toBe(1)
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
            items: [
                {
                    ...item1, tablorMeta: { ...(item1.tablorMeta), isSelected: true },
                },
                {
                    ...item2, tablorMeta: { ...(item2.tablorMeta), isSelected: false },
                },
            ],
        })
    })

    test('should return the correct count of selected items after removing items', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]
        const item3 = itemsStore.getItems()[2]
        const item4 = itemsStore.getItems()[3]

        selector.select(item1, true)
        selector.select(item3, true)
        selector.select(item4, true)
        expect(selector.getNbOfSelectedItems()).toBe(3)

        itemsStore.remove([item2, item3])
        expect(selector.getNbOfSelectedItems()).toBe(2)

        itemsStore.remove([item1, item4])
        expect(selector.getNbOfSelectedItems()).toBe(0)
    })

    test('should return the correct count of selected items within a subset', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]
        const item3 = itemsStore.getItems()[2]

        selector.select(item1, true)
        selector.select(item2, true)

        itemsStore.remove([item1, item2, item3])

        expect(selector.getNbOfSelectedItemsIn([item1, item2, item3])).toBe(0)
    })

    test('should throw an error if states length does not match item length in selectMultiple', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]

        expect(() => selector.selectMultiple([item1, item2], [true]))
            .toThrow('The number of items and states must match')
    })

    test('should not throw an error if `undefined` is passed as states', () =>
    {
        const item1 = itemsStore.getItems()[0]

        selector.select(item1, true)
        selector.select(undefined, true)

        expect(selector.getNbOfSelectedItems()).toBe(1)
    })

    test('should not throw an error if `undefined` is passed as states in selectMultiple', () =>
    {
        const item1 = itemsStore.getItems()[0]
        const item2 = itemsStore.getItems()[1]

        selector.selectMultiple([item1, item2, undefined], true)

        expect(selector.getNbOfSelectedItems()).toBe(2)
    })
})
