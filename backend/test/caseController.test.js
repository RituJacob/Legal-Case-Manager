const chai = require('chai');
const sinon = require('sinon');
const { default: sinonChai } = require('sinon-chai');
const proxyquire = require('proxyquire');

const Case = require('../models/Case');
const User = require('../models/User');

const { expect } = chai;
chai.use(sinonChai);

const VALID_USER_ID = '60d5ecf3e5b3f1a2b4d9c7e8';
const VALID_CASE_ID = '60d5ecf3e5b3f1a2b4d9c7e9';
const VALID_LAWYER_ID = '60d5ecf3e5b3f1a2b4d9c7f0';

describe('CaseController', () => {
    let req, res, sandbox, mockCaseRepository;
    let getCases, createCase, updateCaseStatus, deleteCase, assignLawyerToCase;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        req = {
            body: {},
            params: {},
            user: { _id: VALID_USER_ID, role: 'Client' },
        };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };

        mockCaseRepository = {
            findForUser: sandbox.stub(),
            create: sandbox.stub(),
            updateCaseStatus: sandbox.stub(),
            deleteById: sandbox.stub(),
        };

        const caseRepositoryProxyFactoryMock = () => mockCaseRepository;

        const controller = proxyquire('../controllers/CaseController', {
            '../repositories/caseRepositoryProxy': caseRepositoryProxyFactoryMock
        });

        getCases = controller.getCases;
        createCase = controller.createCase;
        updateCaseStatus = controller.updateCaseStatus;
        deleteCase = controller.deleteCase;
        assignLawyerToCase = controller.assignLawyerToCase;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getCases', () => {
        it('should fetch and return cases for a user', async () => {
            const cases = [{ title: 'Case 1' }, { title: 'Case 2' }];
            mockCaseRepository.findForUser.resolves(cases);

            await getCases(req, res);
            
            expect(mockCaseRepository.findForUser).to.have.been.calledWith(req.user);
            expect(res.json).to.have.been.calledWith([...cases].sort());
        });

        it('should return 500 on a database error', async () => {
            sandbox.stub(console, 'error');
            const dbError = new Error('DB Connection Error');
            mockCaseRepository.findForUser.rejects(dbError);

            await getCases(req, res);

            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'DB Connection Error' });
        });
    });

    describe('createCase', () => {
        it('should create a new case successfully', async () => {
            req.body = { title: 'New Case', description: 'Details', category: 'Civil' };
            const savedCase = { _id: VALID_CASE_ID, ...req.body, client: req.user._id };
            mockCaseRepository.create.resolves(savedCase);

            await createCase(req, res);
            
            const createArg = mockCaseRepository.create.getCall(0).args[0];
            expect(createArg).to.have.property('title', 'New Case');
            expect(createArg).to.have.property('client', VALID_USER_ID);
            expect(res.status).to.have.been.calledWith(201);
            expect(res.json).to.have.been.calledWith(savedCase);
        });

        it('should return 500 on a database error', async () => {
            sandbox.stub(console, 'error');
            req.body = { title: 'New Case', description: 'Details', category: 'Civil' };
            const dbError = new Error('DB Validation Error');
            mockCaseRepository.create.rejects(dbError);

            await createCase(req, res);

            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'DB Validation Error' });
        });
    });

    describe('updateCaseStatus', () => {
        beforeEach(() => {
            sandbox.stub(console, 'error');
        });

        it('should update the status of a case', async () => {
            req.params.id = VALID_CASE_ID;
            req.body.status = 'In Progress';
            const updatedCase = { _id: VALID_CASE_ID, status: 'In Progress' };
            mockCaseRepository.updateCaseStatus.resolves(updatedCase);

            await updateCaseStatus(req, res);

            expect(mockCaseRepository.updateCaseStatus).to.have.been.calledWith(VALID_CASE_ID, 'In Progress');
            expect(res.json).to.have.been.calledWith(updatedCase);
        });

        it('should fail if a client tries to make an unauthorized status change', async () => {
            req.params.id = VALID_CASE_ID;
            req.body.status = 'Closed'; //  client cannot do this
            const authError = new Error('Not authorized to update case status');
            mockCaseRepository.updateCaseStatus.rejects(authError);

            await updateCaseStatus(req, res);

            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'Not authorized to update case status' });
        });

        it('should return 500 on a generic database error', async () => {
            req.params.id = VALID_CASE_ID;
            req.body.status = 'In Progress';
            const dbError = new Error('DB Connection Error');
            mockCaseRepository.updateCaseStatus.rejects(dbError);

            await updateCaseStatus(req, res);

            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'DB Connection Error' });
        });
    });

    describe('deleteCase', () => {
        beforeEach(() => {
            sandbox.stub(console, 'error');
        });

        it('should delete a case successfully', async () => {
            req.params.id = VALID_CASE_ID;
            mockCaseRepository.deleteById.resolves();

            await deleteCase(req, res);

            expect(mockCaseRepository.deleteById).to.have.been.calledWith(VALID_CASE_ID);
            expect(res.json).to.have.been.calledWith({ message: 'Case deleted successfully', id: VALID_CASE_ID });
        });

        it('should return 500 if the case is not found', async () => {
            req.params.id = VALID_CASE_ID;
            const notFoundError = new Error('Case not found');
            mockCaseRepository.deleteById.rejects(notFoundError);

            await deleteCase(req, res);

            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'Case not found' });
        });

        it('should return 500 on a generic database error', async () => {
            req.params.id = VALID_CASE_ID;
            const dbError = new Error('Database connection lost');
            mockCaseRepository.deleteById.rejects(dbError);

            await deleteCase(req, res);

            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'Database connection lost' });
        });
    });

    describe('assignLawyerToCase', () => {
        let findCaseByIdStub, findUserByIdStub, mockCase;

        beforeEach(() => {
            mockCase = { _id: VALID_CASE_ID, lawyer: null, save: sandbox.stub().resolvesThis() };
            findCaseByIdStub = sandbox.stub(Case, 'findById').resolves(mockCase);
            findUserByIdStub = sandbox.stub(User, 'findById');
        });

        it('should assign a lawyer to a case successfully', async () => {
            req.params.id = VALID_CASE_ID;
            req.body.lawyerId = VALID_LAWYER_ID;
            const mockLawyer = { _id: VALID_LAWYER_ID, role: 'lawyer' };
            findUserByIdStub.resolves(mockLawyer);

            await assignLawyerToCase(req, res);

            expect(findCaseByIdStub).to.have.been.calledWith(VALID_CASE_ID);
            expect(findUserByIdStub).to.have.been.calledWith(VALID_LAWYER_ID);
            expect(mockCase.lawyer).to.equal(VALID_LAWYER_ID);
            expect(res.status).to.have.been.calledWith(200);
        });

        it('should return 400 if lawyerId is not provided', async () => {
            req.body.lawyerId = undefined;
            await assignLawyerToCase(req, res);
            expect(res.status).to.have.been.calledWith(400);
        });

        it('should return 404 if case or lawyer is not found', async () => {
            findCaseByIdStub.resolves(null);
            req.params.id = VALID_CASE_ID;
            req.body.lawyerId = VALID_LAWYER_ID;
            
            await assignLawyerToCase(req, res);
            expect(res.status).to.have.been.calledWith(404);
        });

         it('should return 400 if the user is not a lawyer', async () => {
            req.params.id = VALID_CASE_ID;
            req.body.lawyerId = VALID_LAWYER_ID;
            const notALawyer = { _id: VALID_LAWYER_ID, role: 'Client' };
            findUserByIdStub.resolves(notALawyer);

            await assignLawyerToCase(req, res);
            
            expect(res.status).to.have.been.calledWith(400);
        });
    });
});