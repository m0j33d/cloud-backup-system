import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import * as jwt from 'jsonwebtoken';
import cloudinary from '../src/config/cloudinary';
import app from '../src/index';
import dataSource from '../src/data-source'
import { User } from "../src/entities/users.entity";
import { Session } from "../src/entities/session.entity";
import { File } from "../src/entities/file.entity";


describe('Admin Routes', () => {
  const secret = process.env.JWT_SECRET as string | undefined;
  const authToken = jwt.sign({ userId: 1 }, `${secret}`, { expiresIn: '8h' });

  describe('Admin Register', () => {
    let userCreateMock: any;
    let userSaveMock: any;
    let userFindMock: any;

    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      userCreateMock = sinon.stub(dataSource.getRepository(User), 'create');
      userSaveMock = sinon.stub(dataSource.getRepository(User), 'save');
    });

    afterEach(() => {
      // Restoring the original userRepository function
      userCreateMock.restore();
      userSaveMock.restore();
      userFindMock.restore();
    });

    it('should return a 201 status on successful registration', async () => {
      const userData = {
        email: 'newuser@email.com',
        password: 'Password123',
        fullName: 'Odumodo blvck',
        userType: 'admin'
      };

      // Mocking the behavior of userRepository.create and userRepository.save
      userCreateMock.resolves(userData);
      userSaveMock.resolves({});
      userFindMock.resolves(null);


      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'User registered successfully');
    });

    it('should return a 400 status on validation error', async () => {
      const userData = {
        email: 'newusercom', // Invalid email
        password: 'password123',
        fullName: 'Odumodo blvck',
        userType: 'admin'
      };

      // Mocking the behavior of userRepository.create and userRepository.save
      userCreateMock.resolves(userData);
      userSaveMock.resolves({});

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).to.equal(400);
    });

    it('should return a 500 status on server error', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'Password123',
        fullName: 'Odumodo blvck',
        userType: 'admin'
      };

      // Mocking userRepository.create to throw an error
      userCreateMock.throws(new Error('Database error'));
      userFindMock.resolves(null);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Error while registering user');
    });
  });

  describe('Revoke User Session Service', () => {
    let userCreateMock: any;
    let userFindMock: any;
    let sessionFindMock: any;
    let sessionCreateMock: any;
    let sessionSaveMock: any;

    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      userCreateMock = sinon.stub(dataSource.getRepository(User), 'create');
      sessionFindMock = sinon.stub(dataSource.getRepository(Session), 'findOneBy');
      sessionCreateMock = sinon.stub(dataSource.getRepository(Session), 'create');
      sessionSaveMock = sinon.stub(dataSource.getRepository(Session), 'save');
    });

    afterEach(() => {
      // Restoring the original userRepository function
      userCreateMock.restore();
      userFindMock.restore();
      sessionFindMock.restore();
      sessionCreateMock.restore();
      sessionSaveMock.restore();
    });

    it('should return a 200 status on successful session revocation', async () => {
      const userId = 1;

      // Mocking the behavior of userRepository.findOneBy to return a user
      userFindMock.resolves({ id: userId, userType: 'admin' });

      // Mocking the behavior of updateOrCreateUserSession
      sessionFindMock.resolves(null);
      sessionCreateMock.resolves({});
      sessionSaveMock.resolves();

      const response = await request(app)
        .post('/api/admin/revoke-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId });

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'User session revoked successfully');
    });

    it('should return a 403 status when requesting user is not admin', async () => {
      const userId = 1;

      // Mocking userRepository.findOneBy to return non admin user
      userFindMock.resolves({ id: userId, userType: 'user' });

      const response = await request(app)
        .post('/api/admin/revoke-session')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ userId });

      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message', 'Access denied. You must be an admin to access this resource.');

    });

    it('should return a 401 status when requesting user is not authenticated', async () => {
      const userId = 1;

      // Mocking userRepository.findOneBy to return null (user not found)
      userFindMock.resolves(null);

      const response = await request(app)
        .post('/api/admin/revoke-session')
        .send({ userId });

      expect(response.status).to.equal(401);
    });

  });

  describe('Mark as Unsafe and Delete Service', () => {
    let fileSaveMock: any;
    let fileFindMock: any;
    let cloudinaryUploaderDestroyStub: any;
    let userFindMock: any;


    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      fileFindMock = sinon.stub(dataSource.getRepository(File), 'findOne');
      fileSaveMock = sinon.stub(dataSource.getRepository(File), 'save');
      cloudinaryUploaderDestroyStub = sinon.stub(cloudinary.uploader, 'destroy'); // Mocking Cloudinary's destroy function
    });

    afterEach(() => {
      userFindMock.restore();
      fileFindMock.restore();
      fileSaveMock.restore();
      cloudinaryUploaderDestroyStub.restore();
    });

    it('should mark the file as unsafe and delete it when marked by 3 admins', async () => {
      const fileId = 'file123';
      const adminId = 1;

      userFindMock.resolves({ id: adminId, userType: 'admin' });

      // Mocking the behavior of fileRepository.findOne to return a file
      fileFindMock.resolves({
        publicId: fileId,
        markedBy: [adminId, adminId, adminId], // Simulating marked by 3 admins
        status: 'SAFE',
        softDelete: () => { }, // Mocking the softDelete method
      });

      fileSaveMock.resolves({})

      // Mocking Cloudinary's destroy function
      cloudinaryUploaderDestroyStub.yields(null, {});

      const response = await request(app)
        .put(`/api/admin/status/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'File marked as unsafe and deleted successfully');
    });

    it('should mark the file as unsafe when marked by less than 3 admins', async () => {
      const fileId = 'file123';
      const adminId = 1;

      userFindMock.resolves({ id: adminId, userType: 'admin' });

      // Mocking the behavior of fileRepository.findOne to return a file
      fileFindMock.resolves({
        publicId: fileId,
        markedBy: [adminId], // Simulating marked by 1 admin
        status: 'SAFE',
        softDelete: () => { }, // Mocking the softDelete method
      });

      const response = await request(app)
        .put(`/api/admin/status/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'File marked as unsafe successfully. Waiting for 2 admins(s) before deleting file');
    });

    it('should return a 400 status when the file is not found', async () => {
      const fileId = 'nonexistent-file-id';

      userFindMock.resolves({ id: 1, userType: 'admin' });

      // Mocking fileRepository.findOne to return null (file not found)
      fileFindMock.resolves(null);

      const response = await request(app)
        .put(`/api/admin/status/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'File not found');
    });

    it('should return a 403 status when the requesting user is not admin', async () => {
      const fileId = 'nonexistent-file-id';

      userFindMock.resolves({ id: 1, userType: 'user' });

      // Mocking fileRepository.findOne to return null (file not found)
      fileFindMock.resolves(null);

      const response = await request(app)
        .put(`/api/admin/status/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(403);
    });

    it('should return a 401 status when the user is not authenticated', async () => {
      const fileId = 'nonexistent-file-id';

      userFindMock.resolves({ id: 1, userType: 'admin' });

      // Mocking fileRepository.findOne to return null (file not found)
      fileFindMock.resolves(null);

      const response = await request(app)
        .put(`/api/admin/status/${fileId}`)
        .send({});

      expect(response.status).to.equal(401);
    });

    it('should return a 500 status on server error', async () => {
      const fileId = 'file123';
      const adminId = 1;

      userFindMock.resolves({ id: adminId, userType: 'admin' });

      // Mocking the behavior of fileRepository.findOne to throw an error
      fileFindMock.throws(new Error('Database error'));

      const response = await request(app)
        .put(`/api/admin/status/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Could not mark as unsafe and delete the file.');
    });
  });

  describe('Get All Users Uploads Service', () => {
    let fileSaveMock: any;
    let fileFindMock: any;
    let userFindMock: any;

    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      fileFindMock = sinon.stub(dataSource.getRepository(File), 'find');
      fileSaveMock = sinon.stub(dataSource.getRepository(File), 'save');
    });

    afterEach(() => {
      userFindMock.restore();
      fileFindMock.restore();
      fileSaveMock.restore();
    });

    it('should return a list of files with default pagination and no status filter', async () => {
      const files = [
        { id: 1, name: 'file1.txt', status: 'SAFE' },
        { id: 2, name: 'file2.txt', status: 'UNSAFE' },
      ];

      // Mocking the behavior of fileRepository.find to return files
      fileFindMock.resolves(files);
      userFindMock.resolves({ id: 1, userType: 'admin' });

      const response = await request(app)
        .get('/api/admin/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'All Users files fetched');
      expect(response.body).to.have.property('files').to.be.an('array');
      expect(response.body.files).to.have.lengthOf(files.length);
    });

    it('should return a list of files with custom pagination and no status filter', async () => {
      const files = [
        { id: 1, name: 'file1.txt', status: 'SAFE' },
        { id: 2, name: 'file2.txt', status: 'UNSAFE' },
      ];

      // Mocking the behavior of fileRepository.find to return files
      fileFindMock.resolves(files);
      userFindMock.resolves({ id: 1, userType: 'admin' });

      const response = await request(app)
        .get('/api/admin/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 2, perPage: 5 }) // Custom pagination
        .send({});

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'All Users files fetched');
      expect(response.body).to.have.property('files').to.be.an('array');
      expect(response.body.files).to.have.lengthOf(files.length);
    });

    it('should return a list of files filtered by status', async () => {
      const files = [
        { id: 1, name: 'file1.txt', status: 'safe' },
        { id: 2, name: 'file2.txt', status: 'unsafe' },
        { id: 3, name: 'file3.txt', status: 'safe' },
      ];

      // Mocking the behavior of fileRepository.find to return files
      fileFindMock.resolves(files);
      userFindMock.resolves({ id: 1, userType: 'admin' });

      const response = await request(app)
        .get('/api/admin/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ status: 'safe' })
        .send({});

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('message', 'All Users files fetched');
      expect(response.body).to.have.property('files').to.be.an('array');
    });

    it('should return a 500 status on server error', async () => {
      // Mocking fileRepository.find to throw an error
      fileFindMock.throws(new Error('Database error'));
      userFindMock.resolves({ id: 1, userType: 'admin' });

      const response = await request(app)
        .get('/api/admin/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Could not fetch files.');
    });
  });

})

