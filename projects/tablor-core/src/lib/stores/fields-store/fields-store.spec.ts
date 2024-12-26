import { FieldsStore } from './fields-store'
import { RegularFields } from './interfaces'


type TestDataSet = {
    name: string;
    age: number;
    email: string;
};

describe('FieldStore', () =>
{
    let fieldStore: FieldsStore<TestDataSet>

    beforeEach(() =>
    {
        fieldStore = new FieldsStore<TestDataSet>()
    })

    describe('initFields', () =>
    {
        test('should initialize fields correctly', () =>
        {
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name', isSortedByDefault: true },
                age: { title: 'Age' },
                email: { title: 'Email' },
            }

            fieldStore.initialize(fields)
            expect(fieldStore.getFields().name.title).toBe('Name')
            expect(fieldStore.getFields().age.title).toBe('Age')
            expect(fieldStore.getFields().email.title).toBe('Email')
            expect(fieldStore.getFields().name.isSorted).toBe(true)
        })
    })

    describe('updateField', () =>
    {
        test('should update the existing field properties correctly', () =>
        {
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
                age: { title: 'Age' },
                email: { title: 'Email' },
            }

            fieldStore.initialize(fields)
            fieldStore.updateFields([{ key: 'name', isVisibleByDefault: false }])

            expect(fieldStore.getFields().name.title).toBe('Name')
            expect(fieldStore.getFields().name.isVisibleByDefault).toBe(false)
        })

        test('should set default values if properties are missing', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
            }

            fieldStore.initialize(fields)
            fieldStore.updateFields([{ key: 'name', title: 'Name Updated' }])

            expect(fieldStore.getFields().name.isVisibleByDefault).toBe(true)
            expect(fieldStore.getFields().name.isSearchableByDefault).toBe(true)
        })
    })

    describe('fields getter', () =>
    {
        test('should return fields in the correct structure', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
                age: { title: 'Age' },
            }

            fieldStore.initialize(fields)

            expect(fieldStore.getFields().name.title).toBe('Name')
            expect(fieldStore.getFields().age.title).toBe('Age')
        })
    })

    describe('fieldsAsArray getter', () =>
    {
        test('should return fields as an array', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
                age: { title: 'Age' },
            }

            fieldStore.initialize(fields)
            const fieldsArray = fieldStore.getFieldsAsArray()

            expect(fieldsArray).toHaveLength(2)
            expect(fieldsArray.find((col) => col.key === 'name')?.title).toBe('Name')
            expect(fieldsArray.find((col) => col.key === 'age')?.title).toBe('Age')
        })
    })
})

describe('FieldStore - Additional Tests', () =>
{
    let fieldStore: FieldsStore<TestDataSet>

    beforeEach(() =>
    {
        fieldStore = new FieldsStore<TestDataSet>()
    })

    describe('prepareFields', () =>
    {
        test('should initialize an empty field set if given an empty object', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {}
            fieldStore.initialize(fields)

            expect(Object.keys(fieldStore.getFields())).toHaveLength(0)
        })
    })

    describe('validateIsSorted', () =>
    {
        test('should not throw an error if no field is sorted by default', () =>
        {
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
                age: { title: 'Age' },
                email: { title: 'Email' },
            }

            expect(() => fieldStore.initialize(fields)).not.toThrow()
        })
    })

    describe('updateField', () =>
    {
        test('should raise error if trying to update a non-existent field key', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
                age: { title: 'Age' },
            }

            fieldStore.initialize(fields)

            expect(() => fieldStore.updateFields([{ key: 'email', title: 'Email' }]))
                .not.toThrow()
        })
    })

    describe('fieldsAsArray', () =>
    {
        test('should reflect updates made to fields through updateField', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
                age: { title: 'Age' },
            }

            fieldStore.initialize(fields)
            fieldStore.updateFields([{ key: 'name', title: 'Updated Name' }])

            const fieldsArray = fieldStore.getFieldsAsArray()
            const nameField = fieldsArray.find(col => col.key === 'name')

            expect(nameField?.title).toBe('Updated Name')
        })
    })

    describe('Default Value Initialization', () =>
    {
        test('should initialize default values when certain properties are omitted', () =>
        {
            // @ts-ignore
            const fields: RegularFields<TestDataSet> = {
                name: { title: 'Name' },
            }

            fieldStore.initialize(fields)

            expect(fieldStore.getFields().name.isVisibleByDefault).toBe(true)
            expect(fieldStore.getFields().name.isSearchableByDefault).toBe(true)
            expect(fieldStore.getFields().name.isSortableByDefault).toBe(true)
            expect(fieldStore.getFields().name.isSortedByDefault).toBe(false)
            expect(fieldStore.getFields().name.isVisible).toBe(true)
        })
    })
})

describe('FieldStore - Events', () =>
{
    let fieldStore: FieldsStore<TestDataSet>
    const fields: RegularFields<TestDataSet> = {
        name: { title: 'Name' },
        age: { title: 'Age' },
        email: { title: 'Email' },
    }

    beforeEach(() =>
    {
        fieldStore = new FieldsStore<TestDataSet>()
        fieldStore.initialize(fields)
    })

    test('should emit an event when a field is updated', () =>
    {
        const fn = jest.fn()

        fieldStore.$fieldsChanged.subscribe(fn)

        fieldStore.updateFields([{ key: 'name', title: 'Updated Name' }])

        expect(fn).toHaveBeenCalledWith({
            fields: expect.objectContaining({ name: expect.objectContaining({ title: 'Updated Name' }) }),
            prevFields: expect.objectContaining({ name: expect.objectContaining({ title: 'Name' }) }),
            updatedFieldsKeys: ['name'],
        })
    })
})
