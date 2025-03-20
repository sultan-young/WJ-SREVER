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
    const { content, orderStatus } = queryParams;

    const pipeline = [];

    // 1. 按订单状态筛选（保留原有状态过滤逻辑）
    if (orderStatus) {
      pipeline.push({
        $match: { status: orderStatus }
      });
    }

    // 2. 关联供应商信息
    pipeline.push(
      {
        $lookup: {
          from: "suppliers",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: "$supplier" }
    );

    // 3. 构建模糊搜索条件
    if (content) {
      const searchConditions = [];

      // 订单ID精确查询
      if (mongoose.Types.ObjectId.isValid(content)) {
        searchConditions.push({
          _id: new mongoose.Types.ObjectId(content)
        });
      }

      // 供应商名称模糊查询
      searchConditions.push({
        "supplier.name": { 
          $regex: content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
          $options: "i" 
        }
      });

      // 手机号处理逻辑
      const cleanedPhone = content.replace(/\D/g, "");
      if (cleanedPhone) {
        const phoneConditions = [];
        // 精确匹配
        phoneConditions.push({ "supplier.phone": cleanedPhone });
        // 尾号匹配（当输入为4位时）
        if (cleanedPhone.length === 4) {
          phoneConditions.push({
            "supplier.phone": { $regex: `${cleanedPhone}$` }
          });
        }
        searchConditions.push({ $or: phoneConditions });
      }

      // 组合搜索条件（使用逻辑或）
      pipeline.push({
        $match: {
          $or: searchConditions
        }
      });
    }

    // 4. 后续处理逻辑保持不变
    pipeline.push(
      { $unwind: "$orderList" }, // 展开 orderList 数组
      {
        $lookup: {
          from: "products", // 关联商品集合
          localField: "orderList.id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" }, // 展开商品详情（一对一）
      {
        $addFields: {
          "orderList.images": "$productDetails.images", // 将商品图片添加到订单项
        },
      },
      {
        $group: {
          _id: "$_id", // 按订单 ID 重新分组
          supplierId: { $first: "$supplierId" },
          shippingDate: { $first: "$shippingDate" },
          orderList: { $push: "$orderList" }, // 重组 orderList
          note: { $first: "$note" },
          status: { $first: "$status" },
          createdAt: { $first: "$createdAt" },
          supplier: { $first: "$supplier" }, // 保留供应商信息
        },
      }
    );

    // 6. 字段转换和清理
    pipeline.push(
      {
        $addFields: {
          id: { $toString: "$_id" }, // 将 _id 转换为字符串 id
          "supplier.id": { $toString: "$supplier._id" }, // 转换供应商 ID
        },
      },
      {
        $project: {
          _id: 0, // 排除 MongoDB 默认的 _id
          "supplier._id": 0, // 排除供应商的 _id
        },
      },
      {
        $sort: {
          shippingDate: 1, // 按订单时间升序排序
        },
      }
    );

    // 执行聚合查询
    const orders = await SupplierOrder.aggregate(pipeline);
    return res.success(orders);
  } catch (err) {
    next(err);
  }
};
export const updateOrder = async (req, res, next) => {
  try {
    const { id, supplierId, shippingDate, orderList = [], note } = req.body;
    console.log(shippingDate, 'shippingDate')
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
    } else {
      return res.error("未找到该订单");
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
      res.error("未查询到该订单");
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
