import {
    AugmentedItem, ImmutableAugmentedPartialRegularItem,
    ImmutableAugmentedItem,
    ImmutablePartialRegularItem,
    ImmutableRegularItem,
    Item,
} from '../stores/items-store/interfaces'
import { ProcessedField } from '../stores/fields-store/interfaces'


/**
 * Utility functions for working with items.
 *
 * @remarks
 * This class contains methods that are useful when working with items.
 * Items are the data records managed by the data table library.
 */
export class ItemsUtils
{
    /**
     * Adds `tablorMeta` properties to each item in the items.
     * @param items - The items to extend.
     * @param getUuidAutoCounter - A function to generate unique UUIDs for items.
     * @returns Augmented items with added `tablorMeta` properties.
     */
    public static augmentItems<T extends Item<T>>(
        items: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T>)[]>,
        getUuidAutoCounter: () => number,
    ): AugmentedItem<T>[]
    {
        return items.map((data) =>
        {
            return {
                ...data,
                tablorMeta: {
                    uuid: getUuidAutoCounter(),
                    isSelected: false,
                    isLoaded: true,
                },
            }
        })
    }


    /**
     * Finds the difference between two items.
     * @param item1 - The first item.
     * @param item2 - The second item.
     * @returns The differences between the items.
     */
    public static getItemUpdates<T extends Item<T>>(
        item1: Partial<T>,
        item2: AugmentedItem<T>,
    ): Partial<AugmentedItem<T>>
    {
        const diff: Partial<AugmentedItem<T>> = {}
        for (const key of Object.keys(item1))
        {
            if (key === 'tablorMeta')
                continue

            else if (item1[key as keyof T] !== item2[key as keyof T])
                diff[key as keyof T] = item1[key as keyof T]
        }

        // @ts-ignore
        diff['tablorMeta'] = item2.tablorMeta
        return diff
    }


    /**
     * Checks if two items are equal.
     * @param item1 - The first item.
     * @param item2 - The second item.
     * @returns `true` if items are equal, otherwise `false`.
     */
    public static itemsAreEqual<T extends Item<T>>(
        item1: Readonly<T> | ImmutableAugmentedItem<T> | number | undefined,
        item2: Readonly<T> | ImmutableAugmentedItem<T> | number | undefined,
    ): boolean
    {
        if (typeof item1 === 'number')
            if (typeof item2 === 'number')
                return item1 === item2
            else if (typeof item2 === 'object' && 'tablorMeta' in item2)
                return item1 === item2.tablorMeta.uuid
            else
                return false

        else if (typeof item2 === 'number')
            if (typeof item1 === 'object' && 'tablorMeta' in item1)
                return item1.tablorMeta.uuid === item2
            else
                return false

        else if (typeof item1 === 'object' && typeof item2 === 'object')
            for (const key of Object.keys(item1))
            {
                // Ignore tablorMeta property
                if (key === 'tablorMeta') continue

                if (item1[key as keyof T] !== item2[key as keyof T]) return false
            }

        else if (item1 === undefined && item2 === undefined)
            return true

        return false
    }


    /**
     * Merges a new item with an existing item, creating a new item.
     * @param item1 - The new item with updated properties.
     * @param item2 - The existing item to update.
     * @returns The updated item.
     */
    public static mergeItemWith<T extends Item<T>>(item1: Partial<T>, item2: AugmentedItem<T>): AugmentedItem<T>
    {
        const newItem = JSON.parse(JSON.stringify(item2))
        for (const key of Object.keys(item1))
        {
            if (key === 'tablorMeta')
                continue

            // @ts-expect-error
            newItem[key] = item1[key]
        }
        return newItem
    }


    /**
     * Merges a new item with an existing item in place.
     * @param item1 - The new item with updated properties.
     * @param item2 - The existing item to update.
     */
    public static mergeItemInPlace<T extends Item<T>>(item1: Partial<T>, item2: AugmentedItem<T>): void
    {
        for (const key of Object.keys(item1))
        {
            if (key === 'tablorMeta')
                continue

            // @ts-expect-error
            item2[key as keyof T] = item1[key as keyof T]
        }
    }


    /**
     * Replaces the current dataset with a new dataset.
     * @param dataRef - The reference to the existing dataset.
     * @param newDataSet - The new dataset to replace the existing one.
     * @param getUuidAutoCounter - A function to generate unique UUIDs for items.
     */
    public static replaceItemsInPlace<T extends Item<T>>(
        dataRef: AugmentedItem<T>[],
        newDataSet: Readonly<ImmutableRegularItem<T>[]>,
        getUuidAutoCounter: () => number,
    ): void
    {
        dataRef.splice(0, dataRef.length)
        dataRef.push(...ItemsUtils.augmentItems(newDataSet, getUuidAutoCounter))
    }


    /**
     * Removes items based on their UUIDs or data items.
     * @param dataSetRef - The dataset to update.
     * @param itemsOrUuids - The items or UUIDs to remove.
     * @param indexPicker - A function to determine the index of items to remove.
     * @returns The status of removals and removed items.
     */
    public static removeItemsInPlace<T extends Item<T>>(
        dataSetRef: ImmutableAugmentedItem<T>[],
        itemsOrUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | number | undefined)[]>,
        indexPicker: (
            item: ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | number | undefined,
            i: number,
        ) => number,
    ): [boolean[], ImmutableAugmentedItem<T>[]]
    {
        if (itemsOrUuids.length === 0) return [[], []]

        const uuidsRemovedStatus: boolean[] = Array(itemsOrUuids.length).fill(false)
        const removedItems: ImmutableAugmentedItem<T>[] = []

        for (let _i = 0; _i < itemsOrUuids.length; _i++)
        {
            const i = indexPicker(itemsOrUuids[_i], _i)
            if (i === -1) continue

            removedItems.push(dataSetRef[i])
            dataSetRef.splice(i, 1)
            uuidsRemovedStatus[_i] = true
        }

        return [uuidsRemovedStatus, removedItems]
    }


    /**
     * Updates items in the dataset in place.
     * @param dataRef - The dataset to update.
     * @param itemIndexes - The indexes of items to update.
     * @param modificationsInItems - The modifications to apply.
     * @returns The status of modifications, modified items, and fields.
     */
    public static updateItemsInPlace<T extends Item<T>>(
        dataRef: AugmentedItem<T>[],
        itemIndexes: number[],
        modificationsInItems: Readonly<(ImmutablePartialRegularItem<T> | undefined)[]>,
    ): [boolean[], AugmentedItem<T>[], Partial<AugmentedItem<T>>[]]
    {
        if (itemIndexes.length !== modificationsInItems.length)
            throw new Error('The number of items and modifications must match')
        if (itemIndexes.length === 0) return [[], [], []]

        const modificationsStatus: boolean[] = []
        modificationsStatus.length = itemIndexes.length

        const modifiedItems: AugmentedItem<T>[] = []
        const modifiedFieldsInItems: Partial<AugmentedItem<T>>[] = []

        for (let i = 0; i < modificationsInItems.length; i++)
        {
            const itemIndex = itemIndexes[i]
            const modifications = modificationsInItems[i]

            if (itemIndex < 0 || !modifications)
            {
                modificationsStatus[i] = false
                continue
            }

            if (itemIndex === -1)
            {
                modificationsStatus[i] = false
                continue
            }

            // Get the difference (which fields/properties to update) between the new item and the existing item
            // ignore the same fields/properties
            const itemsDifference = ItemsUtils.getItemUpdates<T>(modifications, dataRef[itemIndex])

            // Whether there is any difference to update or not
            // mark the item as updated
            modificationsStatus[i] = true

            // if there is anything to update in the item, except the `tablorMeta`
            if (Object.keys(itemsDifference).length <= 1)
            {
                continue
            }

            // Overwrite the item fields/properties with the new item fields/properties
            ItemsUtils.mergeItemInPlace<T>(modifications, dataRef[itemIndex])

            // Store the modified fields in the item
            modifiedFieldsInItems.push(itemsDifference)
            modifiedItems.push(dataRef[itemIndex])
        }

        return [modificationsStatus, modifiedItems, modifiedFieldsInItems]
    }


    /**
     * Filters an array of items by a specific field and value.
     * @param dataSetRef - The array of items to filter.
     * @param key - The field to check for the given value.
     * @param value - The value to compare the field against.
     * @returns An array of filtered items matching the key-value condition.
     */
    public filterItemsBy<T extends Item<T>, K extends keyof T>(
        dataSetRef: ImmutableAugmentedItem<T>[],
        key: K,
        value: T[K],
    ): ImmutableAugmentedItem<T>[]
    {
        return dataSetRef.filter(item => item[key] === value)
    }


    /**
     * Maps each item in the data to a new structure based on the provided field mappings.
     * @param data - The data to map.
     * @param fieldsArray - An array of fields that defines how to map each item.
     * @param markMissingItemsUndefined - Whether to set missing fields to `undefined`.
     * @returns A new array of mapped items.
     */
    public static mapItemsPropsToFields<T extends Item<T>>(
        data: Readonly<(ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | ImmutablePartialRegularItem<T>)[]>,
        fieldsArray: ProcessedField<T, keyof T>[],
        markMissingItemsUndefined: boolean,
    ): Readonly<(ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | ImmutablePartialRegularItem<T>)[]>
    {
        const mappedData: (ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | ImmutablePartialRegularItem<T>)[] = []
        for (const item of data)
        {
            // @ts-ignore
            const mappedItem: Item<T> = {}
            for (const field of fieldsArray)
            {
                if (field.key in item)
                {
                    // @ts-ignore
                    mappedItem[field.key] = item[field.key]
                }
                else if (markMissingItemsUndefined)
                {
                    // @ts-ignore
                    mappedItem[field.key] = undefined
                }
            }
            if ('tablorMeta' in item)
            {
                // @ts-ignore
                mappedItem['tablorMeta'] = item.tablorMeta
            }
            mappedData.push(mappedItem)
        }
        return mappedData
    }


    /**
     * Finds the indexes of items that match the given UUIDs, items, or augmented items.
     * @param dataRef - Dataset to search in.
     * @param itemsOrUuids - Items or UUIDs to match against.
     * @returns Array of indexes of matching items, or -1 for no match.
     *
     * @remarks
     * - For UUIDs, matches are based on the `tablorMeta.uuid`.
     * - For augmented items, matching is done using the UUID in `tablorMeta`.
     * - For regular items, a deep equality check is performed.
     */
    public static findIndexes<T extends Item<T>>(
        dataRef:ImmutableAugmentedItem<T>[],
        itemsOrUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>,
    ): number[]
    {
        if (itemsOrUuids.length === 0) return []

        const indexes: number[] = []

        for (const itemOrUuid of itemsOrUuids)
        {
            if (typeof itemOrUuid === 'number')
            {
                indexes.push(dataRef.findIndex(item => item.tablorMeta.uuid === itemOrUuid))
            }
            else if (typeof itemOrUuid === 'object' && 'tablorMeta' in itemOrUuid)
            {
                indexes.push(dataRef.findIndex(item => item.tablorMeta.uuid === itemOrUuid.tablorMeta.uuid))
            }
            else if (typeof itemOrUuid === 'object')
            {
                indexes.push(dataRef.findIndex(item => ItemsUtils.itemsAreEqual<T>(item, itemOrUuid)))
            }
            else
            {
                indexes.push(-1)
            }
        }

        return indexes
    }


    /**
     * Finds all matching indexes for the given UUIDs, items, or augmented items.
     * @param dataRef - Dataset to search in.
     * @param itemsOrUuids - UUIDs, items, or augmented items to match.
     * @returns An array of arrays, each containing matching indexes for each item.
     *
     * @remarks
     * - Matches all items with the given UUID.
     * - For augmented items, matching is based on UUIDs within `tablorMeta`.
     * - Regular items are matched using deep equality.
     * - For unmatched items, an empty array is returned.
     */
    public static findAllIndexes<T extends Item<T>>(
        dataRef: ImmutableAugmentedItem<T>[],
        itemsOrUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>,
    ): number[][]
    {
        if (itemsOrUuids.length === 0) return []

        const indexes: number[][] = []

        for (const itemOrUuid of itemsOrUuids)
        {
            if (
                typeof itemOrUuid !== 'number' &&
                typeof itemOrUuid === 'object'
            )
                continue

            const currentIndexes: number[] = []

            dataRef.forEach((item, i) =>
            {
                if (ItemsUtils.itemsAreEqual(item, itemOrUuid)) currentIndexes.push(i)
            })

            // Add empty array if no match was found, or add the found indexes
            indexes.push(currentIndexes)
        }

        return indexes
    }


    /**
     * Wraps a method to manage loading state during its execution.
     * @param method - The method to wrap and handle the loading state for.
     * @param loadingSetter - Function to update the loading state (true/false).
     * @returns A wrapped method that manages the loading state.
     *
     * @remarks
     * - Sets loading state to `true` before the method runs, and `false` afterward.
     * - If an error occurs, loading state is set to `false`, and the error is thrown.
     */
    public static handleLoading<T extends (...args: any[]) => any>(
        method: T,
        loadingSetter: (state: boolean) => void,
    ): (...args: Parameters<T>) => ReturnType<T>
    {
        return function (...args: Parameters<T>): ReturnType<T>
        {
            loadingSetter(true)

            let results = undefined
            try
            {
                // Execute the original method with the provided arguments
                results = method(...args)
                loadingSetter(false)
                return results
            } catch (e)
            {
                loadingSetter(false)
                throw e
            }
        }
    }

}
