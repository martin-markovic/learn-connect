class MockDatabase {
  constructor() {
    this.data = { users: [], quizzes: [] };
  }

  find(collection, query) {
    return this.data[collection].filter((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
  }

  findOne(collection, query) {
    return this.data[collection].find((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
  }

  insertOne(collection, newItem) {
    this.data[collection].push(newItem);
    return newItem;
  }

  updateOne(collection, query, update) {
    const item = this.findOne(collection, query);
    if (item) {
      Object.assign(item, update);
    }
    return item;
  }

  deleteOne(collection, query) {
    const index = this.data[collection].findIndex((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
    if (index > -1) {
      return this.data[collection].splice(index, 1);
    }
    return null;
  }
}

const testDB = new MockDatabase();
export default testDB;
