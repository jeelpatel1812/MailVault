import { Mail } from '../models/mail.model.js';
import { MailRecipients } from '../models/mail_recipients.model.js';
import { User } from '../models/users.model.js';
import ApiResponse from '../utils/apiResponse.js';
import AsyncHandler from '../utils/asyncHandler.js';
import { ScheduledMail } from '../models/scheduled_mail.model.js';
import cron from "node-cron";
import ApiError from '../utils/apiError.js';
import { v4 as uuidv4 } from 'uuid';
import { generatePresignedUrl, uploadFileToS3 } from '../utils/awsS3.js';
import path from 'path';
import { AWS_BUCKET_NAME } from '../constants.js';
import { redisClient } from '../utils/redisClient.js';

const mailComposer = AsyncHandler(async(req, res)=>{

    const user = req.user;
    if(!user) throw new ApiError(401, 'User not found.');
    const {content, subject, parentId} = req.body;
    const recipientsEmail = JSON.parse(req.body.recipientsEmail);
    let threadId = uuidv4();
    let parentsSubject = null;
    let parentsThread = null;

    // upload files
    if(req.file){
      const fileName = path.join('uploads', req.file?.filename);
      const bucketName = `${AWS_BUCKET_NAME}/attachments` || 'amzn-s3-bucket-a1b2c3d4-mail-vault/attachments';
      const s3Key = path.basename(fileName); 
      console.log("check bucket name", bucketName, fileName, s3Key);
      try{
          const upload = uploadFileToS3(fileName, bucketName, s3Key);
          console.log("log upload", upload);
      }
      catch(err){
        throw new ApiError(500, 'File Upload Error at server.');
      }
    }

    //check for reply
    const parentMail = await Mail.find({_id: parentId});
    if(parentMail.length){
        parentsThread = parentMail[0]?.threadId;
    }
    const mail = await Mail.create({
        senderId: user?._id,
        subject: parentsSubject || subject,
        content: content,
        parentId: parentId || null,
        threadId: parentsThread || threadId,
        attachments: req.file ? [`attachments/${req.file?.filename}`] : [],
        createdAt: new Date()
    });

    const createdMail = await Mail.findById(mail._id);

    if(!createdMail) throw new ApiError(500, "Something went wrong.");
    const docs = recipientsEmail?.map(async(recipientEmail) => {
        const recipient = await User.find({email: recipientEmail}).select('-password -refreshToken')
        if(recipient == []) throw new ApiError(401, `${recipientEmail} Receiver not found.`);
        return {
            mailId: createdMail?._id,
            recipientId:  recipient[0]?._id,
            isUnread: true,
            isTrashed: false,
            isStarred: false,
            threadId: parentsThread || threadId,
            receivedAt: new Date()
        }
    });
    const recipientsDocs = await Promise.all(docs);
    const recipientsData = await MailRecipients.insertMany(recipientsDocs);

    if(!recipientsData) throw new ApiError(500, "Something went wrong.");
    return res.json(new ApiResponse(201, {mailData: createdMail, recipientsData: recipientsData}, "Mail has been composed succesfully."))
});

const scheduleMail = AsyncHandler(async(req, res)=>{

    const user = req.user;
    if(!user) throw new ApiError(401, 'User not found.');
    const {content, subject, recipientsEmail, scheduledTime} = req.body;

    const mail = await ScheduledMail.create({
        senderId: user?._id,
        subject: subject,
        content: content,
        scheduledTime: scheduledTime,
        recipientsEmail: recipientsEmail
    });

    const createdMail = await ScheduledMail.findById(mail._id);

    if(!createdMail) throw new ApiError(500, "Something went wrong.");
    return res.json(new ApiResponse(201, {mailData: createdMail}, "Mail has been scheduled succesfully."))
});

const fetchMailsByCategory = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const pipeline = [
      {
        $match:{
          recipientId: user?._id
        }
      },
      {
        $group:{
          _id: "$threadId",
          latestMail:  { $first: "$$ROOT"}
        }
      },
      {
        $replaceRoot: {
          newRoot: "$latestMail"
        }
      },
      {
        $project: {
          mailId: 0,
          recipientId: 0,
          receivedAt: 0
        }
      },
      {
        $lookup: {
          from: "mails",
          localField: "threadId",
          foreignField: "threadId",
          as: "mailDetails",
          pipeline:[
            {
              $sort:{
                createdAt: 1
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderEmail",
              },
            },
            {
              $project:{
                    subject: 1,
                    content: 1,
                    createdAt: 1,
                    senderId:1,
                    attachments: 1,
                    senderName: {
                      $arrayElemAt: [
                        "$senderEmail.name",
                        0,
                      ],
                    },
                    senderEmail: {
                      $arrayElemAt: [
                        "$senderEmail.email",
                        0,
                      ],
                    }
              }
            }
          ]
        }
      },
    ];
    
    //apply filters
    console.log("check filters", req.query)
    const filterTrashed = [
      {
        $match:
        {
          isTrashed: true
        }
      },
    ]
    if(req.query.isTrashed != undefined && req.query.isTrashed == 'true') pipeline.push(...filterTrashed);

    const filterUntrashed = [
      {
        $match:
        {
          isTrashed: false
        }
      },
    ]
    if(req.query.isTrashed != undefined && req.query.isTrashed == 'false') pipeline.push(...filterUntrashed)

    const filterStarred = [
      {
        $match:
        {
          isStarred: true
        }
      },
    ]
    if(req.query.isStarred != undefined && req.query.isStarred == 'true') pipeline.push(...filterStarred)

    const filterUnread = [
      {
        $match:
        {
          isUnread: true
        }
      },
    ]
    if(req.query.isUnread != undefined && req.query.isUnread == 'true') pipeline.push(...filterUnread)
      
    
    //sort and paginate mails
    const sortAndPaginate = [  
      {
        $sort:{
          receivedAt: -1
        }
      },
      { $skip: (page-1)* limit }, 
      { $limit: limit },
    ]
    pipeline.push(...sortAndPaginate); 

    let allCategoriedMails = await MailRecipients.aggregate(pipeline);
    const mailsWithPresignedUrl = allCategoriedMails || await updateInboxMailsWithPresignedLinks(allCategoriedMails);
    
    return res
        .send(new ApiResponse(201, {mails: mailsWithPresignedUrl}, "Successfully"));
})

const fetchMailsBySearch = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchable = req.query.searchable

    const pipeline = [
      {
        $match:{
          recipientId: user?._id
        }
      },
      {
        $group:{
          _id: "$threadId",
          latestMail:  { $first: "$$ROOT"}
        }
      },
      {
        $replaceRoot: {
          newRoot: "$latestMail"
        }
      },
      {
        $lookup: {
          from: "mails",
          localField: "threadId",
          foreignField: "threadId",
          as: "mailDetails",
          pipeline:[
            {
              $search: {
                index: "default",
                text: {
                  query: searchable,
                  path: {
                    wildcard: "*"
                  },
                  fuzzy: {}
                }
              }
            },
            {
              $sort:{
                createdAt: 1
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderEmail",
              },
            },
            {
              $project:{
                    subject: 1,
                    content: 1,
                    createdAt: 1,
                    senderId:1,
                    attachments: 1,
                    senderName: {
                      $arrayElemAt: [
                        "$senderEmail.name",
                        0,
                      ],
                    },
                    senderEmail: {
                      $arrayElemAt: [
                        "$senderEmail.email",
                        0,
                      ],
                    }
              }
            }
          ]
        }
      },
    ];
    
    //remove non-relevant data
    const nonRelevant = [
      {
        $match: {mailDetails: { $exists: true, $type: "array", $not: { $size: 0 } }}
      },
    ]
    pipeline.push(...nonRelevant);
    //apply filters
    console.log("check filters", searchable)
    const filterTrashed = [
      {
        $match:
        {
          isTrashed: true
        }
      },
    ]
    if(req.query.isTrashed != undefined && req.query.isTrashed == 'true') pipeline.push(...filterTrashed);

    const filterUntrashed = [
      {
        $match:
        {
          isTrashed: false
        }
      },
    ]
    if(req.query.isTrashed != undefined && req.query.isTrashed == 'false') pipeline.push(...filterUntrashed)

    const filterStarred = [
      {
        $match:
        {
          isStarred: true
        }
      },
    ]
    if(req.query.isStarred != undefined && req.query.isStarred == 'true') pipeline.push(...filterStarred)

    const filterUnread = [
      {
        $match:
        {
          isUnread: true
        }
      },
    ]
    if(req.query.isUnread != undefined && req.query.isUnread == 'true') pipeline.push(...filterUnread)
      
    
    //sort and paginate mails
    const sortAndPaginate = [  
      {
        $sort:{
          receivedAt: -1
        }
      },
      { $skip: (page-1)* limit }, 
      { $limit: limit },
    ]
    pipeline.push(...sortAndPaginate); 

    let allCategoriedMails = await MailRecipients.aggregate(pipeline);
    const mailsWithPresignedUrl = await updateInboxMailsWithPresignedLinks(allCategoriedMails);
    
    const cacheKey = `search:${searchable}`;
    redisClient.set(cacheKey, JSON.stringify(mailsWithPresignedUrl), "EX", 900);
    console.log(`Added new ${cacheKey} cache-key.`);
    return res
        .send(new ApiResponse(201, {mails: mailsWithPresignedUrl}, "Successfully"));
})

const getMailCountsByCategory = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const pipeline = [
      {
        $match:{
          recipientId: user?._id
        }
      },
      {
        $group:{
          _id: "$threadId",
          latestMail:  { $first: "$$ROOT"}
        }
      },
      {
        $replaceRoot: {
          newRoot: "$latestMail"
        }
      },
      {
        $lookup: {
          from: "mails",
          localField: "threadId",
          foreignField: "threadId",
          as: "mailDetails",
          pipeline:[
            {
              $sort:{
                createdAt: 1
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderEmail",
              },
            },
          ]
        }
      },
    ];
    

    //apply filters
    console.log("check filters", req.query)
    const filterTrashed = [
      {
        $match:
        {
          isTrashed: true
        }
      },
    ]
    if(req.query.isTrashed != undefined && req.query.isTrashed == 'true') pipeline.push(...filterTrashed);

    const filterUntrashed = [
      {
        $match:
        {
          isTrashed: false
        }
      },
    ]
    if(req.query.isTrashed != undefined && req.query.isTrashed == 'false') pipeline.push(...filterUntrashed)

    const filterStarred = [
      {
        $match:
        {
          isStarred: true
        }
      },
    ]
    if(req.query.isStarred != undefined && req.query.isStarred == 'true') pipeline.push(...filterStarred)

    const filterUnread = [
      {
        $match:
        {
          isUnread: true
        }
      },
    ]
    if(req.query.isUnread != undefined && req.query.isUnread == 'true') pipeline.push(...filterUnread)
    
    const filteredCount = [
      { $count: "filteredCount" }
    ]
    pipeline.push(...filteredCount);

    let allCategoriedMails = await MailRecipients.aggregate(pipeline);
    let result = await updateInboxMailsWithPresignedLinks(allCategoriedMails);
    if(result?.length == 0) result = [{"filteredCount": 0}]
    return res
        .send(new ApiResponse(201, result, "Successfully"));
})

// update mails
const updateInboxMailsWithPresignedLinks = async (getInboxMails) => {
  if (!getInboxMails) return;

  const updatedInboxMails = await Promise.all(
    getInboxMails.map(async (mailThread) => {
      const updatedMailDetails = await Promise.all(
        mailThread.mailDetails?.map(async (mail) => {
          const attachment = mail?.attachments?.[0];
          if (attachment) {
            try {
              const bucketName = `${AWS_BUCKET_NAME}/attachments`;
              const s3Key = path.basename(attachment);
              const generatedUrl = await generatePresignedUrl(bucketName, s3Key);
              return {
                ...mail,
                attachments: [generatedUrl, ...mail.attachments.slice(1)], // Replace only the first attachment
              };
            } catch (err) {
              console.error(`Error generating presigned URL for ${attachment}:`, err);
              return mail;
            }
          }
          return mail;
        }) || []
      );

      return {
        ...mailThread,
        mailDetails: updatedMailDetails,
      };
    })
  );

  return updatedInboxMails;
};


const toggleStarredMail = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const mailId = req.params.mailId;
    const selectedMail = await MailRecipients.findOne({
        $and:[
                {recipientId: user?._id},
                {mailId: mailId}
            ]
    });

    selectedMail.isStarred = !selectedMail.isStarred;
    await selectedMail.save();

    return res.
    json(new ApiResponse(204,{}, 'Updated successfully.' ))
})

const trashTheMail = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const {mailId} = req.params;
    const selectedMail = await MailRecipients.findOne({
        $and:[
                {recipientId: user?._id},
                {mailId: mailId}
            ]
    });

    selectedMail.isTrashed = true;
    await selectedMail.save();

    return res.
    json(new ApiResponse(204,{}, 'Updated trashed.' ))
})

const readTheMail = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const mailId = req.params.mailId;
    const selectedMail = await MailRecipients.findOne({
        $and:[
                {recipientId: user?._id},
                {mailId: mailId}
            ]
    });

    selectedMail.isUnread = false;
    await selectedMail.save();

    return res.
    json(new ApiResponse(204,{}, 'Updated read.' ))
})

const unTrashTheMail = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const mailId = req.params.mailId;
    const selectedMail = await MailRecipients.findOne({
        $and:[
                {recipientId: user?._id},
                {mailId: mailId}
            ]
    });

    selectedMail.isTrashed = false;
    await selectedMail.save();

    return res.
    json(new ApiResponse(204,{}, 'Updated untrashed.' ))
})

cron.schedule("*/59 * * * * *", AsyncHandler(async(req, res)=>{
    // get all executable mail
    const currentTime = new Date().toISOString();
    const mailsToBeExecuted = await ScheduledMail.find({scheduledTime: { $lt: currentTime }});

    if(mailsToBeExecuted.length==0) {
      console.log("No schedule mail to execute at this time.");
      return
    }
    const allRecipients = mailsToBeExecuted[0]?.recipientsEmail;
    const dbtime = '2025-01-02T11:55:50.000+00:00';
    console.log("check mails", mailsToBeExecuted, allRecipients, dbtime , currentTime);

    // iterate all executable mails one by one
    try{
      mailsToBeExecuted?.map(async(mail)=>{
        const mailData = await Mail.create({
            senderId: mail?.senderId,
            subject: mail?.subject,
            content: mail?.content,
        });
    
        const createdMail = await Mail.findById(mailData._id);
    
        if(!createdMail) throw new ApiError(500, "Something went wrong.");
        const docs = allRecipients?.map(async(recipientEmail) => {
            const recipient = await User.find({email: recipientEmail}).select('-password -refreshToken')
            console.log("check res", recipient);
            if(recipient == []) throw new ApiError(401, `${recipientEmail} Receiver not found.`);
            return {
                mailId: createdMail?._id,
                recipientId:  recipient[0]?._id,
                isUnread: true,
                receivedAt: new Date()
            }
        });
  
        // Insert documents
        const recipientsDocs = await Promise.all(docs || []);
        const recipientsData = await MailRecipients.insertMany(recipientsDocs);
    
        if(!recipientsData) throw new ApiError(500, "Something went wrong.");
  
        // Remove it from scheduledmails
        try {
          await ScheduledMail.findByIdAndDelete(mail?._id);
          console.log('Document deleted successfully.');
        } catch (err) {
          console.error('Error deleting document:', err);
        }
  
      })
      if(mailsToBeExecuted.length >0) console.log(` ${mailsToBeExecuted.length} Mail has been executed succesfully.`, mailsToBeExecuted)
    }
    catch(err){
      throw new Error('Operation failed!')
    }
    
}));


const getSentMails = AsyncHandler(async(req, res)=>{
    const user = req.user;

    if(!user) throw new ApiError(401, "User is not found.");
    const pipeline = [
      {
        $match:{
          senderId: user?._id
        }
      },
      {
        $lookup: {
          from: "mailrecipients",
          localField: "_id",
          foreignField: "mailId",
          as: "recipientsData",
          pipeline: [
             {
                $lookup: {
                  from: "users",
                  localField:"recipientId",
                  foreignField: "_id",
                  as: "UserDetail",
                }
              },
            {
              $project:{
                _id: 0,
                mailId:{ $arrayElemAt: [
                      "$UserDetail.email",
                      0,
                  ],
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          subject: 1,
          content:1,
          receivers: {
            $map: {
              input: "$recipientsData",
              as: "recipient",
              in: "$$recipient.mailId"
            }
          }
         
        }
      }
    ]
    const allSentMails = await Mail.aggregate(pipeline);
    return res.json(new ApiResponse(200, {sentMails: allSentMails}, "Successfull"))
})
export {mailComposer, fetchMailsByCategory, toggleStarredMail, trashTheMail, unTrashTheMail, readTheMail, scheduleMail, getSentMails, getMailCountsByCategory, fetchMailsBySearch};