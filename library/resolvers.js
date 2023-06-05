const Author = require("./models/author")
const Book = require("./models/book")
const User = require("./models/user")
const jwt = require("jsonwebtoken")
const { GraphQLError } = require("graphql")

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
    curUser: (root, args, { curUser }) => curUser,
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

module.exports = resolvers
