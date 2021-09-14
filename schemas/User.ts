import { list } from '@keystone-next/keystone/schema';
import { text, password, relationship } from '@keystone-next/fields';
import { permissions, rules } from '../access';

export const User = list({
  // access
  access: {
    create: () => true,
    read: rules.canManageUsers,
    update: rules.canManageUsers,
    // permission is related to role and you neeed the checkboxes, rules is either checkbox or only yourself
    // only people with permission can delete themselves
    // you can't delete yourself
    delete: permissions.canManageUsers,
  },
  ui: {
    hideCreate: (args) => !permissions.canManageUsers(args),
    hideDelete: (args) => !permissions.canManageUsers(args),
  },
  fields: {
    name: text({ isRequired: true }),
    email: text({ isRequired: true, isUnique: true }),
    password: password(),
    //  TODO: add roles, cart and orders
    cart: relationship({
      ref: 'CartItem.user',
      // Allow to have multiple items in cart
      many: true,
      ui: {
        createView: { fieldMode: 'hidden' },
        itemView: { fieldMode: 'read' },
      },
    }),
    role: relationship({
      ref: 'Role.assignedTo',
      access: {
        create: permissions.canManageUsers,
        update: permissions.canManageUsers,
      },
    }),
    orders: relationship({ ref: 'Order.user', many: true }),
    products: relationship({ ref: 'Product.user', many: true }),
  },
});
