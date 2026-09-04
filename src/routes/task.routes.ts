import express from 'express';
import * as TaskController from '../controllers/task.controller';
import { authenticate } from '../middlewares/jwt.middleware';
import { rateLimitPresets } from '../middlewares/rate-limit.middleware';

const router = express.Router();

router.post(
  '/:tenantId/projects/:projectId/tasks',
  authenticate,
  rateLimitPresets.api,
  TaskController.createTask
);

router.get(
  '/:tenantId/tasks',
  authenticate,
  TaskController.getTasks
);

router.get(
  '/:tenantId/projects/:projectId/board',
  authenticate,
  TaskController.getTasksByBoard
);

router.get(
  '/:tenantId/tasks/:taskId',
  authenticate,
  TaskController.getTaskById
);

router.put(
  '/:tenantId/tasks/:taskId',
  authenticate,
  rateLimitPresets.api,
  TaskController.updateTask
);

router.patch(
  '/:tenantId/tasks/:taskId/move',
  authenticate,
  rateLimitPresets.api,
  TaskController.moveTask
);

router.delete(
  '/:tenantId/tasks/:taskId',
  authenticate,
  rateLimitPresets.api,
  TaskController.deleteTask
);

router.post(
  '/:tenantId/tasks/:taskId/comments',
  authenticate,
  rateLimitPresets.api,
  TaskController.addComment
);

router.get(
  '/:tenantId/tasks/:taskId/activity',
  authenticate,
  TaskController.getTaskActivity
);

export default router;
