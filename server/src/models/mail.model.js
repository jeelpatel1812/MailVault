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
    }
}, {timestamp: true})

export const Mail = mongoose.model("Mail", mailSchema);