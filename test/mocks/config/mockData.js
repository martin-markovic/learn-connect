export default class MockData {
  constructor() {
    this.mockUsers = [
      {
        _id: "1",
        name: "John Doe",
        email: "johndoe@gmail.com",
        password: "password123",
        password2: "password123",
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huZG9lQGdtYWlsLmNvbSJ9.dummySignature",
        avatar: null,
        online: true,
        classrooms: [
          {
            _id: "1",
          },
        ],
      },
      {
        _id: "2",
        name: "Jane Doe",
        email: "janedoe@gmail.com",
        password: "password123",
        password2: "password123",
        token: null,
        avatar: null,
        online: false,
        classrooms: [{ _id: "2" }],
      },
      {
        _id: "3",
        name: "Bob Mock",
        email: "bobmock@gmail.com",
        password: "password123",
        password2: "password123",
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huZG9lQGdtYWlsLmNvbSJ9.dummySignatur0",
        avatar: null,
        online: false,
        classrooms: [{ _id: "2" }],
      },
    ];

    this.mockQuizzes = [
      {
        _id: "1",
        question: "What is the capital of France?",
        choices: ["Berlin", "London", "Amsterdam"],
        answer: "Paris",
      },
      {
        _id: "2",
        question: "What is the capital of Germany?",
        choices: ["Paris", "London", "Amsterdam"],
        answer: "Berlin",
      },
    ];

    this.mockClassrooms = [
      {
        _id: "1",
        name: "Mathematics 101",
        subject: "Mathematics",
        limit: 30,
        students: [this.mockUsers[0]._id, this.mockUsers[1]._id],
        quizzes: [],
      },
      {
        _id: "2",
        name: "Mathematics 101",
        subject: "Mathematics",
        limit: 30,
        students: [this.mockUsers[1]._id],
        quizzes: [],
      },
    ];
  }
}
