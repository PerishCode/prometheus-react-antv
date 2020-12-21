import { RenderGenerator } from './types'

interface Configuration {
  label: string
}

const Dashboard: RenderGenerator<Configuration> = configuration => {
  const { label } = configuration

  return chart => {
    chart.coordinate('polar', {
      startAngle: (-9 / 8) * Math.PI,
      endAngle: (1 / 8) * Math.PI,
      radius: 0.75,
    })

    chart.scale('value', {
      min: 0,
      max: 100,
      tickInterval: 10,
    })

    chart.axis('null', false)
    chart.legend(false)
    chart.tooltip(false)

    chart.axis('value', {
      line: null,
      label: {
        offset: -12,
        style: {
          fontSize: 8,
          fill: '#CBCBCB',
          textAlign: 'center',
          textBaseline: 'middle',
        },
      },
      tickLine: null,
      grid: null,
    })

    chart
      .point()
      .position('value*null')
      .shape('pointer')
      .color('value', v => {
        if (v < 34) return '#0086FA'
        if (v < 67) return '#FFBF00'
        return '#F5222D'
      })

    chart.annotation().clear(true)

    chart.annotation().arc({
      top: true,
      start: [0, 1],
      end: [100, 1],
      style: {
        stroke: '#CBCBCB',
        lineWidth: 10,
        lineDash: null,
      },
    })

    chart.annotation().text({
      position: ['50%', '75%'],
      content: label,
      style: {
        fontSize: 10,
        fill: '#000',
        textAlign: 'center',
      },
    })

    // chart.render()
  }
}

export default Dashboard
