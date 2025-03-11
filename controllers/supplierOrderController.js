import mongoose from "mongoose";
import SupplierOrder from "../models/SupplierOrder.js";

// 创建订单
export const createOrder = async (req, res, next) => {
  try {
    const { supplierId, shippingDate, orderList = [], note } = req.body;
    const _SupplierOrder = await SupplierOrder.create({
      supplierId,
      shippingDate,
      orderList,
      note,
    });
    const order = await _SupplierOrder.populate("supplierId");

    return res.success(order);
  } catch (err) {
    next(err);
  }
};

// 查询订单
export const getOrderList = async (req, res, next) => {
  try {
    const { queryParams = {}, pageNo, pageSize } = req.body;
    const {
      supplierName,
      supplierPhone,
      orderId,
      orderStatus = 1,
    } = queryParams;

    const conditions = [];

    // 1. 处理订单 ID 精确查询
    if (orderId) {
      if (mongoose.Types.ObjectId.isValid(orderId)) {
        conditions.push({
          _id: new mongoose.Types.ObjectId(orderId),
        });
      } else {
        return res.status(400).json({ error: "无效的订单 ID" });
      }
    }

    // 2. 处理供应商手机号模糊查询
    if (supplierPhone) {
      const cleanedPhone = supplierPhone.replace(/\D/g, ""); // 移除非数字字符
      const phoneConditions = [];

      // 精确匹配条件
      phoneConditions.push({ "supplier.phone": cleanedPhone });

      // 尾号四位匹配条件（仅当清理后为4位时）
      if (cleanedPhone.length === 4) {
        phoneConditions.push({
          "supplier.phone": {
            $regex: new RegExp(`${cleanedPhone}$`, "i"),
          },
        });
      }

      // 组合逻辑：精确匹配或尾号匹配
      conditions.push({ $or: phoneConditions });
    }

    // 3. 处理供应商名称模糊查询
    if (supplierName) {
      conditions.push({
        "supplier.name": { $regex: supplierName, $options: "i" },
      });
    }

    // 构建聚合管道
    const pipeline = [];

    // 优先过滤订单状态
    pipeline.push({
      $match: {
        status: orderStatus,
      },
    });

    // 关联供应商信息
    pipeline.push({
      $lookup: {
        from: "suppliers", // 关联的集合名（自动小写复数化）
        localField: "supplierId",
        foreignField: "_id",
        as: "supplier",
      },
    });

    // 展开关联的供应商数组（一对一关系）
    pipeline.push({ $unwind: "$supplier" });

    // 动态添加查询条件
    if (conditions.length > 0) {
      pipeline.push({
        $match: { $or: conditions }, // 使用 $or 组合条件
      });
    }

    // 执行查询
    const orders = await SupplierOrder.aggregate(pipeline);

    return res.success(orders);
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { id, supplierId, shippingDate, orderList = [], note } = req.body;
    const _SupplierOrder = await SupplierOrder.findByIdAndUpdate(id, {
      supplierId,
      shippingDate,
      orderList,
      note,
    });
    if (!_SupplierOrder) {
      return next(new AppError("找不到该订单", 404));
    }

    return res.success(_SupplierOrder);
  } catch (err) {
    next(err);
  }
};

// 删除订单
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.body;
    const order = await SupplierOrder.findById(id);
    if (order) {
      await order.deleteOne();
    }
    return res.success(true);
  } catch (err) {
    next(err);
  }
};

// 流转订单状态
/**
 *
 * @param {status} req
 * 1=> 正常在制作中的订单
 * 2=> 已发货未收到订单
 * 3=> 已完成订单
 * 4=> 已删除订单
 * @returns
 */
const ORDER_STATUS = {
  IN_PROGRESS: 1, // 正在制作中的订单
  SHIPPED: 2, // 已发货未收到订单
  COMPLETED: 3, // 已完成订单
  DELETED: 4, // 已删除订单
};
// 定义状态流转规则
const STATUS_TRANSITIONS = {
  [ORDER_STATUS.IN_PROGRESS]: [
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.DELETED,
  ],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.DELETED]: [],
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id, status: nextStatus } = req.body;

    const order = await SupplierOrder.findById(id);

    if (!order) {
      res.error('未查询到该订单')
      return;
    }

    // 检查新状态是否合法
    if (STATUS_TRANSITIONS[order.status].includes(nextStatus)) {
      await order.updateOne({ status: nextStatus });
      return res.success(true);
    } else {
      return res.error("当前状态下无法进行该状态流转");
    }
  } catch (err) {
    next(err);
  }
};

// 完成订单
