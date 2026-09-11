import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from './userController';
import { registerValidation, updateUserValidation, paginationValidation } from '../../utils/validations';
import { validateResult } from '../../utils/validateResult';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/', paginationValidation, validateResult, getUsers);
router.post('/', registerValidation, validateResult, createUser);
router.put('/:id', updateUserValidation, validateResult, updateUser);
router.delete('/:id', deleteUser);

export default router;