import { AugmentedItem, Item } from '../items-store/interfaces'


/**
 * Represents the configuration options for a field.
 *
 * @remarks
 * These options are only for UI purposes.
 * They have nothing to do with core functionalities.
 */
export type RegularField<T extends Item<T>> = {
    /** The display title of the field. */
    title?: string;

    /** CSS classes to apply to the field. */
    colClasses?: string;

    /** Determines if the field is visible by default. */
    isVisibleByDefault?: boolean;

    /** Determines if the field is searchable by default. */
    isSearchableByDefault?: boolean;

    /** Determines if the field is sortable by default. */
    isSortableByDefault?: boolean;

    /** Indicates if the field is sorted by default. */
    isSortedByDefault?: boolean;

    /** Indicates if the field is sorted in reverse order by default. */
    isSortedReverseByDefault?: boolean;

    /**
     * A function to render the content of a cell in the field.
     *
     * @param row - The items row that the cell belongs to.
     * @param col - The key of the field.
     * @param element - The HTML element to render content into.
     * @returns The modified HTML element.
     */
    render?: (row: AugmentedItem<T>, col: keyof T, element: HTMLElement) => HTMLElement;

    /** Default content displayed in the field when items are missing. */
    defaultContent?: string;

    /** Placeholder content for the field. */
    placeholderContent?: string;
}

/**
 * Represents a collection of field configurations.
 *
 * @remarks
 * These options are only for UI purposes.
 * They have nothing to do with core functionalities.
 */
export type RegularFields<T extends Item<T>> = {
    [K in keyof T]: RegularField<T>;
}

/**
 * Represents the strict configuration of a field, with all properties defined.
 *
 * @remarks
 * These options are only for UI purposes.
 * They have nothing to do with core functionalities.
 */
export type ProcessedField<T extends Item<T>, K extends keyof T> = {
    /** The unique key for the field. */
    key: K;

    /** The display title of the field. */
    title: string;

    /** CSS classes to apply to the field. */
    colClasses: string;

    /** Determines if the field is visible by default. */
    isVisibleByDefault: boolean;

    /** Determines if the field is searchable by default. */
    isSearchableByDefault: boolean;

    /** Determines if the field is sortable by default. */
    isSortableByDefault: boolean;

    /** Indicates if the field is sorted by default. */
    isSortedByDefault: boolean;

    /** Indicates if the field is sorted in reverse order by default. */
    isSortedReverseByDefault: boolean;

    /** Current visibility state of the field. */
    isVisible: boolean;

    /** Current search state of the field. */
    isSearched: boolean;

    /** Current sorted state of the field. */
    isSorted: boolean;

    /** Current reverse sorted state of the field. */
    isSortedReverse: boolean;

    /**
     * A function to render the content of a cell in the field.
     *
     * @param row - The items row that the cell belongs to.
     * @param col - The key of the field.
     * @param element - The HTML element to render content into.
     * @returns The modified HTML element.
     */
    render?: (row: AugmentedItem<T>, col: keyof T, element: HTMLElement) => HTMLElement;

    /** Default content displayed in the field when items are missing. */
    defaultContent: string;

    /** Placeholder content for the field. */
    placeholderContent: string;
}

/**
 * Represents a collection of strict field configurations.
 *
 * @remarks
 * These options are only for UI purposes.
 * They have nothing to do with core functionalities.
 */
export type ProcessedFields<T extends Item<T>> = {
    [K in keyof T]: ProcessedField<T, K>;
}

/******************* Event Callbacks *******************/

/**
 * Represents the payload for the `fieldsUpdated` event.
 *
 * @property fields - Updated fields.
 * @property prevFields - Previous fields.
 * @property updatedFieldsKeys - Updated field keys.
 */
export type FieldsUpdatedPayload<T extends Item<T>> = {
    /** Updated fields. */
    fields: ProcessedFields<T>,

    /** Previous fields. */
    prevFields: ProcessedFields<T>,

    /** Updated field keys. */
    updatedFieldsKeys: (keyof T)[],
}
