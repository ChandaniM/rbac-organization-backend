import { Task, ITask } from '../models/task.model';
import { TaskActivity } from '../models/task-activity.model';
import { TaskComment } from '../models/task-comment.model';
import { Project } from '../models/project.model';
import { addEmailToQueue } from '../queues/email.queue';
import { Types } from 'mongoose';

export const createTask = async (
  tenantId: string,
  projectId: string,
  data: Partial<ITask>,
  reporterId: string
): Promise<ITask> => {
  const task = new Task({
    ...data,
    tenantId,
    projectId,
    reporter: reporterId,
  });

  await task.save();

  await TaskActivity.create({
    tenantId: task.tenantId,
    taskId: task._id,
    projectId: task.projectId,
    userId: reporterId,
    action: 'created',
    description: `Task created: "${task.title}"`,
  });

  if (task.assignee && task.assignee.toString() !== reporterId) {
    const project = await Project.findById(task.projectId);
    
    if (project) {
      await addEmailToQueue({
        to: '', // Will be populated from User model
        subject: `Task Assigned: ${project.key}-${task.taskNumber}`,
        html: `You have been assigned a new task: ${task.title}`,
        event: 'task.assigned' as any,
        tenantId: task.tenantId,
        userId: task.assignee.toString(),
        metadata: { taskId: task._id.toString(), projectKey: project.key },
      });
    }
  }

  return task;
};

export const getTasks = async (
  tenantId: string,
  filters?: {
    projectId?: string;
    status?: string;
    assignee?: string;
    priority?: string;
    search?: string;
  }
): Promise<ITask[]> => {
  const query: any = { tenantId };

  if (filters?.projectId) {
    query.projectId = filters.projectId;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  if (filters?.assignee) {
    query.assignee = filters.assignee;
  }

  if (filters?.priority) {
    query.priority = filters.priority;
  }

  if (filters?.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return await Task.find(query)
    .populate('assignee', 'username email')
    .populate('reporter', 'username email')
    .populate('projectId', 'name key')
    .sort({ order: 1, createdAt: -1 })
    .lean();
};

export const getTasksByBoard = async (
  tenantId: string,
  projectId: string
): Promise<{ [status: string]: ITask[] }> => {
  const tasks = await Task.find({ tenantId, projectId })
    .populate('assignee', 'username email')
    .populate('reporter', 'username email')
    .sort({ order: 1 })
    .lean();

  const board: { [status: string]: ITask[] } = {
    'To Do': [],
    'In Progress': [],
    'In Review': [],
    'Done': [],
  };

  tasks.forEach(task => {
    if (!board[task.status]) {
      board[task.status] = [];
    }
    board[task.status].push(task);
  });

  return board;
};

export const getTaskById = async (
  tenantId: string,
  taskId: string
): Promise<ITask | null> => {
  const task = await Task.findOne({ _id: taskId, tenantId })
    .populate('assignee', 'username email')
    .populate('reporter', 'username email')
    .populate('projectId', 'name key')
    .populate('watchers', 'username email');

  if (!task) return null;

  const comments = await TaskComment.find({ taskId })
    .populate('userId', 'username email')
    .sort({ createdAt: -1 });

  (task as any).comments = comments;

  return task;
};

export const updateTask = async (
  tenantId: string,
  taskId: string,
  updates: Partial<ITask>,
  userId: string
): Promise<ITask | null> => {
  const oldTask = await Task.findOne({ _id: taskId, tenantId });
  
  if (!oldTask) return null;

  const task = await Task.findOneAndUpdate(
    { _id: taskId, tenantId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (task) {
    const changes: string[] = [];
    
    if (updates.status && oldTask.status !== updates.status) {
      changes.push(`status from "${oldTask.status}" to "${updates.status}"`);
      
      await TaskActivity.create({
        tenantId,
        taskId,
        projectId: task.projectId,
        userId,
        action: 'status_changed',
        field: 'status',
        oldValue: oldTask.status,
        newValue: updates.status,
        description: `Status changed from "${oldTask.status}" to "${updates.status}"`,
      });
    }

    if (updates.assignee && oldTask.assignee?.toString() !== updates.assignee.toString()) {
      changes.push('assignee');
      
      await TaskActivity.create({
        tenantId,
        taskId,
        projectId: task.projectId,
        userId,
        action: 'assigned',
        field: 'assignee',
        oldValue: oldTask.assignee,
        newValue: updates.assignee,
        description: `Task assigned to new user`,
      });

      const project = await Project.findById(task.projectId);
      if (project) {
        await addEmailToQueue({
          to: '',
          subject: `Task Assigned: ${project.key}-${task.taskNumber}`,
          html: `You have been assigned task: ${task.title}`,
          event: 'task.assigned' as any,
          tenantId,
          userId: updates.assignee.toString(),
          metadata: { taskId: task._id.toString() },
        });
      }
    }

    if (updates.priority && oldTask.priority !== updates.priority) {
      changes.push(`priority from "${oldTask.priority}" to "${updates.priority}"`);
    }

    if (changes.length > 0 && updates.status !== oldTask.status) {
      await TaskActivity.create({
        tenantId,
        taskId,
        projectId: task.projectId,
        userId,
        action: 'updated',
        description: `Task updated: ${changes.join(', ')}`,
        metadata: { changes: Object.keys(updates) },
      });
    }
  }

  return task;
};

export const moveTask = async (
  tenantId: string,
  taskId: string,
  newStatus: string,
  newOrder: number,
  userId: string
): Promise<ITask | null> => {
  const task = await Task.findOne({ _id: taskId, tenantId });
  
  if (!task) return null;

  const oldStatus = task.status;

  await Task.updateMany(
    {
      projectId: task.projectId,
      status: newStatus,
      order: { $gte: newOrder },
    },
    { $inc: { order: 1 } }
  );

  task.status = newStatus;
  task.order = newOrder;
  await task.save();

  if (oldStatus !== newStatus) {
    await TaskActivity.create({
      tenantId,
      taskId,
      projectId: task.projectId,
      userId,
      action: 'status_changed',
      field: 'status',
      oldValue: oldStatus,
      newValue: newStatus,
      description: `Task moved from "${oldStatus}" to "${newStatus}"`,
    });
  }

  return task;
};

export const deleteTask = async (
  tenantId: string,
  taskId: string,
  userId: string
): Promise<boolean> => {
  const task = await Task.findOne({ _id: taskId, tenantId });
  
  if (!task) return false;

  await Task.deleteOne({ _id: taskId, tenantId });
  await TaskComment.deleteMany({ taskId });

  await TaskActivity.create({
    tenantId,
    taskId,
    projectId: task.projectId,
    userId,
    action: 'deleted',
    description: `Task deleted: "${task.title}"`,
  });

  return true;
};

export const addComment = async (
  tenantId: string,
  taskId: string,
  userId: string,
  content: string,
  mentions?: string[]
): Promise<any> => {
  const comment = await TaskComment.create({
    tenantId,
    taskId: new Types.ObjectId(taskId),
    userId: new Types.ObjectId(userId),
    content,
    mentions: mentions ? mentions.map(m => new Types.ObjectId(m)) : [],
  });

  await TaskActivity.create({
    tenantId,
    taskId: new Types.ObjectId(taskId),
    projectId: (await Task.findById(taskId))!.projectId,
    userId,
    action: 'commented',
    description: 'Added a comment',
  });

  if (mentions && mentions.length > 0) {
    mentions.forEach(async mentionedUserId => {
      await addEmailToQueue({
        to: '',
        subject: 'You were mentioned in a task comment',
        html: `${content}`,
        event: 'task.mentioned' as any,
        tenantId,
        userId: mentionedUserId,
        metadata: { taskId, commentId: comment._id.toString() },
      });
    });
  }

  return comment.populate('userId', 'username email');
};

export const getTaskActivity = async (
  tenantId: string,
  taskId?: string,
  projectId?: string
): Promise<any[]> => {
  const query: any = { tenantId };

  if (taskId) query.taskId = taskId;
  if (projectId) query.projectId = projectId;

  return await TaskActivity.find(query)
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
};
