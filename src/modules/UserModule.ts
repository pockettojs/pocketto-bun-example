import { t } from "elysia";
import { App, ProtectedApp } from "..";
import { connectMasterDb } from "../utils/database";
import User from "../models/master/User";

export const Read = (app: ProtectedApp) => {
    return app.get(
        "/",
        async ({ userId }) => {
            await connectMasterDb();
            const user = await User.findOne({ _id: userId });
            if (!user) return null;
            return {
                message: "User retrieved successfully",
                data: user.toJSON(),
            };
        },
        {
            tags: ["User"],
            detail: {
                description: "Get a user",
                summary: "Get user",
            },
        }
    );
}


export const Create = (app: App) => {
    return app.post(
        "/",
        async ({ body }) => {
            await connectMasterDb();

            const user = new User();
            user.name = body.name;
            user.email = body.email;
            user.setPassword(body.password);
            await user.save();
            return {
                message: "User created successfully",
                data: user.toJSON(),
            };
        },
        {
            tags: ["User"],
            detail: {
                description: "Create a user",
                summary: "Create user",
            },
            body: t.Object({
                name: t.String(),
                email: t.String(),
                password: t.String(),
            }),
        },
    );
}

export const Update = (app: ProtectedApp) => {
    return app.put(
        "/",
        async ({ userId, body }) => {
            await connectMasterDb();
            const user = await User.findOne({ _id: userId });
            if (!user) return null;
            if (body.name) user.name = body.name;
            if (body.email) user.email = body.email;
            await user.save();
            return {
                message: "User updated successfully",
                data: user.toJSON(),
            };
        },
        {
            tags: ["User"],
            detail: {
                description: "Update a user",
                summary: "Update user",
            },
            body: t.Object({
                name: t.Optional(t.String()),
                email: t.Optional(t.String()),
            }),
        },
    );
}