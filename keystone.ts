import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { CartItem } from './schemas/CartItem';
import { OrderItem } from './schemas/OrderItem';
import { Order } from './schemas/Order';
import { Role } from './schemas/Role';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { extendGraphqlSchema } from './mutations/index';
import { permissionsList } from './schemas/fields';

const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost/sick-fits';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // how long they stay signed in (session cookie)
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: Add initial roles
  },
  passwordResetLink: {
    async sendToken(args) {
      // console.log(args);
      // send the email
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseUrl,
      // seed
      async onConnect(keystone) {
        console.log('connected to DB --- beep beoop-----');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
    },
    // Keystone refers to data type as 'lists'
    lists: createSchema({
      // schema items go in here
      User,
      Product,
      ProductImage,
      CartItem,
      Order,
      OrderItem,
      Role,
    }),
    extendGraphqlSchema,
    ui: {
      // show UI only for user who pass this test
      isAccessAllowed: ({ session }) =>
        // console.log(session);
        // the bangs permits to coerce as a bool
        !!session?.data,
    },
    // TODO: Add value session here
    session: withItemData(statelessSessions(sessionConfig), {
      // GraphQL query
      User: `id name email role { ${permissionsList.join(' ')} }`,
    }),
  })
);
