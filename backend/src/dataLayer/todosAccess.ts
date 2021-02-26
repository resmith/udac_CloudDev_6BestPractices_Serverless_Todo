import * as AWS  from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import {createLogger} from '../utils/logger'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoDelete } from '../models/TodoDelete'

const XAWS = AWSXRay.captureAWS(AWS)
// var AWS = require("aws-sdk");
const logger = createLogger('todo-access')

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly TodosTable = process.env.TodoS_TABLE) {
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all Todos')

    const result = await this.docClient.query({
      TableName: this.TodosTable,
      KeyConditionExpression: "#todoId = :todoId",
      ExpressionAttributeNames:{
          "#yr": "todoId"
      },
      ExpressionAttributeValues: {
          ":yyyy": userId
      }  
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.TodosTable,
      Item: todoItem
    }).promise()        

    return todoItem
  }

  async updateTodo(todoItem: TodoUpdate): Promise<TodoUpdate> {
    await this.docClient.put({
      TableName: this.TodosTable,
      Item: todoItem
    }).promise()        

    return todoItem
  }

  async deleteTodo(todoItem: TodoDelete): Promise<TodoDelete> {
    
    await this.docClient.delete ({
      TableName: this.TodosTable,
      Key: { todoItem: todoItem.todoId              }
    }).promise()        

    return { todoId: todoItem.todoId, userId: todoItem.userId   }
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    XAWS.config.update({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    });
    console.log('Creating a local DynamoDB instance')
  }

  return new XAWS.DynamoDB.DocumentClient();
  // return new AWS.DynamoDB.DocumentClient()
}