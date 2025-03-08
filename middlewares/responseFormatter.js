export const responseFormatter = (req, res, next) => {
  // 封装成功响应方法
  res.success = function (data, statusCode = 200) {
    // ⚠️ 关键点：发送响应后不再调用 next()，否则会触发 "Cannot set headers after they are sent" 错误
    return res.status(statusCode).json({
      status: "success",
      success: true,
      data: data,
    });
  };
  next(); // 👈 核心修复点
};
