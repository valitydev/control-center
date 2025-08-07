/**
 * Checks that all elements of an array are present
 * Duplicates are checked in real time
 * @example const EXAMPLE_ARRAY = enumerate<'a' | 'b'>()('a', 'b');
 * @example const EXAMPLE_ARRAY = enumerate<'a' | 'b'>()('a'); // error
 * @example const EXAMPLE_ARRAY = enumerate<'a' | 'b'>()('a', 'b', 'a'); // error, return ['a', 'b']
 */
export const enumerate =
    <T extends string>() =>
    <U extends T[]>(
        ...array: U & ([T] extends [U[number]] ? unknown : 'All elements of an array are present')
    ) => {
        const result = Array.from(new Set(array));
        if (result.length < array.length) {
            console.error(`Enumerate array (${array.join(', ')}) has duplicates`);
        }
        return result;
    };
