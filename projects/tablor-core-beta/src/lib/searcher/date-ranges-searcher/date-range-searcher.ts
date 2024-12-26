import { ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'
import {
    DateRangesOpts, ProcDateRangesOpts,
    ProcDateRanges, RangeWithAdjustments,
} from './interfaces'
import { convertToStrictDateRange } from './date-ranges-searcher-utils'


/**
 * `Date Range Searcher`. This class provides methods for searching items based on date ranges.
 */
export class DateRangeSearcher<T extends Item<T>>
{
    /**
     * Processes string query options.
     */
    processOptions(options: DateRangesOpts<T>): ProcDateRangesOpts<T>
    {
        const dateRanges: ProcDateRanges<T> = {}

        for (const field in options.ranges)
        {
            dateRanges[field] = (options.ranges[field] as RangeWithAdjustments[])
                .map(dateRange => convertToStrictDateRange(dateRange))
        }

        return {
            mustMatchAllFields: options.mustMatchAllFields !== undefined ? options.mustMatchAllFields : true,

            ranges: dateRanges,
        }
    }


    /**
     * Searches items based on date ranges.
     */
    search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcDateRangesOpts<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        const { ranges, mustMatchAllFields } = options

        return this.filterMatchingItemsUuids(ranges, mustMatchAllFields, items)
    }


    protected filterMatchingItemsUuids(
        dateRanges: ProcDateRanges<T>,
        mustMatchAllFields: boolean,
        items: ImmutableAugmentedItem<T>[],
    ): ImmutableAugmentedItem<T>[]
    {
        const searchedItems: ImmutableAugmentedItem<T>[] = []

        for (const item of items)
        {
            let matchedFields = 0

            for (const field in dateRanges)
            {
                const fieldDateRanges = dateRanges[field]
                if (!fieldDateRanges || !fieldDateRanges.length)
                    continue

                const value = item[field as keyof T] as Date | null | undefined

                if (!(value as any instanceof Date))
                    continue

                for (const range of fieldDateRanges)
                {
                    if (!value)
                    {
                        if (!range.start && !range.end)
                        {
                            matchedFields++
                            break
                        }
                        continue
                    }

                    if (
                        (
                            (range.start ? value > range.start : true) ||
                            (range.includeStart ? value >= range.start : false)
                        ) &&
                        (
                            (range.end ? value < range.end : true) ||
                            (range.includeEnd ? value <= range.end : false)
                        )
                    )
                    {
                        matchedFields++
                        break
                    }
                }
            }

            if (matchedFields >= (mustMatchAllFields ? Object.keys(dateRanges).length : 0))
                searchedItems.push(item)
        }

        return searchedItems
    }

}
