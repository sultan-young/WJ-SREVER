import md5 from "md5";
import Product from "../../models/Product/Product.js";
import APIFeatures from "../../utils/apiFeatures.js";
import AppError from "../../utils/appError.js";
import axios from "axios";
import { ROLE } from "../../constant/role.js";
import Supplier from "../../models/Supplier.js";
import { incrementStringNumber } from "../../utils/number.js";
import {
  enhanceGroupProducts,
  enhanceChildProducts,
} from "../../services/Product/productEnhancer.js";
import { updateProductService } from "../../services/Product/updateProduct.js";
import { getNextProductSkuIndex } from "../../services/Counter/getProductSku.js";

export const createProduct = async (req, res, next) => {
  const { category, children, isGroup } = req.body;

  try {
    let productDataPO = {
      ...req.body,
      declaredPrice: req.body.salePriceUSD,
      status: 0,
    };
    // 自动关联供应商（供应商用户）
    if (req.user.role === "supplier") {
      productDataPO.suppliers = [req.user.id];
    }

    // 找到同类产品的上个index
    const nextSkuIndex = await getNextProductSkuIndex();
    productDataPO.sku = `${category}-${nextSkuIndex}`;

    let newProduct = [];

    if (isGroup || children?.length) {
      newProduct = await Product.createWithGroup(productDataPO);
    } else {
      // TODO: 接口报错后仍创建了订单
      newProduct = await Product.create(productDataPO);
    }

    return res.success(newProduct);
  } catch (err) {
    next(err);
  }
};

// 获取商品列表
export const getProducts = async (req, res, next) => {
  try {
    const {
      queryParams = {
        pageNo: 1,
        pageSize: 10,
      },
    } = req.body;
    const { role, _id } = req.userInfo;

    const query = {
      $or: [
        { isGroup: true },
        { isGroup: { $exists: false } }, // 历史数据没有isGroup, 它们都为普通的商品
        {
          $and: [
            { isGroup: false }, // 子商品的isGroup为false，并且没有parentGroupId
            { parentGroupId: { $exists: false } },
          ],
        },
      ],
    };

    // TODO: 已知问题，没有防查询注入
    const features = new APIFeatures(
      Product.find(query).sort({ _id: -1 }),
      queryParams
    )
      .filter()
      .sort()
      // .limitFields()
      .paginate();

    // 供应商只能查看自己的商品
    // TODO: 这里存在已知问题，后续修复
    if (role === ROLE.SUPPLIER) {
      features.query = features.query.and([{ supplierId: _id }]);
    }

    const [products, total] = await Promise.all([
      features.query,
      Product.countDocuments(features.baseQuery.getFilter()),
    ]);

    // TODO: 这里似乎不应该对子进行增强，因为上边已经过滤掉子商品了。
    const enhancedChildProducts = await enhanceChildProducts(products, Product);
    const enhancedGroupProducts = await enhanceGroupProducts(
      enhancedChildProducts,
      Product
    );

    return res.success(enhancedGroupProducts, 200, {
      pagination: {
        ...queryParams,
        total,
      },
    });
  } catch (err) {
    next(err);
  }
};
export const searchProducts = async (req, res, next) => {
  /**
   * Description placeholder
   *
   * @type {0|1|9}
   * 0 代表普通搜索，支持商品名称，所属供应商名称, SKU
   * 1 代表标签搜索
   * 9 代表供应商id搜索
   */
  const { queryParams = {}, pageNo, pageSize } = req.body;
  let { type, content = "" } = queryParams;

  // 进行转义，防止正则导致报错
  content = content.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const paginationParams = {
    pageNo,
    pageSize,
  };

  // 如果输入了 供应商名称， 应该使用供应商名称去模糊匹配出对应的供应商id，并使用供应商id进行精准匹配
  try {
    let products = [];

    switch (type) {
      case 0:
        products = await searchWithType0(content, paginationParams);
        break;
      case 1:
        products = await searchWithType1(content, paginationParams);
        break;
      case 9:
        products = await searchWithType9(content, paginationParams);
        break;
    }

    const enhancedChildProducts = await enhanceChildProducts(products, Product);
    const enhancedGroupProducts = await enhanceGroupProducts(
      enhancedChildProducts,
      Product
    );

    return res.success(enhancedGroupProducts);
  } catch (err) {
    next(err);
  }
};

async function searchWithType0(content, { pageNo, pageSize }) {
  let filterSupplierIds = [];
  // 使用搜索的内容去模糊查询是否有包含的供应商。如果有，则将所有的供应商id取出来供之后进行查询
  if (content) {
    const supplierFeatures = await new APIFeatures(
      Supplier.find({
        name: { $regex: content, $options: "i" },
      })
    ).query;
    filterSupplierIds = supplierFeatures.map((item) => item._id);
  }

  const productFeatures = new APIFeatures(
    Product.find({
      $or: [
        { sku: { $regex: content, $options: "i" } }, // 'i' 表示忽略大小写
        { nameCn: { $regex: content, $options: "i" } },
        ...(filterSupplierIds.length
          ? [{ suppliers: { $in: filterSupplierIds } }]
          : []),
      ],
    }),
    {
      pageNo,
      pageSize,
    }
  )
    .filter()
    .sort()
    // .limitFields()
    .paginate();
  let products = await productFeatures.query;
  return products;
}

async function searchWithType1(content, { pageNo, pageSize }) {
  const baseFilter = content ? { tags: [content] } : {};
  const productFeatures = new APIFeatures(Product.find(baseFilter), {
    pageNo,
    pageSize,
  })
    .filter()
    .sort()
    // .limitFields()
    .paginate();
  const products = await productFeatures.query;
  return products;
}

async function searchWithType9(content, { pageNo, pageSize }) {
  const productFeatures = new APIFeatures(
    Product.find({
      $or: [{ suppliers: { $in: content } }],
    }),
    {
      pageNo,
      pageSize,
    }
  )
    .filter()
    .sort()
    // .limitFields()
    .paginate();
  let products = await productFeatures.query;
  return products;
}

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

// 删除商品图片
export const deleteProductImage = async (req, res, next) => {
  const result = await deleteProductImageServer(req.body.ids);
  return res.success(result.data);
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await updateProductService(req.body);

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

    if (product.isGroup) {
      const result = await Product.deleteMany({
        _id: { $in: product.children || [] },
      });
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

// 批量更新库存通过sku
export const batchUpdateStockQuantityBySku = async (req, res, next) => {
  /**
   * content 一段字符串类似：
   * US-KW0101 * 2
   * SP-KW0156 * 1
   * SP-KW0050 * 3
   * @param { type } Number(0|1) 0代表减少, 1代表增加
   */
  const { content = "", type } = req.body;
  const skuObject = content
    .split("\n") // 按行分割
    .map((line) => line.trim()) // 去除每行首尾空格
    .filter((line) => line) // 过滤空行
    .map((line) => {
      // 用正则分割SKU和数量
      const [sku, count] = line.split(/\s*\*\s*/);
      return {
        sku: sku.trim(),
        count: parseInt(count, 10) || 0,
      };
    });
};
