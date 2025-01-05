import mongoose, {Schema} from 'mongoose';

const mailRecipientsSchema = new Schema({
    mailId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'Mail' 
    },
    recipientId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    isUnread: Boolean,
    isTrashed: Boolean,
    isStarred: Boolean,
    threadId:{
        type: String,
        required: true
    },
    receivedAt: Date
}, {timestamp: true})

export const MailRecipients = mongoose.model("MailRecipients", mailRecipientsSchema);