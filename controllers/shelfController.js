import Shelf from "../models/Shelf.js";
import APIFeatures from "../utils/apiFeatures.js";

// 获取货架列表
export const getShelfList = async (req, res, next) => {
  try {
    const features = new APIFeatures(Shelf.find());

    const ShelfList = await features.query;

    return res.success(ShelfList);
  } catch (err) {
    next(err);
  }
};

// 增加货架
export const appendShelfList = async (req, res, next) => {
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
