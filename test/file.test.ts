import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import * as jwt from 'jsonwebtoken';
import cloudinary from '../src/config/cloudinary';
import app from '../src/index';
import fs from 'fs';
import dataSource from '../src/data-source';
import { User } from "../src/entities/users.entity";
import { File } from "../src/entities/file.entity";
import { PassThrough } from 'stream';
import streamRequest from 'request'



describe('File Routes', () => {
  const secret = process.env.JWT_SECRET as string | undefined;
  const authToken = jwt.sign({ userId: 1 }, `${secret}`, { expiresIn: '8h' });

  describe('Upload Service', () => {
    let userFindMock: any;
    let fileCreateMock: any;
    let fileSaveMock: any;
    let cloudinaryUploaderUploadStub: any;


    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      fileCreateMock = sinon.stub(dataSource.getRepository(File), 'create');
      fileSaveMock = sinon.stub(dataSource.getRepository(File), 'save');
      cloudinaryUploaderUploadStub = sinon.stub(cloudinary.uploader, 'upload');
    });

    afterEach(() => {
      userFindMock.restore();
      fileCreateMock.restore();
      fileSaveMock.restore();
      cloudinaryUploaderUploadStub.restore();
    });

    it('should upload a file and return a 200 status', async () => {
      const user = { userId: 1 };
      const uploadDir = './uploads'; // Mock upload directory

      // Simulating file upload
      const file = {
        fieldname: 'file',
        originalname: 'largefile.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from("File content"),
      };

      // Mocking the behavior of cloudinary.uploader.upload to return a result
      cloudinaryUploaderUploadStub.resolves({ public_id: 'file123', secure_url: 'https://example.com/file123' });

      // Mocking the behavior of userRepository.findOneBy to return a user model
      userFindMock.resolves({ id: user.userId });

      // Mocking the behavior of fileRepository.create and fileRepository.save
      fileCreateMock.resolves({ /* your file entity data */ });

      // Create the test upload directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }

      // Simulate writing the uploaded file to the mock upload directory
      fs.writeFileSync(`${uploadDir}/${file.originalname}`, file.buffer);

      const response = await request(app)
        .post('/api/file/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', `${uploadDir}/${file.originalname}`) // Attach the file to the request

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('public_id', 'file123');
      expect(response.body).to.have.property('url', 'https://example.com/file123');
    });

    it('should return a 400 status when no file is selected', async () => {
      const response = await request(app)
        .post('/api/file/upload')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'No File Selected');
    });

    it('should return a 400 status when file size exceeds the limit', async () => {
      // Mocking a large file buffer to exceed the limit
      const largeFile = {
        fieldname: 'file',
        originalname: 'largefile.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.alloc((200 * 1024 * 1024) + 1), // Exceeds the limit
      };

      const response = await request(app)
        .post('/api/file/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFile.buffer, 'largefile.txt') // Attach the large file to the request

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'File size exceeds the maximum allowed limit');
    });

    it('should return a 500 status on server error', async () => {
      // Simulating file upload
      const file = {
        fieldname: 'file',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        buffer: Buffer.from('Test file content'), // Simulating file content
      };

      // Mocking the behavior of cloudinary.uploader.upload to throw an error
      cloudinaryUploaderUploadStub.throws(new Error('Cloudinary error'));

      // Mocking the behavior of userRepository.findOneBy to return a user model
      userFindMock.resolves({ id: 1 });

      // Mocking the behavior of fileRepository.create to throw an error
      fileCreateMock.throws(new Error('Database error'));

      const response = await request(app)
        .post('/api/file/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', file.buffer, 'test.txt') // Attach the file to the request

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Could not upload file.');
    });
  });

  describe('Download Service', () => {
    let userFindMock: any;
    let fileFindMock: any;
    let fileSaveMock: any;
    let cloudinaryApiResourceStub: any;

    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      fileFindMock = sinon.stub(dataSource.getRepository(File), 'findOne');
      fileSaveMock = sinon.stub(dataSource.getRepository(File), 'save');
      cloudinaryApiResourceStub = sinon.stub(cloudinary.api, 'resource');
    });

    afterEach(() => {
      userFindMock.restore();
      fileFindMock.restore();
      fileSaveMock.restore();
      cloudinaryApiResourceStub.restore();
    });

    it('should redirect to the file URL when file exists and user is authorized', async () => {
      const fileId = 'file123';
      const user = { userId: 1 };

      // Mocking the behavior of fileRepository.findOne to return a file
      fileFindMock.resolves({ userId: user.userId });

      // Mocking the behavior of cloudinary.api.resource to return a result
      cloudinaryApiResourceStub.resolves({ secure_url: 'https://example.com/file123' });

      const response = await request(app)
        .get(`/api/file/download/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(302); // Expecting a redirect
      expect(response.header.location).to.equal('https://example.com/file123'); // Expecting the redirect URL
    });

    it('should return a 400 status when the file is not found', async () => {
      const fileId = 'nonexistent-file-id';

      // Mocking fileRepository.findOne to return null (file not found)
      fileFindMock.resolves(null);

      const response = await request(app)
        .get(`/api/file/download/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'File not found');
    });

    it('should return a 403 status when the user is not authorized', async () => {
      const fileId = 'file123';

      // Mocking the behavior of fileRepository.findOne to return a file with a different user ID
      fileFindMock.resolves({ userId: 2 });

      const response = await request(app)
        .get(`/api/file/download/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message', 'You are not authorized to download this media');
    });

    it('should return a 500 status on server error', async () => {
      const fileId = 'file123';

      // Mocking the behavior of fileRepository.findOne to throw an error
      fileFindMock.throws(new Error('Database error'));

      const response = await request(app)
        .get(`/api/file/download/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Could not retrieve the file.');
    });
  });

  describe.only('Stream Video and Audio Service', () => {
    let userFindMock: any;
    let fileFindMock: any;
    let fileSaveMock: any;
    let cloudinaryApiResourceStub: any;

    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      fileFindMock = sinon.stub(dataSource.getRepository(File), 'findOne');
      fileSaveMock = sinon.stub(dataSource.getRepository(File), 'save');
      cloudinaryApiResourceStub = sinon.stub(cloudinary.api, 'resource');
    });

    afterEach(() => {
      userFindMock.restore();
      fileFindMock.restore();
      fileSaveMock.restore();
      cloudinaryApiResourceStub.restore();
    });


    it('should return a 400 status when the file is not found', async () => {
      const fileId = 'nonexistent-file-id';

      // Mocking fileRepository.findOne to return null (file not found)
      fileFindMock.resolves(null);

      const response = await request(app)
        .get(`/api/file/stream/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property('message', 'File not found');
    });

    it('should return a 403 status when the user is not authorized', async () => {
      const fileId = 'file123';

      // Mocking the behavior of fileRepository.findOne to return a file with a different user ID
      fileFindMock.resolves({ userId: 2 });

      const response = await request(app)
        .get(`/api/file/stream/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('message', 'You are not authorized to stream this media');
    });

    it('should return a 500 status on server error', async () => {
      const fileId = 'file123';
      const user = { userId: 1 };

      // Mocking the behavior of fileRepository.findOne to throw an error
      fileFindMock.throws(new Error('Database error'));

      const response = await request(app)
        .get(`/api/file/stream/${fileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Could not stream media.');
    });
  });


})

