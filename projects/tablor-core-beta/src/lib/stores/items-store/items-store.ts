import {
    AugmentedItem,
    DynamicImmutableAugmentedItem,
    ImmutableAugmentedItem,
    ImmutableAugmentedPartialRegularItem, ImmutablePartialRegularItem,
    ImmutableRegularItem, ItemsAddedPayload, ItemsRemovedPayload, ItemsUpdatedPayload,
    Item, StoreLoadingStateChangedPayload,
} from './interfaces'
import { FieldsStore } from '../fields-store/fields-store'
import { ItemsUtils } from '../../utils/items-utils'
import { Subject } from 'rxjs'


/**
 * Manages the items with methods for adding, removing, and updating them.
 */
export class ItemsStore<T extends Item<T>>
{
    protected allItems: AugmentedItem<T>[] = []

    protected _uuidCounter: number = 0
    protected _loading: boolean = false

    public readonly $loadingStateChanged = new Subject<StoreLoadingStateChangedPayload<T>>()
    public readonly $itemsAdded = new Subject<ItemsAddedPayload<T>>
    public readonly $itemsRemoved = new Subject<ItemsRemovedPayload<T>>
    public readonly $itemsUpdated = new Subject<ItemsUpdatedPayload<T>>


    constructor(
        protected readonly getFieldsAsArray: FieldsStore<T>['getFieldsAsArray'],
    )
    {
        this.setLoading = this.setLoading.bind(this)
    }


    /**
     * Returns the total number of items in the store.
     */
    public getNbOfItems(): number
    {
        return this.allItems.length
    }


    /**
     * Returns the loading state.
     */
    public getLoadingState(): boolean
    {
        return this._loading
    }


    public getItems(strictlyTyped?: true): ImmutableAugmentedItem<T>[]
    public getItems(strictlyTyped?: false): DynamicImmutableAugmentedItem[]

    /**
     * Returns all items as immutable objects.
     */
    public getItems(strictlyTyped: boolean = true): ImmutableAugmentedItem<T>[] | DynamicImmutableAugmentedItem[]
    {
        return this.allItems.map(item => item)
    }


    public getMutableItems(): AugmentedItem<T>[]
    {
        return this.allItems
    }


    /**
     * Sets the loading state and triggers the corresponding event.
     */
    protected setLoading(state: boolean)
    {
        if (state === this._loading) return

        this._loading = state
        this.$loadingStateChanged.next({ state })
    }


    /**
     * Initializes the store with an array of items.
     */
    public initialize(items: Readonly<ImmutableRegularItem<T>[]>): void
    {
        if (this.allItems.length !== 0)
            this.$itemsRemoved.next({ removedItems: this.allItems.map(item => item) })

        if (items.length === 0)
            return

        this.setLoading(true)

        const fieldsArray = this.getFieldsAsArray()

        ItemsUtils.replaceItemsInPlace(
            this.allItems,
            // @ts-ignore
            ItemsUtils.mapItemsPropsToFields(items, fieldsArray, true),
            this.getNewUuid.bind(this),
        )

        this.setLoading(false)

        this.$itemsAdded.next({ addedItems: this.allItems.map(item => item) })
    }


    /**
     * Adds new items to the store.
     */
    public add(items: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T>)[]>): void
    {
        if (items.length === 0) return

        this.setLoading(true)

        const fieldsArray = this.getFieldsAsArray()

        const _items = ItemsUtils.augmentItems(
            // @ts-ignore
            ItemsUtils.mapItemsPropsToFields(items, fieldsArray, true),
            this.getNewUuid.bind(this),
        )

        this.allItems.push(..._items)

        this.setLoading(false)

        this.$itemsAdded.next({ addedItems: _items })
    }


    /**
     * Removes items from the store by UUID or item reference.
     */
    public remove(
        itemsAndUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | number | undefined)[]>,
    ): boolean[]
    {
        this.setLoading(true)

        const indexPicker = (itemOrUuid: ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | number | undefined) =>
        {
            return this.findOneIndexForEach([itemOrUuid])[0]
        }

        const [itemsRemovedStatus, removedItems] = ItemsUtils.removeItemsInPlace<T>(
            this.allItems,
            itemsAndUuids,
            indexPicker,
        )

        this.setLoading(false)

        if (removedItems.length !== 0)
        {
            this.$itemsRemoved.next({ removedItems })
        }

        return itemsRemovedStatus
    }


    /**
     * Updates items in the store using augmented data.
     */
    public updateByInItemUuid(
        items: Readonly<ImmutableAugmentedPartialRegularItem<T>[]>,
    ): boolean[]
    {
        if (items.length === 0) return []

        this.setLoading(true)

        const indexes = this.findOneIndexForEach(items)

        const fieldsArray = this.getFieldsAsArray()

        const updateState = this.updateByIndex(
            ItemsUtils.mapItemsPropsToFields(items, fieldsArray, false),
            indexes,
        )

        this.setLoading(false)

        return updateState
    }


    /**
     * Updates items in the store by matching UUIDs.
     */
    public updateByExternalUuids(
        items: Readonly<ImmutablePartialRegularItem<T>[]>,
        uuids: number[],
    ): boolean[]
    {
        if (items.length !== uuids.length) throw new Error('The number of items and UUIDs must match')
        if (items.length === 0) return []

        this.setLoading(true)

        const indexes = this.findOneIndexForEach(uuids)

        const fieldsArray = this.getFieldsAsArray()

        const updateState = this.updateByIndex(
            ItemsUtils.mapItemsPropsToFields(items, fieldsArray, false),
            indexes,
        )

        this.setLoading(false)

        return updateState
    }


    /**
     * Updates items at specified indexes.
     */
    public updateByIndex(
        items: Readonly<ImmutablePartialRegularItem<T>[]>,
        indexes: number[],
    ): boolean[]
    {
        if (items.length !== indexes.length) throw new Error('The number of items and indexes must match')
        if (items.length === 0) return []

        this.setLoading(true)

        let unmodifiedItems: AugmentedItem<T>[] =
            indexes.map(index => this.allItems[index]).filter(item => item !==
                undefined)

        unmodifiedItems = JSON.parse(JSON.stringify(unmodifiedItems))

        const [modificationsStatus, modifiedItems, modifiedFieldsInItems] = ItemsUtils.updateItemsInPlace(
            this.allItems,
            indexes,
            items,
        )

        unmodifiedItems = unmodifiedItems.filter((_, index) => modificationsStatus[index])

        if (modifiedItems.length !== 0)
        {
            this.$itemsUpdated.next({
                updatedItems: modifiedItems,
                prevUpdatedItems: unmodifiedItems,
                updatedItemsDifference: modifiedFieldsInItems,
            })
        }

        this.setLoading(false)

        return modificationsStatus
    }


    /**
     * Finds and returns items matching the given UUIDs or item references.
     */
    public findOneMatchingItemForEach(
        itemsAndUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | number | undefined)[]>,
    ): (ImmutableAugmentedItem<T> | undefined)[]
    {
        if (itemsAndUuids.length === 0) return []

        return this.findOneIndexForEach(itemsAndUuids)
            .map(index => index === -1 ? undefined : this.allItems[index])
    }


    /**
     * Finds and returns the indexes of items matching the given UUIDs or item references.
     */
    public findOneIndexForEach(
        itemsAndUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T>
            | ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>,
    ): number[]
    {
        return ItemsUtils.findIndexes(this.allItems, itemsAndUuids)
    }


    /**
     * Finds and returns all the possible indexes of items matching the given UUIDs or item references.
     */
    public findAllPossibleIndexesForEach(
        itemsAndUuids: Readonly<(ImmutableAugmentedItem<T> | ImmutableRegularItem<T>
            | ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>,
    ): number[][]
    {
        return ItemsUtils.findAllIndexes(this.allItems, itemsAndUuids)
    }


    /**
     * Generates a unique identifier (UUID) for items.
     */
    protected getNewUuid(): number
    {
        this._uuidCounter++
        return this._uuidCounter
    }

}
