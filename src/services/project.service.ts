import { Project, IProject } from '../models/project.model';
import { Task } from '../models/task.model';
import { TaskActivity } from '../models/task-activity.model';
import { Types } from 'mongoose';

export const createProject = async (
  tenantId: string,
  data: Partial<IProject>,
  userId: string
): Promise<IProject> => {
  const project = new Project({
    ...data,
    tenantId,
    createdBy: userId,
    manager: data.manager || userId, // Default manager to creator if not provided
  });
  await project.save();

  await TaskActivity.create({
    tenantId: project.tenantId,
    projectId: project._id,
    userId: project.createdBy,
    action: 'created',
    description: `Project "${project.name}" created`,
    metadata: { projectKey: project.key },
  });

  return project;
};

export const getProjects = async (
  tenantId: string,
  filters?: {
    status?: string;
    manager?: string;
    search?: string;
  }
): Promise<IProject[]> => {
  const query: any = { tenantId };

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.manager) {
    query.manager = filters.manager;
  }

  if (filters?.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { key: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const projects = await Project.find(query)
    .populate('manager', 'username email')
    .populate('team', 'username email')
    .populate('createdBy', 'username email')
    .sort({ createdAt: -1 });

  return projects;
};

export const getProjectById = async (
  tenantId: string,
  projectId: string
): Promise<IProject | null> => {
  const project = await Project.findOne({ _id: projectId, tenantId })
    .populate('manager', 'username email')
    .populate('team', 'username email')
    .populate('createdBy', 'username email');

  if (!project) return null;

  const taskStats = await Task.aggregate([
    { $match: { projectId: new Types.ObjectId(projectId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  (project as any).taskStats = taskStats;

  return project;
};

export const updateProject = async (
  tenantId: string,
  projectId: string,
  updates: Partial<IProject>,
  userId: string
): Promise<IProject | null> => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, tenantId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (project) {
    await TaskActivity.create({
      tenantId,
      taskId: project._id,
      projectId: project._id,
      userId,
      action: 'updated',
      description: `Project "${project.name}" updated`,
      metadata: { updates: Object.keys(updates) },
    });
  }

  return project;
};

export const deleteProject = async (
  tenantId: string,
  projectId: string,
  userId: string
): Promise<boolean> => {
  const project = await Project.findOne({ _id: projectId, tenantId });
  
  if (!project) return false;

  const taskCount = await Task.countDocuments({ projectId });
  
  if (taskCount > 0) {
    throw new Error('Cannot delete project with existing tasks. Archive it instead.');
  }

  await Project.deleteOne({ _id: projectId, tenantId });

  await TaskActivity.create({
    tenantId,
    taskId: project._id,
    projectId: project._id,
    userId,
    action: 'deleted',
    description: `Project "${project.name}" deleted`,
  });

  return true;
};

export const addTeamMember = async (
  tenantId: string,
  projectId: string,
  memberId: string,
  role: string,
  userId: string
): Promise<IProject | null> => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, tenantId },
    { $addToSet: { team: memberId } },
    { new: true }
  );

  if (project) {
    await TaskActivity.create({
      tenantId,
      taskId: project._id,
      projectId: project._id,
      userId,
      action: 'updated',
      description: `Team member added to project "${project.name}"`,
      metadata: { addedMember: memberId },
    });
  }

  return project;
};

export const removeTeamMember = async (
  tenantId: string,
  projectId: string,
  userId: string,
  memberId: string
): Promise<IProject | null> => {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, tenantId },
    { $pull: { team: memberId } },
    { new: true }
  );

  if (project) {
    await TaskActivity.create({
      tenantId,
      taskId: project._id,
      projectId: project._id,
      userId,
      action: 'updated',
      description: `Team member removed from project "${project.name}"`,
      metadata: { removedMember: memberId },
    });
  }

  return project;
};
