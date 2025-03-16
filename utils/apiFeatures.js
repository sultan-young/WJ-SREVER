export default class APIFeatures {
    constructor(query, queryParams) {
      this.baseQuery = query;
      this.query = query;
      this.queryParams = queryParams;
    }
  
    filter() {
      const queryObj = { ...this.queryParams };
      const excludedFields = ['pageNo', 'sort', 'pageSize', 'fields'];
      excludedFields.forEach(field => delete queryObj[field]);

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
      
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  
    sort() {
      if (this.queryParams.sort) {
        const sortBy = this.queryParams.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    paginate() {
      const page = this.queryParams.pageNo * 1 || 1;
      const limit = this.queryParams.pageSize * 1 || 100;
      const skip = (page - 1) * limit;
      
      this.query = this.query.skip(skip).limit(limit);
      return this;
    }
  }