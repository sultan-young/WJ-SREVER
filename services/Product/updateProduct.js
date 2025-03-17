import mongoose from "mongoose";
import Product from "../../models/Product/Product.js";

const ProtectedFields = [
  "children",
  "createdAt",
  "id",
  "isGroup",
  "parentGroupId",
  "sku",
  "stock",
  "variantSerial",
];

const removeProductEmptyValues = (obj, excludes = []) => {
  // 处理非对象输入
  if (typeof obj !== "object" || obj === null) {
    return {};
  }

  // 创建排除集合
  const excludeSet = new Set(Array.isArray(excludes) ? excludes : []);

  // 空值判断器
  const isEmpty = (value) => {
    return (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    );
  };

  return Object.entries(obj).reduce((acc, [key, value]) => {
    // 保留逻辑：在排除列表 或 非空值
    if (excludeSet.has(key) || !isEmpty(value)) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

export const updateProductService = async (productData) => {

  // 分类无法更改
  delete productData.category;
  console.log(0)

  const { id, isGroup, children: enhancedChildren = [] } = productData;

  // 如果有子商品，先更新子商品
  if (isGroup) {
    // 更新子商品时候，先剔除子商品中的空数据，目的是为了让子商品后续仍然可以进行数据继承
    const baseChildren = enhancedChildren.map((child) =>
      removeProductEmptyValues(child, ProtectedFields)
    );

    // 查找是否有需要删除的id
    const productModel = await Product.findById(id);
    const rawChildrenIds = productModel.children.map(id => id.toString())
    const currentChildrenIds = baseChildren.map((child) => child.id).filter(item => item);
    // 比对出那些子商品被删掉了
    const deletedChildrenIds = rawChildrenIds.filter(
      (item) => !currentChildrenIds.includes(item)
    );
    console.log({rawChildrenIds, currentChildrenIds, deletedChildrenIds})
    // 分离更新，删除和新增操作
    // 如果这条数据数据中没有id，则为新增
    // 如果这条数据中有id，则为修改
    // 如果最终处理完毕后的id中和 组商品中寸的id进行比对。如果没有，则为删除。
    const operations = [];
    baseChildren.forEach((baseChildProduct) => {
      // 如果携带了id，则为修改
      if (baseChildProduct.id) {
        // 更新操作：移除_id避免被修改，其他字段通过$set更新
        const { id, ...updateData } = baseChildProduct;
        operations.push({
          updateOne: {
            filter: { _id: id }, // 明确转换_id为ObjectId
            update: { $set: updateData },
          },
        });
      }
      // 未携带id为新增
      if (!baseChildProduct.id) {
        // 新增操作：直接插入文档（自动生成_id）
        operations.push({
          insertOne: {
            document: {
              ...baseChildProduct,
              sku: productData.sku + "-" + baseChildProduct.variantSerial,
              parentGroupId: productModel.id,
            },
          },
        });
      }
    });

    // 找是否存在删除操作
    if (deletedChildrenIds.length) {
        deletedChildrenIds.forEach((id) => {
          operations.push({
            deleteOne: {
              filter: { _id: id },
            },
          });
        });
      }

    // 执行批量写入
    const result = await Product.bulkWrite(operations);
    console.log(result, 'result')

    const insertedIds = Object.values(result.insertedIds) || [];
    const deletedIds = result.deletedCount > 0 ? deletedChildrenIds : [];

    // 给 商品组更新 children字段
    productData.children = [...(productModel.children || []).filter(id => !deletedIds.includes(id)), ...insertedIds];
    console.log(productData.children, deletedIds, insertedIds, 'productData.children ')
  }

  const product = await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true,
  });

  return product;
};
