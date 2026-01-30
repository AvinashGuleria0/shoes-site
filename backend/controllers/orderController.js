const Order = require('../models/Order');
const AdminLog = require('../models/AdminLog');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    } else {
      // 1. Create Order in DB
      const orderItemsWithIds = orderItems.map((item) => ({
        ...item,
        productId: item.productId || item._id || item.product,
      }));

      const order = new Order({
        orderItems: orderItemsWithIds,
        userId: req.user._id,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
      });

      const createdOrder = await order.save();

      // 2. Generate Razorpay Order ID
      let razorpayOrderId = `order_mock_${createdOrder._id}`; 
      
      if (process.env.RAZORPAY_KEY_ID !== 'placeholder') {
          const instance = new Razorpay({
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
          });

          const options = {
              amount: Math.round(totalPrice * 100),
              currency: "INR",
              receipt: createdOrder._id.toString(),
          };

          try {
              const rzpOrder = await instance.orders.create(options);
              razorpayOrderId = rzpOrder.id;
          } catch (rzpErr) {
              console.error("Razorpay Error:", rzpErr);
          }
      }

      res.status(201).json({
          ...createdOrder._doc,
          razorpayOrderId
      });
    }
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Order Creation Failed', error: error.message });
  }
};

// @desc    Update order to paid (Verify Signature)
// @route   POST /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  const order = await Order.findById(req.params.id);

  if (order) {
    // Verify Signature (If not using mock)
    if (process.env.RAZORPAY_KEY_SECRET !== 'placeholder') {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
            
        if (expectedSignature !== razorpay_signature) {
            res.status(400).json({ message: 'Invalid payment signature' });
            return;
        }
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'success',
      update_time: Date.now(),
      email_address: req.user.email,
    };

    const updatedOrder = await order.save();

    // Log Action
    await AdminLog.create({
        adminId: req.user._id, // User placing order acts as actor here
        actionType: 'ORDER_PAID',
        targetDocument: updatedOrder._id.toString(),
        details: `Order ${updatedOrder._id} paid via Razorpay`
    });
    
    // Notify Admin via Socket (Real-time)
    const io = req.app.get('socketio');
    io.emit('new_order_placed', { orderId: updatedOrder._id, amount: updatedOrder.totalPrice });

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user._id });
  res.json(orders);
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('userId', 'id name');
  res.json(orders);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'userId',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status, cancellationNote } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status || order.status;
    if (cancellationNote) order.cancellationNote = cancellationNote;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getMyOrders,
  getOrders,
};
