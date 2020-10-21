import { last } from '../utils'

test('last element of the given array', () => {
    expect(last([1, 2, 3, 4])).toBe(4)
    expect(last([])).toBe(undefined)
    expect(last()).toBe(undefined)
})