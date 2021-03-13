import { UserController } from './../controller/UserController';
import { Router } from 'express';
import { checkJwt } from '../middlewares/jwt';
import { checkRole } from '../middlewares/rol';

const router = Router();

// Get all users
router.get('/',[checkJwt, checkRole(['admin'])], UserController.getAll);

// Get one user
router.get('/:id',[checkJwt, checkRole(['admin'])], UserController.getById);

// Create a new user
router.post('/', UserController.new);

// Edit user
router.patch('/:id',[checkJwt, checkRole(['admin'])], UserController.edit);

// Delete
router.delete('/:id',[checkJwt, checkRole(['admin'])],  UserController.delete);

export default router;
