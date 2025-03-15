import mongoose from "mongoose";

const mergeStrategy = {
  excludeFields: [
    "createdAt",
    "updatedAt",
    "isGroup",
    "groupCounter",
    "children",
    "parentGroupId",
    "stock",
  ], // 排除继承的字段
  forceOverride: ["stock"], // 即使子级为空也优先使用子级
  retainParentFields: [""], // 始终保留父级的特定字段
};

function deepMerge(parent, child, strategy) {
  const result = { ...child }; // 初始值为子级数据

  // 合并父级字段（排除策略配置的字段）
  for (const key in parent) {
    if (strategy.excludeFields?.includes(key)) continue;

    // 当子级字段为空时继承父级
    const currentValue = result[key];
    if (currentValue === null || currentValue === undefined || (Array.isArray(currentValue) && currentValue.length === 0)) {
      result[key] = parent[key];
    }
  }

  // 处理强制覆盖字段
  strategy.forceOverride?.forEach((key) => {
    if (child[key] !== undefined) {
      result[key] = child[key];
    }
  });

  // 保留父级特定字段（即使子级存在）
  strategy.retainParentFields?.forEach((key) => {
    if (parent[key] !== undefined) {
      result[key] = parent[key];
    }
  });

  // 特殊处理对象类型的字段（深度合并）
  strategy.deepMergeFields?.forEach((key) => {
    if (typeof parent[key] === "object" && typeof child[key] === "object") {
      result[key] = { ...parent[key], ...child[key] };
    }
  });

  return result;
}


export async function enhanceProducts(products, model) {
  // 获取所有需要查询的父级ID
  const parentGroupIds = [
    ...new Set(
      products
        .filter((p) => p.parentGroupId)
        .map((p) => p.parentGroupId.toString())
    ),
  ];

  if (parentGroupIds.length === 0) return products;

  // 批量查询父级数据
  const parentGroups = await model.find({
      _id: { $in: parentGroupIds },
    })
    .lean();

  // 创建快速查找映射表
  const parentMap = parentGroups.reduce((acc, pg) => {
    acc[pg._id.toString()] = pg;
    return acc;
  }, {});

  // 合并数据逻辑
  return products.map((product) => {
    if (!product.parentGroupId) return product;

    const parent = parentMap[product.parentGroupId.toString()];
    if (!parent) return product;

    const productObj = product.toObject ? product.toObject() : product;

    // 深度合并对象，空值继承逻辑
    return deepMerge(parent, productObj, mergeStrategy);
  });
}
