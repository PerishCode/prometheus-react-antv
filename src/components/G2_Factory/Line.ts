import { RenderGenerator } from './types'

interface Configuration {
  xIndex: string
  yIndex: string
}

const Line: RenderGenerator<Configuration> = configuration => {
  const { xIndex, yIndex } = configuration

  return chart => {
    chart.scale(xIndex, {
      //   range: [0, 1],
      type: 'timeCat',
      mask: 'HH:mm:ss',
    })

    chart.scale(yIndex, {
      min: 20,
      nice: true,
      range: [0, 1.2],
    })

    chart
      .line()
      .position(xIndex + '*' + yIndex)
      .label(yIndex)

    chart.point().position(xIndex + '*' + yIndex)
  }
}

export default Line
