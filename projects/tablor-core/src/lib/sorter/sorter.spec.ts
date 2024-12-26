import { describe, expect } from '@jest/globals'
import { ItemsStore } from '../stores/items-store/items-store'
import { SampleItemFields, SampleItemType, SampleItems } from '../test-data/test-data-3'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { AugmentedItem } from '../stores/items-store/interfaces'
import { Searcher } from '../searcher/searcher/searcher'
import { Sorter } from './sorter'


describe('Sorter', () =>
{
    let allItems: AugmentedItem<SampleItemType>[]
    let allSearchedItems: AugmentedItem<SampleItemType>[][]
    let searchResults: AugmentedItem<SampleItemType>[]
    let itemsStore: ItemsStore<SampleItemType>
    let fieldsStore: FieldsStore<SampleItemType>
    let searcher: Searcher<SampleItemType>
    let sorter: Sorter<SampleItemType>

    const consoleAllItems = () =>
    {
        const f = []

        for (let i = 0; i < searchResults.length; i++)
        {
            f.push(`${ searchResults[i].UserName } ${ searchResults[i].Amount } ${ searchResults[i].tablorMeta.uuid }`)
        }

        console.log(f)
    }

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

        fieldsStore.initialize(SampleItemFields)
        itemsStore.initialize(SampleItems)
    })

    test('should sort items up to the first level in asc', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        expect(searchResults[0].UserName).toBe('Ahmed')
        expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')
    })

    test('should sort data up to the first level in desc', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 1].UserName).toBe('Ahmed')
    })

    test('should sort data upto 1st level via toggle', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(searchResults[0].UserName).toBe('Ahmed')
        expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 1].UserName).toBe('Ahmed')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 2].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 1].UserName).toBe('Ahmed')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(searchResults[0].UserName).toBe('Ahmed')
        expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')
    })

    test('should sort data up to the second level in asc', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        sorter.sort({
            field: 'Amount',
            order: 'ASC',
        })

        expect(searchResults[0].UserName).toBe('Ahmed')
        expect(searchResults[0].Amount).toBe(1000)

        expect(searchResults[1].UserName).toBe('Ahmed')
        expect(searchResults[1].Amount).toBe(1500)

        expect(searchResults[11].UserName).toBe('Ali')
        expect(searchResults[11].Amount).toBe(1000)

        expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 1].Amount).toBe(5000)
    })

    test('should sort data up to the second level by toggle nested option', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        expect(searchResults[0].UserName).toBe('Ahmed')
        expect(searchResults[0].Amount).toBe(1000)

        expect(searchResults[1].UserName).toBe('Ahmed')
        expect(searchResults[1].Amount).toBe(1500)

        expect(searchResults[10].UserName).toBe('Ahmed')
        expect(searchResults[10].Amount).toBe(5000)

        expect(searchResults[11].UserName).toBe('Ali')
        expect(searchResults[11].Amount).toBe(1000)

        expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 1].Amount).toBe(5000)

        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        expect(searchResults[0].UserName).toBe('Ahmed')
        expect(searchResults[0].Amount).toBe(5000)

        expect(searchResults[10].UserName).toBe('Ahmed')
        expect(searchResults[10].Amount).toBe(1000)

        expect(searchResults[11].UserName).toBe('Ali')
        expect(searchResults[11].Amount).toBe(5000)

        expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')
        expect(searchResults[searchResults.length - 1].Amount).toBe(1200)
    })

    test(
        'should sort data up to the second level by toggle higher level option', () =>
        {
            sorter.sort({
                field: 'UserName',
                order: 'Toggle',
            })

            sorter.sort({
                field: 'Amount',
                order: 'Toggle',
            })

            expect(searchResults[0].UserName).toBe('Ahmed')
            expect(searchResults[0].Amount).toBe(1000)

            expect(searchResults[1].UserName).toBe('Ahmed')
            expect(searchResults[1].Amount).toBe(1500)

            expect(searchResults[10].UserName).toBe('Ahmed')
            expect(searchResults[10].Amount).toBe(5000)

            expect(searchResults[11].UserName).toBe('Ali')
            expect(searchResults[11].Amount).toBe(1000)

            expect(searchResults[searchResults.length - 1].UserName).toBe('Zeeshan')
            expect(searchResults[searchResults.length - 1].Amount).toBe(5000)

            sorter.sort({
                field: 'UserName',
                order: 'Toggle',
            })

            expect(searchResults[0].UserName).toBe('Zeeshan')
            expect(searchResults[0].Amount).toBe(1200)

            expect(searchResults[17].UserName).toBe('Zeeshan')
            expect(searchResults[17].Amount).toBe(5000)

            expect(searchResults[18].UserName).toBe('Ali')
            expect(searchResults[18].Amount).toBe(1000)

            expect(searchResults[19].UserName).toBe('Ali')
            expect(searchResults[19].Amount).toBe(1500)

            expect(searchResults[39].UserName).toBe('Ahmed')
            expect(searchResults[39].Amount).toBe(5000)
        },
    )

    test('should sort data up to the first level in asc after sorting up to the second level', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })
        sorter.sort({
            field: 'Amount',
            order: 'ASC',
        })

        sorter.clearSort()
        sorter.sort({
            field: 'TransactionType',
            order: 'ASC',
        })

        expect(searchResults[0].TransactionType).toBe('Purchase')
    })

    test('should sort data up to the second level in desc', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })
        sorter.sort({
            field: 'Amount',
            order: 'DESC',
        })

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[0].Amount).toBe(5000)

        expect(searchResults[18].UserName).toBe('Ali')
        expect(searchResults[18].Amount).toBe(5000)

        expect(searchResults[searchResults.length - 1].UserName).toBe('Ahmed')
        expect(searchResults[searchResults.length - 1].Amount).toBe(1000)
    })

    test('should sort data up to the second level in desc after sorting up to the first level', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        sorter.sort({
            field: 'Amount',
            order: 'DESC',
        })

        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[0].Amount).toBe(5000)

        itemsStore.remove([searchResults[17].tablorMeta.uuid])

        expect(searchResults[17].UserName).toBe('Ali')
        expect(searchResults[17].Amount).toBe(5000)

        expect(searchResults[searchResults.length - 1].UserName).toBe('Ahmed')
        expect(searchResults[searchResults.length - 1].Amount).toBe(1000)
    })

    test('should sort the data after updating an item', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })

        sorter.sort({
            field: 'Amount',
            order: 'DESC',
        })

        itemsStore.updateByInItemUuid([
            { ...itemsStore.getItems()[0], UserName: 'John' },
        ])

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[17].UserName).toBe('John')
        expect(searchResults[18].UserName).toBe('Ali')
    })

    test('should sort the data after updating an item - 2', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })

        sorter.sort({
            field: 'Amount',
            order: 'DESC',
        })

        itemsStore.updateByInItemUuid([
            { ...searchResults[22], Amount: 6000 },
        ])

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[18].UserName).toBe('Ali')
        expect(searchResults[18].Amount).toBe(6000)
    })

    test('should sort the data after adding an item', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })
        sorter.sort({
            field: 'Amount',
            order: 'DESC',
        })

        itemsStore.add([
            {
                TransactionID: 20,
                UserName: 'John',
                Date: new Date('2024-11-10'),
                Amount: 5000,
                PaymentMethod: 'Easypaisa',
                Status: 'Completed',
                TransactionType: 'Purchase',
            },
        ])

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[18].UserName).toBe('John')
        expect(searchResults[19].UserName).toBe('Ali')
    })

    test('should trigger sort event after sorting', () =>
    {
        const fn = jest.fn()

        sorter.$sortingOptionsChanged.subscribe(fn)

        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith({
                options: [
                    expect.objectContaining({
                        field: 'UserName',
                        order: 'ASC',
                    }),
                ],
                prevOptions: [],
            },
        )
    })

    test('should get to original order data after sorting clear', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        sorter.sort({
            field: 'Amount',
            order: 'ASC',
        })

        sorter.clearSort()

        expect(searchResults[0].UserName).toBe('Zeeshan')
        expect(searchResults[4].UserName).toBe('Zeeshan')
        expect(searchResults[5].UserName).toBe('Ali')
        expect(searchResults[7].UserName).toBe('Ahmed')
        expect(searchResults[23].UserName).toBe('Ali')
        expect(searchResults[38].UserName).toBe('Zeeshan')
        expect(searchResults[39].UserName).toBe('Ahmed')
    })

    test('should "not" trigger if items are added or updated', () =>
    {
        const fn = jest.fn()

        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        sorter.$sortingOptionsChanged.subscribe(fn)

        itemsStore.add([
            {
                TransactionID: 20,
                UserName: 'John',
                Date: new Date('2024-11-10'),
                Amount: 5000,
                PaymentMethod: 'Easypaisa',
                Status: 'Completed',
                TransactionType: 'Purchase',
            },
        ])

        itemsStore.updateByInItemUuid([
            { ...itemsStore.getItems()[18], UserName: 'John' },
        ])

        expect(fn).not.toHaveBeenCalled()
    })

    test('should sort data according to a custom sort function', () =>
    {
        sorter.sort({
            field: 'Date',
            order: 'ASC',
            customCompareFn: (a, b, options) =>
            {
                if (a[options.field] === b[options.field]) return 0

                return a[options.field].getTime() === b[options.field].getTime() ?
                       0 :
                       a[options.field].getTime() < b[options.field].getTime() ? -1 : 1
            },
        })
    })
})
