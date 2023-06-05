import { useEffect, useState } from "react"
import { useMutation } from "@apollo/client"
import { LOGIN } from "../queries"

const Login = ({ show, setToken }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [userLogin, { data }] = useMutation(LOGIN)

  const onLogin = async (e) => {
    e.preventDefault()
    // TODO: send a mutation, setToken
    userLogin({ variables: { username, password } })

    setUsername("")
    setPassword("")
  }

  useEffect(() => {
    if (data) {
      const token = data.login.value
      window.localStorage.setItem("library-token", token)
      setToken(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (!show) {
    return null
  }

  return (
    <div>
      <form onSubmit={onLogin}>
        <div>
          <label htmlFor="login-username">username</label>
          <input
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password">password</label>
          <input
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <button type="submit">login</button>
        </div>
      </form>
    </div>
  )
}

export default Login
