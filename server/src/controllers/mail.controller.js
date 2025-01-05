import { Mail } from '../models/mail.model.js';
import { MailRecipients } from '../models/mail_recipients.model.js';
import { User } from '../models/users.model.js';
import ApiResponse from '../utils/apiResponse.js';
import AsyncHandler from '../utils/asyncHandler.js';
import { ScheduledMail } from '../models/scheduled_mail.model.js';
import cron from "node-cron";
import ApiError from '../utils/apiError.js';
import { v4 as uuidv4 } from 'uuid';

const mailComposer = AsyncHandler(async(req, res)=>{

    const user = req.user;
    if(!user) throw new ApiError(401, 'User not found.');
    const {content, subject, recipientsEmail, parentId} = req.body;
    let threadId = uuidv4();
    let parentsSubject = null;
    let parentsThread = null;

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

const scheduledMail = AsyncHandler(async(req, res)=>{

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

const getAllMails = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const pipeline = [
      [
        {
          $match:{
            recipientId: user?._id
          }
        },
        {
          $sort:{
            receivedAt: -1
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
              {
                $project:{
                      subject: 1,
                      content: 1,
                      createdAt: 1,
                      senderId:1,
                      senderDetail:1,
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
        {
            $match:
              {
                isTrashed: false
              }
        },
      ]
    ]
    const getAllMails = await MailRecipients.aggregate(pipeline);

    return res
        .send(new ApiResponse(201, {mails: getAllMails}, "Successfully"));
})

const toggleStarredMail = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const mailId = req.body.mailId;
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
    const mailId = req.body.mailId;
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
    const mailId = req.body.mailId;
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
    const mailId = req.body.mailId;
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

const getStarredMails = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const pipeline = [
        {
          $match:
            {
              recipientId: user?._id
            },
        },
        {
          $lookup:
            {
              from: "mails",
              localField: "mailId",
              foreignField: "_id",
              as: "mailDetail",
            },
        },
        {
          $lookup:
            {
              from: "users",
              localField: "mailDetail.senderId",
              foreignField: "_id",
              as: "senderDetail",
            },
        },
        {
          $project:
            {
              mailId: 1,
              senderMailId: {
                $arrayElemAt: [
                  "$senderDetail.email",
                  0,
                ],
              },
              subject: {
                $arrayElemAt: [
                  "$mailDetail.subject",
                  0,
                ],
              },
              content: {
                $arrayElemAt: [
                  "$mailDetail.content",
                  0,
                ],
              },
              receivedAt: 1,
              isUnread: 1,
              isTrashed:1,
              isStarred:1
            },
        },
        {
            $match:
              {
                isStarred: true
              }
        },
    ]
    const getAllStarredMails = await MailRecipients.aggregate(pipeline);

    return res
        .send(new ApiResponse(201, {mails: getAllStarredMails}, "Successfully"));
})


const getTrashedMails = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const pipeline = [
        {
          $match:
            {
              recipientId: user?._id
            },
        },
        {
          $lookup:
            {
              from: "mails",
              localField: "mailId",
              foreignField: "_id",
              as: "mailDetail",
            },
        },
        {
          $lookup:
            {
              from: "users",
              localField: "mailDetail.senderId",
              foreignField: "_id",
              as: "senderDetail",
            },
        },
        {
          $project:
            {
              mailId: 1,
              senderMailId: {
                $arrayElemAt: [
                  "$senderDetail.email",
                  0,
                ],
              },
              subject: {
                $arrayElemAt: [
                  "$mailDetail.subject",
                  0,
                ],
              },
              content: {
                $arrayElemAt: [
                  "$mailDetail.content",
                  0,
                ],
              },
              receivedAt: 1,
              isUnread: 1,
              isTrashed:1,
              isStarred:1
            },
        },
        {
            $match:
              {
                isTrashed: true
              }
        },
    ]
    const getAllTrashedMails = await MailRecipients.aggregate(pipeline);

    return res
        .send(new ApiResponse(201, {mails: getAllTrashedMails}, "Successfully"));
})

const getUnreadMails = AsyncHandler(async(req, res)=>{
    const user = req.user;
    const pipeline = [
        {
          $match:
            {
              recipientId: user?._id
            },
        },
        {
          $lookup:
            {
              from: "mails",
              localField: "mailId",
              foreignField: "_id",
              as: "mailDetail",
            },
        },
        {
          $lookup:
            {
              from: "users",
              localField: "mailDetail.senderId",
              foreignField: "_id",
              as: "senderDetail",
            },
        },
        {
          $project:
            {
              mailId: 1,
              senderMailId: {
                $arrayElemAt: [
                  "$senderDetail.email",
                  0,
                ],
              },
              subject: {
                $arrayElemAt: [
                  "$mailDetail.subject",
                  0,
                ],
              },
              content: {
                $arrayElemAt: [
                  "$mailDetail.content",
                  0,
                ],
              },
              receivedAt: 1,
              isUnread: 1,
              isTrashed:1,
              isStarred:1
            },
        },
        {
            $match:
              {
                isUnread: true
              }
        },
    ]
    const getAllUnreadMails = await MailRecipients.aggregate(pipeline);

    return res
        .send(new ApiResponse(201, {mails: getAllUnreadMails}, "Successfully"));
})

cron.schedule("*/30 * * * * *", AsyncHandler(async(req, res)=>{
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
export {mailComposer, getAllMails, toggleStarredMail, trashTheMail, unTrashTheMail, getStarredMails, getTrashedMails, readTheMail, getUnreadMails, scheduledMail, getSentMails};