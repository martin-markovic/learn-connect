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
          token: "qwerty1",
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
}

const testDB = new MockDatabase();
export default testDB;
