import Shop from "../../models/Shop/shop.js";

export const createShop = async (req, res, next) => {
  try {
    const shop = await Shop.create({
      ...req.body,
    });
    res.success(shop);
  } catch (err) {
    next(err);
  }
};


export const getShopList = async (req, res, next) => {
  try {
    const shop = await Shop.find({
      ...req.body,
    });
    res.success(shop);
  } catch (err) {
    next(err);
  }
};


