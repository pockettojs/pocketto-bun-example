import { t } from "elysia"
import { App } from "..";
import { connectMasterDb } from "../utils/database";
import User from "../models/master/User";

function Login(app: App) {
    return app.post(
        "/login",
        async ({ jwt, body, set }) => {
            await connectMasterDb();
            const user = await User.findOne({ email: body.email });
            if (!user) {
                set.status = 404;
                return { message: "User not found" };
            }
            if (!user.verifyPassword(body.password)) {
                set.status = 401;
                return { message: "Invalid password" };
            }
            const accessToken = await jwt.sign({ userId: user.id });
            return { message: "Logged in", accessToken };
        },
        {
            tags: ["Authentication"],
            detail: {
                description: "Login to the system",
                summary: "Login",
            },
            body: t.Object({
                email: t.String(),
                password: t.String(),
            }),
        },
    );
}

export default {
    Login,
};