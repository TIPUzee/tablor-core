import { describe, expect } from '@jest/globals'
import { ItemsStore } from '../stores/items-store/items-store'
import { SampleItemFields, SampleItemType, SampleItems } from '../test-data/test-data-3'
import { FieldsStore } from '../stores/fields-store/fields-store'
import { Searcher } from '../searcher/searcher/searcher'
import { Sorter } from './sorter'


describe('Sorter', () =>
{
    let itemsStore: ItemsStore<SampleItemType>
    let fieldsStore: FieldsStore<SampleItemType>
    let searcher: Searcher<SampleItemType>
    let sorter: Sorter<SampleItemType>

    beforeEach(() =>
    {
        fieldsStore = new FieldsStore<SampleItemType>()

        itemsStore = new ItemsStore<SampleItemType>(fieldsStore.getFieldsAsArray.bind(fieldsStore))

        searcher = new Searcher<SampleItemType>(
            fieldsStore.hasField.bind(fieldsStore),
            fieldsStore.getFieldsAsArray.bind(fieldsStore),
            itemsStore.getMutableItems.bind(itemsStore),
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

        fieldsStore.initialize(SampleItemFields)
        itemsStore.initialize(SampleItems)
    })

    test('should sort items up to the first level in asc', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'ASC',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
    })

    test('should sort data up to the first level in desc', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'DESC',
        })

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Ahmed')
    })

    test('should sort data upto 1st level via toggle', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Ahmed')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 2].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Ahmed')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
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

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[0].Amount).toBe(1000)

        expect(sorter.getItems()[1].UserName).toBe('Ahmed')
        expect(sorter.getItems()[1].Amount).toBe(1500)

        expect(sorter.getItems()[11].UserName).toBe('Ali')
        expect(sorter.getItems()[11].Amount).toBe(1000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(5000)
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

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[0].Amount).toBe(1000)

        expect(sorter.getItems()[1].UserName).toBe('Ahmed')
        expect(sorter.getItems()[1].Amount).toBe(1500)

        expect(sorter.getItems()[10].UserName).toBe('Ahmed')
        expect(sorter.getItems()[10].Amount).toBe(5000)

        expect(sorter.getItems()[11].UserName).toBe('Ali')
        expect(sorter.getItems()[11].Amount).toBe(1000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(5000)

        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[0].Amount).toBe(5000)

        expect(sorter.getItems()[10].UserName).toBe('Ahmed')
        expect(sorter.getItems()[10].Amount).toBe(1000)

        expect(sorter.getItems()[11].UserName).toBe('Ali')
        expect(sorter.getItems()[11].Amount).toBe(5000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(1200)
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

            expect(sorter.getItems()[0].UserName).toBe('Ahmed')
            expect(sorter.getItems()[0].Amount).toBe(1000)

            expect(sorter.getItems()[1].UserName).toBe('Ahmed')
            expect(sorter.getItems()[1].Amount).toBe(1500)

            expect(sorter.getItems()[10].UserName).toBe('Ahmed')
            expect(sorter.getItems()[10].Amount).toBe(5000)

            expect(sorter.getItems()[11].UserName).toBe('Ali')
            expect(sorter.getItems()[11].Amount).toBe(1000)

            expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
            expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(5000)

            sorter.sort({
                field: 'UserName',
                order: 'Toggle',
            })

            expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
            expect(sorter.getItems()[0].Amount).toBe(1200)

            expect(sorter.getItems()[17].UserName).toBe('Zeeshan')
            expect(sorter.getItems()[17].Amount).toBe(5000)

            expect(sorter.getItems()[18].UserName).toBe('Ali')
            expect(sorter.getItems()[18].Amount).toBe(1000)

            expect(sorter.getItems()[19].UserName).toBe('Ali')
            expect(sorter.getItems()[19].Amount).toBe(1500)

            expect(sorter.getItems()[39].UserName).toBe('Ahmed')
            expect(sorter.getItems()[39].Amount).toBe(5000)
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

        expect(sorter.getItems()[0].TransactionType).toBe('Purchase')
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

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[0].Amount).toBe(5000)

        expect(sorter.getItems()[18].UserName).toBe('Ali')
        expect(sorter.getItems()[18].Amount).toBe(5000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(1000)
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

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[0].Amount).toBe(5000)

        itemsStore.remove([sorter.getItems()[17].tablorMeta.uuid])

        expect(sorter.getItems()[17].UserName).toBe('Ali')
        expect(sorter.getItems()[17].Amount).toBe(5000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(1000)
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

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[17].UserName).toBe('John')
        expect(sorter.getItems()[18].UserName).toBe('Ali')
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
            { ...sorter.getItems()[22], Amount: 6000 },
        ])

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[18].UserName).toBe('Ali')
        expect(sorter.getItems()[18].Amount).toBe(6000)
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

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[18].UserName).toBe('John')
        expect(sorter.getItems()[19].UserName).toBe('Ali')
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

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[4].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[5].UserName).toBe('Ali')
        expect(sorter.getItems()[7].UserName).toBe('Ahmed')
        expect(sorter.getItems()[23].UserName).toBe('Ali')
        expect(sorter.getItems()[38].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[39].UserName).toBe('Ahmed')
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

    test('should sort a nested sorting option with none-sorted super options', () =>
    {
        sorter.sort({
            field: 'Date',
            order: 'NONE',
        })

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[0].Amount).toBe(1000)

        expect(sorter.getItems()[1].UserName).toBe('Ahmed')
        expect(sorter.getItems()[1].Amount).toBe(1500)

        expect(sorter.getItems()[10].UserName).toBe('Ahmed')
        expect(sorter.getItems()[10].Amount).toBe(5000)

        expect(sorter.getItems()[11].UserName).toBe('Ali')
        expect(sorter.getItems()[11].Amount).toBe(1000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(5000)

        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[0].Amount).toBe(5000)

        expect(sorter.getItems()[10].UserName).toBe('Ahmed')
        expect(sorter.getItems()[10].Amount).toBe(1000)

        expect(sorter.getItems()[11].UserName).toBe('Ali')
        expect(sorter.getItems()[11].Amount).toBe(5000)

        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].Amount).toBe(1200)

        sorter.sort({
            field: 'Date',
            order: 'ASC',
        })

        expect(sorter.getItems()[0].Date).toEqual(new Date('2024-11-05'))
        expect(sorter.getItems()[1].Date).toEqual(new Date('2024-11-05'))
        expect(sorter.getItems()[3].Date).toEqual(new Date('2024-11-06'))
        expect(sorter.getItems()[4].Date).toEqual(new Date('2024-11-06'))
        expect(sorter.getItems()[8].Date).toEqual(new Date('2024-11-07'))
        expect(sorter.getItems()[9].Date).toEqual(new Date('2024-11-07'))
        expect(sorter.getItems()[sorter.getItems().length - 3].Date).toEqual(new Date('2024-11-12'))
        expect(sorter.getItems()[sorter.getItems().length - 1].Date).toEqual(new Date('2024-11-12'))

        expect(sorter.getItems()[0].UserName).toEqual('Ali')
        expect(sorter.getItems()[1].UserName).toEqual('Zeeshan')
        expect(sorter.getItems()[3].UserName).toEqual('Ahmed')
        expect(sorter.getItems()[4].UserName).toEqual('Ahmed')
        expect(sorter.getItems()[4].UserName).toEqual('Ahmed')
        expect(sorter.getItems()[8].UserName).toEqual('Ahmed')
        expect(sorter.getItems()[9].UserName).toEqual('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 3].UserName).toEqual('Ali')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toEqual('Zeeshan')
    })

    test('should sort a nested sorting option with none-sorted super options', () =>
    {
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
            supportedToggleOrders: ['ASC', 'ORIGINAL'],
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 2].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')

        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
            supportedToggleOrders: ['ASC', 'ORIGINAL'],
        })

        expect(sorter.getItems()[0].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 2].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Ahmed')
    })

    test('should sort a nested sorting option up to six levels', () =>
    {
        // Level 1 - ASC
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        // Level 2 - ASC DESC
        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        // Level 3 - ASC
        sorter.sort({
            field: 'Date',
            order: 'Toggle',
        })

        // Level 4 - ASC
        sorter.sort({
            field: 'Status',
            order: 'Toggle',
        })

        // Level 5 - ASC
        sorter.sort({
            field: 'TransactionID',
            order: 'Toggle',
        })

        // Level 6 - ASC
        sorter.sort({
            field: 'TransactionType',
            order: 'Toggle',
        })

        // Level 1 - DESC
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        // Level 2 - NONE
        sorter.sort({
            field: 'Amount',
            order: 'Toggle',
        })

        // Level 3 - DESC
        sorter.sort({
            field: 'Date',
            order: 'Toggle',
        })

        // Level 4 - DESC
        sorter.sort({
            field: 'Status',
            order: 'Toggle',
        })

        // Level 5 - DESC
        sorter.sort({
            field: 'TransactionID',
            order: 'Toggle',
        })

        // Level 6 - DESC
        sorter.sort({
            field: 'TransactionType',
            order: 'Toggle',
        })

        // Level 1 - NONE
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        // Level 3 - NONE
        sorter.sort({
            field: 'Date',
            order: 'Toggle',
        })

        // Level 4 - NONE
        sorter.sort({
            field: 'Status',
            order: 'Toggle',
        })

        // Level 5 - NONE
        sorter.sort({
            field: 'TransactionID',
            order: 'Toggle',
        })

        // Level 6 - NONE
        sorter.sort({
            field: 'TransactionType',
            order: 'Toggle',
        })

        // Level 5 - ASC
        sorter.sort({
            field: 'TransactionID',
            order: 'Toggle',
        })

        expect(sorter.getOptions()).toEqual([
            expect.objectContaining({ order: 'NONE', field: 'UserName' }),
            expect.objectContaining({ order: 'NONE', field: 'Amount' }),
            expect.objectContaining({ order: 'NONE', field: 'Date' }),
            expect.objectContaining({ order: 'NONE', field: 'Status' }),
            expect.objectContaining({ order: 'ASC', field: 'TransactionID' }),
            expect.objectContaining({ order: 'NONE', field: 'TransactionType' }),
        ])

        expect(sorter.getItems()[0].TransactionID).toBe(1)
        expect(sorter.getItems()[1].TransactionID).toBe(2)
        expect(sorter.getItems()[2].TransactionID).toBe(3)
        expect(sorter.getItems()[sorter.getItems().length - 1].TransactionID).toBe(40)

        // Level 5 - DESC
        sorter.sort({
            field: 'TransactionID',
            order: 'Toggle',
        })

        // Level 5 - NONE
        sorter.sort({
            field: 'TransactionID',
            order: 'Toggle',
        })

        // Level 1 - ASC
        sorter.sort({
            field: 'UserName',
            order: 'Toggle',
        })

        expect(sorter.getItems()[0].UserName).toBe('Ahmed')
        expect(sorter.getItems()[1].UserName).toBe('Ahmed')
        expect(sorter.getItems()[2].UserName).toBe('Ahmed')
        expect(sorter.getItems()[3].UserName).toBe('Ahmed')
        expect(sorter.getItems()[sorter.getItems().length - 3].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 2].UserName).toBe('Zeeshan')
        expect(sorter.getItems()[sorter.getItems().length - 1].UserName).toBe('Zeeshan')
    })
})
