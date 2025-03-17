// utils/getNextSKU.js

import Counter from "../../models/Counter.js";

async function getNextProductSkuIndex() {
  const result = await Counter.findOneAndUpdate(
    { name: "product_sku" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  // 格式化为4位数，不足补零
  return result.value.toString().padStart(4, "0"); // 如 1 → "0001"
}

export { getNextProductSkuIndex };
