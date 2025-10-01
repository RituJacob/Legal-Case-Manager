const caseRepository = require('./caseRepository');

class CaseRepositoryProxy {
  constructor(user) {
    this.user = user; // Pass user info from req.user
    this.realRepository = caseRepository;
  }

  // Get cases (clients only see their own)
  async findForUser(user) {
    console.log(`[Proxy] Fetching cases for user: ${user._id}`);
    if (this.user.role === 'lawyer') {
      // admins see all
      return this.realRepository.findAll();
    }
    return this.realRepository.findForUser(user);
  }

  // Sort Cases
  async findForUser(user) {
    console.log(`[Proxy] Fetching cases for user: ${user._id}`);
    if (this.user.role === 'lawyer') {
      // admins see all
      return this.realRepository.findAllSortedTitle();
    }
    return this.realRepository.findForUser(user);
  }

  // Create a case (clients + admins allowed)
  async create(caseData) {
    console.log(`[Proxy] Creating case: ${caseData.title}`);
    if (!caseData.title || !caseData.description) {
      throw new Error('Invalid case data');
    }
    return this.realRepository.create(caseData);
  }

  // Update case status
  async updateCaseStatus(id, status) {
    console.log(`[Proxy] Updating case ${id} to status: ${status}`);

    const existingCase = await this.realRepository.findById(id);
    if (!existingCase) {
      throw new Error('Case not found');
    }

    // Only admin can update ANY case
    if (this.user.role !== 'Lawyer') {
      throw new Error('Not authorized to update case status');
    }

    existingCase.status = status;
    return this.realRepository.save(existingCase);
  }

  // Delete case
  async deleteById(id) {
    console.log(`[Proxy] Deleting case ${id}`);

    const existingCase = await this.realRepository.findById(id);
    if (!existingCase) {
      throw new Error('Case not found');
    }

    // Client can only delete their own
    if (existingCase.client.toString() !== this.user._id.toString()) {
      throw new Error('Not authorized to delete this case');
    }

    return this.realRepository.deleteById(id);
  }
}

module.exports = (user) => new CaseRepositoryProxy(user);
