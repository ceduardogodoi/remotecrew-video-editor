import { forwardRef, ComponentProps } from 'react'

interface ToggleProps extends ComponentProps<'input'> {
  label?: string
  title: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>((props, ref) => {
  const { title, label, ...rest } = props

  return (
    <div className="toggle__wrapper">
      {label && <span className="toggle__label">{label}</span>}
      <label className="toggle" title={title}>

        <input ref={ref} {...rest} type="checkbox" />
        <span className="toggle__slider" />
      </label>
    </div>
  )
})
