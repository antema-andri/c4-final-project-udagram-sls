import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl, getAttachmentUrl, updateTodoUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const idUser = getUserId(event)
    const imageId = 'img'+todoId
    const url_sig_s3 = await createAttachmentPresignedUrl(imageId)

    if(url_sig_s3){
      // get s3 url image
      const url = getAttachmentUrl(imageId)
      console.log(url)
      // update url todo
      const result = await updateTodoUrl(idUser, todoId, url)
      console.log(result) 

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          "uploadUrl": url_sig_s3
        })
      }
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: "Creating presigned url failed"
    }
    
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
