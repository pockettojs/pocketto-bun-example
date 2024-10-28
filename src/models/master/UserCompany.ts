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
});

export default mongoose.model('UserCompany', UserCompanySchema, 'user_company');