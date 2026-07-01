import express from 'express';
import { createResource, getResources, getResource, updateResource, deleteResource } from '../controller/resource.js';
import userAuthentication from '../middleware/userAuthentication.js';

const resource = express.Router();

resource.get('/', userAuthentication, getResources);
resource.post('/', userAuthentication, createResource);
resource.get('/:resourceId', userAuthentication, getResource);
resource.patch('/:resourceId', userAuthentication, updateResource);
resource.delete('/:resourceId', userAuthentication, deleteResource);

export default resource;
