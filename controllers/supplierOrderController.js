import SupplierOrder from "../models/SupplierOrder.js";

// 创建订单
export const createOrder = async (req, res, next) => {
  try {
    const { supplierId, shippingDate, orderList = [], note} = req.body;
    const _SupplierOrder = await SupplierOrder.create({
        supplierId,
        shippingDate,
        orderList,
        note
    })
    const order = await _SupplierOrder.populate('supplierId')

    return res.success(order);
  } catch (err) {
    next(err);
  }
};

// 查询订单
export const getOrderList = async (req, res, next) => {
  try {
    const { supplierId } = req.body;
    const _SupplierOrder = await SupplierOrder.create({
        supplierId,
        shippingDate,
        orderList,
        note
    })
    const order = await _SupplierOrder.populate('supplierId')

    return res.success(order);
  } catch (err) {
    next(err);
  }
};

// 删除订单
export const deleteOrder = async (req, res, next) => {
  const { label, value } = req.body;
  try {
    const features = await Shelf.create({
      label,
      value,
    });
    return res.success(features);
  } catch (err) {
    next(err);
  }
};
