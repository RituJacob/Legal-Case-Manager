const User = require('../models/User');

class UserRepository {
    
     // Finds a single user by their email address.
    
    findByEmail(email) {
        return User.findOne({ email });
    }

   
     // Find a single user by their ID.
     
    findById(id) {
        return User.findById(id);
    }

    
     // Finds a single user by ID but excludes the password field.
     
    findByIdWithoutPassword(id) {
        return User.findById(id).select('-password');
    }

  
     // Create a new user in the database.
     
    create(userData) {
        return User.create(userData);
    }

    
     // Saves changes to an existig user document.
     
    save(userDocument) {
        return userDocument.save();
    }
}

module.exports = new UserRepository();