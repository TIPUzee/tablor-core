import { ImmutableAugmentedItem, Item } from '../stores/items-store/interfaces'


/**
 * Specifies the behavior for handling previously sorted fields.
 */
export type InsertBehavior<T extends Item<T>, K extends keyof T> =
    | {
    /**
     * The strategy to determine where to insert or modify a field.
     * - 'SpecifiedField': targets a specific field for insertion or modification.
     */
    strategy: 'SpecifiedFieldIndex';

    /**
     * Specifies the target field or position index for the strategy.
     * - If a key from the item, operations will be relative to the field's sorting.
     * - If a number, operations will be performed at the specified index.
     */
    target: number;

    /**
     * Describes the action to perform relative to the target field:
     * - 'MakeSuper': The new options will act as a super sorting field for the target field.
     * - 'MakeNested': The new options will become nested sorting options under the target field.
     * - 'Replace': The new options will replace the target field's options.
     */
    action: 'Replace' | 'Push';
}
    | {
    /**
     * The strategy to determine where to insert or modify a field.
     * - 'SpecifiedField': targets a specific field for insertion or modification.
     */
    strategy: 'SpecifiedField';

    /**
     * Specifies the target field or position index for the strategy.
     * - If a key from the item, operations will be relative to the field's sorting.
     * - If a number, operations will be performed at the specified index.
     */
    target: keyof T;

    notFoundBehavior: InsertBehavior<T, K>;

    /**
     * Describes the action to perform relative to the target field:
     * - 'MakeSuper': The new options will act as a super sorting field for the target field.
     * - 'MakeNested': The new options will become nested sorting options under the target field.
     * - 'Replace': The new options will replace the target field's options.
     */
    action: 'NewAsSuper' | 'NewAsNested' | 'Replace';
}
    | {
    /**
     * The strategy to determine where to position the field based on predefined rules.
     * - 'PresetPosition': uses predefined positions like 'First', 'Last', or 'SameType'.
     */
    strategy: 'PresetPosition';

    /**
     * Indicates the predefined position for the field:
     * - 'Start': position at the start of the sorting list.
     * - 'End': position at the end of the sorting list.
     */
    target: 'Start' | 'End';

    /**
     * Describes the action to perform:
     * - 'Push': Add the field at the specified position.
     */
    action: 'Push';
}
    | {
    /**
     * The strategy to determine where to position the field based on its type.
     * - 'PresetPosition': uses predefined positions like 'First', 'Last', or 'SameType'.
     */
    strategy: 'PresetPosition';

    /**
     * Specifies the target type for the field:
     * - 'SameType': targets a field of the same type.
     *
     * @remarks
     * if the field is not of the same type,
     * the field will be pushed to the end of the sorting list.
     */
    target: 'SameType';

    /**
     * Describes the action to perform:
     * - 'Replace': Replace an existing field's options with the new options.
     */
    action: 'Replace';

    notFoundBehavior: InsertBehavior<T, K>;
};

/**
 * Represents options for defining a sorting operation before processing.
 */
export type DraftSortingOption<T extends Item<T>, K extends keyof T> = {
    /**
     * The field (key of `T`) to sort by.
     */
    field: K;

    /**
     * Sorting order:
     * - 'ASC': Ascending.
     * - 'DESC': Descending.
     * - 'ORIGINAL': Original order.
     * - 'Toggle': Toggle between ascending and descending.
     */
    order: 'ASC' | 'DESC' | 'ORIGINAL' | 'Toggle';

    firstOrderOnToggle?: 'ASC' | 'DESC';

    /**
     * Behavior when handling previously sorted fields.
     */
    insertBehavior?: InsertBehavior<T, K>;

    /**
     * Options for fields with values of a type `string`.
     */
    stringOptions?: {
        /**
         * Ignores case sensitivity for string fields.
         */
        isCaseSensitiveIfString?: boolean;

        /**
         * Ignores whitespace for string fields.
         */
        ignoreWhitespacesIfString?: boolean;
    },

    /**
     * Options for fields with values of a type `number`.
     */
    numberOptions?: {
        /**
         * Ignores decimal points for numeric fields.
         */
        ignoreDecimalsIfNumber?: boolean;
    },

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
     * Clears previously sorted fields.
     */
    clear?: {
        /**
         * The scope of fields to be cleared:
         * - 'All': clear all previously sorted fields.
         * - 'AllNested': clear all nested fields.
         * - 'AllParent': clear all parent fields.
         * - undefined: do not clear any fields.
         */
        target: 'All' | 'AllNested' | 'AllParent' | undefined
    },

    /**
     * Callback to process sorting options after they are handled.
     */
    processingCallback?: (
        processedOption: ProcessedSortingOptions<T, K>,
        prevOption: ImmutableProcessedSortingOption<T, K> | undefined,
        allPrevOptions: Readonly<ImmutableProcessedSortingOption<T, keyof T>[]>,
    ) => void;
};

/**
 * Represents options for defining a sorting operation after processing.
 * This type includes all the necessary details for executing sorting
 * operations on a collection of items.
 */
export type ProcessedSortingOptions<T extends Item<T>, K extends keyof T> = {
    /**
     * The field (key of type `T`) to sort by.
     */
    field: K;

    /**
     * Sorting order to be applied:
     * - 'ASC': sort in ascending order.
     * - 'DESC': sort in descending order.
     * - 'ORIGINAL': preserve the original order.
     */
    order: 'ASC' | 'DESC' | 'ORIGINAL';

    /**
     * Options for fields with values of a type `string`.
     */
    stringOptions: {
        /**
         * Indicates whether the sorting should consider case sensitivity.
         * Default is `false`.
         */
        isCaseSensitiveIfString: boolean;

        /**
         * Indicates whether to ignore whitespace in string fields during sorting.
         * Default is `false`.
         */
        ignoreWhitespacesIfString: boolean;
    };

    /**
     * Options for fields with values of a type `number`.
     */
    numberOptions: {
        /**
         * Indicates whether to ignore decimal points in numeric fields during sorting.
         * Default is `false`.
         */
        ignoreDecimalsIfNumber: boolean;
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
};

export type ProcessedSortingOptionsWithMeta<T, K extends keyof T> = Readonly<ProcessedSortingOptions<T, K>> & {
    /**
     * Defines the behavior for inserting or replacing previously sorted fields.
     */
    insertBehavior: InsertBehavior<T, K>;

    /**
     * Clears previously sorted fields.
     */
    clear: {
        /**
         * The scope of fields to be cleared:
         * - 'All': clear all previously sorted fields.
         * - 'AllNested': clear all nested fields.
         * - 'AllParent': clear all parent fields.
         */
        target: 'All' | 'AllNested' | 'AllParent' | undefined
    },
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
