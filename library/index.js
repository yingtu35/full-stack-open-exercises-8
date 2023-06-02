const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const { GraphQLError } = require("graphql")
const mongoose = require("mongoose")
const Author = require("./models/author")
const Book = require("./models/book")
const User = require("./models/user")
const jwt = require("jsonwebtoken")

// let authors = [
//   {
//     name: "Robert Martin",
//     id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//     born: 1952,
//   },
//   {
//     name: "Martin Fowler",
//     id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//     born: 1963,
//   },
//   {
//     name: "Fyodor Dostoevsky",
//     id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//     born: 1821,
//   },
//   {
//     name: "Joshua Kerievsky", // birthyear not known
//     id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//   },
//   {
//     name: "Sandi Metz", // birthyear not known
//     id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//   },
// ]

// let books = [
//   {
//     title: "Clean Code",
//     published: 2008,
//     author: "Robert Martin",
//     id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Agile software development",
//     published: 2002,
//     author: "Robert Martin",
//     id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//     genres: ["agile", "patterns", "design"],
//   },
//   {
//     title: "Refactoring, edition 2",
//     published: 2018,
//     author: "Martin Fowler",
//     id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring"],
//   },
//   {
//     title: "Refactoring to patterns",
//     published: 2008,
//     author: "Joshua Kerievsky",
//     id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "patterns"],
//   },
//   {
//     title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
//     published: 2012,
//     author: "Sandi Metz",
//     id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//     genres: ["refactoring", "design"],
//   },
//   {
//     title: "Crime and punishment",
//     published: 1866,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "crime"],
//   },
//   {
//     title: "The Demon ",
//     published: 1872,
//     author: "Fyodor Dostoevsky",
//     id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//     genres: ["classic", "revolution"],
//   },
// ]
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

const typeDefs = `
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID,
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    curUser: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author && args.genre) {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author._id, genres: args.genre }).populate(
          "author",
          ["name", "born", "_id"]
        )
      } else if (args.author) {
        const author = await Author.findOne({ name: args.author })
        return Book.find({ author: author._id }).populate("author", [
          "name",
          "born",
          "_id",
        ])
      } else if (args.genre) {
        return Book.find({ genres: args.genre }).populate("author", [
          "name",
          "born",
          "_id",
        ])
      } else {
        const books = await Book.find({}).populate("author", [
          "name",
          "born",
          "_id",
        ])
        return books
      }
    },
    allAuthors: async (root, args) => {
      const authors = await Author.find({})
      return authors
    },
  },

  Mutation: {
    addBook: async (root, args, { curUser }) => {
      // not checking duplicate book yet
      if (!curUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: { status: 401 },
          },
        })
      }
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        const newAuthor = new Author({ name: args.author })
        try {
          author = await newAuthor.save()
        } catch (error) {
          throw new GraphQLError("Person name too short", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          })
        }
      }
      const newBook = new Book({ ...args, author: author._id.toString() })
      try {
        const returnedBook = await (
          await newBook.save()
        ).populate("author", ["name", "born", "_id"])
        return returnedBook
      } catch (error) {
        throw new GraphQLError("Book title too short or book already exists", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        })
      }

      // if (!authors.find((a) => a.name === newBook.author)) {
      //   const newAuthor = {
      //     name: newBook.author,
      //     id: uuid(),
      //   }
      //   authors = authors.concat(newAuthor)
      // }
    },
    editAuthor: async (root, args, { curUser }) => {
      if (!curUser) {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
            http: { status: 401 },
          },
        })
      }
      const authorToEdit = await Author.findOne({ name: args.name })
      if (authorToEdit) {
        authorToEdit.born = args.setBornTo
        await authorToEdit.save()
        return authorToEdit
      }
    },
    createUser: async (root, args) => {
      const newUser = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      })
      try {
        await newUser.save()
      } catch (error) {
        throw new GraphQLError("Creating user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        })
      }
      return newUser
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== "secret") {
        throw new GraphQLError("Not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            http: { status: 401 },
          },
        })
      }
      const payload = {
        username: user.username,
        id: user._id,
      }

      return {
        value: jwt.sign(payload, process.env.SECRET, { expiresIn: 60 * 60 }),
      }
    },
  },

  Author: {
    bookCount: async (root) => {
      return Book.find({ author: root._id }).countDocuments()
      // books.reduce(
      //     (acc, book) => (book.author === root.name ? acc + 1 : acc),
      //     0
      //   )
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith("Bearer ")) {
      const userToken = jwt.verify(auth.substring(7), process.env.SECRET)
      const curUser = await User.findById(userToken.id)
      return { curUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
