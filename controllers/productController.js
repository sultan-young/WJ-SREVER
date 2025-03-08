import md5 from "md5";
import Product from "../models/Product.js";
import APIFeatures from "../utils/apiFeatures.js";
import AppError from "../utils/appError.js";
import axios from "axios";
import { ROLE } from "../constant/role.js";
import Supplier from "../models/Supplier.js";

export const createProduct = async (req, res, next) => {
  try {
    // 自动关联供应商（供应商用户）
    if (req.user.role === "supplier") {
      req.body.suppliers = [req.user.id];
    }

    const newProduct = await Product.create(req.body);

    return res.success(newProduct);
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { role, _id } = req.userInfo;
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      // .limitFields()
      .paginate();

    // 供应商只能查看自己的商品
    if (role === ROLE.SUPPLIER) {
      features.query = features.query.find({ _id });
    }

    const products = await features.query;

    return res.success(products);
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req, res, next) => {
  /**
   * Description placeholder
   *
   * @type {0|1} 0代表普通搜索，支持商品名称，所属手工艺人; SKU 1代表标签搜索
   */
  // TODO: type区分
  const { type, content = "" } = req.body;
  console.log(content, type, "content");

  // 如果输入了 供应商名称， 应该使用供应商名称去模糊匹配出对应的供应商id，并使用供应商id进行精准匹配
  try {
    let filterSupplierIds = [];

    // 使用搜索的内容去模糊查询是否有包含的供应商。如果有，则将所有的供应商id取出来供之后进行查询
    if (content) {
      const supplierFeatures = await new APIFeatures(
        Supplier.find({
          name: { $regex: content, $options: "i" },
        })
      ).query;
      filterSupplierIds = supplierFeatures.map((item) => item._id);
      console.log(filterSupplierIds, supplierFeatures, "supplierFeatures");
    }

    const productFeatures = new APIFeatures(
      Product.find({
        $or: [
          { sku: { $regex: content, $options: "i" } }, // 'i' 表示忽略大小写
          { nameCN: { $regex: content, $options: "i" } },
          ...(filterSupplierIds.length
            ? [{ suppliers: { $in: filterSupplierIds } }]
            : []),
        ],
      }),
      req.query
    )
      .filter()
      .sort()
      // .limitFields()
      .paginate();

    const products = await productFeatures.query;

    return res.success(products);
  } catch (err) {
    next(err);
  }
};

export const getUploadProductImageSign = async (req, res, next) => {
  const ts = Date.now();
  const sign = md5(`${superbedUserId}-${superbedUserToken}-${ts}`);
  return res.success({
    sign: sign,
    id: superbedUserId,
    ts,
  });
};

const superbedUserToken = "3e4a28623c31448ba051ea446b0f7d88";
const superbedUserId = "145566";
const deleteProductImageServer = async (ids) => {
  const result = await axios.post("https://api.superbed.cn/delete", {
    token: superbedUserToken,
    ids,
  });
  return result;
};

export const deleteProductImage = async (req, res, next) => {
  const result = await deleteProductImageServer(req.body.ids);
  return res.success(result.data);
};

export const updateProduct = async (req, res, next) => {
  const { id } = req.body;
  try {
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new AppError("找不到该商品", 404));
    }

    return res.success(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  const { id } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError("找不到该商品", 404));
    }

    // 静默删除图片（不阻塞主流程）
    const deleteImagesSilently = async () => {
      const picturebedIds = (product.images || []).map(
        (item) => item.picturebedId
      );
      await deleteProductImageServer(picturebedIds).catch(() => {}); // 静默失败
    };
    deleteImagesSilently();

    await product.deleteOne();

    return res.success(true);
  } catch (err) {
    next(err);
  }
};
