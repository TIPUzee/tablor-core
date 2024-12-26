/**
 * Represents options for a search with exact value query functionality.
 *
 * @property mustMatchAllFields - Whether all fields must match the provided values.
 * @property values - The values to search for in each field.
 * @property customCompareFns - Custom comparison functions for each field.
 */
export type ExactValuesOpts<T> = {
    mustMatchAllFields?: boolean
    values: Partial<{
        [K in keyof T]: T[K][]
    }>,
    customCompareFns?: Partial<{
        [K in keyof T]: (actualVal: T[K], expectedVal: T[K]) => boolean;
    }>;
}

/**
 * Represents processed options for a search with exact value query functionality.
 *
 * @property mustMatchAllFields - Whether all fields must match the provided values.
 * @property values - The values to search for in each field.
 * @property customCompareFns - Custom comparison functions for each field.
 */
export type ProcExactValuesOpts<T> = {
    mustMatchAllFields: boolean
    values: Partial<{
        [K in keyof T]: T[K][]
    }>,
    customCompareFns: Partial<{
        [K in keyof T]: (actualVal: T[K], expectedVal: T[K]) => boolean;
    }>;
}
