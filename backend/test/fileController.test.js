const chai = require('chai');
const sinon = require('sinon');
const { default: sinonChai } = require('sinon-chai');
const { uploadFile, getFiles, renameFile, deleteFile } = require('../controllers/FileController');
const fileRepository = require('../repositories/fileRepository');
const caseRepository = require('../repositories/caseRepository');
const fs = require('fs');
const path = require('path');

const { expect } = chai;
chai.use(sinonChai);

const VALID_USER_ID = '60d5ecf3e5b3f1a2b4d9c7e8';
const ANOTHER_USER_ID = '60d5ecf3e5b3f1a2b4d9c7f1';
const VALID_CASE_ID = '60d5ecf3e5b3f1a2b4d9c7e9';
const VALID_FILE_ID = '60d5ecf3e5b3f1a2b4d9c7f0';

describe('FileController', () => {
    let req, res, sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        req = {
            file: { originalname: 'test.pdf', filename: '12345-test.pdf', size: 1024 },
            body: {},
            query: {},
            params: {},
            user: { id: VALID_USER_ID },
        };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('uploadFile', () => {
        it('should upload a file successfully and link it to a case', async () => {
            req.body.caseId = VALID_CASE_ID;
            const newFile = { _id: VALID_FILE_ID, ...req.file };
            const mockCase = { _id: VALID_CASE_ID, evidence: [] };
            sandbox.stub(fileRepository, 'create').resolves(newFile);
            sandbox.stub(caseRepository, 'findById').resolves(mockCase);
            sandbox.stub(caseRepository, 'save').resolves();

            await uploadFile(req, res);

            expect(res.status).to.have.been.calledWith(201);
            expect(caseRepository.findById).to.have.been.calledWith(VALID_CASE_ID);
        });

        it('should return 400 if no file is uploaded', async () => {
            req.file = undefined;
            await uploadFile(req, res);
            expect(res.status).to.have.been.calledWith(400);
        });

        it('should return 500 on a database error', async () => {
            sandbox.stub(console, 'error');
            req.body.caseId = VALID_CASE_ID;
            const dbError = new Error('DB Error');
            sandbox.stub(fileRepository, 'create').rejects(dbError);

            await uploadFile(req, res);
            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'Server error while uploading file.' });
        });
    });

    describe('getFiles', () => {
        it('should get files for a given caseId', async () => {
            req.query.caseId = VALID_CASE_ID;
            const files = [{ originalName: 'file1.pdf' }, { originalName: 'file2.pdf' }];
            sandbox.stub(fileRepository, 'findByCaseId').resolves(files);

            await getFiles(req, res);

            expect(res.json).to.have.been.calledWith(files);
        });

        it('should return 400 if caseId is not provided', async () => {
            await getFiles(req, res);
            expect(res.status).to.have.been.calledWith(400);
        });

        it('should return 500 on a database error', async () => {
            sandbox.stub(console, 'error');
            req.query.caseId = VALID_CASE_ID;
            const dbError = new Error('DB Error');
            sandbox.stub(fileRepository, 'findByCaseId').rejects(dbError);

            await getFiles(req, res);
            expect(res.status).to.have.been.calledWith(500);
            expect(res.json).to.have.been.calledWith({ message: 'Server error while fetching files.' });
        });
    });

    describe('renameFile', () => {
        let findByIdStub;
        beforeEach(() => {
            findByIdStub = sandbox.stub(fileRepository, 'findById');
        });
        
        it('should rename a file successfully', async () => {
            req.params.id = VALID_FILE_ID;
            req.body.newName = 'new-file-name';
            const mockFile = { userId: VALID_USER_ID, originalName: 'old-name.pdf' };
            findByIdStub.resolves(mockFile);
            sandbox.stub(fileRepository, 'save').resolves(mockFile);

            await renameFile(req, res);

            expect(mockFile.originalName).to.equal('new-file-name.pdf');
            expect(res.json).to.have.been.calledWith({ message: 'File renamed', file: mockFile });
        });

        it('should return 404 if the file is not found', async () => {
            req.params.id = 'nonexistentfileid';
            req.body.newName = 'some-name';
            findByIdStub.resolves(null); // Simulate not finding the file

            await renameFile(req, res);

            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith({ message: 'File not found' });
        });

        it('should return 403 if user is unauthorized', async () => {
            req.params.id = VALID_FILE_ID;
            const mockFile = { userId: ANOTHER_USER_ID }; // Different user
            findByIdStub.resolves(mockFile);

            await renameFile(req, res);

            expect(res.status).to.have.been.calledWith(403);
            expect(res.json).to.have.been.calledWith({ message: 'Unauthorized' });
        });
    });

    describe('deleteFile', () => {
        let findByIdStub, unlinkSyncStub;
        beforeEach(() => {
            findByIdStub = sandbox.stub(fileRepository, 'findById');
            unlinkSyncStub = sandbox.stub(fs, 'unlinkSync');
        });

        it('should delete a file record and the physical file', async () => {
            req.params.id = VALID_FILE_ID;
            const mockFile = { _id: VALID_FILE_ID, userId: VALID_USER_ID, path: '12345-test.pdf' };
            findByIdStub.resolves(mockFile);
            sandbox.stub(fileRepository, 'deleteById').resolves();

            await deleteFile(req, res);
            
            expect(unlinkSyncStub).to.have.been.called;
            expect(res.json).to.have.been.calledWith({ message: 'File deleted successfully' });
        });

        it('should return 404 if the file is not found', async () => {
            req.params.id = 'nonexistentfileid';
            findByIdStub.resolves(null);

            await deleteFile(req, res);

            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith({ message: 'File not found' });
        });

        it('should return 403 if the user is unauthorized to delete the file', async () => {
            req.params.id = VALID_FILE_ID;
            const mockFile = { _id: VALID_FILE_ID, userId: ANOTHER_USER_ID, path: '12345-test.pdf' };
            findByIdStub.resolves(mockFile);

            await deleteFile(req, res);

            expect(res.status).to.have.been.calledWith(403);
            expect(res.json).to.have.been.calledWith({ message: 'Unauthorized' });
        });
    });
});