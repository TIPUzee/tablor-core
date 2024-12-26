import { Offset, ProcRange, RangeWithAdjustments } from './interfaces'


function applyDateOffset(baseDate: Date, offset?: Offset): void
{
    if (!offset) return

    if (offset.years) baseDate.setFullYear(baseDate.getFullYear() + offset.years)
    if (offset.months) baseDate.setMonth(baseDate.getMonth() + offset.months)
    if (offset.days) baseDate.setDate(baseDate.getDate() + offset.days)
    if (offset.hours) baseDate.setHours(baseDate.getHours() + offset.hours)
    if (offset.minutes) baseDate.setMinutes(baseDate.getMinutes() + offset.minutes)
    if (offset.seconds) baseDate.setSeconds(baseDate.getSeconds() + offset.seconds)
}

export function convertToStrictDateRange(dateRange: RangeWithAdjustments): ProcRange
{
    const { start, startOffset, end, endOffset } = dateRange

    let strictStart: Date | undefined = undefined
    if (start)
    {
        if (typeof start === 'string')
        {
            if (start === 'Now')
                strictStart = new Date()
            else
                strictStart = new Date(start)
        }
        else
        { strictStart = start }

        applyDateOffset(strictStart, startOffset)
    }

    let strictEnd: Date | undefined = undefined
    if (end)
    {
        if (typeof end === 'string')
        {
            if (end === 'Now')
                strictEnd = new Date()
            else
                strictEnd = new Date(end)
        }
        else
        { strictEnd = end }

        applyDateOffset(strictEnd, endOffset)
    }

    // @ts-expect-error
    return {
        start: strictStart as Date | undefined,
        includeStart: strictStart ? (dateRange.includeStart ? dateRange.includeStart as boolean : false) : undefined,
        end: strictEnd,
        includeEnd: strictEnd ? (dateRange.includeEnd ? dateRange.includeEnd as boolean : false) : undefined,
    }
}
