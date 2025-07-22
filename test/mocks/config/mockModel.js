export default class MockModel {
  constructor(modelName) {
    this.model = modelName;
    this.storage = sharedStorage;
  }

  create(doc) {
    const created = {
      _id: doc._id ? doc._id : this.storage[this.model].length,
      ...doc,
    };

    this.storage[this.model].push(created);
    return created;
  }

  find(query) {
    return this.storage[this.model].filter((item) =>
      Object.entries(query).every(([key, value]) => {
        if (typeof value === "object" && value !== null && "$in" in value) {
          return value["$in"].includes(item[key]);
        }
        return item[key] === value;
      })
    );
  }

  findOne(query) {
    return this.storage[this.model].find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );
  }

  findById(id) {
    return this.storage[this.model].find((item) => item._id === id) || null;
  }

  findByIdAndUpdate(id, updates, options = {}) {
    const items = this.storage[this.model];
    const index = items.findIndex((item) => item._id === id);
    if (index === -1) return null;

    const updated = { ...items[index], ...updates };
    items[index] = updated;

    return options.new ? updated : items[index];
  }

  findByIdAndDelete(id) {
    const items = this.storage[this.model];
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

const sharedStorage = {
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
