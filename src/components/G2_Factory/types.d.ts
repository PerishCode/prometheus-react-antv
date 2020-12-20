import { Render } from '@/components/Monitor'

export interface RenderGenerator<T> {
  (configuration: T, data?: any): Render
}
