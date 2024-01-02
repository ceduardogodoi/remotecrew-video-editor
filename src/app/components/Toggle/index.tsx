import { forwardRef, ComponentProps } from 'react'

interface ToggleProps extends ComponentProps<'input'> {
  label?: string
  title: string
  onToggle?(): void
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>((props, ref) => {
  const { title, label, onToggle, ...rest } = props

  return (
    <div className="toggle__wrapper">
      {label && <span className="toggle__label">{label}</span>}
      <label className="toggle" title={title}>

        <input ref={ref} {...rest} type="checkbox" onClick={onToggle} />
        <span className="toggle__slider" />
      </label>
    </div>
  )
})
