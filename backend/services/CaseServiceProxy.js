// services/CaseServiceProxy.js
const CaseService = require('./CaseService');

class CaseServiceProxy {
  constructor(user) {
    this.user = user;
    this.caseService = new CaseService();
  }

  async getCases() {
    console.log(`User ${this.user.id} is fetching their cases`);
    return await this.caseService.getCases(this.user.id);
  }

  async createCase(data) {
    console.log(`User ${this.user.id} is creating a case`);
    return await this.caseService.createCase({ ...data, userId: this.user.id });
  }

  async updateCaseStatus(caseId, status) {
    console.log(`User ${this.user.id} is updating case ${caseId} to ${status}`);
    return await this.caseService.updateCaseStatus(caseId, status);
  }

  async deleteCase(caseId) {
    console.log(`User ${this.user.id} is deleting case ${caseId}`);
    return await this.caseService.deleteCase(caseId);
  }
}

module.exports = CaseServiceProxy;
