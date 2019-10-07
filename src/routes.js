import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import SessionController from './app/controllers/SessionController';
import OrganizingController from './app/controllers/OrganizingController';
import Subscription from './app/controllers/SubscriptionController';
import authMiddleware from './middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/files', upload.single('file'), FileController.store);

routes.put('/users', UserController.update);

routes.get('/organizing', OrganizingController.index);

routes.post('/meetupcreate', MeetupController.store);
routes.put('/meetupupdate/:id', MeetupController.update);
routes.get('/meetupindex', MeetupController.index);
routes.delete('/meetupdelete/:id', MeetupController.delete);

routes.post('/subscription/:id', Subscription.store);
routes.get('/subscriptionindex', Subscription.index);

export default routes;
