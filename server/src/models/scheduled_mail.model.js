import mongoose, {Schema} from 'mongoose';

const scheduledMailSchema = new Schema({
    subject: String,
    content: {
        type: String,
        required: true
    },
    senderId:{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    scheduledTime: {
        type: Date,
        required: true
    },
    recipientsEmail: {
        type: [String],
        required: true
    }
}, {timestamp: true})

export const ScheduledMail = mongoose.model("ScheduledMail", scheduledMailSchema);