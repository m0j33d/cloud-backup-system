import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import * as jwt from 'jsonwebtoken';
import cloudinary from '../src/config/cloudinary';
import app from '../src/index';
import dataSource from '../src/data-source'
import { User } from "../src/entities/users.entity";
import { Folder } from "../src/entities/folder.entity";
import { File } from "../src/entities/file.entity";


describe('Folder Routes', () => {
  const secret = process.env.JWT_SECRET as string | undefined;
  const authToken = jwt.sign({ userId: 1 }, `${secret}`, { expiresIn: '8h' });

  describe.only('Create a folder', () => {
    let userFindMock: any;
    let folderCreateMock: any;
    let folderSaveMock: any;
    let cloudinaryApiCreateFolderStub: any;

    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy');
      folderCreateMock = sinon.stub(dataSource.getRepository(Folder), 'create');
      folderSaveMock = sinon.stub(dataSource.getRepository(Folder), 'save');
      cloudinaryApiCreateFolderStub = sinon.stub(cloudinary.api, 'create_folder');
    });

    afterEach(() => {
      // Restoring the original userRepository function
      userFindMock.restore();
      folderCreateMock.restore();
      folderSaveMock.restore();
      cloudinaryApiCreateFolderStub.restore()
    });

    it('should create a folder and return a 201 status', async () => {
      const folderName = 'NewFolder';
      const user = { userId: 1 };
  
      // Mocking the behavior of cloudinary.api.create_folder
      cloudinaryApiCreateFolderStub.resolves({ public_id: 'folder123' });
  
      // Mocking the behavior of folderRepository.create and folderRepository.save
      folderCreateMock.resolves({ folderName, slug: 'newfolder', user: user.userId });
  
      const response = await request(app)
        .post('/api/folder/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ folderName });
  
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('message', 'Folder created');
      expect(response.body).to.have.property('folder');
    });
  
    it('should return a 500 status on server error', async () => {
      const folderName = 'NewFolder';
      const user = { userId: 1 };
  
      // Mocking the behavior of cloudinary.api.create_folder to throw an error
      cloudinaryApiCreateFolderStub.yields(new Error('Cloudinary error'), null);
  
      const response = await request(app)
        .post('/api/folder/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ folderName });
  
      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('error', 'Could not create the folder.');
    });

  });


})

