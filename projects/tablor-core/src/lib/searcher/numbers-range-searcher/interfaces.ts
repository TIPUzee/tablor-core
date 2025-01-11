/**
 * Represents a range of numbers.
 *
 * @property min - The minimum value of the range.
 * @property max - The maximum value of the range.
 * @property includeMin - Whether to include the minimum value in the range.
 * @property includeMax - Whether to include the maximum value in the range.
 */
type Range =
    ({ min: number, includeMin?: boolean, max?: undefined, includeMax?: undefined } |
        { max: number, includeMax?: boolean, min?: undefined, includeMin?: undefined } |
        { min: number, max: number, includeMin?: boolean, includeMax?: boolean })

/**
 * Represents a processed range of numbers.
 *
 * @property min - The minimum value of the range.
 * @property max - The maximum value of the range.
 * @property includeMin - Whether to include the minimum value in the range.
 * @property includeMax - Whether to include the maximum value in the range.
 */
type ProcRange = {
    min: number,
    max: number,
    includeMin: boolean,
    includeMax: boolean,
}

/**
 * Represents a set of ranges of numbers.
 *
 * @property mustMatchAllFields - Whether all fields must match the ranges.
 * @property ranges - The ranges of numbers to search for in each field.
 */
export type NumberRangesOpts<T> = {
    mustMatchAllFields?: boolean,
    ranges: Partial<{
        [K in keyof T]: (Range)[]
    }>
}

/**
 * Represents a processed set of ranges of numbers.
 *
 * @property mustMatchAllFields - Whether all fields must match the ranges.
 * @property ranges - The ranges of numbers to search for in each field.
 */
export type ProcNumberRangesOpts<T> = {
    mustMatchAllFields: boolean,
    ranges: Partial<{
        [K in keyof T]: (ProcRange)[]
    }>
}
