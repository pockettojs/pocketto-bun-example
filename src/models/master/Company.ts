import * as mongoose from 'mongoose';
import UserCompany from './UserCompany';

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
    statics: {
        checkCompanyAccess(companyId: string, userId: string, set) {
            return UserCompany.findOne({ companyId, userId }).then((userCompany) => {
                if (!userCompany) {
                    set.status = 403;
                    return {
                        message: "Unauthorized",
                    }
                }
            });
        }
    },
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (_, ret) => {
            ret.id = ret._id;
            delete ret._id;
        }
    },
});

export default mongoose.model('Company', CompanySchema, 'compapa');