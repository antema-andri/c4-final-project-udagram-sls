import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
// import { AttachmentUtils } from '../helpers/attachmentUtils'

const createdAtIndex = process.env.TODOS_CREATED_AT_INDEX

export class TodosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE) {
  }

  async getAllTodos(): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient.scan({
      TableName: this.todoTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getTodosForUser(idUser: string): Promise<TodoItem[]> {
    console.log('Getting todos for a user')
    console.log(idUser)

    const result = await this.docClient.query({
      TableName: this.todoTable,
      IndexName: createdAtIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
      ':userId': idUser,
      }
    }).promise()

    return result.Items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo
  }

  async updateTodo(userId: string, todoId: string, todo: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key: { 'todoId': todoId, 'userId': userId },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeValues: {
        ':name': todo.name,
        ':dueDate': todo.dueDate,
        ':done': todo.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      }
    }).promise()
    
    return todo
  }

  async updateTodoUrl(userId: string, todoId: string, url_s3: string) {
    let params = {
      TableName: this.todoTable,
      Key: { 'todoId': todoId, 'userId': userId },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': url_s3,
      }
    }

    await this.docClient.update(params).promise()
  }

  async deleteTodo(userId: string, todoId: string) {
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: { 'todoId': todoId, 'userId': userId }
    }).promise()
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
