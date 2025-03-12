export function exportToExcel(data) {
  // Create a CSV string from the data
  const normalHeaders = [
    "订单号",
    "平台交易号",
    "交货仓",
    "产品名称",
    "收件人姓名",
    "收件人电话",
    "收件人邮箱",
    "收件人税号",
    "收件人公司",
    "收件人国家",
    "收件人省/州",
    "收件人城市",
    "收件人邮编",
    "收件人地址",
    "收件人门牌号",
    "销售平台",
    "发件人税号信息",
    "CSP",
    "包装尺寸【长】cm",
    "包装尺寸【宽】cm",
    "包装尺寸【高】cm",
    "收款到账日期",
    "币种类型",
    "是否含电",
    "拣货单信息",
    "IOSS税号",
  ];

  // 获取最长商品长度，动态生成表格表头
  const maxProductLength = data.reduce((prev, current) => {
    return Math.max(prev, current.products?.length)
  }, 1)

  for (let i = 1; i <= maxProductLength; i++) {
    normalHeaders.push(...getTableHeader(i))
  }

  const today = new Date();
  const dateStr = formatDateForOrderNumber(today);
  // Convert data to a worksheet

  const worksheetData = [
    normalHeaders, // Header row
    ...data.map((item, index) => {
      const orderNumber = `YW${dateStr}${String(index + 1).padStart(2, "0")}`;

      // b. Set warehouse and determine product name based on country
      const warehouse = "杭州燕文";
      const countryInChinese = getCountryInChinese(item.country);
      const productName = getProductNameByCountry(item.country);

      // d. Generate random phone number
      const phoneNumber = generateRandomPhoneNumber();

      // k. Set sender tax information based on country
      const senderTaxInfo = getSenderTaxInfo(item.country);

      // o. Set picking list information
      // const pickingListInfo = `${item.product_identifier} - ${item.title}`;

      // 拣货信息
      let pickingListInfo = item.products
        .map((p) => `${p.product_identifier} * ${p.quantity}`)
        .join("; ");
        
        if (item.notes) {
          pickingListInfo += `(${item.notes})`
        }

        const productTableBody = item.products.map(getTableBody).flat()
        
        const TableBody = [
          orderNumber, // 订单号
          "", // 平台交易号
          warehouse, // 交货仓
          productName, // 产品名称
          item.name, // 收件人姓名
          phoneNumber, // 收件人电话
          item.email, // 收件人邮箱
          "", // 收件人税号
          "", // 收件人公司
          countryInChinese, // 收件人国家
          item.state, // 收件人省/州
          item.city, // 收件人城市
          item.zip, // 收件人邮编
          item.first_line, // 收件人地址
          item.second_line, // 收件人门牌号
          "", // 销售平台
          senderTaxInfo, // 发件人税号信息
          "", // CSP
          "1", // 包装尺寸【长】cm
          "1", // 包装尺寸【宽】cm
          "1", // 包装尺寸【高】cm
          "", // 收款到账日期
          "美元", // 币种类型
          "否", // 是否含电
          pickingListInfo, // 拣货单信息
          "", // IOSS税号     
          ...productTableBody   
        ]

      return TableBody;
    }),
  ];

  return worksheetData;
}

function getCountryInChinese(country) {
  const countryMap = {
    "United States": "美国",
    "United Kingdom": "英国",
    France: "法国",
    Germany: "德国",
    // Add more countries as needed
  };

  return countryMap[country] || country;
}

function formatDateForOrderNumber(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

// Helper function to get product name based on country
function getProductNameByCountry(country) {
  switch (country) {
    case "United States":
      return "燕文美国快线-普货";
    case "United Kingdom":
      return "燕文英国YODEL快线-普货";
    case "France":
      return "燕文法国快线-普货";
    case "Germany":
      return "燕文德国快线-普货";
    default:
      return "燕文国际快线-普货";
  }
}

function generateRandomPhoneNumber() {
  const part1 = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const part2 = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const part3 = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${part1}-${part2}-${part3}`;
}

// Helper function to get sender tax information based on country
function getSenderTaxInfo(country) {
  switch (country) {
    case "United States":
      return "";
    case "Germany":
    case "France":
      return "IM3720000224";
    case "United Kingdom":
      return "370 6004 28";
    default:
      return "";
  }
}


const getTableHeader= (index) => {
  return [
    `中文品名${index}`,
    `英文品名${index}`,
    `单票数量${index}`,
    `重量${index}(g)`,
    `申报价值${index}`,
    `商品材质${index}`,
    `商品海关编码${index}`,
    `商品链接${index}`,
    `SKU${index}`,
  ]
};

const getTableBody= (product) => {
  return [
    product.nameCn, //中文品名
    product.nameEn, //英文品名
    product.quantity, //单票数量
    "20", //重量
    product.declaredPrice, //申报价值
    "", //商品材质
    "", //商品海关编码
    product.listingLink, //商品链接
    product.product_identifier, //SKU
  ]
};