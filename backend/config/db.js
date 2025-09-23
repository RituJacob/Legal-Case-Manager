const mongoose = require("mongoose");

class Database {
    constructor() {
        
        if (!Database.instance) {
            this._connect();
            Database.instance = this;
        }
        
        return Database.instance;
    }

    
    async _connect() {
        try {
            if (!process.env.MONGO_URI) {
                console.error("MongoDB connection error: MONGO_URI is not defined.");
                process.exit(1);
            }
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB connected successfully");
        } catch (error) {
            console.error("MongoDB connection error:", error.message);
            process.exit(1);
        }
    }
}


const instance = new Database();


module.exports = instance;
