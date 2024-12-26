export class Utils
{
    /**
     * Convert an event name to a property name
     * @param eventName
     * @returns {string}
     * @example
     * makeEventNameToPropName('Loading') // 'loadingCbs'
     */
    static makeEventNameToPropName(eventName: string): string
    {
        const eventNameArr = eventName.split('')
        eventNameArr[0] = eventNameArr[0].toLowerCase()
        return eventNameArr.join('') + 'Cbs'
    }

}
