import { ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'
import {
    NumberRangesOpts, ProcNumberRangesOpts,
} from './interfaces'


/**
 * Number ranges searcher. This class provides methods for searching items based on number ranges.
 */
export class NumberRangesSearcher<T extends Item<T>>
{
    /**
     * Processes string query options.
     */
    processOptions(options: NumberRangesOpts<T>): ProcNumberRangesOpts<T>
    {
        const newOptions: ProcNumberRangesOpts<T> = {
            mustMatchAllFields: options.mustMatchAllFields !== undefined ? options.mustMatchAllFields : true,

            ranges: {},
        }

        for (const field in options.ranges)
        {
            const fieldNumberRanges = options.ranges[field]
            if (!fieldNumberRanges || !fieldNumberRanges.length)
                continue

            newOptions.ranges[field as keyof T] = fieldNumberRanges.map(range => ({
                min: range.min === undefined ? -Infinity : range.min,
                max: range.max === undefined ? Infinity : range.max,
                includeMin: range.includeMin !== undefined ? range.includeMin : false,
                includeMax: range.includeMax !== undefined ? range.includeMax : false,
            }))
        }

        return newOptions
    }


    /**
     * Searches items based on number ranges.
     */
    search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcNumberRangesOpts<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        const { ranges, mustMatchAllFields } = options

        return this.filterMatchingItemsUuids(ranges, mustMatchAllFields, items)
    }


    /**
     * Filters items based on number ranges.
     */
    protected filterMatchingItemsUuids(
        multiFieldsRanges: ProcNumberRangesOpts<T>['ranges'],
        mustMatchAllFields: boolean,
        items: ImmutableAugmentedItem<T>[],
    ): ImmutableAugmentedItem<T>[]
    {
        const searchedItems: ImmutableAugmentedItem<T>[] = []

        for (const item of items)
        {
            let matchedFields = 0

            for (const field in multiFieldsRanges)
            {
                const multiRanges = multiFieldsRanges[field]
                if (!multiRanges || !multiRanges.length)
                    continue

                let value: number | string | undefined | null = item[field as keyof T]

                if (typeof value === 'string')
                    value = Number(value)

                for (const range of multiRanges)
                {
                    if (!value)
                    {
                        if (range.min === -Infinity && range.max === Infinity)
                            matchedFields++
                        continue
                    }

                    if (
                        (
                            (range.min === -Infinity ? true : value > range.min) ||
                            (range.includeMin ? value === range.min : false)
                        ) &&
                        (
                            (range.max === Infinity ? true : value < range.max) ||
                            (range.includeMax ? value === range.max : false)
                        )
                    )
                    {
                        matchedFields++
                        break
                    }
                }
            }

            if (matchedFields >= (mustMatchAllFields ? Object.keys(multiFieldsRanges).length : 0))
                searchedItems.push(item)
        }

        return searchedItems
    }

}
