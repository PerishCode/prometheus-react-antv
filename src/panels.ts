import { Query, Render } from '@/components/Monitor'
import { DashboardGenerator, LineGenerator } from '@/components/G2_Factory'
import DayJS from 'dayjs'

interface MonitorConfiguration {
  title: string
  query: Query
  className: string
  render: Render
  interval?: number
}

interface PanelConfiguration {
  title: string
  monitors: MonitorConfiguration[]
}

function parseSingleValue(res) {
  const value = res.data.result[0]?.values[0][1]

  if (value === undefined) return []

  return [
    {
      timestamp: Date.now(),
      value: Number(Number(value).toFixed(2)),
      // value: Number((Math.random() * 20 + 20).toFixed(2)),
    },
  ]
}

function parseSingleValueAndAppend(res, data) {
  const singleValue = parseSingleValue(res)
  const result = data.concat(singleValue)
  if (result.length > 50) result.shift()
  return result
}

function parseSingleValueAndAppend_generator(max_length = 50) {
  return max_length === 50
    ? parseSingleValueAndAppend
    : function (res, data) {
        const singleValue = parseSingleValue(res)
        const result = data.concat(singleValue)
        if (result.length > max_length) result.shift()
        return result
      }
}

const panels: PanelConfiguration[] = [
  {
    title: 'CPU Information',
    monitors: [
      {
        title: 'CPU 占用率',
        className: 'CPU_Busy display_square small',
        query: [
          `(((count(count(node_cpu_seconds_total{}) by (cpu))) - avg(sum by (mode)(irate(node_cpu_seconds_total{mode='idle'}[5m])))) * 100) / count(count(node_cpu_seconds_total{}) by (cpu))`,
          parseSingleValue,
        ],
        render: DashboardGenerator({}),
        // interval: 5000,
      },
      {
        title: '系统负载',
        className: 'Sys_Load display_square small',
        query: [
          `avg(node_load5{}) /  count(count(node_cpu_seconds_total{}) by (cpu)) * 100`,
          parseSingleValue,
        ],
        render: DashboardGenerator({}),
        // interval: 5000,
      },
    ],
  },
  {
    title: 'Basic CPU/Mem/Net/Disk',
    monitors: [
      {
        title: 'CPU 基础数值',
        className: 'CPU_Basic display_rectangle medium',
        query: [
          `avg(node_load5{}) /  count(count(node_cpu_seconds_total{}) by (cpu)) * 100`,
          parseSingleValueAndAppend_generator(10),
        ],
        interval: 5000,
        render: LineGenerator({ xIndex: 'timestamp', yIndex: 'value' }),
      },
    ],
  },
]

export default panels
