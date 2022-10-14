import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoUpdate } from '../models/TodoUpdate'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import { createLogger } from '../utils/logger'

const todoAccess = new TodosAccess()
const attachmentUrl = new AttachmentUtils()

const logger = createLogger('Todos')

export async function getAllTodos(): Promise<TodoItem[]> {
  return todoAccess.getAllTodos()
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const params = {
    userId: userId,
    todoId: itemId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: "http://example.com/image.png"
  }

  try {
    return await todoAccess.createTodo(params)
  }catch(e){
    logger.error(`Creating todo ${itemId} failed`)
  }

  return null
}

export async function getTodosForUser(idUser: string): Promise<TodoItem[]> {
  let todos = null
  try{
    todos = await todoAccess.getTodosForUser(idUser)
  }catch(e){
    logger.error(`Failed to get todos for user ${idUser}`)
  }
  return todos
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoUpdate> {
  try {
    return await todoAccess.updateTodo(userId ,todoId, updateTodoRequest)
  }catch(e){
    logger.error(`Updating todo ${todoId} failed`)
  }

  return null
}

export async function updateTodoUrl(
  userId: string,
  todoId: string,
  url_s3: string
): Promise<boolean> {
  let isUpdated =  false

  try{
    await todoAccess.updateTodoUrl(userId ,todoId, url_s3)
    isUpdated = true
  }catch(e){
    logger.error(`Updating url for todo:${todoId} failed`, e)
  }

  return isUpdated
}

export async function deleteTodo(userId: string, todoId: string) {
  try {
    await todoAccess.deleteTodo(userId, todoId)
    const imageId = 'img'+todoId

    try {
      await attachmentUrl.removeImageTodoInBucket(imageId)
    }catch(err){
      logger.error(`Deleting image in bucket for todo:${todoId} failed`)
    }

  }catch(e){
    logger.error(`Deleting todo ${todoId} failed`, e)
  }
}

export async function createAttachmentPresignedUrl(imageId: string): Promise<string> {
  try {
    return await attachmentUrl.createAttachmentPresignedUrl(imageId)
  }catch(e){
    logger.error(`Creating attachment url failed for ${imageId}`)
  }

  return null
}

export function getAttachmentUrl(imageId: string): string {
  return attachmentUrl.getAttachmentUrl(imageId)
}