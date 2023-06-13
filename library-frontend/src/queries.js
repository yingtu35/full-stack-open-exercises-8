import { gql } from "@apollo/client"

export const AUTHOR_DETAILS = gql`
  fragment authorDetails on Author {
    name
    id
    born
    bookCount
  }
`

export const BOOK_DETAILS = gql`
  fragment bookDetails on Book {
    title
    published
    author {
      ...authorDetails
    }
    id
    genres
  }
  ${AUTHOR_DETAILS}
`

export const USER_DETAILS = gql`
  fragment userDetails on User {
    username
    favoriteGenre
    id
  }
`

export const ALL_AUTHORS = gql`
  query getAuthors {
    allAuthors {
      ...authorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

export const ALL_BOOKS = gql`
  query getBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $publishYear: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $publishYear
      genres: $genres
    ) {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      ...authorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

export const LOGIN = gql`
  mutation userLogin($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
      expiresIn
    }
  }
`

export const CURUSER = gql`
  query currentUser {
    curUser {
      ...userDetails
    }
  }
  ${USER_DETAILS}
`

export const BOOK_ADDED = gql`
  subscription onBookAdded {
    bookAdded {
      ...bookDetails
    }
  }
  ${BOOK_DETAILS}
`
