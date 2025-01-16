import AWS  from 'aws-sdk';
import fs  from 'fs';

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY, 
    region: process.env.AWS_REGION  || 'us-west-1'                  
});

const s3 = new AWS.S3();

function uploadFileToS3(filePath, bucketName, s3Key) {
    const fileContent = fs.readFileSync(filePath);
  
    const params = {
      Bucket: bucketName,
      Key: s3Key,
      Body: fileContent
    };
  
    s3.upload(params, function (err, data) {
      if (err) {
        console.log('Error uploading file:', err);
      } else {
        console.log(`File uploaded successfully at ${data.Location}`);
      }
    });
}

// Get Object from S3
function getObjectFromS3(bucketName, s3Key) {
    const params = {
      Bucket: bucketName,
      Key: s3Key,
    };
  
    return new Promise((resolve, reject) => {
      s3.getObject(params, (err, data) => {
        if (err) {
          return reject(err);
        }
        resolve(data.Body);
      });
    });
}


// get presigned url
function generatePresignedUrl(bucketName, key) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Expires: 60 * 30, // URL valid for 5 minutes
  };

  try {
    const url = s3.getSignedUrl('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error.message);
    throw error;
  }
}


export {uploadFileToS3, getObjectFromS3, generatePresignedUrl}