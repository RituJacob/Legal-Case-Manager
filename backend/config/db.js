const mongoose = require("mongoose");

class Database {
    constructor() {
        if (!Database.instance) {
            Database.instance = this;
        }
        return Database.instance;
    }

    // Public method to connect to MongoDB
    async connect() {
        try {
            if (!process.env.MONGO_URI) {
                console.error("MongoDB connection error: MONGO_URI is not defined.");
                process.exit(1);
            }

            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            console.log("MongoDB connected successfully");
        } catch (error) {
            console.error("MongoDB connection error:", error.message);
            process.exit(1); // Stop process if DB fails
        }
    }
}

module.exports = new Database();
