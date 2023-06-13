import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
} from "@apollo/client"
import { getMainDefinition } from "@apollo/client/utilities"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"
import { setContext } from "@apollo/client/link/context"
import { BrowserRouter as Router } from "react-router-dom"

const httpLink = createHttpLink({
  uri: "http://localhost:4000",
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  let token = JSON.parse(localStorage.getItem("library-token"))
  // console.log(token)
  const currentTime = new Date().getTime()
  if (token && token.expireTimestamp < currentTime) {
    localStorage.removeItem("library-token")
    token = null
  }
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token.value}` : null,
    },
  }
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000",
  })
)

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <Router>
      <App />
    </Router>
  </ApolloProvider>
)
