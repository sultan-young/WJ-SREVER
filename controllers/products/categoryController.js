import ProductCategory from "../../models/ProductCategory.js";
import APIFeatures from "../../utils/apiFeatures.js";

// 获取货架列表
export const getProductCategoryList = async (req, res, next) => {
  try {
    const features = new APIFeatures(ProductCategory.find());

    const ProductCategoryList = await features.query;

    return res.success(ProductCategoryList);
  } catch (err) {
    next(err);
  }
};

// 增加货架
export const appendProductCategoryList = async (req, res, next) => {
  const { label, value } = req.body;
  try {
    const features = await ProductCategory.create({
      label,
      value,
    });
    return res.success(features);
  } catch (err) {
    next(err);
  }
};
