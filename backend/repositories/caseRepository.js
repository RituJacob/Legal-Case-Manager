const Case = require('../models/Case');

class CaseRepository {
    /**
     * Finds cases based on the user's role and ID.
     * Encapsulates the complex query logic.
     * @param {object} user - The user object from req.user.
     */
    findForUser(user) {
        const query = {};

        if (user.role === 'Client') {
            query.client = user._id;
        }

        if (user.role === 'Lawyer') {
            query.$or = [
                { lawyer: user._id },
                { lawyer: null, category: user.specialization }
            ];
            
        }

        // The controller doesn't need code about populating or sorting.
        return Case.find(query)
            .populate('client', 'name email')
            .populate('lawyer', 'name email specialization')
            .sort({ createdAt: -1 });
    }
findAll() {
    return Case.find()
      .populate('client', 'name email')
      .populate('lawyer', 'name email specialization')
      .sort({ createdAt: -1 });
  }

    /**
     * Finds each single case by its ID.
     */
    findById(id) {
        return Case.findById(id);
    }

    /**
     * Creates new case in the database.
     * @param {object} caseData - The data for the new case.
     */
    create(caseData) {
        const newCase = new Case(caseData);
        return newCase.save();
    }

    /**
     * Saves changes to existing case document.
     */
    save(caseDocument) {
        return caseDocument.save();
    }

    /**
     * Deletes case by ID.
     */
    deleteById(id) {
        return Case.findByIdAndDelete(id);
    }
}

module.exports = new CaseRepository();