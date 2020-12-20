import { useEffect, useRef, useState } from 'react'
import { Chart } from '@antv/g2'
import { G2 } from '@/components'
import { stringify } from 'querystring'
import { fetchPrometheus } from '@/utils'

type PrometheusHttpResponse = {
  status: 'success'
  data: any
}

export interface ResponseParser {
  (res: PrometheusHttpResponse, data: any): any
}

export type Query =
  | [string, ResponseParser]
  | [string, ResponseParser, number, number]
  | [string, ResponseParser, number, number, number]

export type QueryMap = {
  [key: string]: Query
}

export interface Render {
  (C: Chart, data?: any): void
}

interface Props {
  query: Query
  render: Render
  interval?: number
  title?: string
  className?: string
}

export default function Monitor(props: Props) {
  const { query, className = '', render, interval } = props
  const [data, setData] = useState([])
  const intervalRef = useRef<any>()

  useEffect(() => {
    function fetchData() {
      let end = Date.now() / 1000
      let start = end - 86400
      let step = 600

      // query, parser, duration, step
      if (query.length === 4) {
        start = end - query[2]
        step = query[3]
      }

      // query, parser, start, end, step
      if (query.length === 5) {
        ;[start, end, step] = [query[2], query[3], query[4]]
      }

      const params = stringify({
        query: query[0],
        start,
        end,
        step,
      })

      const responseParser = query[1]

      fetchPrometheus(params)
        .then(res => res.json())
        .then(res => setData(d => responseParser(res, d)))
        .catch(err => console.error(err))
    }

    intervalRef.current && clearInterval(intervalRef.current)

    fetchData()

    interval &&
      interval > 0 &&
      (intervalRef.current = setInterval(fetchData, interval))
  }, [interval, query])

  return (
    <div className={'perish-component-Monitor_container ' + className}>
      <G2 width={300} height={300} data={data} render={render} />
    </div>
  )
}
