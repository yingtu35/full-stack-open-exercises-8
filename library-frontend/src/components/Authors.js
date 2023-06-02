import { useState } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { ALL_AUTHORS, UPDATE_AUTHOR } from "../queries"
import Select from "react-select"

const BirthYearForm = ({ authors }) => {
  const options = authors.map((author) => ({
    value: author.name,
    label: author.name,
  }))
  const [option, setOption] = useState(options[0])
  const [born, setBorn] = useState("")
  const [updateAuthor] = useMutation(UPDATE_AUTHOR)

  const submit = async (event) => {
    event.preventDefault()
    const name = option.value
    const setBornTo = Number(born)
    updateAuthor({ variables: { name, setBornTo } })

    setBorn("")
  }
  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <Select defaultValue={option} onChange={setOption} options={options} />
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>

        <button type="submit">update author</button>
      </form>
    </div>
  )
}

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS)
  if (result.loading) return <div>loading...</div>
  const authors = result.data.allAuthors

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <BirthYearForm authors={authors} />
    </div>
  )
}

export default Authors
