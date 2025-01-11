import { ImmutableAugmentedItem, Item } from '../stores/items-store/interfaces'


/**
 * Represents options for defining a sorting operation before processing.
 */
type DraftSortingOrder =
    | {
    /**
     * Sorting order:
     * - 'ASC': Ascending.
     * - 'DESC': Descending.
     * - 'ORIGINAL': Original order.
     * - 'NONE': No sorting.
     * - 'Toggle': Toggle between ascending and descending.
     */
    order: 'ASC' | 'DESC' | 'ORIGINAL' | 'NONE' | 'Toggle';

    /**
     * Supported toggle orders for sorting.
     */
    supportedToggleOrders?: undefined;

    /**
     * The index of the currently active toggle order.
     */
    toggleOrderIndex?: undefined;
}
    | {
    /**
     * Sorting order:
     * - 'ASC': Ascending.
     * - 'DESC': Descending.
     * - 'ORIGINAL': Original order.
     * - 'NONE': No sorting.
     * - 'Toggle': Toggle between ascending and descending.
     */
    order: 'Toggle';

    /**
     * Supported toggle orders for sorting.
     */
    supportedToggleOrders?: ('ASC' | 'DESC' | 'ORIGINAL' | 'NONE')[];

    /**
     * The index of the currently active toggle order.
     */
    toggleOrderIndex?: number;
}

/**
 * Represents options for defining a sorting operation before processing.
 */
export type DraftSortingOptions<T extends Item<T>, K extends keyof T> = DraftSortingOrder & {

    /**
     * The field (key of `T`) to sort by.
     */
    field: K;

    /**
     * Options for fields with values of a type `string`.
     */
    stringOptions?: {
        /**
         * Ignores case sensitivity for string fields.
         */
        caseSensitive?: boolean;

        /**
         * Ignores whitespace for string fields.
         */
        ignoreWhitespaces?: boolean,
    };

    /**
     * Options for fields with values of a type `number`.
     */
    numberOptions?: {
        /**
         * Ignores decimal points for numeric fields.
         */
        ignoreDecimals?: boolean,
    };

    /**
     * Custom comparison function for sorting.
     */
    customCompareFn?: (
        a: ImmutableAugmentedItem<T>,
        b: ImmutableAugmentedItem<T>,
        options: ImmutableProcessedSortingOption<T, K>,
    ) => number;

    /**
     * Custom comparison function for nested matches during sorting.
     */
    customCompareFnForNestedMatch?: (
        a: ImmutableAugmentedItem<T>,
        b: ImmutableAugmentedItem<T>,
        options: ImmutableProcessedSortingOption<T, K>,
    ) => number;

    /**
     * Determines priority for null values:
     * - 'AlwaysFirst': Nulls always first.
     * - 'AlwaysLast': Nulls always last.
     * - 'FirstOnASC': Nulls first in ascending order.
     * - 'LastOnASC': Nulls last in ascending order.
     */
    prioritizeNulls?: 'AlwaysFirst' | 'AlwaysLast' | 'FirstOnASC' | 'LastOnASC';

    /**
     * Determines priority for undefined values:
     * - 'AlwaysFirst': Undefined always first.
     * - 'AlwaysLast': Undefined always last.
     * - 'FirstOnASC': Undefined first in ascending order.
     * - 'LastOnASC': Undefined last in ascending order.
     */
    prioritizeUndefineds?: 'AlwaysFirst' | 'AlwaysLast' | 'FirstOnASC' | 'LastOnASC';

    /**
     * Specifies the behavior for inserting new fields.
     */
    insertBehavior?: {
        /**
         * Specifies the target field or position index to insert the new field at.
         *
         * Default: `options.length` to insert at the end.
         */
        insertAt: (keyof T) | number;
    },

    /**
     * Clears previously sorted fields.
     *
     * Default: Clear only the insert position field.
     */
    clear?: {
        /**
         * The scope of fields to be cleared:
         * - `All`: Clear all previously sorted fields.
         * - `AllNested`: Clear all nested fields.
         * - `AllParent`: Clear all parent fields.
         * - `InsertPosition`: Clear only the target field.
         * - `None`: Do not clear any fields.
         *
         * default: `InsertPosition`
         */
        target: 'All' | 'AllNested' | 'AllParent' | 'InsertPosition' | 'None',
    };

    /**
     * Callback to process sorting options after they are handled.
     */
    processingCallback?: (
        processedOption: ProcessedSortingOptions<T, K>,
        prevOption: ImmutableProcessedSortingOption<T, keyof T> | undefined,
        allPrevOptions: Readonly<ImmutableProcessedSortingOption<T, keyof T>[]>,
    ) => void,
}

/**
 * Represents options for defining a sorting operation after processing.
 */
type ProcessedSortingOrder =
    | {
    /**
     * Supported toggle orders for sorting.
     */
    supportedToggleOrders: undefined;

    /**
     * The index of the currently active toggle order.
     */
    toggleOrderIndex: undefined;
}
    | {
    /**
     * Supported toggle orders for sorting.
     */
    supportedToggleOrders: ('ASC' | 'DESC' | 'ORIGINAL' | 'NONE')[];

    /**
     * The index of the currently active toggle order.
     */
    toggleOrderIndex: number;
}

/**
 * Represents options for defining a sorting operation after processing.
 * This type includes all the necessary details for executing sorting
 * operations on a collection of items.
 */
export type ProcessedSortingOptions<T extends Item<T>, K extends keyof T> = ProcessedSortingOrder & {
    /**
     * The field (key of type `T`) to sort by.
     */
    field: K;

    /**
     * Sorting order:
     * - 'ASC': Ascending.
     * - 'DESC': Descending.
     * - 'ORIGINAL': Original order.
     * - 'NONE': No sorting.
     */
    order: 'ASC' | 'DESC' | 'ORIGINAL' | 'NONE'

    /**
     * Options for fields with values of a type `string`.
     */
    stringOptions: {
        /**
         * Indicates whether the sorting should consider case sensitivity.
         * Default is `false`.
         */
        caseSensitive: boolean;

        /**
         * Indicates whether to ignore whitespace in string fields during sorting.
         * Default is `false`.
         */
        ignoreWhitespaces: boolean;
    };

    /**
     * Options for fields with values of a type `number`.
     */
    numberOptions: {
        /**
         * Indicates whether to ignore decimal points in numeric fields during sorting.
         * Default is `false`.
         */
        ignoreDecimals: boolean;
    };

    /**
     * A custom comparison function for sorting the specified field.
     * It accepts two field values and returns:
     * - Negative number if `a` is less than `b`.
     * - Zero if `a` equals `b`.
     * - Positive number if `a` is greater than `b`.
     *
     * @param a - The first value to compare.
     * @param b - The second value to compare.
     * @param options - Additional processed sorting options.
     */
    customCompareFn: (
        a: ImmutableAugmentedItem<T>,
        b: ImmutableAugmentedItem<T>,
        options: ImmutableProcessedSortingOption<T, K>,
    ) => number;

    /**
     * A custom comparison function for nested matches during sorting.
     * It is similar to `customCompareFn` but is used for nested structures.
     *
     * @param a - The first value to compare.
     * @param b - The second value to compare.
     * @param options - Additional processed sorting options.
     */
    customCompareFnForNestedMatch: (
        a: ImmutableAugmentedItem<T>,
        b: ImmutableAugmentedItem<T>,
        options: ImmutableProcessedSortingOption<T, K>,
    ) => number;

    /**
     * Determines how null values should be prioritized during sorting:
     * - 'AlwaysFirst': null values always come first.
     * - 'AlwaysLast': null values always come last.
     * - 'FirstOnASC': null values come first in ascending order.
     * - 'LastOnASC': null values come last in ascending order.
     */
    prioritizeNulls: 'AlwaysFirst' | 'AlwaysLast' | 'FirstOnASC' | 'LastOnASC';

    /**
     * Determines how undefined values should be prioritized during sorting:
     * - 'AlwaysFirst': undefined values always come first.
     * - 'AlwaysLast': undefined values always come last.
     * - 'FirstOnASC': undefined values come first in ascending order.
     * - 'LastOnASC': undefined values come last in ascending order.
     */
    prioritizeUndefineds: 'AlwaysFirst' | 'AlwaysLast' | 'FirstOnASC' | 'LastOnASC';

    /**
     * Specifies the behavior for inserting new fields.
     */
    insertBehavior: {
        /**
         * Specifies the target position index to insert the new field at.
         */
        insertAt: number;
    },
    /**
     * Clears previously sorted fields.
     */
    clear: {
        /**
         * The scope of fields to be cleared:
         * - `All`: Clear all previously sorted fields.
         * - `AllNested`: Clear all nested fields.
         * - `AllParent`: Clear all parent fields.
         * - `InsertPosition`: Clear only the target field.
         * - `None`: Do not clear any fields.
         *
         * Default: `InsertPosition`.
         */
        target: 'All' | 'AllNested' | 'AllParent' | 'InsertPosition' | 'None';
    };
};

/**
 * Represents a readonly processed sorting option.
 */
export type ImmutableProcessedSortingOption<T extends Item<T>, K extends keyof T> =
    Readonly<ProcessedSortingOptions<T, K>>;

/**
 * Represents a sort range.
 */
export type SortRange = { start: number, end: number }

/******************* Event Callbacks *******************/

/**
 * Payload for the `sortingOptionsChanged` event.
 */
export type SortingOptionsChangedPayload<T> = {
    /**
     * Array of processed sorting options.
     */
    options: Readonly<ImmutableProcessedSortingOption<T, keyof T>[]>;
    /**
     * Array of previous sorting options.
     */
    prevOptions: Readonly<ImmutableProcessedSortingOption<T, keyof T>[]>;
};

/**
 * Payload for the `itemsSorted` event.
 *
 * @remarks
 * This payload will not be triggered on item removal or addition or update.
 * For event triggered on any of these actions, use `SortedItemsChangedPayload`.
 */
export type ItemsSortedPayload<T> = {
    /**
     * Array of sorted items.
     */
    items: Readonly<ImmutableAugmentedItem<T>[]>;
    /**
     * Array of previously sorted items.
     */
    prevItems: Readonly<ImmutableAugmentedItem<T>[]>;
};

/**
 * Payload for the `sortedItemsChanged` event.
 *
 * @remarks
 * This payload will be triggered on item removal or addition or update.
 * For event triggered on only user sorting, use `ItemsSortedPayload`.
 */
export type SortedItemsChangedPayload<T> = {
    /**
     * Array of sorted items.
     */
    items: Readonly<ImmutableAugmentedItem<T>[]>;
    /**
     * Array of previously sorted items.
     */
    prevItems: Readonly<ImmutableAugmentedItem<T>[]>;
};
