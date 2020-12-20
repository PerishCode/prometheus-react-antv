import { reactive, wrapAsReactive as wrap, observeGlobal } from '../core'

let reaction = reactive({
  a: wrap((n) => {
    const result = n.b[0] + n.b[1]
    console.log('a[v1]', result)
    return result
  }),
  b: [1, 2, 3, 4, 5],
  c: wrap((n) => {
    let result = 0

    n.b?.forEach((i) => (result += i))

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

  console.log('-------------')

  reaction.b.splice(1, 2)

  reaction.b.splice(1, 2)
}
