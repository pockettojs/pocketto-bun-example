import * as mongoose from 'mongoose';

const UserCompanySchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    companyId: {
        type: String,
        required: true,
    },
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
        }
    },
});

export default mongoose.model('UserCompany', UserCompanySchema, 'user_company');