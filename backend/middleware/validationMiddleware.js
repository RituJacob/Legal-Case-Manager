const validateCaseCreation = (req, res, next) => {
    const { title, description, category } = req.body;
  
    // Checks if all required fields are present and not empty
    if (!title || !description || !category) {
      // If validation fails, stop the request and send an error response.
      
      return res.status(400).json({ message: 'Title, description and category are required' });
    }
  
    
    next();
  };

/**
 * Middleware to validate that 'newName' field exists in the request body
 * for renamig a file.
 */
const validateRename = (req, res, next) => {
    const { newName } = req.body;

    // 1. Checks if 'newName' is missing, null, or just empty spaces
    if (!newName || newName.trim() === '') {
        // 2. If validation fails, stops the request here and send error.
        
        return res.status(400).json({ message: 'New name is required' });
    }

    // 3. If validation succeeded, call next function in the chain.
    next();
};
  
  module.exports = { validateCaseCreation, validateRename };