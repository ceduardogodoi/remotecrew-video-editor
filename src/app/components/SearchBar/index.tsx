import { Search } from 'lucide-react'

export function SearchBar() {
  return (
    <div className="search-bar__container">
      <Search className="search-bar__icon" />

      <input type="search" placeholder="Search" className="search-bar__input" />
    </div>
  )
}