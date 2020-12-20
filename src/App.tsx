import { Monitor } from '@/components'
import { Collapse } from 'antd'
import panels from './panels'
import '@/App.sass'

const { Panel } = Collapse

export default function App() {
  return (
    <div className="perish-page-App_container">
      <Collapse defaultActiveKey={[0, 1]}>
        {panels.map((p, i) => (
          <Panel key={i} header={p.title} className="antd_panel">
            {p.monitors.map((m, j) => (
              <Monitor key={j} {...m} />
            ))}
          </Panel>
        ))}
      </Collapse>
    </div>
  )
}
