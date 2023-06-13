import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Login from "./components/Login"
import Recommendation from "./components/Recommendation"
import { useApolloClient, useSubscription } from "@apollo/client"
import { ALL_BOOKS, BOOK_ADDED } from "./queries"

export const updateBooksQuery = (cache, query, addedBook) => {
  const uniqueByTitle = (arr) => {
    const seen = new Set()
    return arr.filter((book) =>
      seen.has(book.title) ? false : seen.add(book.title)
    )
  }
  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqueByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const client = useApolloClient()
  const [page, setPage] = useState("login")
  const [token, setToken] = useState(null)

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      // console.log(data)
      const addedBook = data.data.bookAdded
      window.alert(`${addedBook.title} has been added`)
      updateBooksQuery(client.cache, { query: ALL_BOOKS }, addedBook)
    },
  })

  const logout = () => {
    if (window.confirm("Do you want to logout?")) {
      setToken(null)
      window.localStorage.clear()
      client.resetStore()
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
        <button onClick={() => setPage("recommend")}>recommend</button>
        {token ? (
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage("login")}>login</button>
        )}
      </div>

      <Authors show={page === "authors"} />

      <Books show={page === "books"} />

      <NewBook show={page === "add"} />

      <Recommendation show={page === "recommend"} />

      <Login show={page === "login"} setToken={setToken} />
    </div>
  )
}

export default App
