import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./searchbar.css"

interface Product {
  id: number
  title: string
  price: number
}

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([])
        setShowDropdown(false)
        return
      }
      try {
        const res = await axios.get(
          "http://localhost:3000/products/title",
          { params: { title: query } }
        )
        setResults(res.data.slice(0, 5))
        setShowDropdown(true)
      } catch (error) {
        console.error(error)
      }
    }

    fetchResults()
  }, [query])

  return (
    <section className="searchbar-container">
      <input
        type="text"
        className="searchbar"
        placeholder="Search products..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={e => {
          if (e.key === "Enter" && query.trim()) {
            navigate(`/search?title=${query}`)
            setShowDropdown(false)
          }
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        onFocus={() => {
          if (results.length > 0) setShowDropdown(true)
        }}
      />

      {showDropdown && results.length > 0 && (
        <div className="search-dropdown">
          {results.map(product => (
            <div
              key={product.id}
              className="search-dropdown-item"
              onClick={() => {
                navigate(`/product/${product.id}`)
                setShowDropdown(false)
              }}
            >
              <img
                src="/OneFifty.png"
                alt=""
                className="search-dropdown-image"
              />
              <span>{product.title}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
