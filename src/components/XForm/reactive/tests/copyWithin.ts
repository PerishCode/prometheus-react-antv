import { reactive, wrapAsReactive as wrap, observeGlobal } from '../core'

let reaction = reactive({
  a: wrap((n) => {
    let result = n.b[0] + n.b[5]
    console.log('a[v1]', result)
    return result
  }),
  b: [1, 2, 3, 4, 5, 6],
  c: wrap((n) => {
    let result = 0

    n.b.forEach((v) => (result += v))

    console.log('c[v1]', result)

    return result
  }),
}) as any

function printLog() {
  console.log('a global callback')
}

export default function () {
  observeGlobal(printLog)

  reaction.a
  reaction.c

  reaction.b.copyWithin(1, 3, 5)
}
