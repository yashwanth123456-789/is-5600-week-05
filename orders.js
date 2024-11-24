const cuid = require('cuid');
const db = require('./db');

const Order = db.model('Order', {
  _id: { type: String, default: cuid },
  buyerEmail: { type: String, required: true },
  products: [
    {
      type: String,
      ref: 'Product',
      index: true,
      required: true,
    },
  ],
  status: {
    type: String,
    index: true,
    default: 'CREATED',
    enum: ['CREATED', 'PENDING', 'COMPLETED'],
  },
});

/**
 * List orders
 * @param {object} options
 */
async function list(options = {}) {
  const { offset = 0, limit = 25, productId, status } = options;

  const query = {
    ...(productId && { products: productId }),
    ...(status && { status }),
  };

  return await Order.find(query).sort({ _id: 1 }).skip(offset).limit(limit);
}

/**
 * Get a specific order
 * @param {string} _id
 */
async function get(_id) {
  return await Order.findById(_id).populate('products').exec();
}

/**
 * Create a new order
 * @param {object} fields
 */
async function create(fields) {
  if (!fields.buyerEmail || !fields.products) {
    throw new Error('Missing required fields');
  }

  const order = await new Order(fields).save();
  await order.populate('products');
  return order;
}

/**
 * Edit an existing order
 * @param {string} _id
 * @param {object} changes
 */
async function edit(_id, changes) {
  const order = await Order.findByIdAndUpdate(_id, changes, { new: true }).populate('products');
  if (!order) throw new Error(`Order with id ${_id} not found`);
  return order;
}

/**
 * Delete an existing order
 * @param {string} _id
 */
async function destroy(_id) {
  const order = await Order.findByIdAndDelete(_id);
  if (!order) throw new Error(`Order with id ${_id} not found`);
}

module.exports = {
  create,
  get,
  list,
  edit,
  destroy,
};
