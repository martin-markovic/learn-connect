class MockDatabase {
  constructor() {
    this.storage = {
      users: [
        {
          id: 1,
          name: "John Doe",
          email: "johndoe@gmail.com",
          password: "password123",
          password2: "password123",
          token: null,
        },
        {
          id: 2,
          name: "Jane Doe",
          email: "janedoe@gmail.com",
          password: "password123",
          password2: "password123",
          token: null,
        },
      ],
      quizzes: [
        {
          id: 1,
          question: "What is the capital of France?",
          choices: ["Berlin", "London", "Amsterdam"],
          answer: "Paris",
        },
        {
          id: 2,
          question: "What is the capital of Germany?",
          choices: ["Paris", "London", "Amsterdam"],
          answer: "Berlin",
        },
      ],
    };
  }

  find(collection, query) {
    return this.storage[collection].filter((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
  }

  findOne(collection, query) {
    return this.storage[collection].find((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
  }

  insertOne(collection, newItem) {
    this.storage[collection].push(newItem);
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
    const index = this.storage[collection].findIndex((item) => {
      return Object.keys(query).every((key) => item[key] === query[key]);
    });
    if (index > -1) {
      return this.storage[collection].splice(index, 1);
    }
    return null;
  }
}

const testDB = new MockDatabase();
export default testDB;
