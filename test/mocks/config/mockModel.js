export default class MockModel {
  constructor(modelName) {
    this.model = modelName;
    this.storage = sharedStorage;
  }

  async create(doc) {
    const created = {
      _id: String(doc._id ? doc._id : this.storage[this.model].length + 1),
      ...doc,
    };

    this.storage[this.model].push(created);
    return created;
  }

  find(query) {
    // monkey patch to allow chaining populate() method
    if ("$or" in query && this.model === "friends") {
      const result = this.storage[this.model];
      return {
        populate(...args) {
          return {
            populate() {
              return result;
            },
          };
        },
      };
    }

    const result = this.storage[this.model].filter((item) =>
      Object.entries(query).every(([key, value]) => {
        if (typeof value === "object" && value !== null && "$in" in value) {
          return value["$in"].includes(item[key]);
        }
        return item[key] === value;
      })
    );

    return this.handleSelect(result);
  }

  async findOne(query) {
    const result = this.storage[this.model].find((item) =>
      Object.keys(query).every((key) => item[key] === query[key])
    );

    return this.handleSelect(result);
  }

  async findById(id) {
    const result =
      this.storage[this.model].find((item) => item._id === id) || null;

    return this.handleSelect(result);
  }

  findByIdAndUpdate(id, updates, options = {}) {
    const items = this.storage[this.model];

    const itemFound = items.find((item) => item._id === id);

    const index = items.indexOf(itemFound);

    if (index === -1) return null;

    const updated = { ...items[index], ...updates };
    items[index] = updated;

    return this.handleSelect(options.new ? updated : items[index]);
  }

  async findByIdAndDelete(id) {
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

  handleSelect(result) {
    let projectedResult = result;

    const wrapper = {
      select(fields) {
        const fieldList = fields.split(" ").filter(Boolean);

        const includeFields = new Set();
        const excludeFields = new Set();

        for (const field of fieldList) {
          if (field.startsWith("-")) {
            excludeFields.add(field.slice(1));
          } else {
            includeFields.add(field);
          }
        }

        const project = (doc) => {
          const projected = {};

          if (includeFields.size) {
            for (const field of includeFields) {
              if (field in doc) projected[field] = doc[field];
            }
          } else {
            for (const key in doc) {
              if (!excludeFields.has(key)) {
                projected[key] = doc[key];
              }
            }
          }

          return projected;
        };

        if (Array.isArray(result)) {
          projectedResult = result.map(project);
        } else if (result && typeof result === "object") {
          projectedResult = project(result);
        }

        return wrapper;
      },

      then(resolve, reject) {
        return Promise.resolve(projectedResult).then(resolve, reject);
      },
    };

    return wrapper;
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
