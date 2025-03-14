import EtsyOrder from "../../models/EtsyOrder.js";
import Product from "../../models/Product/Product.js";
import { exportToExcel } from "./export.js";

export const createYwOrder = async (req, res, next) => {
  try {
    const { orderList = []} = req.body;

    const productIdentifiers = orderList.flatMap(order =>
      order.products.map(p => p.product_identifier)
    );

    // 查询匹配的商品
    const products = await Product.find({
      sku: { $in: productIdentifiers }
    }).select('sku nameCn nameEn declaredPrice listingLink').lean();

    // 创建商品映射
    const productMap = new Map(products.map(p => [p.sku, p]));

    // 合并到订单的 products 中
    orderList.forEach(order => {
      order.products.forEach(product => {
        const matchedProduct = productMap.get(product.product_identifier);
        if (matchedProduct) {
          product.nameCn = matchedProduct.nameCn;
          product.nameEn = matchedProduct.nameEn;
          product.declaredPrice = matchedProduct.declaredPrice;
          product.listingLink = matchedProduct.listingLink;
        }
      });
    });
    
    const result = exportToExcel(orderList);


    // TODO: 生成订单时候进行校验id，如果id已经存在，则跳过当前订单
    // const newSupplier = await EtsyOrder.create(orderList);
    res.status(200).json({
      status: "success",
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
