import { useState } from "react"
import Authors from "./components/Authors"
import Books from "./components/Books"
import NewBook from "./components/NewBook"
import Login from "./components/Login"
import Recommendation from "./components/Recommendation"
import { useApolloClient } from "@apollo/client"
import { Routes, Route, Link } from "react-router-dom"

const App = () => {
  const client = useApolloClient()
  const [page, setPage] = useState("login")
  const [token, setToken] = useState(null)

  const logout = () => {
    // TODO: remove token, clear storage, reser store
    if (window.confirm("Do you want to logout?")) {
      setToken(null)
      window.localStorage.clear()
      client.resetStore()
    }
  }

  // const handlePage = (page) => {
  //   if (token) {
  //     setPage(page)
  //   }
  // }

  return (
    <div>
      {/* <nav>
        <button>
          <Link to={"/authors"}>authors</Link>
        </button>
        <button>
          <Link to={"/books"}>books</Link>
        </button>
        <button>
          <Link to={"/login"}>login</Link>
        </button>
        <button>
          <Link to={"/authors"}>authors</Link>
        </button>
      </nav> */}
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
