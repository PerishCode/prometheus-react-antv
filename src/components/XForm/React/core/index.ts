import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import {
  reactive,
  observeGlobal,
  combine,
  unobserveGlobal,
} from '@/components/XForm/reactive/core'
import { CoreProps, XFormProps, XSchema } from './types'
import { __render__ } from './global'

export function core({ schema, addition, index }: CoreProps) {
  const combination = combine(schema, addition) as XSchema
  const renders = combination[__render__]

  let unit: any = null
  renders?.forEach((r, i) => {
    unit =
      i + 1 !== renders.length
        ? r({ schema: combination, index, children: unit })
        : React.createElement(
            r,
            { schema: combination, index, key: index },
            unit
          )
  })
  return unit
}

export default function XForm({
  schema: initialSchema,
  onChange,
  parser = v => v,
}: XFormProps) {
  const container = useRef(null)

  function render() {
    const reaction = reactive(initialSchema)
    onChange && onChange(parser(reaction))
    reaction && ReactDOM.render(core({ schema: reaction }), container.current)
  }

  useEffect(() => {
    observeGlobal(render)
    render()
    return () => unobserveGlobal(render)
  })

  return React.createElement('div', {
    ref: container,
    className: 'XForm__root',
  })
}
