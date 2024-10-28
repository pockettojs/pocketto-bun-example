import * as mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    website: {
        type: String,
    },
    logo: {
        type: String,
    },
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
        }
    },
});

export default mongoose.model('Company', CompanySchema, 'compapa');