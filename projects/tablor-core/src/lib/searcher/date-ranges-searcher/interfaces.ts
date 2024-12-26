/**
 * Represents an offset in years, months, days, hours, minutes and seconds
 *
 * @property years - The number of years to add or subtract.
 * @property months - The number of months to add or subtract.
 * @property days - The number of days to add or subtract.
 * @property hours - The number of hours to add or subtract.
 * @property minutes - The number of minutes to add or subtract.
 * @property seconds - The number of seconds to add or subtract.
 * @property milliseconds - The number of milliseconds to add or subtract.
 */
export type Offset = {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    milliseconds?: number;
}

/**
 * A range of dates with optional start and end dates, as well as optional start and end offsets.
 *
 * @property start - The start date of the range.
 * @property includeStart - Whether to include the start date in the range.
 * @property end - The end date of the range.
 * @property includeEnd - Whether to include the end date in the range.
 */
export type ProcRange =
    ({ start?: undefined; includeStart?: undefined } | { start: Date; includeStart: boolean })
    &
    ({ end?: undefined; includeEnd?: undefined } | { end: Date; includeEnd: boolean })

/**
 * A range of dates with optional start and end dates, as well as optional start and end offsets.
 *
 * @property start - The start date of the range.
 * @property startOffset - The offset to apply to the start date.
 * @property includeStart - Whether to include the start date in the range.
 * @property end - The end date of the range.
 * @property endOffset - The offset to apply to the end date.
 * @property includeEnd - Whether to include the end date in the range.
 */
export type RangeWithAdjustments =
    ({ start?: undefined; startOffset?: undefined; includeStart?: undefined } | {
        start: Date | 'Now' | string;
        startOffset?: Offset;
        includeStart?: boolean
    })
    &
    ({ end?: undefined; endOffset?: undefined; includeEnd?: undefined } | {
        end: Date | 'Now' | string;
        endOffset?: Offset;
        includeEnd?: boolean
    })

/**
 * Represents a set of ranges of dates with optional start and end dates, as well as optional start and end offsets.
 */
export type RangesWithOffsets<T> = Partial<{
    [K in keyof T]: RangeWithAdjustments[]
}>

/**
 * Represents a set of ranges of dates with optional start and end dates, as well as optional start and end offsets.
 */
export type ProcDateRanges<T> = Partial<{
    [K in keyof T]: ProcRange[]
}>

/**
 * Represents a set of ranges of dates with optional start and end dates, as well as optional start and end offsets.
 */
export type DateRangesOpts<T> = {
    ranges: RangesWithOffsets<T>
    mustMatchAllFields?: boolean
}

/**
 * Represents a set of ranges of dates with optional start and end dates, as well as optional start and end offsets.
 */
export type ProcDateRangesOpts<T> = {
    ranges: ProcDateRanges<T>
    mustMatchAllFields: boolean
}
