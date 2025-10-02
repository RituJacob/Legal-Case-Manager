const chai = require('chai');
const sinon = require('sinon');
const { default: sinonChai } = require('sinon-chai');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

// Use a valid mock ObjectId for user IDs
const VALID_USER_ID = '60d5ecf3e5b3f1a2b4d9c7e8';

describe('AuthController', () => {
    let req, res, sandbox;
    let registerUser, loginUser, getProfile, updateUserProfile;
    let userModelMock, bcryptMock, jwtMock;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        
        req = {
            body: {},
            user: { id: VALID_USER_ID }, // Mock user from 'protect' middleware
        };
        res = {
            status: sandbox.stub().returnsThis(),
            json: sandbox.stub(),
        };

        // --- Mock Dependencies ---
        userModelMock = {
            findOne: sandbox.stub(),
            create: sandbox.stub(),
            findById: sandbox.stub(),
        };
        bcryptMock = {
            compare: sandbox.stub(),
        };
        jwtMock = {
            sign: sandbox.stub().returns('mock.jwt.token'),
        };

        // Use proxyquire to load the controller with our mocks
        const authController = proxyquire('../controllers/authController', {
            '../models/User': userModelMock,
            'bcrypt': bcryptMock,
            'jsonwebtoken': jwtMock
        });

        // Destructure the controller functions for use in tests
        registerUser = authController.registerUser;
        loginUser = authController.loginUser;
        getProfile = authController.getProfile;
        updateUserProfile = authController.updateUserProfile;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('registerUser', () => {
        it('should register a new user successfully', async () => {
            req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            userModelMock.findOne.resolves(null); // No user exists
            const newUser = { id: VALID_USER_ID, ...req.body, role: 'Client' };
            userModelMock.create.resolves(newUser);

            await registerUser(req, res);

            expect(userModelMock.findOne).to.have.been.calledWith({ email: 'test@example.com' });
            
            // --- THIS IS THE FIXED LINE ---
            expect(userModelMock.create).to.have.been.calledWith({
                ...req.body,
                role: 'Client'
            });
            
            expect(res.status).to.have.been.calledWith(201);
            expect(res.json).to.have.been.calledWithMatch({
                id: VALID_USER_ID,
                name: 'Test User',
                token: 'mock.jwt.token'
            });
        });

        it('should return 400 if user already exists', async () => {
            req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
            userModelMock.findOne.resolves({ id: 'someId' }); // User exists

            await registerUser(req, res);

            expect(res.status).to.have.been.calledWith(400);
            expect(res.json).to.have.been.calledWith({ message: 'User already exists' });
        });

        it('should return 400 if specialization is missing for a Lawyer', async () => {
            req.body = { name: 'Test Lawyer', email: 'lawyer@example.com', password: 'password123', role: 'Lawyer' };
            
            await registerUser(req, res);

            expect(res.status).to.have.been.calledWith(400);
            expect(res.json).to.have.been.calledWith({ message: 'Specialization is required for lawyers' });
        });
    });

    describe('loginUser', () => {
        it('should log in a user with valid credentials', async () => {
            req.body = { email: 'test@example.com', password: 'password123' };
            const existingUser = {
                id: VALID_USER_ID,
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'Client'
            };
            userModelMock.findOne.resolves(existingUser);
            bcryptMock.compare.resolves(true); // Passwords match

            await loginUser(req, res);

            expect(userModelMock.findOne).to.have.been.calledWith({ email: 'test@example.com' });
            expect(bcryptMock.compare).to.have.been.calledWith('password123', 'hashedPassword');
            expect(res.json).to.have.been.calledWithMatch({
                id: VALID_USER_ID,
                token: 'mock.jwt.token'
            });
        });

        it('should return 401 for a non-existent user', async () => {
            req.body = { email: 'nouser@example.com', password: 'password123' };
            userModelMock.findOne.resolves(null); // User does not exist

            await loginUser(req, res);

            expect(res.status).to.have.been.calledWith(401);
            expect(res.json).to.have.been.calledWith({ message: 'Invalid email or password' });
        });

        it('should return 401 for an incorrect password', async () => {
            req.body = { email: 'test@example.com', password: 'wrongpassword' };
            const existingUser = { password: 'hashedPassword' };
            userModelMock.findOne.resolves(existingUser);
            bcryptMock.compare.resolves(false); // Passwords do not match

            await loginUser(req, res);

            expect(res.status).to.have.been.calledWith(401);
            expect(res.json).to.have.been.calledWith({ message: 'Invalid email or password' });
        });
    });

    describe('getProfile', () => {
        it('should return the user profile', async () => {
            const userProfile = {
                name: 'Test User',
                email: 'test@example.com',
                role: 'Client',
                specialization: undefined,
                contactNumber: '123-456-7890',
                address: '123 Main St'
            };
            userModelMock.findById.resolves(userProfile);

            await getProfile(req, res);

            expect(userModelMock.findById).to.have.been.calledWith(VALID_USER_ID);
            expect(res.status).to.have.been.calledWith(200);
            expect(res.json).to.have.been.calledWith(userProfile);
        });

        it('should return 404 if user not found', async () => {
            userModelMock.findById.resolves(null);

            await getProfile(req, res);

            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith({ message: 'User not found' });
        });
    });

    describe('updateUserProfile', () => {
        it('should update the user profile successfully', async () => {
            const mockUser = {
                id: VALID_USER_ID,
                name: 'Old Name',
                email: 'old@example.com',
                save: sandbox.stub().resolvesThis()
            };
            userModelMock.findById.resolves(mockUser);
            req.body = { name: 'New Name', email: 'new@example.com' };

            await updateUserProfile(req, res);

            expect(userModelMock.findById).to.have.been.calledWith(VALID_USER_ID);
            expect(mockUser.name).to.equal('New Name');
            expect(mockUser.email).to.equal('new@example.com');
            expect(mockUser.save).to.have.been.called;
            expect(res.json).to.have.been.calledWithMatch({
                name: 'New Name',
                token: 'mock.jwt.token'
            });
        });

        it('should return 404 if user to update is not found', async () => {
            userModelMock.findById.resolves(null);

            await updateUserProfile(req, res);

            expect(res.status).to.have.been.calledWith(404);
            expect(res.json).to.have.been.calledWith({ message: 'User not found' });
        });
    });
});