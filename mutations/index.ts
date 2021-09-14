// This file is to create our Own custom mutation (not present in Keystone)

import { graphQLSchemaExtension } from '@keystone-next/keystone/schema';
import addToCart from './addToCart';
import checkout from './checkout';

// We make a fake graphql tagged template literal in order to have the syntax highlighter.
// We just convert the tag recognized by Vscode to a raw string (what is expected)
const gql = String.raw;

export const extendGraphqlSchema = graphQLSchemaExtension({
  // typedefs specifies the diff types of the mutation and what it returns.
  typeDefs: gql`
    type Mutation {
      addToCart(productId: ID): CartItem
      # typescript stuff here after : it's hat's the mutatio, will return
      checkout(token: String!): Order
    }
  `,
  resolvers: {
    Mutation: {
      addToCart,
      checkout,
    },
  },
});
