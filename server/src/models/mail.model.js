import mongoose, {Schema} from 'mongoose';

const mailSchema = new Schema({
    subject: String,
    content: {
        type: String,
        required: true
    },
    senderId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    threadId:{
        type: String,
        required: true
    },
    parentId:{
        type: String
    },
    attachments:{
        type: [String]
    },
    createdAt: Date
}, {timestamp: true})

export const Mail = mongoose.model("Mail", mailSchema);