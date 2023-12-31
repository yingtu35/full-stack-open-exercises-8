import { useState } from "react"
import { useMutation } from "@apollo/client"
import { CREATE_BOOK, ALL_AUTHORS, ALL_BOOKS } from "../queries"
import { updateBooksQuery } from "../App"

const NewBook = (props) => {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [published, setPublished] = useState("")
  const [genre, setGenre] = useState("")
  const [genres, setGenres] = useState([])
  const [createBook] = useMutation(CREATE_BOOK, {
    refetchQueries: [ALL_AUTHORS],
    update: (cache, result) => {
      updateBooksQuery(cache, { query: ALL_BOOKS }, result.data.addBook)
    },
    // TODO: onError notificatoin
  })

  const submit = async (event) => {
    event.preventDefault()
    const publishYear = Number(published)
    // console.log("add book...")
    createBook({ variables: { title, author, publishYear, genres } })

    setTitle("")
    setPublished("")
    setAuthor("")
    setGenres([])
    setGenre("")
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre("")
  }

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>Add a new book</h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
