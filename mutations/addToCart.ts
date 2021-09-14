import { KeystoneContext } from '@keystone-next/types';
import { CartItemCreateInput } from '../.keystone/schema-types';
import { Session } from '../types';

async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  console.log('Adding to cart');
  // 1. query current user and see if signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('Please Sign in to add product to cart');
  }
  // console.log(sesh);

  // 2. query current user cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: sesh.itemId }, product: { id: productId } },
    resolveFields: 'id, quantity',
  });
  // console.log(allCartItems);

  const [existingCartItem] = allCartItems;

  // 3. check if item added already in cart.
  if (existingCartItem) {
    console.log(
      `item already in cart (q: ${existingCartItem.quantity}), increment quantity`
    );
    console.log(existingCartItem);

    // ..3.A. If yes, add increment cartItem quantity.
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }

  // ..3.B. If no create new cartItem
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
  });
}

export default addToCart;
