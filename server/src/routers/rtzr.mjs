import express from "express";
import fetch from "node-fetch";

const router = express.Router();

let tokenCache = {
    token: null,
    expireAt: null,
};

router.get("/api/rtzr-token", async (req, res) => {
    try {
        const now = Date.now();

        if (tokenCache.token && tokenCache.expireAt && now < tokenCache.expireAt - 60000) {
            return res.json({
                token: tokenCache.token,
                expireAt: tokenCache.expireAt,
            });
        }

        const response = await fetch("https://openapi.vito.ai/v1/authenticate", {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.RTZR_CLIENT_ID,
                client_secret: process.env.RTZR_SECRET_KEY,
            }),
        });

        if (!response.ok) {
            throw new Error(`RTZR auth failed: ${response.status}`);
        }

        const data = await response.json();

        tokenCache.token = data.access_token;
        tokenCache.expireAt = now + data.expire_at * 1000;

        res.json({
            token: data.access_token,
            expireAt: tokenCache.expireAt,
        });
    } catch (error) {
        console.error("토큰에러 뜬거같은데. 디바이스 접근하는건 https 보안 접속 아니면 원래 안됨. localhost로 접속해.", error);
        res.status(500).json({ error: "Failed to get RTZR token" });
    }
});

export default router;
