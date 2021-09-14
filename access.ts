// At it's simplest Access control function returns a bool value depending on the users session
import { permissionsList } from './schemas/fields';
import { ListAccessArgs } from './types';

export function isSignedIn({ session }: ListAccessArgs) {
  // !! coerce as bool. if session is undefined it will return false
  return !!session;
}

// Permission based function
// in fields.ts (line 35) we have exported all the Permissionsfields in an array like this ['key, 'value']. so we can take those arrays map it and create an object for each one of the permissions.
const generatedPermissions = Object.fromEntries(
  permissionsList.map((permission) => [
    permission,
    function ({ session }: ListAccessArgs) {
      return !!session?.data.role?.[permission];
    },
  ])
);

// Permissions checks if someone meets a criteria - yes or no
export const permissions = {
  ...generatedPermissions,
  // We can do like this but no very fancy code, therefore check above
  // canManageProducts({ session }:ListAccessArgs) {
  //   return session?.data.role?.canManageProducts;
  // },
  //   canSeeOtherUsers({ session }:ListAccessArgs) {
  //     return session?.data.role?.canSeeOtherUsers;
  //   },
  //   canManageUsers({ session }:ListAccessArgs) {
  //     return session?.data.role?.canManageUsers;
  //   },
  //   canManageRoles({ session }:ListAccessArgs) {
  //     return session?.data.role?.canManageRoles;
  //   },
  //   canManageCart({ session }:ListAccessArgs) {
  //     return session?.data.role?.canManageCart;
  //   },
  //   canManageOrders({ session }:ListAccessArgs) {
  //     return session?.data.role?.canManageOrders;
  //   },
};

// Rule based function
// Rules can return a bool or a filter which limits which products they can CRUD
export const rules = {
  canManageProducts({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. do they have the permission of canManageProducts
    if (permissions.canManageProducts({ session })) {
      return true;
    }
    // if not do they own this item? (where filter that return a bool)
    return { user: { id: session.itemId } };
  },
  canReadProducts({ session }: ListAccessArgs) {
    if (permissions.canManageProducts({ session })) {
      return true; // they can read everything
    }
    // they should only see products with Available status
    return { status: 'AVAILABLE' };
  },
  canOrder({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. do they have the permission of canManageCart
    if (permissions.canManageCart({ session })) {
      return true;
    }
    // if not do they own this item? (where filter that return a bool)
    return { user: { id: session.itemId } };
  },
  canManageOrderItems({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    if (permissions.canManageCart({ session })) {
      return true;
    }
    return { order: { user: { id: session.itemId } } };
  },
  canManageUsers({ session }: ListAccessArgs) {
    if (!isSignedIn({ session })) {
      return false;
    }
    // 1. do they have the permission of canManageUsers
    if (permissions.canManageUsers({ session })) {
      return true;
    }
    // otherwise they can only update themselves
    return { id: session.itemId };
  },
};
