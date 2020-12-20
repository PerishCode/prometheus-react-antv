import { reactive, wrapAsReactive as wrap, observeGlobal } from '../core'

let reaction = reactive({
  a: 0,
  b: [1, 2, 3],
  c: wrap((n) => {
    let result = 0

    for (const value of n.b.values()) {
      result += value
    }

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

  reaction.b[0] = 7

  reaction.b = [4, 5, 6]

  reaction.c = wrap((n) => {
    let result = ''

    for (const value of n.b.keys()) {
      result += value
    }

    console.log('c[v2]', result)

    return result
  })

  // 变量赋值为 wrap 类型后必须显式调用变量，否则该 wrap 方法不会被注册
  reaction.c

  reaction.b = [7, 8, 9]

  reaction.c = wrap((n) => {
    let result = 0

    // for (const e of n.b.entries()) {
    //   result += e.value
    // }
    for (let e of n.b.entries()) result += e[1]

    console.log('c[v3]', result)

    return result
  })

  reaction.c

  reaction.b[0] = 12

  reaction.b = [0, 1, 2]

  reaction.b[0] = 11
}
