import { Request, Response } from 'express';
import * as TaskService from '../services/task.service';

export const createTask = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId } = req.params;
    const userId = (req as any).user?.userId;
    
    const task = await TaskService.createTask(tenantId, projectId, req.body, userId);
    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const filters = req.query;
    
    const tasks = await TaskService.getTasks(tenantId, filters);
    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTasksByBoard = async (req: Request, res: Response) => {
  try {
    const { tenantId, projectId } = req.params;
    
    const board = await TaskService.getTasksByBoard(tenantId, projectId);
    res.status(200).json({ success: true, data: board });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { tenantId, taskId } = req.params;
    
    const task = await TaskService.getTaskById(tenantId, taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { tenantId, taskId } = req.params;
    const userId = (req as any).user?.userId;
    
    const task = await TaskService.updateTask(tenantId, taskId, req.body, userId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const moveTask = async (req: Request, res: Response) => {
  try {
    const { tenantId, taskId } = req.params;
    const { status, order } = req.body;
    const userId = (req as any).user?.userId;
    
    const task = await TaskService.moveTask(tenantId, taskId, status, order, userId);
    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { tenantId, taskId } = req.params;
    const userId = (req as any).user?.userId;
    
    await TaskService.deleteTask(tenantId, taskId, userId);
    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { tenantId, taskId } = req.params;
    const userId = (req as any).user?.userId;
    const { content, mentions } = req.body;
    
    const comment = await TaskService.addComment(tenantId, taskId, userId, content, mentions);
    res.status(201).json({ success: true, data: comment });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTaskActivity = async (req: Request, res: Response) => {
  try {
    const { tenantId, taskId } = req.params;
    
    const activities = await TaskService.getTaskActivity(tenantId, taskId);
    res.status(200).json({ success: true, data: activities });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
