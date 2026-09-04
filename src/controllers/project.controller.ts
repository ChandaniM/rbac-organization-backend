import { Request, Response } from 'express';
import * as ProjectService from '../services/project.service';

export const createProject = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const userId = (req as any).user?.userId;
    
    const project = await ProjectService.createProject(tenantId, req.body, userId);
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const filters = req.query;
    
    const projects = await ProjectService.getProjects(tenantId, filters);
    res.status(200).json({ success: true, data: projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId } = req.params;
    
    const project = await ProjectService.getProjectById(tenantId, projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId } = req.params;
    const userId = (req as any).user?.userId;
    
    const project = await ProjectService.updateProject(tenantId, projectId, req.body, userId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId } = req.params;
    const userId = (req as any).user?.userId;
    
    await ProjectService.deleteProject(tenantId, projectId, userId);
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addTeamMember = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId } = req.params;
    const { userId, role } = req.body;
    const requestUserId = (req as any).user?.userId;
    
    const project = await ProjectService.addTeamMember(tenantId, projectId, userId, role, requestUserId);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeTeamMember = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId, userId } = req.params;
    const requestUserId = (req as any).user?.userId;
    
    const project = await ProjectService.removeTeamMember(tenantId, projectId, userId, requestUserId);
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
