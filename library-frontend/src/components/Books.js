import { useState } from "react"
import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const { loading, error, data, refetch } = useQuery(ALL_BOOKS)

  const onGenreSwitch = (genre) => {
    refetch({ genre: genre })
    setSelectedGenre(genre)
  }
  if (loading) return <div>loading...</div>

  // console.log(data)

  if (!props.show) {
    return null
  }

  // console.log(data)

  const books = data.allBooks
  const genres = new Set()
  books.forEach((book) => {
    book.genres.forEach((genre) => genres.add(genre))
  })

  return (
    <div>
      <h2>books</h2>
      <p>
        in genre <strong>{selectedGenre}</strong>
      </p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {selectedGenre === null ? (
          [...genres].map((genre, idx) => (
            <button key={idx} onClick={() => onGenreSwitch(`${genre}`)}>
              {genre}
            </button>
          ))
        ) : (
          <button onClick={() => onGenreSwitch(null)}>back</button>
        )}
      </div>
    </div>
  )
}

export default Books
