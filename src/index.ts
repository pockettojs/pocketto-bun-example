import { Elysia } from "elysia";
import Swagger from "./middlewares/Swagger";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import * as UserModule from "./modules/UserModule";
import * as AuthModule from "./modules/AuthModule";
import AuthExtractor from "./middlewares/AuthExtractor";

const app = new Elysia()
    .use(Swagger)
    .use(jwt({
        name: "jwt",
        secret: Bun.env.JWT_SECRET!,
    }))
    .use(bearer());
export type App = typeof app;

const protectedApp = app
    .get("/", () => 'OK', {
        tags: ["Health"],
        detail: {
            description: "Heartbeat check",
            summary: "Heartbeat",
        },
    })
    .group("/users", (group) => group.use(UserModule.Create))
    .use(AuthModule.Login)
    .use(AuthExtractor);
export type ProtectedApp = typeof protectedApp;

app.guard({
    beforeHandle: async ({ jwt, bearer, set }) => {
        console.log('here?');
        try {
            if (!bearer) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
            const payload = await jwt.verify(bearer);
            if (!payload) {
                set.status = 401;
                return { message: "Unauthorized" };
            }
        } catch (error) {
            set.status = 401;
            return { message: "Unauthorized" };
        }
    },
}, (app) => {
    return app
        .group("/users", (group) => group
            .use(UserModule.Read)
            .use(UserModule.Update)
        )
        .group("/companies", (group) => group)
        .group("/databases", (group) => group)
})


// app;
app.listen(3000);
console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
