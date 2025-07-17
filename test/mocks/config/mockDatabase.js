export class MockDatabase {
  constructor() {
    this.storage = {
      users: [],
      quizzes: [],
      exams: [],
      scores: [],
      conversations: [],
      chats: [],
      classrooms: [],
      friends: [],
      notifications: [],
    };
  }

  create(collection, doc) {
    const created = { ...doc };
    this.storage[collection].push(created);
    return created;
  }

  find(collection, query) {
    return this.storage[collection].filter((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );
  }

  findOne(collection, query) {
    return this.storage[collection].find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );
  }

  findById(collection, id) {
    return this.storage[collection].find((item) => item._id === id) || null;
  }

  findByIdAndUpdate(collection, id, updates, options = {}) {
    const items = this.storage[collection];
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const updated = { ...items[index], ...updates };
    items[index] = updated;

    return options.new ? updated : items[index];
  }

  findByIdAndDelete(collection, id) {
    const items = this.storage[collection];
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const [deleted] = items.splice(index, 1);
    return deleted;
  }

  cleanupAll() {
    for (const key in this.storage) {
      this.storage[key] = [];
    }
  }
}
