export const responseFormatter = (req, res, next) => {
  // 封装成功响应方法
  res.success = function (data, statusCode = 200, other) {
    // ⚠️ 关键点：发送响应后不再调用 next()，否则会触发 "Cannot set headers after they are sent" 错误
    return res.status(statusCode).json({
      status: "success",
      success: true,
      data: data,
      ...other
    });
  };
  // 封装失败响应方法
  res.error = function (message, statusCode = 200) {
    // ⚠️ 关键点：发送响应后不再调用 next()，否则会触发 "Cannot set headers after they are sent" 错误
    return res.status(statusCode).json({
      status: "error",
      success: false,
      message: message,
    });
  };
  next(); // 👈 核心修复点
};
