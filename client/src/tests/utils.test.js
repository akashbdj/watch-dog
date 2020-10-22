import { last, isEmpty } from '../utils'

test('last element of the given array', () => {
    expect(last([1, 2, 3, 4])).toBe(4)
    expect(last([])).toBe(undefined)
    expect(last()).toBe(undefined)
})


test('if given object is empty', () => {
    expect(isEmpty()).toBe(true)
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty({})).toBe(true)
    expect(isEmpty({ x: 1 })).toBe(false)
})

