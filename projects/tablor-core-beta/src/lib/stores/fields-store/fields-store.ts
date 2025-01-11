import { Subject } from 'rxjs'

import { ProcessedField, ProcessedFields, RegularField, RegularFields, FieldsUpdatedPayload } from './interfaces'
import { Item } from '../items-store/interfaces'


/**
 * `FieldsStore` manages fields.
 */
export class FieldsStore<T extends Item<T>>
{
    public readonly $fieldsChanged = new Subject<FieldsUpdatedPayload<T>>()
    protected readonly _allFields: ProcessedFields<T> = {} as ProcessedFields<T>


    /**
     * Initialize with an event manager for handling field updates.
     */
    constructor()
    {
    }


    /**
     * Get all fields as an object.
     *
     * @returns The fields object.
     */
    public getFields(): ProcessedFields<T>
    {
        return this._allFields
    }


    /**
     * Get a field by key.
     */
    public getField<K extends keyof T>(key: K): ProcessedField<T, K> | undefined
    {
        return this._allFields[key]
    }


    /**
     * Get all field keys.
     */
    public getFieldsKeys(): (keyof T)[]
    {
        return Object.keys(this._allFields) as (keyof T)[]
    }


    /**
     * Check if a field exists.
     */
    public hasField<K extends keyof T>(key: K): boolean
    {
        return key in this._allFields
    }


    /**
     * Get all fields as an array for easy iteration.
     *
     * @returns All the fields as array.
     */
    public getFieldsAsArray(): ProcessedField<T, keyof T>[]
    {
        return Object.keys(this._allFields).map(key => (
            // @ts-ignore: Typescript ignore due to dynamic key access
            { ...this._allFields[key] }
        ))
    }


    /**
     * Initialize fields with provided configurations.
     *
     * @param fields - Initial field configurations.
     */
    public initialize(fields: RegularFields<T>): void
    {
        const _fields = this.prepareFields(fields)

        for (const key in _fields)
        {
            this._allFields[key] = _fields[key]
        }
    }


    /**
     * Update fields.
     *
     * @param fields - Fields to update as object or array.
     */
    public updateFields(
        fields: (RegularField<T> & { key: keyof T })[] | Partial<RegularFields<T>>,
    ): void
    {
        const prevFields = {} as ProcessedFields<T>

        if (Array.isArray(fields))
        {
            for (const field of fields)
            {
                if (!field.key) throw new Error('Field must have a key.')

                const updatedFieldValues =
                    // @ts-ignore
                    this.overwriteFieldInPlace(field, this._allFields[field.key])

                if (Object.keys(updatedFieldValues).length <= 1) continue

                // @ts-ignore
                prevFields[field.key] = { ...this._allFields[field.key], ...updatedFieldValues }
            }
        }
        else if (typeof fields === 'object')
        {
            for (const key in fields)
            {
                // @ts-ignore
                fields[key].key = key

                const updatedFieldValues =
                    this.overwriteFieldInPlace(fields[key] as ProcessedField<T, keyof T>, this._allFields[key])

                if (Object.keys(updatedFieldValues).length <= 1) continue

                prevFields[key] = { ...this._allFields[key], ...updatedFieldValues }
            }
        }

        this.$fieldsChanged.next({
            fields: this._allFields,
            prevFields: { ...this._allFields, ...prevFields },
            updatedFieldsKeys: Object.keys(prevFields) as (keyof T)[],
        })
    }


    /**
     * Update a field by merging old configurations with new.
     *
     * @param field - Field to update.
     * @param prevField - Previous field.
     */
    protected overwriteFieldInPlace<K extends keyof T>(
        field: Partial<RegularField<T>>,
        prevField: ProcessedField<T, K>,
    ): Partial<ProcessedField<T, K>>
    {
        if (!prevField) return {}

        let changed: any = {
            key: prevField.key,
        }

        for (const key in field)
        {
            if (
                key === 'key' || key === undefined
            )
                continue

            if (field[key as keyof RegularField<T>] !== prevField[key as keyof RegularField<T>])
            {
                changed[key as keyof RegularField<T>] = prevField[key as keyof RegularField<T>] as any
                (prevField[key as keyof RegularField<T>] as any) = field[key as keyof RegularField<T>] as any
            }
        }

        return changed
    }


    /**
     * Prepare fields by applying defaults to missing values.
     *
     * @param fields - Fields to prepare.
     */
    protected prepareFields(fields: RegularFields<T>): ProcessedFields<T>
    {
        const cols: ProcessedFields<T> = {} as ProcessedFields<T>

        for (const key in fields)
        {
            const col = fields[key]

            cols[key] = {
                key: key,

                title: col.title !== undefined ? col.title : '',
                colClasses: col.colClasses !== undefined ? col.colClasses : '',

                isVisibleByDefault: col.isVisibleByDefault !== undefined ? col.isVisibleByDefault : true,
                isSearchableByDefault: col.isSearchableByDefault !== undefined ? col.isSearchableByDefault : true,
                isSortableByDefault: col.isSortableByDefault !== undefined ? col.isSortableByDefault : true,
                isSortedByDefault: col.isSortedByDefault !== undefined ? col.isSortedByDefault : false,
                isSortedReverseByDefault: col.isSortedReverseByDefault !== undefined ?
                                          col.isSortedReverseByDefault :
                                          false,

                isSorted: col.isSortedByDefault !== undefined ? col.isSortedByDefault : false,
                isSortedReverse: col.isSortedReverseByDefault !== undefined ? col.isSortedReverseByDefault : false,
                isSearched: false,
                isVisible: col.isVisibleByDefault !== undefined ? col.isVisibleByDefault : true,

                render: col.render,
                defaultContent: col.defaultContent !== undefined ? col.defaultContent : '-',

                placeholderContent: col.placeholderContent !== undefined ? col.placeholderContent : '-',
            }
        }

        return cols
    }

}
