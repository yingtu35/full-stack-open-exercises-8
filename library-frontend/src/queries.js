import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
  query getAuthors {
    allAuthors {
      name
      id
      born
      bookCount
    }
  }
`

export const ALL_BOOKS = gql`
  query getBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      title
      published
      author
      id
      genres
    }
  }
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
      title
      published
      author
      id
      genres
    }
  }
`

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      id
      born
      bookCount
    }
  }
`
