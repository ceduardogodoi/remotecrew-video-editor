interface Props {
  name: string
}

export function Avatar({ name }: Props) {
  const fullName = name.split(' ')
  const firstName = fullName[0]
  let initials = firstName[0]
  if (fullName.length > 1) {
    const lastName = fullName[fullName.length - 1]
    if (lastName.length > 1) {
      initials = initials
        .concat(lastName[0])
        .toUpperCase()
    }
  }

  return (
    <div className="transcript-sentence__avatar">
      <span className="transcript-sentence__avatar-initials">
        {initials}
      </span>
    </div>
  )
}
