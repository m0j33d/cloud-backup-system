import { expect } from 'chai';
import request from 'supertest';
import sinon from 'sinon';
import bcrypt from 'bcrypt';
import app from '../src/index';
import dataSource from '../src/data-source'
import { User } from "../src/entities/users.entity";
import { Session } from "../src/entities/session.entity";


describe('User Authentication', () => {

  describe('Login Service', () => {
    let userRepositoryMock: any;
    let sessionCreateMock: any;
    let sessionSaveMock: any;
  
    beforeEach(() => {
      userRepositoryMock = sinon.stub(dataSource.getRepository(User), 'findOneBy'); 
      sessionCreateMock = sinon.stub(dataSource.getRepository(Session), 'create');
      sessionSaveMock = sinon.stub(dataSource.getRepository(Session), 'save');
    });
  
    afterEach(() => {
      // Restoring the original userRepository function
      userRepositoryMock.restore(); 
      sessionCreateMock.restore(); 
      sessionSaveMock.restore();
    });
  
    it('should return a valid JWT token on successful login', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userCredentials = {
        email: 'user@example.com',
        password: 'password123',
      };
  
      // Mocking the behavior of userRepository.findOneBy to return a user
      userRepositoryMock.resolves({ id: 1, email: 'user@example.com', password: hashedPassword });
      sessionCreateMock.resolves({});
      sessionSaveMock.resolves({});
  
      const response = await request(app)
        .post('/api/auth/login')
        .send(userCredentials);
  
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
    });
  
    it('should return a 401 status on invalid login credentials', async () => {
      const invalidCredentials = {
        email: 'nonexistent@example.com',
        password: 'invalidpassword',
      };
  
      // Mocking the behavior of userRepository.findOneBy to return null
      userRepositoryMock.resolves(null);
  
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials);
  
      expect(response.status).to.equal(401);
      expect(response.body).to.have.property('message', 'Invalid email or password');
    });
  
    it('should return a 500 status on server error', async () => {
      const userCredentials = {
        email: 'user@example.com',
        password: 'password123',
      };
  
      // Mocking userRepository.findOneBy to throw an error
      userRepositoryMock.throws(new Error('Database error'));
  
      const response = await request(app)
        .post('/api/auth/login')
        .send(userCredentials);
  
      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('message', 'Error while logging in');
    });
  });

  
})

