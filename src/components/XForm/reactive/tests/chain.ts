import { reactive, wrapAsReactive as wrap } from '../core'

let reaction = reactive({
  a: 0,
  b: wrap((n) => {
    const result = n.a
    console.log('b v1', result)

    return result
  }),
  c: wrap((n) => {
    const result = n.b + 1
    console.log('c v1', result)

    return result
  }),
}) as any

export default function () {
  reaction.b
  reaction.c

  console.log('---------')

  reaction.a = 1
  reaction.a = 2

  console.log('---------')

  reaction.c = wrap((n) => {
    const result = n.b + 2
    console.log('c v2', result)
    return result
  })

  reaction.c

  console.log('---------')

  reaction.a = 1
  reaction.a = 2

  console.log('---------')

  reaction.c = wrap((n) => {
    const result = n.b + n.a + 2
    console.log('c v3', result)
    return result
  })

  reaction.c

  console.log('---------')

  reaction.a = 1
  reaction.a = 2
}
