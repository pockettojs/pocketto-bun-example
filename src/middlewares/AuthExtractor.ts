import { App } from "..";

const AuthExtractor = (app: App) => {
    return app
        .use(async (app) => {
            return app.derive(async ({ jwt, bearer }) => {
                const payload = await jwt.verify(bearer) as {
                    userId: string;
                };

                return {
                    userId: payload.userId,
                };
            });
        });
};

export default AuthExtractor;