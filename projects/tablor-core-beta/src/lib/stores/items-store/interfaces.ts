/**
 * Defines primitive types used in data items.
 */
export type PrimitiveTypes = string | number | boolean | null | undefined | Date;

/**
 * Defines primitive types used in data items as strings for type checking.
 */
export type PrimitiveTypesAsString = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'date';

/**
 * A regular data item.
 */
export type Item<T extends Record<string, PrimitiveTypes>> = {
    [K in keyof T]: T[K];
};

/**
 * A partially defined regular item.
 */
export type HalfItem<T extends Item<T>> = Partial<T>;

/**
 * A read-only version of a regular item.
 */
export type ImmutableRegularItem<T extends Item<T>> = Readonly<Item<T>>;

/**
 * A read-only version of a partially defined item.
 */
export type ImmutablePartialRegularItem<T extends Item<T>> = Readonly<HalfItem<T>>;

/**
 * A partially defined version of an augmented partial item.
 */
export type AugmentedHalfItem<T extends Item<T>> = Partial<T> & { tablorMeta: AugItemMetaData };

/**
 * A read-only version of an augmented partial item.
 */
export type ImmutableAugmentedPartialRegularItem<T extends Item<T>> = Readonly<AugmentedHalfItem<T>>;

/**
 * An augmented data item with metadata for internal use.
 */
export type AugmentedItem<T extends Item<T>> = T & { tablorMeta: AugItemMetaData };

/**
 * A read-only version of an augmented item.
 */
export type ImmutableAugmentedItem<T extends Item<T>> = Readonly<T & {
    tablorMeta: Readonly<AugItemMetaData>
}>;

/**
 * A flexible, read-only version of an augmented item.
 */
export type DynamicImmutableAugmentedItem = Readonly<{
    [key: string]: any;
    tablorMeta: Readonly<AugItemMetaData>;
}>;

/**
 * Metadata for tracking item state.
 *
 * @property uuid - Unique identifier for the item.
 * @property isSelected - Whether the item is selected.
 * @property isLoaded - Always true after loading.
 */
export type AugItemMetaData = {
    uuid: number;
    isSelected: boolean;
    isLoaded: true;
};

/******************** Event Payloads ********************/

/**
 * Represents the payload for the `loadingStateChanged` event.
 *
 * @property state - The new loading state.
 */
export type StoreLoadingStateChangedPayload<T extends Item<T>> = {
    state: boolean
}

/**
 * Represents the payload for the `itemsAdded` event.
 *
 * @property addedItems - The added items.
 */
export type ItemsAddedPayload<T extends Item<T>> = {
    addedItems: ImmutableAugmentedItem<T>[],
}

/**
 * Represents the payload for the `itemsRemoved` event.
 *
 * @property removedItems - The removed items.
 */
export type ItemsRemovedPayload<T extends Item<T>> = {
    removedItems: ImmutableAugmentedItem<T>[],
}

/**
 * Represents the payload for the `itemsUpdated` event.
 *
 * @property updatedItems - The updated items.
 * @property prevUpdatedItems - The previously updated items.
 * @property updatedItemsDifference - The difference between the updated and previously updated items.
 */
export type ItemsUpdatedPayload<T extends Item<T>> = {
    updatedItems: ImmutableAugmentedItem<T>[],
    prevUpdatedItems: ImmutableAugmentedItem<T>[],
    updatedItemsDifference: Partial<AugmentedItem<T>>[],
}
