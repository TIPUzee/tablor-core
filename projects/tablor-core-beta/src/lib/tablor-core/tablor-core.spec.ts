import { describe } from '@jest/globals'
import { TablorCore } from './tablor-core'
import { SampleItemType, SampleItemFields, SampleItems } from '../test-data/test-data-4'
import { TablorCoreType } from './interfaces'
import { FieldsStore } from '../stores/fields-store/fields-store'


describe('TablorCore', () =>
{
    let tablor: TablorCore<SampleItemType>

    beforeEach(() =>
    {
        tablor = new TablorCore<SampleItemType>()
    })

    test('should be created', () =>
    {
        expect(tablor).toBeTruthy()
    })

    describe('Initialization', () =>
    {
        test('should initialize field store', () =>
        {
            tablor.initializeFields(SampleItemFields)
        })

        test('should initialize item store', () =>
        {
            tablor.initializeFields(SampleItemFields)
            tablor.initializeItems(SampleItems)
        })
    })

    describe('After initialization', () =>
    {

        beforeEach(() =>
        {
            tablor.initializeFields(SampleItemFields)
            tablor.initializeItems(SampleItems)
        })

        describe('FieldsStore', () =>
        {
            test('should have all the fields initialized', () =>
            {
                Object.keys(SampleItemFields).forEach((key) =>
                {
                    expect(tablor.getFields()[key as keyof SampleItemType]).toEqual(
                        expect.objectContaining(SampleItemFields[key as keyof SampleItemType]),
                    )
                })
            })
        })

        describe('ItemsStore', () =>
        {
            test('should have all the items initialized', () =>
            {
                expect(tablor.getAllItems().length).toBe(SampleItems.length)

                SampleItems.forEach((item, index) =>
                {
                    expect(tablor.getAllItems()[index]).toEqual(
                        expect.objectContaining(item),
                    )
                })
            })
        })
    })
})
