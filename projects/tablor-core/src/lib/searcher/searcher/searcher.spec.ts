import cloneDeep from 'lodash/cloneDeep'
import { FieldsStore } from '../../stores/fields-store/fields-store'
import { SampleItemType, SampleItems, SampleItemFields } from '../../test-data/test-data-4'
import { ItemsStore } from '../../stores/items-store/items-store'
import { beforeEach, expect } from '@jest/globals'
import { AugmentedItem, ImmutableAugmentedItem } from '../../stores/items-store/interfaces'
import { Searcher } from './searcher'


describe('Searcher Class Tests', () =>
{
    let fieldsStore: FieldsStore<SampleItemType>
    let itemsStore: ItemsStore<SampleItemType>
    let searcher: Searcher<SampleItemType>

    let updateItems = <K extends keyof SampleItemType>(
        items: AugmentedItem<SampleItemType>[],
        field: keyof SampleItemType,
        value: SampleItemType[K],
        condition: (item: AugmentedItem<SampleItemType>) => boolean,
    ) =>
    {
        const newItems = cloneDeep(items)

        for (let i = 0; i < newItems.length; i++)
        {
            if (condition(newItems[i]))
            {
                (newItems[i][field] as any) = value
            }
        }

        return newItems
    }

    let findItems = <K extends keyof SampleItemType>(
        items: AugmentedItem<SampleItemType>[], field: K,
        val: (val: SampleItemType[K]) => boolean = () => true,
        condition: (item: AugmentedItem<SampleItemType>) => boolean = () => true,
        merge: boolean = false,
    ) =>
    {
        if (merge)
        {
            const results1 = items.filter((item) => condition(item))
            const results2 = items.filter((item) => val(item[field]))

            return Array.from(new Set(results1.concat(results2)))
        }

        return items
            .filter((item) => condition(item))
            .filter((item) => val(item[field]))
    }

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

        fieldsStore.initialize(SampleItemFields)
        itemsStore.initialize(SampleItems)
    })

    test('Search by query in all fields', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[3]),
            expect.objectContaining(SampleItems[4]),
        ])
    })

    test('Search by query in no fields', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[3]),
            expect.objectContaining(SampleItems[4]),
        ])
    })

    test('Search by query in a specified single field', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
            includeFields: ['email'],
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[3]),
        ])
    })

    test('Search by query in specified multiple field', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
            includeFields: ['name', 'email'],
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[3]),
            expect.objectContaining(SampleItems[4]),
        ])
    })

    test('Search by query, first by non-empty query, then empty query', () =>
    {
        searcher.searchByStringQuery({
            query: 'jan',
        })

        expect(searcher.getItems()).toEqual(
            SampleItems.filter(item => item.name.toLowerCase().includes('jan'))
                .map(item => expect.objectContaining(item)),
        )

        searcher.searchByStringQuery({
            query: '',
            prevResults: {
                action: 'Clear',
                scope: 'Single',
                target: 'LastIfSameType',
            },
        })

        expect(searcher.getItems()).toEqual(SampleItems.map(item => expect.objectContaining(item)))
    })

    test('Search by query excluding a specified single field', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
            excludeFields: ['name'],
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[3]),
        ])
    })

    test('Search by query excluding specified multiple fields', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
            excludeFields: ['name', 'email'],
        })

        expect(searcher.getItems()).toEqual([])
    })

    test('Search by query, type of number (searching types include numbers)', () =>
    {
        searcher.searchByStringQuery({
            query: '66000',
            convertToString: {
                number: n => n.toString(),
            },
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[6]),
        ])
    })

    test('Search by query, type of number (searching types exclude numbers)', () =>
    {
        searcher.searchByStringQuery({
            query: '66000',
        })

        expect(searcher.getItems()).toEqual([])
    })

    test('Search by query, type of string (searching types include numbers)', () =>
    {
        searcher.searchByStringQuery({
            query: '66000',
            convertToString: {
                number: n => n.toString(),
            },
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[6]),
        ])
    })

    // TODO: Implement query searching in date fields
    test('Search by query, type of date (searching types include Date)', () =>
    {
        searcher.searchByStringQuery({
            query: '2021-05-17',
            convertToString: {
                date: d => d.toISOString(),
            },
        })

        expect(searcher.getItems()).toEqual([
            expect.objectContaining(SampleItems[2]),
        ])
    })

    test('Search by numbers ranges, searching by only min range, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            min: 20,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && item.age > 20)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching by only max range, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            max: 20,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && item.age < 20)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching by min and max range, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            min: 20,
                            max: 30,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && item.age >= 20 && item.age < 30)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching by multiple min and max ranges, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            min: 10,
                            max: 15,
                        },
                        {
                            min: 20,
                            max: 25,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && (item.age > 10 && item.age < 15 || item.age > 20 && item.age < 25))
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching by min range including min, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            min: 20,
                            includeMin: true,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && item.age >= 20)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching by max range including max, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            max: 20,
                            includeMax: true,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && item.age <= 20)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching by min and max range including min and max, in a single field', () =>
    {
        searcher.searchByNumbersRanges(
            {
                ranges: {
                    age: [
                        {
                            min: 20,
                            max: 30,
                            includeMin: true,
                            includeMax: true,
                        },
                    ],
                },
            },
        )

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && item.age >= 20 && item.age <= 30)
                .map(item => expect.objectContaining(item)),
        )
    })

    test(
        'Search by numbers ranges, searching by multiple min and max ranges including min and max, in a single field',
        () =>
        {
            searcher.searchByNumbersRanges(
                {
                    ranges: {
                        age: [
                            {
                                min: 10,
                                max: 15,
                                includeMin: true,
                                includeMax: true,
                            },
                            {
                                min: 20,
                                max: 25,
                                includeMin: true,
                                includeMax: true,
                            },
                        ],
                    },
                },
            )

            expect(searcher.getItems()).toEqual(
                SampleItems
                    .filter((item) => item.age &&
                        (item.age >= 10 && item.age <= 15 || item.age >= 20 && item.age <= 25))
                    .map(item => expect.objectContaining(item)),
            )
        },
    )

    test('Search by date ranges, searching by only start date, in a single field', () =>
    {
        const start = new Date('2020-01-01')

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        start: start,
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date > start)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by date ranges, searching by start date including start, in a single field', () =>
    {
        const start = new Date('2020-01-01')

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        start: start,
                        includeStart: true,
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date >= start)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by date ranges, searching by end date including the end, in a single field', () =>
    {
        const end = new Date('2020-01-01')

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        end: end,
                        includeEnd: true,
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date <= end)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by date ranges, searching by start date as now, in a single field', () =>
    {
        const start = new Date()

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        start: 'Now',
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date > start)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by date ranges, searching by end date as now, in a single field', () =>
    {
        const end = new Date()

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        end: 'Now',
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date < end)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by date ranges, searching by start date using adjustment `Now + 2 years`, in a single field', () =>
    {
        const start = new Date()
        start.setFullYear(start.getFullYear() + 2)

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        start: 'Now',
                        startOffset: { years: 2 },
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date > start)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by date ranges, searching by start date using adjustment `Now - 7 years`, in a single field', () =>
    {
        const start = new Date()
        start.setFullYear(start.getFullYear() - 7)

        searcher.searchByDateRanges({
            ranges: {
                hire_date: [
                    {
                        start: 'Now',
                        startOffset: { years: -7 },
                    },
                ],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date > start)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by exact values, searching undefined and null values in a single field', () =>
    {
        searcher.searchByExactValues({
            values: {
                age: [null],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age === undefined || item.age === null)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by exact values, searching undefined and null values in multiple fields', () =>
    {
        searcher.searchByExactValues({
            values: {
                age: [null],
                hire_date: [null],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => (item.age === undefined || item.age === null) &&
                    (item.hire_date === undefined || item.hire_date === null))
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by exact values, searching undefined and null values in multiple fields; at least one is null', () =>
    {
        searcher.searchByExactValues({
            values: {
                age: [null],
                hire_date: [null],
            },
            mustMatchAllFields: false,
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age === null || item.hire_date === null)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by exact values, searching number values in a single field', () =>
    {
        const salary = 66000

        searcher.searchByExactValues({
            values: {
                salary: [salary],
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.salary === salary)
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by exact values, searching date values in a single field', () =>
    {
        const hireDate = new Date('2022-09-13')

        searcher.searchByExactValues({
            values: {
                hire_date: [hireDate],
            },
            customCompareFns: {
                hire_date: (actualVal: any, expectedVal: any) =>
                {
                    if (!actualVal)
                        return false

                    return actualVal.getTime() === expectedVal.getTime()
                },
            },
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.hire_date && item.hire_date.getTime() === hireDate.getTime())
                .map(item => expect.objectContaining(item)),
        )
        expect(searcher.getItems().length).toBe(1)
    })

    test('Search by custom function, searching for undefined and null values in a single field', () =>
    {
        const evenFn = (val: any) => val % 2 === 0

        const itemWithEvenAge = (item: ImmutableAugmentedItem<SampleItemType>) => item.age ? evenFn(item.age) : false

        searcher.searchByCustomFn({
            customName: 'ByEvenAge',
            customFn: itemWithEvenAge,
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => item.age && evenFn(item.age))
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching min and max range, and reverting results', () =>
    {
        const min = 20
        const max = 30

        searcher.searchByNumbersRanges({
            ranges: {
                age: [
                    {
                        min,
                        max,
                    },
                ],
            },
            revertResultsAtEnd: true,
        })

        expect(searcher.getItems()).toEqual(
            SampleItems
                .filter((item) => !item.age || (item.age && !(item.age > min && item.age < max)))
                .map(item => expect.objectContaining(item)),
        )
    })

    test('Search by numbers ranges, searching min and max ranges, and check if an event is emitted', () =>
    {
        const prevItems = searcher.getItems()
        const prevOptions = structuredClone(searcher.getOptions())

        const min = 20
        const max = 30

        const fn = jest.fn()

        searcher.$itemsSearched.subscribe(fn)

        searcher.searchByNumbersRanges({
            ranges: {
                age: [
                    {
                        min,
                        max,
                    },
                ],
            },
        })

        const newlySearchedItems = prevItems
            .filter(item =>
                item.age && item.age > min && item.age < max)

        expect(fn).toHaveBeenCalledTimes(1)

        expect(fn).toHaveBeenCalledWith({
            options: searcher.getOptions(),
            prevOptions,
            searchResults: newlySearchedItems,
            prevSearchResults: prevItems,
        })
    })

    test('Search no query, check nb of results', () =>
    {
        expect(searcher.getNbOfSearchedItems()).toEqual(SampleItems.length)
    })

    test('Search by string query, searching in a single field, check nb of results', () =>
    {
        const query = 'a'

        searcher.searchByStringQuery({
            query,
            includeFields: ['name'],
        })

        expect(searcher.getNbOfSearchedItems()).toEqual(
            SampleItems
                .filter((item) => item.name && item.name.includes(query)).length,
        )
    })

    test(
        'Search items by date, multiple searches, update searched items so that they will be removed from searched -' +
        ' search in prev',
        () =>
        {
            const date = new Date('2019-01-01')

            searcher.searchByDateRanges({
                ranges: {
                    hire_date: [
                        {
                            start: date,
                        },
                    ],
                },
            })

            searcher.searchByStringQuery({
                query: 'John',
                includeFields: ['name'],
                searchTarget: { scope: 'Prev' },
            })

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )

            itemsStore.updateByInItemUuid(updateItems(
                itemsStore.getItems(),
                'name',
                'Zeeshan',
                item => item.name.toLowerCase().includes('john'),
            ))

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )

            itemsStore.updateByInItemUuid(updateItems(
                itemsStore.getItems(),
                'name',
                'John',
                () => true,
            ))

            expect(searcher.getItems()).toEqual(
                expect.arrayContaining(
                    findItems(
                        itemsStore.getItems(),
                        'name',
                        v => v.toLowerCase().includes('john'),
                        i => i.hire_date !== null
                            && i.hire_date.getTime() > date.getTime(),
                    ),
                ),
            )
        },
    )

    test(
        'Search items by date, multiple searches, update searched items so that they will be removed from searched -' +
        ' search in all',
        () =>
        {
            const date = new Date('2019-01-01')

            searcher.searchByDateRanges({
                ranges: {
                    hire_date: [
                        {
                            start: date,
                        },
                    ],
                },
            })

            searcher.searchByStringQuery({
                query: 'John',
                includeFields: ['name'],
                searchTarget: { scope: 'All' },
            })

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                    true,
                ),
            )

            itemsStore.updateByInItemUuid(updateItems(
                itemsStore.getItems(),
                'name',
                'Zeeshan',
                item => item.name.toLowerCase().includes('john'),
            ))

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                    true,
                ),
            )

            itemsStore.updateByInItemUuid(updateItems(
                itemsStore.getItems(),
                'name',
                'John',
                () => true,
            ))

            expect(searcher.getItems()).toEqual(
                expect.arrayContaining(
                    findItems(
                        itemsStore.getItems(),
                        'name',
                        v => v.toLowerCase().includes('john'),
                        i => i.hire_date !== null
                            && i.hire_date.getTime() > date.getTime(),
                        true,
                    ),
                ),
            )
        },
    )

    test(
        'Search items by date, multiple searches, add new items so that they will be added to searched items',
        () =>
        {
            const date = new Date('2019-01-01')

            searcher.searchByDateRanges({
                ranges: {
                    hire_date: [
                        {
                            start: date,
                        },
                    ],
                },
            })

            searcher.searchByStringQuery({
                query: 'John',
                includeFields: ['name'],
                searchTarget: { scope: 'Prev' },
            })

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )

            itemsStore.add(updateItems(
                itemsStore.getItems(),
                'name',
                'Zeeshan',
                item => item.name.toLowerCase().includes('john'),
            ))

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )

            itemsStore.add(updateItems(
                itemsStore.getItems(),
                'name',
                'John',
                () => true,
            ).slice(0, 3))

            expect(searcher.getItems()).toEqual(
                expect.arrayContaining(
                    findItems(
                        itemsStore.getItems(),
                        'name',
                        v => v.toLowerCase().includes('john'),
                        i => i.hire_date !== null
                            && i.hire_date.getTime() > date.getTime(),
                    ),
                ),
            )
        },
    )

    test(
        'Search items by date, multiple searches, remove new items so that they will be removed from searched items',
        () =>
        {
            const date = new Date('2019-01-01')

            searcher.searchByDateRanges({
                ranges: {
                    hire_date: [
                        {
                            start: date,
                        },
                    ],
                },
            })

            searcher.searchByStringQuery({
                query: 'John',
                includeFields: ['name'],
                searchTarget: { scope: 'Prev' },
            })

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )

            itemsStore.remove(updateItems(
                itemsStore.getItems(),
                'name',
                'Zeeshan',
                item => item.name.toLowerCase().includes('john'),
            ))

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )

            itemsStore.remove(updateItems(
                itemsStore.getItems(),
                'name',
                'John',
                () => true,
            ))

            expect(searcher.getItems()).toEqual(
                findItems(
                    itemsStore.getItems(),
                    'name',
                    v => v.toLowerCase().includes('john'),
                    i => i.hire_date !== null
                        && i.hire_date.getTime() > date.getTime(),
                ),
            )
        },
    )

    test('Search items by name, then search by void to revert all searched items', () =>
    {
        searcher.searchByStringQuery({
            query: 'John',
            includeFields: ['name'],
        })

        searcher.searchByStringQuery({
            query: 'Jane',
            includeFields: ['name'],
            prevResults: {
                action: 'Keep',
            },
            searchTarget: {
                scope: 'All',
            },
        })

        searcher.searchByVoid({
            prevResults: {
                action: 'Keep',
            },
            searchTarget: {
                scope: 'Prev',
            },
            revertResultsAtEnd: true,
        })

        expect(searcher.getItems()).toEqual(
            findItems(
                itemsStore.getItems(),
                'name',
                v => !v.toLowerCase().includes('john') && !v.toLowerCase().includes('jane'),
            ),
        )
    })
})
