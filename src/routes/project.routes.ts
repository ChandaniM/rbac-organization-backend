import express from 'express';
import * as ProjectController from '../controllers/project.controller';
import { authenticate } from '../middlewares/jwt.middleware';
import { rateLimitPresets } from '../middlewares/rate-limit.middleware';

const router = express.Router();

router.post(
  '/:tenantId/projects',
  authenticate,
  rateLimitPresets.api,
  ProjectController.createProject
);

router.get(
  '/:tenantId/projects',
  authenticate,
  ProjectController.getProjects
);

router.get(
  '/:tenantId/projects/:projectId',
  authenticate,
  ProjectController.getProjectById
);

router.put(
  '/:tenantId/projects/:projectId',
  authenticate,
  rateLimitPresets.api,
  ProjectController.updateProject
);

router.delete(
  '/:tenantId/projects/:projectId',
  authenticate,
  rateLimitPresets.api,
  ProjectController.deleteProject
);

router.post(
  '/:tenantId/projects/:projectId/team',
  authenticate,
  rateLimitPresets.api,
  ProjectController.addTeamMember
);

router.delete(
  '/:tenantId/projects/:projectId/team/:userId',
  authenticate,
  rateLimitPresets.api,
  ProjectController.removeTeamMember
);

export default router;
