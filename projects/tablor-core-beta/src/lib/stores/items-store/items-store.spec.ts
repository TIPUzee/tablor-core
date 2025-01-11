import { ItemsStore } from './items-store'
import { FieldsStore } from '../fields-store/fields-store'
import { AugmentedItem, ImmutableAugmentedItem } from './interfaces'
import { SampleItemFields, SampleItemType, SampleItems } from '../../test-data/test-data-2'


describe('ItemStore', () =>
{
    let fieldsStore: FieldsStore<SampleItemType>
    let itemsStore: ItemsStore<SampleItemType>

    beforeEach(() =>
    {
        fieldsStore = new FieldsStore<SampleItemType>()
        fieldsStore.initialize(SampleItemFields)
        itemsStore = new ItemsStore<SampleItemType>(fieldsStore.getFieldsAsArray.bind(fieldsStore))
    })

    describe('Initialization', () =>
    {
        test('should initialize with an empty dataset', () =>
        {
            expect(itemsStore.getItems().length).toBe(0)
            expect(itemsStore.getNbOfItems()).toBe(0)
        })
    })

    describe('Pagination', () =>
    {
        test('should set and get the total number of allItems', () =>
        {
            expect(itemsStore.getNbOfItems()).toBe(0) // default value
        })
    })

    describe('Data Manipulation', () =>
    {
        test('should initialize data and set total allItems', () =>
        {
            const fn = jest.fn()
            itemsStore.$itemsAdded.subscribe(fn)

            itemsStore.initialize(SampleItems.slice(0, 2))

            expect(itemsStore.getItems().length).toBe(2)

            expect(fn).toHaveBeenCalledTimes(1)
            expect(fn).toHaveBeenCalledWith({
                addedItems: [
                    expect.objectContaining({ ...SampleItems[0], tablorMeta: expect.any(Object) }),
                    expect.objectContaining({ ...SampleItems[1], tablorMeta: expect.any(Object) }),
                ],
            })
        })

        test('should add allItems to the dataset and update total allItems', () =>
        {
            itemsStore.add(SampleItems.slice(0, 2))
            expect(itemsStore.getItems().length).toBe(2)
            expect(itemsStore.getNbOfItems()).toBe(2)
        })

        test('should remove allItems from the dataset by UUIDs and update total allItems', () =>
        {
            const fn = jest.fn()
            itemsStore.$itemsRemoved.subscribe(fn)

            itemsStore.initialize(SampleItems.slice(0, 3))

            const removeStatus = itemsStore.remove([1, 3, 4, 2])
            expect(removeStatus).toEqual([true, true, false, true])
            expect(itemsStore.getItems().length).toBe(0)
            expect(itemsStore.getNbOfItems()).toBe(0)
            expect(fn).toHaveBeenCalledWith({
                removedItems: [
                    expect.objectContaining({ ...SampleItems[0], tablorMeta: expect.any(Object) }),
                    expect.objectContaining({ ...SampleItems[2], tablorMeta: expect.any(Object) }),
                    expect.objectContaining({ ...SampleItems[1], tablorMeta: expect.any(Object) }),
                ],
            })
        })

        test('should update allItems by UUIDs and emit "ItemsUpdated" events', () =>
        {
            const fn = jest.fn()
            itemsStore.$itemsUpdated.subscribe(fn)
            itemsStore.initialize(SampleItems.slice(0, 3))

            const updateStatus = itemsStore.updateByExternalUuids(
                [
                    {
                        ...SampleItems[2], name: 'Zeeshan',
                        // @ts-ignore
                        age: 30,
                    } as SampleItemType,
                ],
                [3],
            )
            expect(updateStatus).toEqual([true])
            expect(itemsStore.getItems()).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    ...SampleItems[2],
                    name: 'Zeeshan',
                    tablorMeta: expect.objectContaining({ uuid: 3 }),
                }),
            ]))
            expect(fn).toHaveBeenCalledWith({
                updatedItems: [
                    {
                        ...SampleItems[2],
                        name: 'Zeeshan',
                        tablorMeta: expect.objectContaining({ uuid: 3 }),
                    },
                ],
                prevUpdatedItems: [{ ...SampleItems[2], tablorMeta: expect.objectContaining({ uuid: 3 }) }],
                updatedItemsDifference: [{ name: 'Zeeshan', tablorMeta: expect.objectContaining({ uuid: 3 }) }],
            })
        })
    })

    describe('Loading State', () =>
    {
        test('should get and set the loading state', () =>
        {
            expect(itemsStore.getLoadingState()).toBe(false)
        })
    })

    describe('Event Handling', () =>
    {
        test('should emit "Loading" events when loading state changes', () =>
        {
            const fn = jest.fn()
            itemsStore.$loadingStateChanged.subscribe(fn)
            itemsStore.initialize(SampleItems.slice(0, 2))

            expect(fn).toHaveBeenCalledTimes(2)
            expect(fn).toHaveBeenCalledWith({ state: false })
            expect(fn).toHaveBeenCalledWith({ state: true })
        })
    })

    describe('Finding and Updating Items', () =>
    {
        test('should find matching allItems for given UUIDs', () =>
        {
            itemsStore.initialize(SampleItems.slice(0, 3))
            const result = itemsStore.findOneMatchingItemForEach([101, 103, 1, 999])
            expect(result[0]).toBeUndefined()
            expect(result[1]).toBeUndefined()
            expect(result[2]).toEqual(expect.objectContaining({ id: 20, name: 'Tom' }))
            expect(result[3]).toBeUndefined()
        })

        test('should update allItems by augmented item data', () =>
        {
            itemsStore.initialize(SampleItems.slice(0, 5))

            const fn = jest.fn()
            itemsStore.$itemsUpdated.subscribe(fn)

            const augItems: ImmutableAugmentedItem<SampleItemType>[] = [
                itemsStore.getItems()[0], itemsStore.getItems()[1], itemsStore.getItems()[2],
            ]

            itemsStore.remove([augItems[1]])

            const updateStatus = itemsStore.updateByInItemUuid(augItems)

            expect(updateStatus).toEqual([true, false, true])
            expect(fn).toHaveBeenCalledTimes(0)
        })
    })
})
