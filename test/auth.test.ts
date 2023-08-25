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
    let userFindMock: any;
    let sessionCreateMock: any;
    let sessionSaveMock: any;
  
    beforeEach(() => {
      userFindMock = sinon.stub(dataSource.getRepository(User), 'findOneBy'); 
      sessionCreateMock = sinon.stub(dataSource.getRepository(Session), 'create');
      sessionSaveMock = sinon.stub(dataSource.getRepository(Session), 'save');
    });
  
    afterEach(() => {
      // Restoring the original userRepository function
      userFindMock.restore(); 
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
      userFindMock.resolves({ id: 1, email: 'user@example.com', password: hashedPassword });
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
      userFindMock.resolves(null);
  
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
      userFindMock.throws(new Error('Database error'));
  
      const response = await request(app)
        .post('/api/auth/login')
        .send(userCredentials);
  
      expect(response.status).to.equal(500);
      expect(response.body).to.have.property('message', 'Error while logging in');
    });
  });

  describe('Register Service', () => {
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
        fullName: 'Odumodo blvck'
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
        fullName: 'Odumodo blvck'
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
        fullName: 'Odumodo blvck'
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

})

