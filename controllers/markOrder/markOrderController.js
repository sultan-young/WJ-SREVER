import EtsyOrder from "../../models/EtsyOrder.js";
import Product from "../../models/Product.js";
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


    res.status(201).json({
      status: "success",
      success: true,
    });

    // const newSupplier = await EtsyOrder.create(orderList);
    // res.status(201).json({
    //   status: "success",
    //   success: true,
    //   data: newSupplier,
    // });
  } catch (err) {
    next(err);
  }
};
