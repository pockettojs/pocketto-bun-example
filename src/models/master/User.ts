import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
    },
}, {
    methods: {
        setPassword: function (password: string) {
            this.password = bcrypt.hashSync(password, 10);
        },
        verifyPassword: function (password: string) {
            return bcrypt.compareSync(password, this.password);
        },
    },
});

export default mongoose.model('User', UserSchema);