import { Mail } from '../models/mail.model.js';
import { MailRecipients } from '../models/mail_recipients.model.js';
import { User } from '../models/users.model.js';
import ApiResponse from '../utils/apiResponse.js';
import AsyncHandler from '../utils/asyncHandler.js';

const mailComposer = AsyncHandler(async(req, res)=>{

    const user = req.user;
    if(!user) throw new ApiError(401, 'User not found.');
    const {content, subject, recipientsEmail} = req.body;

    const mail = await Mail.create({
        senderId: user?._id,
        subject: subject,
        content: content,
    });

    const createdMail = await Mail.findById(mail._id);

    if(!createdMail) throw new ApiError(500, "Something went wrong.");
    const docs = recipientsEmail?.map(async(recipientEmail) => {
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
    const recipientsDocs = await Promise.all(docs);
    const recipientsData = await MailRecipients.insertMany(recipientsDocs);

    if(!recipientsData) throw new ApiError(500, "Something went wrong.");
    return res.json(new ApiResponse(201, {mailData: createdMail, recipientsData: recipientsData}, "Mail has been composed succesfully."))
});

const getAllMails = AsyncHandler(async(req, res)=>{
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
            },
        },
    ]
    const getAllMails = await MailRecipients.aggregate(pipeline);

    return res
        .send(new ApiResponse(201, {mails: getAllMails}, "Successfully"));
})

export {mailComposer, getAllMails};