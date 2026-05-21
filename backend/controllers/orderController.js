const prisma = require('../config/prisma');
const redis = require('../config/redis');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendEmail, sendWhatsApp } = require('../services/communicationService');

// @desc    Create new order
// @route   POST /api/orders
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
      return res.status(400).json({ message: 'No order items' });
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalPrice: Number(totalPrice),
        paymentMethod,
        shippingAddress: {
          create: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country
          }
        },
        orderItems: {
          create: orderItems.map((item) => ({
            productId: item.productId || item._id || item.product,
            qty: item.qty,
            price: Number(item.price),
            size: item.size
          }))
        }
      },
      include: { orderItems: true, shippingAddress: true }
    });

    let razorpayOrderId = `order_mock_${order.id}`; 
    
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'placeholder') {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(Number(totalPrice) * 100),
            currency: "INR",
            receipt: order.id,
        };

        try {
            const rzpOrder = await instance.orders.create(options);
            razorpayOrderId = rzpOrder.id;
            
            await prisma.order.update({
              where: { id: order.id },
              data: { razorpayOrderId }
            });
        } catch (rzpErr) {
            console.error("Razorpay Error:", rzpErr);
        }
    }

    res.status(201).json({ ...order, _id: order.id, razorpayOrderId });
  } catch (error) {
    console.error('Order Creation Error:', error);
    res.status(500).json({ message: 'Order Creation Failed', error: error.message });
  }
};

// @desc    Update order to paid (Verify Signature & Atomic Transaction)
// @route   POST /api/orders/:id/pay
const updateOrderToPaid = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, paymentMethod } = req.body;
  
  try {
    const order = await prisma.order.findUnique({ 
        where: { id: req.params.id },
        include: { orderItems: true } 
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (paymentMethod && (paymentMethod === 'Cash' || paymentMethod === 'UPI')) {
      const updatedOrder = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentMethod,
          razorpayPaymentId: `manual_${Date.now()}`
        }
      });

      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'ORDER_PAID',
          targetDocument: updatedOrder.id,
          details: `Order ${updatedOrder.id} manually marked as paid via ${paymentMethod}`
        }
      });

      return res.json({ ...updatedOrder, _id: updatedOrder.id });
    }

    // Razorpay Verification
    if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'placeholder') {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
            
        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }
    }

    // ATOMIC TRANSACTION: Deduct stock safely
    await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
            const sizeRecord = await tx.productSize.findUnique({
                where: { productId_size: { productId: item.productId, size: item.size } }
            });
            
            if (!sizeRecord || sizeRecord.quantity < item.qty) {
                throw new Error(`Out of stock for size ${item.size}. Order Rolled Back.`);
            }

            await tx.productSize.update({
                where: { id: sizeRecord.id },
                data: { quantity: { decrement: item.qty } }
            });
        }

        await tx.order.update({
            where: { id: req.params.id },
            data: {
                isPaid: true,
                paidAt: new Date(),
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            }
        });

        await tx.adminLog.create({
            data: {
                adminId: req.user.id,
                actionType: 'ORDER_PAID',
                targetDocument: order.id,
                details: `Order ${order.id} paid via Razorpay. Stock deducted atomically.`
            }
        });
    });

    if (redis) await redis.flushdb();

    const finalOrder = await prisma.order.findUnique({ 
        where: { id: req.params.id },
        include: { user: { select: { name: true, email: true, phone: true } } }
    });
    
    // Order Confirmation Blast (Email + WhatsApp)
    await sendEmail({
      to: finalOrder.user.email,
      subject: `Order Confirmation - #${finalOrder.id}`,
      html: `<h1>Thank you for your order!</h1><p>Your payment of ₹${finalOrder.totalPrice} was successful.</p><p>We are processing your Kicks order right now.</p>`
    });
    
    if (finalOrder.user.phone) {
       await sendWhatsApp({ 
         phone: finalOrder.user.phone, 
         message: `Hi ${finalOrder.user.name}, your Kicks order (#${finalOrder.id}) for ₹${finalOrder.totalPrice} is confirmed! 👟` 
       });
    }
    
    // Notify Admin via Socket (Real-time)
    const io = req.app.get('socketio');
    if (io) io.emit('new_order_placed', { orderId: finalOrder.id, amount: finalOrder.totalPrice });

    res.json({ ...finalOrder, _id: finalOrder.id });
  } catch (error) {
    console.error("Payment Processing Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  const orders = await prisma.order.findMany({ 
    where: { userId: req.user.id },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(orders.map(o => ({
    ...o,
    _id: o.id,
    orderItems: o.orderItems.map(item => ({
      ...item,
      name: item.product?.name || 'Unknown Product',
      image: item.product?.images?.side || ''
    }))
  })));
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
const getOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders.map(o => ({ ...o, _id: o.id })));
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { 
        user: { select: { name: true, email: true } },
        shippingAddress: true,
        orderItems: {
           include: { product: { include: { images: true } } }
        }
      }
    });

    if (order) {
      // Map properties for frontend
      const formattedOrder = {
         ...order,
         _id: order.id,
         orderItems: order.orderItems.map(item => ({
             ...item,
             name: item.product.name,
             image: item.product.images?.side || ''
         }))
      };
      res.json(formattedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  const { status: rawStatus, cancellationNote } = req.body;
  const status = rawStatus?.toUpperCase();
  
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    let updateData = { status };
    if (cancellationNote) updateData.cancellationNote = cancellationNote;
    if (status === 'DELIVERED') {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData
    });

    // RAZORPAY AUTOMATIC REFUND IMPLEMENTATION
    if (status === 'CANCELLED' && order.isPaid && order.razorpayPaymentId && !order.razorpayPaymentId.startsWith('manual_')) {
        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'placeholder') {
            const instance = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET,
            });
            try {
                await instance.payments.refund(order.razorpayPaymentId, {
                    amount: Math.round(order.totalPrice * 100),
                    notes: { reason: "Admin cancelled the order" }
                });
                
                await prisma.adminLog.create({
                    data: {
                        adminId: req.user.id,
                        actionType: 'ORDER_REFUNDED',
                        targetDocument: order.id,
                        details: `Order ${order.id} refunded successfully via Razorpay`
                    }
                });
            } catch (refundErr) {
                console.error("Razorpay Refund Error:", refundErr);
            }
        }
    }

    res.json({ ...updatedOrder, _id: updatedOrder.id });
  } catch(error) {
     res.status(500).json({ message: error.message });
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
