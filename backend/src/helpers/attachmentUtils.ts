import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

AWS.config.update({
  secretAccessKey: process.env.SECRET_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
  region: 'us-east-1'
})

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic
export class AttachmentUtils {

    constructor(
      private bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private urlExpiration = process.env.SIGNED_URL_EXPIRATION,
      private s3 = new XAWS.S3({
        signatureVersion: 'v4'
      })
    ){}

    async createAttachmentPresignedUrl(imageId: string): Promise<string> {
      const signedUrl = await this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: imageId,
        Expires: parseInt(this.urlExpiration)
      })

      return signedUrl
    }

    getAttachmentUrl(imageId: string) :string {
      return `https://${this.bucketName}.s3.amazonaws.com/${imageId}`
    }

    async removeImageTodoInBucket(imageId: string) {
      await this.s3.deleteObject({
        Bucket: this.bucketName,
        Key: imageId
      }).promise()
    }
 }