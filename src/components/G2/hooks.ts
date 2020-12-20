import { useEffect, useRef, useState } from 'react'
import { Chart, registerShape } from '@antv/g2'
import ResizeDetector from 'element-resize-detector'

// 用于监听目标容器的 resize 事件
const resizeDetector = ResizeDetector({ strategy: 'scroll' })

// 注册自定义的箭头形状
registerShape('point', 'pointer', {
  draw({ x, y, color }, group) {
    // 获取极坐标系下的画布中心点
    const center = this.parsePoint({ x: 0, y: 0 })
    const newGroup = group.addGroup({})

    newGroup.addShape('line', {
      attrs: {
        x1: center.x,
        y1: center.y,
        x2: x,
        y2: y,
        stroke: color,
        lineWidth: 2,
        lineCap: 'round',
      },
    })

    newGroup.addShape('circle', {
      attrs: {
        x: center.x,
        y: center.y,
        r: 4,
        stroke: color,
        lineWidth: 2.5,
        fill: '#ffffff',
      },
    })

    return newGroup
  },
})

export interface Props {
  width?: number
  height?: number
  data?: any[]
  render?: (chart: Chart) => void
}

export function useG2(props: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<Chart>()

  const { width = 300, height = 300, data = [], render = () => {} } = props

  const [actualWidth, setActualWidth] = useState(width)
  const [actualHeight, setActualHeight] = useState(height)

  // 初始化 Chart ref
  useEffect(() => {
    if (containerRef.current === null) return
    const container = containerRef.current

    chartRef.current = new Chart({
      container: container,
      renderer: 'svg',
    })

    // 默认自适应宽高，将几何信息交给上层组件设计
    function resizeHandler() {
      let { width: W, height: H } = container.getBoundingClientRect()
      setActualWidth(W)
      setActualHeight(H)
    }

    resizeHandler()
    resizeDetector.listenTo(container, resizeHandler)
    return () => resizeDetector.removeListener(container, resizeHandler)
  }, [])

  // 宽高变化回调
  useEffect(() => {
    chartRef.current?.changeSize(actualWidth, actualHeight)
  }, [actualWidth, actualHeight])

  // 图标渲染函数变化回调
  useEffect(() => {
    chartRef.current && render(chartRef.current)
  }, [render])

  // 数据变化回调
  useEffect(() => {
    chartRef.current?.changeData(data)
  }, [data])

  return containerRef
}
