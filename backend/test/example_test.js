/*const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;

const CaseController = require('../controllers/CaseController');
const Case = require('../models/Case');

describe('Case Controller Tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  // ----------------- createCase -----------------
  describe('createCase', () => {
    it('should create a new case successfully', async () => {
      const req = { body: { title: 'Test Case', description: 'Test Desc', category: 'Test' }, user: { _id: '1' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };
      const savedCase = { title: 'Test Case', description: 'Test Desc', category: 'Test', caseNumber: 'uuid', status: 'Filed', client: '1', _id: '1' };

      sandbox.stub(Case.prototype, 'save').resolves(savedCase);

      await CaseController.createCase(req, res);
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(savedCase)).to.be.true;
    });

    it('should return 400 if required fields missing', async () => {
      const req = { body: {} };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      await CaseController.createCase(req, res);
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledWith({ message: 'Title, description and category are required' })).to.be.true;
    });

    it('should return 500 on DB error', async () => {
      const req = { body: { title: 'Test Case', description: 'Test Desc', category: 'Test' }, user: { _id: '1' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      sandbox.stub(Case.prototype, 'save').rejects(new Error('DB Error'));

      await CaseController.createCase(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Failed to create case' })).to.be.true;
    });
  });

  // ----------------- updateCaseStatus -----------------
  describe('updateCaseStatus', () => {
    it('should return 404 if case not found', async () => {
      sandbox.stub(Case, 'findById').resolves(null);
      const req = { params: { id: '1' }, body: { status: 'Closed' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      await CaseController.updateCaseStatus(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Case not found' })).to.be.true;
    });

    it('should return 500 on DB error', async () => {
      sandbox.stub(Case, 'findById').rejects(new Error('DB Error'));
      const req = { params: { id: '1' }, body: { status: 'Closed' } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      await CaseController.updateCaseStatus(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Failed to update case status' })).to.be.true;
    });
  });

  // ----------------- deleteCase -----------------
  describe('deleteCase', () => {
    it('should return 404 if case not found', async () => {
      sandbox.stub(Case, 'findById').resolves(null);
      const req = { params: { id: '1' }, user: { _id: { toString: () => '1' } } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      await CaseController.deleteCase(req, res);
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWith({ message: 'Case not found' })).to.be.true;
    });

    it('should return 500 on DB error', async () => {
      sandbox.stub(Case, 'findById').rejects(new Error('DB Error'));
      const req = { params: { id: '1' }, user: { _id: { toString: () => '1' } } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      await CaseController.deleteCase(req, res);
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWith({ message: 'Failed to delete case' })).to.be.true;
    });

    it('should return 403 if user not authorized', async () => {
      const fakeCase = { client: { toString: () => '2' } };
      sandbox.stub(Case, 'findById').resolves(fakeCase);
      const req = { params: { id: '1' }, user: { _id: { toString: () => '1' } } };
      const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

      await CaseController.deleteCase(req, res);
      expect(res.status.calledWith(403)).to.be.true;
      expect(res.json.calledWith({ message: 'Not authorized to delete this case' })).to.be.true;
    });
  });
});
*/