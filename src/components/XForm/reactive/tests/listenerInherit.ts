import { reactive, wrapAsReactive as wrap, observeGlobal } from '../core'

let reaction = reactive({
  a: [7, 8, 9],
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

  reaction.c

  console.log('-------------')

  reaction.b = [4, 5, 6]

  reaction.b[0] = 123

  reaction.b = reaction.b.concat(reaction.a)

  reaction.b[5] = 456

  console.log(reaction.a)
  console.log(reaction.b)
}
