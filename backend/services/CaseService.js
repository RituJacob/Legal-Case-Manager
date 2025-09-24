// services/CaseService.js
const Case = require('../models/Case');

class CaseService {
  async getCases(userId) {
    return await Case.find({ userId });
  }

  async createCase(data) {
    return await Case.create(data);
  }

  async updateCaseStatus(caseId, status) {
    return await Case.findByIdAndUpdate(caseId, { status }, { new: true });
  }

  async deleteCase(caseId) {
    return await Case.findByIdAndDelete(caseId);
  }
}

module.exports = CaseService;
