import { Props, useG2 } from './hooks'
import './index.sass'

export default function G2(props: Props) {
  return (
    <div className="perish-component-G2_container">
      <div className="actual_container" ref={useG2(props)} />
    </div>
  )
}
