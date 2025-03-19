import mongoose from "mongoose";

// 深度比较两个值是否相等
function deepCompare(a, b) {
  // 处理 ObjectId 和字符串的转换比较
  if (isIdEqual(a, b)) return true;

  // 处理日期对象的比较
  if (isDateEqual(a, b)) return true;

  // 处理数组比较
  if (Array.isArray(a) && Array.isArray(b)) {
    return areArraysEqual(a, b);
  }

  // 处理对象比较
  if (isPlainObject(a) && isPlainObject(b)) {
    return areObjectsEqual(a, b);
  }

  // 其他类型直接比较
  return a === b;
}

// 判断是否为纯对象
function isPlainObject(obj) {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

// 判断 ID（字符串和 ObjectId）是否相等
function isIdEqual(a, b) {
  // 统一转换为字符串比较
  const aStr = a instanceof mongoose.Types.ObjectId ? a.toString() : a;
  const bStr = b instanceof mongoose.Types.ObjectId ? b.toString() : b;
  return aStr === bStr;
}

// 判断日期是否相等
function isDateEqual(a, b) {
  const aDate = a instanceof Date ? a.getTime() : NaN;
  const bDate = b instanceof Date ? b.getTime() : NaN;
  return aDate === bDate;
}

// 深度比较数组
function areArraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!deepCompare(a[i], b[i])) return false;
  }
  return true;
}

// 深度比较对象
function areObjectsEqual(a, b) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  // 检查键的数量是否相同
  if (aKeys.length !== bKeys.length) return false;

  // 递归检查每个键值对
  for (const key of aKeys) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepCompare(a[key], b[key])) return false;
  }
  return true;
}

// 生成更新对象
export function generateUpdate(existingDoc, updateData, protectedFields = []) {
  const existingData = existingDoc.toObject({ versionKey: false });
  const updateFields = {};

  // 遍历前端传递的更新对象
  for (const key in updateData) {
    // 保护字段检查
    if (protectedFields.includes(key)) {
        console.warn(`[Protected Field] ${key} 被跳过更新`);
        continue;
      }

    if (Object.prototype.hasOwnProperty.call(existingData, key)) {
      const newValue = updateData[key];
      const oldValue = existingData[key];

      // 深度比较新旧值
      if (!deepCompare(newValue, oldValue)) {
        updateFields[key] = newValue;
      }
    }
  }

  return updateFields;
}