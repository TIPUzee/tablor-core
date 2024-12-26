import { ImmutableAugmentedItem, Item } from '../../stores/items-store/interfaces'
import { ExactValuesOpts, ProcExactValuesOpts } from './interfaces'


/**
 * `Exact values searcher`. This class provides methods for searching items based on exact values.
 */
export class ExactValuesSearcher<T extends Item<T>>
{
    /**
     * Processes string query options.
     */
    processOptions(options: ExactValuesOpts<T>): ProcExactValuesOpts<T>
    {
        const p: ProcExactValuesOpts<T> = {
            values: options.values,
            mustMatchAllFields: options.mustMatchAllFields !== undefined ? options.mustMatchAllFields : true,
            customCompareFns: options.customCompareFns !== undefined ? options.customCompareFns : {},
        }

        for (const field in p.values)
        {
            // @ts-ignore
            p.customCompareFns[field as keyof T] = p.customCompareFns[field as keyof T] !== undefined ?
                                                   p.customCompareFns[field as keyof T] :
                                                   ((actualVal: any, expectedVal: any) => actualVal === expectedVal)
        }

        return p
    }


    /**
     * Searches items based on exact values.
     */
    search(
        items: ImmutableAugmentedItem<T>[],
        options: ProcExactValuesOpts<T>,
    ): ImmutableAugmentedItem<T>[]
    {
        return this.filterMatchingItemsUuids(
            options.values,
            options.mustMatchAllFields,
            items,
            options.customCompareFns,
        )
    }


    /**
     * Filters items based on exact values.
     */
    protected filterMatchingItemsUuids(
        fieldsValues: ProcExactValuesOpts<T>['values'],
        mustMatchAllFields: boolean,
        items: ImmutableAugmentedItem<T>[],
        customCompareFns: ProcExactValuesOpts<T>['customCompareFns'],
    ): ImmutableAugmentedItem<T>[]
    {
        const searchedItems: ImmutableAugmentedItem<T>[] = []

        for (const item of items)
        {
            let matchedValuesCountInCurrItem = 0

            for (const field in fieldsValues)
            {
                const matchedOneVal = (fieldsValues[field as keyof T] as any).some(
                    (expectedVal: any) => (customCompareFns[field as keyof T] as any)(
                        item[field as keyof T],
                        expectedVal,
                    ),
                )

                if (matchedOneVal)
                    matchedValuesCountInCurrItem += 1

                if (!mustMatchAllFields && matchedOneVal)
                    break
                else if (mustMatchAllFields && !matchedOneVal)
                    break
            }

            if (
                (mustMatchAllFields && matchedValuesCountInCurrItem === Object.keys(fieldsValues).length)
                ||
                (!mustMatchAllFields && matchedValuesCountInCurrItem > 0)
            )
                searchedItems.push(item)
        }

        return searchedItems
    }

}
