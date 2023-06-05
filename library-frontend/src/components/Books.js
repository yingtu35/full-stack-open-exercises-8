import { useState } from "react"
import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"

const genres = [
  "refactoring",
  "agile",
  "patterns",
  "design",
  "crime",
  "classic",
]

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const { loading, error, data, refetch } = useQuery(ALL_BOOKS)

  const onGenreSwitch = (genre) => {
    refetch({ genre: genre })
    setSelectedGenre(genre)
  }
  if (loading) return <div>loading...</div>

  if (!props.show) {
    return null
  }

  // console.log(data)

  const books = data.allBooks

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
        {genres.map((genre, idx) => (
          <button key={idx} onClick={() => onGenreSwitch(`${genre}`)}>
            {genre}
          </button>
        ))}
        <button onClick={() => onGenreSwitch(null)}>all genres</button>
      </div>
    </div>
  )
}

export default Books
