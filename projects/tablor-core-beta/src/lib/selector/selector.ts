import {
    AugmentedItem,
    ImmutableAugmentedPartialRegularItem,
    ImmutableAugmentedItem,
    ImmutableRegularItem,
    Item, ItemsRemovedPayload,
} from '../stores/items-store/interfaces'
import { Subject } from 'rxjs'
import { ItemsSelectionChangedPayload } from './interfaces'
import { ItemsStore } from '../stores/items-store/items-store'
import { Paginator } from '../paginator/paginator'


/**
 * Represents a selector.
 */
export class Selector<T extends Item<T>>
{
    protected _selectedUuids: number[] = []

    public readonly $itemsSelectionChanged: Subject<ItemsSelectionChangedPayload<T>>
        = new Subject<ItemsSelectionChangedPayload<T>>()


    constructor(
        protected readonly getAllItems: ItemsStore<T>['getMutableItems'],
        protected readonly getPaginatedItems: Paginator<T>['getItems'],
        protected readonly findOneIndexForEach: ItemsStore<T>['findOneIndexForEach'],
        protected readonly $itemsRemoved: Subject<ItemsRemovedPayload<T>>,
    )
    {
        this.$itemsRemoved.subscribe(this.verifySelectedItemsOnRemoval.bind(this))
    }


    /**
     * Returns the number of selected items.
     */
    public getNbOfSelectedItems(): number
    {
        return this._selectedUuids.length
    }


    public getNbOfUnselectedItems(): number
    {
        return this.getAllItems().length - this._selectedUuids.length
    }


    public getNbOfSelectedPaginatedItems(): number
    {
        if (this.getAllItems().length === this.getPaginatedItems().length)
            return this.getNbOfSelectedItems()

        return this.getPaginatedItems().filter(item => this._selectedUuids.includes(item.tablorMeta.uuid)).length
    }


    public getNbOfUnselectedPaginatedItems(): number
    {
        if (this.getAllItems().length === this.getPaginatedItems().length)
            return this.getNbOfUnselectedItems()

        return this.getPaginatedItems().filter(item => !this._selectedUuids.includes(item.tablorMeta.uuid)).length
    }


    /**
     * Returns the number of selected items in the given items.
     */
    public getNbOfSelectedItemsIn(
        items: Readonly<(ImmutableAugmentedPartialRegularItem<T> | number | undefined)[]>,
    ): number
    {
        return items.reduce(
            (c: number, item) =>
            {
                if (item === undefined)
                    return c

                else if (typeof item === 'number')
                    return c + (this._selectedUuids.includes(item) ? 1 : 0)

                else if (typeof item === 'object' && 'tablorMeta' in item)
                    return c + (this._selectedUuids.includes(item.tablorMeta.uuid) ? 1 : 0)

                return c
            },
            0,
        )
    }


    public getSelectedItems(): ImmutableAugmentedItem<T>[]
    {
        return this.getAllItems().filter(item => this._selectedUuids.includes(item.tablorMeta.uuid))
    }


    public getUnselectedItems(): ImmutableAugmentedItem<T>[]
    {
        return this.getAllItems().filter(item => !this._selectedUuids.includes(item.tablorMeta.uuid))
    }


    public getSelectedItemUuids(): number[]
    {
        return this._selectedUuids
    }


    public getUnselectedItemUuids(): number[]
    {
        return this.getAllItems().map(item => item.tablorMeta.uuid).filter(uuid => !this._selectedUuids.includes(uuid))
    }


    public getSelectedPaginatedItems(): ImmutableAugmentedItem<T>[]
    {
        return this.getPaginatedItems().filter(item => this._selectedUuids.includes(item.tablorMeta.uuid))
    }


    public getUnselectedPaginatedItems(): ImmutableAugmentedItem<T>[]
    {
        return this.getPaginatedItems().filter(item => !this._selectedUuids.includes(item.tablorMeta.uuid))
    }


    /**
     * Selects or deselects an item.
     */
    public select(
        item:
            ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T>
            | number | undefined,
        state: boolean | 'toggle',
    ): void
    {
        const i = this.selectInternal(item, state)
        if (i === -1) return

        this.$itemsSelectionChanged.next({
            items: [this.getAllItems()[i]],
        })
    }


    /**
     * Selects or deselects multiple items.
     */
    public selectMultiple(
        items: Readonly<(
            ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T>
            | number | undefined
            )[]>,
        states: (boolean | 'toggle')[] | (boolean | 'toggle'),
    ): void
    {
        if (Array.isArray(states) && items.length !== states.length)
            throw new Error('The number of items and states must match')

        if (items.length === 0) return

        const indexes: number[] = []

        if (!Array.isArray(states))
        {
            for (let i = 0; i < items.length; i++)
            {
                indexes.push(this.selectInternal(items[i], states))
            }
        }
        else
        {
            for (let i = 0; i < items.length; i++)
            {
                indexes.push(this.selectInternal(items[i], states[i]))
            }
        }

        const selectedItems = indexes.map(i => this.getAllItems()[i])

        this.$itemsSelectionChanged.next({
            items: selectedItems,
        })
    }


    /**
     * Verifies that the selected items are still valid after items have been removed.
     */
    protected verifySelectedItemsOnRemoval({ removedItems }: ItemsRemovedPayload<T>): void
    {
        const removedUuids = removedItems.map(item => item.tablorMeta.uuid)
        this._selectedUuids = this._selectedUuids
            .filter(uuid => !removedUuids.includes(uuid))
    }


    /**
     * Selects or deselects an item.
     */
    protected selectInternal(
        item: ImmutableAugmentedItem<T> | ImmutableRegularItem<T> | ImmutableAugmentedPartialRegularItem<T>
            | number | undefined,
        state: boolean | 'toggle',
    ): number
    {
        if (item === undefined) return -1

        const i = this.findOneIndexForEach([item])[0]
        if (i === -1) return -1

        if (state === 'toggle')
            state = !this.getAllItems()[i].tablorMeta.isSelected

        if (state)
        {
            if (!this._selectedUuids.includes(this.getAllItems()[i].tablorMeta.uuid))
                this._selectedUuids.push(this.getAllItems()[i].tablorMeta.uuid)
        }
        else
        {
            if (this._selectedUuids.includes(this.getAllItems()[i].tablorMeta.uuid))
                this._selectedUuids = this._selectedUuids
                    .filter(uuid => uuid !== this.getAllItems()[i].tablorMeta.uuid)
        }

        this.getAllItems()[i].tablorMeta.isSelected = state

        return i
    }
}
