import { useQuery } from "@apollo/client"
import { ALL_BOOKS, CURUSER } from "../queries"

const Recommendation = (props) => {
  const { loading, error, data } = useQuery(CURUSER)
  const result = useQuery(ALL_BOOKS)

  if (loading || result.loading) {
    return <div>loading...</div>
  }
  const favoriteGenre = data.curUser.favoriteGenre
  const books = result.data.allBooks.filter((book) =>
    book.genres.includes(favoriteGenre)
  )

  if (!props.show) return null

  return (
    <div>
      <h2>recommendation</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
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
    </div>
  )
}

export default Recommendation
