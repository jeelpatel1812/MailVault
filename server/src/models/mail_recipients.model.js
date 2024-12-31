import mongoose, {Schema} from 'mongoose';

const mailRecipientsSchema = new Schema({
    mailId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'Mail' 
    },
    recipientId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    isUnread: Boolean,
    isTrashed: Boolean,
    isStarred: Boolean,
    receivedAt: Date
}, {timestamp: true})

export const MailRecipients = mongoose.model("MailRecipients", mailRecipientsSchema);