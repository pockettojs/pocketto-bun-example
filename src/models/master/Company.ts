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
});

export default mongoose.model('Company', CompanySchema, 'compapa');