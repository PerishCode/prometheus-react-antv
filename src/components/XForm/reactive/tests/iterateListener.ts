import { reactive, wrapAsReactive as wrap, observeGlobal } from '../core'

let reaction = reactive({
  a: 0,
  b: [1, 2, 3],
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

  reaction.c

  reaction.b[0] = 2

  reaction.b.push(4)

  reaction.b = undefined

  reaction.b = [2, 3, 4]
}
