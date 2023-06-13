const { ApolloServer } = require("@apollo/server")
const { expressMiddleware } = require("@apollo/server/express4")
const { startStandaloneServer } = require("@apollo/server/standalone")
const mongoose = require("mongoose")
const User = require("./models/user")
const jwt = require("jsonwebtoken")
const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const { createServer } = require("http")
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer")
const { makeExecutableSchema } = require("@graphql-tools/schema")
const { WebSocketServer } = require("ws")
const { useServer } = require("graphql-ws/lib/use/ws")
const cors = require("cors")
const express = require("express")
require("dotenv").config()

mongoose.set("strictQuery", false)

console.log("Connecting to", process.env.MONGODB_URL)
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.log(error.message)
  })

const start = async () => {
  const app = express()
  const httpServer = createServer(app)
  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: "/",
  })

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server.
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null
        // console.log(auth)
        if (auth && auth.startsWith("Bearer ")) {
          const userToken = jwt.verify(auth.substring(7), process.env.SECRET)
          const curUser = await User.findById(userToken.id)
          return { curUser }
        }
      },
    })
  )

  const PORT = 4000
  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  )
}

start()
